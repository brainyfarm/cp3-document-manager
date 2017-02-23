import express from 'express';
import authenticate from './../../app/middlewares/Authenticate';
// import * as Ctrl from './../../app/controllers/searchCtrl';


const searchRoutes = express.Router();

searchRoutes.route('/')
  .get((req, res) => {
    res.send('Shit works');
  });


export default searchRoutes;
