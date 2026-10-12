class TestStack(unittest.TestCase):
    # ...

    def test_raises_underflow_error_if_empty(self):
        self.assertRaises(UnderFlowError, self.stack.pop)
