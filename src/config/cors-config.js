'use strict';

const cors = require('cors');

const corsOptions = {
    origin: '*' , // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow all HTTP methods
};

module.exports = cors(corsOptions);