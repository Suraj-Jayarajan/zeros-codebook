# Postgres 101

## Why Postgres?
- Object relational db (as good as MySql)
- Adheres more to SQL Standards than MySql
- Excels at Concurrency
- Superior at Avoiding Data Curruption
- Custom Data Types, Operators & Index Types
- Best at Etensibilty, Scalability and Protection of your data

## Basic Structure
```
Server > PostgresSQL > Databases > Schemas > Table
```

## Basic DB Design rules
1. One table represents one real world object
2. Columns must only store one piece of information
3. Should have good table relations
4. Reduce redundant data

## Data Types
- Char(n): n charachters
- Varchar: Stores any length of characters
- Varchar(n): n characters
- Text: Any length of chars
- Smallserial: 1 to 32,767 (auto increments)
- Serial: 1 to 2147482647 (auto increments)
- Bigserial: 1 to 9223372036854775807
- Decimal : Floats
- Numeric : Floats (same as decimals)
- Real: 1E-37 to 1E37 (6 places of precision)
- Double Precision
- Float: Same as double
- Boolean: 
    - True (can be represented as True,1, t, y, yes or on), 
    - False (can be represented as False, 0, f, n, no or off)
    - null
- Date: stored format will be YYYY-MM-DD
- TIME WITHOUT TIME ZONE: stored in UTC -> HH:mm:ss
- TIME WITH TIME ZONE: stored with time zone like
    - EST : ex: 01:30 AM EST
    - PST
    - UTC
- TIMESTAMP:
- INTERVALS: Represent Duration of time like 1 day, 2h etc. You can add or subtract intervals
- Currency
- Binary
- JSON
- Range
- Geometric
- Arrays
- XML
- UUID
- Custom Data types: you can create custom data types


## Create Table
```sql
CREATE TABLE product_type(
    id SERIAL PRIMARY KEY;
    name VARCHAR(30) NOT NULL;
)


CREATE TABLE products(
    id SERIAL PRIMARY KEY;
    type_id INTEGER REFERENCES product_type(id),   # foriegn key
    name VARCHAR(30) NOT NULL,                   
    supplier VARCHAR(60) NOT NULL,
    description TEXT NOT NULL,
    date_entered TIMESTAMP NOT NULL DEFAULT current_timestamp,
);
```

## Insert Into table
```sql
INSERT INTO cutomers(
    first_name,
    last_name,
    email,
    ...
    date_entered
)
VALUES (
    'Chris',
    'Homes',
    'chris.homes@email.com'
    ...
    current_timestamp
),
(...),
(...);
```

## Select
```sql
SELECT * FROM publuc.customers
ORDER BY id DESC;
```

## Custom Types
```sql
CREATE TYPE gender as enum('M', 'F');
```

## ALTER Table

#### Alter type
```sql
ALTER TABLE customers 
ALTER COLUMN sex TYPE gender USING gender::gender;
```

#### Add Column
```sql
ALTER TABLE sales_item ADD day_of_week VARCHAR(8);
```

#### Delete Column
```sql
ALTER TABLE sales_item DROP COLUMN day_of_week;
```

#### Modify column
```sql
ALTER TABLE sales_item ALTER COLUMN day_of_week SET NOT NULL;
```

#### Rename column
```sql
ALTER TABLE sales_item RENAME COLUMN day_of_week TO weekday;
```

#### Rename Table
```sql
ALTER TABLE transaction_type RENAME to transactions;
```

#### Alter Column Type
```sql
ALTER TABLE customers ALTER COLUMN zip TYPE INTEGER;
```

## Create Index
```sql
CREATE INDEX transaction_id ON transactions(name);
```

```sql
CREATE INDEX transaction_combo ON transactions(name, payment_type)
```

## DELETE table Data
```sql
TRUNCATE TABLE transactions
```

#### Delete and restart id
```sql
TRUNCATE TABLE transactions RESTART IDENTITY; 
```

## Delete table
```sql
DROP TABLE transactions;
```


## Anatomy of a query

#### Comments
```sql
-- Single Line
/* 
Multi Line Comments
*/

```

#### Conditional Operators
= , < , > , <=,  >=, <>, !=

#### Logical Operators
AND, OR, NOT


```sql
SELECT DISTINCT
    CONCAT(t.string_col_name1, ' ', t.string_col_name2) AS name,
    t.supplier,
    t.discount,
    t.time_taken,
    t.date_entered,
    t.type_id,
    t.email
FROM schema.table_name AS t
WHERE t.discount > 0.15                          -- comparison
  AND t.date_entered BETWEEN                     -- BETWEEN (inclusive)
      TIMESTAMPTZ '2024-01-01' AND TIMESTAMPTZ '2024-12-31'
  AND t.type_id IN (1, 2, 3)                     -- IN list
  AND t.email ILIKE '%@gmail.com'                -- case-insensitive pattern
  AND t.deleted_at IS NULL                       -- NULL check
ORDER BY t.discount DESC, t.date_entered DESC    -- ORDER BY multiple cols
LIMIT 50                                         -- LIMIT
OFFSET 0;                                        -- OFFSET (pagination)
```

## WHERE


#### WHERE
```sql
SELECT * FROM sales_item
WHERE discount > 0.15 
AND time_taken > '2018-12-01' 
AND time_taken < '2018-12-30';
```

## Order

```sql
SELECT * FROM sales_item
WHERE discount > 0.15 
AND time_taken > '2018-12-01' 
AND time_taken < '2018-12-30'
ORDER BY discount DESC;
```

## Limit

```sql
SELECT * FROM 
```