// Detect if page is in iframe and apply appropriate styles
function applyFrameStyles() {
    const isInIframe = window !== window.parent;
    document.body.classList.toggle('in-iframe', isInIframe);
}

// Apply styles when page loads
window.addEventListener('load', applyFrameStyles);