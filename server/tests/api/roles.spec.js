import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';

describe('Roles Route', () => {
  describe('Create Role', () => {
    it('should prevent a regular user from creating a new role', (done) => {

    });
    it('should ensures an admin is able to create a new role', (done) => {

    });
  });

  describe('Get Roles', () => {
    it('should prevent a regular user from viewing available roles', (done) => {

    });
    it('should ensure an admin is able to view all avialable roles', (done) => {

    });
  });

  describe('Delete Role', () => {
    it('should prevent a regular user from deleting a role', (done) => {

    });
    it('should ensures an admin is able to delete an existing role', (done) => {

    });
  });
});
