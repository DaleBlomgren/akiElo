function printNames(){
	var x = document.getElementById('winningPlayerTag');
	alert("Hello, winning player is " + x.value);
	console.log("losing player is " + document.getElementById('losingPlayerTag').value);
}

function reportScores(){
	//learn REST technologies
}

function testDaJSON(){
	var x = document.getElementById('winningPlayerTag');
	var xCharacter = document.getElementByID('winningPlayerCharacter');
	var y = document.getElementById('losingPlayerTag');
	var yCharacter = document.getElementById('losingPlayerCharacter');
	var package = {winningTag: x, winningCharacter: xCharacter, losingTag: y, losingCharacter: yCharacter};
	var cPackage = JSON.stringify(package);

	
}