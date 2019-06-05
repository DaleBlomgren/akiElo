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

var playerArray = new Array();
var listOfPlayers = new Array();




var url = 'mongodb://localhost';

app.set('view engine', 'pug');

MongoClient.connect(url, function(err, client)	{
		if (err) throw err;
		var db = client.db('SF3db');
		console.log("connected.");
	
	
		var cursor = db.collection('playerbase').find();

		cursor.forEach(function(doc)	{
			if(doc != null) {
				//console.log(doc);
				var tempPerson = new Player(doc.playerTag, doc.playerName, doc.playerElo, doc.playerWins, doc.playerLosses);
				//console.log(doc.playerTag);
				playerArray.push(tempPerson);
				//console.log(tempPerson);
			}
		}
	);

	client.close();
});


app.route('/matchhistory').get(function(req, res)	{

});

app.route('/report').get(function(req, res)	{
	playerArray.forEach(function(element){
		listOfPlayers.push(element.playertag);
	});

	console.log(listOfPlayers);
	res.render('akiReport', {playerlist: listOfPlayers//, matchDBUpdate(winner, loser)
	})  
});

app.get('/', function(req, res)	{

	console.log(playerArray);

	//qhetto slang
	var tags = [];
	var names = [];
	var elos = [];
	var wins = [];
	var losses = [];

	playerArray.forEach(function(element) {
		tags.push(element.playertag);
		console.log("tags pushed: " + element.playertag);
		names.push(element.playername);
		elos.push(element.elo);
		wins.push(element.wins);
		wins.push(element.losses);
	});

	// Here we gotta calculate the leaderboard, then post the entire leaderboard
	//console.log(playerArray[0].playertag);
	res.render('akiElo', {
		firstPlayerTag: tags[0], firstPlayerName: names[0], firstPlayerElo: elos[0], firstPlayerWins: wins[0], firstPlayerLosses: losses[0], 
		secondPlayerTag: tags[1], secondPlayerName: names[1], secondPlayerElo: elos[1], secondPlayerWins: wins[1], secondPlayerLosses: losses[1],
		thirdPlayerTag: tags[2], thirdPlayerName: names[2], thirdPlayerElo: elos[2], thirdPlayerWins: wins[2], thirdPlayerLosses: losses[2] 
	})
	//console.log(eloRating.calculate(eloArray[0], eloArray[2]));
});



var server = app.listen(6969, function() {});

function matchDBUpdate(){

	console.log(document.getElementsByTagName('winningPlayerTag'));

/*	MongoClient.connect(url, function(err, client)	{
		if (err) throw err;
		var db = client.db('SF3db');
		if (db) console.log('Connected.');

		var cursor = db.collection('playerbase').find(winner);
		var locWinner = cursor;
		console.log('locWinner: ' + locWinner);

		cursor = db.collection('playerbase').find(loser);
		var locLoser = cursor;
		console.log('locLoser: ' + locLoser);

		var result = EloRating.calculate(locWinner.playerElo, locLoser.playerElo);

		db.collection('playerbase').update(
			{ playerTag: winner},
				{ $set:
					{
						playerElo: result.playerRating,
						playerWins: ++locWinner.playerWins
					}
				}
		)

		db.collection('playerbase').update(
			{ playerTag: loser},
				{ $set: 
					{
						playerElo: result.opponentRating,
						playerLosses: ++locLoser.playerLosses
					}
				} 
			)
		console.log("Updated.");

		client.close();

	});
*/
}