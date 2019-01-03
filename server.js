const express = require('express');
const stemmer = require('porter-stemmer').stemmer
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const SearchEngine = require ('./SearchEngine');
const app = express();

function parseQuery(query) {

	const queryStemmed = [];
	for(var i = 0; i < query.length; i++) {
		queryStemmed.push(stemmer(query[i].toLowerCase().replace(/[^a-zA-Z0-9\s]/g,'')));
	}
	var tfQuery = searchEngine.getTFValues(queryStemmed);

	tfidfQuery = searchEngine.calculateTFIDF(tfQuery,idfArray);
	queryVector = searchEngine.calculateVector(tfidfQuery);

	return queryVector;
}
//Load documents and keywords
const documentsFile = fs.readFileSync('documents.txt', 'utf8');
console.log("Loaded documents...");
const keywordsFile = fs.readFileSync('keywords.txt', 'utf8');
console.log("Loaded keywords...");

const searchEngine = new SearchEngine(documentsFile, keywordsFile);

//calculate TF
const tfMatrix = searchEngine.getTFMatrix(); 

//calculate IDF
const idfArray = searchEngine.getIDFArray();

//calculate TFIDF
const tfidfMatrix = searchEngine.getTFIDFMatrix(tfMatrix, idfArray);

//calculate vectors
const documentVectors = searchEngine.getDocumentVectors(tfidfMatrix);

////////////////////////////////////////////////////////////////////
//SERVER CONFIGURATION
///////////////////////////////////////////////////////////////////

app.set('port', 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

//Handle requests
app.post('/query', function(req, res){
	//split query
	const queryVector = parseQuery(req.body.query.split(" "));

	const responseDocuments = [];
	const rawDocuments = searchEngine.getRawDocuments();
	for(var i = 0;i<documentVectors.length;i++) {
		documentLines = rawDocuments[i].split("\n");
		documentHeader = documentLines.shift();
		documentBody = documentLines.join(" ");
		similarity = searchEngine.calculateSimilarity(documentVectors[i],queryVector,tfidfMatrix[i],tfidfQuery);

		responseDocuments.push({title:documentHeader, description:documentBody, sim: similarity});
	}

	res.send(responseDocuments);
});

// Listen for requests
const server = app.listen(app.get('port'), function() {
  const port = server.address().port;
  console.log("Listening server on port " + port);
});