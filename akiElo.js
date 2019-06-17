var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var pug = require('pug');
var eloRating = require('elo-rating');
var app = express();
var mongoose = require('mongoose');

//var Report = require('../schemas');

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

mongoose.connect(url, {
	useMongoClient: true
});

app.set('view engine', 'pug');
app.use(express.json());
app.use('/scripts', express.static(__dirname + '/scripts'));

function updateLeaderboard(){
	playerArray = new Array();
	MongoClient.connect(url, function(err, client)	{
			if (err) throw err;
			var db = client.db('SF3db');
			//console.log("connected.");
	
	
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
}
updateLeaderboard();
setInterval(function(){ updateLeaderboard() }, 10000);

app.route('/matchhistory').get(function(req, res)	{

});

app.route('/report').get(function(req, res)	{
	playerArray.forEach(function(element){
		listOfPlayers.push(element.playertag);
	});

	//console.log(listOfPlayers);
	res.render('akiReport', {playerlist: listOfPlayers})  
});

app.get('/', function(req, res)	{
	console.log(req.body);

	//console.log(playerArray);

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
	
	res.render('akiElo', {
		firstPlayerTag: tags[0], firstPlayerName: names[0], firstPlayerElo: elos[0], firstPlayerWins: wins[0], firstPlayerLosses: losses[0], 
		secondPlayerTag: tags[1], secondPlayerName: names[1], secondPlayerElo: elos[1], secondPlayerWins: wins[1], secondPlayerLosses: losses[1],
		thirdPlayerTag: tags[2], thirdPlayerName: names[2], thirdPlayerElo: elos[2], thirdPlayerWins: wins[2], thirdPlayerLosses: losses[2] 
	})
	
});

app.post('/playerID', async function(req, res) {
	//var reportObj = JSON.parse(req.body);
	res.json(req.body);
	var matchJs = req.body;
	
	console.log(req.body.winningTag + " is the winner!");
	


		//console.log("matchJs.winningTag: " + matchJs.winningTag);
		//var wursor = db.collection('playerbase').find({"playerTag": matchJs.winningTag}); 
		//var locWinner = db.collection('playerbase').findOne({ "playerTag": matchJs.winningTag}, function(err, winner){});
	    playerTagSearch(matchJs.winningTag, matchJs.losingTag).then(result => {
		console.log("finished promise result: " + result);
		var calculatedElo = eloRating.calculate(result.winningDocument.playerElo, result.losingDocument.playerElo);

		MongoClient.connect(url, function(err, client)	{
			if (err) throw err;
			var db = client.db('SF3db');
			if (db) console.log('Connected.');

			db.collection('playerbase').update(
				{ playerTag: matchJs.winningTag},
				{ $set:
					{
						playerElo: calculatedElo.playerRating,
						playerWins: ++result.winningDocument.playerWins
					}
				}
			)

			db.collection('playerbase').update(
				{ playerTag: matchJs.losingTag},
				{ $set: 
					{
						playerElo: calculatedElo.opponentRating,
						playerLosses: ++result.losingDocument.playerLosses
					}
				} 
			)
			client.close();
		});
		/*
		//	console.log("winner.playerTag: " + winner.playerTag);
		//	wursor = winner;
		//});
		//var locWinner = wursor;
		var tempDocument = wursor.next();

		tempDocument.then(console.log("tempDocument:" + tempDocument));
		console.log('wursor: ' + wursor);
		console.log('locWinner: ' + locWinner);

		console.log("matchJs.losingTag: " + matchJs.losingTag);
		//var lursor; 
		var locLoser = db.collection('playerbase').findOne({"playerTag": matchJs.losingTag}, function(err, loser){});
		//	if (err) throw err;
		//	console.log("loser.playerTag: " + loser.playerTag);
		//	lursor = loser;

		//});
		//var locLoser = lursor;
		console.log('locLoser: ' + locLoser.playerTag);

		//var result = eloRating.calculate(locWinner.playerElo, locLoser.playerElo);

		db.collection('playerbase').update(
			{ playerTag: matchJs.winningTag},
				{ $set:
					{
						playerElo: result.playerRating,
						playerWins: ++locWinner.playerWins
					}
				}
		)

		db.collection('playerbase').update(
			{ playerTag: matchJs.losingTag},
				{ $set: 
					{
						playerElo: result.opponentRating,
						playerLosses: ++locLoser.playerLosses
					}
				} 
			)
		*/
		console.log("Updated.");

		//client.close();

	});


	//res.send(200);
});

app.route('/playerID/:id').get(function(req, res) {
	console.log(req.body);
	res.render('playerID', {output:req.params.id})

});

async function playerTagSearch(winningPlayerTag, losingPlayerTag){
	MongoClient.connect(url, async function(err, client)	{
		if (err) throw err;
		var db = client.db('SF3db');
		if (db) console.log('Connected.');

		console.log("in playerSearch()");
		let wursor = await db.collection('playerbase').find({"playerTag": winningPlayerTag});
		let lursor = await db.collection('playerbase').find({"playerTag": losingPlayerTag});

		

		wursor.forEach(function(doc){
			var tempWinner = {playerTag: doc.playerTag, playerName: doc.playerName, playerElo: doc.playerElo, playerWins: doc.playerWins, playerLosses: doc.playerLosses};
		}).then(function(){
		lursor.forEach(function(doc){
			var tempLoser = {playerTag: doc.playerTag, playerName: doc.playerName, playerElo: doc.playerElo, playerWins: doc.playerWins, playerLosses: doc.playerLosses};
		})}).then(function(){
		var packet = {winningDocument: tempWinner, losingDocument: tempLoser};
		console.log(packet);
		client.close();
		return packet;
		});

	});//.then(packet => {
	//	console.log("packet: " + packet);
		//var packet = {winningDocument: wursor, losingDocument: losingPlayerTag};
		//return packet; 
	//});

	
};

var server = app.listen(6969, function() {});

