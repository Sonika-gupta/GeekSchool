function objectStringify(input) {
    if(!input || typeof input != 'object') return null;
    let stringified = [];
    if(Array.isArray(input)) {
        for(let i = 0; i< input.length; i++) {
            stringified[i] =  JSONstringify(input[i]) || "null";
        }
        return `[${stringified}]`;
    }
    else {
        for(let [key, value] of Object.entries(input)) {
            stringified.push(stringify(key)+':'+(JSONstringify(value)||"null"));
        }
        return `{${stringified}}`;
    }
}
const stringify = (input) => {
    if(typeof input == "string") return '"' + input + '"';
}
const generalStringify = (input) => {
    const types = ["number", "boolean", "object"];
    const special = ["NaN", "Infinity", "-Infinity"];
    if(!types.includes(typeof input)) return undefined;
    if(special.includes(String(input))) return "null";
    return String(input);
}
function JSONstringify(input) {
    return objectStringify(input) || stringify(input) || generalStringify(input);
}

// let input2 = [1,"yo",34, {a: 1, b: "hi"}];
// let input3 = {a:1, b: {c: 3}, d: [1,2,"3"]};
// let input = [235.256, NaN, Infinity, undefined, function(){}, "excuse me", null, true, false, input2, input3];

// input.forEach(el => {
//     let a = JSON.stringify(el);
//     let b = JSONstringify(el);
//     // console.log(a,b,el);
//     console.assert(a == b, el);
// });

// console.assert(JSONstringify(input) == JSON.stringify(input), input);
// console.assert(JSONstringify(input2) == JSON.stringify(input2), input2);
// console.assert(JSONstringify(input3) == JSON.stringify(input3), input3);
