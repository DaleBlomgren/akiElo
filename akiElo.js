var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var pug = require('pug');
var eloRating = require('elo-rating');
var app = express();
var player = new object (){

};

var playerArray[]

var url = 'mongodb://localhost';

app.set('view engine', 'pug');

var compiledTemplate = pug.compileFile('akiElo.pug');

MongoClient.connect(url, function(err, client)	{
	if (err) throw err;
	var db = client.db('SF3db');
	console.log("connected.");
	
	
	var cursor = db.collection('playerbase').find();

	cursor.forEach(function(doc)	{
		if(doc != null) {
			console.log(doc);
			
		}
	}
	);

	client.close();
});


app.get('/', function(req, res)	{
	res.render('akiElo', {
		title: 'akiElo', firstPlayer: playerArray[0], firstElo: eloArray[0], secondPlayer: playerArray[1], secondElo: eloArray[1], thirdPlayer: playerArray[2], thirdElo: eloArray[2] 
	})
	//console.log(eloRating.calculate(eloArray[0], eloArray[2]));
});

var server = app.listen(6969, function() {});