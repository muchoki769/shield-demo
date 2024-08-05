// document.addEventListener("DOMContentLoaded", () => {
//   const dropdownContent = document.getElementById("dropdownContent");

//   //Automatic dropdown
//   dropdownContent.classList.remove("hidden");
//   dropdownContent.classList.add("block");
// });

//for medium to large screen
// Close dropdown when clicking outside

window.addEventListener("click", (e) => {
  const dashboardMenu = document.getElementById("dashboard-menu");
  const dashboardToggle = document.getElementById("dashboard-toggle");

  if (!dashboardMenu.contains(e.target) && e.target !== dashboardToggle) {
    dashboardMenu.classList.remove("translate-y-0");
    dashboardMenu.classList.add("hidden", "translate-y-4");
  }
});

// Toggle dashboard menu for small screens
const dashboardToggleMobile = document.getElementById(
  "dashboard-toggle-mobile"
);
const dashboardMenuMobile = document.getElementById("dashboard-menu-mobile");

dashboardToggleMobile.addEventListener("click", () => {
  dashboardMenuMobile.classList.toggle("hidden");
});

// Toggle main menu for medium screens and above
const menuToggle = document.getElementById("menu-toggle");
const Menu = document.getElementById("menu");

menuToggle.addEventListener("click", () => {
  Menu.classList.toggle("hidden");
});
