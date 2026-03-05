// Module 8 — Subqueries (Medical Spa context)
const MODULE_08 = {
    moduleId: 8,
    title: 'Subqueries',
    level: 'advanced',
    description: 'Nest queries inside other queries for powerful filtering and derived tables.',
    lessons: [
        {
            lessonId: 1,
            title: 'Subqueries in WHERE',
            type: 'reading',
            content: `## What Is a Subquery?

A subquery is a query nested inside another query. The inner query runs first, and its result feeds the outer query.

### Scalar Subquery (returns one value)

\`\`\`sql
-- Treatments priced above average
SELECT treatment_name, price
FROM treatments
WHERE price > (SELECT AVG(price) FROM treatments)
ORDER BY price DESC;
\`\`\`

### List Subquery (returns multiple values)

\`\`\`sql
-- Clients who have completed appointments
SELECT first_name, last_name, email
FROM clients
WHERE client_id IN (
    SELECT DISTINCT client_id
    FROM appointments
    WHERE status = 'completed'
)
ORDER BY last_name;
\`\`\`

### NOT IN — Exclusion

\`\`\`sql
-- Staff who have never been assigned an appointment
SELECT first_name, last_name, role
FROM staff
WHERE staff_id NOT IN (
    SELECT DISTINCT staff_id FROM appointments
);
\`\`\``,
            exampleQueries: [
                { label: 'Above-average treatments', sql: 'SELECT treatment_name, price, category FROM treatments WHERE price > (SELECT AVG(price) FROM treatments) ORDER BY price DESC;' },
                { label: 'Clients with completed visits', sql: "SELECT first_name, last_name, email FROM clients WHERE client_id IN (SELECT DISTINCT client_id FROM appointments WHERE status = 'completed') ORDER BY last_name;" },
                { label: 'Staff with no appointments', sql: 'SELECT first_name, last_name, role FROM staff WHERE staff_id NOT IN (SELECT DISTINCT staff_id FROM appointments);' }
            ]
        },
        {
            lessonId: 2,
            title: 'Derived Tables (Subqueries in FROM)',
            type: 'reading',
            content: `## Derived Tables

A subquery in the FROM clause creates a temporary "virtual table" you can query:

\`\`\`sql
-- Find the average number of appointments per client
SELECT ROUND(AVG(visit_count), 1) AS avg_visits_per_client
FROM (
    SELECT client_id, COUNT(*) AS visit_count
    FROM appointments
    GROUP BY client_id
) client_visits;
\`\`\`

### Using Derived Tables for Complex Reports

\`\`\`sql
-- Compare each treatment's price to its category average
SELECT t.treatment_name, t.category, t.price,
       cat_avg.avg_price,
       ROUND(t.price - cat_avg.avg_price, 2) AS diff_from_avg
FROM treatments t
JOIN (
    SELECT category, ROUND(AVG(price), 2) AS avg_price
    FROM treatments
    GROUP BY category
) cat_avg ON t.category = cat_avg.category
ORDER BY diff_from_avg DESC;
\`\`\`

The derived table **must** have an alias (like \`client_visits\` or \`cat_avg\`).`,
            exampleQueries: [
                { label: 'Avg visits per client', sql: 'SELECT ROUND(AVG(visit_count), 1) AS avg_visits_per_client FROM (SELECT client_id, COUNT(*) AS visit_count FROM appointments GROUP BY client_id) client_visits;' },
                { label: 'Price vs category average', sql: 'SELECT t.treatment_name, t.category, t.price, cat_avg.avg_price, ROUND(t.price - cat_avg.avg_price, 2) AS diff_from_avg FROM treatments t JOIN (SELECT category, ROUND(AVG(price), 2) AS avg_price FROM treatments GROUP BY category) cat_avg ON t.category = cat_avg.category ORDER BY diff_from_avg DESC;' },
                { label: 'Top-spending clients', sql: "SELECT c.first_name || ' ' || c.last_name AS client, totals.total_spent FROM clients c JOIN (SELECT client_id, SUM(amount) AS total_spent FROM invoices GROUP BY client_id) totals ON c.client_id = totals.client_id ORDER BY totals.total_spent DESC LIMIT 10;" }
            ]
        },
        {
            lessonId: 3,
            title: 'Correlated Subqueries & EXISTS',
            type: 'reading',
            content: `## Correlated Subqueries

A correlated subquery references the **outer** query — it runs once per outer row:

\`\`\`sql
-- Treatments that are the most expensive in their category
SELECT treatment_name, category, price
FROM treatments t1
WHERE price = (
    SELECT MAX(price)
    FROM treatments t2
    WHERE t2.category = t1.category
)
ORDER BY price DESC;
\`\`\`

### EXISTS

\`EXISTS\` returns TRUE if the subquery returns **any** rows:

\`\`\`sql
-- Clients who have at least one completed appointment
SELECT first_name, last_name
FROM clients c
WHERE EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.client_id = c.client_id
      AND a.status = 'completed'
)
ORDER BY last_name;
\`\`\`

### EXISTS vs IN

- \`EXISTS\` can be faster for large datasets (stops at first match)
- \`IN\` is simpler for static lists
- \`EXISTS\` handles NULLs better than \`NOT IN\`

\`\`\`sql
-- NOT EXISTS: Clients with zero appointments
SELECT first_name, last_name
FROM clients c
WHERE NOT EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.client_id = c.client_id
);
\`\`\``,
            exampleQueries: [
                { label: 'Most expensive per category', sql: 'SELECT treatment_name, category, price FROM treatments t1 WHERE price = (SELECT MAX(price) FROM treatments t2 WHERE t2.category = t1.category) ORDER BY price DESC;' },
                { label: 'Clients with completed visits (EXISTS)', sql: "SELECT first_name, last_name FROM clients c WHERE EXISTS (SELECT 1 FROM appointments a WHERE a.client_id = c.client_id AND a.status = 'completed') ORDER BY last_name;" },
                { label: 'Clients with no visits (NOT EXISTS)', sql: 'SELECT first_name, last_name, signup_date FROM clients c WHERE NOT EXISTS (SELECT 1 FROM appointments a WHERE a.client_id = c.client_id) ORDER BY signup_date;' }
            ]
        },
        {
            lessonId: 4,
            title: 'Use Case: Client Segmentation for Marketing',
            type: 'reading',
            content: `## Real Scenario: Client Segmentation

Marketing wants to segment clients into groups for targeted campaigns. Subqueries make this possible.

### High-Frequency Visitors

\`\`\`sql
-- Clients with more appointments than average
SELECT c.first_name || ' ' || c.last_name AS client, visit_count
FROM clients c
JOIN (
    SELECT client_id, COUNT(*) AS visit_count
    FROM appointments GROUP BY client_id
) v ON c.client_id = v.client_id
WHERE v.visit_count > (
    SELECT AVG(cnt) FROM (
        SELECT COUNT(*) AS cnt FROM appointments GROUP BY client_id
    )
)
ORDER BY visit_count DESC;
\`\`\`

### At-Risk Clients

\`\`\`sql
-- Signed up 6+ months ago with fewer than 2 appointments
SELECT c.first_name, c.last_name, c.signup_date
FROM clients c
WHERE JULIANDAY('now') - JULIANDAY(c.signup_date) > 180
  AND (SELECT COUNT(*) FROM appointments a WHERE a.client_id = c.client_id) < 2
ORDER BY c.signup_date;
\`\`\`

### New Clients (Last 90 Days)

\`\`\`sql
SELECT first_name, last_name, signup_date, city
FROM clients
WHERE signup_date >= DATE('now', '-90 days')
ORDER BY signup_date DESC;
\`\`\``,
            exampleQueries: [
                { label: 'High-frequency visitors', sql: "SELECT c.first_name || ' ' || c.last_name AS client, v.visit_count FROM clients c JOIN (SELECT client_id, COUNT(*) AS visit_count FROM appointments GROUP BY client_id) v ON c.client_id = v.client_id WHERE v.visit_count > (SELECT AVG(cnt) FROM (SELECT COUNT(*) AS cnt FROM appointments GROUP BY client_id)) ORDER BY v.visit_count DESC;" },
                { label: 'At-risk clients', sql: "SELECT c.first_name, c.last_name, c.signup_date FROM clients c WHERE JULIANDAY('now') - JULIANDAY(c.signup_date) > 180 AND (SELECT COUNT(*) FROM appointments a WHERE a.client_id = c.client_id) < 2 ORDER BY c.signup_date;" },
                { label: 'New clients (90 days)', sql: "SELECT first_name, last_name, signup_date, city FROM clients WHERE signup_date >= DATE('now', '-90 days') ORDER BY signup_date DESC;" }
            ]
        },
        {
            lessonId: 5,
            title: 'Exercise: Treatments Above Average',
            type: 'exercise',
            content: `## Exercise: Premium Treatment Finder

Quickly identify treatments that are priced above the overall average — useful for upselling.`,
            exercise: {
                prompt: 'Find all treatments where the price is greater than the average price of all treatments. Show treatment_name, category, and price. Sort by price descending.',
                startingCode: '-- Above-average price treatments\n',
                expectedQuery: 'SELECT treatment_name, category, price FROM treatments WHERE price > (SELECT AVG(price) FROM treatments) ORDER BY price DESC;',
                hints: [
                    'Use a scalar subquery: WHERE price > (SELECT AVG(price) FROM treatments).',
                    'SELECT treatment_name, category, price FROM treatments WHERE price > (SELECT AVG(price) FROM treatments)',
                    'SELECT treatment_name, category, price FROM treatments WHERE price > (SELECT AVG(price) FROM treatments) ORDER BY price DESC;'
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 6,
            title: 'Exercise: Above-Average Spenders',
            type: 'exercise',
            content: `## Exercise: VIP Client Identification

Find clients who have spent more than the average client.`,
            exercise: {
                prompt: 'Show the first_name, last_name, and total amount spent (as "total_spent") for clients whose total invoice amount is **greater than the average** total spent across all clients. Sort by total_spent descending. ROUND total_spent to 2 decimals.',
                startingCode: '-- Find above-average spenders\n',
                expectedQuery: 'SELECT c.first_name, c.last_name, ROUND(SUM(i.amount), 2) AS total_spent FROM clients c JOIN invoices i ON c.client_id = i.client_id GROUP BY c.client_id HAVING SUM(i.amount) > (SELECT AVG(client_total) FROM (SELECT SUM(amount) AS client_total FROM invoices GROUP BY client_id)) ORDER BY total_spent DESC;',
                hints: [
                    'First figure out the average total: SELECT AVG(client_total) FROM (SELECT SUM(amount) AS client_total FROM invoices GROUP BY client_id)',
                    'JOIN clients with invoices, GROUP BY client, then use HAVING SUM(amount) > (that subquery)',
                    'SELECT c.first_name, c.last_name, ROUND(SUM(i.amount), 2) AS total_spent FROM clients c JOIN invoices i ON c.client_id = i.client_id GROUP BY c.client_id HAVING SUM(i.amount) > (SELECT AVG(client_total) FROM (SELECT SUM(amount) AS client_total FROM invoices GROUP BY client_id)) ORDER BY total_spent DESC;'
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 7,
            title: 'Exercise: Staff Without Completed Appointments',
            type: 'exercise',
            content: `## Exercise: Identify Underutilized Staff

Find staff members who have never completed an appointment — they may need more scheduling or training.`,
            exercise: {
                prompt: 'Find all staff who have **no completed appointments** (use NOT EXISTS with a correlated subquery checking status = \'completed\'). Show first_name, last_name, and role. Sort by last_name ascending.',
                startingCode: '-- Staff without completed appointments\n',
                expectedQuery: "SELECT first_name, last_name, role FROM staff s WHERE NOT EXISTS (SELECT 1 FROM appointments a WHERE a.staff_id = s.staff_id AND a.status = 'completed') ORDER BY last_name ASC;",
                hints: [
                    'Use NOT EXISTS with a subquery: WHERE NOT EXISTS (SELECT 1 FROM appointments a WHERE a.staff_id = s.staff_id AND a.status = \'completed\').',
                    'The subquery correlates on s.staff_id and also filters a.status = \'completed\'.',
                    "SELECT first_name, last_name, role FROM staff s WHERE NOT EXISTS (SELECT 1 FROM appointments a WHERE a.staff_id = s.staff_id AND a.status = 'completed') ORDER BY last_name ASC;"
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 8,
            title: 'Exercise: Category Best-Sellers',
            type: 'exercise',
            content: `## Exercise: Most Popular Treatment per Category

Find the treatment with the most completed appointments in each category.`,
            exercise: {
                prompt: 'Show the treatment_name, category, and number of completed appointments (as "num_appointments") for treatments that have the **highest** appointment count within their category. Use a correlated subquery. Sort by num_appointments descending.',
                startingCode: '-- Most popular treatment per category\n',
                expectedQuery: "SELECT t.treatment_name, t.category, COUNT(*) AS num_appointments FROM treatments t JOIN appointments a ON t.treatment_id = a.treatment_id WHERE a.status = 'completed' GROUP BY t.treatment_id HAVING COUNT(*) = (SELECT MAX(cnt) FROM (SELECT t2.treatment_id, COUNT(*) AS cnt FROM treatments t2 JOIN appointments a2 ON t2.treatment_id = a2.treatment_id WHERE a2.status = 'completed' AND t2.category = t.category GROUP BY t2.treatment_id)) ORDER BY num_appointments DESC;",
                hints: [
                    'Count completed appointments per treatment: JOIN treatments with appointments WHERE status = \'completed\', GROUP BY treatment_id.',
                    'Use HAVING COUNT(*) = (subquery that finds MAX count for same category).',
                    "SELECT t.treatment_name, t.category, COUNT(*) AS num_appointments FROM treatments t JOIN appointments a ON t.treatment_id = a.treatment_id WHERE a.status = 'completed' GROUP BY t.treatment_id HAVING COUNT(*) = (SELECT MAX(cnt) FROM (SELECT t2.treatment_id, COUNT(*) AS cnt FROM treatments t2 JOIN appointments a2 ON t2.treatment_id = a2.treatment_id WHERE a2.status = 'completed' AND t2.category = t.category GROUP BY t2.treatment_id)) ORDER BY num_appointments DESC;"
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 9,
            title: 'Exercise: Busiest Day Analysis',
            type: 'exercise',
            content: `## Exercise: Find the Busiest Day

Management wants to know which date had the most appointments and see the details for that day.`,
            exercise: {
                prompt: 'Find the appointment_date with the most appointments. Then show all appointments on that date: appointment_date, client full name (first_name || \' \' || last_name) as "client", treatment_name. Sort by client ascending. Use a derived table to find the busiest date.',
                startingCode: '-- Busiest day detail\n',
                expectedQuery: "SELECT a.appointment_date, c.first_name || ' ' || c.last_name AS client, t.treatment_name FROM appointments a JOIN clients c ON a.client_id = c.client_id JOIN treatments t ON a.treatment_id = t.treatment_id WHERE a.appointment_date = (SELECT appointment_date FROM appointments GROUP BY appointment_date ORDER BY COUNT(*) DESC LIMIT 1) ORDER BY client ASC;",
                hints: [
                    'Find the busiest date: SELECT appointment_date FROM appointments GROUP BY appointment_date ORDER BY COUNT(*) DESC LIMIT 1',
                    'Use that as a subquery in WHERE: WHERE a.appointment_date = (that subquery). JOIN with clients and treatments for details.',
                    "SELECT a.appointment_date, c.first_name || ' ' || c.last_name AS client, t.treatment_name FROM appointments a JOIN clients c ON a.client_id = c.client_id JOIN treatments t ON a.treatment_id = t.treatment_id WHERE a.appointment_date = (SELECT appointment_date FROM appointments GROUP BY appointment_date ORDER BY COUNT(*) DESC LIMIT 1) ORDER BY client ASC;"
                ],
                orderMatters: true
            }
        }
    ]
};
