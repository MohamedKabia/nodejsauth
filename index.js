const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')

const app= express()
//body parser
app.use(bodyParser.json())

//config
dotenv.config()
//connect to db
mongoose.connect(
    process.env.DB_CONNECTION,
    {   useNewUrlParser: true,
        useUnifiedTopology: true 
    },
    ()=>{
        console.log('contented to db')
    }
)

//import route
const authRoute = require('./ROUTES/auth')
const tasksRoute =require('./ROUTES/tasks')
app.use('', authRoute);
app.use('/api/user', authRoute);
app.use('/api/user', tasksRoute);



//start server
app.listen(5000);