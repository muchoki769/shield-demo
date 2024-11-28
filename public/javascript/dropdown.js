document.addEventListener("DOMContentLoaded", () => {
  const dropdownContent = document.getElementById("dropdownContent");//The dropdown menu content
  const dropdownToggle = document.getElementById("dropdownToggle"); //The element to hover over eg a button

  // //Automatic dropdown
  // dropdownContent.classList.remove("hidden");
  // dropdownContent.classList.add("block");


  //show the dropdown when cursor is over the toggle element
//   dropdownToggle.addEventListener("mouseover", () => {
//     dropdownContent.classList.remove("hidden");
//     dropdownContent.classList.add("block");
//   });

//   //hide the dropdown when the cursor leaves the dropdown area
//   dropdownToggle.addEventListener("mouseleave", () => {
//    dropdownContent.classList.add("hidden");
//    dropdownContent.classList.remove("block");  
//   });

  
//  //ensure the dropdown also hides when the cursor leaves the dropdown content area itself
//  dropdownContent.addEventListener("mouseleave", () => {
//    dropdownContent.classList.add("hidden");
//    dropdownContent.classList.remove("block");
//  });

//  //prevent hiding dropdown when moving between toggle and content ares
//  dropdownContent.addEventListener("mouseover", () => {
//   dropdownContent.classList.remove("hidden");
//   dropdownContent.classList.add("block");
//  });
function showDropdown(){
  dropdownContent.classList.remove("hidden");
  dropdownContent.classList.add("block");
}

function hideDropdown(){
  dropdownContent.classList.add("hidden");
  dropdownContent.classList.remove("block");
}

dropdownToggle.addEventListener("mouseover", showDropdown);

dropdownContent.addEventListener("mouseover", showDropdown);

dropdownToggle.addEventListener("mouseleave", () =>{
  setTimeout(() =>{
    if (!dropdownContent.matches(":hover")) hideDropdown();
  }, 200);
});
dropdownContent.addEventListener("mouseleave", hideDropdown);
});

//for mobile screen
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
