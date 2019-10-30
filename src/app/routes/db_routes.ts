import { Express } from "express";
import { MongoClient } from "mongodb";

export default function (app: Express, dbClient: MongoClient) {
  app.post('/backup', (req, res) => {
    const backupData = req.body;
    const details = { '_id': 0 };

    dbClient.db('slack_data').collection('slack_data').replaceOne(details, backupData, (err, result) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.send(result.ops[0]);
      }
    });

    dbClient.close();
  });
}
