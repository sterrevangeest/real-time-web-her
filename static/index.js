console.log("start");

// form.submit(function(e) {
//   e.preventDefault();
// });

$(".vrienduitnodigen").submit(function(e) {
  console.log("vriend uitnodigen");
  e.preventDefault(); // prevents page reloading
  return false;
});

function submitForm(input) {
  var form = document.querySelector(".vrienduitnodigen");
  var input = form.querySelector("input");
  console.log("vriend uitnodigen");
  var http = new XMLHttpRequest();
  var email = input.value;
  console.log(email);
  http.open("POST", "/vrienduitnodigen/" + email, true);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  console.log(http);
  http.send();
}
