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
            title: 'Use Case: Designing a Gift Card System',
            type: 'reading',
            content: `## Real Scenario: Adding Gift Cards to the Spa

The spa owner wants to sell gift cards. Let's walk through the full table design process.

### Step 1: What Data Do We Need?

- A unique card code (like "GC-2025-0042")
- Original amount and remaining balance
- Who purchased it and when
- Expiry date (optional)
- Is it active?

### Step 2: Choose Types & Constraints

\`\`\`sql
CREATE TABLE gift_cards (
    card_id INTEGER PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    client_id INTEGER,
    original_amount REAL NOT NULL CHECK(original_amount > 0),
    remaining_balance REAL NOT NULL CHECK(remaining_balance >= 0),
    purchase_date TEXT NOT NULL,
    expiry_date TEXT,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (client_id) REFERENCES clients(client_id)
);
\`\`\`

### Design Decisions

| Choice | Why |
|--------|-----|
| \`code TEXT UNIQUE\` | Each card needs a unique, scannable code |
| \`CHECK(remaining_balance >= 0)\` | Prevents negative balances |
| \`client_id\` nullable | Walk-in purchases may not have a client record |
| \`is_active INTEGER DEFAULT 1\` | Boolean flag, defaults to active |

### Step 3: Add Data & Verify

\`\`\`sql
INSERT INTO gift_cards (code, client_id, original_amount, remaining_balance, purchase_date, expiry_date)
VALUES ('GC-2025-001', 1, 250.00, 250.00, '2025-01-15', '2026-01-15');

SELECT * FROM gift_cards;
\`\`\``,
            exampleQueries: [
                { label: 'Create & populate gift_cards', sql: "CREATE TABLE gift_cards (\n    card_id INTEGER PRIMARY KEY,\n    code TEXT UNIQUE NOT NULL,\n    client_id INTEGER,\n    original_amount REAL NOT NULL CHECK(original_amount > 0),\n    remaining_balance REAL NOT NULL CHECK(remaining_balance >= 0),\n    purchase_date TEXT NOT NULL,\n    expiry_date TEXT,\n    is_active INTEGER DEFAULT 1,\n    FOREIGN KEY (client_id) REFERENCES clients(client_id)\n);\nINSERT INTO gift_cards (code, client_id, original_amount, remaining_balance, purchase_date, expiry_date) VALUES\n    ('GC-2025-001', 1, 250.00, 250.00, '2025-01-15', '2026-01-15'),\n    ('GC-2025-002', NULL, 100.00, 75.00, '2025-02-01', '2026-02-01');\nSELECT * FROM gift_cards;" },
                { label: 'Check constraints work', sql: "CREATE TABLE gc_test (\n    id INTEGER PRIMARY KEY,\n    balance REAL CHECK(balance >= 0)\n);\nINSERT INTO gc_test VALUES (1, 50.00);\nSELECT * FROM gc_test;" },
                { label: 'View table structure', sql: "CREATE TABLE gift_cards (\n    card_id INTEGER PRIMARY KEY,\n    code TEXT UNIQUE NOT NULL,\n    original_amount REAL NOT NULL,\n    remaining_balance REAL NOT NULL,\n    purchase_date TEXT NOT NULL,\n    expiry_date TEXT,\n    is_active INTEGER DEFAULT 1\n);\nPRAGMA table_info(gift_cards);" }
            ]
        },
        {
            lessonId: 5,
            title: 'Exercise: Create a Staff Schedule Table',
            type: 'exercise',
            content: `## Exercise: Staff Scheduling

The spa needs to track which staff members are working on which days and shifts.`,
            exercise: {
                prompt: 'CREATE TABLE staff_schedule with: schedule_id (INTEGER PRIMARY KEY), staff_id (INTEGER NOT NULL, FOREIGN KEY to staff), work_date (TEXT NOT NULL), shift_start (TEXT NOT NULL), shift_end (TEXT NOT NULL). Then INSERT a row: staff_id 1, work_date \'2025-04-01\', shift_start \'09:00\', shift_end \'17:00\'. Finally SELECT * FROM staff_schedule.',
                startingCode: '-- Create staff scheduling table\n',
                expectedQuery: "CREATE TABLE staff_schedule (\n    schedule_id INTEGER PRIMARY KEY,\n    staff_id INTEGER NOT NULL,\n    work_date TEXT NOT NULL,\n    shift_start TEXT NOT NULL,\n    shift_end TEXT NOT NULL,\n    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)\n);\nINSERT INTO staff_schedule (staff_id, work_date, shift_start, shift_end) VALUES (1, '2025-04-01', '09:00', '17:00');\nSELECT * FROM staff_schedule;",
                hints: [
                    'CREATE TABLE staff_schedule (...) with 5 columns and a FOREIGN KEY clause at the end.',
                    'After CREATE TABLE, use INSERT INTO staff_schedule (staff_id, work_date, shift_start, shift_end) VALUES (...);',
                    "CREATE TABLE staff_schedule (\n    schedule_id INTEGER PRIMARY KEY,\n    staff_id INTEGER NOT NULL,\n    work_date TEXT NOT NULL,\n    shift_start TEXT NOT NULL,\n    shift_end TEXT NOT NULL,\n    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)\n);\nINSERT INTO staff_schedule (staff_id, work_date, shift_start, shift_end) VALUES (1, '2025-04-01', '09:00', '17:00');\nSELECT * FROM staff_schedule;"
                ],
                orderMatters: false
            }
        },
        {
            lessonId: 6,
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
        },
        {
            lessonId: 7,
            title: 'Exercise: Add a Column and Verify',
            type: 'exercise',
            content: `## Exercise: Track Preferred Contact Method

The spa wants to know how each client prefers to be contacted. Add this capability to the existing clients table.`,
            exercise: {
                prompt: 'Use ALTER TABLE to add a column "preferred_contact" (TEXT, DEFAULT \'email\') to the clients table. Then UPDATE clients SET preferred_contact = \'phone\' WHERE phone IS NOT NULL AND email IS NULL. Finally SELECT first_name, last_name, preferred_contact FROM clients ORDER BY last_name LIMIT 10.',
                startingCode: '-- Add preferred contact method to clients\n',
                expectedQuery: "ALTER TABLE clients ADD COLUMN preferred_contact TEXT DEFAULT 'email';\nUPDATE clients SET preferred_contact = 'phone' WHERE phone IS NOT NULL AND email IS NULL;\nSELECT first_name, last_name, preferred_contact FROM clients ORDER BY last_name LIMIT 10;",
                hints: [
                    'ALTER TABLE clients ADD COLUMN preferred_contact TEXT DEFAULT \'email\';',
                    'Then UPDATE clients SET preferred_contact = \'phone\' WHERE phone IS NOT NULL AND email IS NULL;',
                    "ALTER TABLE clients ADD COLUMN preferred_contact TEXT DEFAULT 'email';\nUPDATE clients SET preferred_contact = 'phone' WHERE phone IS NOT NULL AND email IS NULL;\nSELECT first_name, last_name, preferred_contact FROM clients ORDER BY last_name LIMIT 10;"
                ],
                orderMatters: false
            }
        },
        {
            lessonId: 8,
            title: 'Exercise: Design a Membership System',
            type: 'exercise',
            content: `## Exercise: VIP Membership Table

The spa is launching a membership program. Design a table with proper constraints for tracking memberships.`,
            exercise: {
                prompt: 'CREATE TABLE memberships with: membership_id (INTEGER PRIMARY KEY), client_id (INTEGER NOT NULL, FK to clients), membership_type (TEXT NOT NULL, CHECK must be \'Basic\', \'Premium\', or \'VIP\'), start_date (TEXT NOT NULL), end_date (TEXT), monthly_fee (REAL NOT NULL, CHECK > 0), is_active (INTEGER DEFAULT 1). Then INSERT two rows: (client_id 1, \'Premium\', \'2025-01-01\', \'2026-01-01\', 99.99, 1) and (client_id 2, \'VIP\', \'2025-02-01\', NULL, 199.99, 1). Finally SELECT * FROM memberships.',
                startingCode: '-- Design the membership system\n',
                expectedQuery: "CREATE TABLE memberships (\n    membership_id INTEGER PRIMARY KEY,\n    client_id INTEGER NOT NULL,\n    membership_type TEXT NOT NULL CHECK(membership_type IN ('Basic', 'Premium', 'VIP')),\n    start_date TEXT NOT NULL,\n    end_date TEXT,\n    monthly_fee REAL NOT NULL CHECK(monthly_fee > 0),\n    is_active INTEGER DEFAULT 1,\n    FOREIGN KEY (client_id) REFERENCES clients(client_id)\n);\nINSERT INTO memberships (client_id, membership_type, start_date, end_date, monthly_fee, is_active) VALUES\n    (1, 'Premium', '2025-01-01', '2026-01-01', 99.99, 1),\n    (2, 'VIP', '2025-02-01', NULL, 199.99, 1);\nSELECT * FROM memberships;",
                hints: [
                    'Use CHECK(membership_type IN (\'Basic\', \'Premium\', \'VIP\')) and CHECK(monthly_fee > 0) for constraints.',
                    'INSERT two rows using VALUES (...), (...) syntax. Use NULL for the VIP end_date.',
                    "CREATE TABLE memberships (\n    membership_id INTEGER PRIMARY KEY,\n    client_id INTEGER NOT NULL,\n    membership_type TEXT NOT NULL CHECK(membership_type IN ('Basic', 'Premium', 'VIP')),\n    start_date TEXT NOT NULL,\n    end_date TEXT,\n    monthly_fee REAL NOT NULL CHECK(monthly_fee > 0),\n    is_active INTEGER DEFAULT 1,\n    FOREIGN KEY (client_id) REFERENCES clients(client_id)\n);\nINSERT INTO memberships (client_id, membership_type, start_date, end_date, monthly_fee, is_active) VALUES\n    (1, 'Premium', '2025-01-01', '2026-01-01', 99.99, 1),\n    (2, 'VIP', '2025-02-01', NULL, 199.99, 1);\nSELECT * FROM memberships;"
                ],
                orderMatters: false
            }
        }
    ]
};
