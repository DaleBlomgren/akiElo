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
/*
const useStyles = makeStyles({
	root: {
		width: '100%',
		marginTop: ThemeProvider.spacing(3),
		overflowX: 'auto',
		padding: ThemeProvider.spacing(3, 2), 
	},
	table: {
		minWidth: 650,
	},
});

export default function Leaderboard() {
	const classes = useStyles();
	playerArray.sort(compare);
	return(
		<div>
			<Paper className={classes.root}>
				<Table className={classes.table}>
					<TableHead>
						<TableRow>
							<TableCell>Player Tag</TableCell>
							<TableCell align="right">Player Name</TableCell>
							<TableCell align="right">Player Elo</TableCell>
							<TableCell align="right">Wins</TableCell>
							<TableCell align="right">Losses</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{playerArray.map(player => (
							<TableRow key={player.playertag}>
								<TableCell component="th" scope="row">
									{player.playerTag}
								</TableCell>
								<TableCell align="right">{player.playername}</TableCell>
								<TableCell align="right">{player.playerelo}</TableCell>
								<TableCell align="right">{player.wins}</TableCell>
								<TableCell align="right">{player.losses}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Paper>
		</div>
	)
}
*/
var playerArray = new Array();
var listOfPlayers = new Array();

var url = 'mongodb://localhost';

app.set('view engine', 'pug');
app.use(express.json());
app.use('/scripts', express.static(__dirname + '/scripts'));

function updateLeaderboard(){
	playerArray = new Array();
	MongoClient.connect(url, { useNewUrlParser: true}, function(err, client){
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
setInterval(function(){ updateLeaderboard() }, 10000);


//Sort playerArray

function compareElo(a, b) {
	
	if (a.elo < b.elo){
		return 1;
	} else if (a.elo > b.elo){
		return -1;
	}
	return 0;
}

function compareName(a, b) {

	if (a.playertag < b.playertag){
		return 1;
	}
	else if (a.playertag > b.playertag){
		return -1;
	}
	return 0;
}

app.route('/matchhistory').get(function(req, res)	{

});

app.route('/report').get(function(req, res)	{
	listOfPlayers = new Array();
	playerArray.forEach(function(element){
		listOfPlayers.push(element.playertag);
	});
	listOfPlayers.sort();
	//console.log(listOfPlayers);
	res.render('akiReport', { playerlist: listOfPlayers})  
});

app.get('/', function(req, res)	{
	playerArray.sort(compareElo);
	


	res.render('akiElo', { playerlist: playerArray })
	
});

app.post('/playerID', async function(req, res) {
	
	//res.json(req.body);
	var count;
	var matchJs = req.body;
	var calculatedElo;
	var matchArray;
	var matchCount = 0;
	var rejection = false;

	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();

	today = mm + '/' + dd + '/' + yyyy;
	

	playerTagSearch(matchJs.winningTag, matchJs.losingTag).then(function(packet){
		setTimeout(() => {
	 	//need to check if match has been played today and send a proper response code
	 	calculatedElo = eloRating.calculate(packet.winningDocument.playerElo, packet.losingDocument.playerElo);
	 

		MongoClient.connect(url, { useNewUrlParser: true}, function(err, client){
			if (err) throw err;
			var db = client.db('SF3db');
			//if (db) console.log('Connected.');

			//check if player has been selected twice

			//check if match has been played today and send a proper response code
			var historyCursor = db.collection('matchhistory').find();

		//	count = 0;
		/*	historyCursor.forEach(function(element){
				if (element.winner == matchJs.winningTag && element.loser == matchJs.losingTag && today == element.date){
					count++;
					if (count > 2){
						rejection = true;
						console.log('Rejected, match limit reached');
					}	
				}
			});
		*/
			if (rejection == false) {
				db.collection('playerbase').updateOne(
					{ playerTag: matchJs.winningTag},
					{ $set:
						{
						playerElo: calculatedElo.playerRating,
						playerWins: ++packet.winningDocument.playerWins
						}
					},
					function(err, res) { if (err) throw err; }
				)

				db.collection('playerbase').updateOne(
					{ playerTag: matchJs.losingTag},
					{ $set: 
						{
						playerElo: calculatedElo.opponentRating,
						playerLosses: ++packet.losingDocument.playerLosses
						}
					},
					function(err, res) { if (err) throw err; } 
				)

				var matchDocument = {
					winner: matchJs.winningTag,
					loser: matchJs.losingTag,
					winningcharacter: matchJs.winningCharacter,
					losingcharacter: matchJs.losingCharacter,
					date: today
				};

				db.collection('matchhistory').insertOne(matchDocument, function(err, res){
					if (err) throw err;
					console.log("Match Updated");
				});

				client.close();
				res.send("Match entry confirmed.")
			}
			else{
				res.send('Error: Match not added')
				client.close();
			}
		});	

		}, 1000);

	});
	
});

app.route('/playerID/:id').get(function(req, res) {
	res.render('playerID', {output:req.params.id})
});

function playerTagSearch(winningPlayerTag, losingPlayerTag){
var promise = new Promise(function(resolve, reject) {
	var packet, tempWinner, tempLoser;
	MongoClient.connect(url, { useNewUrlParser: true}, async function(err, client)	{
		if (err) throw err;
		var db = client.db('SF3db');

		var wursorQuery = { playerTag: winningPlayerTag };
		var wursor = db.collection('playerbase').find(wursorQuery);
		var lursor = db.collection('playerbase').find({playerTag: losingPlayerTag});


		wursor.forEach(function(doc){
			if (doc != null){
				tempWinner = {playerTag: doc.playerTag, playerName: doc.playerName, playerElo: doc.playerElo, playerWins: doc.playerWins, playerLosses: doc.playerLosses};
			}
			else console.log("wursor doc failure");
		})

		lursor.forEach(function(doc){
			if (doc != null) {
				tempLoser = {playerTag: doc.playerTag, playerName: doc.playerName, playerElo: doc.playerElo, playerWins: doc.playerWins, playerLosses: doc.playerLosses};
			}
			else console.log("lursor doc failure");
		})

		client.close();
		setTimeout(() => {
			//console.log("tempWinner: " + Object.values(tempWinner) + ", tempLoser: " + Object.values(tempLoser));
		
			packet = {winningDocument: tempWinner, losingDocument: tempLoser};

			resolve(packet);
	
		}, 200);

	});
});
	return promise;
};

var server = app.listen(80, function() {});

