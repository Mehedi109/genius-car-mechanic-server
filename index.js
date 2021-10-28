const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ppmn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('genius-mechanic');
    const servicesCollection = database.collection('services');

    // GET API
    app.get('/services', async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    // GET Single Service
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.json(service);
    });

    // POST API
    app.post('/services', async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      console.log('hit server', service);
      res.json(result);
    });
    // UPDATE API
    app.put('/services/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const updatedService = req.body;
      console.log(updatedService);
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updatedService.name,
          price: updatedService.price,
          img: updatedService.img,
        },
      };
      const result = await servicesCollection.updateOne(
        query,
        updateDoc,
        options
      );
      console.log('updating');
      res.send(result);
    });
    // DELETE API
    app.delete('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close()
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('running genius server');
});

app.get('/hello', (req, res) => {
  res.send('hello updated here');
});

app.listen(port, () => {
  console.log('Running the server on port', port);
});

/* 
one time :
1. heroku account login 
2. heroku software install

every project:
1. git init
2. .gitigore (node_module, .env)
3. push everything to git 
4. make sure you have this script: "start": "node index.js",
5. make sure: put process.env.PORT in front of your port number
6. heroku login
7. heroku create (only one time for a project)
8. command: git push heroku main
--------------------------------------------------------------------------
for update 
1. save everything check locally
2. git add, git commit-m, git push
3. git push heroku main

*/
