'use strict';

const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL || 'mongodb://localhost:27017/veritabani_adi';

const client = new MongoClient(url);

let db = null;

async function connectMongo() {

  if (db) return db;

  await client.connect();
  db = client.db();

  console.log('✅ MongoDB bağlantısı kuruldu.');

  return db;

}

module.exports = { connectMongo, client };
