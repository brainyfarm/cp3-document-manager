import db from '../models/index';
import * as auth from '../helpers/auth-helper';

const createRole = (req, res) => {
  if (auth.userIsAdmin(req.user.role)) {
    db.Role
      .create({
        title: req.body.title
      })
        .then((data) => {
          res.status(201).send(data);
        })
        .catch((error) => {
          res.status(400).send({
            message: error.message
          });
        });
  } else {
    return res.send({
      message: 'unauthorized access'
    });
  }
};

const deleteRoleById = (req, res) => {
  if (auth.userIsAdmin(req.user.role)) {
    db.Role
    .findById(req.params.id)
      .then((data) => {
        if (data) {
          data.destroy()
            .then((response) => {
              return res.status(201).send({
                message: 'Role deleted'
              })
            .catch((error) => {
              return res.status(400).send({
                message: error.message
              });
            });
            });
        }
      });
  } else {
    return res.send({
      message: 'unauthorized access'
    });
  }
};

const getAllRoles = (req, res) => {
  if (auth.userIsAdmin(req.user.role)) {
    db.Role
      .findAll()
        .then((data) => {
          return res.status(200).send(data);
        });
  } else {
    return res.send({
      message: 'unauthorized access'
    });
  }
};


export {
  createRole,
  deleteRoleById,
  getAllRoles
};
