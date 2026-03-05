// exercises.js — Exercise validation, result comparison, hints, scoring

const Exercises = (() => {
    let currentHintsRevealed = 0;
    let exerciseStartTime = null;

    function startExercise() {
        currentHintsRevealed = 0;
        exerciseStartTime = Date.now();
    }

    function getHintsRevealed() {
        return currentHintsRevealed;
    }

    function revealNextHint(hints) {
        if (currentHintsRevealed < hints.length) {
            currentHintsRevealed++;
        }
        return currentHintsRevealed;
    }

    function calculateScore(hintsUsed, totalHints) {
        if (hintsUsed === 0) return 100;
        if (totalHints === 0) return 100;
        // Each hint costs points proportionally
        const penalty = (hintsUsed / totalHints) * 60; // Max 60% penalty
        return Math.max(40, Math.round(100 - penalty));
    }

    function getElapsedSeconds() {
        if (!exerciseStartTime) return Infinity;
        return (Date.now() - exerciseStartTime) / 1000;
    }

    function validateResult(userResult, exercise) {
        if (userResult.error) {
            return { passed: false, message: `Query error: ${userResult.error}`, details: null };
        }

        // Custom validator function
        if (exercise.validateFn) {
            try {
                const result = exercise.validateFn(userResult);
                return result;
            } catch (e) {
                return { passed: false, message: `Validation error: ${e.message}`, details: null };
            }
        }

        // Get expected result by running the expected query
        if (exercise.expectedQuery) {
            const expectedResult = Database.runQuery(exercise.expectedQuery);
            if (expectedResult.error) {
                return { passed: false, message: `Internal error with expected query: ${expectedResult.error}`, details: null };
            }
            return compareResults(userResult, expectedResult, exercise.orderMatters !== true);
        }

        // Direct expected result comparison
        if (exercise.expectedResult) {
            return compareResults(userResult, exercise.expectedResult, exercise.orderMatters !== true);
        }

        // If no expected result defined, just check no error
        return { passed: true, message: 'Query executed successfully!', details: null };
    }

    function compareResults(actual, expected, ignoreOrder) {
        // Check columns match (case-insensitive)
        const actualCols = actual.columns.map(c => c.toLowerCase().trim());
        const expectedCols = expected.columns.map(c => c.toLowerCase().trim());

        if (actualCols.length !== expectedCols.length) {
            return {
                passed: false,
                message: `Expected ${expectedCols.length} column(s) but got ${actualCols.length}.`,
                details: { expectedCols: expected.columns, actualCols: actual.columns }
            };
        }

        // Check column names match
        const colsMatch = actualCols.every((col, i) => col === expectedCols[i]);
        if (!colsMatch) {
            // Check if same columns in different order
            const sortedActual = [...actualCols].sort();
            const sortedExpected = [...expectedCols].sort();
            const sameSet = sortedActual.every((c, i) => c === sortedExpected[i]);
            if (!sameSet) {
                return {
                    passed: false,
                    message: `Column names don't match. Expected: ${expected.columns.join(', ')}. Got: ${actual.columns.join(', ')}.`,
                    details: { expectedCols: expected.columns, actualCols: actual.columns }
                };
            }
        }

        // Compare row counts
        if (actual.values.length !== expected.values.length) {
            return {
                passed: false,
                message: `Expected ${expected.values.length} row(s) but got ${actual.values.length}.`,
                details: { expectedRows: expected.values.length, actualRows: actual.values.length }
            };
        }

        // Compare values
        const normalize = v => (v === null || v === undefined) ? null : String(v).trim().toLowerCase();

        let actualRows = actual.values.map(row => row.map(normalize));
        let expectedRows = expected.values.map(row => row.map(normalize));

        if (ignoreOrder) {
            const sortFn = (a, b) => a.join('|').localeCompare(b.join('|'));
            actualRows = actualRows.sort(sortFn);
            expectedRows = expectedRows.sort(sortFn);
        }

        let allMatch = true;
        const diffs = [];

        for (let i = 0; i < expectedRows.length; i++) {
            const rowMatch = expectedRows[i].every((val, j) => val === actualRows[i]?.[j]);
            if (!rowMatch) {
                allMatch = false;
                diffs.push({ row: i, expected: expected.values[i], actual: actual.values[i] });
                if (diffs.length >= 5) break; // Limit diff output
            }
        }

        if (allMatch) {
            return { passed: true, message: 'Correct! Your query returns the expected results.', details: null };
        }

        return {
            passed: false,
            message: `Results don't match. Found ${diffs.length}${diffs.length >= 5 ? '+' : ''} differing row(s).`,
            details: { diffs }
        };
    }

    // Generate friendly error hints
    function getFriendlyError(error) {
        const hints = [
            { pattern: /no such table: (\w+)/i, hint: (m) => `The table "${m[1]}" doesn't exist. Check the Schema Explorer for available tables.` },
            { pattern: /no such column: (\w+)/i, hint: (m) => `The column "${m[1]}" doesn't exist in the referenced table. Check column names in the Schema Explorer.` },
            { pattern: /near "(\w+)": syntax error/i, hint: (m) => `There's a syntax error near "${m[1]}". Check for missing commas, parentheses, or misspelled keywords.` },
            { pattern: /ambiguous column name: (\w+)/i, hint: (m) => `The column "${m[1]}" exists in multiple tables. Prefix it with the table name, e.g., table_name.${m[1]}.` },
            { pattern: /misuse of aggregate/i, hint: () => `You're using an aggregate function incorrectly. When mixing aggregate functions (COUNT, SUM, etc.) with regular columns, you need a GROUP BY clause.` },
            { pattern: /UNIQUE constraint failed/i, hint: () => `A UNIQUE constraint was violated. You're trying to insert a duplicate value in a column that requires unique values.` },
            { pattern: /NOT NULL constraint failed/i, hint: () => `A NOT NULL constraint was violated. You're trying to insert NULL into a column that requires a value.` },
            { pattern: /incomplete input/i, hint: () => `Your query appears to be incomplete. Make sure you have a complete SQL statement ending with a semicolon.` },
        ];

        for (const { pattern, hint } of hints) {
            const match = error.match(pattern);
            if (match) return hint(match);
        }
        return null;
    }

    return {
        startExercise, getHintsRevealed, revealNextHint,
        calculateScore, getElapsedSeconds, validateResult,
        compareResults, getFriendlyError
    };
})();
