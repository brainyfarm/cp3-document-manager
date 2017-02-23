import express from 'express';
import * as documentCtrl from './../../app/controllers/DocumentCtrl';
import authenticate from './../../app/middlewares/Authenticate';

const documentRoutes = express.Router();

documentRoutes.route('/')
  .post(authenticate, documentCtrl.createDocument)
  .get(authenticate, documentCtrl.getDocuments);

documentRoutes.route('/:id')
  .get(authenticate, documentCtrl.findDocumentById)
  .put(authenticate, documentCtrl.updateDocumentById)
  .delete(authenticate, documentCtrl.deleteDocumentById);

export default documentRoutes;
