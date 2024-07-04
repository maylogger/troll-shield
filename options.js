const defaultOptions = {
  apiKey: "",
  prompt: "Summarize the following webpage content:",
  model: "gpt-4",
};

function saveOptions() {
  const apiKey = document.getElementById("apiKey").value;
  const prompt = document.getElementById("prompt").value;
  const model = document.getElementById("model").value;

  chrome.storage.sync.set({ apiKey, prompt, model }, () => {
    // Update status to let user know options were saved.
    const status = document.createElement("div");
    status.textContent = "Options saved.";
    status.className = "mt-2 text-sm text-green-600";
    document.body.appendChild(status);
    setTimeout(() => {
      status.remove();
    }, 2000);
  });
}

function restoreOptions() {
  chrome.storage.sync.get(defaultOptions, (items) => {
    document.getElementById("apiKey").value = items.apiKey;
    document.getElementById("prompt").value = items.prompt;
    document.getElementById("model").value = items.model;
  });
}

function resetOptions() {
  chrome.storage.sync.set(defaultOptions, () => {
    restoreOptions();
    // Update status to let user know options were reset.
    const status = document.createElement("div");
    status.textContent = "Options reset to default.";
    status.className = "mt-2 text-sm text-blue-600";
    document.body.appendChild(status);
    setTimeout(() => {
      status.remove();
    }, 2000);
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("optionsForm").addEventListener("submit", (e) => {
  e.preventDefault();
  saveOptions();
});
document.getElementById("resetButton").addEventListener("click", resetOptions);
