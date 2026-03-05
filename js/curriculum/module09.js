// Module 9 — CTEs / Common Table Expressions (Medical Spa context)
const MODULE_09 = {
    moduleId: 9,
    title: 'Common Table Expressions (CTEs)',
    level: 'advanced',
    description: 'Write cleaner queries with WITH clauses, chain CTEs, and explore recursive queries.',
    lessons: [
        {
            lessonId: 1,
            title: 'Introduction to CTEs',
            type: 'reading',
            content: `## What Is a CTE?

A Common Table Expression (CTE) is a temporary named result set defined with \`WITH\`:

\`\`\`sql
WITH high_value_treatments AS (
    SELECT treatment_name, category, price
    FROM treatments
    WHERE price > 500
)
SELECT * FROM high_value_treatments
ORDER BY price DESC;
\`\`\`

### Why CTEs?

- **Readability** — Name each step of your logic
- **Reusability** — Reference the same CTE multiple times
- **Organization** — Break complex queries into logical blocks

### CTE vs Subquery

These are equivalent, but the CTE version is easier to read:

\`\`\`sql
-- Subquery version
SELECT * FROM (
    SELECT client_id, COUNT(*) AS visits
    FROM appointments GROUP BY client_id
) WHERE visits >= 5;

-- CTE version
WITH client_visits AS (
    SELECT client_id, COUNT(*) AS visits
    FROM appointments GROUP BY client_id
)
SELECT * FROM client_visits WHERE visits >= 5;
\`\`\``,
            exampleQueries: [
                { label: 'High-value treatments', sql: 'WITH high_value AS (\n    SELECT treatment_name, category, price\n    FROM treatments\n    WHERE price > 500\n)\nSELECT * FROM high_value ORDER BY price DESC;' },
                { label: 'Frequent visitors (5+)', sql: "WITH client_visits AS (\n    SELECT client_id, COUNT(*) AS visits\n    FROM appointments\n    GROUP BY client_id\n)\nSELECT c.first_name || ' ' || c.last_name AS client, cv.visits\nFROM client_visits cv\nJOIN clients c ON cv.client_id = c.client_id\nWHERE cv.visits >= 5\nORDER BY cv.visits DESC;" },
                { label: 'Revenue by category', sql: "WITH category_revenue AS (\n    SELECT t.category, ROUND(SUM(t.price), 2) AS revenue\n    FROM appointments a\n    JOIN treatments t ON a.treatment_id = t.treatment_id\n    WHERE a.status = 'completed'\n    GROUP BY t.category\n)\nSELECT * FROM category_revenue ORDER BY revenue DESC;" }
            ]
        },
        {
            lessonId: 2,
            title: 'Multiple CTEs',
            type: 'reading',
            content: `## Chaining Multiple CTEs

Separate CTEs with commas. Later CTEs can reference earlier ones:

\`\`\`sql
WITH provider_stats AS (
    SELECT s.staff_id,
           s.first_name || ' ' || s.last_name AS provider,
           COUNT(*) AS total_appointments,
           ROUND(SUM(t.price), 2) AS total_revenue
    FROM appointments a
    JOIN staff s ON a.staff_id = s.staff_id
    JOIN treatments t ON a.treatment_id = t.treatment_id
    WHERE a.status = 'completed'
    GROUP BY s.staff_id
),
avg_stats AS (
    SELECT ROUND(AVG(total_appointments), 1) AS avg_appts,
           ROUND(AVG(total_revenue), 2) AS avg_revenue
    FROM provider_stats
)
SELECT ps.provider,
       ps.total_appointments,
       ps.total_revenue,
       CASE WHEN ps.total_revenue > as2.avg_revenue
            THEN 'Above Average' ELSE 'Below Average' END AS performance
FROM provider_stats ps, avg_stats as2
ORDER BY ps.total_revenue DESC;
\`\`\`

### Pattern: Build -> Aggregate -> Compare

1. First CTE: raw data grouped by entity
2. Second CTE: compute averages/totals from first
3. Final SELECT: join them to compare`,
            exampleQueries: [
                { label: 'Provider performance vs avg', sql: "WITH provider_stats AS (\n    SELECT s.staff_id, s.first_name || ' ' || s.last_name AS provider,\n           COUNT(*) AS appts, ROUND(SUM(t.price), 2) AS revenue\n    FROM appointments a\n    JOIN staff s ON a.staff_id = s.staff_id\n    JOIN treatments t ON a.treatment_id = t.treatment_id\n    WHERE a.status = 'completed'\n    GROUP BY s.staff_id\n),\navg_rev AS (\n    SELECT ROUND(AVG(revenue), 2) AS avg_revenue FROM provider_stats\n)\nSELECT ps.provider, ps.revenue, ar.avg_revenue,\n       CASE WHEN ps.revenue > ar.avg_revenue THEN 'Above' ELSE 'Below' END AS vs_avg\nFROM provider_stats ps, avg_rev ar\nORDER BY ps.revenue DESC;" },
                { label: 'Client tier analysis', sql: "WITH client_spending AS (\n    SELECT c.client_id, c.first_name || ' ' || c.last_name AS client_name,\n           ROUND(SUM(i.amount), 2) AS total_spent\n    FROM clients c\n    JOIN invoices i ON c.client_id = i.client_id\n    GROUP BY c.client_id\n),\ntiers AS (\n    SELECT *, \n           CASE WHEN total_spent >= 2000 THEN 'Platinum'\n                WHEN total_spent >= 1000 THEN 'Gold'\n                ELSE 'Silver' END AS tier\n    FROM client_spending\n)\nSELECT tier, COUNT(*) AS clients, ROUND(AVG(total_spent), 2) AS avg_spend\nFROM tiers GROUP BY tier ORDER BY avg_spend DESC;" }
            ]
        },
        {
            lessonId: 3,
            title: 'Recursive CTEs',
            type: 'reading',
            content: `## Recursive CTEs

A recursive CTE references **itself** to traverse hierarchical data:

\`\`\`sql
WITH RECURSIVE category_tree AS (
    -- Base case: top-level categories (no parent)
    SELECT category_id, category_name, parent_category_id, 0 AS depth
    FROM treatment_categories
    WHERE parent_category_id IS NULL

    UNION ALL

    -- Recursive case: children
    SELECT tc.category_id, tc.category_name, tc.parent_category_id, ct.depth + 1
    FROM treatment_categories tc
    JOIN category_tree ct ON tc.parent_category_id = ct.category_id
)
SELECT * FROM category_tree ORDER BY depth, category_name;
\`\`\`

### How It Works

1. **Base case** runs once — returns the starting rows
2. **Recursive case** runs repeatedly, joining new rows to existing results
3. Stops when the recursive case returns zero new rows

### Staff Org Chart

\`\`\`sql
WITH RECURSIVE org_chart AS (
    SELECT staff_id, first_name || ' ' || last_name AS name,
           role, 0 AS level
    FROM staff WHERE manager_id IS NULL

    UNION ALL

    SELECT s.staff_id, s.first_name || ' ' || s.last_name,
           s.role, oc.level + 1
    FROM staff s
    JOIN org_chart oc ON s.manager_id = oc.staff_id
)
SELECT * FROM org_chart ORDER BY level, name;
\`\`\``,
            exampleQueries: [
                { label: 'Category hierarchy', sql: "WITH RECURSIVE category_tree AS (\n    SELECT category_id, category_name, parent_category_id, 0 AS depth\n    FROM treatment_categories\n    WHERE parent_category_id IS NULL\n    UNION ALL\n    SELECT tc.category_id, tc.category_name, tc.parent_category_id, ct.depth + 1\n    FROM treatment_categories tc\n    JOIN category_tree ct ON tc.parent_category_id = ct.category_id\n)\nSELECT category_id, category_name, depth\nFROM category_tree ORDER BY depth, category_name;" },
                { label: 'Staff org chart', sql: "WITH RECURSIVE org_chart AS (\n    SELECT staff_id, first_name || ' ' || last_name AS name, role, 0 AS level\n    FROM staff WHERE manager_id IS NULL\n    UNION ALL\n    SELECT s.staff_id, s.first_name || ' ' || s.last_name, s.role, oc.level + 1\n    FROM staff s\n    JOIN org_chart oc ON s.manager_id = oc.staff_id\n)\nSELECT * FROM org_chart ORDER BY level, name;" },
                { label: 'Number sequence (1-10)', sql: "WITH RECURSIVE nums AS (\n    SELECT 1 AS n\n    UNION ALL\n    SELECT n + 1 FROM nums WHERE n < 10\n)\nSELECT n FROM nums;" }
            ]
        },
        {
            lessonId: 4,
            title: 'Use Case: Building a Complete Revenue Report',
            type: 'reading',
            content: `## Real Scenario: Department Revenue Comparison

The CFO wants a report showing revenue by department compared to the overall average, flagging departments as "Above Target" or "Below Target."

### Step-by-Step with 3 CTEs

\`\`\`sql
WITH dept_revenue AS (
    -- CTE 1: Revenue per department
    SELECT d.department_name,
           ROUND(SUM(t.price), 2) AS revenue
    FROM appointments a
    JOIN staff s ON a.staff_id = s.staff_id
    JOIN departments d ON s.department_id = d.department_id
    JOIN treatments t ON a.treatment_id = t.treatment_id
    WHERE a.status = 'completed'
    GROUP BY d.department_id
),
avg_revenue AS (
    -- CTE 2: Overall average from CTE 1
    SELECT ROUND(AVG(revenue), 2) AS avg_rev
    FROM dept_revenue
),
comparison AS (
    -- CTE 3: Compare each department
    SELECT dr.department_name,
           dr.revenue,
           ar.avg_rev,
           CASE WHEN dr.revenue >= ar.avg_rev
                THEN 'Above Target' ELSE 'Below Target'
           END AS status
    FROM dept_revenue dr, avg_revenue ar
)
SELECT * FROM comparison
ORDER BY revenue DESC;
\`\`\`

This pattern — Build, Aggregate, Compare — is the backbone of business intelligence reporting.`,
            exampleQueries: [
                { label: 'Department revenue report', sql: "WITH dept_revenue AS (\n    SELECT d.department_name, ROUND(SUM(t.price), 2) AS revenue\n    FROM appointments a\n    JOIN staff s ON a.staff_id = s.staff_id\n    JOIN departments d ON s.department_id = d.department_id\n    JOIN treatments t ON a.treatment_id = t.treatment_id\n    WHERE a.status = 'completed'\n    GROUP BY d.department_id\n),\navg_revenue AS (\n    SELECT ROUND(AVG(revenue), 2) AS avg_rev FROM dept_revenue\n)\nSELECT dr.department_name, dr.revenue, ar.avg_rev,\n       CASE WHEN dr.revenue >= ar.avg_rev THEN 'Above Target' ELSE 'Below Target' END AS status\nFROM dept_revenue dr, avg_revenue ar\nORDER BY dr.revenue DESC;" },
                { label: 'Category revenue breakdown', sql: "WITH cat_rev AS (\n    SELECT t.category, ROUND(SUM(t.price), 2) AS revenue, COUNT(*) AS appointments\n    FROM appointments a\n    JOIN treatments t ON a.treatment_id = t.treatment_id\n    WHERE a.status = 'completed'\n    GROUP BY t.category\n)\nSELECT *, ROUND(revenue * 100.0 / (SELECT SUM(revenue) FROM cat_rev), 1) AS pct_of_total\nFROM cat_rev ORDER BY revenue DESC;" }
            ]
        },
        {
            lessonId: 5,
            title: 'Exercise: Provider Comparison Report',
            type: 'exercise',
            content: `## Exercise: Active Provider Report

Use a CTE to find providers with significant completed appointment volume.`,
            exercise: {
                prompt: 'Write a CTE called "provider_counts" that calculates each staff member\'s full name (first_name || \' \' || last_name) as "provider" and COUNT of completed appointments as "num_completed". Then SELECT from the CTE only providers with more than 5 completed appointments. Sort by num_completed descending.',
                startingCode: '-- Provider comparison report\n',
                expectedQuery: "WITH provider_counts AS (\n    SELECT s.first_name || ' ' || s.last_name AS provider, COUNT(*) AS num_completed\n    FROM appointments a\n    JOIN staff s ON a.staff_id = s.staff_id\n    WHERE a.status = 'completed'\n    GROUP BY s.staff_id\n)\nSELECT provider, num_completed\nFROM provider_counts\nWHERE num_completed > 5\nORDER BY num_completed DESC;",
                hints: [
                    'CTE: WITH provider_counts AS (SELECT ... JOIN staff ... WHERE status = \'completed\' GROUP BY s.staff_id)',
                    'Final SELECT: FROM provider_counts WHERE num_completed > 5 ORDER BY num_completed DESC.',
                    "WITH provider_counts AS (\n    SELECT s.first_name || ' ' || s.last_name AS provider, COUNT(*) AS num_completed\n    FROM appointments a\n    JOIN staff s ON a.staff_id = s.staff_id\n    WHERE a.status = 'completed'\n    GROUP BY s.staff_id\n)\nSELECT provider, num_completed\nFROM provider_counts\nWHERE num_completed > 5\nORDER BY num_completed DESC;"
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 6,
            title: 'Exercise: Client Loyalty Tiers',
            type: 'exercise',
            content: `## Exercise: Client Loyalty Report

Build a report that segments clients into loyalty tiers based on their total spending.`,
            exercise: {
                prompt: 'Using CTEs, calculate each client\'s total invoice amount (as "total_spent"), then assign tiers: \'Platinum\' if >= 2000, \'Gold\' if >= 1000, else \'Silver\'. Show the **tier**, the **count of clients** as "num_clients", and the **average total_spent** as "avg_spend" (ROUND to 2). Sort by avg_spend descending.',
                startingCode: '-- Client loyalty tier report\n',
                expectedQuery: "WITH client_spending AS (\n    SELECT client_id, ROUND(SUM(amount), 2) AS total_spent\n    FROM invoices\n    GROUP BY client_id\n),\ntiers AS (\n    SELECT *,\n           CASE WHEN total_spent >= 2000 THEN 'Platinum'\n                WHEN total_spent >= 1000 THEN 'Gold'\n                ELSE 'Silver' END AS tier\n    FROM client_spending\n)\nSELECT tier, COUNT(*) AS num_clients, ROUND(AVG(total_spent), 2) AS avg_spend\nFROM tiers\nGROUP BY tier\nORDER BY avg_spend DESC;",
                hints: [
                    'First CTE: SELECT client_id, SUM(amount) AS total_spent FROM invoices GROUP BY client_id',
                    'Second CTE: Use CASE WHEN to assign tier names based on total_spent thresholds.',
                    "WITH client_spending AS (\n    SELECT client_id, ROUND(SUM(amount), 2) AS total_spent\n    FROM invoices\n    GROUP BY client_id\n),\ntiers AS (\n    SELECT *,\n           CASE WHEN total_spent >= 2000 THEN 'Platinum'\n                WHEN total_spent >= 1000 THEN 'Gold'\n                ELSE 'Silver' END AS tier\n    FROM client_spending\n)\nSELECT tier, COUNT(*) AS num_clients, ROUND(AVG(total_spent), 2) AS avg_spend\nFROM tiers\nGROUP BY tier\nORDER BY avg_spend DESC;"
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 7,
            title: 'Exercise: Category Depth Report',
            type: 'exercise',
            content: `## Exercise: Recursive Category Tree

Use a recursive CTE to show the full treatment category hierarchy with depth levels.`,
            exercise: {
                prompt: 'Write a recursive CTE that traverses the treatment_categories table. Show category_name and depth (starting at 0 for root categories where parent_category_id IS NULL). Sort by depth then category_name ascending.',
                startingCode: '-- Recursive category tree\n',
                expectedQuery: "WITH RECURSIVE category_tree AS (\n    SELECT category_id, category_name, parent_category_id, 0 AS depth\n    FROM treatment_categories\n    WHERE parent_category_id IS NULL\n    UNION ALL\n    SELECT tc.category_id, tc.category_name, tc.parent_category_id, ct.depth + 1\n    FROM treatment_categories tc\n    JOIN category_tree ct ON tc.parent_category_id = ct.category_id\n)\nSELECT category_name, depth\nFROM category_tree\nORDER BY depth, category_name;",
                hints: [
                    'Base case: SELECT ... FROM treatment_categories WHERE parent_category_id IS NULL with depth = 0.',
                    'Recursive case: JOIN treatment_categories tc ON tc.parent_category_id = ct.category_id with depth + 1.',
                    "WITH RECURSIVE category_tree AS (\n    SELECT category_id, category_name, parent_category_id, 0 AS depth\n    FROM treatment_categories\n    WHERE parent_category_id IS NULL\n    UNION ALL\n    SELECT tc.category_id, tc.category_name, tc.parent_category_id, ct.depth + 1\n    FROM treatment_categories tc\n    JOIN category_tree ct ON tc.parent_category_id = ct.category_id\n)\nSELECT category_name, depth\nFROM category_tree\nORDER BY depth, category_name;"
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 8,
            title: 'Exercise: Month-over-Month Growth',
            type: 'exercise',
            content: `## Exercise: Revenue Growth Report

Build a report showing monthly revenue with growth percentage compared to the previous month.`,
            exercise: {
                prompt: 'Use two CTEs. CTE 1 "monthly_revenue": group paid invoices by month (STRFTIME(\'%Y-%m\', invoice_date)) and SUM amount as "revenue" (ROUND to 2). CTE 2 "with_prev": add LAG(revenue) OVER (ORDER BY month) as "prev_revenue". Final SELECT: month, revenue, prev_revenue, and ROUND((revenue - prev_revenue) * 100.0 / prev_revenue, 1) as "growth_pct". Sort by month.',
                startingCode: '-- Month-over-month revenue growth\n',
                expectedQuery: "WITH monthly_revenue AS (\n    SELECT STRFTIME('%Y-%m', invoice_date) AS month, ROUND(SUM(amount), 2) AS revenue\n    FROM invoices WHERE status = 'paid'\n    GROUP BY month\n),\nwith_prev AS (\n    SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) AS prev_revenue\n    FROM monthly_revenue\n)\nSELECT month, revenue, prev_revenue, ROUND((revenue - prev_revenue) * 100.0 / prev_revenue, 1) AS growth_pct\nFROM with_prev\nORDER BY month;",
                hints: [
                    'CTE 1: GROUP invoices by STRFTIME(\'%Y-%m\', invoice_date), SUM(amount). CTE 2: use LAG to get previous month.',
                    'Growth formula: (revenue - prev_revenue) * 100.0 / prev_revenue. Use ROUND(..., 1).',
                    "WITH monthly_revenue AS (\n    SELECT STRFTIME('%Y-%m', invoice_date) AS month, ROUND(SUM(amount), 2) AS revenue\n    FROM invoices WHERE status = 'paid'\n    GROUP BY month\n),\nwith_prev AS (\n    SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) AS prev_revenue\n    FROM monthly_revenue\n)\nSELECT month, revenue, prev_revenue, ROUND((revenue - prev_revenue) * 100.0 / prev_revenue, 1) AS growth_pct\nFROM with_prev\nORDER BY month;"
                ],
                orderMatters: true
            }
        }
    ]
};
