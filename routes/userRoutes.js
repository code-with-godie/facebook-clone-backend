import  express  from "express";
import {acceptFriendRequest, blockUser, deleteUser,  getAllUsers,getSingleUser,login, register, sendFriendRequest,updateUser} from '../controllers/usersController.js';
import authorize from '../middlewares/authentication.js';
import handleUpload from '../handleUpload/index.js';

const upload = handleUpload("./uploads",[]);
const Router = express.Router();
Router.route('/').get(authorize,getAllUsers);
Router.route('/auth/login').post(login);
Router.route('/send-friend-request/:id').post(authorize,sendFriendRequest);
Router.route('/accept-friend-request/:id').post(authorize,acceptFriendRequest);
Router.route('/block-user/:id').post(authorize,blockUser);
Router.route('/auth/register').post(upload.single('profilePic'),register);
Router.route('/:id').patch(authorize,upload.single('profilePic'),updateUser).delete(authorize,deleteUser).get(getSingleUser);
export default Router