import re

class MyTokenizer:
    def __init__(self, word2ind):
        self.word2ind = word2ind
        pass
    def tokenize(self, text):
        return [x.lower() for x in re.findall(r'\w+', text)]

    def encode(self, text):
        tokens = [self.word2ind.get(word, self.word2ind['<unk>']) for word in self.tokenize(text)]
        return tokens