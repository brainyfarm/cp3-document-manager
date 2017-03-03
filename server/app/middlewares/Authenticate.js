import * as jwt from 'jsonwebtoken';
import reply from './../helpers/ResponseSender';

const secret = process.env.SECRET || 'secret';
const authenticate = (req, res, next) => {
  if (!req.headers['access-token'] && !req.body.token && !req.query.token) {
    reply.messageTokenIssue(res, 'check access token');
  } else {
    const requestToken = req.headers['access-token'] || req.body.token || req.query.token;
    jwt.verify(requestToken, secret, (error, decoded) => {
      if (!error) {
        const username = decoded.username;
        const firstname = decoded.firstname;
        const userId = decoded.id;
        const role = decoded.role;

        req.user = { userId, username, role, firstname };
        next();
      } else {
        reply.messageTokenIssue(res, error.message);
      }
    });
  }
};
export default authenticate;
