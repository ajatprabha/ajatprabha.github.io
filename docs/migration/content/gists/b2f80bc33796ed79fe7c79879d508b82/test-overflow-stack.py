class TestStack(unittest.TestCase):
    def setUp(self):
        self.stack = Stack(2)

    # ...

    def test_raises_overflow_error_if_pushed_on_full_stack(self):
        with self.assertRaises(OverFlowError):
            for i in range(0, 4):
                self.stack.push(i)
