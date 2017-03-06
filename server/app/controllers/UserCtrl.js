import bcrypt from 'bcrypt-nodejs';
import * as jwt from 'jsonwebtoken';

import * as auth from '../helpers/AuthHelper';
import db from '../models/index';
import reply from './../helpers/ResponseSender';

const secret = process.env.SECRET || 'secret';

/**
 * welcome
 * Display a welcome message
 * @param {Object} req The request object
 * @param {Object} res The response from the server
 * @return {undefined}
 */
const welcome = (req, res) => {
  res.status(200).json({
    message: 'Epic Document Manager API',
    apiDocumentation: 'https://github.com/andela-oakinseye/cp3-document-manager',
    postmanCollection: 'https://www.getpostman.com/collections/461ad21b114af8ccd66c'
  });
};

/**
 * userLogin
 * Login a user
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const userLogin = (req, res) =>
  db.Users.findOne({
    where: {
      $or: {
        username: req.body.username, email: req.body.email
      }
    }
  }).then((user) => {
    if (!user) {
      return reply.messageAuthorizedAccess(res, 'no such user');
    }
    if (bcrypt.compareSync(req.body.password, user.password)) {
      const token = jwt.sign(user.get({ plain: true }), 'secret', {
        expiresIn: '14 days'
      });
      return reply.messageOkSendData(res, {
        email: user.email,
        userId: user.id,
        token
      });
    }
    reply.messageAuthorizedAccess(res);
  });

/**
 * userLogout
 * Blacklist an authentication token
 * @param {Object} req The Request Object
 * @param {Object} res The Response Object
 * @return {undefined}
 */
const userLogout = (req, res) => {
  const token = req.headers['access-token'] || req.body.token || req.params.token;
  if (!token) {
    return reply.messageTokenIssue(res, 'you are not logged in');
  }
  return db.Blacklists
    .create({
      token
    })
    .then(() =>
      res.status(200).send({
        success: true,
        message: 'You have been logged out successfully'
      }))
    .catch((error) => {
      reply.messageServerError(res, 'cannot process request', error);
    });
};

/**
 * createUser
 * Create a new user
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const createUser = (req, res) =>
  db.Users
    .create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname
    })
    .then((user) => {
      const token = jwt.sign(user.get({ plain: true }), secret, {
        expiresIn: '14 days'
      });
      return reply.messageContentCreated(res, 'user account created', {
        email: user.email,
        roleId: user.role,
        token
      });
    }).catch((error) => {
      reply.messageServerError(res, 'unable to process request', error);
    });

/**
 * getUsers
 * Fetch and return all users
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const getUsers = (req, res) => {
  if (!auth.userIsAdmin(req.user.role)) {
    return reply.messageAuthorizedAccess(res);
  }
  return db.Users.findAll()
    .then((data) => {
      if (data.length) {
        return reply.messageOkSendData(res, data);
      }
    })
    .catch((error) => {
      reply.messageServerError(res, 'unable to process request', error);
    });
};

/**
 * findUserById
 * Fetch and return a specific user's data
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const findUserById = (req, res) => {
  const dataId = req.params.id;
  if (!auth.userHasPermission(req.user, dataId)) {
    return reply.messageAuthorizedAccess(res, 'no permission to view');
  }
  return db.Users
    .findById(dataId)
    .then((data) => {
      if (!data) {
        return reply.messageNotFound(res, 'user not found');
      }
      reply.messageOkSendData(res, data);
    });
};

/**
 * updateUserData
 * update a specified user's data
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const updateUserData = (req, res) => {
  const dataId = req.params.id;
  if (!auth.userHasPermission(req.user, dataId)) {
    return reply.messageAuthorizedAccess(res);
  }
  return db.Users.findById(dataId)
    .then((data) => {
      if (!data) {
        return reply.messageNotFound(res, 'user not found');
      }
      req.body.id = undefined;
      return data.update(req.body)
        .then((result) => {
          reply.messageOkSendData(res, result);
        })
        .catch((error) => {
          reply.messageServerError(res, 'unable to process request', error);
        });
    });
};

/**
 * deleteUser
 * Fetch and delete a user's account
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const deleteUser = (req, res) => {
  const dataId = req.params.id;
  if (!auth.userHasPermission(req.user, dataId)) {
    return reply.messageAuthorizedAccess(res);
  }
  return db.Users.findById(dataId)
    .then((data) => {
      if (!data) {
        return reply.messageNotFound(res, 'user not found');
      }
      return data.destroy()
        .then(() => {
          reply.messageDeleteSuccess(res, 'user account deleted');
        });
    });
};

/**
 * getUserDocumentById
 * Fetch and return all a specified user's documents
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const getUserDocumentById = (req, res) => {
  const userId = req.user.userId;
  const requestId = req.params.id;
  const query = {
    where: {
      owner: requestId
    }
  };
  if (String(userId) === String(requestId)
    || auth.userIsAdmin(req.user.role)) {
    return db.Documents
      .findAll(query)
      .then((data) => {
        if (data.length) {
          return reply.messageOkSendData(res, data);
        }
        reply.messageNotFound(res, 'user has no document');
      });
  }
  return db.Documents
    .findAll({
      where: {
        owner: requestId,
        $and: {
          access: 'public'
        }
      }
    })
    .then((data) => {
      if (data.length) {
        return reply.messageOkSendData(res, data);
      }
      reply.messageNotFound(res, 'user has no document');
    });
};

/**
 * searchUsers
 * Search for users by keyword
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const searchUsers = (req, res) => {
  const searchTerm = req.params.searchTerm;
  const userSearchQuery = {
    where: {
      $or: {
        lastname: {
          $ilike: `%${searchTerm}%`
        },
        firstname: {
          $ilike: `%${searchTerm}%`
        },
        username: {
          $ilike: `%${searchTerm}%`
        }
      }
    }
  };
  if (!auth.userIsAdmin(req.user.role)) {
    return reply.messageAuthorizedAccess(res);
  }
  return db.Users
    .findAll(userSearchQuery)
    .then((searchResult) => {
      if (searchResult.length) {
        return reply.messageOkSendData(res, searchResult);
      }
      reply.messageNotFound(res, `no result found for ${searchTerm}`);
    })
    .catch((error) => {
      reply.messageServerError(res, 'unable to process request', error);
    });
};

export {
  welcome,
  userLogin,
  userLogout,
  createUser,
  getUsers,
  findUserById,
  updateUserData,
  deleteUser,
  searchUsers,
  getUserDocumentById
};
