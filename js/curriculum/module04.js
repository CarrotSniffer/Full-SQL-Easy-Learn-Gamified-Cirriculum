// Module 4 — Aggregate Functions & GROUP BY (Medical Spa context)
const MODULE_04 = {
    moduleId: 4,
    title: 'Aggregate Functions & GROUP BY',
    level: 'intermediate',
    description: 'Summarize data with COUNT, SUM, AVG, MIN, MAX and group results for reports.',
    lessons: [
        {
            lessonId: 1,
            title: 'Aggregate Functions',
            type: 'reading',
            content: `## Summarizing Data

Aggregate functions compute a single value from multiple rows:

| Function | Purpose | Example |
|----------|---------|---------||
| \`COUNT(*)\` | Count all rows | How many clients? |
| \`COUNT(col)\` | Count non-NULL values | Clients with emails? |
| \`SUM(col)\` | Total | Total revenue |
| \`AVG(col)\` | Average | Average treatment price |
| \`MIN(col)\` | Smallest | Cheapest treatment |
| \`MAX(col)\` | Largest | Most expensive treatment |

### Math Functions

| Function | Purpose |
|----------|---------|
| \`ROUND(value, decimals)\` | Round to N decimal places |
| \`ABS(value)\` | Absolute value |

### Examples

\`\`\`sql
-- How many staff members?
SELECT COUNT(*) AS total_staff FROM staff;

-- Average treatment price
SELECT ROUND(AVG(price), 2) AS avg_price FROM treatments;

-- Price range
SELECT MIN(price) AS cheapest, MAX(price) AS most_expensive
FROM treatments;
\`\`\`

### COUNT(*) vs COUNT(column)

- \`COUNT(*)\` counts **all** rows including NULLs
- \`COUNT(email)\` counts only rows where email **is not NULL**

\`\`\`sql
SELECT COUNT(*) AS total_clients,
       COUNT(email) AS with_email,
       COUNT(*) - COUNT(email) AS missing_email
FROM clients;
\`\`\``,
            exampleQueries: [
                { label: 'Treatment stats', sql: 'SELECT COUNT(*) AS total, ROUND(AVG(price), 2) AS avg_price, MIN(price) AS cheapest, MAX(price) AS priciest FROM treatments;' },
                { label: 'Client email coverage', sql: 'SELECT COUNT(*) AS total, COUNT(email) AS has_email, COUNT(*) - COUNT(email) AS missing_email FROM clients;' },
                { label: 'Staff pay stats', sql: 'SELECT ROUND(AVG(hourly_rate), 2) AS avg_rate, MIN(hourly_rate) AS min_rate, MAX(hourly_rate) AS max_rate FROM staff;' }
            ]
        },
        {
            lessonId: 2,
            title: 'GROUP BY',
            type: 'reading',
            content: `## Grouping Results

\`GROUP BY\` splits rows into groups and applies aggregates to each group:

\`\`\`sql
-- Count staff per role
SELECT role, COUNT(*) AS headcount
FROM staff
GROUP BY role
ORDER BY headcount DESC;
\`\`\`

### The Golden Rule

Every column in SELECT must either be:
1. In the \`GROUP BY\` clause, OR
2. Inside an aggregate function

\`\`\`sql
-- Average treatment price per category
SELECT category,
       COUNT(*) AS num_treatments,
       ROUND(AVG(price), 2) AS avg_price,
       MIN(price) AS cheapest,
       MAX(price) AS priciest
FROM treatments
GROUP BY category
ORDER BY avg_price DESC;
\`\`\`

### GROUP BY with Multiple Columns

\`\`\`sql
-- Client count by city and referral source
SELECT city, referral_source, COUNT(*) AS client_count
FROM clients
GROUP BY city, referral_source
ORDER BY client_count DESC;
\`\`\``,
            exampleQueries: [
                { label: 'Staff per role', sql: 'SELECT role, COUNT(*) AS headcount FROM staff GROUP BY role ORDER BY headcount DESC;' },
                { label: 'Avg price by category', sql: 'SELECT category, COUNT(*) AS treatments, ROUND(AVG(price), 2) AS avg_price FROM treatments GROUP BY category ORDER BY avg_price DESC;' },
                { label: 'Clients per city', sql: 'SELECT city, COUNT(*) AS num_clients FROM clients GROUP BY city ORDER BY num_clients DESC;' }
            ]
        },
        {
            lessonId: 3,
            title: 'HAVING — Filtering Groups',
            type: 'reading',
            content: `## HAVING vs WHERE

- \`WHERE\` filters **individual rows** (before grouping)
- \`HAVING\` filters **groups** (after grouping)

\`\`\`sql
-- Cities with more than 5 clients
SELECT city, COUNT(*) AS num_clients
FROM clients
GROUP BY city
HAVING COUNT(*) > 5
ORDER BY num_clients DESC;
\`\`\`

### Combining WHERE and HAVING

\`\`\`sql
-- Treatment categories with avg price > $300,
-- only considering treatments that cost at least $100
SELECT category,
       COUNT(*) AS treatments,
       ROUND(AVG(price), 2) AS avg_price
FROM treatments
WHERE price >= 100
GROUP BY category
HAVING AVG(price) > 300
ORDER BY avg_price DESC;
\`\`\`

Remember the execution order: WHERE runs first (filters rows), then GROUP BY groups them, then HAVING filters the groups.

### GROUP_CONCAT — Aggregating Text

\`GROUP_CONCAT\` combines values from multiple rows into a single string:

\`\`\`sql
SELECT category, GROUP_CONCAT(treatment_name, ', ') AS treatments
FROM treatments
GROUP BY category;
\`\`\``,
            exampleQueries: [
                { label: 'Popular cities (5+ clients)', sql: 'SELECT city, COUNT(*) AS num_clients FROM clients GROUP BY city HAVING COUNT(*) > 5 ORDER BY num_clients DESC;' },
                { label: 'Pricey categories', sql: 'SELECT category, ROUND(AVG(price), 2) AS avg_price FROM treatments GROUP BY category HAVING AVG(price) > 300 ORDER BY avg_price DESC;' },
                { label: 'Treatments per category', sql: "SELECT category, GROUP_CONCAT(treatment_name, ', ') AS treatment_list FROM treatments GROUP BY category;" }
            ]
        },
        {
            lessonId: 4,
            title: 'Use Case: Monthly Business Dashboard',
            type: 'reading',
            content: `## Real Scenario: Monthly Business Dashboard

The spa owner wants a monthly snapshot showing key business metrics grouped by different dimensions.

### Revenue by Payment Method

\`\`\`sql
SELECT payment_method,
       COUNT(*) AS num_invoices,
       ROUND(SUM(amount), 2) AS total_revenue,
       ROUND(AVG(amount), 2) AS avg_invoice
FROM invoices
WHERE status = 'paid'
GROUP BY payment_method
ORDER BY total_revenue DESC;
\`\`\`

### Appointments by Status

\`\`\`sql
SELECT status, COUNT(*) AS count
FROM appointments
GROUP BY status
ORDER BY count DESC;
\`\`\`

### Product Sales by Brand

\`\`\`sql
SELECT p.brand,
       COUNT(ps.sale_id) AS units_sold,
       ROUND(SUM(ps.quantity * ps.unit_price), 2) AS revenue
FROM product_sales ps
JOIN products p ON ps.product_id = p.product_id
GROUP BY p.brand
ORDER BY revenue DESC;
\`\`\`

These aggregated views give the owner a clear picture of business health at a glance.`,
            exampleQueries: [
                { label: 'Revenue by payment method', sql: "SELECT payment_method, COUNT(*) AS num_invoices, ROUND(SUM(amount), 2) AS total_revenue, ROUND(AVG(amount), 2) AS avg_invoice FROM invoices WHERE status = 'paid' GROUP BY payment_method ORDER BY total_revenue DESC;" },
                { label: 'Appointments by status', sql: 'SELECT status, COUNT(*) AS count FROM appointments GROUP BY status ORDER BY count DESC;' },
                { label: 'Top product brands', sql: 'SELECT p.brand, COUNT(ps.sale_id) AS units_sold, ROUND(SUM(ps.quantity * ps.unit_price), 2) AS revenue FROM product_sales ps JOIN products p ON ps.product_id = p.product_id GROUP BY p.brand ORDER BY revenue DESC;' }
            ]
        },
        {
            lessonId: 5,
            title: 'Exercise: Product Sales Summary',
            type: 'exercise',
            content: `## Exercise: Brand Performance Report

The inventory manager wants a quick overview of how many products each brand carries and their average price point.`,
            exercise: {
                prompt: 'Show each **brand** from the products table, the COUNT of products as "num_products", and the ROUND(AVG(price), 2) as "avg_price". Sort by num_products descending.',
                startingCode: '-- Brand product summary\n',
                expectedQuery: 'SELECT brand, COUNT(*) AS num_products, ROUND(AVG(price), 2) AS avg_price FROM products GROUP BY brand ORDER BY num_products DESC;',
                hints: [
                    'GROUP BY brand, then use COUNT(*) and ROUND(AVG(price), 2).',
                    'SELECT brand, COUNT(*) AS num_products, ROUND(AVG(price), 2) AS avg_price FROM products GROUP BY brand',
                    'SELECT brand, COUNT(*) AS num_products, ROUND(AVG(price), 2) AS avg_price FROM products GROUP BY brand ORDER BY num_products DESC;'
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 6,
            title: 'Exercise: Spa Reports',
            type: 'exercise',
            content: `## Exercise: Staff Department Report

Build a summary report that a spa manager would use.`,
            exercise: {
                prompt: 'Show the **average hourly rate** for each **department** (using department_id). Only include departments with **3 or more staff**. Show department_id, staff count as "headcount", and ROUND the average rate to 2 decimals as "avg_rate". Sort by avg_rate descending.',
                startingCode: '-- Department staffing and pay report\n',
                expectedQuery: 'SELECT department_id, COUNT(*) AS headcount, ROUND(AVG(hourly_rate), 2) AS avg_rate FROM staff GROUP BY department_id HAVING COUNT(*) >= 3 ORDER BY avg_rate DESC;',
                hints: [
                    'GROUP BY department_id, then use COUNT(*) and ROUND(AVG(hourly_rate), 2).',
                    'Use HAVING COUNT(*) >= 3 to filter departments with 3+ staff.',
                    'SELECT department_id, COUNT(*) AS headcount, ROUND(AVG(hourly_rate), 2) AS avg_rate FROM staff GROUP BY department_id HAVING COUNT(*) >= 3 ORDER BY avg_rate DESC;'
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 7,
            title: 'Exercise: Treatment Category Analysis',
            type: 'exercise',
            content: `## Exercise: Category Price Analysis

Analyze treatment pricing across categories.`,
            exercise: {
                prompt: 'For each treatment **category**, show the number of treatments (as "num_treatments"), the minimum price (as "min_price"), and the maximum price (as "max_price"). Only show categories with **more than 2 treatments**. Sort by num_treatments descending.',
                startingCode: '-- Treatment category analysis\n',
                expectedQuery: 'SELECT category, COUNT(*) AS num_treatments, MIN(price) AS min_price, MAX(price) AS max_price FROM treatments GROUP BY category HAVING COUNT(*) > 2 ORDER BY num_treatments DESC;',
                hints: [
                    'GROUP BY category, then use COUNT(*), MIN(price), and MAX(price).',
                    'HAVING COUNT(*) > 2 filters to categories with 3+ treatments.',
                    'SELECT category, COUNT(*) AS num_treatments, MIN(price) AS min_price, MAX(price) AS max_price FROM treatments GROUP BY category HAVING COUNT(*) > 2 ORDER BY num_treatments DESC;'
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 8,
            title: 'Exercise: Revenue by Payment Method',
            type: 'exercise',
            content: `## Exercise: Accountant's Payment Breakdown

The accountant needs to see how revenue breaks down by payment method, but only for methods used frequently.`,
            exercise: {
                prompt: 'Show each **payment_method** from invoices (WHERE status = \'paid\'), the COUNT as "num_invoices", SUM(amount) ROUNDed to 2 as "total_revenue", and AVG(amount) ROUNDed to 2 as "avg_invoice". Only include payment methods with **more than 5 invoices**. Sort by total_revenue descending.',
                startingCode: '-- Payment method revenue breakdown\n',
                expectedQuery: "SELECT payment_method, COUNT(*) AS num_invoices, ROUND(SUM(amount), 2) AS total_revenue, ROUND(AVG(amount), 2) AS avg_invoice FROM invoices WHERE status = 'paid' GROUP BY payment_method HAVING COUNT(*) > 5 ORDER BY total_revenue DESC;",
                hints: [
                    'Start with WHERE status = \'paid\' to filter rows, then GROUP BY payment_method.',
                    'Use HAVING COUNT(*) > 5 after GROUP BY. Remember: WHERE filters rows, HAVING filters groups.',
                    "SELECT payment_method, COUNT(*) AS num_invoices, ROUND(SUM(amount), 2) AS total_revenue, ROUND(AVG(amount), 2) AS avg_invoice FROM invoices WHERE status = 'paid' GROUP BY payment_method HAVING COUNT(*) > 5 ORDER BY total_revenue DESC;"
                ],
                orderMatters: true
            }
        }
    ]
};
