import Posts from '../models/Post.js';
import Users from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import NotFoundError from '../errors/not-found.js'
import BadRequestError from '../errors/bad-request.js';

export const createPost = async (req,res,next)=>{
  try {
    const ALLOWED_FILE_TYPE = ['image','video'];
    if(!req.file){
        throw new BadRequestError("please provide a file url");
    }
    const {mimetype} = req.file;
    const postType =mimetype.split('/')[0];
    const isAllowed = ALLOWED_FILE_TYPE.includes(postType);
    if(!isAllowed){
        throw new BadRequestError('file extension is not allowed for upload!');
    }
    const {user:{userID}} = req;
    const post = await Posts.create({...req.body,url:req.file.path,userID,postType});
    return res.status(StatusCodes.OK).json({success:true,post});
  } catch (error) {
    next(error);
  }
}
export const getAllPosts = async (req,res,next)=>{
  try {
    const {user:{userID}} = req;
    const user = await Users.findById(userID);
    if(!user){
      throw new BadRequestError("no user with the provided id");
    }
    const posts = await Posts.find({userID:{$in:[userID,...user.friends]}}).limit(10);
    if(posts.length === 0){
      return res.status(StatusCodes.OK).json({success:true,message:"you and you friends have no posts yet!"});
    }
    return res.status(StatusCodes.OK).json({success:true,nbHits:posts.length,posts});
  } catch (error) {
   next(error);
  }
}
export const getSinglePost = async (req,res,next)=>{
  try {
    const {params:{id:postID}} = req;
    const post = await Posts.findById(postID);
    if(!post){
      throw new NotFoundError("no post with the provided id")
    }
    return res.status(StatusCodes.OK).json({success:true,post});
  } catch (error) {
   next(error);
  }
}
export const getSpecificPosts = async (req,res,next)=>{
  try {
    const {params:{id:userID}} = req;
    const posts = await Posts.find({userID});
    if(posts.length === 0){
      throw new NotFoundError("you have no posts yet!!!")
    }
    return res.status(StatusCodes.OK).json({success:true,posts});
  } catch (error) {
   next(error);
  }
}

export const updatePost = async (req,res,next)=>{
  try {
    const {params:{id:postID},user:{userID}} = req;
    let post = await Posts.findById(postID);
    if(!post){
      throw new BadRequestError("no post with the provided id!");      
    }
    if(post.userID !== userID){
      throw new BadRequestError("you can only update your own posts!");      
    }
    post = await Posts.findByIdAndUpdate(postID,{...req.body},{new:true,runValidators:true});
  return res.status(StatusCodes.OK).json({success:true,post})
} catch (error) {
  next(error);
  
}
}
export const deletePost = async (req,res,next)=>{
  try {
    const {params:{id:postID},user:{userID}} = req;
    const post = await Posts.findById(postID);

    if(!post){
      throw new BadRequestError("no post with the provided id!"); 
    }
    if(post.userID !== userID){
      throw new NotFoundError("you can only delete your own posts!"); 
    }
    return res.status(StatusCodes.OK).json({success:true,message:"post  successfully deleted!"})
  } catch (error) {
    next(error);
    
  }
}
