<?php
/**
 * /api/reports.php
 * GET (list/show), POST (create), PUT (update), DELETE
 */
require_once __DIR__ . '/../lib/bootstrap.php';

$crud = new Crud(
    pdo: $pdo,
    table: 'REPORTS',
    primaryKey: 'report_id',
    insertable: [
        'submitted_by_id', 'reviewed_by_id', 'report_category', 'related_entity_type',
        'form_data', 'status', 'resolution_notes', 'resolved_at',
    ],
    required: ['submitted_by_id', 'report_category', 'related_entity_type'],
    enums: [
        'report_category' => [
            'Verification_Form', 'Seller_Application', 'User_Violation',
            'Listing_Dispute', 'General_Feedback',
        ],
        'related_entity_type' => ['User', 'Book_Listing', 'Transaction', 'None'],
        'status' => ['Pending', 'Under_Review', 'Approved', 'Rejected', 'Resolved', 'Dismissed'],
    ],
);

dispatch_crud_request($crud, 'report_id');
