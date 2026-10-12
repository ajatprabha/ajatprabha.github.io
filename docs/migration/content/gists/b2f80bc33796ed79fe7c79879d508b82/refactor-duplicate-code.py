class TestStack(unittest.TestCase):
    def setUp(self):
        self.stack = Stack()

    def test_new_stack_should_be_empty(self):
        self.assertEqual(self.stack.size(), 0)

    def test_size_after_push_is_one(self):
        self.stack.push(0)
        self.assertEqual(self.stack.size(), 1)
