import express from 'express';
import mongoose from 'mongoose';
import userModel from '../models/user.model.js';

export const register = async (req, res) => {

    const { username, email, password } = req.body;

    try{
        const existingUser = await userModel.findOne({
            $or :[
                {username: username},
                {email: email}
            ]
        })
        if(existingUser){
            return res.status(400).json({message: "User already exists"});
        }

        const newUser = await userModel.create({
            username,
            email,
            password
        })

        return res.status(201).json({message:"User registered successfully",
            newUser: {
                username: newUser.username,
                email: newUser.email,
                verified: newUser.verified
            }
        });

    } catch (error) {
        return res.status(500).json({message: "Error occurred while registering user"});
    }
    
}