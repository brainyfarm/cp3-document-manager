import bcrypt from 'bcrypt-nodejs';
import * as jwt from 'jsonwebtoken';

import * as auth from '../helpers/AuthHelper';
import db from '../models/index';

/**
 * userLogin
 * Login a user
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const userLogin = (req, res) => {
  db.Users.findOne({
    where: {
      $or: {
        username: req.body.username, email: req.body.email
      }
    }
  }).then((user) => {
    if (!user) {
      return res.status(403).send({
        message: 'User does not exist'
      });
    }
    if (bcrypt.compareSync(req.body.password, user.password)) {
      const token = jwt.sign(user.get({ plain: true }), 'secret', {
        expiresIn: '14 days'
      });
      return res.status(200).json({
        success: true,
        message: 'Login Successful',
        email: user.email,
        userId: user.id,
        token
      });
    }
    return res.status(401).send({
      message: 'unauthorized access'
    });
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
  db.Users
    .create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname
    })
    .then((user) => {
      const token = jwt.sign(user.get({ plain: true }), 'secret', {
        expiresIn: '14 days'
      });
      return res.status(201).json({
        success: true,
        message: 'User account created',
        email: user.email,
        roleId: user.role,
        token
      });
    }).catch(error =>
      res.status(500).json({
        success: false,
        error: error.message
      })
    );
};

/**
 * getUsers
 * Fetch and return all users
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const getUsers = (req, res) => {
  if (!auth.userIsAdmin(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'unauthorized access'
    });
  }
  db.Users.findAll()
    .then((data) => {
      if (data.length) {
        res.status(200).json(data);
      }
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: error.message
      });
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
    return res.status(403).send({
      message: 'You have no permission to view'
    });
  }
  db.Users
    .findById(dataId)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: 'User not found'
        });
      }
      return res.status(200).json({
        username: data.username,
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        joined: data.createdAt
      });
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
    return res.status(403).json({
      success: false,
      message: 'unauthorized access'
    });
  }
  db.Users.findById(dataId)
    .then((data) => {
      if (!data) {
        res.status(404).json({
          success: false,
          message: 'not found'
        });
      }
      data.update({
        username: req.body.username || data.username,
        password: req.body.password || data.password,
        email: req.body.email || data.email,
        firstname: req.body.firstname || data.firstname,
        lastname: req.body.lastname || data.lastname
      })
        .then((result) => {
          if (!result) {
            res.status(400).json({
              success: false,
              message: 'Unable to modify'
            });
          }
          return res.status(201).json(
            data
          );
        })
        .catch((error) => {
          res.status(400).json({
            success: false,
            message: error
          });
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
    return res.status(401).json({
      success: false,
      message: 'unauthorized access'
    });
  }
  db.Users.findById(dataId)
    .then((data) => {
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'not found'
        });
      }
      data.destroy()
        .then(() => {
          res.status(201).json({
            success: true,
            message: 'User account has been deleted'
          });
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
    db.Document
      .findAll(query)
      .then((data) => {
        if (data.length) {
          return res.status(200).json(data);
        }
        res.status(404).json('no document');
      });
  } else {
    db.Document
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
          res.status(200).json(data);
        } else {
          return res.status(404).json({
            success: false,
            message: 'no data'
          });
        }
      });
  }
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
    return res.status(403).json({
      success: false,
      message: 'unauthorized access'
    });
  }
  db.Users
    .findAll(userSearchQuery)
    .then((searchResult) => {
      if (searchResult.length) {
        return res.status(200).json({
          success: true,
          searchResult
        });
      }
      return res.status(404).json({
        success: true,
        searchResult: null
      });
    })
    .catch(error =>
      res.status(500).json({
        success: false,
        error: error.message
      })
    );
};

export {
  userLogin,
  createUser,
  getUsers,
  findUserById,
  updateUserData,
  deleteUser,
  searchUsers,
  getUserDocumentById
};
