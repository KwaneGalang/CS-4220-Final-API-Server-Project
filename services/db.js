// mongodb+srv://admin:<db_password>@cluster0.vbffc2e.mongodb.net/?appName=Cluster0

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

// wraps MongoClient and exposes simple helper methods for our app
const mongo = () => {
    // load in env vars from the .env file
    dotenv.config();

    // build the connection string from env vars
    const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;
    const mongoURI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`;

    let client;
    let db;

    // open a connection to the database
    async function connect() {
        try {
            client = new MongoClient(mongoURI);
            await client.connect();
            db = client.db();

            console.log('Connected to Mongo');
        } catch (error) {
            console.error(error);
        }
    }

    // close the database connection
    async function close() {
        try {
            await client.close();

            console.log('Closed Connection to Mongo');
        } catch (error) {
            console.error(error);
        }
    }

    // insert a single document into the given collection
    async function insert(collectionName, data) {
        try {
            const collection = db.collection(collectionName);
            return await collection.insertOne(data);
        } catch (error) {
            console.error(error);
        }
    }

    // returns a cursor for the given collection, filtered by query if provided
    async function find(collectionName, query) {
        try {
            const collection = db.collection(collectionName);
            // if no query is passed, fetch all documents
            const cursor = query ? collection.find(query) : collection.find({});
            return await cursor;
        } catch (error) {
            console.error(error);
        }
    }

    async function update(collectionName, query, data) {
        try {
            const collection = db.collection(collectionName);
            // specify the update to set a value for the field
            return await collection.updateOne(query, { $set: data });
        } catch (error) {
            console.error(error);
        }
    }

    return {
        connect,
        close,
        insert,
        find,
        update
    };
};

export default mongo();
