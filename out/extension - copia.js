"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.OpenAIHandler = exports.activate = void 0;
const vscode = require("vscode");
const axios_1 = require("axios");
const { ChatVectorDBQAChain } = require("langchain/chains");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { OpenAI } = require("@langchain/openai");
const { OpenAIEmbeddings } = require("@langchain/openai");
//
const SECRETS_STORE_KEY = "cc4173d51b0e44b0ab4ce28cb1a3d2d3";
const OPENAI_ENDPOINT = "https://openaiperiferiatest.openai.azure.com/";
const OPENAI_ENDPOINT1 = "https://openaiperiferiatest.openai.azure.com/openai/deployments/PeriferiAI/chat/completions?api-version=2023-03-15-preview&api-key=cc4173d51b0e44b0ab4ce28cb1a3d2d3";
const OPENAI_MODEL = "PeriferiAI";
//
class ChatMessage {
    role = "system";
    content = "You are a helpful assistant";
}
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
        //let currentPanel: vscode.WebviewPanel | undefined = undefined;
        //let chain: any;
        currentPanel = vscode.window.createWebviewPanel('devopsexten', 'Periferia-DevOps Chat', vscode.ViewColumn.Two, { enableScripts: true });
        // ***********************
        currentPanel.webview.html = getWebviewContent(currentPanel.webview, context);
        // ************************+
        // borra contenido para nuevas conversaciones
        currentPanel.onDidDispose(() => { currentPanel = undefined; }, undefined, context.subscriptions);
        currentPanel.webview.onDidReceiveMessage(message => {
            /* este funciona !!!
            const askQuest = new OpenAIHandler();
            const ss = askQuest.askQuestionAboutCode();
            */
            /*
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            const selText1 = editor.document.getText(selection);
            const selText = "what time is it";
            
            req.messages.push({ role: "user", content: selText });
            // const answer = askGpt(context, req).then();
            
            const req = new ChatGPTRequest();
            const selText = "what time is it";
            req.messages.push({ role: "user", content: selText });
            const otrafuncion = async () => { console.log(await askGpt(context, req));};
            */
            const configuration = vscode.workspace.getConfiguration('');
            const API_KEY = configuration.get("devopsexten.OPENAI_KEY", "c4173d51b0e44b0ab4ce28cb1a3d2d3");
            const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
            const model = new OpenAI({ openAIApiKey: API_KEY, temperature: 0.9 });
            const embedder = new OpenAIEmbeddings({ openAIApiKey: API_KEY });
            const editor = vscode.window.activeTextEditor;
            let document = editor.document;
            const documentText = document.getText();
            const docs = textSplitter.createDocuments([documentText]);
            const vectorStore = HNSWLib.fromDocuments(docs, embedder);
            // chain = ChatVectorDBQAChain.fromLLM(model, vectorStore);
            const otrafuncion = async () => { console.log(await ChatVectorDBQAChain.fromLLM(model, vectorStore)); };
            currentPanel.webview.postMessage({ text: otrafuncion });
            // const question = message.text; 
            //const res = chain.call({ question: question, chat_history: [] });
            //currentPanel.webview.postMessage({text: res["text"]  });
            return;
        }, undefined, context.subscriptions);
    });
}
exports.activate = activate;
async function askGpt(context, req) {
    const apiKey = SECRETS_STORE_KEY;
    if (!apiKey) {
        vscode.window.showInformationMessage("API Key not found");
        return;
    }
    const response = await axios_1.default.post(OPENAI_ENDPOINT, req, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
    });
    // vscode.window.showErrorMessage( response.data.choices[0].message.content);
    return response.data.choices[0].message.content;
}
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
                vscode.window.showErrorMessage('1An error occurred while asking the question.');
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
//# sourceMappingURL=extension%20-%20copia.js.map