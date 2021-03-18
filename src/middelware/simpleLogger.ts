import express from "express";
const app = express();
const debug = require("debug")("app");
//Simple Logger

export default
    app.use((req, res, next) => {
        debug(new Date().toLocaleDateString(), req.method, req.originalUrl, req.ip);
        next();
    });
