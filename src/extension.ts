// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { codeCommentTask } from './gptService';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "ai-code-helper-wull" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let updateKey = vscode.commands.registerCommand('update-key',()=>{
		vscode.window.showInputBox({
			prompt: '请输入您的 openai key：',
			placeHolder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
		}).then((key) => {
			// 判断输入是否为空
			if (!key) {
				// 显示错误提示
				// vscode.window.showErrorMessage('必须输入 openai key！');
					// 递归调用 showInputBox，保证 input 一直存在
				// return vscode.commands.executeCommand('update-key');
				vscode.window.showInformationMessage('Nothing changed!');
				return; 
			}

			// 将输入的 eKey 存储到全局状态中
			context.globalState.update('wullCopliotKey', key);

			// 弹出欢迎消息
			vscode.window.showInformationMessage('Update Key Success! —— The faster Wull‘s rocket🚀');
		});
	});
	
	let disposable = vscode.commands.registerCommand('WullCopliot.init', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const wullCopliotKey = context.globalState.get<string>('wullCopliotKey');
		if (wullCopliotKey) {
			vscode.window.showInformationMessage('Hello! Welcome WullCopliot —— The faster Wull‘s rocket🚀 ');
		} else {
			vscode.window.showInputBox({
				prompt: '请输入您的 openai key：',
				placeHolder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
			}).then((key) => {
				// 判断输入是否为空
				if (!key) {
				// 显示错误提示
				vscode.window.showErrorMessage('必须输入 openai key！');
					// 递归调用 showInputBox，保证 input 一直存在
					return vscode.commands.executeCommand('WullCopliot.init');
				}

				// 将输入的 eKey 存储到全局状态中
				context.globalState.update('wullCopliotKey', key);

				// 弹出欢迎消息
				vscode.window.showInformationMessage('Hello! Welcome WullCopliot —— The faster Wull‘s rocket🚀');
			});
		}
	});

	
	// context.subscriptions.push(disposable);
	// 注册aiComment命令   
 	let disposableComment = vscode.commands.registerCommand('ai-comment', async() => {
			// 获取当前选中的文件
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No active editor found');
				return;
			}

			// 获取选中文件的路径
			const filePath = editor.document.uri.fsPath;
			const wullCopliotKey = context.globalState.get<string>('wullCopliotKey') as string;
			if (!wullCopliotKey) {
				vscode.window.showInputBox({
					prompt: '请输入您的 openai key：',
					placeHolder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
				}).then((key) => {
					// 判断输入是否为空
					if (!key) {
					// 显示错误提示
					vscode.window.showErrorMessage('必须输入 openai key！');
						// 递归调用 showInputBox，保证 input 一直存在
						return vscode.commands.executeCommand('WullCopliot.init');
					}

					// 将输入的 eKey 存储到全局状态中
					context.globalState.update('wullCopliotKey', key);
					
					// ai comment task process
					vscode.window.withProgress({
						location: vscode.ProgressLocation.Notification,
						title: 'AI Code Commenting...',
						cancellable: true
					},async (progress) => {
						// 可以增加进度模拟
						// progress.report({
						// 	message:'代码分析中... 10%'
						// });
		
						// 向服务端传输文件并接收结果
						const x = await codeCommentTask(filePath,key||'');
		
						// 显示结果
						vscode.window.showInformationMessage('AI Comment Success! 🎉');
					});
				});
			} else {
				//  ai comment task process
				vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: 'AI Code Commenting...',
					cancellable: true
				},async (progress) => {
					// 可以增加进度模拟
					// progress.report({
					// 	message:'代码分析中... 10%'
					// });
	
					// 向服务端传输文件并接收结果
					await codeCommentTask(filePath,wullCopliotKey);
	
					// 显示结果
					vscode.window.showInformationMessage('AI Comment Success! 🎉');
				});
			}
	  });

	   // 注册命令 ai-code-generate
		let disposableCodeGenerate = vscode.commands.registerCommand('ai-code-generate', () => {
			// TODO: 实现 AI Code Generate 功能

			// 显示结果
			vscode.window.showInformationMessage('AI Code Generate result');
		});
	
	  // 添加右键菜单项
	  context.subscriptions.push(
			updateKey,
		disposable,
		// vscode.commands.registerCommand('extension.ai-comment', () => {
		//   vscode.window.showInformationMessage('Right-click menu');
		// }),
		disposableComment,
		disposableCodeGenerate
	  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
