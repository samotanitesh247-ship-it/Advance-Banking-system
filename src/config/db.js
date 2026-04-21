import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const connectDb = async () => {

    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("connected to Database");
    } catch(error){
        console.log("error connecting to Database", error);
        process.exit(1);
    }


}

export default connectDb;