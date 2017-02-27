import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
import { helper, populateData } from '../TestHelper';

const makeRequest = request.agent(app);
const expect = chai.expect;

populateData();

describe('User Route Test Suite', () => {
  describe('Create User', () => {
    it('should return status code 201 user is successfully created', (done) => {
      makeRequest.post('/users')
        .send(helper.aUser)
        .end((error, response) => {
          expect(response.status).to.equal(201);
          done();
        });
    });

    it('should disallow creation of users if email exists in database', (done) => {
      makeRequest.post('/users')
        .send(helper.aUser)
        .end((error, response) => {
          expect(response.status).to.equal(500);
          done();
        });
    });


    it('should return a token user is successfully created', (done) => {
      makeRequest.post('/users')
        .send(helper.yetAnotherSampleUser)
        .end((error, response) => {
          expect(response.body).to.have.property('token');
          done();
        });
    });


    it('should NOT return sensitive detail when a user is created', (done) => {
      makeRequest.post('/users')
        .send(helper.anotherSampleUser)
        .end((error, response) => {
          expect(response.body).to.not.have.property('password');
          done();
        });
    });

    it('should NOT create a User if Required fields/attributes are missing',
      (done) => {
        makeRequest.post('/users')
          .send(helper.sampleUserWithNoEmail)
          .end((error, response) => {
            expect(response.status).to.equal(500);
            expect(response.body.success).to.equal(false);
            done();
          });
      });
  });

  it('should ensure that default user role is 1', (done) => {
    makeRequest.post('/users')
      .send(helper.sampleUser)
      .end((error, response) => {
        expect(response.body.roleId).to.equal(1);
        done();
      });
  });
});

describe('Login', () => {
  it('should return a TOKEN if Login is successful', (done) => {
    makeRequest.post('/users/login')
      .send(helper.aUser)
      .end((error, response) => {
        expect(response.body.success).to.equal(true);
        expect(response.body).to.have.property('token');
        done();
      });
  });

  it('should fail to login if user supplies the wrong password', (done) => {
    makeRequest.post('/users/login')
      .send({ email: helper.aUser.email, password: 'WrongPassW0rd' })
      .end((error, response) => {
        expect(response.status).to.equal(401);
        done();
      });
  });

  it('should fail to login a no-existent user', (done) => {
    makeRequest.post('/users/login')
      .send(helper.fakeUser)
      .end((error, response) => {
        expect(response.status).to.equal(403);
        done();
      });
  });

  describe('Find User By ID', () => {
    it('should allow an admin find any user by ID', (done) => {
      makeRequest.post('/users/login')
        .send(helper.adminUser)
        .end((error, response) => {
          makeRequest.get('/users/2')
            .set({ 'access-token': response.body.token })
            .end((err, res) => {
              expect(res.status).to.equal(200);
              done();
            });
        });
    });

    it('should ensure that a regular user cannot find a user by ID', (done) => {
      makeRequest.post('/users/login')
        .send(helper.ordinaryUserLogin)
        .end((error, response) => {
          makeRequest.get('/users/1')
            .set({ 'access-token': response.body.token })
            .end((er, res) => {
              expect(res.status).to.equal(403);
              done();
            });
        });
    });
  });

  describe('Get Users', () => {
    it('should NOT allow NON-Admin access to list of users', (done) => {
      makeRequest.post('/users/login')
        .send(helper.ordinaryUserLogin)
        .end((error, response) => {
          makeRequest.get('/users')
            .set({ 'access-token': response.body.token })
            .end((err, res) => {
              expect(res.status).to.equal(403);
              done();
            });
        });
    });

    it('should allow admin access to list of all users', (done) => {
      makeRequest.post('/users/login')
        .send(helper.adminUser)
        .end((error, response) => {
          makeRequest.get('/users')
            .set({ 'access-token': response.body.token })
            .end((err, res) => {
              expect(res.status).to.equal(200);
              done();
            });
        });
    });
  });


  describe('Update Users', () => {
    it('should update the user\'s data\'s if user owns it', (done) => {
      makeRequest.post('/users/login')
        .send(helper.aUser)
        .end((error, response) => {
          makeRequest.put(`/users/${response.body.userId}`)
            .set('access-token', response.body.token)
            .send(helper.aUserUpdateData)
            .end((err, res) => {
              expect(res.body.email).to.equal(helper.aUserUpdateData.email);
              done();
            });
        });
    });

    it('should prevent a regular user from updating another\'s data', (done) => {
      makeRequest.post('/users/login')
        .send(helper.aUser)
        .end((error, response) => {
          makeRequest.put('/users/2')
            .set('access-token', response.body.token)
            .send(helper.aUserUpdateData)
            .end((err, res) => {
              expect(res.status).to.equal(403);
              done();
            });
        });
    });

    it('should allow the administrator update another\'s user\'s data', (done) => {
      makeRequest.post('/users/login')
        .send({ email: helper.adminUser.email, password: helper.adminUser.password })
        .end((error, response) => {
          makeRequest.put(`/users/${helper.ordinaryUser.id}`)
            .set('access-token', response.body.token)
            .send({ firstname: 'James' })
            .end((err, res) => {
              expect(res.status).to.equal(201);
              done();
            });
        });
    });
  });


  describe('Delete User ', () => {
    it('should a user is not able to delete another user\'s account', (done) => {
      makeRequest.post('/users/login')
        .send(helper.ordinaryUserLogin)
        .end((error, response) => {
          makeRequest.delete('/users/1')
            .set('access-token', response.body.token)
            .end((err, res) => {
              expect(res.status).to.equal(401);
              done();
            });
        });
    });

    it('should ensure the administrator is able to delete a user account', (done) => {
      makeRequest.post('/users/login')
        .send({ email: helper.adminUser.email, password: helper.adminUser.password })
        .end((error, response) => {
          makeRequest.delete('/users/3')
            .set('access-token', response.body.token)
            .end((err, res) => {
              expect(res.status).to.equal(201);
              done();
            });
        });
    });

    it('should return status code 404 when admin try to delete a user that doesn\'t exist', (done) => {
      makeRequest.post('/users/login')
        .send({ email: helper.adminUser.email, password: helper.adminUser.password })
        .end((error, response) => {
          makeRequest.delete('/users/300')
            .set('access-token', response.body.token)
            .end((err, res) => {
              expect(res.status).to.equal(404);
              done();
            });
        });
    });
  });

  describe('User Logout', () => {
    let regularToken;
    it('should ensure that a user is logged out', (done) => {
      makeRequest.post('/users/login')
        .send(helper.ordinaryUserLogin)
        .end((error, response) => {
          regularToken = response.body.token;
          makeRequest.get('/logout')
            .set({ 'access-token': regularToken })
            .end((err, res) => {
              expect(res.status).to.equal(201);
              done();
            });
        });
    });
  });

  describe('Get User Documents', () => {
    it('should ensure the admin is able to get all a user\'s document', (done) => {
      makeRequest.post('/users/login')
        .send({ email: helper.adminUser.email, password: helper.adminUser.password })
        .end((error, response) => {
          makeRequest.get('/users/2/documents')
            .set('access-token', response.body.token)
            .end((err, res) => {
              expect(res.status).to.equal(200);
              done();
            });
        });
    });

    it('should return 404 for admin if user has no document', (done) => {
      makeRequest.post('/users/login')
        .send({ email: helper.adminUser.email, password: helper.adminUser.password })
        .end((error, response) => {
          makeRequest.get('/users/5/documents')
            .set('access-token', response.body.token)
            .end((err, res) => {
              expect(res.status).to.equal(404);
              done();
            });
        });
    });

    it('should ensure a regular is able to get another user\'s public document', (done) => {
      makeRequest.post('/users/login')
        .send(helper.ordinaryUserLogin)
        .end((error, response) => {
          makeRequest.get('/users/4/documents')
            .set('access-token', response.body.token)
            .end((err, res) => {
              expect(res.status).to.equal(200);
              done();
            });
        });
    });
  });

  describe('Search Users', () => {
    it('should ensure an admin is able to search for users', (done) => {
      makeRequest.post('/users/login')
        .send(helper.adminUser)
        .end((error, response) => {
          makeRequest.get('/users/search/a')
            .set('access-token', response.body.token)
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.success).to.equal(true);
              done();
            });
        });
    });

    it('should return status 404 for search for inexistent users', (done) => {
      makeRequest.post('/users/login')
        .send(helper.adminUser)
        .end((error, response) => {
          makeRequest.get('/users/search/a87jnehbrrf')
            .set('access-token', response.body.token)
            .end((err, res) => {
              expect(res.status).to.equal(404);
              expect(res.body.success).to.equal(true);
              expect(res.body.searchResult).to.be.a('null');
              done();
            });
        });
    });

    it('should ensure a regular is not able to search for users', (done) => {
      makeRequest.post('/users/login')
        .send(helper.ordinaryUserLogin)
        .end((error, response) => {
          makeRequest.get('/users/search/a')
            .set('access-token', response.body.token)
            .end((err, res) => {
              expect(res.status).to.equal(403);
              expect(res.body.success).to.equal(false);
              done();
            });
        });
    });
  });
});

