import { Express } from "express";
import { MongoClient } from "mongodb";
import { isSlackData } from "./db_validators";
import { mergeDeep} from "../utils";

const dbName = 'slack_data';
const name = 'slack_data';

export default function (app: Express, dbClient: MongoClient) {
  app.get('/backup', (req, res) => {
    const details = { '_id': 0 };
    dbClient.db(dbName).collection(name).findOne(details, (err, item) => {
      if (err) {
        res.send({'error':'An error has occurred'});
      } else {
        res.send(item);
      }
    });
  });

  app.post('/backup', (req, res) => {
    let backupData = req.body;
    const details = { '_id': 0 };

    dbClient.db(dbName).collection(name).findOne(details, (err, item) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else if (isSlackData(backupData)) {
        backupData = mergeDeep(item, backupData);

        dbClient.db(dbName).collection(name).replaceOne(details, backupData, (err, result) => {
          if (err) {
            res.send({ 'error': 'An error has occurred' });
          } else {
            // res.send(result.ops[0]);
            res.send({ 'success': 'Data saved' })
          }
        });
      } else {
        res.send({ 'success': 'Invalid data' })
      }
    });
  });
}
