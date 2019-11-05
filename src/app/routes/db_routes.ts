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

    const batchUpdates = (collectionName: string) =>
      new Promise(
        (res, rej) => {
          const batch = dbClient.db(dbName)
            .collection(collectionName)
            .initializeUnorderedBulkOp();
          const items = backupData[collectionName] || [];

          // @ts-ignore
          items.forEach(item => {
            batch.find({ _id: item._id }).upsert().updateOne({ $set: item })
          });

          batch.execute((err, result) => err ? rej(0) : res(1));
        }
      );

    const promises = ['channels', 'members', 'messages']
      .map(batchUpdates);

    Promise.all(promises).then(value => {
      res.send(value);
    }, reason => {
      res.send({'error': 'failed'})
    })
  });
}
