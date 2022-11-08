import express from 'express';
import { createPost, getAllPosts } from '../controllers/postsController.js';
import authorize from '../middlewares/authentication.js';
import handleUpload from '../handleUpload/index.js';
const upload = handleUpload("./uploads",['jpeg','png','jpg','gif','mp4','mkv'],{size:1024 * 1024 * 10000});

const Router = express.Router();

Router.route("/").post(authorize,upload.single('image'),createPost);
Router.route("/").get(authorize,getAllPosts);

export default Router