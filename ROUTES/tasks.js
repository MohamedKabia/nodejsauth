const express = require('express')
const router = express.Router();
const veriftToken = require('./verifyToken')

router.get('/tasks', veriftToken, (req, res)=>{
    res.json({user:req.user})
})

module.exports =router;