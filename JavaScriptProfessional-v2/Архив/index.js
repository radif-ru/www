const express = require("express");
const app = express();
app.use(express.static('.'));
app.get('/get/test/data', (request, responce) => {
    // responce.send('It is test string data');
    fs.readFile('./package.json', 'utf-8', (err, data) => {
        console.log('fs', err, data);
        // console.log(JSON.parse(data));
        responce.send(data);
    });
});

const fs = require('fs');
fs.readFile('./package.json', 'utf-8', (err, data) => {
    console.log('fs', err, data);
    console.log(JSON.parse(data));
});

app.listen(5000, () => {
    console.log('Server start on port 5000!');
});