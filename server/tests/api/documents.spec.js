import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
import { helper, populateData } from '../TestHelper';

populateData();

const makeRequest = request.agent(app);
const expect = chai.expect;

describe('DOCUMENT ROUTE TESTS', () => {
  it('should successfully create a document', (done) => {
    makeRequest.post('/users/login')
      .send({ email: helper.adminUser.email, password: 'password' })
      .end((err, res) => {
        makeRequest.post('/documents')
          .set('access-token', res.body.token)
          .send({ title: 'Simple Document', content: 'Body of the document', access: 'public' })
          .end((error, response) => {
            expect(response.status).to.equal(201);
            done();
          });
      });
  });

  it('should fail to create a document if title is not supplied', (done) => {
    makeRequest.post('/users/login')
      .send(helper.ordinaryUserLogin)
      .end((err, res) => {
        makeRequest.post('/documents')
          .set('access-token', res.body.token)
          .send({ content: 'Body of the document', access: 'public' })
          .end((error, response) => {
            expect(response.status).to.equal(500);
            done();
          });
      });
  });

  it('should ensure that a user can view his document', (done) => {
    makeRequest.post('/users/login')
      .send(helper.ordinaryUserLogin)
      .end((err, res) => {
        makeRequest.get('/documents/7')
          .set('access-token', res.body.token)
          .end((error, response) => {
            expect(response.status).to.equal(200);
            done();
          });
      });
  });

  it('should ensure that a user cannot view another\'s private document', (done) => {
    makeRequest.post('/users/login')
      .send(helper.ordinaryUserLogin)
      .end((err, res) => {
        makeRequest.get('/documents/10')
          .set('access-token', res.body.token)
          .end((error, response) => {
            expect(response.status).to.equal(401);
            done();
          });
      });
  });

  it('should return 404 error for a document that does not exist', (done) => {
    makeRequest.post('/users/login')
      .send(helper.adminUser)
      .end((err, res) => {
        makeRequest.get('/documents/10000')
          .set('access-token', res.body.token)
          .end((error, response) => {
            expect(response.status).to.equal(404);
            done();
          });
      });
  });

  it('should ensure that an admin can view all documents', (done) => {
    makeRequest.post('/users/login')
      .send(helper.adminUser)
      .end((err, res) => {
        makeRequest.get('/documents')
          .set('access-token', res.body.token)
          .end((error, response) => {
            expect(response.status).to.equal(200);
            done();
          });
      });
  });

  it('should ensure that a user can update his own document', (done) => {
    makeRequest.post('/users/login')
      .send(helper.ordinaryUserLogin)
      .end((err, res) => {
        makeRequest.put('/documents/7')
          .set('access-token', res.body.token)
          .send({ title: 'Private Document', access: 'private' })
          .end((error, response) => {
            expect(response.status).to.equal(201);
            done();
          });
      });
  });

  it('should ensure that an admin update another user\'s document', (done) => {
    makeRequest.post('/users/login')
      .send(helper.adminUser)
      .end((err, res) => {
        makeRequest.put('/documents/7')
          .set('access-token', res.body.token)
          .send({ title: 'Public Again', access: 'public' })
          .end((error, response) => {
            expect(response.status).to.equal(201);
            done();
          });
      });
  });

  it('should ensure that a user can delete his document', (done) => {
    makeRequest.post('/users/login')
      .send(helper.ordinaryUserLogin)
      .end((err, res) => {
        makeRequest.delete('/documents/7')
          .set('access-token', res.body.token)
          .end((error, response) => {
            expect(response.status).to.equal(201);
            done();
          });
      });
  });
});
