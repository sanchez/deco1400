const fields = [];

window.registerField = function (field) {
    fields.push(field);
}

window.checkFields = function () {
    const failed = fields.filter(x => !x.isCorrect());
    if (failed.length >= 1) {
        const failedText = `Failed ${failed.length} out of ${fields.length} Tests`;
        const results = document.querySelector("#results");
        if (results) {
            results.innerHTML = `<div class='failed'>${failedText}</div>`;
        }
    } else {
        const results = document.querySelector("#results");
        if (results) {
            results.innerHTML = "<div class='success'>Successfully passed all questions!</div>";
        }
    }
}

const loadFields = () => {
    const buttons = document.querySelectorAll("#checkResults");
    buttons.forEach(x => {
        x.onclick = window.checkFields;
    });
}

window.addEventListener("load", loadFields);