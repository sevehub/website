(function () {

  function buildFeedbackButton() {
  const btn = document.createElement("button");

  btn.id = "ink-feedback-fab";
  btn.title = "Leave feedback on GitHub";
  btn.textContent = "💬 Feedback";

  btn.addEventListener("click", () => {
    window.open("https://github.com/your/repo/issues", "_blank");
  });

  document.body.appendChild(btn);

  return btn;
}  
const REPO = 'sevehub/SeveTech-Feedback';
const btn = document.getElementById('ink-feedback-fab');
var delay = 0;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
        setTimeout(buildFeedbackButton, delay);
    });
} else {
    setTimeout(build, delay);
}

  btn.addEventListener('click', () => {
    const pageTitle = document.title || 'Feedback';
    const pageUrl = window.location.href;
 
    const title = `Feedback: ${pageTitle}`;
    const body = `**Page:** ${pageUrl}\n\n**Feedback:**\n\n`;
 
    const issueUrl =
      `https://github.com/${REPO}/issues/new` +
      `?title=${encodeURIComponent(title)}` +
      `&body=${encodeURIComponent(body)}`;
 
    window.open(issueUrl, '_blank', 'noopener');
  });
})();
