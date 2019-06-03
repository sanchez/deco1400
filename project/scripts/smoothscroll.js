const scrollSize = 200;

let targetElement = null;
function iteration() {
    if (targetElement) {
        const top = targetElement.getBoundingClientRect().top;
        if (top < scrollSize && top > -scrollSize) {
            return targetElement = null;
        }

        if (top < 0) {
            window.scrollBy(0, -scrollSize);
        } else {
            window.scrollBy(0, scrollSize);
        }
    }
}

function loadSmooth() {
    const links = document.querySelectorAll('[href^="#"]');
    for (let i = 0; i < links.length; i++) {
        const element = links[i];
        const location = element.getAttribute("href");
        element.onclick = (ev) => {
            ev.preventDefault();
            const dest = document.querySelector(location);
            if (dest) {
                targetElement = dest;
            }
        }
    }

    const downarrow = document.querySelector("#begin-scrolling");
    if (downarrow) {
        downarrow.onclick = () => {
            const dest = document.querySelector("#beginning");
            if (dest) targetElement = dest;
        }
    }

    setInterval(iteration, 16);
}

window.addEventListener("load", loadSmooth);