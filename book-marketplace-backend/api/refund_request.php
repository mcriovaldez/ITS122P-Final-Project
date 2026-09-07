<?php
/**
 * /api/refund_request.php
 * GET (list/show), POST (create), PUT (update), DELETE
 */
require_once __DIR__ . '/../lib/bootstrap.php';

$crud = new Crud(
    pdo: $pdo,
    table: 'REFUND_REQUEST',
    primaryKey: 'refund_id',
    insertable: ['transaction_id', 'customer_id', 'processed_by_staff_id', 'reason', 'status'],
    required: ['transaction_id', 'customer_id', 'reason'],
    enums: [
        'status' => ['Pending', 'Approved', 'Rejected'],
    ],
);

dispatch_crud_request($crud, 'refund_id');
