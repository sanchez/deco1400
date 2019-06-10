const scrollSize = 200;

let targetElement = null;
/**
 * Called every frame, if there is a target to scroll to, then scroll to the target. Once we are within the threshold, stop scrolling
 */
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

/**
 * Called once the page is loaded. Iterates through all links which reference local page locations and binds an overriding onclick method
 */
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