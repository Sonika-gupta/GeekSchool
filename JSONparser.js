var fs = require('fs');

const spaceParser = input => {
		return input && input.replace(/^\s+|\s+$/, '');
}
const commaParser = input => {
		let matched = input.match(/^(\"[^"]*\",|[^]+?,)/);
		return matched && [matched[0], input.slice(matched[0].length)];
}
const arrayEndParser = input => {
		let matched = input.match(/^(\"[^"]*\"\s*\]|[^",]+?\])/);
		return matched && [matched[0], input.slice(matched[0].length)];
}
const objectEndParser = input => {
		let matched = input.match(/^(\"[^"]*\"\s*\}|[^",]+?\})/);
		return matched && [matched[0], input.slice(matched[0].length)];
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
		let matched = input.match(/^"(?:[^\\"\n\t]|(?:\\(["\\\/bfnrt]|u[0-9A-Fa-f]{4})))*"/);
		return matched && [matched[0].slice(1, -1), input.slice(matched[0].length)];
}
function arrayParser (input) {
		if(input[0] != '[') return null;
		input = spaceParser(input.slice(1));
		let array = [], value, open = true;
		while(input && open && input[0] != ']') {
				value = JSONParser(input);
				if(!value) {
						var str = arrayEndParser(input) || commaParser(input);
						if(!str) return null;

						if(str[0].slice(-1) == ']') open = false;
						input = spaceParser(str[1]);
						if(str[0].slice(-1) == ',' && input[0] == ']') return null;
						value = valueParser(str[0].slice(0, -1));
						if(!value || value[1]) return null;
				}
				else {
						input = spaceParser(value[1]);
						if(input[0] == ',') {
								input = input.slice(1);
						}
				}
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
				value = JSONParser(input);
				if(!value) {
						var str = objectEndParser(input) || commaParser(input);
						if(!str) return null;
						if(str[0].slice(-1) == '}') open = false;
						input = spaceParser(str[1]);
						if(str[0].slice(-1) == ',' && input[0] == '}') return null;

						value = valueParser(str[0].slice(0, -1));
						if(!value || value[1]) return null;
				}
				else {
						input = spaceParser(value[1]);
						if(input[0] == ',')
								input = spaceParser(input.slice(1));
				}
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

fs.readdir('./testfiles', (err, files) => {
		if (err)
				console.log(err);
		else {
				files.forEach(file => {
						console.log(file);
						console.log(JSONParser(fs.readFileSync(`./testfiles/${file}`).toString()));
				})
		}
}) ;