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

### Pattern: Build → Aggregate → Compare

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
            lessonId: 5,
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
        }
    ]
};
