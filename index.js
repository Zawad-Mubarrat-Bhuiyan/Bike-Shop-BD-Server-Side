const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;
// middleware 

app.use(cors());
app.use(express.json());

// database connection 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vbrru.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
      try {
            await client.connect();
            const database = client.db('bikeshop');
            const productsCollection = database.collection('products');
            const usersCollection = database.collection('users');
            const orderCollection = database.collection('orders');
            const reviewCollection = database.collection('review');
            // get multiple products 
            app.get('/products', async (req, res) => {
                  const cursor = productsCollection.find({});
                  const products = await cursor.toArray();
                  res.send(products);
            })
            //delete products
            app.delete('/products/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: ObjectId(id) };
                  const result = await productsCollection.deleteOne(query);
                  // console.log("deleting user with id", result);
                  res.json(result)
            })
            // get single products 
            app.get('/products/:id', async (req, res) => {
                  const id = req.params.id
                  const query = { _id: ObjectId(id) }
                  const result = await productsCollection.findOne(query);
                  res.send(result)
            })

            // add products 
            app.post('/products', async (req, res) => {
                  const order = req.body;
                  const result = await productsCollection.insertOne(order)
                  res.json(result)
            })

            // insert orders 
            app.post('/orders', async (req, res) => {
                  const order = req.body;
                  const result = await orderCollection.insertOne(order)
                  res.json(result)
            })
            // get single products 
            app.get('/orders', async (req, res) => {
                  const email = req.query.email;
                  // console.log(email)
                  const query = { email: email }
                  const cursor = orderCollection.find(query);
                  const orders = await cursor.toArray();
                  res.json(orders);
            })
            app.get('/allorders', async (req, res) => {
                  const cursor = orderCollection.find({});
                  const orders = await cursor.toArray();
                  res.send(orders);
            })
            // delete orders 
            app.delete('/orders/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: ObjectId(id) };
                  const result = await orderCollection.deleteOne(query);
                  // console.log("deleting user with id", result);
                  res.json(result)
            })

            // insert review 
            app.post('/reviews', async (req, res) => {
                  const review = req.body;
                  const result = await reviewCollection.insertOne(review)
                  res.json(result)
            })

            //get multiple review 
            app.get('/reviews', async (req, res) => {
                  const cursor = reviewCollection.find({});
                  const review = await cursor.toArray();
                  res.send(review);
            })

            // update order 
            app.get('/orders/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: ObjectId(id) };
                  const newQuery = { $set: { status: 'shipped' } }
                  const result = await orderCollection.updateOne(query, newQuery);
                  // console.log('load user with id :', id)
                  res.json(result)
            })
            app.get('/users/:email', async (req, res) => {
                  const email = req.params.email;
                  const query = { email: email };
                  const user = await usersCollection.findOne(query);
                  let isAdmin = false;
                  if (user?.role === 'admin') {
                        isAdmin = true
                  }
                  res.json({ admin: isAdmin })
            })
            app.post('/users', async (req, res) => {
                  const user = req.body;
                  const result = await usersCollection.insertOne(user);
                  console.log(result);
                  res.json(result);
            });
            app.put('/users', async (req, res) => {
                  const user = req.body;
                  const filter = { email: user.email };
                  const options = { upsert: true };
                  const updateDoc = { $set: user };
                  const result = await usersCollection.updateOne(filter, updateDoc, options);
                  res.json(result);
            });
            app.put('/users/admin', async (req, res) => {
                  const user = req.body;
                  const filter = { email: user.email };
                  const updateDoc = { $set: { role: 'admin' } };
                  const result = await usersCollection.updateOne(filter, updateDoc);
                  res.json(result);
            })

      }
      finally {
            // await client.close();
      }
}
run().catch(console.dir);

app.get('/', (req, res) => {
      res.send('Hello Bike Shop Community')
})

app.listen(port, () => {
      console.log(`listening at ${port}`)
})
