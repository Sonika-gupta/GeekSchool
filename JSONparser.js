var fs = require('fs');

const spaceParser = input => {
	return input && input.replace(/^\s+|\s+$/, '');
}
const nullParser = input => {
	if(!input.startsWith('null')) return null;
	return [null, input.slice(4)];
}
const booleanParser = input => {
	if(input.startsWith('true')) return [true, input.slice(4)];
	if(input.startsWith('false')) return [false, input.slice(5)];
	return null;
}
const numberParser = input => {
	input = spaceParser(input);
	let matched = input.match(/^-?(0|[1-9]\d*)(?:\.\d+)?(?:(e|E)(-|\+)?\d+)?/);
	return matched && [Number(matched[0]), input.slice(matched[0].length)];
}
const stringParser = input => {
	let matched = input.match(/^"(?:[^\\"\n\t]|(?:\\(?<special>["\\\/bfnrt]|u[0-9A-Fa-f]{4})))*"/);
	if(matched) {
		var parsed = matched[0].slice(1, -1)
				.replace(/\\\"/g, '"')
				.replace(/\\\\/g, '\\')
				.replace(/\\n/g, '\n')
				.replace(/\\t/g, '\t')
				.replace(/\\b/g, '\b')
				.replace(/\\f/g, '\f')
				.replace(/\\r/g, '\r')
				.replace(/\\\//g, '\/')
				.replace(/\\u[\d\w]{4}/g, match => String.fromCharCode(parseInt(match.slice(2), 16)));
	}
	return matched && [parsed, input.slice(matched[0].length)];
}
function arrayParser (input) {
	if(input[0] != '[') return null;
	input = spaceParser(input.slice(1));
	let array = [], value, open = true;
	while(input && open && input[0] != ']') {
		value = JSONParser(input) || valueParser(input);
		if(!value) return null;
		input = spaceParser(value[1]);
		if(input[0] == ',') {
			input = spaceParser(input.slice(1));
			if(input[0] == ']') return null;
		}
		else if(input[0] != ']') return null;
		array.push(value[0]);
	}
	return open ? (input ? [array, input.slice(1)] : null) : [array, input];
}
function objectParser (input) {
	if(input[0] != '{') return null;
	input = spaceParser(input.slice(1));
	let object = {}, key, value, open = true;

	while(input && open && input[0]!='}') {
		key = stringParser(input);
		if(!key) return null;

		input = spaceParser(key[1]);
		if(input[0] != ':') return null;

		input = spaceParser(input.slice(1));
		value = JSONParser(input) || valueParser(input);
			
		if(!value) return null;
		input = spaceParser(value[1]);
		if(input[0] == ',') {
			input = spaceParser(input.slice(1));
			if(input == '}') return null;
		}
		else if(input[0] != '}') return null;
		object[key[0]] = value[0];
	}
	return open ? (input ? [object, input.slice(1)] : null) : [object, input];
}

function valueParser(input) {
	input = spaceParser(input);
	return nullParser(input) || booleanParser(input) || numberParser(input) || stringParser(input);
}
function JSONParser (input) {
	input = spaceParser(input);
	return arrayParser(input) || objectParser(input);
}

const parseJSON = data => {
	const [parsed, garbage] = ((typeof data == 'object') ? JSONParser(`${data}`) : valueParser(data)) || [null];
	return !garbage && parsed;
}

// const data = fs.readFileSync(`./jsontest/pass4.json`);
// console.log(parseJSON(data));
// console.log(JSON.parse(data));
fs.readdir('./jsontest', (err, files) => {
	if (err)
			console.log(err);
	else {
		files.forEach(file => {
			console.log(file);
			const data = fs.readFileSync(`./jsontest/${file}`);
			console.log(parseJSON(data));
			// console.log(JSON.parse(data));
		})
	}
});