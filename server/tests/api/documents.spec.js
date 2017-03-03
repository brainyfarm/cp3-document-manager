import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
import { sampleUserData, defaultPassword } from '../TestHelper';

const requester = request.agent(app);
const expect = chai.expect;

describe('Document Route', () => {
  let regularUserToken;
  let adminUserToken;
  let regularUserDocument;
  before((done) => {
    requester.post('/users/login')
      .send({ email: sampleUserData.admin.email, password: defaultPassword })
      .end((error, response) => {
        adminUserToken = response.body.data.token;
      });
    requester.post('/users/login')
      .send({ email: sampleUserData.regular.email, password: defaultPassword })
      .end((error, response) => {
        regularUserToken = response.body.data.token;
        requester.post('/documents')
          .set({ 'access-token': regularUserToken })
          .send({ title: 'Lorem Ipsum', content: 'Lorem Ipsum Something' })
          .end((error, response) => {
            regularUserDocument = response.body.data;
            done();
          });
      });
  });
  describe('Create Document', () => {
    it('should prevent unauthenticated users from creating documents', (done) => {
      requester.post('/documents')
        .send(sampleUserData.freeDocument)
        .end((error, response) => {
          expect(response.status).to.equal(401);
          done();
        });
    });
    it('should prevent user from creating documents if title is not supplied', (done) => {
      requester.post('/documents')
        .set({ 'access-token': regularUserToken })
        .send(sampleUserData.documentWithNoTitle)
        .end((error, response) => {
          expect(response.status).to.equal(500);
          done();
        });
    });
    it('should ensure authenticated users are able to create documents', (done) => {
      requester.post('/documents')
        .set({ 'access-token': regularUserToken })
        .send(sampleUserData.freeDocument)
        .end((error, response) => {
          expect(response.status).to.equal(201);
          done();
        });
    });
  });

  describe('Update Document', () => {
    it('should prevent a regular user from updating another\'s document', (done) => {
      requester.put('/documents/4')
        .set({ 'access-token': regularUserToken })
        .send({ access: 'public' })
        .end((error, response) => {
          expect(response.status).to.equal(403);
          done();
        });
    });
    it('should return status 404 when trying to update a rogue document', (done) => {
      requester.put('/documents/2000')
        .set({ 'access-token': adminUserToken })
        .send({ access: 'private' })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          done();
        });
    });
    it('should ensure a user can update his own document', (done) => {
      requester.put(`/documents/${regularUserDocument.id}`)
        .set({ 'access-token': regularUserToken })
        .send({ access: 'public' })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
    it('should allow an admin update any document', (done) => {
      requester.put('/documents/2')
        .set({ 'access-token': adminUserToken })
        .send({ access: 'private' })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });

  describe('View Document', () => {
    it('should return a 404 error if user tries to view a ghost document', (done) => {
      requester.get('/documents/2000')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          done();
        });
    });
    it('should prevent a user from viewing another\'s private document', (done) => {
      requester.get('/documents/4')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(403);
          done();
        });
    });
    it('should ensure a user is able to view his document', (done) => {
      requester.get('/documents/2')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
    it('should allow an admin view any user\'s document', (done) => {
      requester.get('/documents/2')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });

  describe('Get Documents', () => {
    it('should prevent a regular user from viewing all documents', (done) => {
      requester.get('/documents')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(403);
          done();
        });
    });
    it('should ensure that admin can view all documents', (done) => {
      requester.get('/documents')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });

  describe('Search Documents', () => {
    it('should return a 404 error if no search result is returned', (done) => {
      requester.get('/documents/search/abracadabra')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          done();
        });
    });
    it('should allow a regular search for documents by keyword', (done) => {
      requester.get('/documents/search/Alice')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
    it('should ensure an admin can search documents by keyword', (done) => {
      requester.get('/documents/search/Alice')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });

  describe('Delete Document', () => {
    it('should prevent a regular user from deleting another\'s document', (done) => {
      requester.delete('/documents/4')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(403);
          done();
        });
    });
    it('should return 404 error when trying to delete a rogue document', (done) => {
      requester.delete('/documents/7000')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          done();
        });
    });
    it('should allow a user delete his document', (done) => {
      requester.delete(`/documents/${regularUserDocument.id}`)
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
    it('should ensure than an admin is able to delete any document', (done) => {
      requester.delete('/documents/7')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });
});
