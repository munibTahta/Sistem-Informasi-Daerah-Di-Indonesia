//TUGAS STKI
const stemmer = require('porter-stemmer').stemmer

class SearchEngine {
	constructor(documentsFile, keywordsFile) {
		this.rawDocuments = documentsFile.replace(/\r\n/g, "\n").split("\n\n");
		this.keywords = this.stemKeywords(keywordsFile);
		this.documents = this.stemDocuments(documentsFile);
	}
	
	stemKeywords(keywordsFile) {
		const keywords = keywordsFile.replace(/\r\n/g, "\n").split("\n");
		const keywordsStemmed = [];
		for (var i = 0; i < keywords.length; i++) {
		  keywordsStemmed.push(stemmer(keywords[i]));
		}
		return keywordsStemmed;
	}

	stemDocuments(documentsFile) {
		const documents = this.getRawDocuments();
		const documentsStemmed = [];
		for (var i = 0; i< documents.length ;i++) {
			const wordsStemmed = [];
			const words = documents[i].toLowerCase().replace(/[^a-zA-Z0-9\s]/g,' ');
			words.split(" ").forEach(function(word) {
				const newLineword = word.replace('\n',' ').split(' ');
				if(newLineword.length > 1 && newLineword[1].length > 0) {
					wordsStemmed.push(stemmer(newLineword[0]));
					wordsStemmed.push(stemmer(newLineword[1]));
				}
				else {
					wordsStemmed.push(stemmer(word));
				}
			});
			documentsStemmed.push(wordsStemmed);
		}
		return documentsStemmed;
	}
	//returns a list of unprocessed documents
	getRawDocuments() {
		return this.rawDocuments;
	}
	
	calculateTF(terms,keyword) {
		return terms.filter(t => t===keyword).length;
	}

	calculateIDF(documents, keyword) {
		var documentsWithKeyword = 0;
		documents.forEach(function(doc){
			var hasKeyword = false;
			for(var i = 0; i<doc.length; i++) {
				if(doc[i]===keyword) {
					hasKeyword = true;
				}
			}
			if(hasKeyword===true) {
				documentsWithKeyword++;
			}
		});
		if(documentsWithKeyword===0) {
			return 0;
		}
		return Math.log10(documents.length/documentsWithKeyword);
	}

	calculateTFIDF(tf,idf) {
		var terms = [];
		for(var i = 0;i<tf.length;i++) {
			terms.push(tf[i]*idf[i]);
		}
		return terms;
	}
	//Calculate a single document vector
	calculateVector(doc){
		var vectorLength = 0;
		for(var i = 0; i<doc.length; i++) {
			vectorLength+=doc[i]*doc[i];
		}
		return Math.sqrt(vectorLength);
	}
	//Calculate cosine similarity of two vectors
	calculateSimilarity(docVector, queryVector, doc, query) {
		var scalar = 0;
		for(var i = 0;i<doc.length;i++){
			scalar+=doc[i]*query[i];
		}
		if(queryVector==0||docVector==0){
			return 0;
		}
		return (scalar/(docVector*queryVector));
	}
	//Calculate TF values and normalize array
	getTFValues(terms) {
		var tf = []
		for(var i =0; i<this.keywords.length; i++) {
			tf.push(this.calculateTF(terms,this.keywords[i]));
		}
		//Normalize values
		const maxCount = Math.max.apply(null, tf);
		tf.map(val => (val/maxCount).toFixed(2));

		return tf;
	}
	//Return TF Matrix
	getTFMatrix(){
		var tfMatrix = []
		for (var i = 0; i<this.documents.length; i++) {
			var tf = this.getTFValues(this.documents[i]);
			tfMatrix.push(tf);
		}
		return tfMatrix;
	}
	//Return IDF Array
	getIDFArray(){
		var idfArray = [];
		for(var i = 0; i < this.keywords.length; i++) {
			idfArray.push(this.calculateIDF(this.documents,this.keywords[i]));
		}
		return idfArray;
	}
	//Return TF-IDF Matrix
	getTFIDFMatrix(tfMatrix, idfArray){
		var tfIdfMatrix = []
		for(var i = 0; i< tfMatrix.length; i++) {
			tfIdfMatrix.push(this.calculateTFIDF(tfMatrix[i],idfArray));
		}
		return tfIdfMatrix;
	}
	//Return array of calculated document vectors
	getDocumentVectors(tfidfMatrix){
		var documentVectors = [];
		for(var i = 0; i<tfidfMatrix.length; i++) {
			documentVectors.push(this.calculateVector(tfidfMatrix[i]));
		}
		return documentVectors;
	}
}
module.exports = SearchEngine