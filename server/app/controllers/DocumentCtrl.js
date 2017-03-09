import db from '../models/index';
import * as auth from '../helpers/AuthHelper';
import reply from './../helpers/ResponseSender';
import * as helper from './../helpers/ControllerHelper';

/**
 * createDocument
 * Create a new document
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const createDocument = (req, res) => {
  const title = req.body.title;
  const content = req.body.content;

  if (!title || !content) {
    return reply.messageBadRequest(res, 'ensure you supply title and content');
  }
  db.Documents
    .findOne({
      where: {
        title
      }
    })
    .then((response) => {
      if (response) {
        return res.status(409).json({
          success: false,
          message: 'a document with this title exists'
        });
      }
      db.Documents
        .create({
          title,
          content,
          owner: req.user.userId,
          access: req.body.access || 'public'
        })
        .then((data) => {
          reply.messageContentCreated(res, 'document created', data);
        })
        .catch(() => {
          reply.messageServerError(res, 'unable to process request');
        });
    });
};
/**
 * getDocuments
 * Fetch and return all documents in the database
 * @param {Object} req The Request object
 * @param {Object} res The Response from the server
 * @return {undefined}
 */
const getDocuments = (req, res) => {
  if (helper.isBadPageQuery(helper.getPageQueries(req))) {
    return reply.messageBadRequest(res, 'check page queries');
  }
  const pageData = helper.getPageData(req, res);
  const limit = pageData.limit;
  const offset = pageData.offset;
  const order = pageData.order;

  const documentSearchQuery = auth.userIsAdmin(req.user.role) ?
    { limit, offset, order } : {
      limit,
      offset,
      order,
      where: {
        $or: {
          owner: String(req.user.userId), access: 'public'
        }
      }
    };
  return db.Documents
    .findAndCountAll(documentSearchQuery)
    .then((result) => {
      if (result.count) {
        const metaData = helper.getPageMetaData(req, result, offset, limit);
        result.currentPage = metaData.currentPage;
        result.totalPages = metaData.numberOfPages;
        return reply.messageOkSendData(res, result);
      }
      reply.messageNotFound(res, 'no documents');
    })
    .catch(() => {
      reply.messageServerError(res, 'unable to process request');
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
    .catch(() => {
      reply.messageServerError(res, 'unable to process request');
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
        if (!req.body.title && !req.body.content && !req.body.access) {
          return reply.messageBadRequest(res, 'specify title, content or access');
        }
        return data.update(req.body)
          .then((response) => {
            reply.messageOkSendData(res, response);
          });
      }
      reply.messageAuthorizedAccess(res);
    })
    .catch(() => {
      reply.messageServerError(res, 'unable to process request');
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
  if (helper.isBadPageQuery(helper.getPageQueries(req))) {
    return reply.messageBadRequest(res, 'check page queries');
  }
  const pageData = helper.getPageData(req, res);
  const limit = pageData.limit;
  const offset = pageData.offset;

  let searchTerm;
  if (req.query.query) {
    searchTerm = req.query.query.replace(/[^a-z0-9]/gi, '');
  } else {
    return reply.messageBadRequest(res, 'include a search term');
  }
  const documentSearchQuery = auth.userIsAdmin(req.user.role) ?
    {
      limit,
      offset,
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
      limit,
      offset,
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
    .findAndCountAll(documentSearchQuery)
    .then((result) => {
      if (result.count) {
        const metaData = helper.getPageMetaData(req, result, offset, limit);
        result.currentPage = metaData.currentPage;
        result.totalPages = metaData.numberOfPages;
        return reply.messageOkSendData(res, result);
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
