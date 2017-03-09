/* eslint-disable no-unused-expressions */
import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
import { sampleUserData, defaultPassword } from '../TestHelper';

const requester = request.agent(app);
const expect = chai.expect;

describe('Users', () => {
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
  describe('/', () => {
    it('should ensure that default route is accessible ', (done) => {
      requester.get('/')
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.message).to.exist;
          done();
        });
    });
  });
  describe('Authenticate', () => {
    it('should return status code 201 on signup success', (done) => {
      requester.post('/users')
        .send(sampleUserData.freeUserData)
        .end((error, response) => {
          expect(response.status).to.equal(201);
          expect(response.body.success).to.be.true;
          expect(response.body.data.email).to.equal(sampleUserData.freeUserData.email);
          done();
        });
    });
    it('should prevent duplicate email signup', (done) => {
      requester.post('/users')
        .send(sampleUserData.freeUserData)
        .end((error, response) => {
          expect(response.status).to.equal(409);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('user with email or username exist');
          done();
        });
    });
    it('should disallow signup if necessary fields are not supplied', (done) => {
      requester.post('/users')
        .send(sampleUserData.badUserDataWithNoEmail)
        .end((error, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('supply all necessary field');
          done();
        });
    });
    it('should disallow signin if necessary fields are not supplied', (done) => {
      requester.post('/users/login')
        .send({ username: 'admin' })
        .end((error, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('supply all necessary fields');
          done();
        });
    });
    it('should prevent a user who does not exist from signing in', (done) => {
      requester.post('/users/login')
        .send(sampleUserData.rogueUser)
        .end((error, response) => {
          expect(response.status).to.equal(403);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('no such user');
          done();
        });
    });
    it('should disallow signin if password is invalid', (done) => {
      requester.post('/users/login')
        .send({ email: sampleUserData.freeUserData.email, password: '&ee83' })
        .end((error, response) => {
          expect(response.status).to.equal(403);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('unauthorised access');
          done();
        });
    });
    it('should return a token when a user signs in successfully', (done) => {
      requester.post('/users/login')
        .send({ email: sampleUserData.admin.email, password: defaultPassword })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data.token).to.exist;
          done();
        });
    });
  });

  describe('Find User', () => {
    it('should disallow access to route when invalid token is supplied', (done) => {
      requester.get('/users/1')
        .set({ 'access-token': '78389hcjbhcjhdsfjhcdbscjbedsbcbjsd.djhfdsd' })
        .end((error, response) => {
          expect(response.status).to.equal(401);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('jwt malformed');
          done();
        });
    });

    it('should allow a regular user find user by ID (no sensitive information)', (done) => {
      requester.get('/users/1')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data.username).to.equal('admin');
          expect(response.body.data.password).to.not.exist;
          done();
        });
    });
    it('should allow an admin find a user by ID (all user data)', (done) => {
      requester.get('/users/2')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data.username).to.exist;
          expect(response.body.data.password).to.exist;
          done();
        });
    });
    it('should return 404 error if the supplied ID is invalid', (done) => {
      requester.get('/users/p')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('invalid id');
          done();
        });
    });
    it('should return 404 error if user with supplied ID is not found', (done) => {
      requester.get('/users/100000')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('user not found');
          done();
        });
    });
  });

  describe('Get Users', () => {
    it('should allow a regular user get list of all users', (done) => {
      requester.get('/users')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data).to.exist;
          expect(response.body.data.count).to.be.above(0);
          expect(response.body.data.rows[0].password).to.not.exist;
          done();
        });
    });
    it('should prevent to get users if page queries are bad', (done) => {
      requester.get('/users?limit=ooo&page=noway')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('check page queries');
          done();
        });
    });
    it('should allow the admin get a list of all users', (done) => {
      requester.get('/users')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data).to.exist;
          expect(response.body.data.count).to.be.above(0);
          expect(response.body.data.rows[0].password).to.exist;
          done();
        });
    });
  });

  describe('Update User', () => {
    it('should prevent a regular user from updating another\'s data', (done) => {
      requester.put('/users/1')
        .set({ 'access-token': regularUserToken })
        .send({ firstname: 'Chidi' })
        .end((error, response) => {
          expect(response.status).to.equal(403);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('unauthorised access');
          done();
        });
    });
    it('should prevent update of a rogue user\'s data', (done) => {
      requester.put('/users/200000')
        .set({ 'access-token': adminUserToken })
        .send({ firstname: 'Chris' })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('user not found');
          done();
        });
    });
    it('should prevent update if id is invalid', (done) => {
      requester.put('/users/ooo')
        .set({ 'access-token': adminUserToken })
        .send({ firstname: 'Chris' })
        .end((error, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('invalid id');
          done();
        });
    });
    it('should allow a user update his own data', (done) => {
      requester.put('/users/2')
        .set({ 'access-token': regularUserToken })
        .send({ firstname: 'Chidinwa' })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data.firstname).to.equal('Chidinwa');
          done();
        });
    });
    it('should allow an admin update any user\'s data', (done) => {
      requester.put('/users/2')
        .set({ 'access-token': adminUserToken })
        .send({ firstname: 'Chris' })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data.firstname).to.equal('Chris');
          done();
        });
    });
  });

  describe('Delete User', () => {
    it('should prevent a regular user from deleting another user', (done) => {
      requester.delete('/users/1')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(403);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('unauthorised access');
          done();
        });
    });
    it('should prevent deletion if supplied id is bad', (done) => {
      requester.delete('/users/nonono')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('invalid id');
          done();
        });
    });
    it('should return status code 404 when trying to delete a rogue user', (done) => {
      requester.delete('/users/100000')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('user not found');
          done();
        });
    });
    it('should allow an admin delete a user account', (done) => {
      requester.delete('/users/4')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.message).to.equal('user account deleted');
          done();
        });
    });
  });

  describe('Search Users', () => {
    it('should allow a regular for users', (done) => {
      requester.get('/users/search?query=admin')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data.count).to.equal(1);
          expect(response.body.data.currentPage).to.equal(1);
          expect(response.body.data.totalPages).to.equal(1);
          done();
        });
    });
    it('should prevent search if page request query is invalid', (done) => {
      requester.get('/users/search?query=admin?limit=-1&page=uuu')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('check page queries');
          done();
        });
    });
    it('should allow an admin search for users by keyword', (done) => {
      requester.get('/users/search?query=a')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data.count).to.be.greaterThan(1);
          expect(response.body.data.currentPage).to.equal(1);
          expect(response.body.data.totalPages).to.equal(1);
          done();
        });
    });
    it('should allow user paginate search result', (done) => {
      requester.get('/users/search?query=a&limit=1&page=2')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data.count).to.be.greaterThan(1);
          expect(response.body.data.currentPage).to.equal(2);
          expect(response.body.data.totalPages).to.be.greaterThan(1);
          done();
        });
    });
    it('should return status code 404 when search result is empty', (done) => {
      requester.get('/users/search?query=abracadabra')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('no result found for abracadabra');
          done();
        });
    });
  });

  describe('Get User\'s Documents', () => {
    it('should return a 404 status code if user has no document', (done) => {
      requester.get('/users/3/documents')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('user has no document');
          done();
        });
    });
    it('should ensure the admin is able to get a user\'s documents', (done) => {
      requester.get('/users/2/documents?limit=2&page=1')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data.count).to.be.greaterThan(1);
          expect(response.body.data.totalPages).to.be.greaterThan(1);
          done();
        });
    });
    it('should not get documents if id is invalid', (done) => {
      requester.get('/users/invalid/documents')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('invalid id');
          done();
        });
    });
    it('should not get documents if request queries are invalid', (done) => {
      requester.get('/users/2/documents?limit=2&page=--1')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('check page queries');
          done();
        });
    });
    it('should allow a regular user get a list of another\'s public document', (done) => {
      requester.get('/users/1/documents')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data.count).to.equal(1);
          expect(response.body.data.currentPage).to.equal(1);
          expect(response.body.data.totalPages).to.be.equal(1);
          done();
        });
    });
  });

  describe('Logout', () => {
    it('should prevent redundant logout attempt', (done) => {
      requester.get('/logout')
        .end((error, response) => {
          expect(response.status).to.equal(401);
          done();
        });
    });

    it('should allow a user logout of a session', (done) => {
      requester.get('/logout')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.success).to.be.true;
          expect(response.body.message).to.equal('You have been logged out successfully');
          done();
        });
    });
    it('should prevent use of already blacklisted', (done) => {
      requester.get('/users')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(401);
          expect(response.body.success).to.be.false;
          expect(response.body.message).to.equal('this session is already terminated');
          done();
        });
    });
  });
});

