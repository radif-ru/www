const express = require('express');
const app = express();

const basket = {};

app.post('/cart/product', (req, res) => {
    basket['user'] = [...basket['user'], JSON.parse(req.body)];
    res.send(JSON.stringify({result: 1})); // res.json({result: 1});
});

app.delete('/cart/product', (req, res) => {
    const arr = basket['user'];
    basket['user'].splice(JSON.parse(req.body).id, 1);
    basket['user'] = [...arr];
    res.json({result: 1});
});

app.listen(5000);