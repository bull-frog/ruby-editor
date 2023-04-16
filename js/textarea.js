const notSavedMessage = function(e) {
	return true;
}

class TextAreaWatcher {
	
	// 日本語の編集が始まったタイミングかどうか？
	#beginningOfEdit = true;
	// かな入力がすでに終わったかどうか？（変換フェーズかどうか？）
	#isConversion = false;

	// 編集部分よりも前の共通部分の長さは？（日本語編集開始時に更新）
	#beforeTextLength = -1;
	// 編集部分よりも後の共通部分の長さは？（日本語編集開始時に更新）
	#afterTextLength = -1;

	// ひらがな入力が終わったときの変更部分は何か？
	#kanaText = "";

	// これらをデフォルト値に更新する
	#resetFlags() {
		this.#beginningOfEdit = false;
		this.#isConversion = false;
		this.#beforeTextLength = -1;
		this.#afterTextLength = -1;
		this.#kanaText = "";
	}

	// テキストフィールドにそれぞれのリスナーを設定する
	setListenersTo(textField) {
		textField.addEventListener("keydown", this.textarea_keydown.bind(this));
		textField.addEventListener("input", this.textarea_input.bind(this));
		textField.addEventListener("compositionstart", this.textarea_compositionstart.bind(this));
		textField.addEventListener("compositionend", this.textarea_compositionend.bind(this));
	}

	// テキストフィールドのkeydownイベントリスナー
	textarea_keydown(e) {
		if (e.code == "Space") {
			// 変換モードに入ったことを記録する
			this.#isConversion = true;
		}
	}

	// テキストフィールドのinputイベントリスナー
	textarea_input(e) {
		let textarea = e.target;
		switch (e.inputType) {
			case "insertText":
				// 英字入力
				// とりあえず何もしない
				this.#resetFlags();
				break;
			case "insertCompositionText":
				// 日本語入力
				if (this.#beginningOfEdit) {
					this.#beforeTextLength = textarea.selectionStart - 1;
					this.#afterTextLength = textarea.value.length - textarea.selectionStart;
					this.#beginningOfEdit = false;
				}
				if (!this.#isConversion) {
					this.#kanaText = e.data;
				}
				break;
			case "insertLineBreak":
				this.#resetFlags();
				break;
			case "deleteContentBackward":
				break;
			default:
				break;
		}

		preview.innerHTML = convertRuby(textarea.value);
		output.innerText = convertOutput(textarea.value);
		window.onbeforeunload = notSavedMessage;
		text_saved_state.textContent = "保存中...";

	}

	// テキストフィールドのcompositionstartイベントリスナー
	textarea_compositionstart(e) {
		this.#beginningOfEdit = true;
	}

	// テキストフィールドのcompositionendイベントリスナー
	async textarea_compositionend(e) {
		// 確定されたとき
		let kanjiText = e.data;
		let textConversion = new TextConversion();
		let options = textConversion.findOptions(this.#kanaText, kanjiText);

		// 簡単のため、候補が1個でもchooserに投げる
		let adoptedOption = await userChooseOption(options);
		
		let beforeText = textarea.value.substring(0, this.#beforeTextLength);
		let afterText = textarea.value.substring(textarea.value.length - this.#afterTextLength);
		textarea.value = beforeText + adoptedOption + afterText;
		let cursorLocation = textarea.value.length - this.#afterTextLength;
		textarea.setSelectionRange(cursorLocation, cursorLocation);
		this.#resetFlags();

		preview.innerHTML = convertRuby(textarea.value);
		output.innerText = convertOutput(textarea.value);
		window.onbeforeunload = notSavedMessage;
		text_saved_state.textContent = "保存中...";
	}

	
}