/* eslint-disable no-unused-expressions */
import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
import { sampleUserData, defaultPassword } from '../TestHelper';

const requester = request.agent(app);
const expect = chai.expect;

describe('Roles', () => {
  let regularUserToken;
  let adminUserToken;
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
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('unauthorised access');
          done();
        });
    });
    it('should prevent a creation of role if title is not supplied', (done) => {
      requester.post('/roles')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('supply role title');
          done();
        });
    });
    it('should ensures an admin is able to create a new role', (done) => {
      requester.post('/roles')
        .set({ 'access-token': adminUserToken })
        .send({ title: 'Newly Created Role' })
        .end((error, response) => {
          expect(response.status).to.equal(201);
          expect(response.body.success).to.be.true;
          expect(response.body.message).to.equal('new role created');
          expect(response.body.data.title).to.equal('Newly Created Role');
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
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('unauthorised access');
          done();
        });
    });
    it('should ensure an admin is able to view all avialable roles', (done) => {
      requester.get('/roles')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data.length).to.be.greaterThan(1);
          done();
        });
    });
  });

  describe('Update Role', () => {
    it('should prevent a regular user from updating roles', (done) => {
      requester.put('/roles/3')
        .set({ 'access-token': regularUserToken })
        .send({ title: 'Updated Role title' })
        .end((error, response) => {
          expect(response.status).to.equal(403);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('unauthorised access');
          done();
        });
    });
    it('should prevent update of inexistent roles', (done) => {
      requester.put('/roles/3000')
        .set({ 'access-token': adminUserToken })
        .send({ title: 'Updated Role title' })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('invalid role id');
          done();
        });
    });
    it('should prevent update if title is not supplied', (done) => {
      requester.put('/roles/4')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('supply role title');
          done();
        });
    });
    it('should ensure an admin can update a role', (done) => {
      requester.put('/roles/4')
        .set({ 'access-token': adminUserToken })
        .send({ title: 'Updated Role Title' })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data.title).to.equal('Updated Role Title');
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
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('unauthorised access');
          done();
        });
    });
    it('should prevent deletion of inexistent role', (done) => {
      requester.delete('/roles/30000')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('invalid role id');
          done();
        });
    });
    it('should ensures an admin is able to delete an existing role', (done) => {
      requester.delete('/roles/3')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.message).to.equal('role deleted');
          done();
        });
    });
  });
});
