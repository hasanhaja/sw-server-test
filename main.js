const App = {
  sw: null,
  async init() {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      App.sw = registration.installing || registration.waiting || registration.active;  

      console.log("Service worker registered");
      // if (App.sw) {
      //   // logState(serviceWorker.state);
      //   serviceWorker.addEventListener("statechange", (e) => {
      //     // logState(e.target.state);
      //   });
      // }
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("New service worker activated");
      });
    } else {
      console.error("Service workers are not supported");
    }
  },
};

document.addEventListener("DOMContentLoaded", async () => await App.init());

const jsonButton = document.getElementById("json-requester");
const jsonOutput = document.getElementById("json-result");

const htmlButton = document.getElementById("html-requester");
const htmlOutput = document.getElementById("html-result");

jsonButton.addEventListener("click", async () => {
  const res = await fetch("/kick");
  const data = await res.json();

  jsonOutput.textContent = data.message;
});

htmlButton.addEventListener("click", async () => {
  const res = await fetch("/content");
  const content = await res.text();

  htmlOutput.innerHTML = content;
});
