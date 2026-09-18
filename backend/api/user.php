<?php
/**
 * /api/user.php
 * GET (list/show), POST (create), PUT (update), DELETE
 */
require_once __DIR__ . '/../lib/bootstrap.php';

$crud = new Crud(
    pdo: $pdo,
    table: 'USER',
    primaryKey: 'user_id',
    insertable: ['username', 'email', 'password_hash', 'role', 'status', 'permission'],
    required: ['username', 'email', 'password_hash'],
    enums: [
        'role'   => ['Customer', 'Staff', 'Admin'],
        'status' => ['Active', 'Suspended', 'Banned', 'Pending Verification'],
    ],
);

dispatch_crud_request($crud, 'user_id');
