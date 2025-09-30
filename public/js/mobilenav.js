
document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".navbar .container");

  // Create menu toggle button
  const menuToggle = document.createElement("div");
  menuToggle.innerHTML = "&#9776;"; // 3 lines
  menuToggle.id = "menu-toggle";
  menuToggle.style.fontSize = "26px";
  menuToggle.style.cursor = "pointer";
  menuToggle.style.display = "none"; // hidden on desktop
  menuToggle.style.color = "blue";   // blue colour
  menuToggle.style.marginLeft = "auto"; // push to right side

  container.appendChild(menuToggle);

  const navLinks = document.querySelector(".nav-links");

  // Apply inline mobile styles with JS
  function applyMobileStyles() {
    if (window.innerWidth <= 768) {
      menuToggle.style.display = "block";

      navLinks.style.position = "fixed";
      navLinks.style.top = "0";
      navLinks.style.left = "-50%"; // hidden (off-screen left)
      navLinks.style.height = "100vh";
      navLinks.style.width = "50%"; // half screen width
      navLinks.style.background = "#111";
      navLinks.style.flexDirection = "column";
      navLinks.style.alignItems = "flex-start";
      navLinks.style.padding = "20px";
      navLinks.style.gap = "15px";
      navLinks.style.transition = "left 0.3s ease";
    } else {
      menuToggle.style.display = "none";
      navLinks.style = ""; // reset for desktop
    }
  }

  // Toggle menu on click
  menuToggle.addEventListener("click", function () {
    if (navLinks.style.left === "0px") {
      navLinks.style.left = "-50%"; // hide
    } else {
      navLinks.style.left = "0"; // show
    }
  });

  // Run on load + resize
  applyMobileStyles();
  window.addEventListener("resize", applyMobileStyles);
});
