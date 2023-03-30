/* eslint-disable @typescript-eslint/naming-convention */
// /* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import tokensChecker from './tokenChecker';
const chatCompletion = async(message:{role:string;content:string}[],key:string) =>{
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
          "model": 'gpt-3.5-turbo-0301', 
          "messages": message,
      }),
      
  }).catch((err:any)=>{
    vscode.window.showInformationMessage(err);
    console.log(err); return err;
  });
  return response.json();
};

// 代码注释任务
const codeCommentTask = async (filePath:string,key:string) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const rawFileName = path.basename(filePath);
  const taskContent = `你好，麻烦给我将一下代码没有注释的部分加上注释，只要求对代码里面整个的函数注释，不需要每行都注释！直接给我添加注释后的代码即可！ 代码如下:\n${fileContent}`;

  if (tokensChecker(taskContent)) {
      // 异步处理AI代码注释功能
      const res = await chatCompletion([{
        role: "user",
        content: taskContent
      }],key).catch();
      
      const newFilePath = path.join(path.dirname(filePath), 'reviewed_' + rawFileName);
      // 写文件到当前同级目录中下
      fs.writeFileSync(newFilePath,res?.choices?.[0]?.message?.content);
  } else {
    return;
  }
};

// 代码生成任务
const codeGeneratorTask = (filePath:string) => {
  // const fileContent = fs.readFileSync(filePath, 'utf-8');
  // const rawFileName = path.basename(filePath);
  // const taskContent = `你好，麻烦给我将一下代码没有注释的部分加上注释，只要求对代码里面整个的函数注释，不需要每行都注释！直接给我添加注释后的代码即可！ 代码如下:\n${fileContent}`;

  // if (tokensChecker(taskContent)) {
  //     // 异步处理AI代码注释功能
  //     const res = await chatCompletion([{
  //       role: "user",
  //       content: taskContent
  //     }]).catch();
      
  //     const newFilePath = path.join(path.dirname(filePath), 'reviewed_' + rawFileName);
  //     // 写文件到当前同级目录中下
  //     fs.writeFileSync(newFilePath,res?.choices?.[0]?.message?.content);
  // } else {
  //   return;
  // }
};
// codeCommentTask('/Users/shenyukang1/YuCore/learningProgram/ai-helper/src/gtp_task.ts');

export {
  chatCompletion,
  codeCommentTask,
  codeGeneratorTask
};
