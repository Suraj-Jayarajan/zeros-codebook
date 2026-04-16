# Python 101

- High level generic programming language
- Dynamically typed
- Interpreted
- Multi-paradigm (procedural, object-oriented, functional)
- Python 2.7 (legacy) and Python 3.x (current)
- Python manages memory using **garbage collection**. It uses **reference counting** to keep track of objects and variables in memory. When an object is no longer referenced, it is automatically deallocated.
- For objects forming refrence cycles, Python uses a **cyclic garbage collector** to identify and clean up these cycles.

**Execution Flow**

```
              |'''''''''''''|                 |'''''''''''''|
  |''''\      |   Python    |     |''''\      |   Python    |     -|'''|-
  | .py | --> | Interpreter | --> |.pyc | --> |   Virtual   | --> -| μ |-
  |_____|     |  (cpython)  |     |_____|     |   Machine   |     -|___|-
              |_____________|                 |_____________|
   Python                         Bytecode     Virtual Machine     Output
   Source                       Intermediate      Executes
    code
```

## Comments

```python
# This is a single-line comment

'''
This is a multi-line comment
'''

"""
Docstring: A special type of multi-line comment used to document functions, classes, and modules.
"""
```

## Console Output

```python
print("Hello, World!")
# Output: Hello, World!

print('''Now's the time for "Python" programming!''')
# Output: Now's the time for "Python" programming!

print("My name is %s and I am %d years old." % ("Alice", 30))
# Output: My name is Alice and I am 30 years old.

print("My name is {} and I am {} years old.".format("Alice", 30))
# Output: My name is Alice and I am 30 years old.

print("My name is {0} and I am {1} years old.".format("Alice", 30))
# Output: My name is Alice and I am 30 years old.

print("My name is {name} and I am {age} years old.".format(name="Alice", age=30))
# Output: My name is Alice and I am 30 years old.


name = "Alice"
age = 30
print(f"My name is {name} and I am {age} years old.") // Recommended
# Output: My name is Alice and I am 30 years old.

print("Hello", "World", end=' ', sep='-')  # Customizing end and separator
# Output: Hello-World
```

## Type Hierarchy

```
None > Boolean > Numeric (int, float, complex) > Sequence (str, list, tuple) > Mapping (dict)  > Set (set, frozenset)
```

### Variables and Data Types

```python
# Variable assignment
is_active = True  # Boolean
data = None     # NoneType

x = 10          # Integer
y = 3.14        # Float
complex_example = 1 + 2j  # Complex number

name = "Alice"  # String

list_example = [1, 2, 3]  # List
tuple_example = (1, 2, 3)  # Tuple
dict_example = {"key": "value"}  # Dictionary
set_example = {1, 2, 3}  # Set
frozenset_example = frozenset([1, 2, 3])  # Frozenset

# Multiple assignment
a, b, c = 1, 2.5, "Hello"

# Type checking
print(type(x))  # Output: <class 'int'>

# Type conversion
num_str = "123"
num_int = int(num_str)  # Convert string to integer
num_float = float(num_str)  # Convert string to float
```

## Console input

```python
name = input("Enter your name: ")
age = int(input("Enter your age: "))
```

## Control Flow

### If Statements

```python
x = int(input("Enter a number: "))
if x > 0:
    print("Positive")
elif x < 0:
    print("Negative")
else:
    print("Zero")
```

### Switch Statements (Python 3.10+)

```python
match command:
    case "start":
        print("Starting...")
    case "stop":
        print("Stopping...")
    case _:
        print("Unknown command")
```

## Loops

### For Loop

```python
for i in range(5):
    print(i)  # Output: 0, 1, 2, 3, 4
```

### While Loop

```python
count = 0
while count < 5:
    print(count)  # Output: 0, 1, 2, 3, 4
    count += 1
```

### Enhanced Loop Control

```python
words = ["apple", "banana", "cherry"]
for word in words:
    if word == "banana":
        continue  # Skip the rest of the loop for this iteration
    print(word)  # Output: apple, cherry
```

```python
users = {'Hans': 'active', 'Éléonore': 'inactive', '景太郎': 'active'}

for user, status in users.copy().items():
    if status == 'inactive':
        del users[user]
```

> Note: break and continue statements can be used in both for and while loops to control the flow of execution.

### Else Clause in Loops

In a for or while loop the break statement may be paired with an else clause. If the loop finishes without executing the break, the else clause executes.

```python
for n in range(2, 10):
    for x in range(2, n):
        if n % x == 0:
            print(n, 'equals', x, '*', n//x)
            break
    else:
        # loop fell through without finding a factor
        print(n, 'is a prime number')
```

## Data Structures

### Lists

```python
squares = [1, 4, 9, 16, 25]
print(squares) # Output: [1, 4, 9, 16, 25]
print(squares[0]) # Output: 1
print(squares[-1]) # Output: 25
print(squares[1:4]) # Output: [4, 9, 16]
print(squares[3:]) # Output: [16, 25]
print(squares[:3]) # Output: [1, 4, 9]
print(squares[-3:]) # Output: [9, 16, 25]
print(squares[::-1]) # Output: [25, 16, 9, 4, 1] # Reversed list
print(squares[::2]) # Output: [1, 9, 25]  # Every second element
print(squares[1::2]) # Output: [4, 16]  # Every second element starting from index 1
```
#### List Methods

```python
fruits = ['apple', 'banana', 'cherry']
fruits.append('orange' )  # Add an item to the end of the list
fruits.insert(1, 'grape')  # Insert an item at a specific index
fruits.remove('banana')  # Remove the first occurrence of an item
fruits.pop()  # Remove and return the last item 
fruits.pop(1)  # Remove and return the item at a specific index
fruits.clear()  # Remove all items from the list
fruits.index('cherry')  # Return the index of the first occurrence of an item
fruits.count('apple')  # Return the number of occurrences of an item
fruits.sort()  # Sort the list in place
fruits.reverse()  # Reverse the order of the list in place
len(fruits)  # Return the number of items in the list
```
