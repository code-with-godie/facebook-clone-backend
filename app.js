//imports
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from 'dotenv';
import notFound from './middlewares/notFound.js';
import connectDB from "./db/connect.js";
import errorHandlerMiddleware from './middlewares/error-handler.js';
import usersRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

//app config
const app = express();
dotenv.config();

//extra security packages
app.use(cors());
app.use(helmet());

//middlewares
app.use(express.json());
app.use('/uploads',express.static("uploads"));
app.use('/testing',express.static("public"));

//api  routes 
app.get("/api/v1/facebook-clone",(req,res)=>{
    res.status(200).json({success:true,message:"my facebook-clone app!!!"});
});
app.use('/api/v1/facebook-clone/users',usersRoutes);
app.use('/api/v1/facebook-clone/posts',postRoutes);
app.use('/api/v1/facebook-clone/messeger',messageRoutes);

//not found route
app.use(notFound);

//error handlermindleware
app.use(errorHandlerMiddleware);
const port = process.env.PORT || 5000;
const start = async ()=>{
    await connectDB(process.env.MONGO_URL);
    app.listen(port,()=> console.log(`server listening at port ${port}...`));
}
start();

