class Stack(object):
    _capacity = 10

    def __init__(self, capacity=10):
        self._elements = []
        self._capacity = capacity

    def size(self):
        return len(self._elements)

    def push(self, element=None):
        if self.size() == self._capacity:
            raise OverFlowError
        self._elements.append(element)

    def pop(self):
        if not self._elements:
            raise UnderFlowError
        return self._elements.pop()
