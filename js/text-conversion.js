class TextConversion {

	#text_before = "";
	#text_after = "";

	#text_before_split = new Array();
	#text_after_split = new Array();
	#readable_match = new Array();

	#hiragana = /[\u3040-\u309f]/;
	#katakana = /[\u30a0-\u30ff]/;
	#kanji = /[\u4E00-\u9FFF\u3005-\u3007]/;
	#suuji = /[\u0030-\u0039\uff10-\uff19]/;

	// 変換前と変換後のテキストを引数に取り、漢字とひらがなの対応を出力する
	findOptions(kanaText, kanjiText) {
		let results = [];
		// 漢字が含まれていない場合はここで終了
		if (!this.#kanjiIsIncludedIn(kanjiText)) {
			return results;
		}
		this.#text_before = kanaText;
		this.#text_after = kanjiText;
		this.#splitReadable(this.#text_before, this.#text_before_split);
		this.#splitReadable(this.#text_after, this.#text_after_split);
		let options = this.#matchReadable(0, 0);
		if (options.length == 0) {
			// 序数を変換してもう一度試す
			this.#text_after = this.#alterMeasureWords(this.#text_after, 1);
			this.#splitReadable(this.#text_after, this.#text_after_split);
			options = this.#matchReadable(0, 0);
			this.#text_after = this.#alterMeasureWords(this.#text_after, 2);
			this.#splitReadable(this.#text_after, this.#text_after_split);
			options = options.concat(this.#matchReadable(0, 0));
		}
		for (let option of options) {
			let result = "";
			let nextUnreadablePosition = 0;
			let nextReadableIndex = 0;
			for (let word of this.#text_after_split) {
				if (this.#readable(word.charAt(0))) {
					result += word;
					nextUnreadablePosition = option[nextReadableIndex] + word.length;
					nextReadableIndex++;
				} else {
					result += `[${word}](${this.#text_before.substring(nextUnreadablePosition, option[nextReadableIndex])})`;
				}
			}
			results.push(result);
		}
		// 全て漢字に変換され、検索に引っかかっていない場合はここで追加
		if (results.length == 0) {
			results.push(`[${kanjiText}](${kanaText})`);
		}
		return results;
	}

	// 機械的に読める（＝ひらがな・カタカナである）かどうか
	#readable(c) {
		if (!c) return;
		return (this.#hiragana.test(c) || this.#katakana.test(c));
	};

	// カタカナであればひらがなに変換、それ以外はそのまま返す
	#toHiragana(str) {
		if (!str) return;
		let result = "";
		for (let i = 0; i < str.length; i++) {
			let c = str.charAt(i);
			if (this.#katakana.test(c)) {
				result += String.fromCharCode(c.charCodeAt(0) - 0x60);
			} else {
				result += c;
			}
		}
		return result;
	};

	// 漢字が含まれているかどうか（振り仮名の必要性の有無）
	#kanjiIsIncludedIn(str) {
		if (!str) return false;
		for (let i = 0; i < str.length; i++) {
			if (this.#kanji.test(str.charAt(i))) return true;
		}
		return false;
	};

	// 文字列を検索し、その結果を配列にして返す（ダブりを許容する）
	#searchAll(toSearch, search) {
		let results = new Array();
		let start_position = 0;
		while (start_position < toSearch.length) {
			let r = toSearch.indexOf(search, start_position);
			if (r >= 0) {
				results.push(r);
				start_position = r + 1;
			} else {
				break;
			}
		}
		return results;
	};

	// 読めるか読めないかで配列にする
	#splitReadable(str, array) {
		array.length = 0;
		if (!str) return;
		array.push(str.charAt(0));
		let readableFlag = this.#readable(str.charAt(0));
		for (let i = 1; i < str.length; i++) {
			let c = str.charAt(i);
			let cIsReadable = this.#readable(c)
			if (cIsReadable == readableFlag) {
				array[array.length - 1] += c;
			} else {
				array.push(c);
			}
			readableFlag = cIsReadable;
		}
	};

	// 変換前と変換後で「読める」もの同士のマッチング（この段階では複数あり得る）を生成する（多重呼び出しを想定）
	#matchReadable(index, start_position) { // index: 配列text_after_splitのうち何番目のreadableを探索するか、start_position: text_beforeのうち何文字目以降を探索するか
		if (index >= this.#text_after_split.length || start_position >= this.#text_before.length) {
			console.error("Error: index out of range");
			return;
		}
		// indexが「読めないもの」で始まるときは、その次から検索をかける。
		if (!this.#readable(this.#text_after_split[index].charAt(0))) {
			index++;
		}
		
		let results = new Array();
		let search = this.#toHiragana(this.#text_after_split[index]);
		let toSearch = this.#text_before.substring(start_position);
		let search_result = this.#searchAll(toSearch, search);
		for (let position of search_result) {
			if (index >= this.#text_after_split.length - 2) {
				// 後ろに余りがある時は捨てる
				if (index == this.#text_after_split.length - 1 && position + search.length < toSearch.length) continue;
				results.push([position + start_position]);
			} else {
				// 残り字数が足りていないときは捨てる
				if (position + search.length > toSearch.length - (this.#text_after_split.length - index)) break;
				let child_result = this.#matchReadable(index + 2, start_position + position + search.length + 1);
				for (let child of child_result) {
					child.unshift(position + start_position);
					results.push(child);
				}
			}
		}
		return results;
	};

	// 二番目の引数が1のとき → 「ケ」「ヶ」「ヵ」などを「カ」に変換する。
	// 二番目の引数が2のとき → 「カ」を「ガ」に変換する。
	#alterMeasureWords(str, num) {
		if (!str || str.length < 3) return str;
		let result = str.charAt(0);

		if (num == 1) {
			for (let i = 1; i < str.length - 1; i++) {
				let c = str.charAt(i);
	
				if (/[ケヶヵ]/.test(c)) {
					let prev = str.charAt(i-1);
					if (this.#suuji.test(prev) || this.#kanji.test(prev)) {
						let flwg = str.charAt(i+1);
						if (this.#kanji.test(flwg)) {
							result += "カ";
							continue;
						}
					}
				}
				
				result += c;
			}
		} else if (num == 2) {
			for (let i = 1; i < str.length - 1; i++) {
				let c = str.charAt(i);
	
				if (/[カ]/.test(c)) {
					let prev = str.charAt(i-1);
					if (this.#suuji.test(prev) || this.#kanji.test(prev)) {
						let flwg = str.charAt(i+1);
						if (this.#kanji.test(flwg)) {
							result += "ガ";
							continue;
						}
					}
				}
				
				result += c;
			}
		}

		return result + str.charAt(str.length - 1);
	};

}