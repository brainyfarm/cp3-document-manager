import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
import { sampleUserData, defaultPassword } from '../TestHelper';

const requester = request.agent(app);
const expect = chai.expect;

describe('Users Route', () => {
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
  describe('Authenticate', () => {
    it('should return status code 201 on signup success', (done) => {
      requester.post('/users')
        .send(sampleUserData.freeUserData)
        .end((error, response) => {
          expect(response.status).to.equal(201);
          done();
        });
    });
  });
  it('should disallow signup if necessary fields are invalid', (done) => {
    requester.post('/users')
      .send(sampleUserData.badUserDataWithNoEmail)
      .end((error, response) => {
        expect(response.status).to.equal(500);
        done();
      });
  });
  it('should prevent a user who does not exist from signing in', (done) => {
    requester.post('/users/login')
      .send(sampleUserData.rogueUser)
      .end((error, response) => {
        expect(response.status).to.equal(403);
        done();
      });
  });
  it('should disallow signin if password is invalid', (done) => {
    requester.post('/users/login')
      .send({ email: sampleUserData.freeUserData.email, password: '&ee83' })
      .end((error, response) => {
        expect(response.status).to.equal(403);
        done();
      });
  });
  it('should return a token when a user signs in successfully', (done) => {
    requester.post('/users/login')
      .send({ email: sampleUserData.admin.email, password: defaultPassword })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        done();
      });
  });
  it('should allow a user logout of a session', (done) => {
    requester.get('/logout')
      .set({ 'access-token': adminUserToken })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        done();
      });
  });

  describe('Find User', () => {
    it('should disallow access to route when invalid token is supplied', (done) => {
      requester.get('/users/1')
        .set({ 'access-token': '78389hcjbhcjhdsfjhcdbscjbedsbcbjsd.djhfdsd' })
        .end((error, response) => {
          expect(response.status).to.equal(401);
          done();
        });
    });

    it('should prevent a regular user from finding user by ID', (done) => {
      requester.get('/users/1')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(403);
          done();
        });
    });

    it('should return 404 error if user with supplied ID is not found', (done) => {
      requester.get('/users/100000')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          done();
        });
    });

    it('should allow an admin find a user by ID', (done) => {
      requester.get('/users/1')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });

  describe('Get Users', () => {
    it('should prevent a regular user from getting list of all users', (done) => {
      requester.get('/users')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(403);
          done();
        });
    });
    it('should allow the admin get a list of all users', (done) => {
      requester.get('/users')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
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
          done();
        });
    });
    it('should prevent update of a rogue user\'s data', (done) => {
      requester.put('/users/200000')
        .set({ 'access-token': adminUserToken })
        .send({ firstname: 'Chris' })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          done();
        });
    });
    it('should allow a user update his own data', (done) => {
      requester.put('/users/2')
        .set({ 'access-token': regularUserToken })
        .send({ firstname: 'Chidi', password: 'newpassword' })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
    it('should allow an admin update any user\'s data', (done) => {
      requester.put('/users/2')
        .set({ 'access-token': adminUserToken })
        .send({ firstname: 'Chris' })
        .end((error, response) => {
          expect(response.status).to.equal(200);
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
          done();
        });
    });
    it('should return status code 404 when trying to delete a ghost user', (done) => {
      requester.delete('/users/1000')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          done();
        });
    });
    it('should allow an admin delete a user account', (done) => {
      requester.delete('/users/4')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });

  describe('Search Users', () => {
    it('should prevent a regular user from searching for users', (done) => {
      requester.get('/users/search/a')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(403);
          done();
        });
    });

    it('should allow an admin search for users by keyword', (done) => {
      requester.get('/users/search/a')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
    it('should return status code 404 when search result is empty', (done) => {
      requester.get('/users/search/abracadabra')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(404);
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
          done();
        });
    });
    it('should ensure the admin is able to get a user\'s documents', (done) => {
      requester.get('/users/2/documents')
        .set({ 'access-token': adminUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
    it('should allow a regular user get a list of another\'s public document', (done) => {
      requester.get('/users/2/documents')
        .set({ 'access-token': regularUserToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });
});

