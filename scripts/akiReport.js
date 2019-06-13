var url = "http://localhost:6969/playerID";

function printNames(){
	var x = document.getElementById('winningPlayerTag');
	alert("Hello, winning player is " + x.value);
	console.log("losing player is " + document.getElementById('losingPlayerTag').value);
}

function reportScores(){
	//learn REST technologies
}

function testDaJSON(){
	var xhr = new XMLHttpRequest();

	var x = document.getElementById('winningPlayerTag');
	var xCharacter = document.getElementById('winningPlayerCharacter');
	var y = document.getElementById('losingPlayerTag');
	var yCharacter = document.getElementById('losingPlayerCharacter');
	var package = {winningTag: x, winningCharacter: xCharacter, losingTag: y, losingCharacter: yCharacter};
	console.log(package);
	var cPackage = JSON.stringify(package);
	console.log("\n\ncPackage: " + cPackage);
	xhr.open('POST', url, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(cPackage);
	alert("sent(supposedly)");
}