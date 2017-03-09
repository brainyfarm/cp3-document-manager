import * as jwt from 'jsonwebtoken';
import Cryptr from 'cryptr';

import reply from './../helpers/ResponseSender';
import db from '../models/index';

const encryptionKey = process.env.ENCRYPT_KEY || '{|-_-|}';
const cryptr = new Cryptr(encryptionKey);
const decrypt = cryptr.decrypt;


const secret = process.env.SECRET || 'secret';
const authenticate = (req, res, next) => {
  if (!req.headers['access-token'] && !req.body.token && !req.query.token) {
    reply.messageTokenIssue(res, 'you are not logged in');
  } else {
    const requestToken = req.headers['access-token'] || req.body.token || req.query.token;
    db.Blacklists.findOne({
      where: {
        token: requestToken
      }
    })
      .then((data) => {
        if (data) {
          return reply.messageTokenIssue(res, 'this session is already terminated');
        }
        jwt.verify(requestToken, secret, (error, decoded) => {
          if (!error) {
            const payLoadValue = Object.keys(decoded);
            const userId = decrypt(payLoadValue[0]);
            const role = decrypt(payLoadValue[1]);

            req.user = { userId, role };
            return next();
          }
          reply.messageTokenIssue(res, error.message);
        });
      })
      .catch((error) => {
        reply.messageServerError(res, 'unable to process request', error);
      });
  }
};
export default authenticate;
