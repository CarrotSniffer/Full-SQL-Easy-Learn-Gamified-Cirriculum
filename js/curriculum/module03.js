// Module 3 — Sorting and Limiting (Medical Spa context)
const MODULE_03 = {
    moduleId: 3,
    title: 'Sorting and Limiting',
    level: 'beginner',
    description: 'Control the order and number of results with ORDER BY, LIMIT, and OFFSET.',
    lessons: [
        {
            lessonId: 1,
            title: 'ORDER BY',
            type: 'reading',
            content: `## Sorting Results

\`ORDER BY\` sorts your results:

\`\`\`sql
SELECT treatment_name, price FROM treatments
ORDER BY price DESC;
\`\`\`

- \`ASC\` — ascending (default, smallest first)
- \`DESC\` — descending (largest first)

### Multiple Sort Columns

\`\`\`sql
-- Sort staff by department, then by hourly rate (highest first)
SELECT first_name, last_name, department_id, hourly_rate
FROM staff
ORDER BY department_id ASC, hourly_rate DESC;
\`\`\`

### Sorting by Column Position

You can use column numbers instead of names:

\`\`\`sql
SELECT first_name, last_name, hourly_rate
FROM staff ORDER BY 3 DESC;  -- sorts by hourly_rate
\`\`\`

### NULL Sorting

NULLs sort **last** in ASC and **first** in DESC in SQLite.`,
            exampleQueries: [
                { label: 'Most expensive treatments', sql: 'SELECT treatment_name, price FROM treatments ORDER BY price DESC;' },
                { label: 'Staff by hire date', sql: 'SELECT first_name, last_name, hire_date FROM staff ORDER BY hire_date;' },
                { label: 'Clients by signup (newest)', sql: 'SELECT first_name, last_name, signup_date, city FROM clients ORDER BY signup_date DESC LIMIT 15;' }
            ]
        },
        {
            lessonId: 2,
            title: 'LIMIT and OFFSET',
            type: 'reading',
            content: `## Limiting Results

\`LIMIT\` restricts how many rows are returned:

\`\`\`sql
-- Top 5 most expensive treatments
SELECT treatment_name, price FROM treatments
ORDER BY price DESC LIMIT 5;
\`\`\`

## Pagination with OFFSET

\`OFFSET\` skips a number of rows — useful for pagination:

\`\`\`sql
-- Page 1 (first 10)
SELECT * FROM clients ORDER BY client_id LIMIT 10 OFFSET 0;

-- Page 2 (next 10)
SELECT * FROM clients ORDER BY client_id LIMIT 10 OFFSET 10;
\`\`\`

### Practical Use Case: "Top N" Reports

\`\`\`sql
-- 5 highest-paid staff members
SELECT first_name, last_name, role, hourly_rate
FROM staff
ORDER BY hourly_rate DESC
LIMIT 5;

-- 3 most recent client signups
SELECT first_name, last_name, signup_date
FROM clients
ORDER BY signup_date DESC
LIMIT 3;
\`\`\``,
            exampleQueries: [
                { label: 'Top 5 pricey treatments', sql: 'SELECT treatment_name, price FROM treatments ORDER BY price DESC LIMIT 5;' },
                { label: 'Top 5 paid staff', sql: 'SELECT first_name, last_name, role, hourly_rate FROM staff ORDER BY hourly_rate DESC LIMIT 5;' },
                { label: 'Newest 5 clients', sql: 'SELECT first_name, last_name, city, signup_date FROM clients ORDER BY signup_date DESC LIMIT 5;' }
            ]
        },
        {
            lessonId: 3,
            title: 'SQL Execution Order',
            type: 'reading',
            content: `## How SQL Processes Your Query

SQL clauses are **written** in one order but **executed** in another:

| Execution Order | Clause | Purpose |
|----------------|--------|---------|
| 1 | \`FROM\` | Choose the table |
| 2 | \`WHERE\` | Filter rows |
| 3 | \`GROUP BY\` | Group rows (covered later) |
| 4 | \`HAVING\` | Filter groups (covered later) |
| 5 | \`SELECT\` | Choose columns & compute |
| 6 | \`DISTINCT\` | Remove duplicates |
| 7 | \`ORDER BY\` | Sort results |
| 8 | \`LIMIT/OFFSET\` | Restrict output |

### Why This Matters

You **cannot** use a column alias from SELECT in WHERE, because WHERE runs before SELECT:

\`\`\`sql
-- WRONG: alias not available in WHERE
SELECT hourly_rate * 2080 AS annual_salary FROM staff
WHERE annual_salary > 80000;

-- RIGHT: repeat the expression
SELECT hourly_rate * 2080 AS annual_salary FROM staff
WHERE hourly_rate * 2080 > 80000;
\`\`\`

But you **can** use aliases in ORDER BY because it runs after SELECT:

\`\`\`sql
-- OK: alias available in ORDER BY
SELECT hourly_rate * 2080 AS annual_salary FROM staff
ORDER BY annual_salary DESC;
\`\`\``,
            exampleQueries: [
                { label: 'Alias in ORDER BY', sql: 'SELECT first_name, last_name, hourly_rate * 2080 AS annual_salary FROM staff ORDER BY annual_salary DESC LIMIT 10;' },
                { label: 'Expression in WHERE', sql: 'SELECT first_name, last_name, hourly_rate, hourly_rate * 2080 AS annual_salary FROM staff WHERE hourly_rate * 2080 > 100000;' }
            ]
        },
        {
            lessonId: 4,
            title: 'Use Case: Staff Payroll Preview',
            type: 'reading',
            content: `## Real Scenario: Payroll Preview Report

The office manager runs payroll every two weeks and needs to preview staff compensation sorted by department.

### Computed Annual Salary

Staff hourly rates can be projected to annual salary (assuming 2,080 work hours/year):

\`\`\`sql
SELECT first_name || ' ' || last_name AS staff_name,
       role,
       hourly_rate,
       ROUND(hourly_rate * 2080, 2) AS annual_salary
FROM staff
ORDER BY department_id, annual_salary DESC;
\`\`\`

### Paginated Reports

When exporting data in batches (e.g., 10 staff per page for printing):

\`\`\`sql
-- Page 1
SELECT first_name, last_name, role, hourly_rate
FROM staff ORDER BY last_name LIMIT 10 OFFSET 0;

-- Page 2
SELECT first_name, last_name, role, hourly_rate
FROM staff ORDER BY last_name LIMIT 10 OFFSET 10;
\`\`\`

### Common Mistake: Alias in WHERE

Remember — you can't filter by an alias because WHERE runs before SELECT:

\`\`\`sql
-- This WON'T work:
SELECT hourly_rate * 2080 AS annual_salary FROM staff
WHERE annual_salary > 80000;

-- This WILL work:
SELECT hourly_rate * 2080 AS annual_salary FROM staff
WHERE hourly_rate * 2080 > 80000
ORDER BY annual_salary DESC;
\`\`\``,
            exampleQueries: [
                { label: 'Staff payroll preview', sql: "SELECT first_name || ' ' || last_name AS staff_name, role, hourly_rate, ROUND(hourly_rate * 2080, 2) AS annual_salary FROM staff ORDER BY department_id, annual_salary DESC;" },
                { label: 'Page 1 of staff list', sql: 'SELECT first_name, last_name, role, hourly_rate FROM staff ORDER BY last_name LIMIT 10 OFFSET 0;' },
                { label: 'High earners (>$100k)', sql: 'SELECT first_name, last_name, role, ROUND(hourly_rate * 2080, 2) AS annual_salary FROM staff WHERE hourly_rate * 2080 > 100000 ORDER BY annual_salary DESC;' }
            ]
        },
        {
            lessonId: 5,
            title: 'Exercise: Sorting & Limiting',
            type: 'exercise',
            content: `## Exercise: Top Treatments Report

Create a report that your spa manager might actually use!`,
            exercise: {
                prompt: 'Find the **10 most expensive treatments**. Return treatment_name, category, and price. Sort by price descending.',
                startingCode: '-- Top 10 most expensive treatments\n',
                expectedQuery: 'SELECT treatment_name, category, price FROM treatments ORDER BY price DESC LIMIT 10;',
                hints: [
                    'Select the three columns from treatments, then use ORDER BY and LIMIT.',
                    'ORDER BY price DESC to get most expensive first, then LIMIT 10.',
                    'SELECT treatment_name, category, price FROM treatments ORDER BY price DESC LIMIT 10;'
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 6,
            title: 'Exercise: Newest Clients Report',
            type: 'exercise',
            content: `## Exercise: Recent Signups

The front desk manager wants to see who signed up most recently so they can send welcome emails.`,
            exercise: {
                prompt: 'Show the **5 most recently signed-up clients**. Return first_name, last_name, city, and signup_date. Sort by signup_date descending.',
                startingCode: '-- 5 most recent client signups\n',
                expectedQuery: 'SELECT first_name, last_name, city, signup_date FROM clients ORDER BY signup_date DESC LIMIT 5;',
                hints: [
                    'SELECT the four columns FROM clients, then ORDER BY signup_date DESC.',
                    'Add LIMIT 5 at the end to get only the 5 most recent.',
                    'SELECT first_name, last_name, city, signup_date FROM clients ORDER BY signup_date DESC LIMIT 5;'
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 7,
            title: 'Exercise: Staff Salary Rankings',
            type: 'exercise',
            content: `## Exercise: Top Earners

HR needs to see the top 10 staff members ranked by their projected annual salary.`,
            exercise: {
                prompt: 'Show first_name, last_name, role, and a computed column **hourly_rate * 2080** aliased as "annual_salary" for all staff. Sort by annual_salary descending and show only the **top 10**.',
                startingCode: '-- Top 10 staff by annual salary\n',
                expectedQuery: 'SELECT first_name, last_name, role, hourly_rate * 2080 AS annual_salary FROM staff ORDER BY annual_salary DESC LIMIT 10;',
                hints: [
                    'Use hourly_rate * 2080 AS annual_salary in the SELECT clause.',
                    'ORDER BY annual_salary DESC works because ORDER BY runs after SELECT. Add LIMIT 10.',
                    'SELECT first_name, last_name, role, hourly_rate * 2080 AS annual_salary FROM staff ORDER BY annual_salary DESC LIMIT 10;'
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 8,
            title: 'Exercise: Product Catalog Pagination',
            type: 'exercise',
            content: `## Exercise: Website Product Pages

The spa's website displays 5 products per page. Build the query for page 3.`,
            exercise: {
                prompt: 'Write a query for **page 3** of the product catalog (items 11-15). Return product_name, brand, and price from products. Sort by product_name ascending. Use LIMIT 5 and OFFSET 10.',
                startingCode: '-- Product catalog, page 3\n',
                expectedQuery: 'SELECT product_name, brand, price FROM products ORDER BY product_name ASC LIMIT 5 OFFSET 10;',
                hints: [
                    'Page 3 with 5 items per page means OFFSET 10 (skip pages 1 and 2 = 10 items).',
                    'SELECT product_name, brand, price FROM products ORDER BY product_name ASC LIMIT 5 OFFSET 10;',
                    'SELECT product_name, brand, price FROM products ORDER BY product_name ASC LIMIT 5 OFFSET 10;'
                ],
                orderMatters: true
            }
        }
    ]
};
