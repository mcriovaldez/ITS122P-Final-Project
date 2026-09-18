## REMOVE README ON SUBMISSION 
## INCLUDING THE FOLDER 

# Book Marketplace — PHP + MySQL Backend

A plain PHP (8.0+) REST API over the 8-table ERD, using PDO with prepared
statements. No framework required — just PHP's built-in server or any
Apache/Nginx + PHP-FPM setup.

## Structure

```
backend/
├── config/
│   └── database.php      # PDO connection (reads env vars)
├── lib/
│   ├── bootstrap.php     # included by every endpoint
│   ├── Crud.php          # generic CRUD engine (validation + SQL)
│   ├── Response.php      # JSON response helper
│   └── dispatch.php      # routes GET/POST/PUT/DELETE to Crud
├── api/
│   ├── user.php
│   ├── book_categories.php
│   ├── books_catalog.php
│   ├── user_books.php
│   ├── transactions.php
│   ├── refund_request.php
│   ├── reports.php
│   └── system_records.php
├── sql/
│   └── schema.sql        # CREATE TABLE + sample INSERT statements
├── index.php             # health check / route directory
├── .env.example
└── README.md
```

## 1. Set up the database

```bash
mysql -u root -p < sql/schema.sql
```

This creates the `book_marketplace` database, all 8 tables with foreign
keys, and loads 10 sample rows into each.

## 2. Configure credentials

```bash
cp .env.example .env
# edit .env with your real DB_HOST / DB_USER / DB_PASS
```

`config/database.php` reads `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`,
`DB_PASS` from the environment (falling back to sensible local defaults).
How you load `.env` depends on your setup:

- **Built-in PHP server / Apache with mod_env**: export the variables in
  your shell or `apache2/httpd` config before starting.
- **Using a `.env` loader** (optional): `composer require vlucas/phpdotenv`
  and add `Dotenv\Dotenv::createImmutable(__DIR__)->load();` to the top of
  `config/database.php`.

## 3. Run it

```bash
php -S localhost:8000
```

Then visit `http://localhost:8000/index.php` — it should report
`"database": "connected"` and list every endpoint.

## Using the API

Every endpoint in `/api` supports the same pattern:

| Method | URL                                    | Action                          |
|--------|-----------------------------------------|----------------------------------|
| GET    | `/api/user.php`                         | List rows (supports filters, `limit`, `offset`) |
| GET    | `/api/user.php?id=5`                    | Get one row                     |
| POST   | `/api/user.php`                         | Create a row (JSON body)        |
| PUT    | `/api/user.php?id=5`                    | Update a row (JSON body, partial) |
| DELETE | `/api/user.php?id=5`                    | Delete a row                    |

### Examples

```bash
# List all users
curl http://localhost:8000/api/user.php

# Filter + paginate
curl "http://localhost:8000/api/user.php?role=Admin&limit=5"

# Get one book
curl http://localhost:8000/api/books_catalog.php?id=3

# Create a new book category
curl -X POST http://localhost:8000/api/book_categories.php \
  -H "Content-Type: application/json" \
  -d '{"created_by_admin_id": 1, "category_name": "Poetry", "description": "Poems and verse"}'

# Update a listing's price
curl -X PUT "http://localhost:8000/api/user_books.php?id=1" \
  -H "Content-Type: application/json" \
  -d '{"price": 14.99}'

# Delete a refund request
curl -X DELETE "http://localhost:8000/api/refund_request.php?id=6"
```

Every response is JSON. Validation errors return `422`, not-found returns
`404`, unique/foreign-key violations return `409`, and unexpected DB
errors return `500` with a `details` field.

## Notes & next steps

- **Enums are validated in PHP** (`Crud`'s `$enums` config) so you get a
  readable `422` instead of a raw MySQL error when an invalid value is
  sent.
- **JSON columns** (`permission`, `details`, `form_data`) accept either a
  JSON object in the request body (it's encoded automatically) or a raw
  JSON string.
- **No authentication is included.** Before deploying this publicly, add
  an auth layer (e.g. check a bearer token / session in `dispatch.php`
  before routing) and lock down which fields each role can write.
- **CORS is wide open** (`Access-Control-Allow-Origin: *`) for local
  development — restrict this to your actual frontend origin in
  production (`lib/dispatch.php`).
- To add a 9th table later, copy any file in `/api`, adjust the table
  name / primary key / columns, and it inherits all CRUD + validation
  logic from `Crud.php` automatically.
