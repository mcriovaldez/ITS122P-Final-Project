<?php
/**
 * /api/book_categories.php
 * GET (list/show), POST (create), PUT (update), DELETE
 */
require_once __DIR__ . '/../lib/bootstrap.php';

$crud = new Crud(
    pdo: $pdo,
    table: 'BOOK_CATEGORIES',
    primaryKey: 'category_id',
    insertable: ['created_by_admin_id', 'category_name', 'description'],
    required: ['created_by_admin_id', 'category_name'],
);

dispatch_crud_request($crud, 'category_id');
