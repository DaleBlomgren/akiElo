const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
	_id: mongoose.Types.ObjectId,
	playerTag: String,
	playerElo: Number,
	playerWins: Number,
	playerLosses: Number
});

module.exports = mongoose.model('Report', reportSchema);