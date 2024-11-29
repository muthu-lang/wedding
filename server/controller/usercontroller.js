
const User =require('../models/index')
// const Profile =require('../models/profiles')
const bcrypt = require('bcryptjs')
const generateToken = require('../utils/index');


const nodemailer = require('nodemailer')



//signup
const signup=async(req,res)=>{
    const { 
        name,
       
        email, 
       
        password

     }=req.body;

    const user = await User.findOne({email});

    if(!user){ 

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name,
            
            email, 
            password:hashedPassword,
            });
        await newUser.save();
        return res.status(201).json({message: "User created successfully"})
    }

    res.status(404).json({message: 'user already exists'})
};


//login
const login=async(req,res)=>{
    const { email, password } = req.body;
    const user = await User.findOne({email});
    // res.satatus(201).json({message:'login successfully'})

    if(!user){
        return res.status(404).json({message: 'User not found'})}

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(401).json({message: 'Invalid password'})}

    const token = generateToken(user);
    res.json({token});
};



const resetpassword=async (req,res)=>{
    const { email } = req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.status(404).json({message: 'User not found'})}

        const token = Math.random().toString(36).slice(-8)
        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 3600000 // 1 hour from now
        await user.save()

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "bharathmk333@gmail.com",
                pass: "wftldxymjturgsjo"
            },
        })

        const message = {
            from: "bharathmk333@gmail.com",
            to: user.email,
            subject: "Reset Password",
            text: `You can reset your password here: ${token}`}

            transporter.sendMail(message, (err, info)=>{
                if(err){
                     res.status(404).json({message: 'Error sending email'})}
                     res.status(200).json({message: 'password reset email send'+ info.response})
            })

};


const resetPasswordToken=async(req,res)=>{
    const {token} = req.params;
    const {password} = req.body;


    const user = await User.findOne({
        resetPasswordToken: token, 
        resetPasswordExpires: { $gt: Date.now()}});

        if(!user){
            return res.status(404).json({message: 'Invalid or expired password reset token'})}


            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
            res.status(200).json({message: 'Password updated successfully'})
        };




const getUsers = async(req,res,next)=>{
    User.find()
    .then(Users => res.json(Users))
    .catch(err => res.json(err))
}



const getuserbyid = async (req, res,next) => {
    console.log(req.params.id)
  User.findById(req.params.id)
  .then(user=>{
    res.status(200).json({
        users:user
    })
   
  })
   .catch(err=>{
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
}

module.exports={signup,login,resetpassword,resetPasswordToken,getUsers,getuserbyid}