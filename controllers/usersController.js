import Users from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import NotFoundError from '../errors/not-found.js';
import BadRequestError from '../errors/bad-request.js';
import UnauthenticatedError from '../errors/unauthenticated.js';

export const getAllUsers = async (req,res,next)=>{
  try {
    const {user:{userID}} = req;
    const users = await Users.find({_id:{$ne:userID}},{password:0});
    if(users.length === 0){
      return res.status(StatusCodes.OK).json({success:true,message:"you have no users yet!"});
    }
    return res.status(StatusCodes.OK).json({success:true,nbHits:users.length,users});
  } catch (error) {
   next(error);
  }
}
export const getSingleUser = async (req,res,next)=>{
  try {
    const {params:{id:userID}} = req;
    const user = await Users.findOne({_id:{$ne:userID}},{password:0});
    if(!user){
      throw new NotFoundError("no user with the provided id")
    }
    return res.status(StatusCodes.OK).json({success:true,user});
  } catch (error) {
   next(error);
  }
}
export const register = async (req,res,next)=>{
  try {
    const user = new Users({...req.body});
    const hashedPassword = await user.hashPassword();
    user.password = hashedPassword;
    user.profilePic = req.file?.path || "";
    await user.save();
    const {password,...newUser} = user._doc;
    return res.status(StatusCodes.CREATED).json({success:true,user:newUser});
  } catch (error) {
    next(error);
  }
}
export const login = async (req,res,next)=>{
  try {
    const {body:{email,password}} =  req;
    if(!email || !password){
      throw new BadRequestError("please provide both email and password!");
    }
    const user = await Users.findOne({email});
    if(!user){
      throw new UnauthenticatedError("INVALID EMAIL!");      
    }
    const passwordMatched = await user.checkPassword(password);
    if(!passwordMatched){
      throw new UnauthenticatedError("INVALID PASSWORD!");      
    }
    const token = await user.createToken();
    const {password:removePassword,...newUser} = user._doc;
    return res.status(StatusCodes.CREATED).json({success:true,user:newUser,token});
  } catch (error) {
    next(error);
  }
}
export const updateUser = async (req,res,next)=>{
  try {
    const {params:{id:userID},user:{userID:loggedInUser}} = req;
    if(userID !== loggedInUser){
      throw new BadRequestError("you can only update your own account!");      
    }
  const user = await Users.findByIdAndUpdate(userID,{...req.body},{new:true,runValidators:true});
  if(!user){
    throw new NotFoundError("no use with the provided id!");      
  }
  return res.status(StatusCodes.OK).json({success:true,user})
} catch (error) {
  next(error);
  
}
}
export const deleteUser = async (req,res,next)=>{
  try {
    const {params:{id:userID},user:{userID:loggedInUser}} = req;
    if(userID !== loggedInUser){
      throw new BadRequestError("you can only delete your own account!"); 
    }
    const user = await Users.findByIdAndDelete(userID);
    if(!user){
      throw new NotFoundError("no use with the provided id!"); 
    }
    return res.status(StatusCodes.OK).json({success:true,message:"account successfully deleted!"})
  } catch (error) {
    next(error);
    
  }
}
export const acceptFriendRequest = async (req,res,next)=>{
  try {
    const {params:{id:friendID},user:{userID:userID}} = req;
    let user = await Users.findById(userID);
    let friend = await Users.findById(friendID);
    if(!user || !friend){
      throw new NotFoundError("no use with the provided id!"); 
    }
    if(!user.friendRequest.includes(friendID)){
      throw new BadRequestError(`${friend.name} have no sent you a friends request yet!.send ${friend.name} a friend request instead!`)
    }
    user = await Users.findByIdAndUpdate(userID,{$push:{friends:friendID},$pull:{friendRequest:friendID}},{new:true,runValidators:true});
    friend = await Users.findByIdAndUpdate(friendID,{$push:{friends:userID}},{new:true,runValidators:true});
    return res.status(StatusCodes.OK).json({success:true,message:`you now friend with ${friend.name}`})
  } catch (error) {
    next(error);
    
  }
}
export const sendFriendRequest = async (req,res,next)=>{
  try {
    const {params:{id:friendID},user:{userID:userID}} = req;
    let user = await Users.findById(userID);
    let friend = await Users.findById(friendID);
    // you cannot send a friend request to yourself, to someone who you have blocked, to some who you are already friends with and you cannot send request twice
    if(!user || !friend){
      throw new NotFoundError("no use with the provided id!"); 
    }
    if(friendID === userID){
      throw new BadRequestError("you cannot friend youself!"); 
    }
    if(user.blockUser.includes(friendID)){
      throw new BadRequestError(`you cannot send a friend request because you blocked ${user.name} `);
    }
    if(user.friends.includes(friendID)){
      throw new BadRequestError(`you are already friends with ${friend.name} !!!!`);
    }
    if(friend.friendRequest.includes(userID)){
      throw new BadRequestError("friend request already sent!");
    }
    friend = await Users.findByIdAndUpdate(friendID,{$push:{friendRequest:userID}},{new:true,runValidators:true});
    const {password,...newUser} = friend._doc;
    return res.status(StatusCodes.OK).json({success:true,message:`you sent a friend request to ${friend.name}`})
  } catch (error) {
    next(error);
    
  }
}
export const blockUser = async (req,res,next)=>{
  try {
    const {params:{id:blockID},user:{userID:userID}} = req;
    let user = await Users.findById(userID);
    let friend = await Users.findById(blockID);
    if(!user || !friend){
      throw new NotFoundError("no use with the provided id!"); 
    }
    if(blockID === userID){
      throw new BadRequestError("you cannot block youself!"); 
    }
    if(user.blockUser.includes(blockID)){
      throw new BadRequestError("user already blocked!");
    }
    user = await Users.findByIdAndUpdate(userID,{$push:{blockUser:blockID}},{new:true,runValidators:true});
    const {password,...newUser} = user._doc;
    return res.status(StatusCodes.OK).json({success:true,friend:newUser})
  } catch (error) {
    next(error);
    
  }
}