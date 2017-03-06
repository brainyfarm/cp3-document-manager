import * as jwt from 'jsonwebtoken';
import reply from './../helpers/ResponseSender';
import db from '../models/index';

const secret = process.env.SECRET || 'secret';
const authenticate = (req, res, next) => {
  if (!req.headers['access-token'] && !req.body.token && !req.query.token) {
    reply.messageTokenIssue(res, 'check access token');
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
            const username = decoded.username;
            const firstname = decoded.firstname;
            const userId = decoded.id;
            const role = decoded.role;

            req.user = { userId, username, role, firstname };
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
