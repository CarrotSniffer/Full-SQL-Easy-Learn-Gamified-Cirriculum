// Module 5 — JOINs (Medical Spa context)
const MODULE_05 = {
    moduleId: 5,
    title: 'JOINs — Connecting Tables',
    level: 'intermediate',
    description: 'Combine data from multiple tables using INNER JOIN, LEFT JOIN, and self joins.',
    lessons: [
        {
            lessonId: 1,
            title: 'Introduction to JOINs',
            type: 'reading',
            content: `## Why JOINs?

Our spa database has related tables connected by foreign keys. JOINs let us pull data from multiple tables in a single query.

### INNER JOIN

Returns only rows that have a match in **both** tables:

\`\`\`sql
-- Show each appointment with client name and treatment name
SELECT a.appointment_id,
       c.first_name || ' ' || c.last_name AS client_name,
       t.treatment_name,
       a.appointment_date
FROM appointments a
INNER JOIN clients c ON a.client_id = c.client_id
INNER JOIN treatments t ON a.treatment_id = t.treatment_id
LIMIT 10;
\`\`\`

### JOIN Syntax

\`\`\`sql
SELECT columns
FROM table_a
JOIN table_b ON table_a.key = table_b.key;
\`\`\`

- \`INNER JOIN\` and \`JOIN\` are the same thing
- The \`ON\` clause specifies how rows match
- Use **table aliases** (a, c, t) to keep queries readable`,
            exampleQueries: [
                { label: 'Appointments with client + treatment', sql: 'SELECT a.appointment_id, c.first_name || \' \' || c.last_name AS client_name, t.treatment_name, a.appointment_date, a.status FROM appointments a INNER JOIN clients c ON a.client_id = c.client_id INNER JOIN treatments t ON a.treatment_id = t.treatment_id LIMIT 15;' },
                { label: 'Staff with department names', sql: 'SELECT s.first_name, s.last_name, s.role, d.department_name FROM staff s INNER JOIN departments d ON s.department_id = d.department_id ORDER BY d.department_name, s.last_name;' },
                { label: 'Invoices with client info', sql: 'SELECT i.invoice_id, c.first_name || \' \' || c.last_name AS client_name, i.amount, i.payment_method, i.invoice_date FROM invoices i INNER JOIN clients c ON i.client_id = c.client_id ORDER BY i.invoice_date DESC LIMIT 10;' }
            ]
        },
        {
            lessonId: 2,
            title: 'LEFT JOIN',
            type: 'reading',
            content: `## LEFT JOIN — Keep All Left-Side Rows

\`LEFT JOIN\` returns **all** rows from the left table, even if there's no match on the right. Unmatched columns show NULL.

\`\`\`sql
-- All clients, even those without appointments
SELECT c.first_name || ' ' || c.last_name AS client_name,
       COUNT(a.appointment_id) AS visit_count
FROM clients c
LEFT JOIN appointments a ON c.client_id = a.client_id
GROUP BY c.client_id
ORDER BY visit_count ASC
LIMIT 15;
\`\`\`

### When to Use LEFT JOIN

- Find clients who have **never** booked an appointment
- Show all products, even those never sold
- List all staff, even those with no appointments yet

\`\`\`sql
-- Clients with zero appointments
SELECT c.first_name, c.last_name, c.email
FROM clients c
LEFT JOIN appointments a ON c.client_id = a.client_id
WHERE a.appointment_id IS NULL;
\`\`\`

The trick: after a LEFT JOIN, check for \`NULL\` in the right table's primary key to find "orphan" rows.`,
            exampleQueries: [
                { label: 'Clients with no appointments', sql: 'SELECT c.first_name, c.last_name, c.signup_date FROM clients c LEFT JOIN appointments a ON c.client_id = a.client_id WHERE a.appointment_id IS NULL;' },
                { label: 'Client visit counts (incl. 0)', sql: 'SELECT c.first_name || \' \' || c.last_name AS client_name, COUNT(a.appointment_id) AS visits FROM clients c LEFT JOIN appointments a ON c.client_id = a.client_id GROUP BY c.client_id ORDER BY visits ASC LIMIT 20;' },
                { label: 'Products never sold', sql: 'SELECT p.product_name, p.brand, p.price FROM products p LEFT JOIN product_sales ps ON p.product_id = ps.product_id WHERE ps.sale_id IS NULL;' }
            ]
        },
        {
            lessonId: 3,
            title: 'Self Joins & Multi-Table JOINs',
            type: 'reading',
            content: `## Self Joins

A self join joins a table to **itself**. In our spa, staff have a \`manager_id\` that references another staff member:

\`\`\`sql
-- Show each employee and their manager
SELECT e.first_name || ' ' || e.last_name AS employee,
       e.role,
       m.first_name || ' ' || m.last_name AS manager
FROM staff e
LEFT JOIN staff m ON e.manager_id = m.staff_id
ORDER BY manager, employee;
\`\`\`

Use LEFT JOIN so that top-level staff (no manager) still appear.

## Multi-Table JOINs

Chain multiple JOINs to build complete reports:

\`\`\`sql
-- Full appointment detail: who, what, when, how much
SELECT a.appointment_date,
       c.first_name || ' ' || c.last_name AS client,
       t.treatment_name,
       t.price,
       s.first_name || ' ' || s.last_name AS provider
FROM appointments a
JOIN clients c ON a.client_id = c.client_id
JOIN treatments t ON a.treatment_id = t.treatment_id
JOIN staff s ON a.staff_id = s.staff_id
WHERE a.status = 'completed'
ORDER BY a.appointment_date DESC
LIMIT 10;
\`\`\``,
            exampleQueries: [
                { label: 'Staff + their managers', sql: 'SELECT e.first_name || \' \' || e.last_name AS employee, e.role, m.first_name || \' \' || m.last_name AS manager FROM staff e LEFT JOIN staff m ON e.manager_id = m.staff_id ORDER BY manager, employee;' },
                { label: 'Full appointment details', sql: 'SELECT a.appointment_date, c.first_name || \' \' || c.last_name AS client, t.treatment_name, t.price, s.first_name || \' \' || s.last_name AS provider FROM appointments a JOIN clients c ON a.client_id = c.client_id JOIN treatments t ON a.treatment_id = t.treatment_id JOIN staff s ON a.staff_id = s.staff_id WHERE a.status = \'completed\' ORDER BY a.appointment_date DESC LIMIT 10;' },
                { label: 'Invoice detail with treatment', sql: 'SELECT i.invoice_id, c.first_name || \' \' || c.last_name AS client, t.treatment_name, i.amount, i.payment_method FROM invoices i JOIN clients c ON i.client_id = c.client_id JOIN appointments a ON i.appointment_id = a.appointment_id JOIN treatments t ON a.treatment_id = t.treatment_id ORDER BY i.invoice_date DESC LIMIT 10;' }
            ]
        },
        {
            lessonId: 4,
            title: 'Exercise: Provider Revenue Report',
            type: 'exercise',
            content: `## Exercise: Who Brings in the Most Revenue?

Build a report showing how much revenue each provider has generated from completed appointments.`,
            exercise: {
                prompt: 'Show each staff member\'s **full name** (first_name || \' \' || last_name) as "provider", and the **total revenue** they generated as "total_revenue" (SUM of treatment prices from completed appointments). Only include staff who have completed appointments. Sort by total_revenue descending. ROUND total_revenue to 2 decimals.',
                startingCode: '-- Provider revenue report\n',
                expectedQuery: "SELECT s.first_name || ' ' || s.last_name AS provider, ROUND(SUM(t.price), 2) AS total_revenue FROM appointments a JOIN staff s ON a.staff_id = s.staff_id JOIN treatments t ON a.treatment_id = t.treatment_id WHERE a.status = 'completed' GROUP BY s.staff_id ORDER BY total_revenue DESC;",
                hints: [
                    'JOIN appointments with staff and treatments. Filter WHERE status = \'completed\'.',
                    'GROUP BY s.staff_id, then SUM(t.price). Use ROUND(..., 2).',
                    "SELECT s.first_name || ' ' || s.last_name AS provider, ROUND(SUM(t.price), 2) AS total_revenue FROM appointments a JOIN staff s ON a.staff_id = s.staff_id JOIN treatments t ON a.treatment_id = t.treatment_id WHERE a.status = 'completed' GROUP BY s.staff_id ORDER BY total_revenue DESC;"
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 5,
            title: 'Exercise: Clients Without Visits',
            type: 'exercise',
            content: `## Exercise: Find Inactive Clients

The spa wants to send re-engagement emails to clients who signed up but never booked an appointment.`,
            exercise: {
                prompt: 'Find all clients who have **no appointments** at all. Show their first_name, last_name, email, and signup_date. Sort by signup_date ascending.',
                startingCode: '-- Clients who never booked\n',
                expectedQuery: 'SELECT c.first_name, c.last_name, c.email, c.signup_date FROM clients c LEFT JOIN appointments a ON c.client_id = a.client_id WHERE a.appointment_id IS NULL ORDER BY c.signup_date ASC;',
                hints: [
                    'Use LEFT JOIN from clients to appointments, then filter for NULLs.',
                    'WHERE a.appointment_id IS NULL gives you clients with zero appointments.',
                    'SELECT c.first_name, c.last_name, c.email, c.signup_date FROM clients c LEFT JOIN appointments a ON c.client_id = a.client_id WHERE a.appointment_id IS NULL ORDER BY c.signup_date ASC;'
                ],
                orderMatters: true
            }
        }
    ]
};
