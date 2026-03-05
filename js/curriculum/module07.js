// Module 7 — Table Design / DDL (Medical Spa context)
const MODULE_07 = {
    moduleId: 7,
    title: 'Table Design (DDL)',
    level: 'intermediate',
    description: 'Create tables, define constraints, primary keys, and foreign keys.',
    lessons: [
        {
            lessonId: 1,
            title: 'CREATE TABLE & Data Types',
            type: 'reading',
            content: `## Creating Tables

\`CREATE TABLE\` defines a new table and its columns:

\`\`\`sql
CREATE TABLE promotions (
    promo_id INTEGER PRIMARY KEY,
    promo_name TEXT NOT NULL,
    discount_percent REAL NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    is_active INTEGER DEFAULT 1
);
\`\`\`

### SQLite Data Types

| Type | Use For |
|------|---------|
| \`INTEGER\` | Whole numbers, IDs, booleans (0/1) |
| \`REAL\` | Decimals — prices, rates |
| \`TEXT\` | Strings — names, dates, emails |
| \`BLOB\` | Binary data (rare in practice) |

### Column Constraints

| Constraint | Meaning |
|-----------|---------|
| \`PRIMARY KEY\` | Unique row identifier |
| \`NOT NULL\` | Cannot be empty |
| \`UNIQUE\` | No duplicate values |
| \`DEFAULT value\` | Auto-fill if not provided |
| \`CHECK(expr)\` | Value must satisfy condition |`,
            exampleQueries: [
                { label: 'Create promotions table', sql: "CREATE TABLE promotions (\n    promo_id INTEGER PRIMARY KEY,\n    promo_name TEXT NOT NULL,\n    discount_percent REAL NOT NULL CHECK(discount_percent > 0 AND discount_percent <= 100),\n    start_date TEXT NOT NULL,\n    end_date TEXT,\n    is_active INTEGER DEFAULT 1\n);\nSELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;" },
                { label: 'Create gift_cards table', sql: "CREATE TABLE gift_cards (\n    card_id INTEGER PRIMARY KEY,\n    code TEXT UNIQUE NOT NULL,\n    original_amount REAL NOT NULL,\n    remaining_balance REAL NOT NULL,\n    purchase_date TEXT NOT NULL,\n    expiry_date TEXT\n);\nINSERT INTO gift_cards VALUES (1, 'GC-2025-001', 200.00, 200.00, '2025-01-15', '2026-01-15');\nSELECT * FROM gift_cards;" },
                { label: 'Show all tables', sql: "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;" }
            ]
        },
        {
            lessonId: 2,
            title: 'Primary Keys & Foreign Keys',
            type: 'reading',
            content: `## Primary Keys

Every table should have a primary key — a column (or combo) that uniquely identifies each row:

\`\`\`sql
CREATE TABLE loyalty_points (
    loyalty_id INTEGER PRIMARY KEY,  -- auto-increments
    client_id INTEGER NOT NULL,
    points_earned INTEGER NOT NULL,
    earned_date TEXT NOT NULL,
    source TEXT
);
\`\`\`

In SQLite, \`INTEGER PRIMARY KEY\` automatically auto-increments.

## Foreign Keys

Foreign keys link tables together and enforce referential integrity:

\`\`\`sql
CREATE TABLE loyalty_points (
    loyalty_id INTEGER PRIMARY KEY,
    client_id INTEGER NOT NULL,
    points_earned INTEGER NOT NULL,
    earned_date TEXT NOT NULL,
    source TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(client_id)
);
\`\`\`

This means every \`client_id\` in loyalty_points **must** exist in the clients table.

### Viewing Table Structure

\`\`\`sql
-- See columns for any table
PRAGMA table_info(staff);
\`\`\``,
            exampleQueries: [
                { label: 'Create loyalty_points table', sql: "CREATE TABLE loyalty_points (\n    loyalty_id INTEGER PRIMARY KEY,\n    client_id INTEGER NOT NULL,\n    points_earned INTEGER NOT NULL,\n    earned_date TEXT NOT NULL,\n    source TEXT,\n    FOREIGN KEY (client_id) REFERENCES clients(client_id)\n);\nPRAGMA table_info(loyalty_points);" },
                { label: 'View staff table structure', sql: "PRAGMA table_info(staff);" },
                { label: 'View foreign keys on appointments', sql: "PRAGMA foreign_key_list(appointments);" }
            ]
        },
        {
            lessonId: 3,
            title: 'ALTER TABLE & DROP TABLE',
            type: 'reading',
            content: `## ALTER TABLE

Modify an existing table's structure:

\`\`\`sql
-- Add a column
ALTER TABLE clients ADD COLUMN loyalty_tier TEXT DEFAULT 'Bronze';

-- Rename a table
ALTER TABLE promotions RENAME TO discounts;
\`\`\`

### SQLite Limitations

SQLite's ALTER TABLE is limited compared to other databases:
- **Can:** Add columns, rename tables, rename columns
- **Cannot:** Drop columns (before 3.35.0), change types, add constraints

### DROP TABLE

Remove a table entirely:

\`\`\`sql
DROP TABLE IF EXISTS promotions;
\`\`\`

\`IF EXISTS\` prevents errors if the table doesn't exist.

### Best Practice

Always back up data before running DDL statements in production. In our learning environment, just click Reset to restore everything!`,
            exampleQueries: [
                { label: 'Add loyalty_tier to clients', sql: "ALTER TABLE clients ADD COLUMN loyalty_tier TEXT DEFAULT 'Bronze';\nSELECT first_name, last_name, loyalty_tier FROM clients LIMIT 5;" },
                { label: 'Create and drop a temp table', sql: "CREATE TABLE temp_test (id INTEGER PRIMARY KEY, note TEXT);\nSELECT name FROM sqlite_master WHERE type = 'table' AND name = 'temp_test';\nDROP TABLE temp_test;\nSELECT name FROM sqlite_master WHERE type = 'table' AND name = 'temp_test';" },
                { label: 'Add notes column to staff', sql: "ALTER TABLE staff ADD COLUMN notes TEXT;\nPRAGMA table_info(staff);" }
            ]
        },
        {
            lessonId: 4,
            title: 'Exercise: Design a Reviews Table',
            type: 'exercise',
            content: `## Exercise: Client Review System

The spa wants to track client reviews for treatments. Design and populate a reviews table.`,
            exercise: {
                prompt: 'CREATE TABLE reviews with columns: review_id (INTEGER PRIMARY KEY), client_id (INTEGER NOT NULL, FK to clients), treatment_id (INTEGER NOT NULL, FK to treatments), rating (INTEGER NOT NULL, CHECK between 1 and 5), review_text (TEXT), review_date (TEXT NOT NULL). Then INSERT a review: client_id 1, treatment_id 1, rating 5, review_text \'Amazing results!\', review_date \'2025-03-01\'. Finally SELECT * FROM reviews.',
                startingCode: '-- Create the reviews table\n',
                expectedQuery: "CREATE TABLE reviews (\n    review_id INTEGER PRIMARY KEY,\n    client_id INTEGER NOT NULL,\n    treatment_id INTEGER NOT NULL,\n    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),\n    review_text TEXT,\n    review_date TEXT NOT NULL,\n    FOREIGN KEY (client_id) REFERENCES clients(client_id),\n    FOREIGN KEY (treatment_id) REFERENCES treatments(treatment_id)\n);\nINSERT INTO reviews (client_id, treatment_id, rating, review_text, review_date) VALUES (1, 1, 5, 'Amazing results!', '2025-03-01');\nSELECT * FROM reviews;",
                hints: [
                    'Start with CREATE TABLE reviews (...); then INSERT INTO reviews VALUES (...); then SELECT * FROM reviews;',
                    'Use CHECK(rating >= 1 AND rating <= 5) for the rating constraint. Add FOREIGN KEY clauses at the end.',
                    "CREATE TABLE reviews (\n    review_id INTEGER PRIMARY KEY,\n    client_id INTEGER NOT NULL,\n    treatment_id INTEGER NOT NULL,\n    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),\n    review_text TEXT,\n    review_date TEXT NOT NULL,\n    FOREIGN KEY (client_id) REFERENCES clients(client_id),\n    FOREIGN KEY (treatment_id) REFERENCES treatments(treatment_id)\n);\nINSERT INTO reviews (client_id, treatment_id, rating, review_text, review_date) VALUES (1, 1, 5, 'Amazing results!', '2025-03-01');\nSELECT * FROM reviews;"
                ],
                orderMatters: false
            }
        }
    ]
};
