// Handle click event on "Read More" buttons
const readMoreButtons = document.querySelectorAll(".button");
readMoreButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    alert("This feature is not available yet.");
  });
});
