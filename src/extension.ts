import * as fs from 'fs-extra';
import * as path from 'path';

import * as vscode from 'vscode';

/**
 * Open file after decrypt/encrypt.
 */
 async function openFile(filepath: string): Promise<vscode.TextEditor> {
	const document = await (vscode.workspace.openTextDocument(filepath) as Promise<vscode.TextDocument>);

	return vscode.window.showTextDocument(document);
}

/**
 * Helmix decrypt action.
 */
 async function helmixDecrypt(uri: vscode.Uri): Promise<vscode.TextEditor | undefined> {
	const filePath = uri.fsPath;
	const command = `helm secrets decrypt -i ${filePath}`;
	const ext = ".dec";
	if(vscode.window.terminals.length === 0){
		const newTerminal = vscode.window.createTerminal(`helmix terminal`);
		newTerminal.show();
		newTerminal.sendText(command);
	}
	else{
		vscode.window.activeTerminal?.show();
		vscode.window.activeTerminal?.sendText(command);
	}

	return openFile(filePath + ext);
}

/**
 * Helmix encrypt action.
 */
 async function helmixEncrypt(uri: vscode.Uri): Promise<vscode.TextEditor | undefined> {
	const oldPath = uri.fsPath;
	const oldPathParsed = path.parse(oldPath);
	const oldName = oldPathParsed.name;
	const ext = ".dec";

	const hasDecExtension = oldPathParsed.ext.endsWith(ext);
	let newName = oldName.replace(ext, "");
	
	if (!hasDecExtension) {
		newName += oldPathParsed.ext;
	}

	const newPath = path.join(oldPathParsed.dir, newName);

	if(hasDecExtension){
		await fs.remove(newPath);
		await fs.rename(oldPath, newPath);
	}

	const command = `helm secrets encrypt -i ${newPath}`;
	if(vscode.window.terminals.length === 0){
		const newTerminal = vscode.window.createTerminal(`helmix terminal`);
		newTerminal.show();
		newTerminal.sendText(command);
	}
	else{
		vscode.window.activeTerminal?.show();
		vscode.window.activeTerminal?.sendText(command);
	}

	return openFile(newPath);
}

export function activate(context: vscode.ExtensionContext) {
	const decryptCommand = vscode.commands.registerCommand('helmix.decrypt', (uri: vscode.TextDocument | vscode.Uri) => {
		if (!uri || !(<vscode.Uri>uri).fsPath) {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				return;
			}

			return helmixDecrypt(<vscode.Uri>editor.document.uri);
		}

		return helmixDecrypt(<vscode.Uri>uri);
	});

	context.subscriptions.push(decryptCommand);

	const encryptCommand = vscode.commands.registerCommand('helmix.encrypt', (uri: vscode.TextDocument | vscode.Uri) => {
		if (!uri || !(<vscode.Uri>uri).fsPath) {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				return;
			}

			return helmixEncrypt(<vscode.Uri>editor.document.uri);
		}

		return helmixEncrypt(<vscode.Uri>uri);
	});

	context.subscriptions.push(encryptCommand);
}

export function deactivate() {}