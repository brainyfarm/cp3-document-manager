import db from '../models/index';
import * as auth from '../helpers/AuthHelper';

const createRole = (req, res) => {
  if (auth.userIsAdmin(req.user.role)) {
    db.Role
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

const deleteRoleById = (req, res) => {
  if (auth.userIsAdmin(req.user.role)) {
    db.Role
    .findById(req.params.id)
      .then((data) => {
        if (data) {
          data.destroy()
            .then(() =>
              res.status(201).send({
                message: 'Role deleted'
              }));
        }
      });
  } else {
    return res.status(403).json({
      message: 'unauthorized access'
    });
  }
};

const getAllRoles = (req, res) => {
  if (auth.userIsAdmin(req.user.role)) {
    db.Role
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
