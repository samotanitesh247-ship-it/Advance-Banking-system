import dotenv from "dotenv";
dotenv.config();

if(!process.env.JWT_SECRET){
    console.error("JWT_SECRET is not defined in the environment variables");
    process.exit(1);
}

const config = {
    JWT_SECRET: process.env.JWT_SECRET
}


export default config;