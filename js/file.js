const fileKey = "ruby_editor_for_hp_text";

window.addEventListener("load", function() {
	let text = this.localStorage.getItem(fileKey);
	if (text) {
		textarea.value = text;
		preview.innerHTML = convertRuby(textarea.value);
	}
});

const autoSaveIntervalID = setInterval(() => {
	if (textarea.value) {
		this.localStorage.setItem(fileKey, textarea.value);
	}
	window.onbeforeunload = null;
	text_saved_state.textContent = "保存済み";
}, 10000);

