const userModel=require('../models/user');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');

async function register(req,res){
    const {name,email,password}=req.body;

    const userExist=await userModel.findOne({

        $or:[
            {name},{email}
        ]
    })
    if(userExist){
        return res.status(409).json({message:"User already exists"})
    }
    const hash=await bcrypt.hash(password,10);

    const user= await userModel.create({
        name,email,password:hash
    })
    const token=jwt.sign({
        id:user._id,

    },process.env.JWT_SECRET)
    res.cookie("token",token)
    res.status(201).json({
        message:"User created Successfully",
        user:{
            id:user._id,
            name:user.name,
            email:user.email
        }
    })
};

async function login(req,res){
    const {name,email,password}=req.body;
    const user =await userModel.findOne({
        $or:[
            {name},
            {email}
        ]
    })
    if(!user){
        return res.status(401).json({
            message:"Invalid credentials"
        })
    }
    const isPasswordValid=await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
        return res.status(401).json({
            message:"Invalid credentials"
        })
    }
    const token=jwt.sign({
        id:user._id
    },process.env.JWT_SECRET)
    res.cookie("token",token)
    res.status(200).json({
        message:"Login successful",
        user:{
            id:user._id,
            name:user.name,
            email:user.email
        }
    })

}

async function logout(req,res){
    res.clearCookie("token")
    res.status(200).json({message:"User logged out successfully"})
}

module.exports={register,login,logout};