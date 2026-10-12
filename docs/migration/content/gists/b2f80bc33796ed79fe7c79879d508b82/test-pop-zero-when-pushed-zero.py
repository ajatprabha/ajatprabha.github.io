class TestStack(unittest.TestCase):
    # ...

    def test_should_pop_zero_when_zero_is_pushed(self):
        self.stack.push(0)
        self.assertEqual(self.stack.pop(), 0)
