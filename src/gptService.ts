/* eslint-disable @typescript-eslint/naming-convention */
// /* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import tokensChecker from './tokenChecker';
import getFileSpecialComments, { insertionFileContent } from './reg_comment';
const chatCompletion = async (message: { role: string; content: string }[], key: string) => {
	// https://lm_experience.sensetime.com/nlp/v1/chat/completions
	// https://api.openai.com/v1/chat/completions
	// console.log('chatCompletion-key: ', key);
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			// key/`Bearer ${key}`
			Authorization: `Bearer ${key}`,
		},
		body: JSON.stringify({
			// sensechat-001/gpt-3.5-turbo-0301
			model: 'gpt-3.5-turbo-0301',
			messages: message,
		}),
	})
		.then((res) => {
			return res;
		})
		// rome-ignore lint/suspicious/noExplicitAny: <explanation>
		.catch((err: any) => {
			vscode.window.showInformationMessage(err);
			// console.log(err);
			return err;
		});
	return response.json();
};

// 代码注释任务
const codeCommentTask = async (filePath: string, key: string) => {
	const fileContent = fs.readFileSync(filePath, 'utf-8');
	const rawFileName = path.basename(filePath);
	const taskContent = `你好，麻烦给我将一下代码没有注释的部分加上注释，只要求对代码里面整个的函数注释，不需要每行都注释！直接给我添加注释后的代码即可！ 代码如下:\n${'```'}\n${fileContent}\n${'```'}`;
	if (tokensChecker(taskContent)) {
		// 异步处理AI代码注释功能
		const res = await chatCompletion(
			[
				{
					role: 'user',
					content: taskContent,
				},
			],
			key,
		).catch();

		const newFilePath = path.join(path.dirname(filePath), `reviewed_${rawFileName}`);
		// 写文件到当前同级目录中下
		fs.writeFileSync(newFilePath, res?.choices?.[0]?.message?.content);
	} else {
		vscode.window.showWarningMessage('文件文本过大，请精简描述！');
		return;
	}
};

// 代码生成任务
const codeGeneratorTask = async (filePath: string, key: string) => {
	const fileContent = fs.readFileSync(filePath, 'utf-8');
	const { comments, insertionPoints } = getFileSpecialComments(fileContent);
	const promiseArr = comments.map((comment) => {
		return chatCompletion(
			[
				{
					role: 'user',
					content: `Hello, please generate the corresponding code demo according to my description. There is no need to add any comments or specific code block marking symbols. My requirements are described as follows:${comment}`,
				},
			],
			key,
		).catch((err) => {
			vscode.window.showErrorMessage(err);
		});
	});

	let newFileContent = fileContent;
	const contentRes = await Promise.all(promiseArr)
		.then((res) => {
			return res;
		})
		.catch((err) => {
			vscode.window.showErrorMessage(err);
			return [];
		});
	// console.log('contentRes: ', JSON.stringify(contentRes));
	newFileContent = insertStrFoo(
		fileContent,
		insertionPoints,
		contentRes.map((item) => `\n${item?.choices?.[0]?.message?.content}\n`),
	);
	fs.writeFileSync(filePath, newFileContent);
	vscode.window.showInformationMessage('AI Comment Success! 🎉');
	// console.log(newFileContent);
};

// 字符串插入子串
const insertStrFoo = (
	rawstr: string,
	insertionPoints: number[] | [],
	insertionStrings: string[] | [],
): string => {
	if (insertionPoints.length === 0) {
		return rawstr;
	}
	const insertIndex = insertionPoints[0];
	const insertStr = insertionStrings[0]; // 插入的字符串
	const firstPart = rawstr.slice(0, insertIndex);
	const secondPart = rawstr.slice(insertIndex);

	const newRawStr = firstPart + insertStr + secondPart;
	const offset = insertStr.length;
	let newInsertionPoints: number[];
	let newInsertionStrings: string[];
	if (insertionPoints.length > 1) {
		newInsertionPoints = insertionPoints.slice(1).map((p: number) => p + offset);
		newInsertionStrings = insertionStrings.slice(1);
	} else {
		newInsertionPoints = [];
		newInsertionStrings = [];
	}
	return insertStrFoo(newRawStr, newInsertionPoints, newInsertionStrings); // Updated line
};
export { chatCompletion, codeCommentTask, codeGeneratorTask };
