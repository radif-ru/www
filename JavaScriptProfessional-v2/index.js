const express = require("express");
const app = express();
app.use(express.static('.'));
app.get('/get/test/data', (requset, responce) => {
    // responce.send('It is test string data');
    // console.log('requset', requset);
    // console.log('responce', responce);
    fs.readFile('./responses/data.json', 'utf-8', (err, data) => {
        console.log('fs', err, data);
        // console.log(JSON.parse(data));
        responce.send(data);
    });
});

const fs = require('fs');
fs.readFile('./responses/data.json', 'utf-8', (err, data) => {
    console.log('fs', err, data);

    if (!err) {
        const obj = JSON.parse(data);
        console.log(obj);

        obj.third = 'THREE';
        fs.writeFile('./responses/data.json', JSON.stringify(obj), (err) => {

        })
    }


});

app.listen(5000, () => {
    console.log('Server start on port 5000!')
});
