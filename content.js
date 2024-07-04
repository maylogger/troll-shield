// Inject Readability.js
const script = document.createElement("script");
script.src = chrome.runtime.getURL("readability.js");
document.head.appendChild(script);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    summarizeWebpage();
  }
});

async function summarizeWebpage() {
  // Get webpage content using Readability
  const documentClone = document.cloneNode(true);
  const article = new Readability(documentClone).parse();
  const content = article.textContent;

  // Get saved options
  const options = await chrome.storage.sync.get(["apiKey", "prompt", "model"]);

  // Prepare the API request
  const apiKey = options.apiKey;
  const model = options.model || "gpt-4";
  const prompt = options.prompt || "Summarize the following webpage content:";
  const messages = [
    { role: "system", content: prompt },
    { role: "user", content: content },
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
      }),
    });

    const data = await response.json();
    const summary = data.choices[0].message.content;

    displaySummary(summary);
  } catch (error) {
    console.error("Error:", error);
    displaySummary("An error occurred while summarizing the webpage.");
  }
}

function displaySummary(summary) {
  const div = document.createElement("div");
  div.className =
    "fixed top-4 right-4 w-1/3 bg-white p-4 rounded shadow-lg z-50";
  div.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h2 class="text-lg font-bold">Summary</h2>
            <button id="closeSummary" class="text-gray-500 hover:text-gray-700">Close</button>
        </div>
        <p>${summary}</p>
    `;

  document.body.appendChild(div);

  document.getElementById("closeSummary").addEventListener("click", () => {
    div.remove();
  });
}
