// Module 12 — Optimization & Best Practices (Medical Spa context)
const MODULE_12 = {
    moduleId: 12,
    title: 'Optimization & Best Practices',
    level: 'expert',
    description: 'Understand query execution plans, indexes, transactions, and SQL best practices.',
    lessons: [
        {
            lessonId: 1,
            title: 'EXPLAIN & Query Plans',
            type: 'reading',
            content: `## Understanding Query Execution

\`EXPLAIN QUERY PLAN\` shows how SQLite will execute your query:

\`\`\`sql
EXPLAIN QUERY PLAN
SELECT * FROM appointments
WHERE client_id = 5;
\`\`\`

### Reading the Output

| Term | Meaning |
|------|---------|
| \`SCAN TABLE\` | Full table scan (reads every row) |
| \`SEARCH TABLE ... USING INDEX\` | Uses an index (fast!) |
| \`USING COVERING INDEX\` | Index has all needed columns |
| \`USING TEMPORARY B-TREE\` | Temp structure for ORDER BY/GROUP BY |

### When to Worry

- \`SCAN TABLE\` on large tables = slow
- Multiple \`SCAN TABLE\` in JOINs = very slow
- \`USING TEMPORARY B-TREE\` for ORDER BY = could use an index instead`,
            exampleQueries: [
                { label: 'Plan: simple scan', sql: 'EXPLAIN QUERY PLAN\nSELECT * FROM appointments WHERE client_id = 5;' },
                { label: 'Plan: JOIN query', sql: "EXPLAIN QUERY PLAN\nSELECT c.first_name, t.treatment_name, a.appointment_date\nFROM appointments a\nJOIN clients c ON a.client_id = c.client_id\nJOIN treatments t ON a.treatment_id = t.treatment_id\nWHERE a.status = 'completed';" },
                { label: 'Plan: GROUP BY query', sql: "EXPLAIN QUERY PLAN\nSELECT category, COUNT(*), AVG(price)\nFROM treatments\nGROUP BY category;" }
            ]
        },
        {
            lessonId: 2,
            title: 'Indexes',
            type: 'reading',
            content: `## Creating Indexes

An index is like a book's index — it lets the database find rows without scanning every page:

\`\`\`sql
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
\`\`\`

### When to Index

| Good Candidates | Bad Candidates |
|----------------|----------------|
| WHERE clause columns | Tables with < 100 rows |
| JOIN columns (FK) | Columns you rarely query |
| ORDER BY columns | Columns with few unique values |
| Frequently queried columns | Columns that change constantly |

### Composite Indexes

Index multiple columns together:

\`\`\`sql
CREATE INDEX idx_appt_status_date
ON appointments(status, appointment_date);
\`\`\`

Column order matters! Put the most selective column first.

### Viewing Indexes

\`\`\`sql
SELECT name, tbl_name FROM sqlite_master
WHERE type = 'index' ORDER BY tbl_name;
\`\`\`

### Trade-Offs

Indexes speed up reads but slow down writes (INSERT/UPDATE/DELETE) because the index must also be updated.`,
            exampleQueries: [
                { label: 'Create index + check plan', sql: "EXPLAIN QUERY PLAN SELECT * FROM appointments WHERE appointment_date > '2025-01-01';\n\nCREATE INDEX idx_appt_date ON appointments(appointment_date);\n\nEXPLAIN QUERY PLAN SELECT * FROM appointments WHERE appointment_date > '2025-01-01';" },
                { label: 'Composite index', sql: "CREATE INDEX idx_appt_status_date ON appointments(status, appointment_date);\nEXPLAIN QUERY PLAN\nSELECT * FROM appointments\nWHERE status = 'completed' AND appointment_date > '2025-01-01';" },
                { label: 'List all indexes', sql: "SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' ORDER BY tbl_name;" }
            ]
        },
        {
            lessonId: 3,
            title: 'Transactions',
            type: 'reading',
            content: `## Transactions — All or Nothing

A transaction groups multiple statements so they either **all succeed** or **all fail**:

\`\`\`sql
BEGIN TRANSACTION;
UPDATE invoices SET amount = amount - 50 WHERE invoice_id = 1;
UPDATE invoices SET discount = discount + 50 WHERE invoice_id = 1;
COMMIT;
\`\`\`

### Key Commands

| Command | Purpose |
|---------|---------|
| \`BEGIN TRANSACTION\` | Start a transaction |
| \`COMMIT\` | Save all changes |
| \`ROLLBACK\` | Undo all changes since BEGIN |

### ACID Properties

| Property | Meaning |
|----------|---------|
| **Atomicity** | All or nothing |
| **Consistency** | Database stays valid |
| **Isolation** | Transactions don't interfere |
| **Durability** | Committed data persists |

### Real-World Example: Booking an Appointment

\`\`\`sql
BEGIN TRANSACTION;
INSERT INTO appointments (client_id, staff_id, treatment_id, appointment_date, status)
VALUES (1, 5, 3, '2025-04-01', 'scheduled');
INSERT INTO invoices (appointment_id, client_id, amount, invoice_date, status)
VALUES (last_insert_rowid(), 1, 350.00, '2025-04-01', 'pending');
COMMIT;
\`\`\``,
            exampleQueries: [
                { label: 'Transaction: price update', sql: "BEGIN TRANSACTION;\nUPDATE treatments SET price = price * 1.05 WHERE category = 'Facials';\nSELECT treatment_name, price FROM treatments WHERE category = 'Facials';\nROLLBACK;\nSELECT treatment_name, price FROM treatments WHERE category = 'Facials';" },
                { label: 'Transaction: book appointment', sql: "BEGIN TRANSACTION;\nINSERT INTO appointments (client_id, staff_id, treatment_id, appointment_date, status)\nVALUES (1, 5, 3, '2025-04-01', 'scheduled');\nSELECT * FROM appointments ORDER BY appointment_id DESC LIMIT 1;\nCOMMIT;" },
                { label: 'Rollback demo', sql: "SELECT COUNT(*) AS before_count FROM products;\nBEGIN TRANSACTION;\nDELETE FROM products WHERE stock_quantity = 0;\nSELECT COUNT(*) AS during_count FROM products;\nROLLBACK;\nSELECT COUNT(*) AS after_rollback FROM products;" }
            ]
        },
        {
            lessonId: 4,
            title: 'SQL Best Practices',
            type: 'reading',
            content: `## Writing Better SQL

### 1. Be Specific with Columns

\`\`\`sql
-- Bad: SELECT * is fragile and wasteful
SELECT * FROM staff;

-- Good: Only select what you need
SELECT first_name, last_name, role FROM staff;
\`\`\`

### 2. Use Meaningful Aliases

\`\`\`sql
-- Bad
SELECT a, b FROM t1 x JOIN t2 y ON x.c = y.c;

-- Good
SELECT s.first_name, d.department_name
FROM staff s JOIN departments d ON s.department_id = d.department_id;
\`\`\`

### 3. Format for Readability

\`\`\`sql
SELECT s.first_name || ' ' || s.last_name AS provider,
       d.department_name,
       COUNT(a.appointment_id) AS total_appointments
FROM staff s
JOIN departments d ON s.department_id = d.department_id
LEFT JOIN appointments a ON s.staff_id = a.staff_id
GROUP BY s.staff_id, d.department_name
HAVING COUNT(a.appointment_id) > 0
ORDER BY total_appointments DESC;
\`\`\`

### 4. Avoid Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| \`SELECT *\` in production | List specific columns |
| Missing WHERE on UPDATE/DELETE | Always double-check |
| NOT IN with NULLs | Use NOT EXISTS instead |
| Implicit type conversions | Use CAST() explicitly |
| N+1 query problem | Use JOINs or subqueries |

### 5. Execution Order

Remember the actual order SQL runs in:

1. \`FROM\` / \`JOIN\`
2. \`WHERE\`
3. \`GROUP BY\`
4. \`HAVING\`
5. \`SELECT\`
6. \`DISTINCT\`
7. \`ORDER BY\`
8. \`LIMIT\` / \`OFFSET\``,
            exampleQueries: [
                { label: 'Well-formatted report', sql: "SELECT s.first_name || ' ' || s.last_name AS provider,\n       d.department_name,\n       COUNT(a.appointment_id) AS appointments,\n       ROUND(SUM(t.price), 2) AS revenue\nFROM staff s\nJOIN departments d ON s.department_id = d.department_id\nLEFT JOIN appointments a ON s.staff_id = a.staff_id\n    AND a.status = 'completed'\nLEFT JOIN treatments t ON a.treatment_id = t.treatment_id\nGROUP BY s.staff_id, d.department_name\nORDER BY revenue DESC;" },
                { label: 'NOT EXISTS vs NOT IN', sql: "SELECT first_name, last_name\nFROM clients c\nWHERE NOT EXISTS (\n    SELECT 1 FROM appointments a\n    WHERE a.client_id = c.client_id\n)\nORDER BY last_name;" },
                { label: 'CAST example', sql: "SELECT treatment_name,\n       price,\n       CAST(price AS INTEGER) AS rounded_price,\n       TYPEOF(price) AS original_type\nFROM treatments\nORDER BY price DESC\nLIMIT 10;" }
            ]
        },
        {
            lessonId: 5,
            title: 'Use Case: Scaling the Spa Database',
            type: 'reading',
            content: `## Real Scenario: The Spa Has Grown

The spa now has thousands of clients and queries are slowing down. Let's diagnose and fix performance issues.

### Diagnosing Slow Queries

\`\`\`sql
-- This query scans ALL appointments — slow with 10,000+ rows
EXPLAIN QUERY PLAN
SELECT * FROM appointments
WHERE status = 'completed' AND appointment_date > '2025-01-01';
-- Result: SCAN TABLE appointments
\`\`\`

### Adding the Right Index

\`\`\`sql
CREATE INDEX idx_appt_status_date ON appointments(status, appointment_date);

-- Now check again
EXPLAIN QUERY PLAN
SELECT * FROM appointments
WHERE status = 'completed' AND appointment_date > '2025-01-01';
-- Result: SEARCH TABLE appointments USING INDEX idx_appt_status_date
\`\`\`

### When NOT to Index

- \`status\` alone has only 4 values (low cardinality) — not great alone
- But \`status + appointment_date\` together is very selective
- Don't index every column — each index slows down INSERT/UPDATE

### Bulk Operations Need Transactions

\`\`\`sql
-- Without transaction: each INSERT is a separate disk write
-- With transaction: all writes batched together
BEGIN TRANSACTION;
-- ... hundreds of INSERTs for end-of-month archival ...
COMMIT;
\`\`\``,
            exampleQueries: [
                { label: 'Before index', sql: "EXPLAIN QUERY PLAN\nSELECT * FROM appointments\nWHERE status = 'completed' AND appointment_date > '2025-01-01';" },
                { label: 'After adding index', sql: "CREATE INDEX idx_appt_status_date ON appointments(status, appointment_date);\nEXPLAIN QUERY PLAN\nSELECT * FROM appointments\nWHERE status = 'completed' AND appointment_date > '2025-01-01';" },
                { label: 'Index on client lookups', sql: "CREATE INDEX idx_clients_city ON clients(city);\nEXPLAIN QUERY PLAN\nSELECT * FROM clients WHERE city = 'Scottsdale';" }
            ]
        },
        {
            lessonId: 6,
            title: 'Exercise: Optimize a Slow Query',
            type: 'exercise',
            content: `## Exercise: Index for Performance

Create an index to speed up a common query pattern at the spa: looking up completed appointments by date.`,
            exercise: {
                prompt: 'Create an index named "idx_appt_status_date" on the appointments table for columns (status, appointment_date). Then run EXPLAIN QUERY PLAN for: SELECT * FROM appointments WHERE status = \'completed\' AND appointment_date > \'2025-01-01\';',
                startingCode: '-- Create index and check query plan\n',
                expectedQuery: "CREATE INDEX idx_appt_status_date ON appointments(status, appointment_date);\nEXPLAIN QUERY PLAN SELECT * FROM appointments WHERE status = 'completed' AND appointment_date > '2025-01-01';",
                hints: [
                    'CREATE INDEX idx_appt_status_date ON appointments(status, appointment_date);',
                    'Follow with: EXPLAIN QUERY PLAN SELECT * FROM appointments WHERE status = \'completed\' AND appointment_date > \'2025-01-01\';',
                    "CREATE INDEX idx_appt_status_date ON appointments(status, appointment_date);\nEXPLAIN QUERY PLAN SELECT * FROM appointments WHERE status = 'completed' AND appointment_date > '2025-01-01';"
                ],
                orderMatters: false
            }
        },
        {
            lessonId: 7,
            title: 'Exercise: Index for Client Lookups',
            type: 'exercise',
            content: `## Exercise: Speed Up City-Based Queries

The front desk frequently looks up clients by city. Add an index to speed this up.`,
            exercise: {
                prompt: 'Create an index named "idx_clients_city" on clients(city). Then EXPLAIN QUERY PLAN SELECT * FROM clients WHERE city = \'Scottsdale\';',
                startingCode: '-- Index for client city lookups\n',
                expectedQuery: "CREATE INDEX idx_clients_city ON clients(city);\nEXPLAIN QUERY PLAN SELECT * FROM clients WHERE city = 'Scottsdale';",
                hints: [
                    'CREATE INDEX idx_clients_city ON clients(city);',
                    'Then: EXPLAIN QUERY PLAN SELECT * FROM clients WHERE city = \'Scottsdale\';',
                    "CREATE INDEX idx_clients_city ON clients(city);\nEXPLAIN QUERY PLAN SELECT * FROM clients WHERE city = 'Scottsdale';"
                ],
                orderMatters: false
            }
        },
        {
            lessonId: 8,
            title: 'Exercise: Transaction for Booking',
            type: 'exercise',
            content: `## Exercise: Atomic Appointment Booking

Book an appointment and create the invoice in a single atomic transaction.`,
            exercise: {
                prompt: 'Use a transaction to atomically: 1) INSERT an appointment (client_id 1, staff_id 5, treatment_id 3, appointment_date \'2025-06-01\', status \'scheduled\'), 2) INSERT an invoice (appointment_id = last_insert_rowid(), client_id 1, amount 350.00, invoice_date \'2025-06-01\', status \'pending\'). COMMIT, then SELECT * FROM appointments ORDER BY appointment_id DESC LIMIT 1.',
                startingCode: '-- Atomic booking transaction\n',
                expectedQuery: "BEGIN TRANSACTION;\nINSERT INTO appointments (client_id, staff_id, treatment_id, appointment_date, status) VALUES (1, 5, 3, '2025-06-01', 'scheduled');\nINSERT INTO invoices (appointment_id, client_id, amount, invoice_date, status) VALUES (last_insert_rowid(), 1, 350.00, '2025-06-01', 'pending');\nCOMMIT;\nSELECT * FROM appointments ORDER BY appointment_id DESC LIMIT 1;",
                hints: [
                    'Start with BEGIN TRANSACTION; then two INSERT statements, then COMMIT;',
                    'Use last_insert_rowid() in the second INSERT to reference the appointment_id just created.',
                    "BEGIN TRANSACTION;\nINSERT INTO appointments (client_id, staff_id, treatment_id, appointment_date, status) VALUES (1, 5, 3, '2025-06-01', 'scheduled');\nINSERT INTO invoices (appointment_id, client_id, amount, invoice_date, status) VALUES (last_insert_rowid(), 1, 350.00, '2025-06-01', 'pending');\nCOMMIT;\nSELECT * FROM appointments ORDER BY appointment_id DESC LIMIT 1;"
                ],
                orderMatters: false
            }
        },
        {
            lessonId: 9,
            title: 'Exercise: Query Refactoring Challenge',
            type: 'exercise',
            content: `## Exercise: Rewrite a Bad Query

Rewrite a poorly-written query using best practices: NOT EXISTS instead of NOT IN, explicit columns, proper aliases.`,
            exercise: {
                prompt: 'Find all clients who have NO paid invoices. Show first_name, last_name, and email. Use NOT EXISTS (not NOT IN). Sort by last_name ascending.',
                startingCode: '-- Rewrite using best practices\n',
                expectedQuery: "SELECT c.first_name, c.last_name, c.email\nFROM clients c\nWHERE NOT EXISTS (\n    SELECT 1 FROM invoices i\n    WHERE i.client_id = c.client_id\n      AND i.status = 'paid'\n)\nORDER BY c.last_name ASC;",
                hints: [
                    'NOT EXISTS is preferred over NOT IN because it handles NULLs correctly.',
                    'WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.client_id = c.client_id AND i.status = \'paid\')',
                    "SELECT c.first_name, c.last_name, c.email\nFROM clients c\nWHERE NOT EXISTS (\n    SELECT 1 FROM invoices i\n    WHERE i.client_id = c.client_id\n      AND i.status = 'paid'\n)\nORDER BY c.last_name ASC;"
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 10,
            title: 'Exercise: Full Spa Dashboard Query',
            type: 'exercise',
            content: `## Exercise: Executive Dashboard

Build a comprehensive query that a spa owner would use to see key business metrics.`,
            exercise: {
                prompt: 'Write a query that shows: total completed appointments as "total_appointments", total revenue (SUM of invoice amounts where status = \'paid\') as "total_revenue" (ROUND to 2), number of unique clients with appointments as "active_clients", and average revenue per client as "avg_per_client" (ROUND to 2). All in a single row.',
                startingCode: '-- Executive dashboard metrics\n',
                expectedQuery: "SELECT\n    (SELECT COUNT(*) FROM appointments WHERE status = 'completed') AS total_appointments,\n    (SELECT ROUND(SUM(amount), 2) FROM invoices WHERE status = 'paid') AS total_revenue,\n    (SELECT COUNT(DISTINCT client_id) FROM appointments) AS active_clients,\n    ROUND((SELECT SUM(amount) FROM invoices WHERE status = 'paid') * 1.0 / (SELECT COUNT(DISTINCT client_id) FROM appointments), 2) AS avg_per_client;",
                hints: [
                    'Use scalar subqueries in the SELECT: (SELECT COUNT(*) FROM appointments WHERE status = \'completed\') AS total_appointments',
                    'For avg_per_client, divide total revenue by active clients. Use * 1.0 to force decimal division.',
                    "SELECT\n    (SELECT COUNT(*) FROM appointments WHERE status = 'completed') AS total_appointments,\n    (SELECT ROUND(SUM(amount), 2) FROM invoices WHERE status = 'paid') AS total_revenue,\n    (SELECT COUNT(DISTINCT client_id) FROM appointments) AS active_clients,\n    ROUND((SELECT SUM(amount) FROM invoices WHERE status = 'paid') * 1.0 / (SELECT COUNT(DISTINCT client_id) FROM appointments), 2) AS avg_per_client;"
                ],
                orderMatters: false
            }
        }
    ]
};
