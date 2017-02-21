import * as jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
  if (!req.headers['access-token']) {
    res.status(403).send({
      message: 'No access token'
    });
  } else {
    const requestToken = req.headers['access-token'] || req.body.token || req.query.token;
    if (!requestToken) {
      res.send({
        message: 'No token to verify'
      });
    }
    const decodedToken = jwt.verify(requestToken, 'secret');
    const username = decodedToken.username;
    const firstname = decodedToken.firstname;
    const userId = decodedToken.id;
    const role = decodedToken.role;

    if (!username) {
      res.status(403).send({
        message: 'Unauthorized access'
      });
    } else {
      req.user = {
        userId,
        username,
        role,
        firstname
      };
      next();
    }
  }
};
export default authenticate;
