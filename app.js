'use strict'

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

//archivo de rutas
const router = require('./routes/routes');
const router_topic = require('./routes/topic');
const router_comment = require('./routes/comment');

//middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//rutas
app.use('/api', router);
app.use('/api', router_topic);
app.use('/api', router_comment);

// exportar
module.exports = app;