<?php
/**
 * Generic CRUD helper used by every endpoint in /api.
 *
 * Each endpoint file configures this class with its table name, primary
 * key column, and the columns clients are allowed to write to. All SQL
 * uses prepared statements — no user input is ever concatenated into a
 * query string.
 */
class Crud
{
    private PDO $pdo;
    private string $table;
    private string $primaryKey;
    /** @var string[] columns allowed on INSERT */
    private array $insertable;
    /** @var string[] columns allowed on UPDATE (defaults to $insertable) */
    private array $updatable;
    /** @var array<string,string[]> column => allowed ENUM values, for basic validation */
    private array $enums;
    /** @var string[] columns that must be present (and non-null) on create */
    private array $required;

    public function __construct(
        PDO $pdo,
        string $table,
        string $primaryKey,
        array $insertable,
        array $required = [],
        array $enums = [],
        ?array $updatable = null
    ) {
        $this->pdo = $pdo;
        $this->table = $table;
        $this->primaryKey = $primaryKey;
        $this->insertable = $insertable;
        $this->updatable = $updatable ?? $insertable;
        $this->enums = $enums;
        $this->required = $required;
    }

    /**
     * GET /api/<resource>
     * Optional query-string filters on any insertable column, e.g.
     * ?status=Active&role=Admin. Supports ?limit=&offset= for paging.
     */
    public function index(array $queryParams): array
    {
        $where = [];
        $bindings = [];

        foreach ($this->insertable as $col) {
            if (isset($queryParams[$col]) && $queryParams[$col] !== '') {
                $where[] = "`{$col}` = :{$col}";
                $bindings[$col] = $queryParams[$col];
            }
        }

        $sql = "SELECT * FROM `{$this->table}`";
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= " ORDER BY `{$this->primaryKey}` ASC";

        $limit = isset($queryParams['limit']) ? max(1, (int) $queryParams['limit']) : 50;
        $offset = isset($queryParams['offset']) ? max(0, (int) $queryParams['offset']) : 0;
        $sql .= " LIMIT {$limit} OFFSET {$offset}";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($bindings);

        return $stmt->fetchAll();
    }

    /** GET /api/<resource>?id=5 */
    public function show($id): ?array
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM `{$this->table}` WHERE `{$this->primaryKey}` = :id LIMIT 1"
        );
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        return $row ?: null;
    }

    /**
     * POST /api/<resource>
     * $data is the decoded JSON body. Returns the newly created row.
     *
     * @throws InvalidArgumentException on validation failure
     */
    public function create(array $data): array
    {
        $this->validate($data, isCreate: true);

        $columns = array_values(array_intersect($this->insertable, array_keys($data)));
        if (!$columns) {
            throw new InvalidArgumentException('No valid fields provided.');
        }

        $placeholders = array_map(fn($c) => ":{$c}", $columns);
        $sql = sprintf(
            'INSERT INTO `%s` (%s) VALUES (%s)',
            $this->table,
            implode(', ', array_map(fn($c) => "`{$c}`", $columns)),
            implode(', ', $placeholders)
        );

        $stmt = $this->pdo->prepare($sql);
        foreach ($columns as $c) {
            $stmt->bindValue(":{$c}", $this->normalize($data[$c]));
        }
        $stmt->execute();

        $newId = $this->pdo->lastInsertId();
        return $this->show($newId) ?? ['message' => 'Created', $this->primaryKey => $newId];
    }

    /**
     * PUT/PATCH /api/<resource>?id=5
     * Only columns present in $data are updated.
     *
     * @throws InvalidArgumentException on validation failure
     */
    public function update($id, array $data): ?array
    {
        if (!$this->show($id)) {
            return null;
        }

        $this->validate($data, isCreate: false);

        $columns = array_values(array_intersect($this->updatable, array_keys($data)));
        if (!$columns) {
            throw new InvalidArgumentException('No valid fields provided to update.');
        }

        $setClause = implode(', ', array_map(fn($c) => "`{$c}` = :{$c}", $columns));
        $sql = "UPDATE `{$this->table}` SET {$setClause} WHERE `{$this->primaryKey}` = :id";

        $stmt = $this->pdo->prepare($sql);
        foreach ($columns as $c) {
            $stmt->bindValue(":{$c}", $this->normalize($data[$c]));
        }
        $stmt->bindValue(':id', $id);
        $stmt->execute();

        return $this->show($id);
    }

    /** DELETE /api/<resource>?id=5 */
    public function delete($id): bool
    {
        if (!$this->show($id)) {
            return false;
        }
        $stmt = $this->pdo->prepare(
            "DELETE FROM `{$this->table}` WHERE `{$this->primaryKey}` = :id"
        );
        $stmt->execute(['id' => $id]);
        return true;
    }

    /**
     * Basic validation: required fields present on create, enum values
     * restricted to the allowed set. Throws InvalidArgumentException with
     * a human-readable message on failure.
     */
    private function validate(array $data, bool $isCreate): void
    {
        if ($isCreate) {
            foreach ($this->required as $col) {
                if (!array_key_exists($col, $data) || $data[$col] === null || $data[$col] === '') {
                    throw new InvalidArgumentException("Field `{$col}` is required.");
                }
            }
        }

        foreach ($this->enums as $col => $allowed) {
            if (array_key_exists($col, $data) && $data[$col] !== null && !in_array($data[$col], $allowed, true)) {
                $allowedList = implode(', ', $allowed);
                throw new InvalidArgumentException("Field `{$col}` must be one of: {$allowedList}.");
            }
        }
    }

    /** Arrays/objects (e.g. JSON columns) are stored as JSON strings. */
    private function normalize($value)
    {
        if (is_array($value)) {
            return json_encode($value);
        }
        return $value;
    }
}
