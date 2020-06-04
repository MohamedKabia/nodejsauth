const jwt = require('jsonwebtoken')
module.exports = function authtoken(req,res,next){
    token=req.header('auth_token')
    if (!token) res.status(401).json({error:'acess denied'})

    try{
        const tokenVerified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user=tokenVerified;
        next();
    }
    catch(err){
        res.status(400).json({error:err, message:'Invalid token, access denied'})
    }
}