import noteRoutes from './note_routes';
import { Express } from "express";
import { MongoClient } from "mongodb";

// @ts-ignore
export default function (app: Express, dbClient: MongoClient) {
  noteRoutes(app, dbClient)
}
