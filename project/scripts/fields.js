const fields = [];

window.registerField = function (field) {
    fields.push(field);
}

window.checkFields = function () {
    const failed = fields.filter(x => !x.isCorrect());
    if (failed.length >= 1) {
        console.log("Failed");
    } else {
        console.log("Success");
    }
}