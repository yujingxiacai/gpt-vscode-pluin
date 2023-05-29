import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// 获取代码中特别的注释（“// ~”打头的注释，一般用作wull copilot ai generator的标识）
const getFileSpecialComments = (fileContent: string) => {
	// 匹配所有以“// ~”打头的注释文本，并查询返回结果
	const commentsResults = [];
	const insertionPoints = [];
	const regex = /\/\/\s+~(.*)/g;
	let match;
	const matches = fileContent.matchAll(regex);
	let resultIndex = 0;
	let newLineIndex = 0;
	// rome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	while ((match = regex.exec(fileContent)) !== null) {
		const commentText = match[1].trim();
		newLineIndex = match.index + match[0].length;
		commentsResults.push(commentText);
		insertionPoints.push(newLineIndex);
		resultIndex++;
	}
	console.log(commentsResults, JSON.stringify(matches));
	return {
		comments: commentsResults,
		insertionPoints: insertionPoints,
	};
};

// 往文件中插入内容
const insertionFileContent = (
	insertionPoints: number[],
	rawFileContent: string,
	insertionContents: string[],
) => {
	let newFileContent = rawFileContent;
	insertionPoints.forEach((indexNum: number, index: number) => {
		newFileContent =
			newFileContent.slice(0, indexNum) +
			'\n' +
			insertionContents[index] +
			'\n' +
			newFileContent.slice(indexNum);
	});
	return newFileContent;
};

export default getFileSpecialComments;
export { insertionFileContent };
