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

## Functions

```python
count = 0
def fnName(a: int | 0, b: str | None, c:list=[]) -> bool:
    """
    Docstring: Describe the function's purpose and usage.
    """
    global count

    count += 1
    return a, b, c

intRes, stringRes, listRes = fnName(1, '2')  # Using default value for param3
intRes, stringRes, listRes = fnName(c=list[2,2], a=1, b="dfsd")  # Using keyword arguments


def total(*numbers):
    print(numbers)   # Tuple
    return sum(numbers)

print(total(1, 2, 3, 4))  # Output: 10


def user_info(**data):
    print(data)  # Dictionary

user_info(name="Alice", age=30)


```

### Lambda Functions

```python
add = lambda x, y: x + y
print(add(2, 3))  # Output: 5
```

### Recursion

```python
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n - 1)
print(factorial(5))  # Output: 120
```

### Generator Functions

> Generators produce values one at a time instead of storing everything in memory.

```python
def count_up_to(n):
    count = 1
    while count <= n:
        yield count  # Yield the current count and pause the function
        count += 1

for number in count_up_to(5):
    print(number)  # Output: 1, 2, 3, 4, 5
```

### Special Parameters

```python
def fn(a, b, /, c, d, *, e, f):
    print(a, b, c, d, e, f)

fn(1, 2, 3, 4, e=5, f=6)
```

| Symbol | Name                       | Meaning                                         |
| ------ | -------------------------- | ----------------------------------------------- |
| `/`    | Positional-only parameters | Parameters before / must be passed by position. |
| `*`    | Keyword-only parameters    | Parameters after \* must be passed by keyword.  |

## Anatomy of a Class

### Python Terminology:

- **Class Variable**: A variable that is shared by all instances/objects of the class.
- **Instance Variable**: A variable that is unique to each instance/object of a class.
- **Static Variable**: In Python, class variables can serve as static variables.
- **Class Method**: A method that is bound to the class and not the
- **Instance Method**: A method that is bound to the instance of the class and can access instance variables.
- **Static Method**: A method that is bound to the class and does not have access to instance variables or class variables.

```python
class ClassName(Parent1, Parent2):
    class_variable = "I am a class variable" # Class variable shared by all instances, behaves like a static variable

    def __init__(self, p1, p2, p3, p4, p5, p6, p7):
        super().__init__(p1, p2)                     # Call the parent's constructor
        super(Parent2, self).__init__(p3, p4)        # Call the second parent's constructor
        self.instance_variable = p5                  # public instance variable
        self._protected_variable = p6                # protected instance variable (Suggestive convention only, not enforced by Python)
        self.__private_variable = p7                 # private instance variable (Name mangling, not truly private but less accessible)

    @property
    def private_variable(self) :                     # Getter
        return self.__private_variable

    @private_variable.setter
    def private_variable(self, value):               # Setter
        self.__private_variable = value


    def instance_method(self, arg1, arg2 = 0): -> None:
        pass


    def _instance_method_protected(self, arg1, arg2 = 0):  -> None:
        pass


    def __instance_method_private(self, arg1, arg2 = 0):  -> None:
        pass


    @staticmethod
    def static_method(arg1, arg2 = 0): -> int          # To perform utility functions
        return arg1 + arg2

    @classmethod
    def class_method(cls): -> str                  # Can access class variables and modify class state
        return cls.class_variable



obj = ClassName(1, 2, 3, 4, 5, 6, 7)

obj.instance_variable = 10  # Modifying instance variable
obj.private_variable = 20  # Modifying private variable using setter
ClassName.class_variable = "Modified class variable"  # Modifying class variable through class

print(obj.instance_variable)  # Accessing instance variable
print(obj.private_variable)  # Accessing private variable using getter
print(obj.class_variable)  # Accessing class variable
print(ClassName.class_variable)  # Accessing class variable through class
print(ClassName.class_method())  # Calling class method
print(ClassName.static_method(10, 20))  # Calling static method
```

#### Notes

- In Python, there is no strict enforcement of access modifiers (public, protected, private). The conventions are based on naming:
  - Public: No underscore (e.g., `instance_variable`)
  - Protected: Single underscore (e.g., `_protected_variable`) - This is a convention to indicate the programmer should not access this variable directly, but it is still accessible from outside the class.
  - Private: Double underscore (e.g., `__private_variable`) - This triggers name mangling (the variable is renamed internally by python to `_ClassName__private_variable`), making it less accessible but not truly private.
- Class variables are not static variables in the traditional sense, but they can be used to achieve similar functionality. They are shared across all instances of the class, and modifying them through the class will affect all instances that reference it.
- Python does not have true constants, but expects developer decipline by convention
  ```python
    PI = 3.14159  # Constant by convention (uppercase variable name)
  ```

### Magic Methods (Dunder Methods)

1. `__init__(self, ...)`: Constructor method called when an instance is created.
2. `__str__(self)`: Defines the string representation of the object for human-readable output (used by `print()`).
3. `__repr__(self)`: Defines the string representation of the object for debugging (used by `repr()`).
4. `__len__(self)`: Defines the behavior of the built-in `len()` function.
5. `__getitem__(self, key)`: Defines behavior for accessing items using square brackets (e.g., `obj[key]`).
6. `__setitem__(self, key, value)`: Defines behavior for setting items using square brackets (e.g., `obj[key] = value`).
7. `__delitem__(self, key)`: Defines behavior for deleting items using square brackets (e.g., `del obj[key]`).
8. `__iter__(self)`: Defines behavior for iteration (e.g., in a for loop).
9. `__next__(self)`: Defines behavior for the next item in an iterator (used with `__iter__`).
10. `__call__(self, ...)`: Allows an instance to be called as a function
11. `__eq__(self, other)`: Defines behavior for the equality operator `==`.
12. `__lt__(self, other)`: Defines behavior for the less-than operator `<`.
13. `__gt__(self, other)`: Defines behavior for the greater-than operator `>`.
14. `__add__(self, other)`: Defines behavior for the addition operator `+`.
15. `__sub__(self, other)`: Defines behavior for the subtraction operator `-`.
16. `__mul__(self, other)`: Defines behavior for the multiplication operator `\*
17. `__truediv__(self, other)`: Defines behavior for the division operator `/`.
18. `__floordiv__(self, other)`: Defines behavior for the floor division operator `//`.
19. `__mod__(self, other)`: Defines behavior for the modulus operator `%`.
20. `__pow__(self, other)`: Defines behavior for the exponentiation operator `**`.
21. `__enter__(self)`: Defines behavior for entering a context (used with `with` statements).
22. `__exit__(self, exc_type, exc_value, traceback)`: Defines behavior for exiting a context (used with `with` statements).

```python
class MyClass:
    def __init__(self, value):
        self.value = value

    def __str__(self):
        return f"MyClass with value: {self.value}"

    def __repr__(self):
        return f"MyClass({self.value})"

    def __enter__(self):
        print("Entering context")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print("Exiting context")
        return self

    def __add__(self, other):
        if isinstance(other, MyClass):
            return MyClass(self.value + other.value)
        return NotImplemented
```

### Data Classes (Python 3.7+)

```python
from dataclasses import dataclass

@dataclass
class Product:
    name: str
    price: float

product1 = Product("Laptop", 999.99)
product2 = Product("Smartphone", 499.99)
```

> Can be used for immutable data structures by setting `frozen=True` in the dataclass decorator. This will make the instance variables read-only after initialization.

```python
from dataclasses import dataclass
@dataclass(frozen=True)
class Config:
    APP_NAME: str = "MyApplication"
    VERSION: str = "1.0.0"

config = Config()
print(config.APP_NAME)  # Output: MyApplication
config.APP_NAME = "NewName"  # This will raise a FrozenInstanceError
```

### OOPS

#### Encapsulation

- Enforced by private and protected variables, methods using setters and getters, and by using properties to control access to instance variables.

#### Abstraction

- Methods with SOLID principles, hiding internal implementation details and exposing only necessary interfaces to the user.

#### Inheritance

- Supported through class inheritance, allowing a new class (child) to inherit attributes and methods from an existing class (parent).

#### Polymorphism

- Achieved through method overriding, where a child class can provide a specific implementation of a method that is already defined in its parent class. This allows for dynamic method resolution at runtime, enabling different behaviors based on the object type.

### Abstract Classes and Interfaces

- Python does not have built-in support for interfaces, but it can be achieved using Abstract Base Classes (ABCs) from the `abc` module. ABCs allow you to define abstract methods that must be implemented by any subclass.

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    def area(self):
        return 3.14 * self.radius ** 2
```

### Exception Handling

```python
try:
    num = int(input("Enter number: "))
    result = 10 / num

except (ValueError, ZeroDivisionError, TypeError):
    print("Invalid number")

except Exception as e:
    print(f"An error occurred: {e}")

else:
    print("You entered:", num)

finally:
    print("Execution completed")
```

#### Common Built-in Exceptions

| Exception           | Cause                  |
| ------------------- | ---------------------- |
| `ValueError`        | Invalid value          |
| `TypeError`         | Wrong data type        |
| `ZeroDivisionError` | Division by zero       |
| `IndexError`        | Invalid list index     |
| `KeyError`          | Missing dictionary key |
| `FileNotFoundError` | File does not exist    |

##### Custom Exceptions

```python
class InvalidAgeError(Exception):
    pass

age = -5

if age < 0:
    raise InvalidAgeError("Invalid age")
```


### File Handling

```python
with open('file.txt', 'r') as file:
    content = file.read()
    print(content)
with open('file.txt', 'w') as file:
    file.write("Hello, World!")
```

#### File Methods
| Method        | Description      |
| ------------- | ---------------- |
| `read()`      | Read entire file |
| `readline()`  | Read one line    |
| `readlines()` | Read all lines   |
| `write()`     | Write text       |
| `close()`     | Close file       |

#### File Modes
| Mode  | Description         |
| ----- | ------------------- |
| `"r"` | Read file           |
| `"w"` | Write (overwrite)   |
| `"a"` | Append              |
| `"x"` | Create new file     |
| `"b"` | Binary mode         |
| `"t"` | Text mode (default) |


### Modules and Packages

A module is a single Python file (.py) containing code such as:

```python
# math_utils.py

PI = 3.14

def add(a, b):
    return a + b
```

A package is a collection of modules organized in directories.
