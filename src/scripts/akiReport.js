var url = "http://akielo.ddns.net/playerID";

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
	var request = new XMLHttpRequest();

	var x = document.getElementById('winningPlayerTag');
	var xCharacter = document.getElementById('winningPlayerCharacter');
	var y = document.getElementById('losingPlayerTag');
	var yCharacter = document.getElementById('losingPlayerCharacter');
	var package = {winningTag: x.value, winningCharacter: xCharacter.value, losingTag: y.value, losingCharacter: yCharacter.value};
	console.log(package);
	var cPackage = JSON.stringify(package);

	xhr.onreadystatechange = function() {
		console.log("State change: " + xhr.readyState);
		if(xhr.readyState == 4){
				console.log(xhr.responseText);
				alert(xhr.responseText);
		}
	};

	xhr.open('POST', url, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	//xhr.setResponseHeader("Content-Type", "text/html");
	xhr.responseType = 'text';
	

	xhr.send(cPackage);

	
	/*
	request.responseType = 'text';
	request.open('GET', 'http://localhost:6969');
	request.onload = function() {
		console.log(request.response);
		console.log(request.response.byteLength);
	}
	request.send();
	*/
	

}