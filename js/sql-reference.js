// sql-reference.js — SQL command & function reference for the Command Explorer

const SQL_REFERENCE = [
    // ===== QUERYING =====
    {
        category: 'Querying',
        commands: [
            {
                name: 'SELECT',
                syntax: 'SELECT column1, column2 FROM table_name;',
                description: 'Retrieves data from one or more tables. The foundation of every SQL query.',
                example: "SELECT first_name, last_name, email FROM clients;",
                module: 1
            },
            {
                name: 'SELECT *',
                syntax: 'SELECT * FROM table_name;',
                description: 'Selects all columns from a table. Handy for exploration, but prefer named columns in production.',
                example: "SELECT * FROM treatments;",
                module: 1
            },
            {
                name: 'DISTINCT',
                syntax: 'SELECT DISTINCT column FROM table_name;',
                description: 'Returns only unique values, removing duplicates from the result set.',
                example: "SELECT DISTINCT city FROM clients;",
                module: 1
            },
            {
                name: 'AS (Alias)',
                syntax: "SELECT column AS alias_name FROM table_name;",
                description: 'Gives a column or table a temporary name in the result set. Makes output more readable.',
                example: "SELECT first_name || ' ' || last_name AS full_name FROM clients;",
                module: 1
            },
            {
                name: 'WHERE',
                syntax: 'SELECT ... FROM table WHERE condition;',
                description: 'Filters rows based on a condition. Only rows where the condition is TRUE are returned.',
                example: "SELECT * FROM treatments WHERE price > 200;",
                module: 2
            },
            {
                name: 'AND / OR',
                syntax: "WHERE condition1 AND condition2\nWHERE condition1 OR condition2",
                description: 'Combines multiple conditions. AND requires both to be true; OR requires at least one.',
                example: "SELECT * FROM clients WHERE city = 'Austin' AND state = 'TX';",
                module: 2
            },
            {
                name: 'NOT',
                syntax: 'WHERE NOT condition',
                description: 'Negates a condition — returns rows where the condition is FALSE.',
                example: "SELECT * FROM appointments WHERE NOT status = 'cancelled';",
                module: 2
            },
            {
                name: 'IN',
                syntax: "WHERE column IN (value1, value2, ...)",
                description: 'Checks if a value matches any value in a list. Cleaner than multiple OR conditions.',
                example: "SELECT * FROM treatments WHERE category IN ('Facial', 'Laser');",
                module: 2
            },
            {
                name: 'BETWEEN',
                syntax: 'WHERE column BETWEEN low AND high',
                description: 'Filters values within a range (inclusive of both endpoints).',
                example: "SELECT * FROM treatments WHERE price BETWEEN 100 AND 300;",
                module: 2
            },
            {
                name: 'LIKE',
                syntax: "WHERE column LIKE 'pattern'",
                description: 'Pattern matching with wildcards. % matches any sequence of characters; _ matches exactly one character.',
                example: "SELECT * FROM treatments WHERE treatment_name LIKE '%Laser%';",
                module: 2
            },
            {
                name: 'IS NULL / IS NOT NULL',
                syntax: 'WHERE column IS NULL\nWHERE column IS NOT NULL',
                description: 'Tests for NULL (missing/unknown) values. Use IS NULL, not = NULL.',
                example: "SELECT * FROM clients WHERE email IS NOT NULL;",
                module: 2
            },
            {
                name: 'ORDER BY',
                syntax: 'SELECT ... ORDER BY column [ASC|DESC];',
                description: 'Sorts results by one or more columns. ASC (ascending) is the default; DESC sorts descending.',
                example: "SELECT * FROM treatments ORDER BY price DESC;",
                module: 3
            },
            {
                name: 'LIMIT',
                syntax: 'SELECT ... LIMIT number;',
                description: 'Restricts the number of rows returned. Essential for previewing large tables or "top N" queries.',
                example: "SELECT * FROM clients ORDER BY signup_date DESC LIMIT 5;",
                module: 3
            },
            {
                name: 'OFFSET',
                syntax: 'SELECT ... LIMIT number OFFSET skip;',
                description: 'Skips a number of rows before returning results. Used with LIMIT for pagination.',
                example: "SELECT * FROM products ORDER BY product_name LIMIT 5 OFFSET 10;",
                module: 3
            },
            {
                name: 'GROUP BY',
                syntax: 'SELECT column, AGG(col) FROM table GROUP BY column;',
                description: 'Groups rows that share a value, letting you apply aggregate functions to each group.',
                example: "SELECT category, COUNT(*) FROM treatments GROUP BY category;",
                module: 4
            },
            {
                name: 'HAVING',
                syntax: 'SELECT ... GROUP BY column HAVING condition;',
                description: 'Filters groups after GROUP BY (WHERE filters individual rows; HAVING filters aggregated groups).',
                example: "SELECT category, AVG(price) AS avg_price FROM treatments GROUP BY category HAVING AVG(price) > 200;",
                module: 4
            },
            {
                name: 'UNION / UNION ALL',
                syntax: 'SELECT ... UNION SELECT ...\nSELECT ... UNION ALL SELECT ...',
                description: 'Combines results from two queries. UNION removes duplicates; UNION ALL keeps them.',
                example: "SELECT first_name, last_name, 'Staff' AS type FROM staff\nUNION\nSELECT first_name, last_name, 'Client' AS type FROM clients;",
                module: 11
            }
        ]
    },

    // ===== JOINS =====
    {
        category: 'Joins',
        commands: [
            {
                name: 'INNER JOIN',
                syntax: 'SELECT ... FROM table1 JOIN table2 ON table1.col = table2.col;',
                description: 'Returns rows that have matching values in both tables. The most common join type.',
                example: "SELECT c.first_name, t.treatment_name\nFROM appointments a\nJOIN clients c ON a.client_id = c.client_id\nJOIN treatments t ON a.treatment_id = t.treatment_id;",
                module: 5
            },
            {
                name: 'LEFT JOIN',
                syntax: 'SELECT ... FROM table1 LEFT JOIN table2 ON ...;',
                description: 'Returns all rows from the left table, plus matching rows from the right. Non-matches get NULL.',
                example: "SELECT c.first_name, a.appointment_date\nFROM clients c\nLEFT JOIN appointments a ON c.client_id = a.client_id;",
                module: 5
            },
            {
                name: 'CROSS JOIN',
                syntax: 'SELECT ... FROM table1 CROSS JOIN table2;',
                description: 'Returns the Cartesian product — every combination of rows from both tables.',
                example: "SELECT s.first_name, t.treatment_name\nFROM staff s CROSS JOIN treatments t;",
                module: 5
            },
            {
                name: 'Self JOIN',
                syntax: 'SELECT ... FROM table t1 JOIN table t2 ON t1.col = t2.col;',
                description: 'Joins a table with itself. Useful for comparing rows within the same table.',
                example: "SELECT s1.first_name AS emp, s2.first_name AS mgr\nFROM staff s1\nJOIN staff s2 ON s1.department_id = s2.department_id\nWHERE s1.staff_id != s2.staff_id;",
                module: 5
            }
        ]
    },

    // ===== AGGREGATE FUNCTIONS =====
    {
        category: 'Aggregate Functions',
        commands: [
            {
                name: 'COUNT',
                syntax: 'COUNT(*) or COUNT(column)',
                description: 'Counts rows. COUNT(*) counts all rows; COUNT(column) counts non-NULL values in that column.',
                example: "SELECT COUNT(*) AS total_clients FROM clients;",
                module: 4
            },
            {
                name: 'SUM',
                syntax: 'SUM(column)',
                description: 'Returns the total of all numeric values in a column.',
                example: "SELECT SUM(amount) AS total_revenue FROM invoices;",
                module: 4
            },
            {
                name: 'AVG',
                syntax: 'AVG(column)',
                description: 'Returns the average (mean) of numeric values. Ignores NULL values.',
                example: "SELECT AVG(price) AS avg_treatment_price FROM treatments;",
                module: 4
            },
            {
                name: 'MIN',
                syntax: 'MIN(column)',
                description: 'Returns the smallest value in a column. Works on numbers, text, and dates.',
                example: "SELECT MIN(price) AS cheapest FROM treatments;",
                module: 4
            },
            {
                name: 'MAX',
                syntax: 'MAX(column)',
                description: 'Returns the largest value in a column. Works on numbers, text, and dates.',
                example: "SELECT MAX(price) AS most_expensive FROM treatments;",
                module: 4
            },
            {
                name: 'GROUP_CONCAT',
                syntax: "GROUP_CONCAT(column, separator)",
                description: 'Concatenates values from multiple rows into a single string, with an optional separator.',
                example: "SELECT category, GROUP_CONCAT(treatment_name, ', ') AS treatments\nFROM treatments GROUP BY category;",
                module: 4
            }
        ]
    },

    // ===== MATH & ROUNDING =====
    {
        category: 'Math & Rounding',
        commands: [
            {
                name: 'ROUND',
                syntax: 'ROUND(number, decimals)',
                description: 'Rounds a number to a specified number of decimal places. Defaults to 0 decimals if omitted.',
                example: "SELECT treatment_name, ROUND(price * 1.08, 2) AS price_with_tax\nFROM treatments;",
                module: 4
            },
            {
                name: 'ABS',
                syntax: 'ABS(number)',
                description: 'Returns the absolute (positive) value of a number.',
                example: "SELECT ABS(-42); -- returns 42",
                module: 11
            },
            {
                name: 'CAST',
                syntax: "CAST(expression AS type)",
                description: 'Converts a value to a different data type (INTEGER, REAL, TEXT, etc.).',
                example: "SELECT CAST(price AS INTEGER) AS rounded_price FROM treatments;",
                module: 11
            },
            {
                name: '|| (Concatenation)',
                syntax: "expression1 || expression2",
                description: 'Joins two strings together. SQLite uses || instead of CONCAT().',
                example: "SELECT first_name || ' ' || last_name AS full_name FROM clients;",
                module: 1
            },
            {
                name: 'COALESCE',
                syntax: 'COALESCE(value1, value2, ...)',
                description: 'Returns the first non-NULL value from the list. Great for providing default values.',
                example: "SELECT first_name, COALESCE(email, 'No email on file') AS email\nFROM clients;",
                module: 11
            },
            {
                name: 'NULLIF',
                syntax: 'NULLIF(expression1, expression2)',
                description: 'Returns NULL if the two expressions are equal; otherwise returns the first expression. Useful to avoid division by zero.',
                example: "SELECT total / NULLIF(count, 0) AS average FROM stats;",
                module: 11
            },
            {
                name: 'IIF',
                syntax: 'IIF(condition, true_value, false_value)',
                description: 'Inline if — returns one value if the condition is true, another if false. Shortcut for simple CASE.',
                example: "SELECT treatment_name, IIF(price > 300, 'Premium', 'Standard') AS tier\nFROM treatments;",
                module: 11
            }
        ]
    },

    // ===== STRING FUNCTIONS =====
    {
        category: 'String Functions',
        commands: [
            {
                name: 'LENGTH',
                syntax: 'LENGTH(string)',
                description: 'Returns the number of characters in a string.',
                example: "SELECT first_name, LENGTH(first_name) AS name_length FROM clients;",
                module: 11
            },
            {
                name: 'UPPER / LOWER',
                syntax: 'UPPER(string)\nLOWER(string)',
                description: 'Converts text to all uppercase or all lowercase.',
                example: "SELECT UPPER(last_name) AS last_name_upper FROM clients;",
                module: 11
            },
            {
                name: 'TRIM / LTRIM / RTRIM',
                syntax: 'TRIM(string)\nLTRIM(string)\nRTRIM(string)',
                description: 'Removes leading and/or trailing whitespace (or specified characters) from a string.',
                example: "SELECT TRIM('  hello  '); -- returns 'hello'",
                module: 11
            },
            {
                name: 'SUBSTR',
                syntax: 'SUBSTR(string, start, length)',
                description: 'Extracts a substring starting at position (1-based) for a given length.',
                example: "SELECT SUBSTR(phone, 1, 3) AS area_code FROM clients;",
                module: 11
            },
            {
                name: 'REPLACE',
                syntax: "REPLACE(string, old, new)",
                description: 'Replaces all occurrences of a substring within a string.',
                example: "SELECT REPLACE(email, '@gmail.com', '@company.com') FROM clients;",
                module: 11
            },
            {
                name: 'INSTR',
                syntax: 'INSTR(string, substring)',
                description: 'Returns the position of the first occurrence of a substring (0 if not found).',
                example: "SELECT INSTR(email, '@') AS at_position FROM clients;",
                module: 11
            },
            {
                name: 'TYPEOF',
                syntax: 'TYPEOF(expression)',
                description: 'Returns the data type of an expression as a string: "null", "integer", "real", "text", or "blob".',
                example: "SELECT TYPEOF(42), TYPEOF('hello'), TYPEOF(3.14);",
                module: 11
            }
        ]
    },

    // ===== DATE & TIME =====
    {
        category: 'Date & Time',
        commands: [
            {
                name: 'DATE',
                syntax: "DATE(timestring, modifier, ...)",
                description: 'Returns a date string in YYYY-MM-DD format. Can apply modifiers like "+7 days" or "-1 month".',
                example: "SELECT DATE('now');\nSELECT DATE('now', '-90 days');",
                module: 11
            },
            {
                name: 'TIME',
                syntax: "TIME(timestring, modifier, ...)",
                description: 'Returns a time string in HH:MM:SS format.',
                example: "SELECT TIME('now');",
                module: 11
            },
            {
                name: 'DATETIME',
                syntax: "DATETIME(timestring, modifier, ...)",
                description: 'Returns a full date+time string in YYYY-MM-DD HH:MM:SS format.',
                example: "SELECT DATETIME('now');",
                module: 11
            },
            {
                name: 'STRFTIME',
                syntax: "STRFTIME(format, timestring)",
                description: 'Formats a date/time using format codes: %Y=year, %m=month, %d=day, %H=hour, %M=minute, %w=weekday.',
                example: "SELECT STRFTIME('%Y-%m', appointment_date) AS month,\n       COUNT(*) AS appointments\nFROM appointments\nGROUP BY month;",
                module: 11
            },
            {
                name: 'JULIANDAY',
                syntax: "JULIANDAY(timestring)",
                description: 'Returns the Julian day number — useful for calculating date differences.',
                example: "SELECT ROUND(JULIANDAY('now') - JULIANDAY(signup_date)) AS days_since_signup\nFROM clients;",
                module: 11
            },
            {
                name: "Date Modifiers",
                syntax: "'+N days', '-N months', 'start of month', 'weekday N'",
                description: "Modifiers shift dates. Examples: '+7 days', '-1 month', 'start of year', '+6 hours'.",
                example: "SELECT DATE('now', 'start of month') AS first_of_month;\nSELECT DATE('now', '+30 days') AS next_month;",
                module: 11
            }
        ]
    },

    // ===== SUBQUERIES =====
    {
        category: 'Subqueries',
        commands: [
            {
                name: 'Scalar Subquery',
                syntax: 'WHERE column > (SELECT AGG(col) FROM table)',
                description: 'A subquery that returns a single value. Used in WHERE, SELECT, or HAVING to compare against a computed value.',
                example: "SELECT treatment_name, price\nFROM treatments\nWHERE price > (SELECT AVG(price) FROM treatments);",
                module: 8
            },
            {
                name: 'IN (Subquery)',
                syntax: 'WHERE column IN (SELECT column FROM table)',
                description: 'Checks if a value exists in the result of another query. Alternative to JOIN for simple lookups.',
                example: "SELECT first_name, last_name\nFROM clients\nWHERE client_id IN (\n    SELECT DISTINCT client_id FROM appointments\n);",
                module: 8
            },
            {
                name: 'EXISTS / NOT EXISTS',
                syntax: 'WHERE EXISTS (SELECT 1 FROM table WHERE ...)',
                description: 'Returns TRUE if the subquery returns any rows. Often faster than IN for large datasets.',
                example: "SELECT first_name, last_name\nFROM clients c\nWHERE NOT EXISTS (\n    SELECT 1 FROM appointments a\n    WHERE a.client_id = c.client_id\n);",
                module: 8
            },
            {
                name: 'Derived Table',
                syntax: 'SELECT ... FROM (SELECT ...) alias',
                description: 'A subquery in the FROM clause that creates a temporary virtual table. Must have an alias.',
                example: "SELECT ROUND(AVG(visit_count), 1) AS avg_visits\nFROM (\n    SELECT client_id, COUNT(*) AS visit_count\n    FROM appointments\n    GROUP BY client_id\n) client_visits;",
                module: 8
            }
        ]
    },

    // ===== CTEs =====
    {
        category: 'Common Table Expressions',
        commands: [
            {
                name: 'WITH (CTE)',
                syntax: 'WITH cte_name AS (\n    SELECT ...\n)\nSELECT ... FROM cte_name;',
                description: 'Creates a named temporary result set that you can reference in the main query. More readable than nested subqueries.',
                example: "WITH revenue AS (\n    SELECT client_id, SUM(amount) AS total\n    FROM invoices GROUP BY client_id\n)\nSELECT c.first_name, r.total\nFROM clients c JOIN revenue r ON c.client_id = r.client_id;",
                module: 9
            },
            {
                name: 'Multiple CTEs',
                syntax: 'WITH cte1 AS (...), cte2 AS (...)\nSELECT ... FROM cte1 JOIN cte2 ...;',
                description: 'Chain multiple CTEs separated by commas. Later CTEs can reference earlier ones.',
                example: "WITH monthly AS (\n    SELECT STRFTIME('%Y-%m', appointment_date) AS month, COUNT(*) AS cnt\n    FROM appointments GROUP BY month\n),\nprev AS (\n    SELECT month, cnt, LAG(cnt) OVER (ORDER BY month) AS prev_cnt\n    FROM monthly\n)\nSELECT * FROM prev;",
                module: 9
            }
        ]
    },

    // ===== WINDOW FUNCTIONS =====
    {
        category: 'Window Functions',
        commands: [
            {
                name: 'ROW_NUMBER',
                syntax: 'ROW_NUMBER() OVER (ORDER BY column)',
                description: 'Assigns a unique sequential number to each row within a partition, starting at 1.',
                example: "SELECT ROW_NUMBER() OVER (ORDER BY price DESC) AS rank,\n       treatment_name, price\nFROM treatments;",
                module: 10
            },
            {
                name: 'RANK / DENSE_RANK',
                syntax: 'RANK() OVER (ORDER BY column)\nDENSE_RANK() OVER (ORDER BY column)',
                description: 'RANK assigns ranking with gaps for ties (1,2,2,4). DENSE_RANK has no gaps (1,2,2,3).',
                example: "SELECT treatment_name, price,\n       RANK() OVER (ORDER BY price DESC) AS price_rank\nFROM treatments;",
                module: 10
            },
            {
                name: 'NTILE',
                syntax: 'NTILE(n) OVER (ORDER BY column)',
                description: 'Divides rows into n roughly equal groups (buckets) and assigns a group number. Great for percentiles.',
                example: "SELECT treatment_name, price,\n       NTILE(4) OVER (ORDER BY price) AS quartile\nFROM treatments;",
                module: 10
            },
            {
                name: 'LAG / LEAD',
                syntax: 'LAG(column, offset, default) OVER (ORDER BY col)\nLEAD(column, offset, default) OVER (ORDER BY col)',
                description: 'LAG accesses a previous row; LEAD accesses a following row. Useful for comparisons between consecutive rows.',
                example: "SELECT appointment_date, amount,\n       LAG(amount) OVER (ORDER BY appointment_date) AS prev_amount\nFROM invoices;",
                module: 10
            },
            {
                name: 'SUM / AVG OVER',
                syntax: 'SUM(column) OVER (ORDER BY col ROWS ...)\nAVG(column) OVER (PARTITION BY col)',
                description: 'Running totals, moving averages, and partitioned aggregates — without collapsing rows like GROUP BY.',
                example: "SELECT appointment_date, amount,\n       SUM(amount) OVER (ORDER BY appointment_date) AS running_total\nFROM invoices;",
                module: 10
            },
            {
                name: 'PARTITION BY',
                syntax: 'OVER (PARTITION BY column ORDER BY column)',
                description: 'Divides rows into groups (partitions) for the window function. Like GROUP BY, but keeps all rows.',
                example: "SELECT category, treatment_name, price,\n       RANK() OVER (PARTITION BY category ORDER BY price DESC) AS cat_rank\nFROM treatments;",
                module: 10
            },
            {
                name: 'Window Frame',
                syntax: 'ROWS BETWEEN N PRECEDING AND N FOLLOWING\nROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW',
                description: 'Defines which rows relative to the current row are included in the window calculation.',
                example: "SELECT appointment_date, amount,\n       AVG(amount) OVER (\n           ORDER BY appointment_date\n           ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n       ) AS moving_avg_3\nFROM invoices;",
                module: 10
            }
        ]
    },

    // ===== CONDITIONAL LOGIC =====
    {
        category: 'Conditional Logic',
        commands: [
            {
                name: 'CASE',
                syntax: "CASE\n    WHEN condition THEN result\n    WHEN condition THEN result\n    ELSE default\nEND",
                description: 'SQL\'s "if-then-else" — evaluates conditions in order and returns the first match.',
                example: "SELECT treatment_name, price,\n    CASE\n        WHEN price >= 400 THEN 'Premium'\n        WHEN price >= 200 THEN 'Standard'\n        ELSE 'Budget'\n    END AS tier\nFROM treatments;",
                module: 11
            },
            {
                name: 'Simple CASE',
                syntax: "CASE column\n    WHEN value1 THEN result1\n    WHEN value2 THEN result2\n    ELSE default\nEND",
                description: 'Compares a single expression against multiple values — like a switch statement.',
                example: "SELECT status,\n    CASE status\n        WHEN 'completed' THEN 'Done'\n        WHEN 'scheduled' THEN 'Upcoming'\n        WHEN 'cancelled' THEN 'Cancelled'\n    END AS status_label\nFROM appointments;",
                module: 11
            }
        ]
    },

    // ===== DML (Data Manipulation) =====
    {
        category: 'Data Manipulation (DML)',
        commands: [
            {
                name: 'INSERT INTO',
                syntax: "INSERT INTO table (col1, col2) VALUES (val1, val2);",
                description: 'Adds a new row to a table. List the columns and their values.',
                example: "INSERT INTO clients (first_name, last_name, email, city, state, signup_date)\nVALUES ('Jane', 'Smith', 'jane@email.com', 'Austin', 'TX', '2025-01-15');",
                module: 6
            },
            {
                name: 'UPDATE',
                syntax: 'UPDATE table SET col1 = val1 WHERE condition;',
                description: 'Modifies existing rows. Always include a WHERE clause to avoid updating every row!',
                example: "UPDATE treatments SET price = price * 1.10\nWHERE category = 'Facial';",
                module: 6
            },
            {
                name: 'DELETE',
                syntax: 'DELETE FROM table WHERE condition;',
                description: 'Removes rows from a table. Always use WHERE to avoid deleting everything!',
                example: "DELETE FROM appointments\nWHERE status = 'cancelled'\n  AND appointment_date < '2025-01-01';",
                module: 6
            }
        ]
    },

    // ===== DDL (Table Design) =====
    {
        category: 'Table Design (DDL)',
        commands: [
            {
                name: 'CREATE TABLE',
                syntax: "CREATE TABLE table_name (\n    column_name TYPE CONSTRAINTS,\n    ...\n);",
                description: 'Creates a new table with specified columns, data types, and constraints.',
                example: "CREATE TABLE gift_cards (\n    card_id INTEGER PRIMARY KEY AUTOINCREMENT,\n    code TEXT UNIQUE NOT NULL,\n    balance REAL DEFAULT 0,\n    created_date TEXT DEFAULT (DATE('now'))\n);",
                module: 7
            },
            {
                name: 'ALTER TABLE',
                syntax: 'ALTER TABLE table_name ADD COLUMN column_name TYPE;',
                description: 'Modifies an existing table structure. SQLite supports adding columns (not dropping them).',
                example: "ALTER TABLE clients ADD COLUMN phone TEXT;",
                module: 7
            },
            {
                name: 'DROP TABLE',
                syntax: 'DROP TABLE IF EXISTS table_name;',
                description: 'Permanently deletes a table and all its data. IF EXISTS prevents errors if the table is missing.',
                example: "DROP TABLE IF EXISTS temp_data;",
                module: 7
            },
            {
                name: 'PRIMARY KEY',
                syntax: 'column_name INTEGER PRIMARY KEY',
                description: 'Uniquely identifies each row. Usually an auto-incrementing integer.',
                example: "CREATE TABLE example (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL\n);",
                module: 7
            },
            {
                name: 'FOREIGN KEY',
                syntax: 'FOREIGN KEY (column) REFERENCES other_table(column)',
                description: 'Links a column to a primary key in another table, enforcing referential integrity.',
                example: "CREATE TABLE appointments (\n    appointment_id INTEGER PRIMARY KEY,\n    client_id INTEGER,\n    FOREIGN KEY (client_id) REFERENCES clients(client_id)\n);",
                module: 7
            },
            {
                name: 'NOT NULL / DEFAULT / UNIQUE / CHECK',
                syntax: 'column TYPE NOT NULL DEFAULT value UNIQUE\nCHECK (condition)',
                description: 'Constraints that enforce data rules: required values, defaults, uniqueness, and custom validation.',
                example: "CREATE TABLE products (\n    name TEXT NOT NULL,\n    price REAL CHECK(price >= 0),\n    sku TEXT UNIQUE\n);",
                module: 7
            }
        ]
    },

    // ===== OPTIMIZATION =====
    {
        category: 'Optimization & Tools',
        commands: [
            {
                name: 'CREATE INDEX',
                syntax: 'CREATE INDEX index_name ON table(column);',
                description: 'Creates an index to speed up lookups on a column. Essential for large tables.',
                example: "CREATE INDEX idx_clients_email ON clients(email);",
                module: 12
            },
            {
                name: 'EXPLAIN QUERY PLAN',
                syntax: 'EXPLAIN QUERY PLAN SELECT ...;',
                description: 'Shows how SQLite will execute a query — whether it uses indexes, scans, or sorts.',
                example: "EXPLAIN QUERY PLAN\nSELECT * FROM clients WHERE email = 'test@test.com';",
                module: 12
            },
            {
                name: 'BEGIN / COMMIT / ROLLBACK',
                syntax: 'BEGIN TRANSACTION;\n-- statements\nCOMMIT;',
                description: 'Wraps multiple statements in a transaction. Either all succeed (COMMIT) or all fail (ROLLBACK).',
                example: "BEGIN TRANSACTION;\nINSERT INTO invoices (client_id, amount) VALUES (1, 250.00);\nUPDATE clients SET last_visit = DATE('now') WHERE client_id = 1;\nCOMMIT;",
                module: 12
            },
            {
                name: 'LAST_INSERT_ROWID',
                syntax: 'SELECT LAST_INSERT_ROWID();',
                description: 'Returns the rowid of the last successfully inserted row. Useful after INSERT to get the new ID.',
                example: "INSERT INTO clients (first_name, last_name) VALUES ('New', 'Client');\nSELECT LAST_INSERT_ROWID();",
                module: 12
            }
        ]
    }
];
