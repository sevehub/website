
document.addEventListener("DOMContentLoaded", () => {

    // Inject CSS
    const style = document.createElement("style");
    style.textContent = `
#floatingClockBtn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 55px;
    height: 55px;
    background: #333;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    transition: transform 0.2s ease;
}
#floatingClockBtn:hover {
    transform: scale(1.1);
}

#miniPopup {
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 220px;
    height: 220px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 18px rgba(0,0,0,0.25);
    display: none;
    flex-direction: column;
    overflow: hidden;
    z-index: 9999;
}

#miniPopup iframe {
    width: 100%;
    height: 100%;
    border: none;
}

#closeMiniPopup {
    position: absolute;
    top: 4px;
    right: 6px;
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #444;
}
`;
    document.head.appendChild(style);

    // Floating button
    const btn = document.createElement("div");
    btn.id = "floatingClockBtn";
    btn.innerHTML = "🕒";
    document.body.appendChild(btn);

    // Mini popup
    const popup = document.createElement("div");
    popup.id = "miniPopup";
    popup.innerHTML = `
        <button id="closeMiniPopup">×</button>
        <iframe id="popupFrame"></iframe>
    `;
    document.body.appendChild(popup);

    // Open popup
    btn.onclick = () => {
        document.getElementById("popupFrame").src = window.FLOATING_POPUP_URL || "clock.html";
        popup.style.display = "flex";
    };

    // Close popup
    document.getElementById("closeMiniPopup").onclick = () => {
        popup.style.display = "none";
        document.getElementById("popupFrame").src = "";
    };
});
