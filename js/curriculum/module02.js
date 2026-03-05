// Module 2 — Filtering with WHERE (Medical Spa context)
const MODULE_02 = {
    moduleId: 2,
    title: 'Filtering with WHERE',
    level: 'beginner',
    description: 'Learn to filter data using comparisons, patterns, logical operators, and NULL handling.',
    lessons: [
        {
            lessonId: 1,
            title: 'The WHERE Clause',
            type: 'reading',
            content: `## Filtering Rows with WHERE

The \`WHERE\` clause filters rows that match a condition:

\`\`\`sql
SELECT * FROM staff WHERE role = 'Aesthetician';
\`\`\`

### Comparison Operators

| Operator | Meaning |
|----------|---------|
| \`=\` | Equal to |
| \`!=\` or \`<>\` | Not equal to |
| \`<\` | Less than |
| \`>\` | Greater than |
| \`<=\` | Less than or equal |
| \`>=\` | Greater than or equal |

### Medical Spa Examples

\`\`\`sql
-- Treatments priced over $500
SELECT treatment_name, price FROM treatments WHERE price > 500;

-- Staff earning more than $50/hour
SELECT first_name, last_name, hourly_rate
FROM staff WHERE hourly_rate >= 50;
\`\`\``,
            exampleQueries: [
                { label: 'Aestheticians', sql: "SELECT first_name, last_name FROM staff WHERE role = 'Aesthetician';" },
                { label: 'Premium treatments', sql: 'SELECT treatment_name, price FROM treatments WHERE price > 500;' },
                { label: 'High-rate staff', sql: 'SELECT first_name, last_name, role, hourly_rate FROM staff WHERE hourly_rate >= 50;' }
            ]
        },
        {
            lessonId: 2,
            title: 'LIKE and Pattern Matching',
            type: 'reading',
            content: `## Pattern Matching with LIKE

\`LIKE\` lets you search for patterns in text:

| Pattern | Meaning |
|---------|---------|
| \`%\` | Any sequence of characters (including none) |
| \`_\` | Exactly one character |

### Examples

\`\`\`sql
-- Treatments with "Laser" in the name
SELECT * FROM treatments WHERE treatment_name LIKE '%Laser%';

-- Clients whose last name starts with 'S'
SELECT first_name, last_name FROM clients
WHERE last_name LIKE 'S%';

-- Products from brands starting with 'Skin'
SELECT product_name, brand FROM products
WHERE brand LIKE 'Skin%';
\`\`\`

> **Note:** In SQLite, \`LIKE\` is case-insensitive for ASCII characters by default.`,
            exampleQueries: [
                { label: 'Laser treatments', sql: "SELECT treatment_name, price FROM treatments WHERE treatment_name LIKE '%Laser%';" },
                { label: 'Filler treatments', sql: "SELECT treatment_name, price FROM treatments WHERE treatment_name LIKE '%Filler%';" },
                { label: 'SkinCeuticals products', sql: "SELECT product_name, price FROM products WHERE brand LIKE 'Skin%';" }
            ]
        },
        {
            lessonId: 3,
            title: 'AND, OR, NOT',
            type: 'reading',
            content: `## Combining Conditions

### AND — Both conditions must be true

\`\`\`sql
-- Aestheticians hired after 2021
SELECT first_name, last_name, hire_date
FROM staff
WHERE role = 'Aesthetician' AND hire_date > '2021-12-31';
\`\`\`

### OR — At least one condition must be true

\`\`\`sql
-- Nurse Injectors OR Nurse Practitioners
SELECT first_name, last_name, role
FROM staff
WHERE role = 'Nurse Injector' OR role = 'Nurse Practitioner';
\`\`\`

### NOT — Negates a condition

\`\`\`sql
-- All staff except receptionists
SELECT first_name, last_name, role
FROM staff
WHERE NOT role = 'Receptionist';
\`\`\`

### Operator Precedence

\`AND\` is evaluated before \`OR\`. Use parentheses to be explicit:

\`\`\`sql
-- Correct: Laser techs OR Aestheticians earning > $40/hr
SELECT * FROM staff
WHERE (role = 'Laser Technician' OR role = 'Aesthetician')
  AND hourly_rate > 40;
\`\`\``,
            exampleQueries: [
                { label: 'Scottsdale clients since 2023', sql: "SELECT first_name, last_name, signup_date FROM clients WHERE city = 'Scottsdale' AND signup_date >= '2023-01-01';" },
                { label: 'Injectors or NPs', sql: "SELECT first_name, last_name, role, hourly_rate FROM staff WHERE role = 'Nurse Injector' OR role = 'Nurse Practitioner';" },
                { label: 'Non-receptionist staff', sql: "SELECT first_name, last_name, role FROM staff WHERE NOT role = 'Receptionist';" }
            ]
        },
        {
            lessonId: 4,
            title: 'IN, BETWEEN, and NULL',
            type: 'reading',
            content: `## IN — Match Any Value in a List

\`\`\`sql
-- Clients from specific cities
SELECT first_name, last_name, city
FROM clients
WHERE city IN ('Scottsdale', 'Paradise Valley', 'Phoenix');
\`\`\`

## BETWEEN — Range Check (Inclusive)

\`\`\`sql
-- Treatments priced between $200 and $500
SELECT treatment_name, price
FROM treatments
WHERE price BETWEEN 200 AND 500;
\`\`\`

## NULL — Missing Values

NULL means "unknown" or "missing." You cannot use \`=\` to check for NULL:

\`\`\`sql
-- WRONG: WHERE email = NULL
-- RIGHT:
SELECT first_name, last_name FROM clients WHERE email IS NULL;

-- Clients who DO have emails
SELECT first_name, last_name FROM clients WHERE email IS NOT NULL;
\`\`\`

### Important NULL Behaviors

- \`NULL = NULL\` is **not** TRUE — it's NULL
- \`NULL + 5\` = NULL (any math with NULL yields NULL)
- Use \`IS NULL\` / \`IS NOT NULL\` for comparisons
- NULL values are excluded from most aggregate functions`,
            exampleQueries: [
                { label: 'Clients missing email', sql: 'SELECT first_name, last_name, phone FROM clients WHERE email IS NULL;' },
                { label: 'Mid-range treatments', sql: 'SELECT treatment_name, price FROM treatments WHERE price BETWEEN 200 AND 500 ORDER BY price;' },
                { label: 'Scottsdale & PV clients', sql: "SELECT first_name, last_name, city FROM clients WHERE city IN ('Scottsdale', 'Paradise Valley') ORDER BY last_name;" }
            ]
        },
        {
            lessonId: 5,
            title: 'Exercise: Filter Spa Data',
            type: 'exercise',
            content: `## Exercise: Filter Spa Data

Use WHERE with comparisons, IN, and LIKE to find specific records.`,
            exercise: {
                prompt: 'Find all **treatments** in the "Dermal Fillers" category that cost **$800 or more**. Return the treatment_name and price columns, sorted by price descending.',
                startingCode: '-- Find expensive filler treatments\nSELECT ',
                expectedQuery: "SELECT treatment_name, price FROM treatments WHERE category = 'Dermal Fillers' AND price >= 800 ORDER BY price DESC;",
                hints: [
                    'Use WHERE with two conditions joined by AND.',
                    "Filter by `category = 'Dermal Fillers'` AND `price >= 800`.",
                    "SELECT treatment_name, price FROM treatments WHERE category = 'Dermal Fillers' AND price >= 800 ORDER BY price DESC;"
                ],
                orderMatters: true
            }
        },
        {
            lessonId: 6,
            title: 'Exercise: NULL Handling',
            type: 'exercise',
            content: `## Exercise: Working with NULLs

Practice finding records with missing data — a common real-world task when cleaning client records.`,
            exercise: {
                prompt: 'Find all **clients who are missing a phone number** (phone IS NULL). Return their first_name, last_name, and email. Sort by last_name.',
                startingCode: '-- Find clients with missing phone numbers\n',
                expectedQuery: "SELECT first_name, last_name, email FROM clients WHERE phone IS NULL ORDER BY last_name;",
                hints: [
                    'Use `IS NULL` to find missing values — never use `= NULL`.',
                    'SELECT first_name, last_name, email FROM clients WHERE phone IS NULL',
                    "SELECT first_name, last_name, email FROM clients WHERE phone IS NULL ORDER BY last_name;"
                ],
                orderMatters: true
            }
        }
    ]
};
