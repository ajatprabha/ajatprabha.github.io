import unittest
from stack import *


class TestStack(unittest.TestCase):

    def test_new_stack_should_be_empty(self):
        stack = Stack()
        self.assertEqual(stack.size(), 0)
