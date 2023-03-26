// 获取用户输入的API密钥和文本
function getResponse() {
    var apiKey = document.getElementById("api-key").value;
    var inputText = document.getElementById("input-text").value;
    // 调用OpenAI API
    $.ajax({
        type: "POST",
        url: "https://api.openai.com/v1/engines/davinci-codex/completions",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + apiKey,
        },
        data: JSON.stringify({
            "prompt": inputText,
            "max_tokens": 2048,
            "temperature": 0.5,
            "n": 1,
            "stop": "\n"
        }),
        success: function(response) {
            // 显示OpenAI API返回的结果
            document.getElementById("output-text").value = response.choices[0].text;
        },
        error: function(xhr, status, error) {
            // 显示错误信息
            document.getElementById("output-text").value = error;
        }
    });
}
