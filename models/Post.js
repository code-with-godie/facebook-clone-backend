import mongoose from "mongoose";

const postSchema  = new mongoose.Schema({
    caption:{
        type:String,
        default:''
    },
    url:{
        type:String,
        required:[true,'please provide a post url']
    },
    comments:{
        type:[String]
    },
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'facebook-clone-users',
        required:[true,'please provide userID for the post ']
    },
    postType:{
        type:String,
        enum:['image',"video"],
        required:[true,'please provide post type for this post ']
        
    }
},{timestamps:true});

export default mongoose.model('facebook-clone-posts',postSchema);