# Postgres 101

## Why PostgreSQL?

- **Object-relational database (ORDBMS)**: Supports relational data along with advanced types like JSON, arrays, ranges, and custom types.
- **Strong SQL standards compliance**: PostgreSQL closely follows ANSI SQL, making queries portable and predictable.
- **MVCC-based concurrency**: Uses Multi-Version Concurrency Control so readers never block writers and writers never block readers.
- **ACID-compliant**: Guarantees Atomicity, Consistency, Isolation, and Durability even under high concurrency.
- **Extensibility**: You can create custom data types, operators, functions, indexes, and install extensions (e.g., PostGIS).
- **Data integrity & reliability**: Rich constraints, transactional DDL, WAL (Write-Ahead Logging), and crash recovery.

---

## Logical Structure

```
Server → PostgreSQL Instance → Databases → Schemas → Tables / Views
```

---

## Basic Database Design Rules

1. One table represents one real‑world entity
2. Each column stores a single atomic value (normalization)
3. Use proper relationships (primary / foreign keys)
4. Minimize redundant data

---

## Core Data Types

### Character Types

- `CHAR(n)` – fixed length
- `VARCHAR(n)` – variable length with limit
- `TEXT` – unlimited length

### Numeric Types

- `SMALLINT` – 2 bytes
- `INTEGER` – 4 bytes
- `BIGINT` – 8 bytes
- `SMALLSERIAL`, `SERIAL`, `BIGSERIAL` – auto‑incrementing integers

### Exact vs Floating Point

- `NUMERIC` / `DECIMAL` – exact precision (use for money)
- `REAL` – floating point (~6 decimal digits)
- `DOUBLE PRECISION` – floating point (~15 decimal digits)

### Boolean

- `BOOLEAN` – TRUE / FALSE / NULL

### Date & Time

- `DATE` – YYYY‑MM‑DD
- `TIME` – time of day
- `TIMESTAMP` – date + time (no timezone)
- `TIMESTAMPTZ` – timestamp with timezone
- `INTERVAL` – duration (e.g. `1 day`, `2 hours`)

### Other Common Types

- `UUID` – globally unique identifiers
- `JSON` – stores JSON text, preserves formatting and key order
- `JSONB` – binary JSON, faster queries, supports indexing (preferred)
- `ARRAY` – list of values of same type
- `ENUM` – predefined set of values
- `BYTEA` – binary data (images, files)

**JSON vs JSONB**

- `JSON`: stored as text, slower to query
- `JSONB`: stored in binary format, faster search and indexing

```sql
SELECT * FROM users WHERE metadata->>'role' = 'admin';
```

**BYTEA Example**

```sql
INSERT INTO files (data)
VALUES (pg_read_binary_file('/path/file.png'));
```

---

## Comments

```sql
-- Single‑line comment
/* Multi‑line comment */
```

---

## Creating Tables

```sql
CREATE TABLE product_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    type_id INTEGER REFERENCES product_type(id),
    name VARCHAR(30) NOT NULL,
    supplier VARCHAR(60) NOT NULL,
    description TEXT,
    date_entered TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

## Constraints

- `PRIMARY KEY`
- `FOREIGN KEY`
- `UNIQUE`
- `NOT NULL`
- `CHECK`

```sql
price NUMERIC CHECK (price > 0)
```

---

## Insert Data

```sql
INSERT INTO customers (first_name, last_name, email, date_entered)
VALUES ('Chris', 'Homes', 'chris.homes@email.com', CURRENT_TIMESTAMP);
```

---

## Select Queries

```sql
SELECT *
FROM public.customers
ORDER BY id DESC;
```

---

## Custom Types (ENUM)

```sql
CREATE TYPE gender AS ENUM ('M', 'F');
```

**ENUM Limitations**

- Values cannot be easily removed
- Adding new values requires `ALTER TYPE`
- Ordering is fixed at creation
- Harder to migrate than lookup tables

Use ENUMs only for stable, rarely-changing values.

---

## ALTER TABLE

### Add Column

```sql
ALTER TABLE sales_item ADD COLUMN day_of_week VARCHAR(8);
```

### Drop Column

```sql
ALTER TABLE sales_item DROP COLUMN day_of_week;
```

### Modify Column

```sql
ALTER TABLE sales_item ALTER COLUMN day_of_week SET NOT NULL;
```

### Rename Column

```sql
ALTER TABLE sales_item RENAME COLUMN day_of_week TO weekday;
```

### Rename Table

```sql
ALTER TABLE transaction_type RENAME TO transactions;
```

### Change Column Type

```sql
ALTER TABLE customers
ALTER COLUMN sex TYPE gender USING sex::gender;
```

---

## Indexes

### Create Index

```sql
CREATE INDEX idx_transactions_name
ON transactions(name);
```

### Composite Index

```sql
CREATE INDEX idx_transactions_name_payment
ON transactions(name, payment_type);
```

Notes:

- B‑Tree is the default index type
- Column order matters in composite indexes

---

## Delete Data

### DELETE (row-by-row, transactional)

```sql
DELETE FROM transactions WHERE id = 10;
```

### TRUNCATE (fast, removes all rows)

```sql
TRUNCATE TABLE transactions;
```

**RESTART IDENTITY**

- Use when you want sequences (SERIAL/IDENTITY) reset

```sql
TRUNCATE TABLE transactions RESTART IDENTITY;
```

**CASCADE**

- Use when dependent tables reference the table

```sql
TRUNCATE TABLE transactions CASCADE;
```

---

## Drop Table

```sql
DROP TABLE transactions;
```

**CASCADE**

- Drops dependent objects (foreign keys, views)

```sql
DROP TABLE transactions CASCADE;
```

---

## Query Anatomy (Generic Template)

```sql
SELECT DISTINCT
    CONCAT(t.first_name, ' ', t.last_name) AS full_name,
    t.email,
    t.state,
    SUM(o.amount) AS total_spent,
FROM public.users AS t
JOIN orders o ON t.id = o.user_id
WHERE t.created_at BETWEEN TIMESTAMPTZ '2024-01-01' AND
TIMESTAMPTZ '2024-12-31'
  AND t.state IN ('CA', 'NY')
  AND t.email ILIKE '%@gmail.com'
  AND t.deleted_at IS NULL
AND EXTRACT(MONTH FROM created_at) = 12                   -- December
GROUP BY t.first_name, t.last_name, t.email, t.state
HAVING SUM(o.amount) > 1000
ORDER BY total_spent DESC, full_name ASC
LIMIT 50 OFFSET 0;
```

> NOTE:
> Using EXTRACT in WHERE can prevent index usage
> Prefer range filters when possible:
>
> ```sql
> -- Better
> WHERE created_at >= '2024-01-01'
>  AND created_at < '2025-01-01'
> ```

---

## WHERE Clause Operators

- Comparison: `=`, `<`, `>`, `<=`, `>=`, `<>`, `!=`
- Logical: `AND`, `OR`, `NOT`
- Set: `IN`, `BETWEEN`
- Pattern: `LIKE`, `ILIKE`
- NULL check: `IS NULL`, `IS NOT NULL`


## GROUP BY, HAVING & ORDER BY Rules

### GROUP BY Rules

- All non-aggregated columns in SELECT must appear in GROUP BY
- GROUP BY happens before HAVING

### HAVING Rules

- Filters aggregated results
- Cannot be replaced by WHERE

### ORDER BY Rules

- Executed last
- Can use column aliases

```sql
SELECT supplier, COUNT(*) AS total
FROM products
GROUP BY supplier
HAVING COUNT(*) > 5
ORDER BY total DESC;
```

---

## Joins

### INNER JOIN (JOIN)

**Definition**
Returns only rows that have matching values in **both** tables.

```sql
SELECT *
FROM orders o
JOIN customers c ON o.customer_id = c.id;
```

**When to Use**

- When you only care about records that exist in both tables
- Most common join in day-to-day queries

**Key / Interview Points**

- `JOIN` is shorthand for `INNER JOIN`
- Non-matching rows from both tables are excluded
- Think of it as an **intersection**

---

### LEFT JOIN (LEFT OUTER JOIN)

**Definition**
Returns **all rows from the left table** and matching rows from the right table.
Unmatched right-side columns are `NULL`.

```sql
SELECT *
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;
```

**When to Use**

- When the left table is the main dataset
- To find rows **without matches** in the right table
- Common in reporting and analytics

**Key / Interview Points**

- Filtering in `WHERE` can turn it into an INNER JOIN
- Use `ON` clause carefully
- Very commonly asked join type in interviews

---

### RIGHT JOIN (RIGHT OUTER JOIN)

**Definition**
Returns **all rows from the right table** and matching rows from the left table.

```sql
SELECT *
FROM customers c
RIGHT JOIN orders o ON c.id = o.customer_id;
```

**When to Use**

- Rarely used
- Can always be rewritten as a LEFT JOIN by swapping tables

**Key / Interview Points**

- Generally avoided for readability
- Interviewers prefer LEFT JOIN over RIGHT JOIN

---

### FULL JOIN (FULL OUTER JOIN)

**Definition**
Returns **all matching rows plus all non-matching rows from both tables**.
Unmatched columns are filled with `NULL`.

```sql
SELECT *
FROM customers c
FULL JOIN orders o ON c.id = o.customer_id;
```

**When to Use**

- Data reconciliation
- Auditing and consistency checks
- Finding missing relationships on both sides

**Key / Interview Points**

- Combines LEFT JOIN and RIGHT JOIN behavior
- Not supported in some databases, but supported in PostgreSQL
- Can be simulated using `UNION` if unavailable

---

### CROSS JOIN

**Definition**
Returns the **Cartesian product** of two tables (every row from A × every row from B).

```sql
SELECT *
FROM colors
CROSS JOIN sizes;
```

**When to Use**

- Generating combinations
- Time series expansion
- Test data generation

**Key / Interview Points**

- No join condition
- Row count = rows(A) × rows(B)
- Dangerous if used unintentionally (performance risk)

---

### OUTER JOIN (Concept)

**Definition**
A category of joins that includes:

- LEFT OUTER JOIN
- RIGHT OUTER JOIN
- FULL OUTER JOIN

**Key / Interview Points**

- `OUTER` keyword is optional
- INNER JOIN is **not** an outer join

> ### Note:
>
> Joins can be written using WHERE, but it’s outdated (old style Join) and discouraged.
> Best practice is to use explicit JOIN … ON syntax for clarity, correctness, and support of outer joins and adhers to ANSI Standard.
>
> ```sql
> SELECT *
> FROM customers c, orders o
> WHERE c.id = o.customer_id;
> ```

---

## UNION, UNION ALL, INTERSECT, EXCEPT (Set Operators)

### UNION

**Definition**
Combines results of two or more SELECT queries and **removes duplicate rows**.

```sql
SELECT email FROM customers
UNION
SELECT email FROM suppliers;
```

**When to Use**

- When combining similar datasets
- When duplicates must be eliminated

**Key Points**

- Duplicate rows are removed (uses sort/hash internally)
- Columns must match in:
  - Number
  - Order
  - Compatible data types

- Slower than `UNION ALL` due to deduplication

---

### UNION ALL

**Definition**
Combines results of multiple SELECT queries **without removing duplicates**.

```sql
SELECT email FROM customers
UNION ALL
SELECT email FROM suppliers;
```

**When to Use**

- When you know data is already unique
- When performance matters

**Key Points**

- Faster than UNION
- Most commonly recommended unless deduplication is required
- Keeps duplicates

---

### INTERSECT

**Definition**
Returns **only rows that exist in both result sets**.

```sql
SELECT email FROM customers
INTERSECT
SELECT email FROM newsletter_users;
```

**When to Use**

- Finding common records between datasets
- Matching users across systems

**Key Points**

- Similar to INNER JOIN on all selected columns
- Removes duplicates automatically

---

### EXCEPT (MINUS)

**Definition**
Returns rows from the first query that **do not exist in the second query**.

```sql
SELECT email FROM customers
EXCEPT
SELECT email FROM unsubscribed_users;
```

**When to Use**

- Finding missing or unmatched records
- Data reconciliation

**Key Points**

- Order matters (`A EXCEPT B ≠ B EXCEPT A`)
- Removes duplicates automatically

---

### Rules for Set Operators (Very Important)

- Each SELECT must return:
  - Same number of columns
  - Same column order
  - Compatible data types

- Column names come from the **first SELECT**
- `ORDER BY` is allowed **only once at the end**

```sql
SELECT email FROM customers
UNION ALL
SELECT email FROM suppliers
ORDER BY email;
```

---

### UNION vs JOIN (Common Interview Question)

| Aspect      | UNION            | JOIN                    |
| ----------- | ---------------- | ----------------------- |
| Combines    | Rows             | Columns                 |
| Use case    | Similar datasets | Related tables          |
| Result size | Sum of rows      | Depends on relationship |

---

### Common Interview Traps

#### Trap 1: Using UNION instead of UNION ALL

- UNION adds unnecessary overhead
- Prefer UNION ALL unless deduplication is required

#### Trap 2: ORDER BY in individual SELECTs

```sql
-- ❌ Invalid
SELECT email FROM customers ORDER BY email
UNION
SELECT email FROM suppliers;
```

#### Trap 3: Mismatched column types

```sql
SELECT id FROM table1
UNION
SELECT name FROM table2; -- type mismatch
```

---

### One-Line Interview Answers

- **UNION** → combines results and removes duplicates
- **UNION ALL** → combines results, keeps duplicates (faster)
- **INTERSECT** → common rows only
- **EXCEPT** → rows in first query but not in second

---

## Transactions

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

- `ROLLBACK` reverts changes
- Ensures atomicity and consistency

---

## MVCC (Multi‑Version Concurrency Control)

- Readers don’t block writers
- Writers don’t block readers
- Enables high concurrency

---

## Performance & Debugging

### EXPLAIN / EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE
SELECT * FROM customers WHERE email = 'x@example.com';
```

Used to understand query plans and performance bottlenecks

---

## Interview Questions, Traps & Gotchas

### Interview Tips

- Use `NUMERIC` for money, not floats
- Always index columns used in joins and filters
- Understand DELETE vs TRUNCATE
- Be able to explain MVCC at a high level
- Use `EXPLAIN ANALYZE` before optimizing queries

### 1. General SQL Traps (Very Common)

#### Q: Difference between `WHERE` and `HAVING`?

**Answer**

- `WHERE` filters rows **before aggregation**
- `HAVING` filters results **after aggregation**

```sql
-- Wrong
SELECT dept, COUNT(*)
FROM employees
WHERE COUNT(*) > 5;

-- Correct
SELECT dept, COUNT(*)
FROM employees
GROUP BY dept
HAVING COUNT(*) > 5;
```

**Trap**

- Interviewers expect you to know execution order

---

#### Q: `COUNT(*)` vs `COUNT(column)`?

**Answer**

- `COUNT(*)` → counts all rows
- `COUNT(column)` → ignores `NULL`

```sql
COUNT(*)        -- includes NULLs
COUNT(email)    -- excludes NULL emails
```

---

#### Q: Why `NUMERIC` instead of `FLOAT` for money?

**Answer**

- `FLOAT` is approximate
- `NUMERIC` is exact and avoids rounding errors

---

### 2. JOIN Traps (Extremely Important)

#### Trap 1: LEFT JOIN turning into INNER JOIN

```sql
SELECT *
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'PAID';
```

**Problem**

- `WHERE` filters out `NULL`s
- Effectively becomes an INNER JOIN

**Correct**

```sql
SELECT *
FROM customers c
LEFT JOIN orders o
  ON c.id = o.customer_id AND o.status = 'PAID';
```

**Interview Tip**

> Filters on the right table of a LEFT JOIN should go in the ON clause.

---

#### Trap 2: Filtering NULLs incorrectly

```sql
-- Wrong
WHERE deleted_at = NULL;

-- Correct
WHERE deleted_at IS NULL;
```

---

#### Trap 3: Duplicate rows after JOIN

```sql
SELECT c.id, c.name
FROM customers c
JOIN orders o ON c.id = o.customer_id;
```

**Issue**

- One-to-many joins create duplicate customer rows

**Fix**

```sql
SELECT DISTINCT c.id, c.name
FROM customers c
JOIN orders o ON c.id = o.customer_id;
```

or use aggregation.

---

#### Trap 4: JOIN vs EXISTS

```sql
-- JOIN
SELECT DISTINCT c.*
FROM customers c
JOIN orders o ON c.id = o.customer_id;

-- EXISTS (often better)
SELECT *
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id
);
```

**Interview Insight**

- `EXISTS` avoids row multiplication
- Often more efficient for existence checks

---

### 3. GROUP BY Traps

#### Trap: Selecting non-grouped columns

```sql
-- Invalid
SELECT dept, salary
FROM employees
GROUP BY dept;
```

**Rule**

- Every selected column must be aggregated or included in `GROUP BY`

---

### 4. ORDER BY Traps

#### Q: Can ORDER BY use aliases?

**Answer**

- Yes, ORDER BY is evaluated last

```sql
SELECT price * qty AS total
FROM sales
ORDER BY total DESC;
```

---

### 5. FULL JOIN Traps

#### Q: How to find unmatched rows on both sides?

```sql
SELECT *
FROM a
FULL JOIN b ON a.id = b.id
WHERE a.id IS NULL OR b.id IS NULL;
```

**Use Case**

- Data reconciliation
- Auditing missing relationships

---

### 6. TRUNCATE vs DELETE Traps

| Feature       | DELETE | TRUNCATE           |
| ------------- | ------ | ------------------ |
| Transactional | Yes    | Mostly No          |
| WHERE clause  | Yes    | No                 |
| Resets ID     | No     | Yes (with RESTART) |
| Speed         | Slow   | Fast               |

**Interview Tip**

- `TRUNCATE CASCADE` affects dependent tables

---

### 7. PostgreSQL-Specific Interview Questions

#### Q: What is MVCC?

**Answer**

- PostgreSQL uses row versions
- Readers don’t block writers
- Writers don’t block readers

---

#### Q: Difference between JSON and JSONB?

**Answer**

- `JSON` stores text
- `JSONB` stores binary, faster queries, supports indexing

---

### 8. One-Line Rapid-Fire Interview Answers

- `JOIN` = `INNER JOIN`
- OUTER JOIN = LEFT + RIGHT + FULL
- Use `EXISTS` to avoid duplicate rows
- LEFT JOIN + WHERE = common trap
- Always `EXPLAIN ANALYZE` slow queries
