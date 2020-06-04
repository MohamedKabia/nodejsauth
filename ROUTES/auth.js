const express =require('express')
const router = express.Router();
const User = require('./moduls/User')
const bcrypt =require('bcryptjs');
const jwt =require('jsonwebtoken');
const mailer =require('nodemailer');


router.get('/',(req, res)=>{
    res.send('home')
})

//validation schema
const joi =require('@hapi/joi');
const regSchema =joi.object({
    name:joi.string().min(6).required(),
    email:joi.string().required().email(),
    password:joi.string().min(8).required(),
    rePassword: joi.any().valid(joi.ref('password')).required()
    
})

//register user
router.post('/register', async(req, res)=>{
    
    //check and return error status
    const {error} = await regSchema.validate(req.body)  
    if (error) return res.status(400).json({message: error})

    const emailExist = await User.findOne({email:req.body.email});
    if (emailExist) return res.status(400).json({error: error, message:'A user with this email exist'})

    //password hashing
    const salt =await bcrypt.genSalt(10)
    const hashePasswod = await bcrypt.hash(req.body.password, salt);
    //get user object
    let user = new User({
        name:req.body.name,
        email:req.body.email,
        password:hashePasswod
    })
    console.log(user ,'aft new------------')    
    user.save().then(data =>{
        const token =jwt.sign({uid: user._id, email:user.email, password:user.password}, process.env.TOKEN_SECRET,{
            expiresIn: '1h'
        })
        res.cookie('auth_token', token, { httpOnly: true }).json({data});
        
        }).catch(err =>{
        res.status(400).json({message: err})
    })
        
})

/*//log user in with jwt and set cookie
    const token =jwt.sign({uid: user._id, email:user.email, name:user.name}, process.env.TOKEN_SECRET,{
        expiresIn: '1h'
    })
    res.cookie('token', token, { httpOnly: true })*/
//login user
 router.post('/login', async(req,res)=>{
    //validate input
    const regSchema =joi.object({
        email:joi.string().required().email(),
        password:joi.string().min(8).required(),
    })
    const {error} = regSchema.validate(req.body) 
    if (error) return res.status(400).json({error: error, message:'Please enter a valid email and password'})

    //check db for user by user email 
    const user = await User.findOne({email:req.body.email});
    if (!user) return res.status(400).json({error: error, message:'Invalid email'})
    //check user Password
    const validPass = await bcrypt.compare(req.body.password, user.password)
    if (!validPass) res.status(400).json({error:error, message:'Invalid email or password'})
    
    //log user in with jwt
    const token =jwt.sign({uid: user._id, email:user.email, name:user.name}, process.env.TOKEN_SECRET)
     res.header('auth_token', token).send(token);
 })

 //logout users 
 router.post('/logout', async(req, res)=>{
     
 })

 //reset password
 router.post('/password', async(req, res)=>{
    const emailSchem =joi.object({
        email:joi.string().required().email()
    })
    const {error} =await emailSchem.validate(req.body)
    if (error) res.status(401).json({error:error, message:'invalid email'})

    //chek if user exist
    const user = await User.findOne({email:req.body.email})
    if (!user) return res.status(401).json({error:error, message:'Invalid email'})
    //generat verifecation code
    const vCode = Math.floor(1000 + Math.random() * 9000);
    let transporter =mailer.createTransport({
        service: 'gmail',
        auth:{
            user: process.env.email,
            pass: process.env.pass
            }
    })

    let mailOptpon ={
        from: 'kabiaofficial@gmail.com',
        to: req.body.email,
        subject:'Reset Password',
        text: 'Enter this code to reset your password ' + vCode
    }
    transporter.sendMail(mailOptpon, (err, data)=>{
        if(err){
           res.json({error:err, message:'Server error Please try again later'})
        }
        else{
            Console.log('SENT')
        }
    })
    console.log(vCode)
    user.resetpassword = vCode
    user.save().then(()=>{
        //delete verifecation code
        setTimeout(()=>{
            user.resetpassword = null
            user.save()
        },600000)//empty vCode after 10min
    })

    res.send('vCode');
});
//rout to new password
router.post('/newpassword', async(req, res)=>{
    const pasSchem = await joi.object({
        email:joi.string().email().required(),
        authCode:joi.string().required().max(12),
        password:joi.string().required(),
        rePassword: joi.any().valid(joi.ref('password')).required()
    })
    const {error} =pasSchem.validate(req.body);
    if (error) return res.json({error:error, message:"passwords do not match"})

    const user = await User.findOne({email:req.body.email})
    if (!user) return res.json({error:error, message:"Invalid email"})

    const savedCode = user.resetpassword 
    if (savedCode === req.body.authCode){
        const salt =await bcrypt.genSalt(10)
        const hashePasswod = await bcrypt.hash(req.body.password, salt);
        user.password = hashePasswod;
        user.save().then(()=>{
            res.json({message:"Password updated"})
        })
    }

});

module.exports=router;