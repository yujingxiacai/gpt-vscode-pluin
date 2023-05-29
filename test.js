function X(rawstr, insertionPoints, insertionStrings) {
	if (insertionPoints.length === 0) {
		return rawstr;
	}
	let insertIndex = insertionPoints[0];
	let insertStr = insertionStrings[0]; // 插入的字符串
	let firstPart = rawstr.slice(0, insertIndex);
	let secondPart = rawstr.slice(insertIndex);

	let newRawStr = firstPart + insertStr + secondPart;
	let offset = insertStr.length;
	let newInsertionPoints, newInsertionStrings;
	if (insertionPoints.length > 1) {
		newInsertionPoints = insertionPoints.slice(1).map((p) => p + offset);
		newInsertionStrings = insertionStrings.slice(1);
	} else {
		newInsertionPoints = [];
		newInsertionStrings = [];
	}
	return X(newRawStr, newInsertionPoints, newInsertionStrings); // Updated line
}

let rawstr = 'hello , are you ok';
let insertionPoints = [5, 7];
let result = X(rawstr, insertionPoints, ['🐰', '🐱']); // Removed unnecessary argument

console.log(result);
