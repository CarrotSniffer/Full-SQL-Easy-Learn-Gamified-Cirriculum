// Module 1 — Getting Started with SQL (Medical Spa context)
const MODULE_01 = {
    moduleId: 1,
    title: 'Getting Started with SQL',
    level: 'beginner',
    description: 'Learn the fundamentals of databases and your first SQL queries using medical spa data.',
    lessons: [
        {
            lessonId: 1,
            title: 'What is SQL?',
            type: 'reading',
            content: `## What is SQL?

**SQL** (Structured Query Language) is the standard language used to communicate with databases. It allows you to:

- **Query** data — retrieve information from a database
- **Insert** data — add new records
- **Update** data — modify existing records
- **Delete** data — remove records
- **Create** and modify table structures

### Why Learn SQL in the Medical Spa Industry?

SQL is incredibly valuable for medical spa professionals:
- Pull **appointment reports** to analyze busy days and popular treatments
- Track **client retention** and identify top-spending patients
- Analyze **revenue by treatment category** or provider
- Generate **inventory reports** for skincare products
- Build **marketing lists** based on client history

### About This Bootcamp

In this bootcamp, you have a **live SQL database** running right in your browser! The database contains tables for a fictional medical spa called **Glow Spa**, including staff, clients, treatments, appointments, invoices, and products.

Click the **Schema Explorer** button in the top-right to see all available tables.

### SQL Comments

\`\`\`sql
-- This is a single-line comment

/* This is a
   multi-line comment */

SELECT * FROM staff; -- comment after a statement
\`\`\`

Try running your first query in the editor:`,
            exampleQueries: [
                { label: 'See all staff', sql: 'SELECT * FROM staff LIMIT 5;' },
                { label: 'Count staff', sql: 'SELECT COUNT(*) AS total_staff FROM staff;' }
            ]
        },
        {
            lessonId: 2,
            title: 'Your First SELECT',
            type: 'reading',
            content: `## The SELECT Statement

The \`SELECT\` statement retrieves data from a table.

### Basic Syntax

\`\`\`sql
SELECT * FROM table_name;
\`\`\`

- \`SELECT\` — tells the database you want to retrieve data
- \`*\` — means "all columns"
- \`FROM table_name\` — specifies which table to query

### Example

\`\`\`sql
SELECT * FROM departments;
\`\`\`

This returns every row and every column from the \`departments\` table — in our case, the spa's departments like Aesthetics, Laser & Light, Injectables, etc.

> **Tip:** The semicolon \`;\` at the end is optional in our editor, but it's good practice to include it.`,
            exampleQueries: [
                { label: 'All departments', sql: 'SELECT * FROM departments;' },
                { label: 'All treatments', sql: 'SELECT * FROM treatments;' },
                { label: 'First 10 clients', sql: 'SELECT * FROM clients LIMIT 10;' }
            ]
        },
        {
            lessonId: 3,
            title: 'Selecting Specific Columns',
            type: 'reading',
            content: `## Choosing Columns

Instead of \`SELECT *\`, you can specify exactly which columns you want:

\`\`\`sql
SELECT column1, column2 FROM table_name;
\`\`\`

### Why Select Specific Columns?

- **Performance** — retrieving fewer columns is faster
- **Clarity** — you see only the data you need
- **Best practice** — in production code, \`SELECT *\` is generally discouraged

### Medical Spa Examples

Get just the treatment names and prices:
\`\`\`sql
SELECT treatment_name, price FROM treatments;
\`\`\`

### Mathematical Expressions

You can perform calculations in SELECT. For example, adding tax to treatment prices:

\`\`\`sql
SELECT treatment_name, price,
       ROUND(price * 1.08, 2) AS price_with_tax
FROM treatments;
\`\`\`

Common operators: \`+\` (add), \`-\` (subtract), \`*\` (multiply), \`/\` (divide), \`%\` (modulo)

### String Concatenation

Use \`||\` to combine text values:

\`\`\`sql
SELECT first_name || ' ' || last_name AS full_name
FROM staff;
\`\`\``,
            exampleQueries: [
                { label: 'Staff names & roles', sql: 'SELECT first_name, last_name, role FROM staff LIMIT 10;' },
                { label: 'Treatment prices + tax', sql: 'SELECT treatment_name, price, ROUND(price * 1.08, 2) AS price_with_tax FROM treatments;' },
                { label: 'Staff full names', sql: "SELECT first_name || ' ' || last_name AS full_name, role FROM staff LIMIT 10;" }
            ]
        },
        {
            lessonId: 4,
            title: 'Column Aliases and DISTINCT',
            type: 'reading',
            content: `## Column Aliases

Rename columns in your output using \`AS\`:

\`\`\`sql
SELECT first_name AS "First Name",
       last_name AS "Last Name",
       hourly_rate AS "Rate ($/hr)"
FROM staff;
\`\`\`

> **Note:** Use double quotes around aliases that contain spaces or special characters.

## DISTINCT — Removing Duplicates

\`SELECT DISTINCT\` removes duplicate rows:

\`\`\`sql
-- See all unique roles at the spa
SELECT DISTINCT role FROM staff;

-- See all cities our clients come from
SELECT DISTINCT city FROM clients;

-- DISTINCT on multiple columns
SELECT DISTINCT category, brand FROM products;
\`\`\`

Without DISTINCT, you may get the same value repeated many times. DISTINCT is essential when you need a unique list.`,
            exampleQueries: [
                { label: 'Unique staff roles', sql: 'SELECT DISTINCT role FROM staff ORDER BY role;' },
                { label: 'Unique client cities', sql: 'SELECT DISTINCT city FROM clients ORDER BY city;' },
                { label: 'Treatment categories', sql: 'SELECT DISTINCT category FROM treatments ORDER BY category;' },
                { label: 'Product brands', sql: 'SELECT DISTINCT brand FROM products ORDER BY brand;' }
            ]
        },
        {
            lessonId: 5,
            title: 'Use Case: Front Desk Quick Lookups',
            type: 'reading',
            content: `## Real Scenario: Front Desk Receptionist

The front desk receptionist at Glow Spa needs quick answers throughout the day. Here's how SQL handles common lookups:

### "What treatments do we offer and how much do they cost?"

\`\`\`sql
SELECT treatment_name AS "Treatment",
       category AS "Category",
       price AS "Price"
FROM treatments
ORDER BY category, treatment_name;
\`\`\`

### "Who's on our team?"

\`\`\`sql
SELECT first_name || ' ' || last_name AS "Staff Member",
       role AS "Role",
       department_id AS "Dept"
FROM staff
ORDER BY role, last_name;
\`\`\`

### "What cities do our clients come from?"

\`\`\`sql
SELECT DISTINCT city AS "City", state AS "State"
FROM clients
ORDER BY city;
\`\`\`

### "What products do we carry from each brand?"

\`\`\`sql
SELECT DISTINCT brand AS "Brand",
       category AS "Product Type"
FROM products
ORDER BY brand, category;
\`\`\`

These simple queries power the everyday lookups that keep the spa running smoothly.`,
            exampleQueries: [
                { label: 'Treatment menu', sql: "SELECT treatment_name AS \"Treatment\", category AS \"Category\", price AS \"Price\" FROM treatments ORDER BY category, treatment_name;" },
                { label: 'Staff directory', sql: "SELECT first_name || ' ' || last_name AS \"Staff Member\", role AS \"Role\" FROM staff ORDER BY role, last_name;" },
                { label: 'Client city list', sql: 'SELECT DISTINCT city AS "City", state AS "State" FROM clients ORDER BY city;' },
                { label: 'Product brands & types', sql: 'SELECT DISTINCT brand AS "Brand", category AS "Product Type" FROM products ORDER BY brand, category;' }
            ]
        },
        {
            lessonId: 6,
            title: 'Exercise: Your First Queries',
            type: 'exercise',
            content: `## Exercise: Your First Queries

Time to practice! Use what you've learned about \`SELECT\`, aliases, and \`DISTINCT\`.`,
            exercise: {
                prompt: 'Write a query that returns all **unique referral sources** from the clients table, sorted alphabetically. Name the column "Referral Source".',
                startingCode: '-- Select unique referral sources with an alias\nSELECT ',
                expectedQuery: 'SELECT DISTINCT referral_source AS "Referral Source" FROM clients ORDER BY referral_source;',
                hints: [
                    'Use `SELECT DISTINCT` to get unique values from a column.',
                    'Use `AS` to alias the column: `DISTINCT referral_source AS "Referral Source"`',
                    'SELECT DISTINCT referral_source AS "Referral Source" FROM clients ORDER BY referral_source;'
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 7,
            title: 'Exercise: Building a Treatment Menu',
            type: 'exercise',
            content: `## Exercise: Printable Treatment Menu

The spa manager wants a clean, printable treatment menu to display in the lobby.`,
            exercise: {
                prompt: 'Show all treatments with treatment_name as "Treatment", category as "Category", and price as "Price". Sort by category first (ascending), then by treatment_name (ascending).',
                startingCode: '-- Build a treatment menu for the lobby\n',
                expectedQuery: 'SELECT treatment_name AS "Treatment", category AS "Category", price AS "Price" FROM treatments ORDER BY category ASC, treatment_name ASC;',
                hints: [
                    'Use AS to create aliases: treatment_name AS "Treatment", etc.',
                    'ORDER BY category ASC, treatment_name ASC for double sorting.',
                    'SELECT treatment_name AS "Treatment", category AS "Category", price AS "Price" FROM treatments ORDER BY category ASC, treatment_name ASC;'
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 8,
            title: 'Exercise: Client Contact List',
            type: 'exercise',
            content: `## Exercise: Client Contact Directory

The marketing team needs a list of all client cities and a formatted contact list for Scottsdale clients.`,
            exercise: {
                prompt: 'Show all DISTINCT cities from the clients table, aliased as "Client City", sorted alphabetically.',
                startingCode: '-- Unique client cities\n',
                expectedQuery: 'SELECT DISTINCT city AS "Client City" FROM clients ORDER BY city;',
                hints: [
                    'Use SELECT DISTINCT city AS "Client City" FROM clients.',
                    'Add ORDER BY city at the end to sort alphabetically.',
                    'SELECT DISTINCT city AS "Client City" FROM clients ORDER BY city;'
                ],
                orderMatters: true
            }
        }
    ]
};
