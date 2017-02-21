import express from 'express';
import authenticate from './../../app/middlewares/authenticate';
import * as roleCtrl from './../../app/controllers/roleCtrl';


const roleRoutes = express.Router();

roleRoutes.route('/')
  .post(authenticate, roleCtrl.createRole)
  .get(authenticate, roleCtrl.getAllRoles);

roleRoutes.route('/:id')
  .delete(authenticate, roleCtrl.deleteRoleById);


export default roleRoutes;
