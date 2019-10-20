import * as express from 'express';
import * as fs from 'fs';
import * as https from 'https';

const app = express();
const port = 3000;

app.use(express.urlencoded());

app.use(express.json());

app.get('/', (request, response) => {
  response.send('Hello from Express!')
});

app.post('/', (request, response) => {
    console.log(request.body);
    // response.set('Access-Control-Allow-Origin', '*')
    response.send('Hello from Express!')
});

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(port, () => {
  // if (err) {
  //   return console.log('something bad happened', err)
  // }
  console.log(`server is listening on ${port}`)
});
