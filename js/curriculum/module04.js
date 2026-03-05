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
|----------|---------|---------|
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
            lessonId: 5,
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
        }
    ]
};
