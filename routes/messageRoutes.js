import express from 'express';
import { deleteMessage, getAllConversations, getSingleConversation, sendMessage } from '../controllers/messagesController.js';
import authorize from '../middlewares/authentication.js';

const Router = express.Router();

Router.route("/").get(authorize,getAllConversations);
Router.route("/:id").post(authorize,sendMessage);
Router.route("/:id").get(authorize,getSingleConversation).delete(authorize,deleteMessage);

export default Router