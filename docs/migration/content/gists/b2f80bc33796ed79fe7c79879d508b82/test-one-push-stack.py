class TestStack(unittest.TestCase):
    # ...

    def test_size_after_push_is_one(self):
        stack = Stack()
        stack.push(0)
        self.assertEqual(stack.size(), 1)
