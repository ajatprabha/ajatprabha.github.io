class Stack(object):
    _size = 0

    def size(self):
        return self._size

    def push(self, element=None):
        self._size += 1
