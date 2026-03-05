// Module 6 — Data Manipulation / DML (Medical Spa context)
const MODULE_06 = {
    moduleId: 6,
    title: 'Data Manipulation (DML)',
    level: 'intermediate',
    description: 'Add, update, and delete data with INSERT, UPDATE, and DELETE statements.',
    lessons: [
        {
            lessonId: 1,
            title: 'INSERT — Adding Data',
            type: 'reading',
            content: `## INSERT INTO

Add new rows to a table:

\`\`\`sql
-- Add a new client
INSERT INTO clients (first_name, last_name, email, phone, city, state, signup_date, referral_source)
VALUES ('Sarah', 'Mitchell', 'sarah.m@email.com', '480-555-0199', 'Scottsdale', 'AZ', '2025-03-01', 'Instagram');
\`\`\`

### Multiple Rows at Once

\`\`\`sql
INSERT INTO products (product_name, brand, category, price, cost, stock_quantity)
VALUES
    ('Vitamin C Serum', 'SkinCeuticals', 'Serums', 169.00, 85.00, 25),
    ('Retinol Cream', 'ZO Skin Health', 'Anti-Aging', 135.00, 60.00, 30);
\`\`\`

### INSERT with SELECT

Copy data from one query into a table:

\`\`\`sql
-- Suppose we had a VIP table, we could populate it:
-- INSERT INTO vip_clients (client_id, name)
-- SELECT client_id, first_name || ' ' || last_name
-- FROM clients WHERE city = 'Scottsdale';
\`\`\`

**Important:** After INSERT, the database resets when you click the Reset button, so feel free to experiment!`,
            exampleQueries: [
                { label: 'Insert a new client', sql: "INSERT INTO clients (first_name, last_name, email, city, state, signup_date, referral_source) VALUES ('Test', 'Client', 'test@email.com', 'Phoenix', 'AZ', '2025-03-01', 'Walk-in');\nSELECT * FROM clients WHERE first_name = 'Test';" },
                { label: 'Insert a new treatment', sql: "INSERT INTO treatments (treatment_name, category, duration_minutes, price, description) VALUES ('Diamond Glow Facial', 'Facials', 60, 275.00, 'Exfoliating facial with serum infusion');\nSELECT * FROM treatments WHERE treatment_name LIKE '%Diamond%';" },
                { label: 'Insert multiple products', sql: "INSERT INTO products (product_name, brand, category, price, cost, stock_quantity) VALUES ('Lip Balm SPF30', 'EltaMD', 'Sun Care', 12.00, 5.00, 50), ('Eye Cream', 'SkinMedica', 'Anti-Aging', 95.00, 40.00, 20);\nSELECT * FROM products ORDER BY product_id DESC LIMIT 5;" }
            ]
        },
        {
            lessonId: 2,
            title: 'UPDATE — Modifying Data',
            type: 'reading',
            content: `## UPDATE

Change existing rows:

\`\`\`sql
-- Give all aestheticians a $5/hr raise
UPDATE staff
SET hourly_rate = hourly_rate + 5
WHERE role = 'Aesthetician';
\`\`\`

### Always Use WHERE!

Without WHERE, **every row** in the table gets updated:

\`\`\`sql
-- DANGER: This updates ALL staff!
UPDATE staff SET hourly_rate = 50;

-- SAFE: Only updates one person
UPDATE staff SET hourly_rate = 50 WHERE staff_id = 1;
\`\`\`

### UPDATE with Expressions

\`\`\`sql
-- 10% price increase on all injectables
UPDATE treatments
SET price = ROUND(price * 1.10, 2)
WHERE category = 'Injectables';
\`\`\`

### UPDATE Multiple Columns

\`\`\`sql
UPDATE clients
SET city = 'Mesa', state = 'AZ'
WHERE client_id = 5;
\`\`\``,
            exampleQueries: [
                { label: 'Raise aesthetician rates', sql: "UPDATE staff SET hourly_rate = hourly_rate + 5 WHERE role = 'Aesthetician';\nSELECT first_name, last_name, role, hourly_rate FROM staff WHERE role = 'Aesthetician';" },
                { label: '10% price hike on injectables', sql: "UPDATE treatments SET price = ROUND(price * 1.10, 2) WHERE category = 'Injectables';\nSELECT treatment_name, category, price FROM treatments WHERE category = 'Injectables';" },
                { label: 'Mark no-show appointments', sql: "UPDATE appointments SET status = 'no-show' WHERE appointment_id = 1;\nSELECT * FROM appointments WHERE appointment_id = 1;" }
            ]
        },
        {
            lessonId: 3,
            title: 'DELETE — Removing Data',
            type: 'reading',
            content: `## DELETE

Remove rows from a table:

\`\`\`sql
-- Remove cancelled appointments older than 2024
DELETE FROM appointments
WHERE status = 'cancelled'
  AND appointment_date < '2024-01-01';
\`\`\`

### Always Use WHERE!

Without WHERE, you delete **every row**:

\`\`\`sql
-- DANGER: Empties the entire table!
DELETE FROM appointments;

-- SAFE: Targeted delete
DELETE FROM appointments WHERE appointment_id = 999;
\`\`\`

### Check Before Deleting

Always preview what will be deleted with a SELECT first:

\`\`\`sql
-- Preview
SELECT * FROM appointments
WHERE status = 'cancelled'
  AND appointment_date < '2024-01-01';

-- Then delete
DELETE FROM appointments
WHERE status = 'cancelled'
  AND appointment_date < '2024-01-01';
\`\`\`

### Foreign Key Considerations

Deleting a client who has appointments will fail if foreign key enforcement is on, because the appointments reference that client. You'd need to delete the appointments first or use CASCADE.`,
            exampleQueries: [
                { label: 'Delete cancelled appointments', sql: "SELECT COUNT(*) AS will_delete FROM appointments WHERE status = 'cancelled';\nDELETE FROM appointments WHERE status = 'cancelled';\nSELECT COUNT(*) AS remaining FROM appointments;" },
                { label: 'Remove out-of-stock products', sql: "SELECT product_name, stock_quantity FROM products WHERE stock_quantity = 0;\nDELETE FROM products WHERE stock_quantity = 0;\nSELECT COUNT(*) AS products_remaining FROM products;" },
                { label: 'Delete test data', sql: "INSERT INTO clients (first_name, last_name, city, state, signup_date) VALUES ('DELETE', 'ME', 'Test', 'AZ', '2025-01-01');\nSELECT * FROM clients WHERE first_name = 'DELETE';\nDELETE FROM clients WHERE first_name = 'DELETE';\nSELECT COUNT(*) AS clients_remaining FROM clients;" }
            ]
        },
        {
            lessonId: 4,
            title: 'Use Case: End-of-Day Data Tasks',
            type: 'reading',
            content: `## Real Scenario: Receptionist's End-of-Day Routine

Every evening, the front desk handles data cleanup tasks using INSERT, UPDATE, and DELETE.

### 1. Register Walk-In Clients

\`\`\`sql
INSERT INTO clients (first_name, last_name, phone, city, state, signup_date, referral_source)
VALUES ('Walk', 'In-Client', '480-555-9999', 'Scottsdale', 'AZ', DATE('now'), 'Walk-in');
\`\`\`

### 2. Update Appointment Statuses

\`\`\`sql
-- Mark today's scheduled appointments as completed
UPDATE appointments
SET status = 'completed'
WHERE status = 'scheduled'
  AND appointment_date <= DATE('now');
\`\`\`

### 3. Adjust Inventory After Sales

\`\`\`sql
-- Decrement stock for a product that was sold
UPDATE products
SET stock_quantity = stock_quantity - 1
WHERE product_id = 5 AND stock_quantity > 0;
\`\`\`

### 4. Clean Up Old Cancelled Appointments

\`\`\`sql
-- Preview first!
SELECT COUNT(*) AS to_delete
FROM appointments
WHERE status = 'cancelled'
  AND appointment_date < DATE('now', '-90 days');

-- Then delete
DELETE FROM appointments
WHERE status = 'cancelled'
  AND appointment_date < DATE('now', '-90 days');
\`\`\``,
            exampleQueries: [
                { label: 'Register walk-in client', sql: "INSERT INTO clients (first_name, last_name, phone, city, state, signup_date, referral_source) VALUES ('Walk', 'In-Client', '480-555-9999', 'Scottsdale', 'AZ', '2025-03-05', 'Walk-in');\nSELECT * FROM clients WHERE referral_source = 'Walk-in' ORDER BY client_id DESC LIMIT 3;" },
                { label: 'Batch update statuses', sql: "SELECT status, COUNT(*) FROM appointments GROUP BY status;\nUPDATE appointments SET status = 'completed' WHERE status = 'scheduled' AND appointment_date < '2025-03-01';\nSELECT status, COUNT(*) FROM appointments GROUP BY status;" },
                { label: 'Preview before delete', sql: "SELECT COUNT(*) AS will_delete FROM appointments WHERE status = 'cancelled';" }
            ]
        },
        {
            lessonId: 5,
            title: 'Exercise: Spa Data Updates',
            type: 'exercise',
            content: `## Exercise: Bulk Price Adjustment

The spa is running a spring promotion — all Facial treatments need a 15% discount.`,
            exercise: {
                prompt: 'Write an UPDATE statement that reduces the price of all treatments in the **\'Facials\'** category by 15% (multiply by 0.85). ROUND the new price to 2 decimal places. Then SELECT treatment_name and price FROM treatments WHERE category = \'Facials\' ORDER BY price DESC.',
                startingCode: '-- Spring facial promotion\n',
                expectedQuery: "UPDATE treatments SET price = ROUND(price * 0.85, 2) WHERE category = 'Facials';\nSELECT treatment_name, price FROM treatments WHERE category = 'Facials' ORDER BY price DESC;",
                hints: [
                    'UPDATE treatments SET price = ROUND(price * 0.85, 2) WHERE category = \'Facials\';',
                    'After the UPDATE, run: SELECT treatment_name, price FROM treatments WHERE category = \'Facials\' ORDER BY price DESC;',
                    "UPDATE treatments SET price = ROUND(price * 0.85, 2) WHERE category = 'Facials';\nSELECT treatment_name, price FROM treatments WHERE category = 'Facials' ORDER BY price DESC;"
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 6,
            title: 'Exercise: Add a New Client',
            type: 'exercise',
            content: `## Exercise: Client Registration

Register a new client in the system and verify they were added.`,
            exercise: {
                prompt: 'INSERT a new client with first_name \'Emma\', last_name \'Rodriguez\', email \'emma.r@email.com\', phone \'602-555-0188\', city \'Phoenix\', state \'AZ\', signup_date \'2025-03-05\', referral_source \'Yelp\'. Then SELECT first_name, last_name, email, city FROM clients WHERE email = \'emma.r@email.com\';',
                startingCode: '-- Register new client\n',
                expectedQuery: "INSERT INTO clients (first_name, last_name, email, phone, city, state, signup_date, referral_source) VALUES ('Emma', 'Rodriguez', 'emma.r@email.com', '602-555-0188', 'Phoenix', 'AZ', '2025-03-05', 'Yelp');\nSELECT first_name, last_name, email, city FROM clients WHERE email = 'emma.r@email.com';",
                hints: [
                    'Use INSERT INTO clients (columns...) VALUES (values...);',
                    'Follow the INSERT with a SELECT to verify: SELECT first_name, last_name, email, city FROM clients WHERE email = \'emma.r@email.com\';',
                    "INSERT INTO clients (first_name, last_name, email, phone, city, state, signup_date, referral_source) VALUES ('Emma', 'Rodriguez', 'emma.r@email.com', '602-555-0188', 'Phoenix', 'AZ', '2025-03-05', 'Yelp');\nSELECT first_name, last_name, email, city FROM clients WHERE email = 'emma.r@email.com';"
                ],
                orderMatters: false
            }
        },
        {
            lessonId: 7,
            title: 'Exercise: Inventory Restock',
            type: 'exercise',
            content: `## Exercise: Restock Skincare Products

A shipment of serums just arrived. Update the inventory and verify the changes.`,
            exercise: {
                prompt: 'UPDATE products to add 15 to the stock_quantity for all products in the \'Serums\' category. Then SELECT product_name, category, stock_quantity FROM products WHERE category = \'Serums\' ORDER BY product_name.',
                startingCode: '-- Restock serums\n',
                expectedQuery: "UPDATE products SET stock_quantity = stock_quantity + 15 WHERE category = 'Serums';\nSELECT product_name, category, stock_quantity FROM products WHERE category = 'Serums' ORDER BY product_name;",
                hints: [
                    'UPDATE products SET stock_quantity = stock_quantity + 15 WHERE category = \'Serums\';',
                    'Then verify with SELECT product_name, category, stock_quantity FROM products WHERE category = \'Serums\' ORDER BY product_name;',
                    "UPDATE products SET stock_quantity = stock_quantity + 15 WHERE category = 'Serums';\nSELECT product_name, category, stock_quantity FROM products WHERE category = 'Serums' ORDER BY product_name;"
                ],
                orderMatters: false
            }
        },
        {
            lessonId: 8,
            title: 'Exercise: Cancel Old Appointments',
            type: 'exercise',
            content: `## Exercise: Data Cleanup

Clean up stale scheduled appointments that were never completed. Always preview before deleting!`,
            exercise: {
                prompt: 'First SELECT COUNT(*) as "will_delete" FROM appointments WHERE status = \'scheduled\' AND appointment_date < \'2024-06-01\'. Then DELETE those rows. Then SELECT COUNT(*) as "remaining" FROM appointments.',
                startingCode: '-- Clean up old scheduled appointments\n',
                expectedQuery: "SELECT COUNT(*) AS will_delete FROM appointments WHERE status = 'scheduled' AND appointment_date < '2024-06-01';\nDELETE FROM appointments WHERE status = 'scheduled' AND appointment_date < '2024-06-01';\nSELECT COUNT(*) AS remaining FROM appointments;",
                hints: [
                    'Three statements: SELECT COUNT to preview, DELETE to remove, SELECT COUNT to confirm.',
                    'All three use the same WHERE clause: status = \'scheduled\' AND appointment_date < \'2024-06-01\'.',
                    "SELECT COUNT(*) AS will_delete FROM appointments WHERE status = 'scheduled' AND appointment_date < '2024-06-01';\nDELETE FROM appointments WHERE status = 'scheduled' AND appointment_date < '2024-06-01';\nSELECT COUNT(*) AS remaining FROM appointments;"
                ],
                orderMatters: false
            }
        }
    ]
};
