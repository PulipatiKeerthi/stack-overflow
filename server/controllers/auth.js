import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import users from '../models/auth.js'

export const signup = async (req,res) => {
    const { name, email, password } = req.body;
    console.log(email,password,name)
    try{
        const existingUser = await users.findOne({ email });
        console.log(existingUser)
        if(existingUser){
            return res
          .status(400)
          .json({ error: "Sorry a User with this email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

        const newUser = await users.create({
            name,
            email,
            password: hashedPassword,
        });
         
        const token = jwt.sign({ email: newUser.email, id: newUser._id },process.env.JWT_SECERET, { expiresIn: '1h' });

        res.status(200).json({ result: newUser, token })
    }
    catch(error){
        res.status(500).json("Internal Server Error")
    }

}

export const login = async (req,res) => {
    const { email, password} = req.body;
    try{
        const existinguser = await users.findOne({ email });
        if(!existinguser){
            return res.status(404).json({ message: "User Don't Exist."})
        }

        const isPasswordCrt = await bcrypt.compare(password, existinguser.password)
        if(!isPasswordCrt){
            return res.status(400).json({message : "Invalid credentials"})
        }
        const token = jwt.sign({ email : existinguser.email, id:existinguser._id}, process.env.JWT_SECERET, { expiresIn: '1h'});
        res.status(200).json({ result: existinguser, token })
    }catch (error) {
        res.status(500).json("Something went wrong...")
    }
}