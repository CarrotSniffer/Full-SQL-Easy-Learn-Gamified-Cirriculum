// Module 10 — Window Functions (Medical Spa context)
const MODULE_10 = {
    moduleId: 10,
    title: 'Window Functions',
    level: 'advanced',
    description: 'Rank, compare, and compute running totals without collapsing rows.',
    lessons: [
        {
            lessonId: 1,
            title: 'Introduction to Window Functions',
            type: 'reading',
            content: `## What Are Window Functions?

Window functions perform calculations across a set of rows **related to the current row** — without collapsing them like GROUP BY does.

\`\`\`sql
SELECT treatment_name, category, price,
       AVG(price) OVER (PARTITION BY category) AS category_avg
FROM treatments
ORDER BY category, price DESC;
\`\`\`

Each row keeps its own data **plus** gets the category average alongside it.

### Syntax

\`\`\`sql
function_name() OVER (
    PARTITION BY column     -- groups (optional)
    ORDER BY column         -- sort within group (optional)
)
\`\`\`

### Window vs GROUP BY

| GROUP BY | Window Function |
|----------|----------------|
| Collapses rows into groups | Keeps every row |
| One result per group | Result added to each row |
| Must aggregate non-grouped cols | No restriction |`,
            exampleQueries: [
                { label: 'Price vs category average', sql: 'SELECT treatment_name, category, price,\n       ROUND(AVG(price) OVER (PARTITION BY category), 2) AS category_avg,\n       ROUND(price - AVG(price) OVER (PARTITION BY category), 2) AS diff\nFROM treatments\nORDER BY category, price DESC;' },
                { label: 'Running total of invoices', sql: "SELECT invoice_id, invoice_date, amount,\n       ROUND(SUM(amount) OVER (ORDER BY invoice_date), 2) AS running_total\nFROM invoices\nWHERE status = 'paid'\nORDER BY invoice_date\nLIMIT 20;" },
                { label: 'Staff rate vs department avg', sql: "SELECT s.first_name || ' ' || s.last_name AS staff_name,\n       d.department_name, s.hourly_rate,\n       ROUND(AVG(s.hourly_rate) OVER (PARTITION BY s.department_id), 2) AS dept_avg\nFROM staff s\nJOIN departments d ON s.department_id = d.department_id\nORDER BY d.department_name, s.hourly_rate DESC;" }
            ]
        },
        {
            lessonId: 2,
            title: 'ROW_NUMBER, RANK, DENSE_RANK',
            type: 'reading',
            content: `## Ranking Functions

### ROW_NUMBER()

Assigns a unique sequential number — no ties:

\`\`\`sql
SELECT treatment_name, category, price,
       ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rank_in_category
FROM treatments;
\`\`\`

### RANK() and DENSE_RANK()

Handle ties differently:

| Price | ROW_NUMBER | RANK | DENSE_RANK |
|-------|-----------|------|------------|
| 500 | 1 | 1 | 1 |
| 500 | 2 | 1 | 1 |
| 400 | 3 | 3 | 2 |
| 300 | 4 | 4 | 3 |

- \`RANK()\` — Ties get the same rank, then skips
- \`DENSE_RANK()\` — Ties get the same rank, no skip

### Top-N Per Group

\`\`\`sql
-- Top 2 most expensive treatments per category
SELECT * FROM (
    SELECT treatment_name, category, price,
           ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn
    FROM treatments
) WHERE rn <= 2;
\`\`\``,
            exampleQueries: [
                { label: 'Rank treatments per category', sql: 'SELECT treatment_name, category, price,\n       ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS row_num,\n       RANK() OVER (PARTITION BY category ORDER BY price DESC) AS rank,\n       DENSE_RANK() OVER (PARTITION BY category ORDER BY price DESC) AS dense_rank\nFROM treatments\nORDER BY category, price DESC;' },
                { label: 'Top 2 per category', sql: 'SELECT * FROM (\n    SELECT treatment_name, category, price,\n           ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn\n    FROM treatments\n) WHERE rn <= 2\nORDER BY category, price DESC;' },
                { label: 'Rank staff by hourly rate', sql: "SELECT first_name || ' ' || last_name AS staff_name, role, hourly_rate,\n       RANK() OVER (ORDER BY hourly_rate DESC) AS overall_rank,\n       RANK() OVER (PARTITION BY role ORDER BY hourly_rate DESC) AS rank_in_role\nFROM staff\nORDER BY hourly_rate DESC;" }
            ]
        },
        {
            lessonId: 3,
            title: 'LAG, LEAD & Window Frames',
            type: 'reading',
            content: `## LAG and LEAD

Access values from previous or next rows:

\`\`\`sql
-- Compare each invoice amount to the previous one
SELECT invoice_id, invoice_date, amount,
       LAG(amount) OVER (ORDER BY invoice_date) AS prev_amount,
       amount - LAG(amount) OVER (ORDER BY invoice_date) AS change
FROM invoices
ORDER BY invoice_date
LIMIT 15;
\`\`\`

- \`LAG(col, n)\` — value from \`n\` rows before (default 1)
- \`LEAD(col, n)\` — value from \`n\` rows after (default 1)

## Window Frames

Control exactly which rows the window function considers:

\`\`\`sql
-- 3-invoice moving average
SELECT invoice_id, invoice_date, amount,
       ROUND(AVG(amount) OVER (
           ORDER BY invoice_date
           ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
       ), 2) AS moving_avg_3
FROM invoices
ORDER BY invoice_date
LIMIT 20;
\`\`\`

### Frame Options

| Frame | Meaning |
|-------|---------|
| \`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\` | Current + 2 before |
| \`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\` | All rows up to current (running total) |
| \`ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING\` | Current + 1 before + 1 after |`,
            exampleQueries: [
                { label: 'Invoice amount changes (LAG)', sql: 'SELECT invoice_id, invoice_date, amount,\n       LAG(amount) OVER (ORDER BY invoice_date) AS prev_amount,\n       ROUND(amount - LAG(amount) OVER (ORDER BY invoice_date), 2) AS change\nFROM invoices\nORDER BY invoice_date\nLIMIT 15;' },
                { label: '3-invoice moving average', sql: 'SELECT invoice_id, invoice_date, amount,\n       ROUND(AVG(amount) OVER (\n           ORDER BY invoice_date\n           ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n       ), 2) AS moving_avg\nFROM invoices\nORDER BY invoice_date\nLIMIT 20;' },
                { label: 'Running revenue total', sql: "SELECT invoice_date, amount,\n       ROUND(SUM(amount) OVER (\n           ORDER BY invoice_date\n           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n       ), 2) AS running_total\nFROM invoices\nWHERE status = 'paid'\nORDER BY invoice_date\nLIMIT 20;" }
            ]
        },
        {
            lessonId: 4,
            title: 'Exercise: Provider Revenue Ranking',
            type: 'exercise',
            content: `## Exercise: Rank Providers by Revenue

Rank each staff member by the total revenue they've generated from completed appointments.`,
            exercise: {
                prompt: 'Show each provider\'s full name (first_name || \' \' || last_name) as "provider", their total revenue from completed appointments as "total_revenue" (ROUND to 2), and their RANK by total_revenue descending as "revenue_rank". Use a window function for ranking. Sort by revenue_rank ascending.',
                startingCode: '-- Provider revenue ranking\n',
                expectedQuery: "SELECT s.first_name || ' ' || s.last_name AS provider,\n       ROUND(SUM(t.price), 2) AS total_revenue,\n       RANK() OVER (ORDER BY SUM(t.price) DESC) AS revenue_rank\nFROM appointments a\nJOIN staff s ON a.staff_id = s.staff_id\nJOIN treatments t ON a.treatment_id = t.treatment_id\nWHERE a.status = 'completed'\nGROUP BY s.staff_id\nORDER BY revenue_rank ASC;",
                hints: [
                    'JOIN appointments, staff, and treatments. Filter completed. GROUP BY s.staff_id.',
                    'Use RANK() OVER (ORDER BY SUM(t.price) DESC) as the ranking window function.',
                    "SELECT s.first_name || ' ' || s.last_name AS provider,\n       ROUND(SUM(t.price), 2) AS total_revenue,\n       RANK() OVER (ORDER BY SUM(t.price) DESC) AS revenue_rank\nFROM appointments a\nJOIN staff s ON a.staff_id = s.staff_id\nJOIN treatments t ON a.treatment_id = t.treatment_id\nWHERE a.status = 'completed'\nGROUP BY s.staff_id\nORDER BY revenue_rank ASC;"
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 5,
            title: 'Exercise: Top Treatment Per Category',
            type: 'exercise',
            content: `## Exercise: Most Expensive Treatment Per Category

Use ROW_NUMBER to find the single most expensive treatment in each category.`,
            exercise: {
                prompt: 'Use ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) to rank treatments within each category. Show only the #1 treatment per category. Display treatment_name, category, and price. Sort by price descending.',
                startingCode: '-- Top treatment per category\n',
                expectedQuery: "SELECT treatment_name, category, price FROM (\n    SELECT treatment_name, category, price,\n           ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn\n    FROM treatments\n) WHERE rn = 1\nORDER BY price DESC;",
                hints: [
                    'Use a subquery: SELECT ... ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn FROM treatments',
                    'Wrap it: SELECT treatment_name, category, price FROM (...) WHERE rn = 1',
                    "SELECT treatment_name, category, price FROM (\n    SELECT treatment_name, category, price,\n           ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn\n    FROM treatments\n) WHERE rn = 1\nORDER BY price DESC;"
                ],
                orderMatters: true
            }
        }
    ]
};
