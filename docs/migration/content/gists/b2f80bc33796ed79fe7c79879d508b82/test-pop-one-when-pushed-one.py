class TestStack(unittest.TestCase):
    # ...

    def test_should_pop_one_when_one_is_pushed(self):
        self.stack.push(1)
        self.assertEqual(self.stack.pop(), 1)
