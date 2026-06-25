//#region POST
const submit = document.getElementById("submit");

submit.addEventListener("click", async function (e) {
  const input = document.getElementById("inputMessage");
  const message = input.value.trim();
  const messageSent = (document.getElementById("msgSent").innerHTML =
    `<div class="msg sent">${message}</div>`);
  submit.disabeld = false;
  setTimeout(function () {
    submit.disabled = true;
  }, 5000);
  e.preventDefault();

  const responseAI = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await responseAI.json();
  document.getElementById("msgRecieved").innerHTML =
    `<div class="msg received">${data.response}<div>`;

  console.log(data);
});

// const result = await responseAI.json();

// // const data = await response.json();
// // console.log(data);

// console.log(result);

//#endregion POST

//#region GET

//endregion GET
