import express from 'express';
import * as bodyParser from 'body-parser';

import logger from 'morgan';
import userRoutes from './routes/users';
import documentRoutes from './routes/documents';
import roleRoutes from './routes/roles';



const app = express();


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/users', userRoutes);
app.use('/documents', documentRoutes);
app.use('/roles', roleRoutes);

app.listen(4040, () => {
  console.log('We are running on 4040');
});

export default app;
