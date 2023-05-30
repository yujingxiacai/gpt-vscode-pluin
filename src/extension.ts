// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { codeCommentTask, codeGeneratorTask } from './gptService';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "ai-code-helper-wull" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const updateKey = vscode.commands.registerCommand('update-key', () => {
		vscode.window
			.showInputBox({
				prompt: '请输入您的 openai key：',
				placeHolder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
			})
			.then((key) => {
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
				context.globalState.update('wullCopilotKey', key);

				// 弹出欢迎消息
				vscode.window.showInformationMessage('Update Key Success! —— The faster Wull‘s rocket🚀');
			});
	});
	// ~帮忙写一个```scode.commands.registerCommand('update-prompt',()=>{ 需要你填充的业务代码 })```vscode插件功能，实现更新context.globalState中 prompt1和prompt2内容，要求交互是弹出两个selector让用户选择

	const updatePrompt = vscode.commands.registerCommand('update-prompt', async () => {
		const options1: vscode.QuickPickOptions = {
			canPickMany: false,
			placeHolder: '请选择第一个内容',
		};
		const items1: vscode.QuickPickItem[] = [
			{ label: '选项1', description: '描述1' },
			{ label: '选项2', description: '描述2' },
			{ label: '选项3', description: '描述3' },
		];
		const selection1 = await vscode.window.showQuickPick(items1, options1);
		if (!selection1) {
			return;
		}

		const options2: vscode.QuickPickOptions = {
			canPickMany: false,
			placeHolder: '请选择第二个内容',
		};
		const items2: vscode.QuickPickItem[] = [
			{ label: '选项A', description: '描述A' },
			{ label: '选项B', description: '描述B' },
			{ label: '选项C', description: '描述C' },
		];
		const selection2 = await vscode.window.showQuickPick(items2, options2);
		if (!selection2) {
			return;
		}

		await vscode.commands.executeCommand('setContext', 'prompt1', selection1.label);
		await vscode.commands.executeCommand('setContext', 'prompt2', selection2.label);
	});

	const disposable = vscode.commands.registerCommand('WullCopilot.init', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const wullCopilotKey = context.globalState.get<string>('wullCopilotKey');
		if (wullCopilotKey) {
			vscode.window.showInformationMessage(
				'Hello! Welcome WullCopilot —— The faster Wull‘s rocket🚀 ',
			);
		} else {
			vscode.window
				.showInputBox({
					prompt: '请输入您的 openai key：',
					placeHolder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
				})
				.then((key) => {
					// 判断输入是否为空
					if (!key) {
						// 显示错误提示
						vscode.window.showErrorMessage('必须输入 openai key！');
						// 递归调用 showInputBox，保证 input 一直存在
						return vscode.commands.executeCommand('WullCopilot.init');
					}

					// 将输入的 eKey 存储到全局状态中
					context.globalState.update('wullCopilotKey', key);

					// 弹出欢迎消息
					vscode.window.showInformationMessage(
						'Hello! Welcome WullCopilot —— The faster Wull‘s rocket🚀',
					);
				});
		}
	});
	// 注册aiComment命令
	const disposableComment = vscode.commands.registerCommand('ai-comment', async () => {
		// 获取当前选中的文件
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}

		// 获取选中文件的路径
		const filePath = editor.document.uri.fsPath;
		const wullCopilotKey = context.globalState.get<string>('wullCopilotKey') as string;
		if (!wullCopilotKey) {
			vscode.window
				.showInputBox({
					prompt: '请输入您的 openai key：',
					placeHolder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
				})
				.then((key) => {
					// 判断输入是否为空
					if (!key) {
						// 显示错误提示
						vscode.window.showErrorMessage('必须输入 openai key！');
						// 递归调用 showInputBox，保证 input 一直存在
						return vscode.commands.executeCommand('WullCopilot.init');
					}

					// 将输入的 eKey 存储到全局状态中
					context.globalState.update('wullCopilotKey', key);

					// ai comment task process
					vscode.window.withProgress(
						{
							location: vscode.ProgressLocation.Notification,
							title: 'AI Code Commenting...',
							cancellable: true,
						},
						async (progress) => {
							// 可以增加进度模拟
							// progress.report({
							// 	message:'代码分析中... 10%'
							// });

							// 向服务端传输文件并接收结果
							const x = await codeCommentTask(filePath, key || '');

							// 显示结果
							vscode.window.showInformationMessage('AI Comment Success! 🎉');
						},
					);
				});
		} else {
			//  ai comment task process
			vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: 'AI Code Commenting...',
					cancellable: true,
				},
				async (progress) => {
					// 可以增加进度模拟
					// progress.report({
					// 	message:'代码分析中... 10%'
					// });

					// 向服务端传输文件并接收结果
					await codeCommentTask(filePath, wullCopilotKey);

					// 显示结果
					vscode.window.showInformationMessage('AI Comment Success! 🎉');
				},
			);
		}
	});

	// 注册命令 ai-code-generate
	const disposableCodeGenerate = vscode.commands.registerCommand('ai-code-generate', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}

		// 获取选中文件的路径
		const filePath = editor.document.uri.fsPath;
		const wullCopilotKey = context.globalState.get<string>('wullCopilotKey') as string;
		// check whether exsited token
		if (!wullCopilotKey) {
			vscode.window
				.showInputBox({
					prompt: '请输入您的 openai key：',
					placeHolder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
				})
				.then((key) => {
					// 判断输入是否为空
					if (!key) {
						// 显示错误提示
						vscode.window.showErrorMessage('必须输入 openai key！');
						// 递归调用 showInputBox，保证 input 一直存在
						return vscode.commands.executeCommand('WullCopilot.init');
					}

					// 将输入的 eKey 存储到全局状态中
					context.globalState.update('wullCopilotKey', key);

					// ai comment task process
					vscode.window.withProgress(
						{
							location: vscode.ProgressLocation.Notification,
							title: 'AI Code Generating...',
							cancellable: true,
						},
						async (progress) => {
							// 可以增加进度模拟
							// progress.report({
							// 	message:'异步程序加载中... 10%'
							// });

							// 向服务端传输文件并接收结果
							const x = await codeGeneratorTask(filePath, key || '').catch((err) => {
								console.log(err);
							});

							// 显示结果
							// vscode.window.showInformationMessage('AI Generate Success! 🎉');
						},
					);
				});
		} else {
			//  ai generate task process
			vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: 'AI Code Generating...',
					cancellable: true,
				},
				async (progress) => {
					// 可以增加进度模拟
					// progress.report({
					// 	message:'异步程序加载中... 10%'
					// });

					// 向服务端传输文件并接收结果
					await codeGeneratorTask(filePath, wullCopilotKey).catch((err) => {
						console.log(err);
					});

					// 显示结果
				},
			);
		}
	});

	// 添加右键菜单项
	context.subscriptions.push(
		disposable, // welcome激活command
		updateKey,
		updatePrompt,
		disposableComment,
		disposableCodeGenerate,
		// vscode.commands.registerCommand('extension.ai-comment', () => {
		//   vscode.window.showInformationMessage('Right-click menu');
		// }),
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
