class TestStack(unittest.TestCase):
    # ...

    def test_pushed_elements_are_popped_in_reverse_order(self):
        self.stack.push(1)
        self.stack.push(2)
        self.assertEqual(self.stack.pop(), 2)
        self.assertEqual(self.stack.pop(), 1)
