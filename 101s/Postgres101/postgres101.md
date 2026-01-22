# Postgres 101

## Basics
### Mental model (what interviewers are probing)
- **Correctness**: NULL logic, join semantics, grouping rules, transaction behavior.
- **Performance**: indexes, selectivity, avoiding unnecessary sorts, reading `EXPLAIN (ANALYZE, BUFFERS)`.
- **Postgres specifics**: MVCC, autovacuum/VACUUM, `jsonb`, window functions, upserts.

### Why PostgreSQL?

- **Object-relational database (ORDBMS)**: Supports relational data along with advanced types like JSON, arrays, ranges, and custom types.
- **Strong SQL standards compliance**: PostgreSQL closely follows ANSI SQL, making queries portable and predictable.
- **MVCC-based concurrency**: Uses Multi-Version Concurrency Control so readers never block writers and writers never block readers.
- **ACID-compliant**: Guarantees Atomicity, Consistency, Isolation, and Durability even under high concurrency.
- **Extensibility**: You can create custom data types, operators, functions, indexes, and install extensions (e.g., PostGIS).
- **Data integrity & reliability**: Rich constraints, transactional DDL, WAL (Write-Ahead Logging), and crash recovery.


### Logical Structure

```
Server → PostgreSQL Instance → Databases → Schemas → Tables / Views
```

### Basic Database Design Rules

1. One table represents one real‑world entity
2. Each column stores a single atomic value (normalization)
3. Use proper relationships (primary / foreign keys)
4. Minimize redundant data


### Comments
```sql
-- Single‑line comment
/* Multi‑line comment */
```
---

## Data types
- Text: `text`, `varchar(n)` (rarely need `char(n)`).
- Numbers: `smallint`, `int`, `bigint`, `numeric` (money/precision), `double precision` (scientific metrics).
- Auto Increment: `smallserial`, `serial`,`bigserial`
- Time: `date`, `time`, `timestamptz` (default recommendation), `timestamp` (no tz), `interval`(1 day, 2 hours etc.., can be added/subtracted).
- IDs: `uuid`.
- Semi-structured: `jsonb` (**preferred** over `json` for querying/indexing).
- Lists: arrays (`int[]`, `text[]`). (Prefer join tables if possible)
- Others: `enum`, `bytea` (binary data for images, files etc)

> **JSON vs JSONB**
> - `JSON`: stored as text, slower to query
> - `JSONB`: stored in binary format, faster search and indexing
>
> ```sql
> SELECT * FROM users WHERE metadata->>'role' = 'admin';
> ```

> **BYTEA Example**
> ```sql
> INSERT INTO files (data)
> VALUES (pg_read_binary_file('/path/file.png'));
> ```

## Anatomy of a Postgres function
### Big picture: what a function is in Postgres
> A Postgres function is:
> - **named code** stored in the database
> - accepts **typed parameters**
> - returns either:
>  - a **single value** (`RETURNS int`)
>  - a **single row** (composite type)
>  - a **set of rows** (`RETURNS TABLE(...)`), which is what you often want for API-like retrieval


```sql
DROP FUNCTION IF EXISTS SCHEMA.FN_NAME(ARG1_TYPE, ARG2_TYPE);

CREATE OR REPLACE FUNCTION SCHEMA.FN_NAME(
    arg1 ARG1_TYPE,
    arg2 ARG2_TYPE
)
RETURNS TABLE(
    out_col1 OUT1_TYPE,
    out_col2 OUT2_TYPE,
    out_col3 OUT3_TYPE
)
LANGUAGE 'plpgsql'
COST 100
VOLATILE SECURITY DEFINER PARALLEL UNSAFE
ROWS 1000
AS $BODY$
BEGIN

  RETURN QUERY
  SELECT
      t1.col_a AS out_col1,
      t2.col_b AS out_col2,
      t3.col_c AS out_col3
  FROM
      SCHEMA.table1 t1
      JOIN SCHEMA.table2 t2
        ON t2.fk_id = t1.id
      LEFT JOIN SCHEMA.table3 t3
        ON t3.t2_id = t2.id
  WHERE
      t1.some_col = arg1
    AND t2.other_col = arg2
  ORDER BY
      t1.sort_col;

END
$BODY$;

GRANT EXECUTE ON FUNCTION SCHEMA.FN_NAME(ARG1_TYPE, ARG2_TYPE) TO ROLE_OR_PUBLIC;
````


### `DROP FUNCTION IF EXISTS ...`

* **Why it exists**: lets you re-run scripts without errors.
* **Signature matters**: `fn_name(int,int)` is different from `fn_name(text,int)`.
* Interview line: *“In Postgres, functions are uniquely identified by name + argument types.”*

### `CREATE OR REPLACE FUNCTION ...`

* **Create** or replace the existing definition of the same signature.
* Good for migrations and iterative development.

### `SCHEMA.FN_NAME`

* `schema` is a namespace (like a folder).
* avoids ambiguity and prevents “wrong object” issues when multiple schemas contain same names.

Junior note:

* If you don’t qualify schema, Postgres uses `search_path` to decide what it finds first.

### `Parameters`

```sql
(arg1 ARG1_TYPE, arg2 ARG2_TYPE)
```

* Parameters are **typed**: helps correctness and planning.
* They become variables inside the function body.

Example:

```sql
WHERE t1.some_col = arg1
```

Interview note:

* types affect index use and implicit casts.
* avoid unnecessary casts like `WHERE id::text = '123'` (can block index usage).


### `RETURNS TABLE(...)`

Means the function returns a **result set** with named columns (like a view, but parameterized).

Benefits:

* caller can just do:

  ```sql
  SELECT * FROM schema.fn_name(1, 2);
  ```
* output columns are documented by the function signature itself.

Junior mental model:

* `RETURNS TABLE` is “this function behaves like a SELECT statement returning rows.”


### `LANGUAGE 'plpgsql'`

* PL/pgSQL adds:

  * `BEGIN/END`
  * variables
  * `IF/ELSE`
  * loops
  * exceptions
* If your function is *only a SELECT*, `LANGUAGE SQL` is often simpler and can be faster.

### `COST 100`

* Tells planner expected *cost per call*.
* Most teams leave defaults unless tuning.

### `ROWS 1000`

* For set-returning functions, expected number of rows.
* Helps join planning decisions (nested loop vs hash join etc.).

Junior warning:

* Wrong estimates can lead to slower query plans.


### `VOLATILE`

Means results may change even with same inputs, so planner can’t “cache/reorder” it much.

* `IMMUTABLE`: (math-ish)same output always (best for index expressions).
* `STABLE`: (consistent snapshot per statement)same within a statement, can change later (reads tables).
* `VOLATILE`: (unpredictable) can change at any moment (random/now/write-heavy or complex).


### `SECURITY DEFINER`

* function runs with **owner permissions** (not caller).
* used to provide controlled access.

Big risk:

* `search_path` hijacking (calling attacker’s object with same name)

Interview-ready safe pattern:

* set a safe search_path inside the function (conceptually):

  * “I would lock down `search_path` to `pg_catalog` and my schema.”


### `PARALLEL UNSAFE`

* function cannot run in parallel workers.
* matters mostly for large analytics queries.

### `RETURN QUERY`

* returns rows from a query into the `RETURNS TABLE(...)` output.
* simplest way to build set-returning functions.

**Alternative:**

* `RETURN NEXT` for emitting rows one by one (less common for pure SELECT logic).

**Query execution order (super important):**

**FROM / JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT/OFFSET**

Why you care:

* `WHERE` filters *rows* **before** grouping.
* `HAVING` filters *groups* **after** aggregation.
* `ORDER BY` happens very late, so it can be expensive if it sorts huge result sets.


**NULL rules**

`NULL` means “unknown” — it is not equal to anything, including another `NULL`.

Examples:

```sql
-- Wrong (won't work as you expect)
WHERE col = NULL

-- Correct
WHERE col IS NULL
WHERE col IS NOT NULL
```

`NOT IN` trap:

```sql
-- If subquery returns any NULL, NOT IN can behave unexpectedly
SELECT * FROM a WHERE a.id NOT IN (SELECT b.a_id FROM b);
```

Prefer `NOT EXISTS`:

```sql
SELECT *
FROM a
WHERE NOT EXISTS (
  SELECT 1
  FROM b
  WHERE b.a_id = a.id
);
```


### `GRANT EXECUTE ON FUNCTION ...`

* permission to call it
* includes signature: must match exact arg types

Advice:

* avoid `TO PUBLIC` unless you truly want everyone to execute it.
* prefer a role like `app_readonly` or `app_user`.


## DML / Querying 
### Select


#### Aggregate Functions

```sql
SELECT
    COUNT(*) As items,
    SUM(price) AS value,
    ROUND(AVG(price), 2) AS avg,
    MIN(price) AS min,
    MAX(price) AS max
FROM items;
```
* `COUNT(*)` counts rows (including rows with NULLs in columns).
* `COUNT(col)` counts **non-NULL** values in that column.
* `COUNT(DISTINCT col)` can be expensive (sort/hash).

### Create Table
```sql
CREATE TABLE orders (
  id bigint generated always as identity primary key,
  user_id bigint not null references users(id),
  amount numeric(12,2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);
````

What each part does:

* `generated ... as identity`: modern auto-increment replacement for `serial`.
* `primary key`: uniqueness + fast lookup via index.
* `references users(id)`: foreign key constraint (enforces integrity).
* `not null`: column must be present.
* `check (...)`: business rule in the database.
* `default now()`: automatically sets created time.

> `serial/bigserial` are legacy-ish convenience; modern choice is often `generated ... as identity`:
>    ```sql
>    id bigint generated always as identity primary key
>    ```

#### Constraints

- `PRIMARY KEY`
- `FOREIGN KEY`
- `UNIQUE`
- `NOT NULL`
- `CHECK`

#### WHERE Clause Operators

- Comparison: `=`, `<`, `>`, `<=`, `>=`, `<>`, `!=`
- Logical: `AND`, `OR`, `NOT`
- Set: `IN`, `BETWEEN`
- Pattern: `SIMILAR TO`, `LIKE`, `ILIKE`
- NULL check: `IS NULL`, `IS NOT NULL`

#### Regular expression patterns (quick)

* `.` any char
* `*` 0 or more
* `+` 1 or more
* `?` 0 or 1
* `^` start of string, `$` end of string
* `[abc]` any of a/b/c, `[a-z]` range
* `\d` digit, `\w` word char, `\s` whitespace (note: depends on regex flavor; Postgres uses POSIX/ARE, common escapes supported)
  Example:

```sql
SELECT 'abc123' ~ '^[a-z]+[0-9]+$'; -- true
```

#### Window functions (Important)
Window functions compute values **across related rows** without collapsing them like GROUP BY.

```sql
SELECT
  user_id,
  amount,
  created_at,
  row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
FROM orders;
```

Tokens:

* `OVER (...)`: defines the “window”
* `PARTITION BY user_id`: restart numbering per user
* `ORDER BY created_at DESC`: define ranking order



### Insert Data
```sql
INSERT INTO customers (first_name, last_name, email, date_entered)
VALUES ('Chris', 'Homes', 'chris.homes@email.com', CURRENT_TIMESTAMP);
```

### Create Custom Types (ENUM example)

```sql
CREATE TYPE gender AS ENUM ('M', 'F');
```
> **ENUM Limitations**
>
> - Values cannot be easily removed
> - Adding new values requires `ALTER TYPE`
> - Ordering is fixed at creation
> - Harder to migrate than lookup tables

Use ENUMs only for stable, rarely-changing values.


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

### Create Index

```sql
CREATE INDEX idx_transactions_name
ON transactions(name);
```

**Composite Index**

```sql
CREATE INDEX idx_transactions_name_payment
ON transactions(name, payment_type);
```

> **Notes:**
> * Default: **B-tree** (equality and range queries).
> * `GIN`: `jsonb`, arrays, full-text search.
> * `GiST`: ranges, geo (often with PostGIS), some fuzzy matches.
> * `BRIN`: huge append-only tables where data is naturally ordered.
>
> Always validate with:
> 
> ```sql
> EXPLAIN (ANALYZE, BUFFERS)
> SELECT ...
> ```


### DELETE (row-by-row, transactional)

```sql
DELETE FROM transactions WHERE id = 10;
```

### TRUNCATE (fast, removes all rows)

```sql
TRUNCATE TABLE transactions;
```

**TRUNCATE and RESTART IDENTITY**

- Use when you want sequences (SERIAL/IDENTITY) reset

```sql
TRUNCATE TABLE transactions RESTART IDENTITY;
```

**TRUNCATE CASCADE**
- Use when dependent tables reference the table

```sql
TRUNCATE TABLE transactions CASCADE;
```

**TRUNCATE CASCADE AND RESTART IDENTITY**

```sql
TRUNCATE TABLE transactions CASCADE RESTART IDENTITY;
```

### DROP TABLE

```sql
DROP TABLE transactions;
```

**CASCADE:**  
- Drops dependent objects (foreign keys, views)

```sql
DROP TABLE transactions CASCADE;
```

### UPSERT 

```sql
INSERT INTO users (email, name)
VALUES ('a@b.com', 'A')
ON CONFLICT (email)
DO UPDATE SET name = EXCLUDED.name;
```

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

> **Note:**
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

## Set Operators

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

### UNION vs JOIN (Common Interview Question)

| Aspect      | UNION            | JOIN                    |
| ----------- | ---------------- | ----------------------- |
| Combines    | Rows             | Columns                 |
| Use case    | Similar datasets | Related tables          |
| Result size | Sum of rows      | Depends on relationship |



## Views

```sql
CREATE VIEW purchase_order_overview AS
SELECT col1, col2, col2, (sales_item.quantity * item.price) as Total
FROM sales_order
JOIN ....
```

* Views **can** contain joins, aggregates, `DISTINCT`, `GROUP BY`, `HAVING`, `UNION`, etc.
* Many complex views are **not automatically updatable** (Postgres has rules for what can be updated).

**Drop View**

```sql
DROP VIEW purchase_order_overview
```


## Functions

#### SQL Functions Basic Syntax

```sql
CREATE OR REPLACE FUNCTION function_name(int, int)
RETURNS numeric as
$body$
    SELECT $1 + $2;     -- SQL Commands
$body$
LANGUAGE SQL; -- Using the SQL language

---

CREATE OR REPLACE FUNCTION function_name(x int, y int)
RETURNS numeric as
$body$
    SELECT x + y;     -- SQL Commands
$body$
LANGUAGE SQL; -- Using the SQL language
```

```sql
SELECT function_name(4, 5);
```

#### PL/pgSQL Functions

```sql
CREATE OR REPLACE FUNCTION function_name(parameter par_type)
RETURNS ret_type AS
$body$
BEGIN
-- SQL Statements
END;
$body$
LANGUAGE plpgsql;

```

### Function Parameters: `IN`, `OUT`, `INOUT`

#### What they mean

* **`IN`**: input-only parameter (this is the **default** if you don’t specify a mode).

  * Used to pass values *into* the function.
* **`OUT`**: output-only parameter.

  * You **don’t pass** it when calling the function; the function **returns** it.
  * Multiple `OUT` params let you return multiple values (as a “record-like” row).
* **`INOUT`**: both input and output.

  * You pass an initial value in, and the function returns the modified value.

> Practical rule:
> Use `IN` for normal arguments, and `OUT`/`INOUT` when you want the function to “return a row” (multiple outputs) without defining a custom type.


#### `IN` example (default behavior)

```sql
CREATE OR REPLACE FUNCTION add_two_numbers(a INT, b INT)
RETURNS INT AS
$$
BEGIN
  RETURN a + b;
END;
$$ LANGUAGE plpgsql;

SELECT add_two_numbers(2, 3);  -- 5
```

*(Here `a` and `b` are `IN` by default.)*

---

#### `OUT` example (return multiple values)

```sql
CREATE OR REPLACE FUNCTION get_min_max(a INT, b INT, OUT min_val INT, OUT max_val INT)
AS
$$
BEGIN
  min_val := LEAST(a, b);
  max_val := GREATEST(a, b);
END;
$$ LANGUAGE plpgsql;

SELECT * FROM get_min_max(10, 4);
-- min_val | max_val
--    4    |   10
```

Notes:

* With `OUT` params, you typically **omit `RETURNS ...`** and just use `AS $$ ... $$`.
* You can query it like a table: `SELECT * FROM ...` because it returns a row.

---

#### `INOUT` example (modify and return a value)

```sql
CREATE OR REPLACE FUNCTION apply_discount(INOUT price NUMERIC, discount_pct NUMERIC)
AS
$$
BEGIN
  price := price * (1 - discount_pct / 100);
END;
$$ LANGUAGE plpgsql;

SELECT apply_discount(200, 10);  -- 180
```

Notes:

* `price` is passed in and returned.
* You still **call it with both arguments** (`price`, then `discount_pct`).

---

#### Returning style cheat sheet

* `RETURNS INT` (simple scalar) → `SELECT fn(...)`
* `OUT` / multiple outputs → `SELECT * FROM fn(...)`
* `RETURNS TABLE(...)` is similar to multiple `OUT` params (another common style)


## Transactions + locks

### Transaction basics

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT; 
-- or
ROLLBACK;
```

### Isolation levels (memory hooks)

* **READ COMMITTED** (default): each statement sees a fresh snapshot of committed data.
* **REPEATABLE READ**: whole transaction sees the same snapshot (consistent reads).
* **SERIALIZABLE**: strongest; may fail with serialization errors → **retry logic** in app.

Set isolation:

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- work
COMMIT;
```

### Row locks (common)

* `SELECT ... FOR UPDATE`: locks selected rows so others can’t update/delete them until commit.
* `SELECT ... FOR SHARE`: prevents others from updating/deleting, but allows reads.

```sql
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;
```

### Deadlocks (what interviewers want)

Deadlock happens when two transactions lock resources in opposite order.

Avoidance tips:

* Always lock rows in a **consistent order** (e.g., order by id).
* Keep transactions **short**.
* Use retries for serialization/deadlock errors where appropriate.

### Table locks (less common, but good to know)

```sql
BEGIN;
LOCK TABLE orders IN SHARE ROW EXCLUSIVE MODE;
-- maintenance work
COMMIT;
```

Isolation (short memory hooks):

* **READ COMMITTED** (default): each statement sees a fresh snapshot.
* **REPEATABLE READ**: whole transaction sees the same snapshot.
* **SERIALIZABLE**: strongest; may abort with serialization errors you must retry.

`TRUNCATE` vs `DELETE`

* `DELETE`: row-by-row; fires triggers; can be slow but flexible (`WHERE`).
* `TRUNCATE`: fast; removes all rows; stronger locks; can cascade; **transactional** (can roll back).


## VACUUM + ANALYZE

### Why Postgres needs VACUUM (MVCC)

Postgres keeps old row versions (dead tuples) until vacuum cleans them.

* Updates/deletes create dead tuples.
* Too many dead tuples → table/index bloat → slower queries.

### What each command does

* `VACUUM`: marks dead space reusable, updates visibility map.
* `ANALYZE`: updates planner statistics (row counts, distribution) used to choose plans.
* `VACUUM (ANALYZE)`: does both.
* `VACUUM FULL`: rewrites table to physically shrink it (blocks more; heavy).

```sql
VACUUM (ANALYZE) orders;
```

### Autovacuum (important practical note)

* Usually handles this automatically.
* Symptoms of trouble: tables grow fast, queries degrade, “rows estimated vs actual” is way off, long-running transactions prevent cleanup.

Interview-ready line:

* “If estimates are bad and plans are wrong, I run `ANALYZE` and check autovacuum health.”


## Index patterns (partial / expression / include)

### Composite index ordering (quick rule)

Index on `(a, b)` helps:

* `WHERE a = ?`
* `WHERE a = ? AND b = ?`
* not usually `WHERE b = ?` alone (leftmost prefix rule).

```sql
CREATE INDEX ON orders (user_id, created_at);
```

### Partial index (index only the rows you care about)

Great when most rows are irrelevant to the common query.

```sql
CREATE INDEX ON orders (user_id, created_at)
WHERE status = 'PAID';
```

### Expression index (index computed value)

Use when your query applies a function to the column.

```sql
CREATE INDEX ON users (lower(email));

-- uses the index:
SELECT * FROM users WHERE lower(email) = lower('A@B.COM');
```

### Covering index with INCLUDE (avoid table heap fetch)

`INCLUDE` adds extra columns stored in the index for index-only scans.

```sql
CREATE INDEX ON orders (user_id, created_at DESC)
INCLUDE (amount, status);
```

### When indexes often don’t help (quick warnings)

* Very low selectivity (`WHERE is_active = true` when 95% are true)
* Leading wildcard: `LIKE '%abc'` (needs trigram or full-text strategies)
* Casting the column in WHERE (`WHERE id::text = '123'`) unless indexed accordingly

## EXPLAIN plan decoder (what to look for)

Run:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...
```

### Common scans

* **Seq Scan**: reading the whole table (can be fine for tiny tables).
* **Index Scan**: uses an index to find matching rows.
* **Index Only Scan**: can answer from index alone (needs visibility map).
* **Bitmap Index Scan + Bitmap Heap Scan**: good when many rows match but not most.

### Common joins

* **Nested Loop**: good when outer side is small + indexed inner lookups.
* **Hash Join**: good for large joins on equality (build hash table).
* **Merge Join**: good when both sides are sorted on join keys (or can be).

### Sort and Group nodes

* **Sort**: indicates ordering; can be expensive if it spills to disk.
* **HashAggregate / GroupAggregate**: grouping strategies.

### The single best “diagnostic”

Compare:

* **estimated rows** vs **actual rows**
  Big mismatch → statistics issue:
* run `ANALYZE`
* ensure predicates are sargable (index-usable)
* consider better indexes

### BUFFERS (high signal)

* many shared/read blocks + high time → IO heavy
* index-only scans reduce heap reads


## CTEs + pagination

### CTE (WITH) basics

CTEs are named subqueries:

```sql
WITH recent_orders AS (
  SELECT *
  FROM orders
  WHERE created_at >= now() - interval '7 days'
)
SELECT user_id, COUNT(*) 
FROM recent_orders
GROUP BY user_id;
```

### Optimization note (modern Postgres)

* CTEs may be inlined (optimized like a subquery).
* You can control behavior:

  * `WITH ... AS MATERIALIZED (...)` to force materialization
  * `WITH ... AS NOT MATERIALIZED (...)` to encourage inlining (where supported)

### Pagination: OFFSET vs keyset (cursor)

**OFFSET pagination** (simple, slows down on deep pages):

```sql
SELECT *
FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 50 OFFSET 5000;
```

**Keyset pagination** (recommended for large tables):

```sql
-- First page (no cursor)
SELECT *
FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 50;

-- Next page using last row’s (created_at, id) as cursor
SELECT *
FROM orders
WHERE (created_at, id) < ($last_created_at, $last_id)
ORDER BY created_at DESC, id DESC
LIMIT 50;
```

Keyset notes:

* Requires a stable ordering (often `(created_at, id)`).
* Index that matches the order helps a lot:

```sql
CREATE INDEX ON orders (created_at DESC, id DESC);
```

----
## Common Interview Traps

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
