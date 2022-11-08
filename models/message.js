import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,'please provide a message title']
    },
    users:{
        type:[{type:mongoose.Schema.Types.ObjectId,ref:"facebook-clone-users"}]
    },
     to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'facebook-clone-users',
        required:[true,'please provide the message receiver']
    },
},{timestamps:true});
export default mongoose.model("facebook-clone-messages",messageSchema);