// Please write a function to return an array of all files with csv extension in folder /files
const fs = require('fs');
const path = require('path');

const listCSVFiles = (folderPath) => {
    return fs.readdirSync(folderPath).filter((file) => {
        const extension = path.extname(file);
        return extension === '.csv';
    });
}

const csvFiles = listCSVFiles('./files');
console.log(csvFiles);