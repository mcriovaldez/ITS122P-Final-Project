# ITS122P - Final Project Document
> **Current Phase:** Phase 1 - Draft Proposal

## Project Title: Book Exchange Web Application

The **Book Exchange Web Application** is a web-based system that allows users to list books they no longer need, browse books offered by others, send and manage exchange requests, and track the status of exchange transactions from request to completion.

---

## 1. Problem Statement

Students, teachers, and anyone else who reads books often have many books they have already read and no longer need, but still want to get more books without buying brand-new copies. At present, most book exchanges occur informally through social media posts, group chats, bulletin boards, or word of mouth.

This informal approach leads to several recurring issues:

- There is no central location to check the availability of books for exchange.
- It is time-consuming and unreliable to find a person interested in a specific book or willing to trade a specific book.
- Exchange requests are easy to lose track of when handled through verbal agreements or chat messages.
- There is no consistent way of confirming when a transaction has been completed.
- There is no easy way for owners to show the condition of the books.

The **Book Exchange Web Application** aims to solve these problems by providing a single, organized platform where users can list, search, and filter books, as well as submit and track exchange requests. This centralization helps reduce confusion, save time, and create a more reliable and transparent book exchange process.

---

## 2. Target Users

### Customer / User
- Lists books they wish to sell or exchange.
- Browses books listed by other users.
- Initiates purchases or book exchanges.
- Manages personal transactions, refund requests, and reports.

### Staff
- Deals with the exchange and transaction process.
- Checks incoming requests.
- Accepts, rejects, or modifies transaction and request statuses.
- Logs completed exchanges.
- Reviews forms and reports submitted by customers.
- Helps moderate users who do not follow the application's rules.

### Administrators
- Manage the overall system.
- Handle user and staff accounts.
- Manage books, book categories, and records.
- Keep track of all transactions.
- Review reports.
- Maintain application data and permissions.

---

## 3. Proposed Features

1. Administrators can manage users.
2. Administrators can manage reports.
3. Administrators can manage books and book categories.
4. Administrators can manage records.
5. Staff users can manage Customer statuses and permissions.
6. Staff users can approve or reject Customer forms.
7. Staff users can manage Customer user statuses.
8. Staff users can manage Customer transactions.
9. Customers can list books for purchase.
10. Customers can buy listed books.
11. Customers can trade and exchange books with other users.
12. Customers can request a refund.
13. Customers can file a report.

---

## 4. User Roles

### Administration

The Administration role mainly handles the application's overall management and ensures that the system is operating correctly.

Administrators can:

- Provide Staff status to users who meet the required criteria.
- Remove Staff or Customer permissions when necessary.
- Remove users from the platform.
- Manage books listed in the application.
- Manage book categories.
- Review and manage reports.
- Access and manage system records.
- Monitor and manage exchange and purchase transactions.

### Staff

Staff users have less access than Administrators but are still able to operate and maintain selected system functions.

Staff users can:

- Act as moderators for Customer users.
- Manage Customer account statuses and permissions.
- Review forms submitted by Customers.
- Approve or reject submitted requests or forms.
- Manage Customer transaction statuses.
- Process or review refund requests.
- Report system problems or errors to Administration.

### Customer

Customer users are the standard users of the application.

Customers can:

- List books.
- Browse books listed by other users.
- Purchase listed books.
- Initiate book trading or exchange transactions.
- Manage their transactions.
- Cancel eligible transactions.
- Request refunds.
- File reports or forms.

---

## 5. System Architecture

The system will use a **Client-Server Architecture**.

### Basic Flow

**User → Web Browser → Web Server → Database**

The user accesses the system through a web browser. The web server processes the user's requests and communicates with the database to store, retrieve, and update information.

### Architecture Components

- **Client / Web Browser**
  - Displays the web application's interface.
  - Accepts input from the user.
  - Sends requests to the web server.

- **Web Server**
  - Processes requests sent by users.
  - Handles application logic.
  - Validates and processes data.
  - Communicates with the database.

- **Database**
  - Stores user accounts.
  - Stores books and book listings.
  - Stores transactions.
  - Stores reports and refund requests.
  - Stores system records.

---

## 6. Initial ERD

> **Insert ERD Picture Here**

The current ERD contains the following main tables:

- `USERS`
- `USER_BOOKS`
- `BOOK_CATALOG`
- `BOOK_CATEGORIES`
- `TRANSACTIONS`
- `REPORTS`
- `REFUND_REQUESTS`
- `SYSTEM_RECORDS`

### Role, Business Rules, and Table Mapping

| Role | Business Rules | Table & Field Mapping |
|---|---|---|
| Admin | Manage Users | `USERS (role, status)` |
| Admin | Manage Reports | `REPORTS (reviewed_by_id, status where report_category = 'User_Violation', etc.)` |
| Admin | Manage Books & Categories | `BOOK_CATALOG, BOOK_CATEGORIES` |
| Admin | Manage Records | `SYSTEM_RECORDS` |
| Staff | Manage Customer Statuses & Permissions | `USERS (status, permissions, managed_by_staff_id)` |
| Staff | Approve or Reject Customer Forms | `REPORTS (status, reviewed_by_id where report_category = 'Verification_Form' or 'Seller_Application')` |
| Staff | Manage Customer User Statuses | `USERS (status, managed_by_staff_id)` |
| Staff | Manage Customer Transactions | `TRANSACTIONS (status, managed_by_staff_id)` |
| Customer | List Books for Purchase | `USER_BOOKS (listing_type = 'For_Sale')` |
| Customer | Buy Listed Books | `TRANSACTIONS (transaction_type = 'Purchase')` |
| Customer | Trade / Exchange Books | `TRANSACTIONS (transaction_type = 'Trade')` |
| Customer | Request a Refund | `REFUND_REQUESTS` |
| Customer | File a Report / Form | `REPORTS (submitted_by_id, report_category, form_data)` |

---

## 7. Technology Stack

### Front-End

- **HTML**
  - Used to create the structure and content of the website.

- **CSS**
  - Used for the website's design, layout, and visual presentation.

- **JavaScript**
  - Used to create interactive features and client-side functionality.

### Back-End

- **PHP**
  - Used for server-side processing.
  - Handles requests from the client.
  - Processes forms and transactions.
  - Communicates with the database.

### Database

- **MySQL**
  - Used to store application data.
  - Stores users, books, listings, transactions, reports, refund requests, and system records.

### Communication and Data Exchange

- **AJAX**
  - Used for asynchronous communication between the application and the server.
  - Allows parts of a page to update without requiring the whole page to reload.

- **XML**
  - Used for structured data exchange between systems when needed.

- **HTTP**
  - Used for communication between the client and the web server.

---

## 8. Functional Requirements

### Administration

The system shall allow Administrators to:

1. View and manage registered users.
2. Assign Staff permissions to qualified users.
3. Remove Staff or Customer permissions when necessary.
4. Remove users from the platform.
5. Manage book records.
6. Manage book categories.
7. View and manage submitted reports.
8. View and manage system records.
9. Monitor purchase and exchange transactions.

### Staff

The system shall allow Staff users to:

1. View Customer account statuses.
2. Update Customer statuses and allowed permissions.
3. Review forms submitted by Customers.
4. Approve or reject Customer forms.
5. Manage Customer transaction statuses.
6. Review refund requests.
7. Moderate Customer activity when necessary.
8. Report application issues to Administrators.

### Customer

The system shall allow Customers to:

1. Access the application using a Customer account.
2. List books for sale.
3. Browse books listed by other users.
4. Purchase available books.
5. Offer or request a book trade.
6. Track the status of purchases and exchanges.
7. Cancel eligible transactions.
8. Submit refund requests.
9. File reports or forms.

---

## 9. Core System Modules

Based on the proposed features and ERD, the application will contain the following main modules:

### User Management
Handles Customer, Staff, and Administrator accounts, including roles, statuses, and permissions.

### Book Management
Handles the book catalog, book categories, and books listed by Customers.

### Transaction Management
Handles purchase and trade transactions between users and tracks their current status.

### Report Management
Handles reports and forms submitted by Customers and allows authorized Staff or Administrators to review them.

### Refund Management
Handles refund requests related to Customer transactions.

### System Records
Stores records of important activities performed within the application for administrative monitoring.

---

## 10. Basic Transaction Flow

### Book Purchase

1. A Customer lists a book for sale.
2. Another Customer browses and selects the listed book.
3. The Customer initiates a purchase transaction.
4. The transaction is recorded by the system.
5. Staff can monitor or manage the transaction status when necessary.
6. The transaction is marked as completed once the purchase process is finished.

### Book Exchange

1. A Customer lists a book available for exchange.
2. Another Customer finds the book and initiates an exchange request.
3. The exchange transaction is recorded by the system.
4. The participating users proceed with the exchange.
5. The transaction status is updated during the process.
6. The exchange is marked as completed once both sides have completed the transaction.

### Refund Request

1. A Customer selects an eligible transaction.
2. The Customer submits a refund request.
3. The request is saved in `REFUND_REQUESTS`.
4. Staff reviews the refund request.
5. The request is approved or rejected.
6. The request status is updated in the system.

### Report Submission

1. A Customer submits a report or form.
2. The report is stored in `REPORTS`.
3. Staff or Administration reviews the submitted report.
4. The report status is updated after review.

---

## 11. Project Scope

The initial version of the Book Exchange Web Application will focus on:

- User account and role management.
- Book listing and browsing.
- Book purchases.
- Book trading and exchange transactions.
- Transaction status tracking.
- Customer reports and forms.
- Refund requests.
- Book category management.
- Administrative and Staff moderation.
- System record management.

The project will be implemented as a web application using the proposed Client-Server Architecture and Technology Stack.

---

## 12. Project Objective

The main objective of the **Book Exchange Web Application** is to provide a centralized and organized platform where users can conveniently list, purchase, trade, and exchange books while allowing Staff and Administrators to monitor transactions and maintain the system.

The system aims to:

- Make available books easier to discover.
- Organize purchase and exchange requests.
- Allow users to track transaction statuses.
- Provide a structured process for refunds and reports.
- Allow book owners to maintain organized listings.
- Give Staff and Administrators tools to manage users and transactions.
- Reduce the problems caused by informal book exchange methods such as social media posts, group chats, and verbal agreements.

---

## 13. Expected Outcome

At the end of the project, the group expects to produce a functional web-based Book Exchange Application that allows Customers to list, purchase, and exchange books while providing Staff and Administrators with tools for managing users, requests, transactions, reports, refunds, books, and system records.

The completed application should provide a more organized and transparent alternative to informal book exchange methods.

---

## 14. Current Project Status

**Phase 1 - Draft Proposal**

Current completed planning components:

- [x] Project Title
- [x] Problem Statement
- [x] Target Users
- [x] Proposed Features
- [x] User Roles
- [x] System Architecture
- [x] Initial ERD
- [x] Role and Business Rule Mapping
- [x] Technology Stack
- [x] Initial Functional Requirements
- [x] Initial Project Scope and Objectives

Future sections and requirements may still be revised as the system design and development phases progress.
