import express from 'express';
import mongoose from 'mongoose';
import userModel from '../models/user.model.js';
import { config } from 'dotenv';
import crypto from "crypto";
import jwt from "jsonwebtoken";

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

export const getMe = async (req, res) => {
    const Token = req.headers.authorization?.split(" ")[1];

    if(!Token){
        return res.status(401).json({message: "Unauthorized"});
    }

    try{
        const decoded = jwt.verify(Token, config.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user: {
                username: user.username,
                email: user.email,
                verified: user.verified
            }
        })
    }catch (error) {
        return res.status(401).json({message: "Invalid token"});
    }
}

export const refreshToken = async (req, res) => {

    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(401).json({message: "Unauthorized"});
    }

    try {
        const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
        
        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const accessToken = jwt.sign({
            userId: decoded.userId
        }, config.JWT_SECRET, {
            expiresIn: "15m"
        })

        const newRefreshToken = jwt.sign({
            userId: decoded.userId
        }, config.JWT_SECRET, {
            expiresIn: "7d"
        })

        res.cookies("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({message: "Token refreshed successfully", accessToken});

        
    } catch (error) {
        return res.status(401).json({message: "Invalid refresh token"});
    }

}