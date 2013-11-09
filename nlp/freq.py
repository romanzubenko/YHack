import nltk,pymongo, sys
from bson.objectid import ObjectId
import json
# getting ID of the post
ID = sys.argv[1]

client = pymongo.MongoClient("localhost", 27017)
db = client.yhack 
corpus = db.corpus #corpus 

corpusObj = corpus.find_one({"_id" : ObjectId(ID)})
data = corpusObj[u'text']

tokens = nltk.word_tokenize(data)

tokens = [token for token in tokens if token not in ['var',',','.','(',')',';',':','\'','\"','!','@','&','?','=','>',"<"] and ".com" not in token and "http" not in token and "www" not in token ]
text = nltk.Text(tokens)

bis = nltk.bigrams(tokens)
tris = nltk.trigrams(tokens)

freqs1 = nltk.FreqDist(tokens)

freqs2 = nltk.FreqDist(bis)
freqs3 = nltk.FreqDist(tris)

vocab1 = freqs1.keys()
vocab2 = freqs2.keys()
vocab3 = freqs3.keys()

# EXPORTING TO PYMONGO
numberD = 10 # number of top scorers to check
xxx = {
	"words" : vocab1[:5],
	"bigrams" : vocab2[:15],
	"trigrams" : vocab3[:20]
}

print(json.dumps(xxx))
