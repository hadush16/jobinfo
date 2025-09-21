import express from 'express';
import { auth } from 'express-openid-connect';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fs from 'fs';
import connectDB from "./db/connect.js";
import User from "./Models/userModel.js";
import asyncHandler from "express-async-handler";

dotenv.config();
const app = express();

// 🔹 Auth0 Config
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.base_url,
  clientID: process.env.client_id,
  issuerBaseURL: process.env.issuerBaseURL,
};

// 🔹 Middlewares
app.use(cors({
  origin: process.env.client_url,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔹 Auth0 middleware
app.use(auth(config)); 

const inusureUserInDB = asyncHandler(async(user)=> {
  try{
    const existingUser = await User.findOne({ auth0Id: user.sub });
    if(!existingUser){
      const newUser = new User({
        name: user.name,
        email: user.email,
        auth0Id: user.sub,
        role: 'jobseeker',
        profilePicture: user.picture,
      })
      await newUser.save()
      console.log("New user added to DB",user)
      return newUser;
    }
    else{
      console.log("user already exists in db ",existingUser)
    }
  } 
  catch(error){
    console.log("error cheching or adding user to db", error.message);
  }
});

app.get("/",async(req,res)=>{
  if(req.oidc.isAuthenticated()){
    await inusureUserInDB(req.oidc.user);
    return res.redirect(process.env.client_url);
  }
  else{
    return res.send("logged out");
  }
});

// 🔹 Auto-load routes (wait for all routes to be loaded before starting server)
const loadRoutes = async () => {
  const routefiles = fs.readdirSync("./route");
  await Promise.all(routefiles.map(async (file) => {
    try {
      const route = await import(`./route/${file}`);
      app.use("/api/v1", route.default);
    } catch (err) {
      console.error("❌ Failed to load route:", file, err);
    }
  }));
};

const PORT = process.env.PORT || 8000;

const server = async () => {
  try {
    await connectDB(); 
    await loadRoutes(); // Ensure all routes are loaded before starting server
    app.listen(PORT, () => {
      console.log(`🚀  connected Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log('❌ Server error:', error.message);
    process.exit(1);
  }
};

server();