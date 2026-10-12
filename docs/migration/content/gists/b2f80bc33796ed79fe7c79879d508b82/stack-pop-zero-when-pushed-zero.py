class Stack(object):
    # ...

    def pop(self):
        if self._size == 0:
            raise UnderFlowError
        self._size -= 1
        return 0
