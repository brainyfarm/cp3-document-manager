import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';

describe('Document Route', () => {
  describe('Create Document', () => {
    it('should prevent unauthenticated users from creating documents', (done) => {

    });
    it('should prevent user from creating documents if title is not supplied', (done) => {

    });
    it('should ensure authenticated users are able to create documents', (done) => {

    });
  });

  describe('Update Document', () => {
    it('should prevent a regular user from updating another\'s document', (done) => {

    });
    it('should ensure a user can update his own document', (done) => {

    });
    it('should allow an admin update any document', (done) => {

    });
  });

  describe('View Document', () => {
    it('should return a 404 error if user tries to view a ghost document', (done) => {

    });
    it('should prevent a user from viewing another\'s private document', (done) => {

    });
    it('should ensure a user is able to view his document', (done) => {

    });
    it('should allow an admin view any user\'s document', (done) => {

    });
  });

  describe('Get Documents', () => {
    it('should prevent a regular user from viewing all documents', (done) => {

    });
    it('should ensure that admin can view all documents', (done) => {

    });
  });

  describe('Search Documents', () => {
    it('should return a 404 error if no search result is returned', (done) => {

    });
    it('should allow a regular search for documents by keyword', (done) => {

    });
    it('should ensure an admin can search documents by keyword', (done) => {

    });
  });

  describe('Delete Document', () => {
    it('should prevent a regular user from deleting another\'s document', (done) => {

    });
    it('should allow a user delete his document', (done) => {

    });
    it('should ensure than an admin is able to delete any document', (done) => {

    });
  });
});
