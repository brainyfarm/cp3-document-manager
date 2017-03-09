import express from 'express';
import authenticate from './../../app/middlewares/Authenticate';
import * as roleCtrl from './../../app/controllers/RoleCtrl';


const roleRoutes = express.Router();

roleRoutes.route('/')
  .post(authenticate, roleCtrl.createRole)
  .get(authenticate, roleCtrl.getAllRoles);

roleRoutes.route('/:id')
  .delete(authenticate, roleCtrl.deleteRoleById)
  .put(authenticate, roleCtrl.updateRoleById);


export default roleRoutes;

