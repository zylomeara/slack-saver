import { Express } from "express";
import { MongoClient } from "mongodb";

export default function (app: Express, dbClient: MongoClient) {
  app.post('/notes', (req, res) => {
    const note = { text: req.body.body, title: req.body.title };

    dbClient.db('notes').collection('notes').insertOne(note, (err, result) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.send(result.ops[0]);
      }
    });
  });
}
