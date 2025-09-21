import asyncHandler from "express-async-handler";
import User from "../Models/userModel.js";
import Job from "../Models/jobModel.js";

export const createJob = asyncHandler(async(req, res)=>{
  try{

    const user = await User.findOne({auth0Id:req.oidc.user.sub});
    console.log("user:" ,req.body.title); 
    console.log("user:", user);
    const isAuth = req.oidc.isAuthenticated() || user.email;
    if(!isAuth){
      return res.status(401).json({message:"Not Authorized"});
    }

    const {
      title,
      description,
      location,
      salary,
      jobType,
      tags,
      skills,
      salaryType,
      negotiable,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }

    if (!salary) {
      return res.status(400).json({ message: "Salary is required" });
    }

    if (!jobType) {
      return res.status(400).json({ message: "Job Type is required" });
    }

    if (!tags) {
      return res.status(400).json({ message: "Tags are required" });
    }

    if (!skills) {
      return res.status(400).json({ message: "Skills are required" });
    }
    const job = new Job({
      title,
      description,
      location,
      salary,
      jobType,
      tags,
      skills,
      salaryType,
      negotiable,
      createdBy: user._id,
    });

    await job.save();
    return res.status(201).json(job);



   
  }
  catch(error){
    console.log("error in creating the job:",error);
    return res.status(500).json({
      message:"serer error",
    })


  }
   
  
});
export const getJobs = asyncHandler(async(req, res)=>{
    try{
        const jobs = await Job.find().populate(
            "createdBy", 
            "name email profilePicture"
          ).sort({createdAt:-1});

        return res.status(200).json(jobs); 
    }
    catch(error){
      console.log("error in getting jobs:",error);
      return res.status(500).json({
        message:"server error",
      })
    }
});
export const getJobsByUser = asyncHandler(async(req, res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user){
          return res.status(404).json({message:"User not found"});
        }
        const jobs = await Job.find({createdBy:user._id}).populate(
          "createdBy",
          "name email profilePicture"
        ).sort({createdAt:-1});
        return res.status(200).json(jobs);

    }
    catch(error){}
});
export const searchJobs = asyncHandler(async (req, res) => {
  try {
    const { tags, location, title } = req.query;

    let query = {};

    if (tags) {
      query.tags = { $in: tags.split(",") };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    const jobs = await Job.find(query).populate(
      "createdBy",
      "name profilePicture"
    );

    return res.status(200).json(jobs);
  } catch (error) {
    console.log("Error in searchJobs: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});

// apply for job
export const applyJob = asyncHandler(async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const user = await User.findOne({ auth0Id: req.oidc.user.sub });

    if (!user) { 
      return res.status(404).json({ message: "User not found" });
    }

    if (job.applicants.includes(user._id)) {
      return res.status(400).json({ message: "Already applied for this job" });
    }

    job.applicants.push(user._id);

    await job.save();

    return res.status(200).json(job);
  } catch (error) {
    console.log("Error in applyJob: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});

// like job and unlike job
export const likeJob = asyncHandler(async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const user = await User.findOne({ auth0Id: req.oidc.user.sub });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isLiked = job.likes.includes(user._id);

    if (isLiked) {
      job.likes = job.likes.filter((like) => !like.equals(user._id));
    } else {
      job.likes.push(user._id);
    }

    await job.save();

    return res.status(200).json(job);
  } catch (error) {
    console.log("Error in likeJob: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});

// get job by id
export const getJobById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate(
      "createdBy",
      "name profilePicture"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json(job);
  } catch (error) {
    console.log("Error in getJobById: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});

// delete job
export const deleteJob = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    const user = await User.findOne({ auth0Id: req.oidc.user.sub });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await job.deleteOne({
      _id: id,
    });

    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.log("Error in deleteJob: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});

    