// import faker from 'faker';
import bcrypt from 'bcrypt-nodejs';
import db from './../app/models';

/**
 * hashPassword
 * convert plain test to a bcrypt hash
 * @param {String} plainPassword plain test
 * @returns {String} bcrypt hash value of the plain password
 */
const hashPassword = plainPassword =>
  bcrypt.hashSync(plainPassword, bcrypt.genSaltSync(8));

/* Default Roles to Populate */
const defaultRoles = [
  {
    title: 'Regular'
  },
  {
    title: 'Admin'
  },
  {
    title: 'Guest'
  }
];

/* Default User Data to Populate */
const defaultPassword = 'password';
const sampleUserData = {
  admin: {
    username: 'admin',
    email: 'admin@epicdocuments.com',
    password: hashPassword(defaultPassword),
    firstname: 'Admin',
    lastname: 'Olawale',
    role: 2
  },
  regular: {
    username: 'regular',
    email: 'regular@epicdocuments.com',
    password: hashPassword(defaultPassword),
    firstname: 'Regular',
    lastname: 'Bayonle',
    role: 1
  },
  james: {
    username: 'james',
    email: 'james@epicdocuments.com',
    password: hashPassword(defaultPassword),
    firstname: 'James',
    lastname: 'Smith',
    role: 1
  },
  sampleDocument1: {
    title: 'Alice in Wonderland',
    content: 'Alice is now in Nigeria for real',
    access: 'public',
    owner: 2
  },
  sampleDocument2: {
    title: 'The Martian',
    content: 'Andy Weirs is a very good writer and the Mart...',
    access: 'private',
    owner: 2
  },
  sampleDocument3: {
    title: 'Ralia - The Sugar Girl',
    content: 'Accusation of an old witch who turns out to be innocent!',
    access: 'public',
    owner: 2
  },
  sampleDocument4: {
    title: 'Ali and Simbi',
    content: 'Ali and Simbi goes to school and they love it',
    access: 'private',
    owner: 1
  },
  sampleDocument5: {
    title: 'Lord of the Rings',
    content: 'The Lord of the Rings is a very good book by ..',
    access: 'public',
    owner: 1
  },
  freeUserData: {
    username: 'smith.',
    email: 'smith2@epicdocuments.com',
    password: defaultPassword,
    firstname: 'Smith',
    lastname: 'Trudy'
  },
  freeUserDataEmailUpdate: {
    email: 'smith@epicdocuments.com',
  },
  badUserDataWithNoEmail: {
    username: 'judy',
    password: defaultPassword,
    firstname: 'Judy',
    lastname: 'Todd'
  },
  rogueUser: {
    email: 'idonotexist@epicdocuments.com',
    password: defaultPassword
  }
};

/* sample user data to populate database with */

const defaultUsers = [
  sampleUserData.admin,
  sampleUserData.regular,
  sampleUserData.james
];

const defaultDocuments = [
  sampleUserData.sampleDocument1,
  sampleUserData.sampleDocument2,
  sampleUserData.sampleDocument3,
  sampleUserData.sampleDocument4,
  sampleUserData.sampleDocument5,
];

/**
 * populate Default Data
 * @return {undefined}
 */
const populateData = () => {
  /** Reset the Database and populate sample data */
  db.sequelize.sync({ force: true })
    .then(() => {
      db.Roles.bulkCreate(defaultRoles).then(() => {
        db.Users.bulkCreate(defaultUsers).then(() => {
          db.Documents.bulkCreate(defaultDocuments).then(() => {
            console.log('DATABASE POPULATED');
          });
        });
      });
    });
};
populateData();
