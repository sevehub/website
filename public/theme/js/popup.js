(function () {
  var thisScript = document.currentScript;
  var targetUrl = thisScript.getAttribute("data-url") || "#";
  var text = thisScript.getAttribute("data-text") || "Check this out";
  var cta = thisScript.getAttribute("data-cta") || "Visit";
  var dismissKey = "pw-dismissed:" + (thisScript.getAttribute("data-id") || "default");
  var delay = parseInt(thisScript.getAttribute("data-delay") || "600", 10);

  // Don't show again this session if dismissed
  if (sessionStorage.getItem(dismissKey)) return;

  function build() {
    var popup = document.createElement("div");
    popup.className = "pw-popup";
    popup.setAttribute("role", "dialog");

    var span = document.createElement("span");
    span.className = "pw-text";
    span.textContent = text;

    var link = document.createElement("a");
    link.className = "pw-cta";
    link.href = targetUrl;
    link.textContent = cta;
    link.target = thisScript.getAttribute("data-newtab") === "false" ? "_self" : "_blank";
    link.rel = "noopener";

    var close = document.createElement("button");
    close.className = "pw-close";
    close.setAttribute("aria-label", "Dismiss");
    close.innerHTML = "&times;";
    close.addEventListener("click", function (e) {
      e.stopPropagation();
      popup.classList.remove("pw-visible");
      popup.classList.add("pw-hide");
      sessionStorage.setItem(dismissKey, "1");
      setTimeout(function () {
        popup.remove();
      }, 400);
    });

    popup.appendChild(span);
    popup.appendChild(link);
    popup.appendChild(close);
    document.body.appendChild(popup);

    // Force reflow then show, so the fade-in transition runs
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        popup.classList.add("pw-visible");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(build, delay);
    });
  } else {
    setTimeout(build, delay);
  }
})();
