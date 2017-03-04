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
/* Home Route */
app.use('/', (req, res) => {
  res.status(200).json({
    message: 'Epic Document Manager API',
    apiDocumentation: 'https://github.com/andela-oakinseye/cp3-document-manager',
    postmanCollection: 'https://www.getpostman.com/collections/461ad21b114af8ccd66c'
  });
});
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
