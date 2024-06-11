import * as vscode from 'vscode';
const { ChatVectorDBQAChain } = require("langchain/chains");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { OpenAI } = require("@langchain/openai");
const { OpenAIEmbeddings } = require ("@langchain/openai");
//
export async function activate(context: vscode.ExtensionContext) {

	//const ext = vscode.extensions.getExtension("publisher.extensionName");
	//const myExtensionContext = await ext.activate();
	const varext = context;

	let disposable = vscode.commands.registerCommand('devopsexten.chat', async () => {
		if (currentPanel) {
			currentPanel.reveal(vscode.ViewColumn.One);
			} 
		else 
			{
				currentPanel = vscode.window.createWebviewPanel(
				'devopsexten',
				'DevOps Chat',
				vscode.ViewColumn.Two,{	enableScripts: true	}
				);
			}
			currentPanel.webview.html = getWebviewContent(currentPanel.webview);
			// vscode.window.showInformationMessage('123....!');
			currentPanel.onDidDispose(
				() => {
					currentPanel = undefined;
				},
				undefined,
				context.subscriptions
			);
			//
			currentPanel.webview.onDidReceiveMessage(
				async message =>  {
					const question = message.text; // "What does this file do?";
					const res = await chain.call({ question: question, chat_history: [] });
					if (currentPanel) {
						currentPanel.webview.postMessage({ text: res["text"] });
					}
					return;
				},
				undefined,
				context.subscriptions
			);
		});

	const configuration = vscode.workspace.getConfiguration('');
	const API_KEY = configuration.get("devopsexten.OPENAI_KEY", "c4173d51b0e44b0ab4ce28cb1a3d2d3");
	if (API_KEY === "c4173d51b0e44b0ab4ce28cb1a3d2d3") {vscode.window.showErrorMessage("Please set OPENAI_KEY in the configuration"); return; }
	//
	const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
	const model = new OpenAI({ openAIApiKey: API_KEY, temperature: 0.9 });
	const embedder = new OpenAIEmbeddings({ openAIApiKey: API_KEY});

	let currentPanel: vscode.WebviewPanel | undefined = undefined;
	let chain: any;

	const editor = vscode.window.activeTextEditor;
	if (editor) {
		let document = editor.document;
		const documentText = document.getText();
		const docs = textSplitter.createDocuments([documentText]);
		const vectorStore = await HNSWLib.fromDocuments(docs, embedder);
		chain = ChatVectorDBQAChain.fromLLM(model, vectorStore);
	}
	vscode.window.showInformationMessage('123....!');
	context.subscriptions.push(disposable);
	
}


function getWebviewContent(webview: vscode.Webview) {
	// 
	const vpath = "C:\\Users\\manuelrodriguez\\Documents\\9_OK_DEV\\devopsexten\\";
	//const scriptUri = webview.asWebviewUri(vscode.Uri.arguments(context.extensionUri, 'media', 'chat.js'));
	const styleMainUri = webview.asWebviewUri(vscode.Uri.arguments(vpath , 'media', 'style.css'));
	return `<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<title>VSCode Chat</title>
		<link href="https://www.w3schools.com/" rel="stylesheet">
	</head>
	<body>
		<div id="chat-container"></div>
		<input id="chat-input" type="text" placeholder="Type your message here..." onkeydown="if (event.keyCode == 13) document.getElementById('send-button').click()">
		<button id="send-button">Send</button>
		<script src="https://not-example.com/js/library.js"></script>
	</body>
	</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
