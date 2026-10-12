class Stack(object):
    _capacity = 10
    _elements = []
    _size = 0

    # ...

    def push(self, element=None):
        if self._size == self._capacity:
            raise OverFlowError
        self._elements.append(element)
        self._size += 1

    def pop(self):
        if self._size == 0:
            raise UnderFlowError
        self._size -= 1
        return self._elements.pop()
