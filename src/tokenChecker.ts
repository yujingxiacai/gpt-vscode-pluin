// import {encode} from './gpt-3-encoder/Encoder';
import { encode } from 'gpt-3-encoder';
import * as vscode from 'vscode';
// measure how many tokens of input string
const tokensChecker =(str:string)=>{
    const encoded = encode(str);
    if (encoded.length>4096) {
        vscode.window.showInformationMessage('超过了4096个tokens','https://platform.openai.com/docs/models/gpt-3-5');
        return false;
    } else {
        return true;
    }
};

export default tokensChecker;
