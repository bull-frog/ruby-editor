function convertRuby(inputText) {
	// [任意の文字列](任意の文字列)の最短一致
	const rubySearch = /\[.+?\]\(.+?\)/g;

	// 正規表現でSplitした配列（前後の空文字も含む）
	let baseTextArray = inputText.split(rubySearch, -1);
	// 正規表現にMatchした文字列
	let rubyTextArray = inputText.match(rubySearch);

	if (!rubyTextArray) {
		return inputText;
	}

	// 返す文字列
	let output = "";
	for (let i = 0; i <  rubyTextArray.length; i++) {
		let rubyText = rubyTextArray[i];
		let splitIndex = rubyText.indexOf("](");
		let ruby_kanji = rubyText.substring(1, splitIndex);
		let ruby_kana = rubyText.substring(splitIndex + 2, rubyText.length - 1);
		output += `${baseTextArray[i]}<span data-ruby="${ruby_kana}">${ruby_kanji}</span>`;
	}
	output += baseTextArray[baseTextArray.length - 1];

	output = output.replaceAll("\n", "<br>");

	return output;
}