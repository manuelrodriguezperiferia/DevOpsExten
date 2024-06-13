"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.OpenAIHandler = exports.activate = void 0;
const vscode = require("vscode");
const { ChatVectorDBQAChain } = require("langchain/chains");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { OpenAIlan } = require("@langchain/openai");
const { OpenAIEmbeddings } = require("@langchain/openai");
//
const SECRETS_STORE_KEY = "openai-api-key";
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-3.5-turbo";
//
async function activate(context) {
    let currentPanel = undefined;
    let chain;
    let disposable = vscode.commands.registerCommand('devopsexten.chat', async () => {
        //let currentPanel: vscode.WebviewPanel | undefined = undefined;
        //let chain: any;
        currentPanel = vscode.window.createWebviewPanel('devopsexten', 'Periferia-DevOps Chat', vscode.ViewColumn.Two, { enableScripts: true });
        // ***********************
        currentPanel.webview.html = getWebviewContent(currentPanel.webview, context);
        // ************************+
        // borra contenido para nuevas conversaciones
        currentPanel.onDidDispose(() => { currentPanel = undefined; }, undefined, context.subscriptions);
        currentPanel.webview.onDidReceiveMessage(message => {
            const askQuest = new OpenAIHandler();
            const ss = askQuest.askQuestionAboutCode();
            currentPanel.webview.postMessage({ text: ss });
            // const question = message.text; 
            //const res = chain.call({ question: question, chat_history: [] });
            //currentPanel.webview.postMessage({text: res["text"]  });
            return;
        }, undefined, context.subscriptions);
    });
}
exports.activate = activate;
class OpenAIHandler {
    openai;
    if(question) {
        const system_prompt = 'Eres un ingeniero de sistema';
        const user_prompt = `{QUESTION}= ###${question}###\n {CODE}=###${this.getSelectedText()}###`;
        const xresponse = this.callOpenAI(user_prompt, system_prompt, 100);
        this.showOpenAIAnswer("response");
    }
    getSelectedText() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No file is currently open.');
            return undefined;
        }
        return editor.selection.isEmpty
            ? editor.document.getText()
            : editor.document.getText(editor.selection);
    }
    async askQuestionAboutCode() {
        const code = this.getSelectedText();
        if (!code) {
            vscode.window.showInformationMessage('Please select some code to ask about.');
            return;
        }
        const question = await vscode.window.showInputBox({
            prompt: "What would you like to ask about the selected code?"
        });
        if (question) {
            try {
                const system_prompt = 'Tu es un ingenieur informatique, l\'utilisateur te donne du CODE et une QUESTION. Ton but est de répondre au mieux à ça question en moins de 100 tokens. Pas de phrase inutile une explication profesionnel et concise.';
                const user_prompt = `{QUESTION}= ###${question}###\n {CODE}=###${code}###`;
                const response = await this.callOpenAI(user_prompt, system_prompt, 100);
                this.showOpenAIAnswer(response);
            }
            catch (error) {
                // this.outputChannel.appendLine(`Error when asking OpenAI: ${error}`);
                vscode.window.showErrorMessage('An error occurred while asking the question.');
            }
        }
    }
    async callOpenAI(user_prompt, system_prompt, max_tokens) {
        try {
            console.log('==> Call OpenAI');
            console.log(user_prompt);
            vscode.window.showInformationMessage('Squid is thinking ...');
            const stream = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: system_prompt },
                    { role: "user", content: `###${user_prompt}###` }
                ],
                temperature: 0,
                max_tokens: max_tokens,
                top_p: 1.0,
                frequency_penalty: 0.0,
                presence_penalty: 0.0,
                stop: ["###"]
            });
            const content = stream.choices[0]?.message?.content;
            return content !== null ? content : undefined;
        }
        catch (error) {
            // this.outputChannel.appendLine(`API Error: ${error}`);
            throw error;
        }
    }
    showOpenAIAnswer(explanation) {
        if (explanation) {
            //outputChannel.appendLine('🐙 Squid 🐙');
            //outputChannel.appendLine(explanation);
            //outputChannel.show(true);            
        }
        else {
            vscode.window.showInformationMessage('No explanation received from Squid.');
        }
    }
}
exports.OpenAIHandler = OpenAIHandler;
// vscode.Uri.arguments;
function getWebviewContent(webview, context) {
    const fileScript = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'chat.js'));
    const fileStyle = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'style.css'));
    return `<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<title>123VSCode Chat</title>
		<link href="${fileStyle}" rel="stylesheet">
	</head>
	<body>
		<div id="chat-container"></div>
		<input id="chat-input" type="text" placeholder="En que podemos ayudarte..." onkeydown="if (event.keyCode == 13) document.getElementById('send-button').click()">
		<button id="send-button">Enviar</button>
		<script src="${fileScript}"></script>
		<p style="color:gray;font-family:Arial, sans-serif;font-size: 14px;"><b>Comandos:</b>
        <br><b>Ctrl+F</b> = Mover ultima respuesta.</br>
        <b>Ctrl+G</b> = Mover todas las respuestas.
        <br><b>Ctrl+R</b> = Mover toda la conversacion.</br></p>
	</body>
	</html>`;
}
//
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map