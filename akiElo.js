var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var pug = require('pug');
var eloRating = require('elo-rating');
var app = express();
function Player(playertag, playername, elo, wins, losses){
	this.playertag = playertag;
	this.playername = playername;
	this.elo = elo;
	this.wins = wins;
	this.losses = losses;
	//add match and game wins and losses
};

var playerArray = [];


var url = 'mongodb://localhost';

app.set('view engine', 'pug');

var compiledTemplate = pug.compileFile('akiElo.pug');



app.route('/matchhistory').get(function(req, res)	{

});

app.route('/report').get(function(req, res)	{

});

app.get('/', function(req, res)	{
	MongoClient.connect(url, function(err, client)	{
		if (err) throw err;
		var db = client.db('SF3db');
		console.log("connected.");
	
	
		var cursor = db.collection('playerbase').find();

		cursor.forEach(function(doc)	{
			if(doc != null) {
				console.log(doc);
				var tempPerson = new Person(doc.playerTag, doc.playerName, )
				//playerArray.push(doc.playerTag);				
				//eloArray.push(doc.playerElo);
			}
		}
	);

	client.close();
	});
	
	res.render('akiElo', {
		title: 'Akihabara Third Strike Leaderbaord', firstPlayer: playerArray[0], firstElo: eloArray[0], secondPlayer: playerArray[1], secondElo: eloArray[1], thirdPlayer: playerArray[2], thirdElo: eloArray[2] 
	})
	//console.log(eloRating.calculate(eloArray[0], eloArray[2]));
});



var server = app.listen(6969, function() {});