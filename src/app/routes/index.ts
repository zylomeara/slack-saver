import noteRoutes from './note_routes';
import dbRoutes from './db_routes';
import { Express } from "express";
import { MongoClient } from "mongodb";

export default function (app: Express, dbClient: MongoClient) {
  noteRoutes(app, dbClient);
  dbRoutes(app, dbClient);
}
