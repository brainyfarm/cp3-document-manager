import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
import { sampleUserData, defaultPassword } from '../TestHelper';

const requester = request.agent(app);
const expect = chai.expect;

describe('Roles Route', () => {
  let regularUserToken;
  let adminUserToken;
  before((done) => {
    requester.post('/users/login')
      .send({ email: sampleUserData.admin.email, password: defaultPassword })
      .end((error, response) => {
        adminUserToken = response.body.token;
      });
    requester.post('/users/login')
      .send({ email: sampleUserData.regular.email, password: defaultPassword })
      .end((error, response) => {
        regularUserToken = response.body.token;
        done();
      });
  });

  describe('Create Role', () => {
    it('should prevent a regular user from creating a new role', (done) => {
      requester.post('/roles')
        .set({ 'access-token': regularUserToken })
        .send({ title: 'User Created Role' })
        .end((error, response) => {
          expect(response.status).to.equal(403);
          done();
        });
    });
    it('should ensures an admin is able to create a new role', (done) => {
      requester.post('/roles')
        .set({ 'access-token': adminUserToken })
        .send({ title: 'User Created Role' })
        .end((error, response) => {
          expect(response.status).to.equal(201);
          done();
        });
    });
  });

  describe('Get Roles', () => {
    it('should prevent a regular user from viewing available roles', (done) => {
      requester.get('/roles')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(403);
          done();
        });
    });
    it('should ensure an admin is able to view all avialable roles', (done) => {
      requester.get('/roles')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });

  describe('Delete Role', () => {
    it('should prevent a regular user from deleting a role', (done) => {
      requester.delete('/roles/3')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(403);
          done();
        });
    });
    it('should ensures an admin is able to delete an existing role', (done) => {
      requester.delete('/roles/4')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(201);
          done();
        });
    });
  });
});
