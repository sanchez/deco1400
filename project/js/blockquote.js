/**
 * Attachs a hover effect all all elements binded with
 * @param {HTMLDivElement} htmlNode The node to attach the hover effect to
 */
function attachHover(htmlNode) {
    const hoverNode = document.createElement("div");
    hoverNode.className = "hover";
    hoverNode.innerText = "This can be executed inside a terminal instance to achieve the desired results";
    htmlNode.appendChild(hoverNode);
}

// Runs when page is loaded
function loadQuotes() {
    const quotes = document.querySelectorAll("blockquote");
    quotes.forEach(attachHover);
}

window.addEventListener("load", loadQuotes);