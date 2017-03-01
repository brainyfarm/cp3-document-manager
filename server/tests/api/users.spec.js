import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
// import { helper, fakeUser } from '../TestHelper';

const makeRequest = request.agent(app);
const expect = chai.expect;

describe('Users Route', () => {
  describe('Authenticate', () => {
    it('should return status code 201 on signup success', (done) => {

    });
    it('should disallow signup if necessary fields are invalid', (done) => {

    });
    it('should prevent a user who does not exist from signing in', (done) => {

    });
    it('should disallow signin if password is invalid', (done) => {

    });
    it('should return a token when a user signs in successfully', (done) => {

    });
    it('should allow a user logout of a session', (done) => {

    });
  });

  describe('Find User', () => {
    it('should prevent a regular user from finding user by ID', (done) => {

    });
    it('should allow an admin find a user by ID', (done) => {

    });
  });

  describe('Get Users', () => {
    it('should prevent a regular user from getting list of all users', (done) => {

    });
    it('should allow the admin get a list of all users', (done) => {

    });
  });

  describe('Update User', () => {
    it('should prevent a regular user from updating another\'s data', (done) => {

    });
    it('should allow a user update his own data', (done) => {

    });
    it('should allow an admin update any user\'s data', (done) => {

    });
  });

  describe('Delete User', () => {
    it('should prevent a regular user from deleting another user', (done) => {

    });
    it('should return status code 404 when trying to delete a ghost user', (done) => {

    });
    it('should allow an admin delete a user account', (done) => {

    });
  });

  describe('Search Users', () => {
    it('should prevent a regular user from searching for users', (done) => {

    });
    it('should return status code 404 when search result is empty', (done) => {

    });
    it('should allow an admin search for users by keyword', (done) => {

    });
  });

  describe('Get User\'s Documents', () => {
    it('should return a 404 status code if user has no document', (done) => {

    });
    it('should ensure the admin is able to get all of a user\'s document', (done) => {

    });
    it('should allow a regular user get a list of another\'s public document', (done) => {

    });
  });
});

