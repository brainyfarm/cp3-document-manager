import * as jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
  if (!req.headers['access-token'] && !req.body.token && !req.query.token) {
    res.status(403).send({
      message: 'No access token'
    });
  } else {
    const requestToken = req.headers['access-token'] || req.body.token || req.query.token;
    const decodedToken = jwt.verify(requestToken, 'secret');
    const username = decodedToken.username;
    const firstname = decodedToken.firstname;
    const userId = decodedToken.id;
    const role = decodedToken.role;

    req.user = {
      userId,
      username,
      role,
      firstname
    };
    next();
  }
};
export default authenticate;
