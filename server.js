import express from 'express';
import mongoose from 'mongoose';
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import session from 'express-session';
import jwt from 'jsonwebtoken';
import User from "./User.js";
dotenv.config({ path: "./.env" });
const app = express();
const port = process.env.PORT || 5000;
const dbLink = process.env.ATLAS_URI; 

app.use(cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    origin: "https://xtm.onrender.com", 
    methods: ["POST"]
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.json({extended: true}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }));
const connectDb = async () => {
    try {
       await mongoose.connect(dbLink).then(() => console.log("Connected to Db")).then(() => app.listen(port, () => console.log(`Server is running on PORT ${port} `)))
       } catch (error) {
        console.error(error)
    }
}
connectDb();

app.get('/users/:id', async (req, res)=> {
    const userId = req.params.id;
    const user = await User.findById(userId);
    console.log(user);
    res.status(302).json({user})
})

app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    try {
        const sanitizedEmail = email.replace(/[^a-zA-Z0-9_!.@_-]/g, '');
        const sanitizedPassword = password.replace(/[^a-zA-Z0-9_!.@_-]/g, '');
        const user = await User.find({ email: sanitizedEmail });
        if(user.length<1 || !user) {
            return res.status(404).json({message: "Authorization failed, no user found."})
        }
       bcrypt.compare(sanitizedPassword, user[0].password, (err, result) => {
            if(err){return res.status(405).json({message: "Something went wrong."})};            
            if(result) {
                req.session.userId = user[0]._id.toString();
                const token = jwt.sign({email: user[0].email, userId: user[0]._id}, process.env.JWT_KEY, {expiresIn: "24h"});
                return res.status(200).json({ message: "Authorization successful", token: token, userId: user[0]._id.toString()});
            };
            res.status(401).json({message: "Authorization failed, password incorrect."})
        })
   } catch (error) {
    console.error(error)
    res.status(500).json({error: error})
   }
})

app.post("/register", async (req, res) => {

    const {email, password} = req.body;
    try {
      const sanitizedEmail = email.replace(/[^a-zA-Z0-9_!.@_-]/g, '');
      const sanitizedPassword = password.replace(/[^a-zA-Z0-9_!.@_-]/g, '');
      const checkExistingUser = await User.find({email: sanitizedEmail});
      if(checkExistingUser.length>0) { 
      }
        bcrypt.hash(sanitizedPassword, 10, async(err, hash) => {
        if (err) {
            return res.status(500).json({error:err, message: "Something went wrong!"})
        } else {
            const user = new User({
                email: email,
                password: hash
                });  
            await user.save()
            res.status(201).json({message: 'User registered successfully'})
        }});
    } catch (error) {
        console.error(error)
        res.status(500).json({error: error})
    }
})

