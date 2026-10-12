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
