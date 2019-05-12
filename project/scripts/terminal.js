const files = ["hello.txt", "bigFile.js", "password.css"];

class Repo {
    constructor() {
        this.commits = [];
        this.stagedFiles = [];
        this.untracked = files;
        this.changed = [];
    }

    stageFile(file) {
        this.stagedFiles.push(file);
        this.untracked = this.untracked.filter(x => x !== file);
        this.changed = this.changed.filter(x => x !== file);
    }

    commit(message) {
        if (this.stagedFiles.length === 0) throw new Error("No Staged Files");
        this.commits.push({
            message, files: this.stagedFiles
        });
        this.stagedFiles = [];
    }

    get commitMessages() {
        return this.commits.map(x => x.message);
    }
}

function gitInit(args, repo) {
    if (repo) throw new Error("Repository already exists");
    return new Repo();
}

function requireRepo(repo) {
    if (!repo) throw new Error("Repository is not initialized");
}

function gitAdd(args, repo) {
    requireRepo(repo);

    if (args.length === 0) {
        throw new Error("Arguments Required");
    }

    if (args.length === 1 && args[0] === "-A") {
        files.forEach(x => repo.stageFile(x));
    } else {
        for (f of args) {
            if (files.indexOf(f) === -1) throw new Error("File does not exist");
        }

        args.forEach(x => repo.stageFile(x));
    }

    return "Added files successfully";
}

function gitReset(args, repo) {
    requireRepo(repo);

    if (args.length !== 0) {
        throw new Error("Too Many Arguments");
    }

    repo.stagedFiles = [];
    return "Successfully reset";
}

function gitStatus(args, repo) {
    requireRepo(repo);

    if (args.length === 0) {
        const staged = repo.stagedFiles.reduce((p, c) => p.concat(`<li>${c}</li>`), "");
        const untracked = repo.untracked.reduce((p, c) => p.concat(`<li>${c}</li>`), "");
        const changed = repo.changed.reduce((p, c) => p.concat(`<li>${c}</li>`), "");
        return `<div>Staged:</div><ul>${staged}</ul><div>Untracked:</div><ul>${untracked}</ul><div>Changed:</div><ul>${changed}</ul>`;
    }
}

function gitCommit(args, repo) {
    requireRepo(repo);

    if (args.length <= 1) {
        throw new Error("Invalid Number of Arguments");
    }

    if (args[0] === "-m") {
        const rest = args.filter((x, i) => i > 0).join(" ");
        const s = rest.split("\"");
        if (s.length <= 2) throw new Error("Invalid Command Usage");
        const message = s[1];
        args = s.filter((x, i) => i > 2).join("\"").split(" ");

        repo.commit(message);

        return `Added commit: ${message}`
    }
}

function gitLog(args, repo) {
    const c = repo.commits.map(x => x.message).map(x => `<li>${x}</li>`);
    return `<div>History:</div><ul>${c.join("")}</ul>`;
}

function findLookup(command, arguments, repo) {
    switch(command) {
        case "init": return gitInit(arguments, repo);
        case "add": return gitAdd(arguments, repo);
        case "status": return gitStatus(arguments, repo);
        case "commit": return gitCommit(arguments, repo);
        case "log": return gitLog(arguments, repo);
    }
    throw new Error("Command Not Found");
}

function processCommand(command, repo) {
    const s = command.split(" ");
    if (s.length < 1) throw new Error("Invalid Command");
    switch (s[0]) {
        case "git":
        case "g":
            if (s.length < 2) throw new Error("Invalid Command");
            return findLookup(s[1], s.filter((x, i) => i >= 2), repo);
        case "ls":
            return files.join(", ");
    }
    throw new Error("Commant Not Found");
}

class TerminalInput {
    constructor(rootNode, onSubmit) {
        this.onSubmit = onSubmit;

        this.inputRow = document.createElement("form");
        this.inputRow.className = "input-row";
        this.inputRow.action = "/";
        this.inputRow.onsubmit = this.handleFormSubmit.bind(this);
        rootNode.appendChild(this.inputRow);

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.className = "input";
        this.inputRow.appendChild(this.input);
        
        this.submitButton = document.createElement("input");
        this.submitButton.type = "submit";
        this.submitButton.className = "button";
        this.submitButton.innerText = "Run";
        this.submitButton.onclick = this.handleFormSubmit.bind(this);
        this.inputRow.appendChild(this.submitButton);
    }

    handleFormSubmit(ev) {
        const v = this.input.value;
        ev.preventDefault();
        if(this.onSubmit(v)) this.input.value = "";
    }
}

class Terminal {
    constructor(htmlNode) {
        this.htmlNode = htmlNode;

        this.history = document.createElement("div");
        this.history.className = "history";
        this.htmlNode.replaceChild(this.history, this.htmlNode.firstChild);

        this.input = new TerminalInput(this.htmlNode, this.handleInput.bind(this));

        this.c = undefined;
    }

    generateHistoryLine(command) {
        const d = document.createElement("div");
        d.className = "command";
        d.innerText = command;
        this.history.appendChild(d);
    }

    generateResultLine(text) {
        const d = document.createElement("div");
        d.className = "result";
        d.innerHTML = text;
        this.history.appendChild(d);
    }

    generateErrorLine(text) {
        const d = document.createElement("div");
        d.className = "error";
        d.innerText = `Error: ${text}`;
        this.history.appendChild(d);
    }

    handleInput(input) {
        this.generateHistoryLine(input);

        try {
            let r = processCommand(input, this.repo);
            if (r instanceof Repo) {
                this.repo = r;
                r = "Repository successfully created";
            }
            this.generateResultLine(r);
        } catch (error) {
            console.warn(error);
            this.generateErrorLine(error.message);
            return false;
        }

        return true;
    }

    set checker(val) {
        this.c = val;
    }

    isCorrect() {
        if (this.c) return this.c(this.repo);
        return false;
    }
}

const checkers = {
    "commit": function (repo) {
        if (repo) {
            if (repo.commits.length >= 1) return true;
        }
        return false;
    }
}

function loadTerminals() {
    const tNodes = document.querySelectorAll(".terminal");
    tNodes.forEach(x => {
        const checker = checkers[x.id];
        const t = new Terminal(x);
        if (checker) {
            t.checker = checker;
            window.registerField(t);
        }
    });
}

window.addEventListener("load", () => {
    loadTerminals();
});