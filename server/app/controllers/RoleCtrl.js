import db from '../models/index';
import * as auth from '../helpers/AuthHelper';
import reply from './../helpers/ResponseSender';
import * as helper from './../helpers/ControllerHelper';

/**
 * createRole
 * Create a new role
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const createRole = (req, res) => {
  if (auth.userIsAdmin(req.user.role)) {
    if (!req.body.title) {
      return reply.messageBadRequest(res, 'supply role title');
    }
    return db.Roles
      .create({
        title: req.body.title
      })
      .then((data) => {
        reply.messageContentCreated(res, 'new role created', data);
      });
  }
  return reply.messageAuthorizedAccess(res);
};

/**
 * updateRoleById
 * Update a specific role
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const updateRoleById = (req, res) => {
  if (auth.userIsAdmin(req.user.role)) {
    req.body.id = undefined;
    if (!req.body.title) {
      return reply.messageBadRequest(res, 'supply role title');
    }
    return db.Roles
      .findById(req.params.id)
      .then((data) => {
        if (!data) {
          return reply.messageNotFound(res, 'invalid role id');
        }
        data.update(req.body)
          .then(() => {
            reply.messageOkSendData(res, data);
          });
      });
  }
  return reply.messageAuthorizedAccess(res);
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
    return db.Roles
      .findById(req.params.id)
      .then((data) => {
        if (!data) {
          return reply.messageNotFound(res, 'invalid role id');
        }
        data.destroy()
          .then(() => {
            reply.messageDeleteSuccess(res, 'role deleted');
          });
      })
      .catch(() => {
        reply.messageServerError(res, 'unable to process your request');
      });
  }
  return reply.messageAuthorizedAccess(res);
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
    return db.Roles
      .findAll()
      .then((data) => {
        reply.messageOkSendData(res, data);
      });
  }
  return reply.messageAuthorizedAccess(res);
};

/**
 * getRolesById
 * Fetch and return a specified role
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
/**
 * findUserById
 * Fetch and return a specific user's data
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const getRoleById = (req, res) => {
  const dataId = req.params.id;
  if (helper.idIsBad(dataId)) {
    return reply.messageBadRequest(res, 'invalid id');
  }
  if (!auth.userIsAdmin(req.user.role)) {
    return reply.messageAuthorizedAccess(res);
  }
  return db.Roles
    .findById(dataId)
    .then((data) => {
      if (!data) {
        return reply.messageNotFound(res, 'role does not exist');
      }
      reply.messageOkSendData(res, data);
    });
};


export {
  createRole,
  updateRoleById,
  deleteRoleById,
  getAllRoles,
  getRoleById
};
