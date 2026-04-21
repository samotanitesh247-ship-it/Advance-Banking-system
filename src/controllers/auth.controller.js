import express from 'express';
import mongoose from 'mongoose';
import userModel from '../models/user.model.js';
import { config } from 'dotenv';

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

export const login = async (req, res) => {
    const { email, password } = req.body;

    try{
        const user = await userModel.findOne({email}).select("+password");

        if(!user){
            res.status(400).json({message: "user not found"});
        }
        if(!user.verified){
            res.status(400).json({message: "Please verify your email before logging in"});
        }

        const isMatch = await user.comparePassword(password);

        if(!isMatch){
            res.status(400).json({message: "Invalid password"});
        }

        const refreshToken = jwt.sign({
            userId: user._id
        }, config.JWT_SECRET, {
        })

        const accessToken = jwt.sign({
            userId: user._id
        }, config.JWT_SECRET, {
            expiresIn: "15m"
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            message: "User logged in successfully",
            accessToken
        });



    } catch (error) {
        res.status(500).json({message: "Error occurred while logging in"});
    }
}