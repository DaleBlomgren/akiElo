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
				var tempPerson = new Person(doc.playerTag, doc.playerName, doc.playerElo, doc.playerWins, doc.playerLosses);
				playerArray.push(tempPerson);
				//playerArray.push(doc.playerTag);				
				//eloArray.push(doc.playerElo);
			}
		}
	);

	client.close();
	});

	// Here we gotta calculate the leaderboard, then post the entire leaderboard
	
	res.render('akiElo', {
		title: 'Akihabara Third Strike Leaderbaord', firstPlayerTag: playerArray.playertag[0], firstPlayerName: playerArray.playername[0], firstPlayerElo: playerArray.elo[0], firstPlayerWins: playerArray.wins[0], firstPlayerLosses: playerArray.losses[0], 
		secondPlayerTag: playerArray.playertag[1], secondPlayerName: playerArray.playername[1], secondPlayerElo: playerArray.elo[1], secondPlayerWins: playerArray.wins[1], secondPlayerLosses: playerArray.losses[1],
		thirdPlayerTag: playerArray.playertag[2], thirdPlayerName: playerArray.playername[2], thirdPlayerElo: playerArray.elo[2], thirdPlayerWins: playerArray.wins[2], thirdPlayerLosses: playerArray.losses[2] 
	})
	//console.log(eloRating.calculate(eloArray[0], eloArray[2]));
});



var server = app.listen(6969, function() {});