import db from '../models/index';
import * as auth from '../helpers/AuthHelper';

/**
 * createRole
 * Create a new role
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const createRole = (req, res) => {
  if (auth.userIsAdmin(req.user.role)) {
    db.Roles
      .create({
        title: req.body.title
      })
      .then((data) => {
        res.status(201).send(data);
      });
  } else {
    return res.status(403).send({
      message: 'unauthorized access'
    });
  }
};

/**
 * deleteRoleById
 * Delete a specific role
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const deleteRoleById = (req, res) => {
  if (auth.userIsAdmin(req.user.role)) {
    db.Roles
      .findById(req.params.id)
      .then((data) => {
        data.destroy()
          .then(() =>
            res.status(201).send({
              message: 'Role deleted'
            }));
      });
  } else {
    return res.status(403).json({
      message: 'unauthorized access'
    });
  }
};

/**
 * getAllRoles
 * Fetch and return all available roles
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const getAllRoles = (req, res) => {
  if (auth.userIsAdmin(req.user.role)) {
    db.Roles
      .findAll()
      .then(data =>
        res.status(200).send(data));
  } else {
    return res.status(403).send({
      message: 'unauthorized access'
    });
  }
};


export {
  createRole,
  deleteRoleById,
  getAllRoles
};
