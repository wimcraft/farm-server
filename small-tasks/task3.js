// Please write a function to return if a string contains a digit
// e.g 'test-string' -> false
// e.g 'test-string23' -> true
const containsDigit = str => /\d/.test(str);

console.log(containsDigit('test-string'));
console.log(containsDigit('test-string23'));