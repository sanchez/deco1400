const fields = [];

/**
 * Registers a field with the global form list
 */
window.registerField = function (field) {
    fields.push(field);
}

/**
 * Runs through all the registered fields and checks if they are correct or not
 */
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

/**
 * Runs when the page has loaded, and bind the check results button to the function call
 */
const loadFields = () => {
    const buttons = document.querySelectorAll("#checkResults");
    buttons.forEach(x => {
        x.onclick = window.checkFields;
    });
}

window.addEventListener("load", loadFields);