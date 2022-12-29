const express = require('express')
const app = express()
const port = process.env.PORT || 5000
var cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())
require('dotenv').config()



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fshf8lh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
  try {

    const categoryCollection = client.db('cms-blog-redux').collection('category');

    app.get('/category', async (req, res) => {
      const query = {};
      const cursor = categoryCollection.find(query);
      const data = await cursor.toArray();
      res.send(data);
    });

    app.post('/category-upload', (req, res) => {
      const addData = req.body;
      const result = categoryCollection.insertOne(addData)
      res.send(result)
    })

    app.delete('/category-delete/:id', async (req, res) => {
      const id = req.params.id;
      const result = await categoryCollection.deleteOne({_id: ObjectId(id)})
      res.send(result)
    })


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})