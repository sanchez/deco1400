class MultiChoiceOption {
    constructor(text) {
        this.text = text;

        this.node = document.createElement("div");
        this.node.className = "option";
        this.node.innerHTML = this.text;
    }

    set active(val) {
        if (val) {
            this.node.className = "option selected";
        } else {
            this.node.className = "option";
        }
    }

    set onclick(val) {
        this.node.onclick = val;
    }

    get element() {
        return this.node;
    }
}

class MultiChoice {
    constructor(htmlNode) {
        this.options = [];

        const options = htmlNode.getElementsByTagName("li");
        for (let i = 0; i < options.length; i++) {
            const mOption = new MultiChoiceOption(options[i].innerHTML);
            mOption.onclick = () => {
                this.handleOptionSelected(i);
            }
            this.options.push(mOption);
        }

        this.element = document.createElement("div");
        this.element.className = "options";
        this.options.forEach(x => this.element.appendChild(x.element));
        htmlNode.parentNode.replaceChild(this.element, htmlNode);

        this.c = undefined;
    }

    handleOptionSelected(index) {
        this.selected = index;
        this.options.forEach((x, i) => {
            x.active = i === index;
        });
    }

    set checker(val) {
        this.c = val;
    }

    isCorrect() {
        if (this.c) return this.c(this);
        return false;
    }
}

const mCheckers = {
    "git": function (choice) {
        return choice.selected === 0;
    },
    "start": function (choice) {
        return choice.selected === 2;
    },
    "first": function (choice) {
        return choice.selected === 0;
    },
    "add": function (choice) {
        return choice.selected === 2;
    },
    "push": function (choice) {
        return choice.selected === 1;
    },
    "clone": function (choice) {
        return choice.selected === 0;
    },
};

function loadMultiChoice() {
    const mNodes = document.querySelectorAll(".multichoice");
    mNodes.forEach(x => {
        const checker = mCheckers[x.id];
        const m = new MultiChoice(x);
        if (checker) {
            m.checker = checker;
            window.registerField(m);
        }
    });
}

window.addEventListener("load", () => loadMultiChoice());