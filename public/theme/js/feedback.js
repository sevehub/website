
(function () {

  const REPO = 'sevehub/SeveTech-Feedback';
  const delay = 0;

  function buildFeedbackButton() {
    const btn = document.createElement("button");

    btn.id = "ink-feedback-fab";
    btn.title = "Leave feedback on GitHub";
    btn.textContent = "💬 Feedback";

    document.body.appendChild(btn);

    return btn;
  }

  function attachIssueHandler(btn) {
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
  }

  function init() {
    const btn = buildFeedbackButton();
    attachIssueHandler(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(init, delay);
    });
  } else {
    setTimeout(init, delay);
  }

})();
