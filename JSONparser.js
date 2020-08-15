const nullParser = input => {
    if(!input.startsWith('null')) return null;
    return [null, input.slice(4)];
}

const booleanParser = input => {
    if(input.startsWith('true')) return [true, input.slice(4)];
    if(input.startsWith('false')) return [false, input.slice(5)];
    return null;
    // let matched = input.match(/^(true|false)/);
    // return matched && [matched[0], input.slice(matched[0].length)];
}

const numberParser = input => {
    let matched = input.match(/^-?\d+(?:\.\d+)?(?:(e|E)(-|\+)?\d+)?/);
    return matched && [Number(matched[0]), input.slice(matched[0].length)];
}

const stringParser = input => {
    let matched = input.match(/^"(?:[^\\"]|(?:\\(["\\\/bfnrt]|u[0-9A-Fa-f]{4})))*"/);
    return matched && [matched[0].slice(1, matched[0].length-1), input.slice(matched[0].length)]; 
}

const arrayParser = input => {
    // let regex = /\[\s*(?<zero>[^,]*)(?:,(?<values>[^,]*))*\]/;
    // let matched = input.match(/^\[(?:\s*|\s*([^,]+|\[.*\])(?:,([^,]+|\[.*\]))*)\]/);
    let matched = input.match(/^\[.*\]/);

    if(!matched) return null;

    matched[0] = matched[0].slice(1, matched[0].length-1).trim();

    let array = [], regex = new RegExp(/(\s*\[.*\]|{.*}|[^,\[{]+\s*(?=,|$))/g), value;
    while((value = regex.exec(matched[0])) !== null) {
        let parsed = JSONParser(value[0].trim());
        if(!parsed) return null;
        array.push(parsed[0]);
    }
    return [array, input.slice(matched[0].length + 2)];
}

function objectParser (input) {
    // let matched = input.match(/^{\s*(?:(("[^"]+")\s*:{.*}|\s*[^,]+)(?:,\s*(?:("[^"]+")\s*:{.*}|[^,]+)?)*)*}/);
    let matched = input.match(/^{.*}/);
    if(!matched) return null;
    
    matched[0] = matched[0].slice(1, matched[0].length-1);

    let object = {}, regex = new RegExp(/\s*(?<key>"[^"]+")\s*:\s*(?<value>\[.*\]|{.*}|[^,]+(?=,|$))/g), value;
    while((value = regex.exec(matched[0])) !== null) {
        let x = stringParser(value.groups.key),
            y = JSONParser(value.groups.value.trim());
        
        if(x && y)
            object[x[0]] = y[0];
        else return null;
    }
    return [object, input.slice(matched[0].length+2)];
}

function JSONParser (input) {
    return nullParser(input) || booleanParser(input) || numberParser(input) || stringParser(input) || arrayParser(input) || objectParser(input);
}

let input = [
    "{  }",
    "{\"a:\" : 1}",
    "{\"asd\" : {}, \"asdf\": \"asd\", \"asf\": [1, 2, 3],  }",
    "[1, 2,3,[\"y\"]]",
    "\"asd\"",
    '"\ndgfd\""',
    '0asda',
    '0.123asda',
    '-0asda',
    '-0.0013asda',
    '-123.asda',
    '-123e-12.sas.34da',
    '-123e+12.sas.34da',
    '-123E1.sas.34da',
    '-123E.sas.34da',
    'asda12312ads3',
    'false12afas',
    'true12afas',
    'asdfalse',
    'nullabcd',
    "[1, 2, 3, [4, [5, 7]], 6]",
    "[1, 2, 3, {\"a\" : 2, \"b\": 3}]",
    "{\"1\": 2, \"3\": {\"4\": {\"asd\": \"Asd\"}, \"6\": 7}}",
    "{\"asd\" : {}, \"asdf\": \"asd\", \"asf\": [1, 2, 3],  }"
];
input.forEach(el => console.log(JSONParser(el)));

let input2 = {
    "\"username": "username",
    email: "em@il",
    age: 26,
    access: {profile: true, timeline: true, friends: true, dashboard: true}
};
console.log(JSONParser(JSON.stringify(input2)));


