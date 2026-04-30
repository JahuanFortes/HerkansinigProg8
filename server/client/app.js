//#region POST
const message = "why do hamsters stuff food in their cheeks?";

const submit = document.getElementById("submit");

submit.addEventListener("click", async function (e) {
  submit.disabeld = true;
  setTimeout(function () {
    submit.disabeld = true;
  }, 5000);
});

const response = await fetch("/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message }),
});

const result = await response.text();
document.getElementById("msgRecieved").innerHTML = `<p>${result}</p>`;

const data = await response.json();
console.log(data);

//#endregion POST

//#region GET

//endregion GET
