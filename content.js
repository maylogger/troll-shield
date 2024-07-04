chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "summarize") {
    createFloatingDiv();
    summarizeContent();
  }
});

function createFloatingDiv() {
  const div = document.createElement("div");
  div.id = "summarizer-extension";
  div.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: 300px;
    max-height: 400px;
    overflow-y: auto;
    background-color: white;
    border: 1px solid black;
    padding: 10px;
    z-index: 10000;
  `;
  div.innerHTML = '<p>Loading...</p><button id="close-summarizer">X</button>';
  document.body.appendChild(div);

  document
    .getElementById("close-summarizer")
    .addEventListener("click", function () {
      document.body.removeChild(div);
    });
}

async function summarizeContent() {
  const article = new Readability(document.cloneNode(true)).parse();
  const content = article.textContent;

  const options = await chrome.storage.sync.get(["apiKey", "prompt", "model"]);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages: [
        { role: "system", content: options.prompt },
        { role: "user", content: content },
      ],
    }),
  });

  const result = await response.json();
  const summary = result.choices[0].message.content;

  document.getElementById("summarizer-extension").innerHTML = `
    <p>${summary}</p>
    <button id="close-summarizer">X</button>
  `;

  document
    .getElementById("close-summarizer")
    .addEventListener("click", function () {
      document.body.removeChild(
        document.getElementById("summarizer-extension")
      );
    });
}
