import { Express } from "express";
import { MongoClient } from "mongodb";
import { isSlackData } from "./db_validators";
import { mergeDeep} from "../utils";

const dbName = 'slack_data';

export default function (app: Express, dbClient: MongoClient) {
  app.get('/backup', (req, res) => {
    const clientWithPromise = (collectionName: string) =>
      new Promise((res, rej) =>
        dbClient.db(dbName)
          .collection(collectionName)
          .find({})
          .toArray((err, result) => err ? rej(err) : res(result)));

    const promises = ['channels', 'members', 'messages']
      .map(clientWithPromise);

    Promise.all(promises).then(
      ([channels, members, messages]) =>
        res.send({
          channels,
          members,
          messages
        }),
      reason => res.send({error: 'failed'})
    )
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
