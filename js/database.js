// database.js — sql.js initialization, medical spa schema, seed data, query execution

const Database = (() => {
    let db = null;
    let SQL = null;

    async function init() {
        SQL = await initSqlJs({
            locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.11.0/dist/${file}`
        });
        db = new SQL.Database();
        createSchema();
        seedData();
        return db;
    }

    function createSchema() {
        db.run(`
            CREATE TABLE departments (
                department_id INTEGER PRIMARY KEY,
                department_name TEXT NOT NULL,
                location TEXT
            );

            CREATE TABLE staff (
                staff_id INTEGER PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT UNIQUE,
                role TEXT NOT NULL,
                hire_date TEXT NOT NULL,
                hourly_rate REAL NOT NULL,
                department_id INTEGER,
                manager_id INTEGER,
                FOREIGN KEY (department_id) REFERENCES departments(department_id),
                FOREIGN KEY (manager_id) REFERENCES staff(staff_id)
            );

            CREATE TABLE clients (
                client_id INTEGER PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                date_of_birth TEXT,
                city TEXT,
                state TEXT,
                signup_date TEXT,
                referral_source TEXT
            );

            CREATE TABLE treatment_categories (
                category_id INTEGER PRIMARY KEY,
                category_name TEXT NOT NULL,
                parent_category_id INTEGER,
                FOREIGN KEY (parent_category_id) REFERENCES treatment_categories(category_id)
            );

            CREATE TABLE treatments (
                treatment_id INTEGER PRIMARY KEY,
                treatment_name TEXT NOT NULL,
                category TEXT NOT NULL,
                duration_minutes INTEGER NOT NULL,
                price REAL NOT NULL,
                description TEXT
            );

            CREATE TABLE appointments (
                appointment_id INTEGER PRIMARY KEY,
                client_id INTEGER NOT NULL,
                staff_id INTEGER NOT NULL,
                treatment_id INTEGER NOT NULL,
                appointment_date TEXT NOT NULL,
                status TEXT DEFAULT 'scheduled',
                notes TEXT,
                FOREIGN KEY (client_id) REFERENCES clients(client_id),
                FOREIGN KEY (staff_id) REFERENCES staff(staff_id),
                FOREIGN KEY (treatment_id) REFERENCES treatments(treatment_id)
            );

            CREATE TABLE products (
                product_id INTEGER PRIMARY KEY,
                product_name TEXT NOT NULL,
                brand TEXT,
                category TEXT NOT NULL,
                price REAL NOT NULL,
                cost REAL,
                stock_quantity INTEGER DEFAULT 0,
                is_retail INTEGER DEFAULT 1
            );

            CREATE TABLE invoices (
                invoice_id INTEGER PRIMARY KEY,
                appointment_id INTEGER,
                client_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                discount REAL DEFAULT 0,
                tax REAL DEFAULT 0,
                payment_method TEXT,
                invoice_date TEXT NOT NULL,
                status TEXT DEFAULT 'paid',
                FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
                FOREIGN KEY (client_id) REFERENCES clients(client_id)
            );

            CREATE TABLE product_sales (
                sale_id INTEGER PRIMARY KEY,
                invoice_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price REAL NOT NULL,
                FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
                FOREIGN KEY (product_id) REFERENCES products(product_id)
            );
        `);
    }

    function seedData() {
        // Departments
        db.run(`INSERT INTO departments VALUES
            (1, 'Aesthetics', 'Suite A'),
            (2, 'Laser & Light', 'Suite B'),
            (3, 'Body Contouring', 'Suite C'),
            (4, 'Injectables', 'Suite D'),
            (5, 'Skincare', 'Suite E'),
            (6, 'Wellness', 'Suite F'),
            (7, 'Front Desk', 'Reception'),
            (8, 'Management', 'Admin Office');
        `);

        // Staff (50 rows — managers first, then providers, then support)
        db.run(`INSERT INTO staff VALUES
            (1, 'Dr. Sarah', 'Mitchell', 'sarah.mitchell@glowspa.com', 'Medical Director', '2018-01-15', 150.00, 8, NULL),
            (2, 'Jennifer', 'Park', 'jennifer.park@glowspa.com', 'Spa Manager', '2018-03-01', 55.00, 8, 1),
            (3, 'Dr. Michael', 'Chen', 'michael.chen@glowspa.com', 'Physician', '2019-02-10', 130.00, 4, 1),
            (4, 'Amanda', 'Rodriguez', 'amanda.rodriguez@glowspa.com', 'Lead Aesthetician', '2018-06-15', 45.00, 1, 2),
            (5, 'Lisa', 'Thompson', 'lisa.thompson@glowspa.com', 'Lead Laser Tech', '2019-04-01', 48.00, 2, 2),
            (6, 'Rachel', 'Kim', 'rachel.kim@glowspa.com', 'Nurse Practitioner', '2019-08-20', 75.00, 4, 3),
            (7, 'David', 'Nguyen', 'david.nguyen@glowspa.com', 'Body Contouring Lead', '2020-01-10', 50.00, 3, 2),
            (8, 'Emily', 'Foster', 'emily.foster@glowspa.com', 'Aesthetician', '2020-03-15', 38.00, 1, 4),
            (9, 'Sophia', 'Martinez', 'sophia.martinez@glowspa.com', 'Aesthetician', '2020-06-01', 36.00, 1, 4),
            (10, 'Olivia', 'Wilson', 'olivia.wilson@glowspa.com', 'Aesthetician', '2021-01-10', 35.00, 1, 4),
            (11, 'Carlos', 'Rivera', 'carlos.rivera@glowspa.com', 'Laser Technician', '2020-05-15', 42.00, 2, 5),
            (12, 'Jessica', 'Lee', 'jessica.lee@glowspa.com', 'Laser Technician', '2021-03-20', 40.00, 2, 5),
            (13, 'Nicole', 'Brown', 'nicole.brown@glowspa.com', 'Nurse Injector', '2020-09-01', 70.00, 4, 3),
            (14, 'Angela', 'Davis', 'angela.davis@glowspa.com', 'Nurse Injector', '2021-06-15', 65.00, 4, 3),
            (15, 'Maria', 'Garcia', 'maria.garcia@glowspa.com', 'Body Contouring Tech', '2021-02-10', 38.00, 3, 7),
            (16, 'Samantha', 'Wright', 'samantha.wright@glowspa.com', 'Skincare Specialist', '2020-11-01', 36.00, 5, 2),
            (17, 'Kristin', 'Taylor', 'kristin.taylor@glowspa.com', 'Skincare Specialist', '2021-08-15', 34.00, 5, 16),
            (18, 'Heather', 'Anderson', 'heather.anderson@glowspa.com', 'Wellness Coordinator', '2021-04-01', 32.00, 6, 2),
            (19, 'Lauren', 'Thomas', 'lauren.thomas@glowspa.com', 'Front Desk Lead', '2019-10-15', 24.00, 7, 2),
            (20, 'Megan', 'Jackson', 'megan.jackson@glowspa.com', 'Receptionist', '2021-05-01', 18.00, 7, 19),
            (21, 'Ashley', 'White', 'ashley.white@glowspa.com', 'Receptionist', '2022-01-10', 18.00, 7, 19),
            (22, 'Brittany', 'Harris', 'brittany.harris@glowspa.com', 'Receptionist', '2022-06-15', 17.00, 7, 19),
            (23, 'Daniel', 'Moore', 'daniel.moore@glowspa.com', 'Aesthetician', '2022-02-01', 34.00, 1, 4),
            (24, 'Victoria', 'Clark', 'victoria.clark@glowspa.com', 'Laser Technician', '2022-04-15', 39.00, 2, 5),
            (25, 'Katherine', 'Lewis', 'katherine.lewis@glowspa.com', 'Nurse Injector', '2022-08-01', 62.00, 4, 6),
            (26, 'Christina', 'Walker', 'christina.walker@glowspa.com', 'Body Contouring Tech', '2022-03-10', 36.00, 3, 7),
            (27, 'Stephanie', 'Hall', 'stephanie.hall@glowspa.com', 'Skincare Specialist', '2022-09-15', 33.00, 5, 16),
            (28, 'Rebecca', 'Allen', 'rebecca.allen@glowspa.com', 'Aesthetician', '2022-11-01', 33.00, 1, 4),
            (29, 'Michelle', 'Young', 'michelle.young@glowspa.com', 'Wellness Coordinator', '2022-07-20', 30.00, 6, 18),
            (30, 'Natalie', 'King', 'natalie.king@glowspa.com', 'Receptionist', '2023-01-05', 17.50, 7, 19),
            (31, 'Tiffany', 'Scott', 'tiffany.scott@glowspa.com', 'Aesthetician', '2023-03-15', 32.00, 1, 4),
            (32, 'Diana', 'Green', 'diana.green@glowspa.com', 'Laser Technician', '2023-02-01', 38.00, 2, 5),
            (33, 'Vanessa', 'Adams', 'vanessa.adams@glowspa.com', 'Nurse Injector', '2023-05-10', 60.00, 4, 6),
            (34, 'Chelsea', 'Baker', 'chelsea.baker@glowspa.com', 'Body Contouring Tech', '2023-04-20', 35.00, 3, 7),
            (35, 'Monica', 'Nelson', 'monica.nelson@glowspa.com', 'Skincare Specialist', '2023-06-01', 32.00, 5, 16),
            (36, 'Brianna', 'Carter', 'brianna.carter@glowspa.com', 'Wellness Coordinator', '2023-07-15', 28.00, 6, 18),
            (37, 'Alicia', 'Mitchell', 'alicia.mitchell@glowspa.com', 'Receptionist', '2023-08-01', 17.00, 7, 19),
            (38, 'Dr. James', 'Patel', 'james.patel@glowspa.com', 'Physician', '2023-09-10', 125.00, 4, 1),
            (39, 'Alyssa', 'Turner', 'alyssa.turner@glowspa.com', 'Aesthetician', '2023-10-01', 31.00, 1, 4),
            (40, 'Amber', 'Phillips', 'amber.phillips@glowspa.com', 'Laser Technician', '2023-11-15', 37.00, 2, 5),
            (41, 'Courtney', 'Campbell', 'courtney.campbell@glowspa.com', 'Nurse Injector', '2024-01-08', 58.00, 4, 6),
            (42, 'Taylor', 'Evans', 'taylor.evans@glowspa.com', 'Body Contouring Tech', '2024-02-14', 34.00, 3, 7),
            (43, 'Jordan', 'Collins', 'jordan.collins@glowspa.com', 'Skincare Specialist', '2024-01-20', 31.00, 5, 16),
            (44, 'Casey', 'Stewart', 'casey.stewart@glowspa.com', 'Receptionist', '2024-03-01', 17.00, 7, 19),
            (45, 'Dr. Priya', 'Sharma', 'priya.sharma@glowspa.com', 'Physician', '2024-04-10', 120.00, 4, 1),
            (46, 'Alexis', 'Morris', 'alexis.morris@glowspa.com', 'Aesthetician', '2024-05-01', 30.00, 1, 4),
            (47, 'Brooke', 'Rogers', 'brooke.rogers@glowspa.com', 'Laser Technician', '2024-06-15', 36.00, 2, 5),
            (48, 'Hannah', 'Reed', 'hannah.reed@glowspa.com', 'Wellness Coordinator', '2024-03-20', 28.00, 6, 18),
            (49, 'Lindsey', 'Cook', 'lindsey.cook@glowspa.com', 'Skincare Specialist', '2024-07-01', 30.00, 5, 16),
            (50, 'Paige', 'Morgan', 'paige.morgan@glowspa.com', 'Receptionist', '2024-08-10', 17.00, 7, 19);
        `);

        // Clients (80 rows — mix of regulars and one-timers, some NULL emails/phones for NULL exercises)
        db.run(`INSERT INTO clients VALUES
            (1, 'Jessica', 'Palmer', 'jessica.palmer@email.com', '555-0101', '1985-03-14', 'Scottsdale', 'AZ', '2021-01-10', 'Google'),
            (2, 'Karen', 'Brooks', 'karen.brooks@email.com', '555-0102', '1978-07-22', 'Phoenix', 'AZ', '2021-01-15', 'Referral'),
            (3, 'Michelle', 'Ross', 'michelle.ross@email.com', '555-0103', '1990-11-08', 'Scottsdale', 'AZ', '2021-02-01', 'Instagram'),
            (4, 'Laura', 'Bennett', 'laura.bennett@email.com', '555-0104', '1982-05-30', 'Tempe', 'AZ', '2021-02-20', 'Google'),
            (5, 'Sarah', 'Cooper', NULL, '555-0105', '1995-09-12', 'Mesa', 'AZ', '2021-03-05', 'Walk-in'),
            (6, 'Amanda', 'Wood', 'amanda.wood@email.com', '555-0106', '1988-01-25', 'Chandler', 'AZ', '2021-03-15', 'Referral'),
            (7, 'Stephanie', 'Barnes', 'stephanie.barnes@email.com', '555-0107', '1975-12-03', 'Paradise Valley', 'AZ', '2021-04-01', 'Facebook'),
            (8, 'Nicole', 'Henderson', 'nicole.henderson@email.com', '555-0108', '1992-08-17', 'Scottsdale', 'AZ', '2021-04-20', 'Instagram'),
            (9, 'Elizabeth', 'Coleman', NULL, '555-0109', '1987-04-09', 'Gilbert', 'AZ', '2021-05-10', 'Google'),
            (10, 'Melissa', 'Patterson', 'melissa.patterson@email.com', '555-0110', '1980-10-28', 'Scottsdale', 'AZ', '2021-06-01', 'Yelp'),
            (11, 'Amy', 'Hughes', 'amy.hughes@email.com', '555-0111', '1993-02-14', 'Phoenix', 'AZ', '2021-06-15', 'Referral'),
            (12, 'Andrea', 'Flores', 'andrea.flores@email.com', '555-0112', '1979-06-20', 'Scottsdale', 'AZ', '2021-07-01', 'Google'),
            (13, 'Rebecca', 'Washington', NULL, '555-0113', '1991-11-15', 'Tempe', 'AZ', '2021-08-10', 'Instagram'),
            (14, 'Linda', 'Butler', 'linda.butler@email.com', '555-0114', '1970-03-22', 'Paradise Valley', 'AZ', '2021-09-01', 'Referral'),
            (15, 'Kimberly', 'Simmons', 'kimberly.simmons@email.com', '555-0115', '1984-07-08', 'Scottsdale', 'AZ', '2021-09-20', 'Google'),
            (16, 'Christina', 'Foster', 'christina.foster@email.com', '555-0116', '1996-12-01', 'Phoenix', 'AZ', '2021-10-05', 'TikTok'),
            (17, 'Tara', 'Gonzalez', 'tara.gonzalez@email.com', NULL, '1983-05-18', 'Chandler', 'AZ', '2021-11-15', 'Referral'),
            (18, 'Heather', 'Bryant', 'heather.bryant@email.com', '555-0118', '1977-09-30', 'Scottsdale', 'AZ', '2021-12-01', 'Google'),
            (19, 'Rachel', 'Alexander', 'rachel.alexander@email.com', '555-0119', '1989-01-07', 'Gilbert', 'AZ', '2022-01-10', 'Instagram'),
            (20, 'Patricia', 'Russell', 'patricia.russell@email.com', '555-0120', '1973-08-25', 'Paradise Valley', 'AZ', '2022-02-01', 'Referral'),
            (21, 'Sandra', 'Griffin', 'sandra.griffin@email.com', '555-0121', '1986-04-12', 'Scottsdale', 'AZ', '2022-02-20', 'Google'),
            (22, 'Catherine', 'Diaz', 'catherine.diaz@email.com', '555-0122', '1994-10-05', 'Phoenix', 'AZ', '2022-03-15', 'Facebook'),
            (23, 'Diane', 'Hayes', NULL, '555-0123', '1981-06-28', 'Mesa', 'AZ', '2022-04-01', 'Walk-in'),
            (24, 'Ruth', 'Myers', 'ruth.myers@email.com', '555-0124', '1968-02-14', 'Scottsdale', 'AZ', '2022-05-10', 'Referral'),
            (25, 'Virginia', 'Ford', 'virginia.ford@email.com', '555-0125', '1997-07-19', 'Tempe', 'AZ', '2022-06-01', 'Instagram'),
            (26, 'Deborah', 'Hamilton', 'deborah.hamilton@email.com', '555-0126', '1976-11-03', 'Chandler', 'AZ', '2022-07-15', 'Google'),
            (27, 'Pamela', 'Graham', 'pamela.graham@email.com', NULL, '1972-03-30', 'Paradise Valley', 'AZ', '2022-08-01', 'Referral'),
            (28, 'Martha', 'Sullivan', 'martha.sullivan@email.com', '555-0128', '1965-09-08', 'Scottsdale', 'AZ', '2022-09-10', 'Google'),
            (29, 'Cynthia', 'Wallace', 'cynthia.wallace@email.com', '555-0129', '1998-01-22', 'Phoenix', 'AZ', '2022-10-01', 'TikTok'),
            (30, 'Janet', 'West', 'janet.west@email.com', '555-0130', '1974-05-15', 'Scottsdale', 'AZ', '2022-11-15', 'Referral'),
            (31, 'Anna', 'Jordan', 'anna.jordan@email.com', '555-0131', '1990-08-20', 'Gilbert', 'AZ', '2022-12-01', 'Google'),
            (32, 'Marie', 'Reynolds', NULL, '555-0132', '1985-12-10', 'Mesa', 'AZ', '2023-01-10', 'Instagram'),
            (33, 'Frances', 'Fisher', 'frances.fisher@email.com', '555-0133', '1969-04-05', 'Paradise Valley', 'AZ', '2023-02-01', 'Referral'),
            (34, 'Gloria', 'Webb', 'gloria.webb@email.com', '555-0134', '1993-06-30', 'Scottsdale', 'AZ', '2023-03-15', 'Google'),
            (35, 'Teresa', 'Simpson', 'teresa.simpson@email.com', '555-0135', '1981-10-22', 'Phoenix', 'AZ', '2023-04-01', 'Facebook'),
            (36, 'Judy', 'Stevens', 'judy.stevens@email.com', '555-0136', '1971-02-18', 'Scottsdale', 'AZ', '2023-05-10', 'Referral'),
            (37, 'Grace', 'Weaver', 'grace.weaver@email.com', NULL, '1988-07-14', 'Chandler', 'AZ', '2023-06-01', 'Walk-in'),
            (38, 'Denise', 'Dixon', 'denise.dixon@email.com', '555-0138', '1977-11-28', 'Tempe', 'AZ', '2023-07-15', 'Google'),
            (39, 'Tammy', 'Hunt', 'tammy.hunt@email.com', '555-0139', '1995-03-09', 'Scottsdale', 'AZ', '2023-08-01', 'Instagram'),
            (40, 'Irene', 'Palmer', 'irene.palmer@email.com', '555-0140', '1966-09-25', 'Paradise Valley', 'AZ', '2023-09-10', 'Referral'),
            (41, 'Robert', 'Stone', 'robert.stone@email.com', '555-0141', '1980-05-12', 'Scottsdale', 'AZ', '2023-10-01', 'Google'),
            (42, 'James', 'Crawford', 'james.crawford@email.com', '555-0142', '1975-08-03', 'Phoenix', 'AZ', '2023-11-15', 'Referral'),
            (43, 'Michael', 'Warren', NULL, '555-0143', '1992-01-28', 'Mesa', 'AZ', '2023-12-01', 'Instagram'),
            (44, 'David', 'Olson', 'david.olson@email.com', '555-0144', '1987-04-17', 'Scottsdale', 'AZ', '2024-01-10', 'Google'),
            (45, 'Thomas', 'Burns', 'thomas.burns@email.com', '555-0145', '1983-10-08', 'Gilbert', 'AZ', '2024-02-01', 'Referral'),
            (46, 'Sophia', 'Kim', 'sophia.kim@email.com', '555-0146', '1999-06-20', 'Scottsdale', 'AZ', '2024-03-15', 'TikTok'),
            (47, 'Olivia', 'Zhang', 'olivia.zhang@email.com', '555-0147', '1991-12-14', 'Phoenix', 'AZ', '2024-04-01', 'Google'),
            (48, 'Emma', 'Reyes', 'emma.reyes@email.com', NULL, '1986-03-25', 'Chandler', 'AZ', '2024-05-10', 'Walk-in'),
            (49, 'Isabella', 'Murphy', 'isabella.murphy@email.com', '555-0149', '1994-08-11', 'Scottsdale', 'AZ', '2024-06-01', 'Instagram'),
            (50, 'Mia', 'Cox', 'mia.cox@email.com', '555-0150', '1978-02-07', 'Paradise Valley', 'AZ', '2024-07-15', 'Referral'),
            (51, 'Charlotte', 'Howard', 'charlotte.howard@email.com', '555-0151', '1984-11-30', 'Scottsdale', 'AZ', '2021-03-10', 'Google'),
            (52, 'Amelia', 'Ward', 'amelia.ward@email.com', '555-0152', '1996-05-22', 'Tempe', 'AZ', '2021-07-20', 'Instagram'),
            (53, 'Harper', 'Torres', NULL, '555-0153', '1989-09-14', 'Phoenix', 'AZ', '2022-01-05', 'Referral'),
            (54, 'Evelyn', 'Peterson', 'evelyn.peterson@email.com', '555-0154', '1973-01-08', 'Paradise Valley', 'AZ', '2022-04-15', 'Google'),
            (55, 'Abigail', 'Gray', 'abigail.gray@email.com', '555-0155', '1997-07-03', 'Scottsdale', 'AZ', '2022-08-20', 'Facebook'),
            (56, 'Emily', 'Ramirez', 'emily.ramirez@email.com', '555-0156', '1982-12-18', 'Gilbert', 'AZ', '2022-11-01', 'Referral'),
            (57, 'Scarlett', 'James', 'scarlett.james@email.com', NULL, '1990-04-25', 'Mesa', 'AZ', '2023-02-10', 'Walk-in'),
            (58, 'Madison', 'Watson', 'madison.watson@email.com', '555-0158', '1976-08-09', 'Scottsdale', 'AZ', '2023-05-20', 'Google'),
            (59, 'Luna', 'Brooks', 'luna.brooks@email.com', '555-0159', '1999-02-28', 'Phoenix', 'AZ', '2023-09-01', 'TikTok'),
            (60, 'Chloe', 'Kelly', 'chloe.kelly@email.com', '555-0160', '1985-06-14', 'Chandler', 'AZ', '2023-12-15', 'Referral'),
            (61, 'Penelope', 'Price', 'penelope.price@email.com', '555-0161', '1979-10-30', 'Scottsdale', 'AZ', '2021-05-01', 'Google'),
            (62, 'Layla', 'Bennett', 'layla.bennett@email.com', '555-0162', '1993-03-17', 'Tempe', 'AZ', '2021-09-10', 'Instagram'),
            (63, 'Riley', 'Ross', NULL, '555-0163', '1988-07-05', 'Phoenix', 'AZ', '2022-02-20', 'Referral'),
            (64, 'Zoey', 'Henderson', 'zoey.henderson@email.com', '555-0164', '1971-11-22', 'Paradise Valley', 'AZ', '2022-06-05', 'Google'),
            (65, 'Nora', 'Coleman', 'nora.coleman@email.com', '555-0165', '1998-01-13', 'Scottsdale', 'AZ', '2022-10-15', 'TikTok'),
            (66, 'Lily', 'Jenkins', 'lily.jenkins@email.com', '555-0166', '1983-05-29', 'Gilbert', 'AZ', '2023-01-20', 'Referral'),
            (67, 'Eleanor', 'Perry', 'eleanor.perry@email.com', NULL, '1975-09-06', 'Mesa', 'AZ', '2023-04-10', 'Walk-in'),
            (68, 'Hannah', 'Powell', 'hannah.powell@email.com', '555-0168', '1992-12-20', 'Scottsdale', 'AZ', '2023-08-01', 'Google'),
            (69, 'Lillian', 'Long', 'lillian.long@email.com', '555-0169', '1986-04-15', 'Phoenix', 'AZ', '2023-11-10', 'Instagram'),
            (70, 'Addison', 'Patterson', 'addison.patterson@email.com', '555-0170', '1980-08-02', 'Chandler', 'AZ', '2024-02-20', 'Referral'),
            (71, 'Aubrey', 'Hughes', 'aubrey.hughes@email.com', '555-0171', '1995-02-11', 'Scottsdale', 'AZ', '2024-04-05', 'Google'),
            (72, 'Natalie', 'Flores', 'natalie.flores@email.com', NULL, '1974-06-28', 'Paradise Valley', 'AZ', '2024-05-20', 'Referral'),
            (73, 'Leah', 'Washington', 'leah.washington@email.com', '555-0173', '1991-10-17', 'Tempe', 'AZ', '2024-06-10', 'Instagram'),
            (74, 'Savannah', 'Butler', 'savannah.butler@email.com', '555-0174', '1987-03-04', 'Scottsdale', 'AZ', '2024-07-01', 'Google'),
            (75, 'Brooklyn', 'Simmons', 'brooklyn.simmons@email.com', '555-0175', '1996-07-19', 'Phoenix', 'AZ', '2024-08-15', 'TikTok'),
            (76, 'Victoria', 'Foster', 'victoria.foster@email.com', '555-0176', '1970-11-25', 'Paradise Valley', 'AZ', '2021-04-10', 'Referral'),
            (77, 'Claire', 'Gonzalez', NULL, '555-0177', '1984-01-30', 'Gilbert', 'AZ', '2022-03-05', 'Google'),
            (78, 'Stella', 'Bryant', 'stella.bryant@email.com', '555-0178', '1993-05-08', 'Scottsdale', 'AZ', '2023-06-20', 'Instagram'),
            (79, 'Hazel', 'Alexander', 'hazel.alexander@email.com', '555-0179', '1989-09-26', 'Mesa', 'AZ', '2024-01-15', 'Walk-in'),
            (80, 'Aurora', 'Russell', 'aurora.russell@email.com', '555-0180', '1977-12-12', 'Scottsdale', 'AZ', '2024-03-30', 'Referral');
        `);

        // Treatment Categories (hierarchical — for recursive CTE exercises)
        db.run(`INSERT INTO treatment_categories VALUES
            (1, 'All Services', NULL),
            (2, 'Facial Treatments', 1),
            (3, 'Injectable Services', 1),
            (4, 'Laser Services', 1),
            (5, 'Body Services', 1),
            (6, 'Wellness', 1),
            (7, 'Chemical Peels', 2),
            (8, 'Facials', 2),
            (9, 'Microneedling', 2),
            (10, 'Botox & Dysport', 3),
            (11, 'Dermal Fillers', 3),
            (12, 'Laser Hair Removal', 4),
            (13, 'Skin Rejuvenation', 4),
            (14, 'Body Contouring', 5),
            (15, 'Skin Tightening', 5),
            (16, 'IV Therapy', 6),
            (17, 'Light Peels', 7),
            (18, 'Medium Peels', 7),
            (19, 'Deep Peels', 7);
        `);

        // Treatments (40 services)
        db.run(`INSERT INTO treatments VALUES
            (1, 'Classic Facial', 'Facials', 60, 120.00, 'Deep cleansing facial with extraction and mask'),
            (2, 'HydraFacial', 'Facials', 45, 199.00, 'Multi-step treatment: cleanse, peel, extract, hydrate'),
            (3, 'Anti-Aging Facial', 'Facials', 75, 175.00, 'Targeted treatment for fine lines and wrinkles'),
            (4, 'Acne Facial', 'Facials', 60, 150.00, 'Specialized treatment for acne-prone skin'),
            (5, 'Glycolic Peel', 'Chemical Peels', 30, 150.00, 'Light chemical peel for skin brightening'),
            (6, 'TCA Peel', 'Chemical Peels', 45, 250.00, 'Medium-depth peel for pigmentation and scars'),
            (7, 'Jessner Peel', 'Chemical Peels', 30, 200.00, 'Combination peel for oily/acne skin'),
            (8, 'Microneedling', 'Microneedling', 60, 300.00, 'Collagen induction therapy with micro-needles'),
            (9, 'Microneedling with PRP', 'Microneedling', 90, 500.00, 'Vampire facial - microneedling with platelet-rich plasma'),
            (10, 'Botox - Forehead', 'Botox & Dysport', 15, 250.00, 'Botulinum toxin for forehead lines'),
            (11, 'Botox - Crows Feet', 'Botox & Dysport', 15, 200.00, 'Botulinum toxin for eye area wrinkles'),
            (12, 'Botox - Full Face', 'Botox & Dysport', 30, 450.00, 'Comprehensive Botox treatment'),
            (13, 'Dysport - Full Face', 'Botox & Dysport', 30, 400.00, 'Dysport comprehensive treatment'),
            (14, 'Lip Filler', 'Dermal Fillers', 30, 650.00, 'Hyaluronic acid lip augmentation'),
            (15, 'Cheek Filler', 'Dermal Fillers', 45, 800.00, 'Volume restoration for cheeks'),
            (16, 'Jawline Filler', 'Dermal Fillers', 45, 900.00, 'Jawline sculpting with dermal filler'),
            (17, 'Under-Eye Filler', 'Dermal Fillers', 30, 750.00, 'Tear trough treatment'),
            (18, 'Laser Hair Removal - Small', 'Laser Hair Removal', 15, 100.00, 'Upper lip, chin, or underarms'),
            (19, 'Laser Hair Removal - Medium', 'Laser Hair Removal', 30, 200.00, 'Bikini, arms, or lower legs'),
            (20, 'Laser Hair Removal - Large', 'Laser Hair Removal', 60, 350.00, 'Full legs, back, or chest'),
            (21, 'IPL Photofacial', 'Skin Rejuvenation', 30, 300.00, 'Intense pulsed light for sun damage and redness'),
            (22, 'Fractional Laser', 'Skin Rejuvenation', 45, 500.00, 'Fractional CO2 for skin resurfacing'),
            (23, 'Laser Skin Tightening', 'Skin Tightening', 45, 400.00, 'Non-invasive skin tightening'),
            (24, 'CoolSculpting - Small', 'Body Contouring', 35, 600.00, 'Fat reduction for chin or small area'),
            (25, 'CoolSculpting - Large', 'Body Contouring', 60, 900.00, 'Fat reduction for abdomen or flanks'),
            (26, 'Body Sculpting Package', 'Body Contouring', 90, 1500.00, 'Multi-area body contouring session'),
            (27, 'Cellulite Treatment', 'Body Contouring', 45, 350.00, 'Acoustic wave cellulite reduction'),
            (28, 'IV Hydration - Basic', 'IV Therapy', 30, 150.00, 'Saline with B-vitamins'),
            (29, 'IV Hydration - Premium', 'IV Therapy', 45, 250.00, 'Myers cocktail with glutathione'),
            (30, 'IV Vitamin C Drip', 'IV Therapy', 60, 200.00, 'High-dose vitamin C infusion'),
            (31, 'Dermaplaning', 'Facials', 30, 100.00, 'Exfoliation and peach fuzz removal'),
            (32, 'LED Light Therapy', 'Facials', 20, 75.00, 'Red/blue light for healing and acne'),
            (33, 'Oxygen Facial', 'Facials', 45, 160.00, 'Pressurized oxygen with serums'),
            (34, 'Scar Revision Laser', 'Skin Rejuvenation', 30, 400.00, 'Targeted laser for scar reduction'),
            (35, 'Tattoo Removal - Small', 'Laser Services', 15, 200.00, 'Q-switch laser tattoo removal'),
            (36, 'Skin Tag Removal', 'Laser Services', 15, 125.00, 'Electrocautery skin tag removal'),
            (37, 'Kybella', 'Injectables', 30, 1200.00, 'Deoxycholic acid for double chin reduction'),
            (38, 'PRP Hair Restoration', 'Wellness', 60, 800.00, 'Platelet-rich plasma for hair regrowth'),
            (39, 'Microblading', 'Aesthetics', 120, 500.00, 'Semi-permanent eyebrow tattooing'),
            (40, 'Lash Lift & Tint', 'Aesthetics', 45, 120.00, 'Lash perm and tinting');
        `);

        // Products (skincare retail + professional products)
        db.run(`INSERT INTO products VALUES
            (1, 'Vitamin C Serum 30ml', 'SkinCeuticals', 'Serums', 166.00, 82.00, 45, 1),
            (2, 'Hyaluronic Acid Serum', 'SkinCeuticals', 'Serums', 98.00, 48.00, 60, 1),
            (3, 'Retinol Cream 0.5%', 'Obagi', 'Anti-Aging', 78.00, 38.00, 35, 1),
            (4, 'Retinol Cream 1.0%', 'Obagi', 'Anti-Aging', 98.00, 48.00, 25, 1),
            (5, 'SPF 50 Sunscreen', 'EltaMD', 'Sun Protection', 39.00, 18.00, 120, 1),
            (6, 'Tinted Sunscreen SPF 46', 'EltaMD', 'Sun Protection', 42.00, 20.00, 95, 1),
            (7, 'Gentle Cleanser 200ml', 'CeraVe', 'Cleansers', 16.00, 7.00, 80, 1),
            (8, 'Foaming Cleanser 150ml', 'Obagi', 'Cleansers', 38.00, 18.00, 55, 1),
            (9, 'Moisturizer SPF 30', 'SkinCeuticals', 'Moisturizers', 68.00, 33.00, 40, 1),
            (10, 'Night Repair Cream', 'Obagi', 'Moisturizers', 120.00, 58.00, 30, 1),
            (11, 'Eye Cream', 'SkinCeuticals', 'Eye Care', 98.00, 48.00, 35, 1),
            (12, 'Growth Factor Serum', 'SkinMedica', 'Serums', 178.00, 88.00, 20, 1),
            (13, 'Brightening Pads 60ct', 'Obagi', 'Exfoliants', 45.00, 22.00, 50, 1),
            (14, 'Lip Balm SPF 30', 'EltaMD', 'Lip Care', 12.00, 5.00, 150, 1),
            (15, 'Post-Procedure Kit', 'SkinCeuticals', 'Kits', 85.00, 42.00, 25, 1),
            (16, 'Acne Kit', 'Obagi', 'Kits', 120.00, 58.00, 20, 1),
            (17, 'Hydrating Mask 6-pack', 'SkinMedica', 'Masks', 55.00, 26.00, 40, 1),
            (18, 'Collagen Sheet Mask', 'Generic', 'Masks', 8.00, 2.00, 200, 1),
            (19, 'Glycolic Toner 200ml', 'Obagi', 'Toners', 42.00, 20.00, 45, 1),
            (20, 'Micellar Water 400ml', 'Bioderma', 'Cleansers', 15.00, 6.00, 70, 1),
            (21, 'Professional Peel Solution', 'Obagi', 'Professional', 185.00, 90.00, 15, 0),
            (22, 'Botox 100 Units', 'Allergan', 'Professional', 400.00, 400.00, 50, 0),
            (23, 'Juvederm Ultra XC', 'Allergan', 'Professional', 350.00, 350.00, 30, 0),
            (24, 'Restylane Lyft', 'Galderma', 'Professional', 380.00, 380.00, 25, 0),
            (25, 'Sculptra 1 Vial', 'Galderma', 'Professional', 450.00, 450.00, 20, 0),
            (26, 'Kybella 2-pack', 'Allergan', 'Professional', 600.00, 600.00, 10, 0),
            (27, 'Numbing Cream 30g', 'Generic', 'Professional', 25.00, 8.00, 100, 0),
            (28, 'Aftercare Ointment', 'Aquaphor', 'Post-Care', 12.00, 4.00, 200, 1),
            (29, 'Scar Gel 15ml', 'SkinMedica', 'Post-Care', 48.00, 23.00, 35, 1),
            (30, 'Body Firming Cream', 'SkinCeuticals', 'Body Care', 72.00, 35.00, 30, 1);
        `);

        // Appointments (generate ~300 across 2022-2024)
        const apptRows = [];
        const apptStatuses = ['completed', 'completed', 'completed', 'completed', 'cancelled', 'no-show', 'completed'];
        const providers = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 23, 24, 25, 26];
        let apptId = 1;

        for (let year = 2022; year <= 2024; year++) {
            for (let month = 1; month <= 12; month++) {
                if (year === 2024 && month > 9) break;
                const count = 8 + (month % 4); // 8-11 appointments per month
                for (let i = 0; i < count; i++) {
                    const clientId = ((apptId * 7 + 3) % 80) + 1;
                    const staffId = providers[apptId % providers.length];
                    const treatmentId = ((apptId * 11 + 5) % 40) + 1;
                    const day = ((apptId * 3) % 28) + 1;
                    const m = String(month).padStart(2, '0');
                    const d = String(day).padStart(2, '0');
                    const hour = 9 + (apptId % 8);
                    const mins = (apptId % 4) * 15;
                    const status = year < 2024 ? apptStatuses[(apptId * 13) % apptStatuses.length] :
                        (month < 9 ? apptStatuses[apptId % apptStatuses.length] : 'scheduled');
                    const note = apptId % 5 === 0 ? "'Returning client - check previous notes'" : 'NULL';
                    apptRows.push(`(${apptId}, ${clientId}, ${staffId}, ${treatmentId}, '${year}-${m}-${d} ${String(hour).padStart(2,'0')}:${String(mins).padStart(2,'0')}', '${status}', ${note})`);
                    apptId++;
                }
            }
        }

        db.run(`INSERT INTO appointments VALUES ${apptRows.join(',\n')};`);

        // Invoices (one per completed appointment + some product-only invoices)
        const invoiceRows = [];
        const payMethods = ['Credit Card', 'Credit Card', 'Debit Card', 'Cash', 'Credit Card', 'HSA', 'Credit Card', 'Care Credit'];
        let invoiceId = 1;

        for (let aid = 1; aid < apptId; aid++) {
            // Only completed appointments get invoices
            const status = apptStatuses[(aid * 13) % apptStatuses.length];
            if (aid >= apptId - 30) continue; // Recent scheduled ones don't have invoices
            if (status === 'cancelled' || status === 'no-show') continue;

            const clientId = ((aid * 7 + 3) % 80) + 1;
            const treatmentId = ((aid * 11 + 5) % 40) + 1;
            const prices = [120,199,175,150,150,250,200,300,500,250,200,450,400,650,800,900,750,100,200,350,300,500,400,600,900,1500,350,150,250,200,100,75,160,400,200,125,1200,800,500,120];
            const baseAmount = prices[treatmentId - 1];
            const discount = aid % 7 === 0 ? Math.round(baseAmount * 0.1) : 0;
            const tax = Math.round((baseAmount - discount) * 0.08 * 100) / 100;
            const pay = payMethods[aid % payMethods.length];

            // Reconstruct the date
            const year = aid <= 120 ? 2022 : (aid <= 240 ? 2023 : 2024);
            const monthInYear = Math.ceil(((aid - 1) % 120 + 1) / 10);
            const month = Math.min(monthInYear, 12);
            const day = ((aid * 3) % 28) + 1;
            const m = String(month).padStart(2, '0');
            const d = String(day).padStart(2, '0');

            invoiceRows.push(`(${invoiceId}, ${aid}, ${clientId}, ${baseAmount}, ${discount}, ${tax}, '${pay}', '${year}-${m}-${d}', 'paid')`);
            invoiceId++;
        }

        db.run(`INSERT INTO invoices VALUES ${invoiceRows.join(',\n')};`);

        // Product sales (attach retail sales to ~40% of invoices)
        const saleRows = [];
        let saleId = 1;
        const retailProducts = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,28,29,30];
        const retailPrices = [166,98,78,98,39,42,16,38,68,120,98,178,45,12,85,120,55,8,42,15,12,48,72];

        for (let iid = 1; iid < invoiceId; iid++) {
            if (iid % 3 !== 0) continue; // ~33% of invoices have product sales
            const numProducts = 1 + (iid % 3);
            for (let j = 0; j < numProducts; j++) {
                const pidx = (iid * 7 + j * 3) % retailProducts.length;
                const prodId = retailProducts[pidx];
                const price = retailPrices[pidx];
                const qty = 1 + (iid % 2);
                saleRows.push(`(${saleId}, ${iid}, ${prodId}, ${qty}, ${price})`);
                saleId++;
            }
        }

        db.run(`INSERT INTO product_sales VALUES ${saleRows.join(',\n')};`);
    }

    function runQuery(sql) {
        const start = performance.now();
        try {
            const results = db.exec(sql);
            const elapsed = (performance.now() - start).toFixed(1);

            if (results.length === 0) {
                const changes = db.getRowsModified();
                if (changes > 0) {
                    return { columns: ['Result'], values: [[`${changes} row(s) affected`]], error: null, time: elapsed };
                }
                return { columns: ['Result'], values: [['Query executed successfully. No rows returned.']], error: null, time: elapsed };
            }

            const last = results[results.length - 1];
            return { columns: last.columns, values: last.values, error: null, time: elapsed };
        } catch (e) {
            const elapsed = (performance.now() - start).toFixed(1);
            return { columns: [], values: [], error: e.message, time: elapsed };
        }
    }

    function resetDatabase() {
        if (db) db.close();
        db = new SQL.Database();
        createSchema();
        seedData();
    }

    function getSchema() {
        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;");
        if (!tables.length) return [];
        return tables[0].values.map(([name]) => {
            const info = db.exec(`PRAGMA table_info(${name});`);
            const columns = info.length ? info[0].values.map(row => ({
                name: row[1],
                type: row[2],
                pk: row[5] === 1
            })) : [];
            return { name, columns };
        });
    }

    return { init, runQuery, resetDatabase, getSchema };
})();
