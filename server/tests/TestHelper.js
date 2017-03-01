// import faker from 'faker';
import bcrypt from 'bcrypt-nodejs';
import db from './../app/models';

db.sequelize.sync({ force: true });
