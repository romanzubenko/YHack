import nltk

with open ("corpus.txt", "r") as f:
    data = f.read().replace('\n', '')


tokens = nltk.word_tokenize(data)


tokens = [token for token in tokens if token not in ['var',',','.','(',')',';',';','\'','\"','!','@','&','?','=','>',"<"] and ".com" not in token and "http" not in token and "www" not in token ]
text = nltk.Text(tokens)

bis = nltk.bigrams(tokens)
tris = nltk.trigrams(tokens)


freqs1 = nltk.FreqDist(tokens)

freqs2 = nltk.FreqDist(bis)
freqs3 = nltk.FreqDist(tris)
#print(freqs)

vocab1 = freqs1.keys()
vocab2 = freqs2.keys()
vocab3 = freqs3.keys()


print(vocab1[:100])
print("\n\n\n")
print(vocab2[:100])
print("\n\n\n")
print(vocab3[:100])
print("\n\n\n")
print(text.generate())
print("\n\n\n")

#print(tokens.collocations())