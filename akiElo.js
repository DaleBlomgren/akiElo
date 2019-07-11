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
app.use(express.json());
app.use('/scripts', express.static(__dirname + '/scripts'));

function updateLeaderboard(){
	playerArray = new Array();
	MongoClient.connect(url, { useNewUrlParser: true}, function(err, client)	{
			if (err) throw err;
			var db = client.db('SF3db');
			var cursor = db.collection('playerbase').find();

			cursor.forEach(function(doc)	{
				if(doc != null) {
					var tempPerson = new Player(doc.playerTag, doc.playerName, doc.playerElo, doc.playerWins, doc.playerLosses);
					playerArray.push(tempPerson);
				}
			}
		);

		client.close();
	});
}
updateLeaderboard();
setInterval(function(){ updateLeaderboard() }, 5000);

//Sort playerArray

function compare(a, b) {
	
	if (a.elo < b.elo){
		return 1;
	} else if (a.elo > b.elo){
		return -1;
	}
	return 0;
}

//playerArray.sort(compare);

app.route('/matchhistory').get(function(req, res)	{

});

app.route('/report').get(function(req, res)	{
	listOfPlayers = new Array();
	playerArray.forEach(function(element){
		listOfPlayers.push(element.playertag);
	});

	//console.log(listOfPlayers);
	res.render('akiReport', { playerlist: listOfPlayers})  
});

app.get('/', function(req, res)	{
	playerArray.sort(compare);
	
	var tags = [];
	var names = [];
	var elos = [];
	var wins = [];
	var losses = [];

	/*playerArray.forEach(function(element) {
		tags.push(element.playertag);
		//console.log("tags pushed: " + element.playertag);
		names.push(element.playername);
		elos.push(element.elo);
		wins.push(element.wins);
		wins.push(element.losses);
	});*/
	
	res.render('akiElo', { playerlist: playerArray })//{
	//	firstPlayerTag: tags[0], firstPlayerName: names[0], firstPlayerElo: elos[0], firstPlayerWins: wins[0], firstPlayerLosses: losses[0], 
	//	secondPlayerTag: tags[1], secondPlayerName: names[1], secondPlayerElo: elos[1], secondPlayerWins: wins[1], secondPlayerLosses: losses[1],
	//	thirdPlayerTag: tags[2], thirdPlayerName: names[2], thirdPlayerElo: elos[2], thirdPlayerWins: wins[2], thirdPlayerLosses: losses[2] 
	//})
	
});

app.post('/playerID', async function(req, res) {
	//var reportObj = JSON.parse(req.body);
	res.json(req.body);
	var matchJs = req.body;
	var calculatedElo;
	//console.log(req.body.winningTag + " is the winner!");
	//console.log("matchJs: " + Object.values(matchJs));


	playerTagSearch(matchJs.winningTag, matchJs.losingTag).then(function(packet){
		setTimeout(() => {
	 	//console.log("packet: " + Object.values(packet));
	 	calculatedElo = eloRating.calculate(packet.winningDocument.playerElo, packet.losingDocument.playerElo);
	 

		//console.log("calculatedElo: " + calculatedElo);
		//setTimeout(() => {
			MongoClient.connect(url, function(err, client)	{
				if (err) throw err;
				var db = client.db('SF3db');
				if (db) console.log('Connected.');

				db.collection('playerbase').update(
					{ playerTag: matchJs.winningTag},
					{ $set:
						{
							playerElo: calculatedElo.playerRating,
							playerWins: ++packet.winningDocument.playerWins
						}
					}
				)

				db.collection('playerbase').update(
					{ playerTag: matchJs.losingTag},
					{ $set: 
						{
							playerElo: calculatedElo.opponentRating,
							playerLosses: ++packet.losingDocument.playerLosses
						}
					} 
				)
				client.close();
			});	
	
			console.log("Updated.");

		//client.close();

		}, 1000);

});
	//res.send(200);
});

app.route('/playerID/:id').get(function(req, res) {
	console.log(req.body);
	res.render('playerID', {output:req.params.id})

});

function playerTagSearch(winningPlayerTag, losingPlayerTag){
var promise = new Promise(function(resolve, reject) {
	var packet, tempWinner, tempLoser;
	MongoClient.connect(url, { useNewUrlParser: true}, async function(err, client)	{
		if (err) throw err;
		var db = client.db('SF3db');
		if (db) console.log('Connected.');

		var wursorQuery = { playerTag: winningPlayerTag };
		var wursor = db.collection('playerbase').find(wursorQuery);
		var lursor = db.collection('playerbase').find({playerTag: losingPlayerTag});

		
		//	console.log("wursor: " + JSON.stringify(wursor, null, 4));
		//	console.log("lursor: " + JSON.stringify(lursor, null, 4));

			wursor.forEach(function(doc){
				if (doc != null){
				//	console.log("wursordoc: " + doc);
					tempWinner = {playerTag: doc.playerTag, playerName: doc.playerName, playerElo: doc.playerElo, playerWins: doc.playerWins, playerLosses: doc.playerLosses};
				}
				else console.log("wursor doc failure");
			})

			lursor.forEach(function(doc){
				if (doc != null) {
				//	console.log("lursordoc: " + doc);
					tempLoser = {playerTag: doc.playerTag, playerName: doc.playerName, playerElo: doc.playerElo, playerWins: doc.playerWins, playerLosses: doc.playerLosses};
				}
			})


			//console.log("packet: " + packet);
		
			client.close();
			setTimeout(() => {
			console.log("tempWinner: " + Object.values(tempWinner) + ", tempLoser: " + Object.values(tempLoser));
		
			packet = {winningDocument: tempWinner, losingDocument: tempLoser};

			resolve(packet);
	
			}, 200);
		
		

	});
});
	return promise;
};

var server = app.listen(6969, function() {});

