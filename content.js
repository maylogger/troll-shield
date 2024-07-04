(async () => {
  try {
    // 動態加載 readability.js
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('Readability.js');
    script.onload = async () => {
      // 確保 Readability 已經定義
      if (typeof Readability === 'undefined') {
        console.error('Readability is not defined after loading script.');
        return;
      }

      // 解析網頁內容
      const documentClone = document.cloneNode(true);
      const article = new Readability(documentClone).parse();

      if (!article) {
        console.error('Failed to parse the article.');
        return;
      }

      // 從 Chrome storage 獲取設定
      chrome.storage.sync.get(['apiKey', 'customPrompt', 'model'], async (result) => {
        if (!result.apiKey || !result.customPrompt || !result.model) {
          console.error('Please configure the extension first.');
          return;
        }

        const apiKey = result.apiKey;
        const prompt = `${result.customPrompt}\n\n${article.content}`;
        const model = result.model;

        // 發送請求到 OpenAI API
        const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }]
          })
        });

        const data = await apiResponse.json();
        console.log(data);

        // 顯示回應結果
        const fixedDiv = document.createElement('div');
        fixedDiv.style.position = 'fixed';
        fixedDiv.style.top = '10px';
        fixedDiv.style.right = '10px';
        fixedDiv.style.backgroundColor = 'white';
        fixedDiv.style.padding = '10px';
        fixedDiv.style.border = '1px solid black';
        fixedDiv.style.zIndex = 1000;
        fixedDiv.innerHTML = `
          <div>${data.choices[0].message.content}</div>
          <div style="text-align: right; cursor: pointer; color: red;" id="closeDiv">Close</div>
        `;

        document.body.appendChild(fixedDiv);

        document.getElementById('closeDiv').addEventListener('click', () => {
          fixedDiv.remove();
        });
      });
    };
    document.head.appendChild(script);
  } catch (error) {
    console.error('Error loading readability.js:', error);
  }
})();
