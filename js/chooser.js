function userChooseOption(options) {

	// データがなければ空文字を返す
	if (!options) {
		console.error("options does not exist");
		return "";
	}

	// 一つならただ返す
	if (options.length == 1) {
		return options[0];
	}

	// 複数なら選択画面を用意する
	let chooser_background = document.createElement("div");
	chooser_background.id = "chooser-background";

	let chooser_container = document.createElement("div");
	chooser_container.id = "chooser-container";

	for (let option of options) {
		let div = document.createElement("div");
		div.option = option;
		div.innerHTML = convertRuby(option);
		chooser_container.appendChild(div);
	}

	chooser_background.appendChild(chooser_container);
	document.body.appendChild(chooser_background);

	return new Promise(resolve => {
		chooser_container.onclick = function(e) {
			document.body.removeChild(chooser_background);
			resolve(e.target.closest("div").option || options[0]);
		}
	})

}