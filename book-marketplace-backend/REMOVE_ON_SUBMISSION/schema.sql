/*duplicate queries sql from AI*/
-- Book Marketplace schema + sample data
-- Generated to match the ERD; run this once against a fresh MySQL 8+ database.

CREATE DATABASE IF NOT EXISTS book_marketplace CHARACTER SET utf8mb4;
USE book_marketplace;

CREATE TABLE `USER` (
  `user_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('Customer','Staff','Admin') NOT NULL DEFAULT 'Customer',
  `status` ENUM('Active','Suspended','Banned','Pending Verification') NOT NULL DEFAULT 'Pending Verification',
  `permission` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Sample data for USER
INSERT INTO `USER` (`user_id`, `username`, `email`, `password_hash`, `role`, `status`, `permission`, `created_at`) VALUES
  (1, 'alice_wong', 'alice.wong@example.com', '$2b$12$k9F3n0aXHqLp1v7ZsYQe2u', 'Admin', 'Active', '{"can_manage_categories":true,"can_manage_users":true}', '2024-01-05 09:12:00'),
  (2, 'marcus_lee', 'marcus.lee@example.com', '$2b$12$w4T8b2cRmXo9d5NqPzLk1a', 'Admin', 'Active', '{"can_manage_categories":true,"can_manage_users":true}', '2024-01-10 14:20:00'),
  (3, 'priya_singh', 'priya.singh@example.com', '$2b$12$e7Y1r6dSfVn3q8MjTxBc4z', 'Staff', 'Active', '{"can_review_reports":true}', '2024-02-01 08:00:00'),
  (4, 'daniel_kim', 'daniel.kim@example.com', '$2b$12$h2Q5s9eTgWo1p4NkRyDv7c', 'Staff', 'Active', '{"can_review_reports":true,"can_process_refunds":true}', '2024-02-15 11:45:00'),
  (5, 'emma_clarke', 'emma.clarke@example.com', '$2b$12$j8L3m7fUhXp2q6OkSzEw9d', 'Customer', 'Active', '{}', '2024-03-01 10:00:00'),
  (6, 'liam_brown', 'liam.brown@example.com', '$2b$12$b6K2n4gVjYq5r9PlTaFx3e', 'Customer', 'Active', '{}', '2024-03-05 16:30:00'),
  (7, 'sofia_garcia', 'sofia.garcia@example.com', '$2b$12$c1M9p3hWkZr6s2QmUbGy5f', 'Customer', 'Suspended', '{}', '2024-03-12 09:15:00'),
  (8, 'noah_martin', 'noah.martin@example.com', '$2b$12$d4N7q1iXlAs8t3RnVcHz6g', 'Customer', 'Active', '{}', '2024-03-20 13:00:00'),
  (9, 'ava_wilson', 'ava.wilson@example.com', '$2b$12$f9P2r5jYmBt1u4SoWdIa7h', 'Customer', 'Pending Verification', '{}', '2024-04-02 07:50:00'),
  (10, 'ethan_moore', 'ethan.moore@example.com', '$2b$12$g3Q6s8kZnCu5v7TpXeJb9i', 'Customer', 'Banned', '{}', '2024-04-10 18:22:00');
CREATE TABLE `BOOK_CATEGORIES` (
  `category_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
  `created_by_admin_id` INT UNSIGNED NOT NULL,
  `category_name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  CONSTRAINT `fk_book_categories_created_by_admin_id` FOREIGN KEY (`created_by_admin_id`) REFERENCES `USER`(`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Sample data for BOOK_CATEGORIES
INSERT INTO `BOOK_CATEGORIES` (`category_id`, `created_by_admin_id`, `category_name`, `description`) VALUES
  (1, 1, 'Fiction', 'Novels and fictional narratives'),
  (2, 2, 'Non-Fiction', 'Factual and informational books'),
  (3, 1, 'Science Fiction & Fantasy', 'Speculative and fantastical worlds'),
  (4, 2, 'Mystery & Thriller', 'Suspense, crime and thriller novels'),
  (5, 1, 'Romance', 'Romantic fiction across sub-genres'),
  (6, 2, 'Biography & Memoir', 'Life stories and personal accounts'),
  (7, 1, 'Children''s Books', 'Books for young readers'),
  (8, 2, 'Academic & Textbooks', 'Educational and course textbooks'),
  (9, 1, 'Self-Help', 'Personal development and wellness'),
  (10, 2, 'Comics & Graphic Novels', 'Illustrated storytelling collections');
CREATE TABLE `BOOKS_CATALOG` (
  `book_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `managed_by_admin_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(255) NOT NULL,
  `isbn` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`book_id`),
  CONSTRAINT `fk_books_catalog_category_id` FOREIGN KEY (`category_id`) REFERENCES `BOOK_CATEGORIES`(`category_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_books_catalog_managed_by_admin_id` FOREIGN KEY (`managed_by_admin_id`) REFERENCES `USER`(`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Sample data for BOOKS_CATALOG
INSERT INTO `BOOKS_CATALOG` (`book_id`, `category_id`, `managed_by_admin_id`, `title`, `author`, `isbn`) VALUES
  (1, 1, 1, 'The Silent Orchard', 'Marie Devon', '9780134190441'),
  (2, 2, 2, 'A Brief History of Everything', 'Daniel Cho', '9780262033849'),
  (3, 3, 1, 'Starlight Exiles', 'Renata Voss', '9780345391804'),
  (4, 4, 2, 'The Last Alibi', 'Connor Hayes', '9780307474279'),
  (5, 5, 1, 'Autumn in Verona', 'Isabel Marsh', '9780451524936'),
  (6, 6, 2, 'Becoming Whole', 'Grace Nakamura', '9780670785936'),
  (7, 7, 1, 'The Dragon Who Forgot to Roar', 'Lucy Pemberton', '9780062315008'),
  (8, 8, 2, 'Foundations of Algorithms', 'T. Cormen', '9780262033856'),
  (9, 9, 1, 'Atomic Habits Revisited', 'Owen Clarke', '9780593189337'),
  (10, 10, 2, 'Moonlit Rebellion, Vol. 1', 'Kenji Arata', '9781401290421');
CREATE TABLE `USER_BOOKS` (
  `inventory_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
  `book_id` INT UNSIGNED NOT NULL,
  `seller_id` INT UNSIGNED NOT NULL,
  `listing_type` ENUM('For_trade','For_sale','Both') NOT NULL,
  `price` DECIMAL(10,2) DEFAULT NULL,
  `condition` ENUM('New','Good','Acceptable') NOT NULL,
  `status` ENUM('Available','In_transaction','Sold','Traded','Removed') NOT NULL DEFAULT 'Available',
  `listed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`inventory_id`),
  CONSTRAINT `fk_user_books_book_id` FOREIGN KEY (`book_id`) REFERENCES `BOOKS_CATALOG`(`book_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_user_books_seller_id` FOREIGN KEY (`seller_id`) REFERENCES `USER`(`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Sample data for USER_BOOKS
INSERT INTO `USER_BOOKS` (`inventory_id`, `book_id`, `seller_id`, `listing_type`, `price`, `condition`, `status`, `listed_at`) VALUES
  (1, 1, 5, 'For_sale', 12.99, 'Good', 'Available', '2024-04-01 09:00:00'),
  (2, 2, 6, 'For_trade', NULL, 'Acceptable', 'Available', '2024-04-02 10:30:00'),
  (3, 3, 7, 'Both', 15.5, 'New', 'In_transaction', '2024-04-03 11:15:00'),
  (4, 4, 8, 'For_sale', 9.75, 'Good', 'Sold', '2024-04-04 14:00:00'),
  (5, 5, 9, 'For_trade', NULL, 'Good', 'Traded', '2024-04-05 08:45:00'),
  (6, 6, 10, 'For_sale', 18.0, 'New', 'Available', '2024-04-06 12:20:00'),
  (7, 7, 5, 'Both', 7.25, 'Acceptable', 'Available', '2024-04-07 15:40:00'),
  (8, 8, 6, 'For_sale', 45.0, 'Good', 'Available', '2024-04-08 09:50:00'),
  (9, 9, 7, 'For_trade', NULL, 'New', 'Removed', '2024-04-09 13:10:00'),
  (10, 10, 8, 'For_sale', 22.3, 'Good', 'In_transaction', '2024-04-10 16:05:00');
CREATE TABLE `TRANSACTIONS` (
  `transaction_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
  `buyer_id` INT UNSIGNED NOT NULL,
  `requested_inventory_id` INT UNSIGNED NOT NULL,
  `offered_inventory_id` INT UNSIGNED DEFAULT NULL,
  `managed_by_staff_id` INT UNSIGNED DEFAULT NULL,
  `transaction_type` ENUM('Purchase','Trade') NOT NULL,
  `amount_paid` DECIMAL(10,2) DEFAULT NULL,
  `status` ENUM('Pending','Accepted','Completed','Cancelled','Disputed') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  CONSTRAINT `fk_transactions_buyer_id` FOREIGN KEY (`buyer_id`) REFERENCES `USER`(`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_transactions_requested_inventory_id` FOREIGN KEY (`requested_inventory_id`) REFERENCES `USER_BOOKS`(`inventory_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_transactions_offered_inventory_id` FOREIGN KEY (`offered_inventory_id`) REFERENCES `USER_BOOKS`(`inventory_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_transactions_managed_by_staff_id` FOREIGN KEY (`managed_by_staff_id`) REFERENCES `USER`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Sample data for TRANSACTIONS
INSERT INTO `TRANSACTIONS` (`transaction_id`, `buyer_id`, `requested_inventory_id`, `offered_inventory_id`, `managed_by_staff_id`, `transaction_type`, `amount_paid`, `status`, `created_at`) VALUES
  (1, 9, 1, NULL, 3, 'Purchase', 12.99, 'Completed', '2024-04-11 10:00:00'),
  (2, 10, 2, 5, NULL, 'Trade', NULL, 'Completed', '2024-04-12 11:30:00'),
  (3, 6, 3, NULL, 4, 'Purchase', 15.5, 'Pending', '2024-04-13 09:20:00'),
  (4, 5, 4, NULL, 3, 'Purchase', 9.75, 'Completed', '2024-04-14 13:45:00'),
  (5, 8, 6, NULL, NULL, 'Purchase', 18.0, 'Accepted', '2024-04-15 15:10:00'),
  (6, 7, 7, 9, 4, 'Trade', NULL, 'Completed', '2024-04-16 08:35:00'),
  (7, 10, 8, NULL, 3, 'Purchase', 45.0, 'Disputed', '2024-04-17 14:25:00'),
  (8, 9, 10, NULL, NULL, 'Purchase', 22.3, 'Pending', '2024-04-18 09:55:00'),
  (9, 6, 1, NULL, 4, 'Purchase', 12.99, 'Cancelled', '2024-04-19 12:15:00'),
  (10, 5, 3, NULL, 3, 'Purchase', 15.5, 'Completed', '2024-04-20 17:00:00');
CREATE TABLE `REFUND_REQUEST` (
  `refund_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
  `transaction_id` INT UNSIGNED NOT NULL,
  `customer_id` INT UNSIGNED NOT NULL,
  `processed_by_staff_id` INT UNSIGNED DEFAULT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `requested_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`refund_id`),
  CONSTRAINT `fk_refund_request_transaction_id` FOREIGN KEY (`transaction_id`) REFERENCES `TRANSACTIONS`(`transaction_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_refund_request_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `USER`(`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_refund_request_processed_by_staff_id` FOREIGN KEY (`processed_by_staff_id`) REFERENCES `USER`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Sample data for REFUND_REQUEST
INSERT INTO `REFUND_REQUEST` (`refund_id`, `transaction_id`, `customer_id`, `processed_by_staff_id`, `reason`, `status`, `requested_at`) VALUES
  (1, 1, 9, 3, 'Book arrived with water damage', 'Approved', '2024-04-12 09:00:00'),
  (2, 4, 5, 4, 'Wrong edition shipped', 'Approved', '2024-04-15 10:15:00'),
  (3, 7, 10, 3, 'Item never received', 'Pending', '2024-04-18 11:30:00'),
  (4, 9, 6, NULL, 'Buyer changed their mind', 'Rejected', '2024-04-19 13:00:00'),
  (5, 10, 5, 4, 'Missing pages in book', 'Approved', '2024-04-21 08:45:00'),
  (6, 3, 6, NULL, 'Seller cancelled after payment', 'Pending', '2024-04-13 15:20:00'),
  (7, 5, 8, 3, 'Condition not as described', 'Rejected', '2024-04-16 09:10:00'),
  (8, 2, 10, 4, 'Trade item was counterfeit', 'Approved', '2024-04-13 14:00:00'),
  (9, 6, 7, NULL, 'Duplicate charge on card', 'Pending', '2024-04-17 10:40:00'),
  (10, 8, 9, 3, 'Book listing was misleading', 'Rejected', '2024-04-19 16:25:00');
CREATE TABLE `REPORTS` (
  `report_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
  `submitted_by_id` INT UNSIGNED NOT NULL,
  `reviewed_by_id` INT UNSIGNED DEFAULT NULL,
  `report_category` ENUM('Verification_Form','Seller_Application','User_Violation','Listing_Dispute','General_Feedback') NOT NULL,
  `related_entity_type` ENUM('User','Book_Listing','Transaction','None') NOT NULL DEFAULT 'None',
  `form_data` TEXT DEFAULT NULL,
  `status` ENUM('Pending','Under_Review','Approved','Rejected','Resolved','Dismissed') NOT NULL DEFAULT 'Pending',
  `resolution_notes` TEXT DEFAULT NULL,
  `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` TIMESTAMP DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  CONSTRAINT `fk_reports_submitted_by_id` FOREIGN KEY (`submitted_by_id`) REFERENCES `USER`(`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_reports_reviewed_by_id` FOREIGN KEY (`reviewed_by_id`) REFERENCES `USER`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Sample data for REPORTS
INSERT INTO `REPORTS` (`report_id`, `submitted_by_id`, `reviewed_by_id`, `report_category`, `related_entity_type`, `form_data`, `status`, `resolution_notes`, `submitted_at`, `resolved_at`) VALUES
  (1, 7, 3, 'User_Violation', 'User', '{"target_user_id":10,"details":"Abusive messages"}', 'Resolved', 'Warning issued to user', '2024-04-01 09:00:00', '2024-04-03 10:00:00'),
  (2, 9, 4, 'Listing_Dispute', 'Book_Listing', '{"inventory_id":8,"issue":"Price mismatch"}', 'Approved', 'Listing price corrected', '2024-04-02 11:20:00', '2024-04-04 09:30:00'),
  (3, 5, NULL, 'General_Feedback', 'None', '{"comment":"Great platform experience"}', 'Pending', NULL, '2024-04-03 14:00:00', NULL),
  (4, 10, 3, 'Seller_Application', 'None', '{"requested_role":"Staff"}', 'Rejected', 'Insufficient sales history', '2024-04-04 08:45:00', '2024-04-06 12:00:00'),
  (5, 6, 4, 'Verification_Form', 'User', '{"id_document":"uploaded"}', 'Approved', 'Identity verified', '2024-04-05 10:30:00', '2024-04-07 09:15:00'),
  (6, 8, NULL, 'User_Violation', 'Transaction', '{"transaction_id":7,"details":"Suspected fraud"}', 'Under_Review', NULL, '2024-04-06 13:10:00', NULL),
  (7, 7, 3, 'Listing_Dispute', 'Book_Listing', '{"inventory_id":3,"issue":"Item not as described"}', 'Resolved', 'Refund recommended', '2024-04-07 15:45:00', '2024-04-09 11:00:00'),
  (8, 9, 4, 'General_Feedback', 'None', '{"comment":"App crashes on checkout"}', 'Dismissed', 'Could not reproduce issue', '2024-04-08 09:20:00', '2024-04-10 14:30:00'),
  (9, 10, NULL, 'User_Violation', 'User', '{"target_user_id":7,"details":"Spam listings"}', 'Pending', NULL, '2024-04-09 12:00:00', NULL),
  (10, 5, 3, 'Seller_Application', 'None', '{"requested_role":"Staff"}', 'Approved', 'Approved after review', '2024-04-10 16:15:00', '2024-04-12 10:45:00');
CREATE TABLE `SYSTEM_RECORDS` (
  `record_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
  `admin_id` INT UNSIGNED NOT NULL,
  `record_type` ENUM('Audit_Log','Financial_Transaction_Record') NOT NULL,
  `details` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`record_id`),
  CONSTRAINT `fk_system_records_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `USER`(`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Sample data for SYSTEM_RECORDS
INSERT INTO `SYSTEM_RECORDS` (`record_id`, `admin_id`, `record_type`, `details`, `created_at`) VALUES
  (1, 1, 'Audit_Log', '{"action":"created_category","category_id":1}', '2024-01-05 09:15:00'),
  (2, 2, 'Audit_Log', '{"action":"created_category","category_id":2}', '2024-01-10 14:25:00'),
  (3, 1, 'Financial_Transaction_Record', '{"transaction_id":1,"amount":12.99}', '2024-04-11 10:05:00'),
  (4, 2, 'Financial_Transaction_Record', '{"transaction_id":4,"amount":9.75}', '2024-04-14 13:50:00'),
  (5, 1, 'Audit_Log', '{"action":"suspended_user","user_id":7}', '2024-03-13 08:00:00'),
  (6, 2, 'Audit_Log', '{"action":"banned_user","user_id":10}', '2024-04-11 09:30:00'),
  (7, 1, 'Financial_Transaction_Record', '{"transaction_id":7,"amount":45.00}', '2024-04-17 14:30:00'),
  (8, 2, 'Audit_Log', '{"action":"approved_refund","refund_id":1}', '2024-04-12 09:05:00'),
  (9, 1, 'Financial_Transaction_Record', '{"transaction_id":10,"amount":15.50}', '2024-04-20 17:05:00'),
  (10, 2, 'Audit_Log', '{"action":"rejected_report","report_id":4}', '2024-04-06 12:05:00');
