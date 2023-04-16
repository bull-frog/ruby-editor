window.addEventListener("load", () => {

	let agent = window.navigator.userAgent.toLowerCase();

	if (agent.indexOf("chrome") == -1 && agent.indexOf("firefox") == -1) {
		alert("Chrome, Firefox以外ではうまく動かないかも...");
		location.href = "../how-to-use.html";
	}

});