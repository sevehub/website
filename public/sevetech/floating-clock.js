
const style = document.createElement("style");
style.textContent = `
#floatingClockBtn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background: #333;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    transition: transform 0.2s ease, background 0.2s ease;
}
#floatingClockBtn:hover {
    transform: scale(1.1);
    background: #444;
}
#popupOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}
#popupBox {
    background: white;
    width: 80%;
    height: 80%;
    border-radius: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
}
#popupFrame {
    flex: 1;
    width: 100%;
    border: none;
}
#closePopup {
    margin-top: 10px;
    padding: 10px;
    background: #333;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}
`;
document.head.appendChild(style);


// --- Floating Clock Button ---
document.addEventListener("DOMContentLoaded", () => {

    // Inject floating button
    const btn = document.createElement("div");
    btn.id = "floatingClockBtn";
    btn.innerHTML = "🕒";
    document.body.appendChild(btn);

    // Inject popup overlay
    const overlay = document.createElement("div");
    overlay.id = "popupOverlay";
    overlay.innerHTML = `
        <div id="popupBox">
            <iframe id="popupFrame" src="" frameborder="0"></iframe>
            <button id="closePopup">Close</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Load your HTML file when clicked
    btn.onclick = () => {
        document.getElementById("popupFrame").src = window.FLOATING_POPUP_URL || "clock.html";
        overlay.style.display = "flex";
    };

    // Close popup
    document.getElementById("closePopup").onclick = () => {
        overlay.style.display = "none";
        document.getElementById("popupFrame").src = "";
    };
});
