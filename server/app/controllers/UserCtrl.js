import bcrypt from 'bcrypt-nodejs';
import * as jwt from 'jsonwebtoken';
import Cryptr from 'cryptr';

import * as auth from '../helpers/AuthHelper';
import db from '../models/index';
import reply from './../helpers/ResponseSender';
import * as helper from './../helpers/ControllerHelper';

const secret = process.env.SECRET || 'secret';
const encryptionKey = process.env.ENCRYPT_KEY || '{|-_-|}';
const cryptr = new Cryptr(encryptionKey);

const encrypt = cryptr.encrypt;
const random = Math.random;

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
const userLogin = (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  if ((!username && !email) || !password) {
    return reply.messageBadRequest(res, 'supply all necessary fields');
  }
  db.Users.findOne({
    where: {
      $or: {
        username, email
      }
    }
  }).then((user) => {
    if (!user) {
      return reply.messageAuthorizedAccess(res, 'no such user');
    }
    if (bcrypt.compareSync(req.body.password, user.password)) {
      const randomValue = encrypt(random() * 300);
      const randomValue2 = encrypt(random() * 101);
      const userData = {
        [encrypt(user.id)]: randomValue,
        [encrypt(user.role)]: randomValue2
      };
      const token = jwt.sign(userData, secret, {
        expiresIn: '14 days'
      });
      return reply.messageOkSendData(res, {
        email: user.email,
        token
      });
    }
    reply.messageAuthorizedAccess(res);
  });
};
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
      res.status(200).json({
        success: true,
        message: 'You have been logged out successfully'
      }))
    .catch(() => {
      reply.messageServerError(res, 'cannot process request');
    });
};

/**
 * createUser
 * Create a new user
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const createUser = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  if (!username || !password || !email || !firstname || !lastname) {
    return reply.messageBadRequest(res, 'supply all necessary field');
  }
  db.Users
    .findOne({
      where: {
        $or: {
          email, username
        }
      }
    })
    .then((data) => {
      if (data) {
        return res.status(409).json({
          success: false,
          message: 'user with email or username exist'
        });
      }
      return db.Users
        .create({
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          firstname: req.body.firstname,
          lastname: req.body.lastname
        })
        .then((user) => {
          const randomValue = encrypt(random() * 300);
          const randomValue2 = encrypt(random() * 101);
          const userData = {
            [encrypt(user.id)]: randomValue,
            [encrypt(user.role)]: randomValue2
          };
          const token = jwt.sign(userData, secret, {
            expiresIn: '14 days'
          });
          return reply.messageContentCreated(res, 'user account created', {
            email: user.email,
            token
          });
        }).catch(() => {
          reply.messageServerError(res, 'unable to process request');
        });
    });
};

/**
 * getUsers
 * Fetch and return all users
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const getUsers = (req, res) => {
  if (helper.isBadPageQuery(helper.getPageQueries(req))) {
    return reply.messageBadRequest(res, 'check page queries');
  }
  const pageData = helper.getPageData(req, res);
  const limit = pageData.limit;
  const offset = pageData.offset;
  const order = pageData.order;

  const query = auth.userIsAdmin(req.user.role) ? { limit, offset, order } :
    { limit, offset, order, attributes: ['id', 'username', 'firstname', 'lastname'] };
  return db.Users.findAndCountAll(query)
    .then((result) => {
      const metaData = helper.getPageMetaData(req, result, offset, limit);
      result.currentPage = metaData.currentPage;
      result.totalPages = metaData.numberOfPages;
      reply.messageOkSendData(res, result);
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
  if (helper.idIsBad(dataId)) {
    return reply.messageBadRequest(res, 'invalid id');
  }
  const query = auth.userIsAdmin(req.user.role) ? { where: { id: dataId } } : {
    attributes: ['id', 'username', 'firstname', 'lastname'],
    where: {
      id: dataId
    }
  };
  return db.Users
    .findOne(query)
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
  if (helper.idIsBad(dataId)) {
    return reply.messageBadRequest(res, 'invalid id');
  }
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
  if (helper.idIsBad(dataId)) {
    return reply.messageBadRequest(res, 'invalid id');
  }
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
  if (helper.isBadPageQuery(helper.getPageQueries(req))) {
    return reply.messageBadRequest(res, 'check page queries');
  }
  const pageData = helper.getPageData(req, res);
  const limit = pageData.limit;
  const offset = pageData.offset;
  const order = pageData.order;

  const userId = req.user.userId;
  const requestId = req.params.id;
  if (helper.idIsBad(requestId)) {
    return reply.messageBadRequest(res, 'invalid id');
  }
  const query = String(userId) === String(requestId)
    || auth.userIsAdmin(req.user.role) ? {
      limit,
      offset,
      order,
      where: {
        owner: requestId
      }
    } : {
      limit,
      offset,
      order,
      where: {
        owner: requestId,
        $and: {
          access: 'public'
        }
      }
    };

  return db.Documents
    .findAndCountAll(query)
    .then((result) => {
      if (result.count) {
        const metaData = helper.getPageMetaData(req, result, offset, limit);
        result.currentPage = metaData.currentPage;
        result.totalPages = metaData.numberOfPages;
        return reply.messageOkSendData(res, result);
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
  if (helper.isBadPageQuery(helper.getPageQueries(req))) {
    return reply.messageBadRequest(res, 'check page queries');
  }
  let searchTerm;
  const pageData = helper.getPageData(req, res);
  const limit = pageData.limit;
  const offset = pageData.offset;
  const order = '"firstname"';

  if (req.query.query) {
    searchTerm = helper.cleanSearchTerm(req.query.query);
  } else {
    return reply.messageBadRequest(res, 'include a search term');
  }
  const userSearchQuery = auth.userIsAdmin(req.user.role) ? {
    limit,
    offset,
    order,
    where: {
      $or: {
        firstname: {
          $ilike: `%${searchTerm}%`
        },
        username: {
          $ilike: `%${searchTerm}%`
        }
      }
    }
  } : {
    limit,
    offset,
    order,
    attributes: ['firstname', 'lastname', 'username'],
    where: {
      $or: {
        firstname: {
          $ilike: `%${searchTerm}%`
        },
        username: {
          $ilike: `%${searchTerm}%`
        }
      }
    }
  };
  return db.Users
    .findAndCountAll(userSearchQuery)
    .then((result) => {
      if (result.count) {
        const metaData = helper.getPageMetaData(req, result, offset, limit);
        result.currentPage = metaData.currentPage;
        result.totalPages = metaData.numberOfPages;
        return reply.messageOkSendData(res, result);
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
