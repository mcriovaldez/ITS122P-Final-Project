<?php
/**
 * /api/books_catalog.php
 * GET (list/show), POST (create), PUT (update), DELETE
 */
require_once __DIR__ . '/../lib/bootstrap.php';

$crud = new Crud(
    pdo: $pdo,
    table: 'BOOKS_CATALOG',
    primaryKey: 'book_id',
    insertable: ['category_id', 'managed_by_admin_id', 'title', 'author', 'isbn'],
    required: ['category_id', 'managed_by_admin_id', 'title', 'author', 'isbn'],
);

dispatch_crud_request($crud, 'book_id');
