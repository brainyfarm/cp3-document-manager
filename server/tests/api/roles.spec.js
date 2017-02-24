
import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
import { helper } from '../TestHelper';

const makeRequest = request.agent(app);
const expect = chai.expect;

describe('ROLE ROUTES TEST', () => {
  it('should ensure that the admin can view available roles', (done) => {
    makeRequest.post('/users/login')
      .send(helper.adminUser)
      .end((err, res) => {
        makeRequest.get('/roles')
          .set('access-token', res.body.token)
          .end((error, response) => {
            expect(response.status).to.equal(200);
            done();
          });
      });
  });

  it('should ensure that a regular user cannot view available roles', (done) => {
    makeRequest.post('/users/login')
      .send(helper.ordinaryUserLogin)
      .end((err, res) => {
        makeRequest.get('/roles')
          .set('access-token', res.body.token)
          .end((error, response) => {
            expect(response.status).to.equal(403);
            done();
          });
      });
  });

  it('should ensure that an admin can delete a role', (done) => {
    makeRequest.post('/users/login')
      .send(helper.adminUser)
      .end((err, res) => {
        makeRequest.delete('/roles/3')
          .set('access-token', res.body.token)
          .end((error, response) => {
            expect(response.status).to.equal(201);
            done();
          });
      });
  });

  it('should ensure that an admin can create a new role', (done) => {
    makeRequest.post('/users/login')
      .send(helper.adminUser)
      .end((err, res) => {
        makeRequest.post('/roles')
          .set('access-token', res.body.token)
          .send({ title: 'Content Master' })
          .end((error, response) => {
            expect(response.status).to.equal(201);
            done();
          });
      });
  });

  it('should ensure that a regular user cannot create a new role', (done) => {
    makeRequest.post('/users/login')
      .send(helper.ordinaryUserLogin)
      .end((err, res) => {
        makeRequest.post('/roles')
          .set('access-token', res.body.token)
          .send({ title: 'Content Master' })
          .end((error, response) => {
            expect(response.status).to.equal(403);
            done();
          });
      });
  });

  it('should ensure that a regular user cannot delete a role', (done) => {
    makeRequest.post('/users/login')
      .send(helper.ordinaryUserLogin)
      .end((err, res) => {
        makeRequest.delete('/roles/2')
          .set('access-token', res.body.token)
          .end((error, response) => {
            expect(response.status).to.equal(403);
            done();
          });
      });
  });
});
