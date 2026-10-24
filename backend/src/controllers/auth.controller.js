const userModel=require('../models/user');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');

const TOKEN_TTL_SECONDS = 60 * 60;
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_TTL_SECONDS * 1000,
    path: '/',
};

function issueToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_TTL_SECONDS,
        algorithm: 'HS256',
    });
}

function validateCredentials(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return null;

    const { name, email, password } = body;
    if (typeof password !== 'string' || Buffer.byteLength(password, 'utf8') < 8 || Buffer.byteLength(password, 'utf8') > 72) return null;
    const identifier = typeof email === 'string' ? email.trim() : (typeof name === 'string' ? name.trim() : '');
    if (!identifier || identifier.length > 254) return null;
    return { identifier, password };
}

async function login(req,res){
    const credentials = validateCredentials(req.body);
    if (!credentials) return res.status(400).json({ message: 'Provide an email or username and a valid password.' });
    const { identifier, password } = credentials;
    const user = await userModel.findOne({
        role: 'admin',
        $or: [{ name: identifier }, { email: identifier.toLowerCase() }],
    });
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
    const token = issueToken(user._id.toString());
    res.cookie('token', token, COOKIE_OPTIONS);
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
    const { maxAge, ...clearCookieOptions } = COOKIE_OPTIONS;
    res.clearCookie('token', clearCookieOptions);
    res.status(200).json({message:"User logged out successfully"})
}

function me(req, res) {
    res.json({ user: req.admin });
}

module.exports={login,logout,me};
