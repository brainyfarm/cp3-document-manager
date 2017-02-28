[![Coverage Status](https://coveralls.io/repos/github/andela-oakinseye/cp3-document-manager/badge.svg?branch=development)](https://coveralls.io/github/andela-oakinseye/cp3-document-manager?branch=development) [![Build Status](https://travis-ci.org/andela-oakinseye/cp3-document-manager.svg?branch=development)](https://travis-ci.org/andela-oakinseye/cp3-document-manager) [![Code Climate](https://codeclimate.com/github/andela-oakinseye/cp3-document-manager/badges/gpa.svg)](https://codeclimate.com/github/andela-oakinseye/cp3-document-manager)
# Checkpoint-Finale
### A Document Management API

Document Management System provides an interface for users to create and manage documents, it uses JWT as its authentication mechanism.

## Technologies Used
- JavaScript (ES6)
- Node.js
- Express
- Postgresql 
- Sequelize ORM.  

## Local Development
### Prerequisites includes
- [Postgresql](https://www.postgresql.org/) and
-  [Node.js](http://nodejs.org/) >= v6.8.0.

### Procedure
1. Clone this repository from a terminal `git clone https://github.com/andela-oakinseye/cp3-document-manager.git`.
1. Move into the project directory `cd cp3-document-manager`
1. Install project dependencies `npm install`
1. Create Postgresql database and run migrations `npm run migrate`.
1. Start the express server `npm start`.
1. Run test `npm test-server`.

### Postman Collection
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/461ad21b114af8ccd66c)


# API Documentation
The API has routes, each dedicated to a single task that uses HTTP response codes to indicate request success or errors.

## Authentication
Users are assigned a token when signup or signin. This token is then used for subsequent HTTP requests to the API for authentication and should be sent as one of the header values.

## Below are the API endpoints and their functions
EndPoint                      |   Functionality
------------------------------|------------------------
POST /api/users/login         |   Logs a user in.
POST /api/users/logout        |   Logs a user out.
POST /api/users/              |   Creates a new user.
GET /api/users/               |   Find matching instances of user.
GET /api/users/<id>           |   Find user.
PUT /api/users/<id>           |   Update user attributes.
DELETE /api/users/<id>        |   Delete user.
POST /api/documents/          |   Creates a new document instance.
GET /api/documents/           |   Find matching instances of document.
GET /api/documents/<id>       |   Find document.
PUT /api/documents/<id>       |   Update document attributes.
DELETE /api/documents/<id>    |   Delete document.
GET /api/users/<id>/documents |   Find all documents belonging to the user.
GET /search/users/<search-term>      |   Gets all users with username, firstname or lastname matching or containing the searcht erm
GET /search/documents/<search-term> | Gets all documents with title or content matching or containing the search term


The following are some sample request and response from the API.

- [Roles](#roles)
  - [Get roles](#get-roles)

- [Users](#users)
  - [Create user](#create-user)
  - [Get user](#get-user)
  - [Delete user](#delete-user)
  - [Update user](#update-user)
  - [Get User's documents](#get-user-documents)
  - [Find Users](#find-users)

- [Documents](#documents)
  - [Get All documents](#get-all-documents)
  - [Create document](#create-document)
  - [Get document](#get-document)
  - [Edit document](#edit-document)
  - [Delete document](#delete-document)
  - [Search Document](#search-document)


## Roles
Endpoint for Roles API.

### Get Roles

#### Request
- Endpoint: GET: `/roles`
- Requires: Authentication

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
[
  {
    "id": 1,
    "title": "Regular",
    "createdAt": "2017-02-22T16:55:51.913Z",
    "updatedAt": "2017-02-22T16:55:51.913Z"
  },
  {
    "id": 2,
    "title": "Admin",
    "createdAt": "2017-02-22T16:55:51.913Z",
    "updatedAt": "2017-02-22T16:55:51.913Z"
  }
]
```

## Users
Endpoint for Users API.

### Create User

#### Request
- Endpoint: POST: `/users`
- Body `(application/json)`
```json
{
  "username": "john.doe",
  "email": "john@doe.net",
  "password": "password",
  "firstname": "John",
  "lastname": "Doe"
}
```

#### Response
- Status: `201: Created`
- Body `(application/json)`
```json
{
  "success": true,
  "message": "User account created",
  "email": "john@doe.net",
  "roleId": 1,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoxLCJpZCI6MTAsInVzZXJuYW1lIjoiam9obi5kb2UiLCJwYXNzd29yZCI6IiQyYSQwOCRIYzN0S0t3bTJIclF1VUVRM0cyYUZlV2lLWmhEdlN1a1BySkVpcFYySW5lZ01YcWV3WFJ5NiIsImVtYWlsIjoiam9obkBkb2UubmV0IiwiZmlyc3RuYW1lIjoiSm9obiIsImxhc3RuYW1lIjoiRG9lIiwidXBkYXRlZEF0IjoiMjAxNy0wMi0yOFQwOTo1NTowNi44MzZaIiwiY3JlYXRlZEF0IjoiMjAxNy0wMi0yOFQwOTo1NTowNi44MzZaIiwiaWF0IjoxNDg4Mjc1NzA2LCJleHAiOjE0ODk0ODUzMDZ9.Sh6nHQcmWZfQpD0YqdQw1bPsbWrwyen16KNiRE7Kt20"
}
```

### Get Users

#### Request
- Endpoint: GET: `/users`
- Requires: Authentication, Admin Role

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
[{
    "id": 4,
    "username": "Vernon_Reichert66",
    "firstname": "Isaac",
    "lastname": "Rodriguez",
    "email": "Grant1@hotmail.com",
    "password": "$2a$08$34yWBZ12rJZ4GXbHMhHXUuK1TWaVAY2CerjjS9XRoObemAzBhgqxO",
    "role": 1,
    "createdAt": "2017-02-22T16:55:52.950Z",
    "updatedAt": "2017-02-22T16:55:52.950Z"
  },
  {
    "id": 5,
    "username": "Kamron_Hermann47",
    "firstname": "Aletha",
    "lastname": "Boyle",
    "email": "Sadie71@hotmail.com",
    "password": "$2a$08$L1AeX1zNpjb8mA9wafVc4.eCnpaIiBSIYgCjsXJbOim.RTUVOUNfO",
    "role": 1,
    "createdAt": "2017-02-22T16:55:53.043Z",
    "updatedAt": "2017-02-22T16:55:53.043Z"
  },
  {
    "id": 6,
    "username": "bman",
    "firstname": "Olawale",
    "lastname": "Akinseye",
    "email": "ordinary@dms.com",
    "password": "$2a$08$wCLpE8YPRerajpP1Q6ixy.nEN4CzxSZWHSTObeT3P41QUieYIMfqG",
    "role": 1,
    "createdAt": "2017-02-23T03:35:17.510Z",
    "updatedAt": "2017-02-23T03:35:17.510Z"
  },
  {
    "id": 8,
    "username": "olakin",
    "firstname": "Olawale",
    "lastname": "Akinseye",
    "email": "ola@ola.net",
    "password": "$2a$08$Ak8GkOcSnHvf9Gd2IBAbO.W4QHbYO.qeJbZplr49MmAeTaw1XmxfC",
    "role": 1,
    "createdAt": "2017-02-27T12:09:36.502Z",
    "updatedAt": "2017-02-27T12:09:36.502Z"
  },
  {
    "id": 10,
    "username": "john.doe",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@doe.net",
    "password": "$2a$08$Hc3tKKwm2HrQuUEQ3G2aFeWiKZhDvSukPrJEipV2InegMXqewXRy6",
    "role": 1,
    "createdAt": "2017-02-28T09:55:06.836Z",
    "updatedAt": "2017-02-28T09:55:06.836Z"
  }]
```

## Documents
Endpoint for document API.

### Get All Documents

#### Request
- Endpoint: GET: `/documents`
- Requires: Authentication, Admin Role

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
[{
    "id": 1,
    "owner": "2",
    "title": "My Document",
    "content": "password",
    "access": "private",
    "createdAt": "2017-02-23T04:22:22.358Z",
    "updatedAt": "2017-02-23T04:22:22.358Z"
  },
  {
    "id": 2,
    "owner": "5",
    "title": "Alice",
    "content": "Alicia in Wonderland",
    "access": "public",
    "createdAt": "2017-02-23T04:22:22.358Z",
    "updatedAt": "2017-02-23T04:22:22.358Z"
  },
  {
    "id": 6,
    "owner": "1",
    "title": "Alice in Wonderland",
    "content": "I met Alice in wonderland",
    "access": "private",
    "createdAt": "2017-02-28T04:55:13.608Z",
    "updatedAt": "2017-02-28T04:55:13.608Z"
  }]
```

### Create Document

#### Request
- Endpoint: POST: `/documents`
- Requires: Authentication
- Body `(application/json)`
```json
{
  "title": "Cat Story",
  "content": "I need to keep this secret, I hate cats!",
  "access": "private"
}
```

#### Response
- Status: `201: Created`
- Body `(application/json)`
```json
{
  "message": "Document Created",
  "document": {
    "id": 7,
    "title": "Cat Story",
    "content": "I need to keep this secret, I hate cats!",
    "owner": "1",
    "access": "private",
    "updatedAt": "2017-02-28T10:04:28.483Z",
    "createdAt": "2017-02-28T10:04:28.483Z"
  }
}
```


### View Document

#### Request
- Endpoint: GET: `/documents/:id`
- Requires: Authentication

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
    "id": 7,
    "title": "Cat Story",
    "content": "I need to keep this secret, I hate cats!",
    "owner": "1",
    "access": "private",
    "updatedAt": "2017-02-28T10:04:28.483Z",
    "createdAt": "2017-02-28T10:04:28.483Z"
  }
```

### Update Document

#### Request
- Endpoint: PUT: `/documents/:id`
- Requires: Authentication
- Body `(application/json)`:
```json
{
  "title": "My Cat Secret"
}
```

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "id": 7,
  "owner": "1",
  "title": "My Cat Secret",
  "content": "I need to keep this secret, I hate cats!",
  "access": "private",
  "createdAt": "2017-02-28T10:04:28.483Z",
  "updatedAt": "2017-02-28T10:08:06.504Z"
}
```

### Delete Document

#### Request
- Endpoint: DELETE: `documents/:id`
- Requires: Authentication

#### Response
- Status: `201: OK`
- Body `(application/json)`
```json
{
  "message": "Document has been deleted"
}
```


### Search
#### Documents

#### Request
- Endpoint: GET: `/documents/search/:searchterm`
- Requires: Authentication

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "success": true,
  "searchResult": [
    {
      "id": 2,
      "owner": "5",
      "title": "Alice",
      "content": "Alicia in Wonderland",
      "access": "public",
      "createdAt": "2017-02-23T04:22:22.358Z",
      "updatedAt": "2017-02-23T04:22:22.358Z"
    },
    {
      "id": 6,
      "owner": "1",
      "title": "Alice in Wonderland",
      "content": "I met Alice in wonderland",
      "access": "private",
      "createdAt": "2017-02-28T04:55:13.608Z",
      "updatedAt": "2017-02-28T04:55:13.608Z"
    }
  ]
}
```

### Users

#### Request
- Endpoint: GET: `/search/users/:term`
- Requires: Authentication, Admin Role

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "success": true,
  "searchResult": [
    {
      "id": 1,
      "username": "admin",
      "firstname": "Bayonle",
      "lastname": "Akinseye",
      "email": "admin@dms.com",
      "password": "$2a$08$CYGLVWUKD3RcTp31EoiLNOajgPVbUQGVXR93UhY0I1HllKNQ3ezIu",
      "role": 2,
      "createdAt": "2017-02-22T16:55:51.916Z",
      "updatedAt": "2017-02-28T04:41:34.134Z"
    }
  ]
}
```
