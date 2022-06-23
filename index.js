require("dotenv").config()
require("express-async-errors")



const accessLogMiddleware = require("./middlewares/logger.middleware")
const routes = require("./routes/api")

const express = require("express")
const app = express()
const cors = require("cors")

app.use(cors())

app.use(express.json())

// Req and Res logger.
app.use(accessLogMiddleware)

app.use("/", routes)


const Airtable = require('airtable');
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.AIRTABLE_API_KEY
});
var base = Airtable.base('appNSsrogRqeWbemH');


module.exports = app
