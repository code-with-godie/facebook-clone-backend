import Messages from "../models/message.js";
import { StatusCodes } from "http-status-codes";
import NotFoundError from '../errors/not-found.js';
import Users from '../models/User.js';
import BadRequestError from '../errors/bad-request.js';

export const getSingleConversation = async (req,res,next)=>{
    try {
    const {user:{userID:senderID},params:{id:receiverID}} = req;
    const otherUser = await Users.findById(receiverID);
    if(!otherUser){
        throw new BadRequestError("no receiver with the provided id");
    }
    const messages = await Messages.find({$and:{users:[receiverID,senderID]}}).sort("createdAt");
    if(messages.length === 0){
        return res.status(StatusCodes.OK).json({success:true,message:`you have no chats yet with ${otherUser.name}`})
    }
    return res.status(StatusCodes.OK).json({success:true,nbHits:messages.length,messages})
    } catch (error) {
        next(error);  
    }
}
export const getAllConversations = async (req,res,next)=>{
    try {
    const {user:{senderID}} = req;
    let conversations = await Messages.find({users:{$in:[senderID]}});
    return res.status(StatusCodes.OK).json({success:true,conversations,senderID})
    conversations = await Users.find({_id:{$in:[...conversations]}},{password:0});
    if(conversations.length === 0){
        return res.status(StatusCodes.OK).json({success:true,message:`you have no conversations yet`})
    }
    return res.status(StatusCodes.OK).json({success:true,nbHits:conversations.length,conversations})
    } catch (error) {
        next(error);  
    }
}
export const sendMessage = async (req,res,next)=>{
    try {
    const {params:{id:receiverID},user:{userID:senderID}} = req;
    const message = new Messages({...req.body});
    message.to = receiverID;
    message.users.push(senderID);
    message.users.push(receiverID);
    await message.save();
    return res.status(StatusCodes.OK).json({success:true,message})
    } catch (error) {
        next(error);  
    }
}
export const deleteMessage = async (req,res,next)=>{
    try {
    const {params:{id:messageID},user:{senderID}} = req;
    let message = await Messages.findById(messageID);
    if(!message){
        throw new NotFoundError("no message with the provided id");
    }
    if(!message.users.includes(senderID) || message.to === senderID){
        throw new BadRequestError("you can only delete your own messages!!!");
    }
    await Messages.findByIdAndDelete(messageID);
    return res.status(StatusCodes.OK).json({success:true,message:"message deleted successfully"})
    } catch (error) {
        next(error);
    }
}