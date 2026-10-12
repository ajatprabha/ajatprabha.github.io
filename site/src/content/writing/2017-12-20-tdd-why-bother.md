---
title: "TDD (Test Driven Development), why bother?"
description: "Recently I came to know about TDD (Test Driven Development), a development methodology in Agile Software Craftsmanship. At first, I was not even sure that how can we write tests to detect..."
publishedAt: "2017-12-20T17:24:00+00:00"
route: "/2017/12/20/tdd-why-bother"
tags: ["tdd"]
projectIds: []
author: "ajatprabha"
cover: {"height":945,"width":2160,"alt":"","src":"/assets/images/tdd-why-bother.jpg"}
legacySourceId: "2017-12-20-tdd-why-bother"
---

Recently I came to know about TDD (Test Driven Development), a development methodology in [Agile Software Craftsmanship](/2017/12/12/sdlc-waterfall-vs-agile). At first, I was not even sure that how can we write tests to detect bugs in the code, because we write very specific tests that don’t cover every possible use-case. I didn’t understand the purpose of such tests at all. But then digging more into the topic I discovered what is the utility of these tests which I’m going to share in this article.


<h2 id="what-is-tdd">What is TDD?</h2>


You already know the full-form of TDD. Now, TDD is a process that is used to create software with very small repetitive cycles which include: analysis of the requirement, converting that requirement into a very specific test case which shall fail, then we write the production code to make the test pass, we refactor the code and then again repeat the cycle with new requirement. After each cycle, all the tests must pass. We’re not that great at coming up with a code that has correct behaviour and correct structure simultaneously. To overcome this, we follow the RGR cycle in TDD, while always keeping the three laws of TDD in mind.


<h2 id="the-three-laws-of-tdd">The Three Laws of TDD</h2>


These laws lock a developer into a cycle that is short but is very crucial to maintain. They are:

> 1.  You may not write production code until you have written a failing unit test.
> 2.  You may not write more of a unit test that is sufficient to fail, and not compiling is failing.
> 3.  You may not write more production code that is sufficient to pass the currently failing test.

The purpose of these laws is just to provide line-by-line granularity to the code. Almost every second you keep these laws into consideration.


<h2 id="rgr-cycle">RGR Cycle</h2>


Red-Green-Refactor cycle is repeated after every complete unit test or after a couple of the three laws cycles. They are:

> 1.  Write a failing unit test
> 2.  Write production code that makes the unit test pass, by any means necessary
> 3.  Clean up the mess, i.e. refactor the code

<img src="/assets/images/RGR-cycle-300x300.png" alt="RGR Cycle Infographic" width="300" height="300" loading="lazy" decoding="async">  
Source: Self-created.

Purpose of RGR cycle is to write clean code subject to constraints. As you write unit tests, you specify the behaviour of the software. And then you write production code which is constrained by the unit tests, so you can structure your production code while maintaining the behaviour of the software. Refactoring is done after each cycle, it is not to be left after the end of the project. It is this cycle that makes it easy to make changes in the code at any stage a lot easier while still maintaining the behaviour required.


<h2 id="specificgeneric-cycle">Specific/Generic Cycle</h2>


This cycle is observed after every 10-15 minutes. It tells you that

> As the tests get more specific, the production code gets more generic.

We’ll understand soon what this means with the help of an example. But in a nutshell, when you add even finer granularity to the unit tests, you should write more generalised production code to make the test pass.


<h3 id="now-lets-take-the-example-of-building-a-stack-class-using-tdd">Now let’s take the example of building a stack class using TDD.</h3>


I’ll use python in this example. Under a directory, I created two files viz. `stack.py` and `test_stack.py` :

*   `stack.py` contains the production code and the class `Stack`
*   `test_stack.py` contains unit tests and the class `TestStack`

So let’s say the very first test is that the size of a new stack should be zero. Note that tests in python should be prefixed with `test_`  



```python
import unittest
from stack import *


class TestStack(unittest.TestCase):

    def test_new_stack_should_be_empty(self):
        stack = Stack()
        self.assertEqual(stack.size(), 0)
```

[base-test-stack.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-base-test-stack-py)

  

Create an interface method like this.  



```python
class Stack(object):

    def size(self):
        pass
```

[base-stack.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-base-stack-py)

  

Now, run the automated tests provided by `unittest` module in python by command `python -m unittest`. Let me make the test fail by returning a value -1  



```python
class Stack(object):

    def size(self):
        return -1
```

[stack-size-fail.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-stack-size-fail-py)

  

I can make this test pass simply by returning the desired value 0, recall point 2 of RGR cycle.  



```python
class Stack(object):

    def size(self):
        return 0
```

[stack-size-pass.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-stack-size-pass-py)

  


<h3 id="stack-size-after-push-is-one">Stack size after push is one</h3>


Let me write another test which checks if the size of the stack is 1 or not after one push.  



```python
class TestStack(unittest.TestCase):
    # ...

    def test_size_after_push_is_one(self):
        stack = Stack()
        stack.push(0)
        self.assertEqual(stack.size(), 1)
```

[test-one-push-stack.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-test-one-push-stack-py)

  

Let’s make the test pass by simply incrementing the value of `_size` in `.push()` method and return that variable in `.size()` method.  



```python
class Stack(object):
    _size = 0

    def size(self):
        return self._size

    def push(self, element=None):
        self._size += 1
```

[one-push-stack.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-one-push-stack-py)

  

Take a moment and notice that I replaced a constant value with a more generic variable. Also, I need to **refactor** the code now as I’ve duplicated code in both the tests. I can do this by moving the stack initialisation part in `setUp` method of the class `TestStack`, this method is called before running every test in the class.  



```python
class TestStack(unittest.TestCase):
    def setUp(self):
        self.stack = Stack()

    def test_new_stack_should_be_empty(self):
        self.assertEqual(self.stack.size(), 0)

    def test_size_after_push_is_one(self):
        self.stack.push(0)
        self.assertEqual(self.stack.size(), 1)
```

[refactor-duplicate-code.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-refactor-duplicate-code-py)

  


<h3 id="stack-size-is-zero-after-a-push-and-a-pop">Stack size is zero after a push and a pop</h3>


If I push an element and then pop it, the size should be zero after that.  



```python
class Stack(object):

    def size(self):
        return -1
```

[stack-size-fail.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-stack-size-fail-py)

  

Make this test pass by simply decrementing the value of `_size`.  



```python
class Stack(object):
    # ...

    def pop(self):
        self._size -= 1
        return -1
```

[push-pop-stack.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-push-pop-stack-py)

  


<h3 id="stack-raises-underflow-error">Stack raises underflow error</h3>


What if the stack is empty and I try to pop a non-existing element? Yes, it should raise an error.  



```python
class TestStack(unittest.TestCase):
    # ...

    def test_raises_underflow_error_if_empty(self):
        self.assertRaises(UnderFlowError, self.stack.pop)
```

[test-underflow-pop-stack.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-test-underflow-pop-stack-py)

  

I write the following production code to make this pass by checking for the size equal to zero.  



```python
class UnderFlowError(Exception):
    pass


class Stack(object):
    # ...

    def pop(self):
        if self._size == 0:
            raise UnderFlowError
        self._size -= 1
        return -1
```

[underflow-stack.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-underflow-stack-py)

  


<h3 id="stack-raises-overflow-error">Stack raises overflow error</h3>


Great going till now, but what if the stack has a specific capacity and I can’t exceed its maximum capacity? I write another test just to check that and it should raise `OverFlowError` if pushed on a full stack.  



```python
class TestStack(unittest.TestCase):
    def setUp(self):
        self.stack = Stack(2)

    # ...

    def test_raises_overflow_error_if_pushed_on_full_stack(self):
        with self.assertRaises(OverFlowError):
            for i in range(0, 4):
                self.stack.push(i)
```

[test-overflow-stack.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-test-overflow-stack-py)

  

Again, I’m introducing a variable `_capacity` in the constructor and I’ll check for it when I push on the stack.  



```python
class OverFlowError(Exception):
    pass


class Stack(object):
    _capacity = 10
    _size = 0

    def __init__(self, capacity=10):
        self._capacity = capacity

    # ...

    def push(self, element=None):
        if self._size == self._capacity:
            raise OverFlowError
        self._size += 1
```

[overflow-stack.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-overflow-stack-py)

  


<h3 id="pop-last-element-pushed-into-stack">Pop last element pushed into stack</h3>


Okay, till now every test is passing. But this stack is nowhere close to the actual definition of a stack. So, let me test if zero is popped when I had pushed it before.  



```python
class TestStack(unittest.TestCase):
    # ...

    def test_should_pop_zero_when_zero_is_pushed(self):
        self.stack.push(0)
        self.assertEqual(self.stack.pop(), 0)
```

[test-pop-zero-when-pushed-zero.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-test-pop-zero-when-pushed-zero-py)

  

This test will pass by simply returning 0\. Note the point 3 of TDD laws here.  



```python
class Stack(object):
    # ...

    def pop(self):
        if self._size == 0:
            raise UnderFlowError
        self._size -= 1
        return 0
```

[stack-pop-zero-when-pushed-zero.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-stack-pop-zero-when-pushed-zero-py)

  

But what if a more general number, say 1 is pushed? It should return it when popped. I’ll write a test just for that now.  



```python
class TestStack(unittest.TestCase):
    # ...

    def test_should_pop_one_when_one_is_pushed(self):
        self.stack.push(1)
        self.assertEqual(self.stack.pop(), 1)
```

[test-pop-one-when-pushed-one.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-test-pop-one-when-pushed-one-py)

  

I’ll create a private variable `_element` and update it in `.push()` method and return it when popped.  



```python
class Stack(object):
    _capacity = 10
    _element = None
    _size = 0

    # ...

    def push(self, element=None):
        if self._size == self._capacity:
            raise OverFlowError
        self._size += 1
        self._element = element

    def pop(self):
        if self._size == 0:
            raise UnderFlowError
        self._size -= 1
        return self._element
```

[stack-pop-one-when-pushed-one.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-stack-pop-one-when-pushed-one-py)

  


<h3 id="true-lifo-operation">True LIFO operation</h3>


Once again notice that I replaced the constant 0 with a more generic variable `_element`. But now, let’s make this Stack class really perform the Last-In-First-Out operations.  



```python
class TestStack(unittest.TestCase):
    # ...

    def test_pushed_elements_are_popped_in_reverse_order(self):
        self.stack.push(1)
        self.stack.push(2)
        self.assertEqual(self.stack.pop(), 2)
        self.assertEqual(self.stack.pop(), 1)
```

[test-lifo-operation.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-test-lifo-operation-py)

  

I will now modify the production code in the following way to make the test pass.  



```python
class Stack(object):
    _capacity = 10
    _elements = []
    _size = 0

    # ...

    def push(self, element=None):
        if self._size == self._capacity:
            raise OverFlowError
        self._elements.append(element)
        self._size += 1

    def pop(self):
        if self._size == 0:
            raise UnderFlowError
        self._size -= 1
        return self._elements.pop()
```

[lifo-stack.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-lifo-stack-py)

  

Did you notice what happened? I modified `_element` variable into a more general data type, an array. Now recall Specific/Generic cycle, as the unit tests become more specific, the production code gets more generic. I hope you understand now what was meant before. Also, the three laws were followed at every step of the cycles, recall that I returned a constant 0 to make the test `test_size_is_zero_ after_push_and_pop` pass. I didn’t generalise it by returning a variable right away. I just somehow made the test pass, that’s it. Finally, I can again **refactor** the code and since python provides some shortcuts with arrays, I can get rid of `_size` variable and all the unit tests still pass.  



```python
class Stack(object):
    _capacity = 10

    def __init__(self, capacity=10):
        self._elements = []
        self._capacity = capacity

    def size(self):
        return len(self._elements)

    def push(self, element=None):
        if self.size() == self._capacity:
            raise OverFlowError
        self._elements.append(element)

    def pop(self):
        if not self._elements:
            raise UnderFlowError
        return self._elements.pop()
```

[refactor-lifo-stack.py by ajatprabha](https://gist.github.com/ajatprabha/b2f80bc33796ed79fe7c79879d508b82/23288673bd35670f5269a082ca80fa3539f1d825#file-refactor-lifo-stack-py)

  

In other languages like C++, you’ll not get rid of `_size` and instead, can use it as an array index. In this way, even the initial code that I wrote is not a waste of time. I’m simply modifying the existing at every cycle and making sure the tests pass. None of the code that we write to pass the early tests is wasted code. It’s just incomplete and not generalised enough. After every cycle, the code evolves and becomes more general.


<h3 id="references">References:</h3>


1.  [The Clean Code Blog](http://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html)
2.  Book: [Clean Code](https://books.google.co.in/books?isbn=0132350882) by Robert C. Martin