"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const openai_1 = require("@azure/openai");
//
const SECRETS_STORE_KEY = "cc4173d51b0e44b0ab4ce28cb1a3d2d3";
const OPENAI_ENDPOINT1 = "https://openaiperiferiatest.openai.azure.com/";
const OPENAI_ENDPOINT = "https://openaiperiferiatest.openai.azure.com/openai/deployments/PeriferiAI/chat/completions?api-version=2023-03-15-preview&api-key=cc4173d51b0e44b0ab4ce28cb1a3d2d3";
const OPENAI_MODEL = "PeriferiAI";
//
class ChatMessage {
    role = "system";
    content = "You are a helpful assistant";
}
const decoder = new TextDecoder("utf-8");
let StrResp = '';
class ChatGPTRequest {
    user = "";
    model = OPENAI_MODEL;
    messages = [];
    temperature = 0.7;
}
//
async function activate(context) {
    let currentPanel = undefined;
    let chain;
    let disposable = vscode.commands.registerCommand('devopsexten.chat', async () => {
        //
        currentPanel = vscode.window.createWebviewPanel('devopsexten', 'Periferia-DevOps Chat', vscode.ViewColumn.Two, { enableScripts: true, retainContextWhenHidden: true });
        //
        currentPanel.webview.html = getWebviewContent(currentPanel.webview, context);
        //
        currentPanel.onDidDispose(() => { currentPanel = undefined; }, undefined, context.subscriptions);
        // ******************************************
        context.subscriptions.push(currentPanel.webview.onDidReceiveMessage(message => {
            async (progress) => {
                for (let i = 0; i < 10; ++i) {
                    debugger;
                    progress.report({ increment: 10 });
                }
            };
            const ss = QuestionOpenAI(message.text);
            return;
        }));
    });
    let Pasteresp = vscode.commands.registerCommand('devopsexten.pasteresp', async () => {
        vscode.window.showInformationMessage('123....!');
        vscode.commands.executeCommand("workbench.action.chat.open");
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage("Debe seleccionar el documento !");
        }
        ;
        if (editor) {
            const selection = editor.selection;
            const selText = editor.document.getText(selection);
            const answer = StrResp;
            const edit = new vscode.TextEdit(new vscode.Range(selection.start, selection.start), answer + "\n");
            const workspaceEdit = new vscode.WorkspaceEdit();
            workspaceEdit.set(editor.document.uri, [edit]);
            vscode.workspace.applyEdit(workspaceEdit);
        }
    });
    //
    async function QuestionOpenAI(question) {
        //
        const endpoint = process.env["ENDPOINT"] || "https://openaiperiferiatest.openai.azure.com/";
        const azureApiKey = process.env["AZURE_API_KEY"] || "cc4173d51b0e44b0ab4ce28cb1a3d2d3";
        const deploymentId = "HadaTech";
        //
        const client = new openai_1.OpenAIClient(endpoint, new openai_1.AzureKeyCredential(azureApiKey));
        //
        const events = await client.streamChatCompletions(deploymentId, [
            { role: "system", content: "Eres un chatbot amigable que brindas solo código en diferentes lenguaje de programación." },
            { role: "user", content: question },
        ], { maxTokens: 1550 });
        //
        let coll_mens = [];
        for await (const event of events) {
            for (const choice of event.choices) {
                StrResp += choice.delta?.content;
                coll_mens.push(choice.delta?.content);
            }
        }
        //
        StrResp = StrResp.replace(",", "").replace("undefined", "");
        //
        currentPanel.webview.postMessage({ text: StrResp });
    }
    context.subscriptions.push(Pasteresp);
    //context.subscriptions.push(disposable);
}
exports.activate = activate;
//
//
function getWebviewContent(webview, context) {
    const fileScript = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'source', 'actions.js'));
    const fileStyle = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'source', 'style.css'));
    return `<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<title>Periferia Chatbot</title>
		<link href="${fileStyle}" rel="stylesheet">
	</head>
	<body>
		<div id="chat-container"></div>
		<progress id="pro-bar" style="height:40px"></progress>
		<input id="chat-input" type="text" placeholder="En que podemos ayudarte..." onkeydown="if (event.keyCode == 13) document.getElementById('send-button').click()">
		<br><button id="send-button">Enviar</button>
		<script src="${fileScript}"></script>
		<p style="color:gray;font-family:Arial, sans-serif;font-size: 14px;"><b>Comandos:</b>
        <br><b>Ctrl + L</b> = Mover ultima respuesta.</br>
        <b>Ctrl + Shift + L</b> = Mover todas las respuestas.
		<script type="text/javascript">
			function onLoadFunctions() {
			const progbar = document.getElementById('pro-bar');
			progbar.style.display = 'none';   	
			}
			window.onload = onLoadFunctions;
		</script>
	</body>
	</html>`;
}
//
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map