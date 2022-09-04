import * as fs from 'fs';
import * as path from 'path';

export function buildFilepath(oldPath: path.ParsedPath, oldStat: fs.Stats, newName: string): string {
	const newPath = path.parse(newName);

	// Check ability to add original extension
	const needAddExtension = newName.endsWith('&&ext');

	// Clean the new name from special characters
	let newStripedName = newName.replace(/(!!|&&)ext$/, '');

	// The new path has no extension and we must save original extension
	if (oldStat.isFile() && newPath.ext === '' && needAddExtension) {
		newStripedName += oldPath.ext;
	}

	return path.join(oldPath.dir, newStripedName);
}
