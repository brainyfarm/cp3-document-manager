import express from 'express';
import * as bodyParser from 'body-parser';

import logger from 'morgan';
import userRoutes from './routes/Users';
import documentRoutes from './routes/Documents';
import roleRoutes from './routes/Roles';


const app = express();

const PORT = process.env.PORT || 4040;


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/users', userRoutes);
app.use('/documents', documentRoutes);
app.use('/roles', roleRoutes);

/* Logout only */
app.get('/logout', (req, res) => {
  /* Destroy and blacklist token here */
  res.status(201).json({
    success: true
  });
});

app.listen(PORT, () => {
  console.log(`App running on ${PORT}`);
});

export default app;
