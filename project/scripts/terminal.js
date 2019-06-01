const files = ["hello.txt", "bigFile.js", "password.css"];

class Repo {
    constructor() {
        this.branches = {
            "master": {
                commits: [],
                stagedFiles: [],
                untracked: files,
                changed: [],
            }
        };
        this.activeBranch = "master";
    }

    stageFile(file) {
        this.branches[this.activeBranch].stagedFiles.push(file);
        this.branches[this.activeBranch].untracked = this.branches[this.activeBranch].untracked.filter(x => x !== file);
        this.branches[this.activeBranch].changed = this.branches[this.activeBranch].changed.filter(x => x !== file);
    }

    createBranch(branchName) {
        if (Object.keys(this.branches).indexOf(branchName) !== -1) {
            throw new Error("Branch already exists");
        }

        const commits = this.commits.map(x => x);
        const stagedFiles = this.stagedFiles.map(x => x);
        const untracked = this.untracked.map(x => x);
        const changed = this.changed.map(x => x);

        this.branches[branchName] = { commits, stagedFiles, untracked, changed };
    }

    changeBranch(branchName) {
        if (Object.keys(this.branches).indexOf(branchName) === -1) {
            throw new Error("Branch does not exist");
        }

        this.activeBranch = branchName;
    }

    mergeBranch(branchName) {
        if (Object.keys(this.branches).indexOf(branchName) === -1) {
            throw new Error("Branch does not exist");
        }

        this.branches[this.activeBranch].commits = this.commits.concat(this.branches[branchName].commits.filter(x => this.commits.indexOf(x) === -1));
    }

    get commits() {
        return this.branches[this.activeBranch].commits;
    }

    get stagedFiles() {
        return this.branches[this.activeBranch].stagedFiles;
    }

    get untracked() {
        return this.branches[this.activeBranch].untracked;
    }

    get changed() {
        return this.branches[this.activeBranch].changed;
    }

    commit(message) {
        if (this.branches[this.activeBranch].stagedFiles.length === 0) throw new Error("No Staged Files");
        this.branches[this.activeBranch].commits.push({
            message, files: this.branches[this.activeBranch].stagedFiles
        });
        this.branches[this.activeBranch].stagedFiles = [];
    }

    get commitMessages() {
        return this.branches[this.activeBranch].commits.map(x => x.message);
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

function gitBranch(args, repo) {
    if (args.length === 0) {
        return Object.keys(repo.branches).map((x) => {
            if (x === repo.activeBranch) {
                return `<li class="active">${x}</li>`;
            }
            return `<li>${x}</li>`;
        }).reduce((p, c) => {
            return p.concat(c);
        }, `<div>Branches:</div><ul>`).concat("</ul>");
    }

    if (args.length === 1) {
        if (args[0].startsWith("-")) {
            if (args[0] === "-vv") {
                return Object.keys(repo.branches).map((x) => {
                    if (x === repo.activeBranch) {
                        return `<li class="active">${x} [origin/${x}]</li>`;
                    }
                    return `<li>${x} [origin/${x}]</li>`;
                }).reduce((p, c) => {
                    return p.concat(c);
                }, `<ul>`).concat("</ul>");
            }
        } else {
            repo.createBranch(args[0]);
            return `Created Branch To ${args[0]}`;
        }
    }

    throw new Error("Unsupported Arguments");
}

function gitCheckout(args, repo) {
    if (args.length === 1) {
        repo.changeBranch(args[0]);
        return `Switched to Branch ${args[0]}`;
    }

    if (args.length === 2 && args[0] === "-b") {
        repo.createBranch(args[1]);
        repo.changeBranch(args[1]);
        return `Created and switched to branch ${args[1]}`;
    }
}

function gitMerge(args, repo) {
    if (args.length === 1) {
        repo.mergeBranch(args[0]);
        return `Merged in branch ${args[0]}`;
    }

    throw new Error("Unsupported Arguments");
}

function findLookup(command, args, repo) {
    if (command !== "init" && !repo) {
        throw new Error("Uninitialized repository");
    }
    switch(command) {
        case "init": return gitInit(args, repo);
        case "add": return gitAdd(args, repo);
        case "status": return gitStatus(args, repo);
        case "commit": return gitCommit(args, repo);
        case "log": return gitLog(args, repo);
        case "branch": return gitBranch(args, repo);
        case "checkout": return gitCheckout(args, repo);
        case "merge": return gitMerge(args, repo);
    }
    throw new Error("Command Not Found");
}

function help(args) {
    return `Available commands:<ul><li>git - emulates basic git commands</li><li>ls - shows the current files in the directory</li></ul>`;
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
        case "help":
            return help(s.filter((x, i) => i >= 2));
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
    constructor(htmlNode, showTooltips) {
        this.htmlNode = htmlNode;

        this.history = document.createElement("div");
        this.history.className = "history";
        this.htmlNode.replaceChild(this.history, this.htmlNode.firstChild);

        this.input = new TerminalInput(this.htmlNode, this.handleInput.bind(this));

        if (showTooltips) {
            const outputTooltip = document.createElement("div");
            outputTooltip.className = "terminal-output-tooltip";
            outputTooltip.innerText = "The resulting command output will be shown here as well as the command that was run";
            this.htmlNode.appendChild(outputTooltip);

            const commandTooltip = document.createElement("div");
            commandTooltip.className = "terminal-command-tooltip";
            commandTooltip.innerText = "Input Git commands here and press enter to run the command";
            this.htmlNode.appendChild(commandTooltip);
        }

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
    },
    "branch": function (repo) {
        if (repo) {
            if (Object.keys(repo.branches).length >= 2) return true;
        }
        return false;
    }
}

const initers = {
    "branch": function () {
        const r = gitInit();
        r.stageFile("hello.txt");
        r.commit("Initial Commit");
        return r;
    }
}

function loadTerminals() {
    const tNodes = document.querySelectorAll(".terminal");
    tNodes.forEach((x, i) => {
        const checker = checkers[x.id];
        const t = new Terminal(x, i === 0);
        if (initers[x.id]) t.repo = initers[x.id]();
        if (checker) {
            t.checker = checker;
            window.registerField(t);
        }
    });
}

window.addEventListener("load", () => {
    loadTerminals();
});