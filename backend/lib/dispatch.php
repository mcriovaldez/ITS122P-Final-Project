<?php
/**
 * Routes a single incoming HTTP request to the right Crud method and
 * writes the JSON response. Every file in /api calls this once it has
 * built its Crud instance.
 *
 *   GET    /api/user.php            -> list (supports filters, limit, offset)
 *   GET    /api/user.php?id=5       -> show one row
 *   POST   /api/user.php            -> create (JSON body)
 *   PUT    /api/user.php?id=5       -> update (JSON body, partial)
 *   DELETE /api/user.php?id=5       -> delete
 */
function dispatch_crud_request(Crud $crud, string $primaryKeyName): void
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    $id = $_GET['id'] ?? null;

    try {
        switch ($method) {
            case 'GET':
                if ($id !== null) {
                    $row = $crud->show($id);
                    if (!$row) {
                        Response::error("Record with {$primaryKeyName} = {$id} not found.", 404);
                    }
                    Response::json($row);
                } else {
                    Response::json($crud->index($_GET));
                }
                break;

            case 'POST':
                $body = read_json_body();
                $created = $crud->create($body);
                Response::json($created, 201);
                break;

            case 'PUT':
            case 'PATCH':
                if ($id === null) {
                    Response::error("Query parameter '{$primaryKeyName}' (as ?id=) is required for updates.", 400);
                }
                $body = read_json_body();
                $updated = $crud->update($id, $body);
                if ($updated === null) {
                    Response::error("Record with {$primaryKeyName} = {$id} not found.", 404);
                }
                Response::json($updated);
                break;

            case 'DELETE':
                if ($id === null) {
                    Response::error("Query parameter '{$primaryKeyName}' (as ?id=) is required for deletes.", 400);
                }
                $ok = $crud->delete($id);
                if (!$ok) {
                    Response::error("Record with {$primaryKeyName} = {$id} not found.", 404);
                }
                Response::json(['message' => 'Deleted', $primaryKeyName => $id]);
                break;

            default:
                Response::error('Method not allowed.', 405);
        }
    } catch (InvalidArgumentException $e) {
        Response::error($e->getMessage(), 422);
    } catch (PDOException $e) {
        // 1062 = duplicate key, 1451/1452 = FK constraint violations
        $code = (int) $e->errorInfo[1] ?? 0;
        if ($code === 1062) {
            Response::error('A record with these unique values already exists.', 409, ['details' => $e->getMessage()]);
        } elseif (in_array($code, [1451, 1452], true)) {
            Response::error('This operation violates a foreign key relationship.', 409, ['details' => $e->getMessage()]);
        } else {
            Response::error('Database error.', 500, ['details' => $e->getMessage()]);
        }
    }
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) {
        return [];
    }
    $decoded = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        Response::error('Request body must be valid JSON.', 400);
    }
    return $decoded ?? [];
}
