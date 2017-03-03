import db from '../models/index';
import * as auth from '../helpers/AuthHelper';
import reply from './../helpers/ResponseSender';

/**
 * createDocument
 * Create a new document
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const createDocument = (req, res) =>
  db.Documents
    .create({
      title: req.body.title,
      content: req.body.content,
      owner: req.user.userId,
      access: req.body.access || 'public'
    })
    .then((data) => {
      reply.messageContentCreated(res, 'document created', data);
    })
    .catch((error) => {
      reply.messageServerError(res, 'unable to process request', error);
    });

/**
 * getDocuments
 * Fetch and return all documents in the database
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const getDocuments = (req, res) => {
  if (!auth.userIsAdmin(req.user.role)) {
    return reply.messageAuthorizedAccess(res);
  }
  return db.Documents
    .findAll()
    .then((data) => {
      if (data.length) {
        return reply.messageOkSendData(res, data);
      }
      reply.messageNotFound(res, 'no documents');
    })
    .catch((error) => {
      reply.messageServerError(res, 'unable to process request', error);
    });
};

/**
 * findDocumentById
 * Find a document by specifying the id as a parameter
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const findDocumentById = (req, res) => {
  const requestedDocumentId = String(req.params.id);
  return db.Documents
    .findById(requestedDocumentId)
    .then((data) => {
      if (data) {
        if (auth.userIsAdmin(req.user.role)
          || String(data.owner) === String(req.user.userId)
          || data.access === 'public') {
          reply.messageOkSendData(res, data);
        } else {
          return reply.messageAuthorizedAccess(res);
        }
      } else {
        reply.messageNotFound(res, 'document does not exist');
      }
    })
    .catch((error) => {
      reply.messageServerError(res, 'unable to process request', error);
    });
};

/**
 * updateDocumentById
 * Update content of a specific document
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const updateDocumentById = (req, res) => {
  const requestedDocumentId = String(req.params.id);
  return db.Documents
    .findById(requestedDocumentId)
    .then((data) => {
      if (!data) {
        return reply.messageNotFound(res, 'document does not exist');
      }
      if (String(data.owner) === String(req.user.userId) ||
      auth.userIsAdmin(req.user.role)) {
        req.body.id = undefined;
        return data.update(req.body)
          .then((response) => {
            reply.messageOkSendData(res, response);
          });
      }
      reply.messageAuthorizedAccess(res);
    })
    .catch((error) => {
      reply.messageServerError(res, 'unable to process request', error);
    });
};

/**
 * deleteDocumentById
 * Delete a specific document
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const deleteDocumentById = (req, res) => {
  const requestedDocumentId = String(req.params.id);
  return db.Documents
    .findById(requestedDocumentId)
    .then((data) => {
      if (!data) {
        return reply.messageNotFound(res, 'document does not exist');
      }
      if (String(data.owner) === String(req.user.userId) || auth.userIsAdmin(req.user.role)) {
        return data.destroy()
          .then(() => {
            reply.messageDeleteSuccess(res, 'document deleted');
          });
      }
      reply.messageAuthorizedAccess(res);
    })
    .catch((error) => {
      reply.messageServerError(res, 'unable to process request', error);
    });
};

/**
 * searchDocument
 * Search for documents by keyword
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const searchDocument = (req, res) => {
  const searchTerm = req.params.searchterm;
  const documentSearchQuery = auth.userIsAdmin(req.user.role) ?
  {
    where: {
      $or: {
        title: {
          $iLike: `%${searchTerm}%`
        },
        content: {
          $iLike: `%${searchTerm}%`
        }
      }
    }
  } : {
    where: {
      $and: {
        $or: {
          owner: String(req.user.userId),
          access: 'public'
        },
        $and: {
          $or: {
            title: {
              $iLike: `%${searchTerm}%`
            },
            content: {
              $iLike: `%${searchTerm}%`
            }
          }
        }
      }
    }
  };
  return db.Documents
    .findAll(documentSearchQuery)
    .then((searchResult) => {
      if (searchResult.length) {
        return reply.messageOkSendData(res, searchResult);
      }
      reply.messageNotFound(res, `no documents matching ${searchTerm}`);
    })
    .catch((error) => {
      reply.messageServerError(res, 'unable to process request', error);
    });
};
export {
  createDocument,
  getDocuments,
  findDocumentById,
  updateDocumentById,
  deleteDocumentById,
  searchDocument
};
