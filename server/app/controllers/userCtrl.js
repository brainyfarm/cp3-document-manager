import bcrypt from 'bcrypt-nodejs';
import * as jwt from 'jsonwebtoken';

import * as auth from '../helpers/auth-helper';
import db from '../models/index';


const userLogin = (req, res) => {
  db.User.findOne({
    where: {
      username: req.body.username
    }
  }).then((user) => {
    if (!user) {
      return res.status(400).send({
        message: 'User does not exist'
      });
    }
    if (bcrypt.compareSync(req.body.password, user.password)) {
      const token = jwt.sign(user.get({ plain: true }), 'secret', {
        expiresIn: '4 days'
      });
      return res.status(200).send(token);
    }
    return res.status(502).send({
      message: 'unauthorized access'
    });
  })
    .catch((error) => {
      return res.status(400).send(error.message);
    });
};

const userLogout = (req, res) => {
  // user Logout action
};

const createUser = (req, res) => {
  db.User
    .create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname
    })
    .then((user) => {
      const token = jwt.sign(user.get({ plain: true }), 'secret', {
        expiresIn: '4 days'
      });
      return res.status(201).send({
        message: 'User account created',
        token
      });
    })
    .catch(error =>
      res.status(400).send({ message: error })
    );
};

const getUsers = (req, res) => {
  if (!auth.userIsAdmin(req.user.role)) {
    return res.status(502).send({
      message: 'unauthorized access'
    });
  }
  db.User.findAll()
    .then((data) => {
      return res.status(200).send(data);
    })
    .catch((error) => {
      res.status(404).send({
        message: error
      });
    });
};

const findUserById = (req, res) => {
  const dataId = req.params.id;
  if (!auth.userHasPermission(req.user, dataId)) {
    return res.status(502).send({
      message: 'You have no permission to view'
    });
  }
  db.User
    .findById(dataId)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: 'User not found'
        });
      }
      res.status(200).send({
        username: data.username,
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        joined: data.createdAt
      });
    })
    .catch((error) => {
      res.status(400).send({ message: error });
    });
};

const updateUserData = (req, res) => {
  const dataId = req.params.id;
  if (!auth.userHasPermission(req.user, dataId)) {
    return res.status(502).send({
      message: 'You have no permission to edit'
    });
  }
  db.User.findById(dataId)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: 'User not found'
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
            res.status(400).send({
              message: 'Unable to modify'
            });
          }
          res.status(201).send(
            data
          );
        })
        .catch((error) => {
          res.status(400).send(
            {
              message: error
            }
          );
        });
    })
    .catch((error) => {
      res.status(400).send({
        message: error
      });
    });
};

const deleteUser = (req, res) => {
  const dataId = req.params.id;
  if (!auth.userHasPermission(req.user, dataId)) {
    return res.status(502).send({
      message: 'unauthorized access'
    });
  }
  db.User.findById(dataId)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: 'User does not exist'
        });
      }
      data.destroy()
        .then(() => {
          res.status(201).send({
            message: 'User account has been deleted'
          });
        })
        .catch((error) => {
          res.status(400).send({
            message: error
          });
        });
    });
};

const getUserDocumentById = (req, res) => {
  const userId = req.user.userId;
  const requestId = req.params.id;
  const query = {
    where: {
      owner: requestId
    }
  };
  if (userId == String(requestId) || auth.userIsAdmin(req.user.role)) {
    db.Document
      .findAll(query)
      .then((data) => {
        return res.status(200).send(data);
      })
      .catch((error) => {
        return res.status(400).send({
          message: error.message
        });
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
          res.status(200).send(data);
        } else {
          return res.status(404).send({
            message: 'No data found'
          });
        }
      })
      .catch((error) => {
        return res.status(400).send({
          message: error.message
        });
      });
  }
};

export {
  userLogin,
  userLogout,
  createUser,
  getUsers,
  findUserById,
  updateUserData,
  deleteUser,
  getUserDocumentById
};
