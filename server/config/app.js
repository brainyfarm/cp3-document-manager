import express from 'express';
import * as bodyParser from 'body-parser';

import logger from 'morgan';
import userRoutes from './routes/Users';
import documentRoutes from './routes/Documents';
import roleRoutes from './routes/Roles';
import searchRoutes from './routes/Search';



const app = express();


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/users', userRoutes);
app.use('/documents', documentRoutes);
app.use('/roles', roleRoutes);
app.use('/search', searchRoutes);

/* Logout only */
app.get('/logout', (req, res) => {
  /* Destroy and blacklist token here */
  res.status(201).json({
    success: true
  });
});

app.listen(4040, () => {
  console.log('We are running on 4040');
});

export default app;
