import * as express from 'express';
import * as fs from 'fs';
import * as https from 'https';
import * as cors from 'cors';
import routes from './app/routes';
import db from './config/db';
import { MongoClient } from "mongodb";

const app = express();
const port = 3000;
const client = new MongoClient(db.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());

app.use(express.urlencoded({extended: true}));

app.use(express.json());

app.get('/', (request, response) => {
  response.send(`
<form action="/" method="post">
    <input name="message" value="Сообщение">
    <button type="submit">
</form>
`)
});

app.post('/', (request, response) => {
    console.log(request.body);
    response.send('<b>Hello from Express!!!</b>');
});

client.connect((err) => {
  if (err) return console.log(err);
  routes(app, client);
// https.createServer({
//     key: fs.readFileSync('server.key'),
//     cert: fs.readFileSync('server.cert')
// }, app).listen(port, () => {
  app.listen(port, () => {
    console.log(`server is listening on http://localhost:${port}/`)
  });
});
