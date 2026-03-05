// editor.js — CodeMirror initialization and management

const Editor = (() => {
    let cm = null;

    function init() {
        const container = document.getElementById('editor-container');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        cm = CodeMirror(container, {
            value: '-- Write your SQL query here\nSELECT * FROM employees LIMIT 10;',
            mode: 'text/x-sqlite',
            theme: isDark ? 'dracula' : 'default',
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            indentWithTabs: false,
            indentUnit: 2,
            tabSize: 2,
            lineWrapping: true,
            placeholder: 'Write your SQL query here...',
            extraKeys: {
                'Ctrl-Enter': () => document.getElementById('run-btn').click(),
                'Cmd-Enter': () => document.getElementById('run-btn').click(),
                'Ctrl-Space': 'autocomplete'
            },
            hintOptions: {
                tables: {
                    employees: ['employee_id', 'first_name', 'last_name', 'email', 'hire_date', 'salary', 'department_id', 'manager_id'],
                    departments: ['department_id', 'department_name', 'location'],
                    customers: ['customer_id', 'first_name', 'last_name', 'email', 'city', 'country', 'signup_date'],
                    products: ['product_id', 'product_name', 'category', 'price', 'stock_quantity'],
                    orders: ['order_id', 'customer_id', 'employee_id', 'order_date', 'status'],
                    order_items: ['order_item_id', 'order_id', 'product_id', 'quantity', 'unit_price'],
                    categories: ['category_id', 'category_name', 'parent_category_id']
                },
                completeSingle: false
            }
        });

        return cm;
    }

    function getValue() {
        return cm ? cm.getValue().trim() : '';
    }

    function setValue(sql) {
        if (cm) {
            cm.setValue(sql);
            cm.focus();
            cm.setCursor(cm.lineCount(), 0);
        }
    }

    function setTheme(isDark) {
        if (cm) {
            cm.setOption('theme', isDark ? 'dracula' : 'default');
        }
    }

    function refresh() {
        if (cm) setTimeout(() => cm.refresh(), 10);
    }

    function focus() {
        if (cm) cm.focus();
    }

    return { init, getValue, setValue, setTheme, refresh, focus };
})();
