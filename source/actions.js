const chatContainer = document.getElementById('chat-container');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const progbar = document.getElementById('pro-bar');
const vscode = acquireVsCodeApi();

function onLoadFunctions() {
    progbar.style.display = 'none';
}

sendButton.addEventListener('click', () => {
    const message = chatInput.value;
    const messageNode = document.createElement('div');
    messageNode.textContent = message;
    messageNode.style.backgroundColor = '#e6f7ff';
    chatContainer.appendChild(messageNode);
    vscode.postMessage(
        {
        text: message
        });
    chatInput.value = '';
    progbar.style.display = 'block';   
});
// control de mensaje en el webview
window.addEventListener('message', event => {
    const message = event.data; 
    const messageNode = document.createElement('div');
    //
    messageNode.textContent = message.text;
    messageNode.style.backgroundColor = '#fffbe6';
    chatContainer.appendChild(messageNode);
    progbar.style.display = 'none';
});

