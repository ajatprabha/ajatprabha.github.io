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
