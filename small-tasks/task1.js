// Please write a function to transform array to containing number and strings.
// e.g ['super', '20.5', 'test', '23' ] -> ['super', 20.5, 'test', 23 ]
const transformArray = (arr) => {
    return arr.map((value) => {
        const parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? value : parsedValue;
    });
}

const inputArray = ['super', '20.5', 'test', '23'];
const transformedArray = transformArray(inputArray);

console.log(transformedArray);