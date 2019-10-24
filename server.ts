import * as express from 'express';
import * as fs from 'fs';
import * as https from 'https';
import * as cors from 'cors';
import routes from './app/routes/';
import db from './config/db';
import { MongoClient } from "mongodb";

const app = express();
const port = 3000;

app.use(cors());

app.use(express.urlencoded());

app.use(express.json());

app.get('/', (request, response) => {
  response.send('Hello from Express!')
});

app.post('/', (request, response) => {
    console.log(request.body);
    response.send('Hello from Express!!!');
});

MongoClient.connect(db.url, (err, dbClient) => {
  if (err) return console.log(err);
  routes(app, dbClient);
// https.createServer({
//     key: fs.readFileSync('server.key'),
//     cert: fs.readFileSync('server.cert')
// }, app).listen(port, () => {
  app.listen(port, () => {
    console.log(`server is listening on ${port}`)
  });
});
