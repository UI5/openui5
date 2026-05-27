setTimeout(function() {
	document.getElementById("stealFocus").focus();
	document.getElementById("status").textContent = "Focus stolen!";
	document.getElementById("status").style.background = "#ffb0b0";
}, 1000);

setInterval(function() {
	document.getElementById("stealFocus").focus();
	document.getElementById("status").textContent = "Focus stolen again at " + new Date().toLocaleTimeString();
}, 3000);