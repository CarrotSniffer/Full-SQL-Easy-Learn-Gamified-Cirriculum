// Module 11 — Advanced Techniques (Medical Spa context)
const MODULE_11 = {
    moduleId: 11,
    title: 'Advanced Techniques',
    level: 'expert',
    description: 'Master CASE expressions, string/date functions, COALESCE, and set operations.',
    lessons: [
        {
            lessonId: 1,
            title: 'CASE Expressions',
            type: 'reading',
            content: `## CASE — Conditional Logic in SQL

\`CASE\` lets you add if/else logic directly in queries:

\`\`\`sql
-- Categorize treatments by price tier
SELECT treatment_name, price,
       CASE
           WHEN price >= 1000 THEN 'Premium'
           WHEN price >= 500  THEN 'Mid-Range'
           WHEN price >= 200  THEN 'Standard'
           ELSE 'Budget'
       END AS price_tier
FROM treatments
ORDER BY price DESC;
\`\`\`

### CASE in Aggregations

\`\`\`sql
-- Count appointments by status
SELECT
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) AS scheduled,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled,
    COUNT(CASE WHEN status = 'no-show' THEN 1 END) AS no_shows
FROM appointments;
\`\`\`

### Simple CASE

\`\`\`sql
SELECT department_name,
       CASE department_name
           WHEN 'Front Desk' THEN 'Client-Facing'
           WHEN 'Marketing' THEN 'Client-Facing'
           ELSE 'Operations'
       END AS team_type
FROM departments;
\`\`\``,
            exampleQueries: [
                { label: 'Treatment price tiers', sql: "SELECT treatment_name, price,\n       CASE\n           WHEN price >= 1000 THEN 'Premium'\n           WHEN price >= 500  THEN 'Mid-Range'\n           WHEN price >= 200  THEN 'Standard'\n           ELSE 'Budget'\n       END AS price_tier\nFROM treatments\nORDER BY price DESC;" },
                { label: 'Appointment status pivot', sql: "SELECT\n    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,\n    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) AS scheduled,\n    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled,\n    COUNT(CASE WHEN status = 'no-show' THEN 1 END) AS no_shows,\n    COUNT(*) AS total\nFROM appointments;" },
                { label: 'Staff hourly rate bands', sql: "SELECT first_name || ' ' || last_name AS name, hourly_rate,\n       CASE\n           WHEN hourly_rate >= 75 THEN 'Senior'\n           WHEN hourly_rate >= 50 THEN 'Mid-Level'\n           ELSE 'Junior'\n       END AS level\nFROM staff\nORDER BY hourly_rate DESC;" }
            ]
        },
        {
            lessonId: 2,
            title: 'COALESCE & NULLIF',
            type: 'reading',
            content: `## Handling NULLs

### COALESCE — First Non-NULL Value

\`\`\`sql
-- Show 'N/A' for missing emails
SELECT first_name, last_name,
       COALESCE(email, 'No email on file') AS email_display,
       COALESCE(phone, 'No phone') AS phone_display
FROM clients
ORDER BY last_name
LIMIT 15;
\`\`\`

\`COALESCE\` takes any number of arguments and returns the first non-NULL one.

### NULLIF — Return NULL If Equal

\`\`\`sql
-- Avoid division by zero
SELECT product_name,
       price,
       cost,
       ROUND(price / NULLIF(cost, 0), 2) AS markup_ratio
FROM products;
\`\`\`

\`NULLIF(a, b)\` returns NULL if a = b, otherwise returns a.

### Combining Them

\`\`\`sql
-- Safe division with fallback
SELECT product_name,
       COALESCE(
           ROUND(price / NULLIF(cost, 0), 2),
           0
       ) AS markup_ratio
FROM products;
\`\`\``,
            exampleQueries: [
                { label: 'Fill missing contact info', sql: "SELECT first_name, last_name,\n       COALESCE(email, 'N/A') AS email,\n       COALESCE(phone, 'N/A') AS phone\nFROM clients\nORDER BY last_name\nLIMIT 15;" },
                { label: 'Product markup ratios', sql: "SELECT product_name, price, cost,\n       COALESCE(ROUND(price / NULLIF(cost, 0), 2), 0) AS markup_ratio\nFROM products\nORDER BY markup_ratio DESC;" },
                { label: 'COALESCE with discount', sql: "SELECT invoice_id, amount,\n       COALESCE(discount, 0) AS discount,\n       amount - COALESCE(discount, 0) AS net_amount\nFROM invoices\nORDER BY invoice_date DESC\nLIMIT 15;" }
            ]
        },
        {
            lessonId: 3,
            title: 'String & Date Functions',
            type: 'reading',
            content: `## String Functions

| Function | Example | Result |
|----------|---------|--------|
| \`LENGTH(s)\` | \`LENGTH('Botox')\` | 5 |
| \`UPPER(s)\` | \`UPPER('botox')\` | BOTOX |
| \`LOWER(s)\` | \`LOWER('BOTOX')\` | botox |
| \`SUBSTR(s, start, len)\` | \`SUBSTR('Botox', 1, 3)\` | Bot |
| \`REPLACE(s, old, new)\` | \`REPLACE('a@b.com', '@', ' at ')\` | a at b.com |
| \`TRIM(s)\` | \`TRIM('  hi  ')\` | hi |
| \`INSTR(s, search)\` | \`INSTR('hello', 'ell')\` | 2 |

## Date Functions (SQLite)

| Function | Example | Result |
|----------|---------|--------|
| \`DATE('now')\` | Current date | 2025-03-05 |
| \`DATE(d, modifier)\` | \`DATE('2025-01-01', '+30 days')\` | 2025-01-31 |
| \`STRFTIME(fmt, d)\` | \`STRFTIME('%Y', '2025-03-15')\` | 2025 |
| \`JULIANDAY(d)\` | Days since epoch | Used for date math |

### Date Math

\`\`\`sql
-- Days since signup for each client
SELECT first_name, last_name, signup_date,
       CAST(JULIANDAY('now') - JULIANDAY(signup_date) AS INTEGER) AS days_as_client
FROM clients
ORDER BY days_as_client DESC
LIMIT 10;
\`\`\`

### Extract Month/Year

\`\`\`sql
-- Appointments per month
SELECT STRFTIME('%Y-%m', appointment_date) AS month,
       COUNT(*) AS num_appointments
FROM appointments
GROUP BY month
ORDER BY month;
\`\`\``,
            exampleQueries: [
                { label: 'Client tenure (days)', sql: "SELECT first_name, last_name, signup_date,\n       CAST(JULIANDAY('now') - JULIANDAY(signup_date) AS INTEGER) AS days_as_client\nFROM clients\nORDER BY days_as_client DESC\nLIMIT 10;" },
                { label: 'Appointments per month', sql: "SELECT STRFTIME('%Y-%m', appointment_date) AS month,\n       COUNT(*) AS num_appointments\nFROM appointments\nGROUP BY month\nORDER BY month;" },
                { label: 'Email domain extraction', sql: "SELECT email,\n       SUBSTR(email, INSTR(email, '@') + 1) AS domain\nFROM clients\nWHERE email IS NOT NULL\nORDER BY domain\nLIMIT 15;" }
            ]
        },
        {
            lessonId: 4,
            title: 'Set Operations (UNION, INTERSECT, EXCEPT)',
            type: 'reading',
            content: `## Combining Result Sets

### UNION — Combine Unique Rows

\`\`\`sql
-- All people in the system (staff + clients)
SELECT first_name, last_name, 'Staff' AS type FROM staff
UNION
SELECT first_name, last_name, 'Client' AS type FROM clients
ORDER BY last_name;
\`\`\`

### UNION ALL — Include Duplicates

\`UNION ALL\` keeps duplicates and is faster:

\`\`\`sql
SELECT city FROM clients
UNION ALL
SELECT location FROM departments;
\`\`\`

### INTERSECT — Rows in Both

\`\`\`sql
-- Cities that are both client cities AND department locations
SELECT city FROM clients
INTERSECT
SELECT location FROM departments;
\`\`\`

### EXCEPT — Rows in First But Not Second

\`\`\`sql
-- Client cities with no department located there
SELECT DISTINCT city FROM clients
EXCEPT
SELECT location FROM departments;
\`\`\`

### Rules
- All SELECTs must have the **same number of columns**
- Column types should be compatible
- Column names come from the **first** SELECT`,
            exampleQueries: [
                { label: 'All people (staff + clients)', sql: "SELECT first_name, last_name, 'Staff' AS type FROM staff\nUNION\nSELECT first_name, last_name, 'Client' AS type FROM clients\nORDER BY last_name\nLIMIT 20;" },
                { label: 'Cities in both tables', sql: "SELECT DISTINCT city FROM clients\nINTERSECT\nSELECT location FROM departments;" },
                { label: 'Client cities without a dept', sql: "SELECT DISTINCT city FROM clients\nEXCEPT\nSELECT location FROM departments\nORDER BY city;" }
            ]
        },
        {
            lessonId: 5,
            title: 'Exercise: Monthly Revenue Report',
            type: 'exercise',
            content: `## Exercise: Revenue by Month with Comparison

Build a monthly revenue report showing each month's total and the change from the previous month.`,
            exercise: {
                prompt: 'Show each month (STRFTIME(\'%Y-%m\', invoice_date) as "month"), the total revenue as "revenue" (ROUND to 2), and the previous month\'s revenue as "prev_month" using LAG. Sort by month ascending.',
                startingCode: '-- Monthly revenue with month-over-month comparison\n',
                expectedQuery: "WITH monthly AS (\n    SELECT STRFTIME('%Y-%m', invoice_date) AS month,\n           ROUND(SUM(amount), 2) AS revenue\n    FROM invoices\n    WHERE status = 'paid'\n    GROUP BY month\n)\nSELECT month, revenue,\n       LAG(revenue) OVER (ORDER BY month) AS prev_month\nFROM monthly\nORDER BY month ASC;",
                hints: [
                    'First group invoices by STRFTIME(\'%Y-%m\', invoice_date) to get monthly totals.',
                    'Use a CTE for monthly totals, then apply LAG(revenue) OVER (ORDER BY month) in the outer SELECT.',
                    "WITH monthly AS (\n    SELECT STRFTIME('%Y-%m', invoice_date) AS month,\n           ROUND(SUM(amount), 2) AS revenue\n    FROM invoices\n    WHERE status = 'paid'\n    GROUP BY month\n)\nSELECT month, revenue,\n       LAG(revenue) OVER (ORDER BY month) AS prev_month\nFROM monthly\nORDER BY month ASC;"
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 6,
            title: 'Exercise: Appointment Status Dashboard',
            type: 'exercise',
            content: `## Exercise: Status Pivot Table

Create a dashboard view that pivots appointment statuses into columns per month.`,
            exercise: {
                prompt: 'For each month (STRFTIME(\'%Y-%m\', appointment_date) as "month"), show the count of completed, scheduled, cancelled, and no-show appointments as separate columns. Use CASE expressions inside COUNT. Sort by month ascending.',
                startingCode: '-- Appointment status dashboard\n',
                expectedQuery: "SELECT STRFTIME('%Y-%m', appointment_date) AS month,\n       COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,\n       COUNT(CASE WHEN status = 'scheduled' THEN 1 END) AS scheduled,\n       COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled,\n       COUNT(CASE WHEN status = 'no-show' THEN 1 END) AS no_show\nFROM appointments\nGROUP BY month\nORDER BY month ASC;",
                hints: [
                    'GROUP BY STRFTIME(\'%Y-%m\', appointment_date). Use COUNT(CASE WHEN status = \'completed\' THEN 1 END) for each status.',
                    'You need 4 CASE expressions — one for each status value: completed, scheduled, cancelled, no-show.',
                    "SELECT STRFTIME('%Y-%m', appointment_date) AS month,\n       COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,\n       COUNT(CASE WHEN status = 'scheduled' THEN 1 END) AS scheduled,\n       COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled,\n       COUNT(CASE WHEN status = 'no-show' THEN 1 END) AS no_show\nFROM appointments\nGROUP BY month\nORDER BY month ASC;"
                ],
                orderMatters: true
            }
        }
    ]
};
