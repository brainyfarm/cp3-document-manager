import express from 'express';
import * as userCtrl from './../../app/controllers/userCtrl';
import authenticate from './../../app/middlewares/authenticate';

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

userRoutes.route('/login')
  .post(userCtrl.userLogin)
  .get((req, res) => {
    res.status(200).send('It works');
  });

export default userRoutes;
