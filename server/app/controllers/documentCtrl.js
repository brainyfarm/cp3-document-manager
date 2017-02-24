import db from '../models/index';
import * as auth from '../helpers/AuthHelper';

const createDocument = (req, res) => {
  db.Document
    .create({
      title: req.body.title,
      content: req.body.content,
      owner: req.user.userId,
      access: req.body.access || 'public'
    })
    .then(document => res.status(201).json({ message: 'Document Created', document }))
    .catch(error => res.status(500).json({ message: 'Error Creating Document', error }));
};

const getDocuments = (req, res) => {
  if (!auth.userIsAdmin(req.user.role)) {
    return res.status(401).send({
      message: 'unauthorized access'
    });
  }
  db.Document
    .findAll()
    .then((data) => {
      if (data.length) {
        return res.status(200).send(data);
      }
      return res.status(404).send({
        message: 'Unable to fetch document'
      });
    })
    .catch((error) => {
      res.status(400).send({
        message: error
      });
    });
};

const findDocumentById = (req, res) => {
  const requestedDocumentId = String(req.params.id);
  db.Document
    .findById(requestedDocumentId)
    .then((data) => {
      if (data) {
        if (auth.userIsAdmin(req.user.role)
          || data.owner === String(req.user.userId)
          || data.access === 'public') {
          res.status(200).send(data);
        } else {
          return res.status(401).send({
            message: 'unauthorized access'
          });
        }
      } else {
        res.status(404).send({
          message: 'Document does not exist'
        });
      }
    })
    .catch((error) => {
      res.status(400).send({
        message: error.message
      });
    });
};

const updateDocumentById = (req, res) => {
  const requestedDocumentId = String(req.params.id);
  db.Document
    .findById(requestedDocumentId)
    .then((data) => {
      if (data.owner === String(req.user.userId) || auth.userIsAdmin(req.user.role)) {
        data.update({
          title: req.body.title || data.title,
          content: req.body.content || data.content,
          access: req.body.access || data.access
        })
          .then((response) => {
            res.status(201).send(response);
          })
          .catch((error) => {
            res.status(400).send({
              message: error.message
            });
          });
      } else {
        res.status(401).send({
          message: 'unauthorized access'
        });
      }
    })
    .catch(error =>
      res.send({
        message: error.message
      }));
};

const deleteDocumentById = (req, res) => {
  const requestedDocumentId = String(req.params.id);
  db.Document
    .findById(requestedDocumentId)
    .then((data) => {
      if (data.owner === String(req.user.userId) || auth.userIsAdmin(req.user.role)) {
        data.destroy()
          .then(() => {
            res.status(201).send({
              message: 'Document has been deleted'
            });
          })
          .catch((error) => {
            res.status(400).send({
              message: error.message
            });
          });
      } else {
        res.status(401).send({
          message: 'unauthorized access'
        });
      }
    })
    .catch(error =>
      res.send({
        message: error.message
      }));
};

export {
  createDocument,
  getDocuments,
  findDocumentById,
  updateDocumentById,
  deleteDocumentById
};
