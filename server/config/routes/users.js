import express from 'express';
import * as userCtrl from './../../app/controllers/UserCtrl';
import authenticate from './../../app/middlewares/Authenticate';

const userRoutes = express.Router();

userRoutes.route('/')
  .post(userCtrl.createUser)
  .get(authenticate, userCtrl.getUsers);

userRoutes.route('/:id')
  .get(authenticate, userCtrl.findUserById)
  .put(authenticate, userCtrl.updateUserData)
  .delete(authenticate, userCtrl.deleteUser);

userRoutes.route('/:id/documents')
  .get(authenticate, userCtrl.getUserDocumentById);

userRoutes.route('/search/:searchTerm')
  .get(authenticate, userCtrl.searchUsers);

userRoutes.route('/login')
  .post(userCtrl.userLogin);

export default userRoutes;
