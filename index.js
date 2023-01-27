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
    const blogCollection = client.db('cms-blog-redux').collection('blog');
    const commentCollection = client.db('cms-blog-redux').collection('comment');
    const userCollection = client.db('cms-blog-redux').collection('user');

    app.get('/category', async (req, res) => {
      const query = {};
      const cursor = categoryCollection.find(query);
      const data = await cursor.toArray();
      res.send(data);
    });
    app.get('/category-page', async (req, res) => {
      const page = parseInt(req.query.page) - 1;
      const size = 10;
      const query = {};
      const cursor = categoryCollection.find(query)
      let category;
      if (page || size) {
        category = await cursor.skip(page * size).limit(size).toArray();
      } else {
        category = await cursor.toArray();
      }
      res.send(category);
    });

    app.get('/homeBlog', async (req, res) => {
      const query = {};
      const cursor = blogCollection.find(query);
      const data = await cursor.toArray();
      res.send(data);
    });

    app.get('/blog', async (req, res) => {
      const page = parseInt(req.query.page) - 1;
      const size = 10;
      const query = {};
      const cursor = blogCollection.find(query)
      let blog;
      if (page || size) {
        blog = await cursor.skip(page * size).limit(size).toArray();
      } else {
        blog = await cursor.toArray();
      }
      res.send(blog);
    });

    app.get('/blog/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const singleBlog = await blogCollection.findOne(query);
      res.send(singleBlog);
    })

    app.get('/page-count', async (req, res) => {
      const query = {};
      const cursor = blogCollection.find(query)
      const count = await blogCollection.countDocuments();
      res.send({ count });
    })

    app.get('/category/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await categoryCollection.findOne(query)
      res.send(result)
    })

    app.post('/category-upload', async (req, res) => {
      const addData = req.body;
      const result = await categoryCollection.insertOne(addData)
      res.send(result)
    })

    app.post('/comment-upload', async (req, res) => {
      const addData = req.body;
      const result = await commentCollection.insertOne(addData)
      res.send(result)
    })

    app.get('/comment', async (req, res) => {
      const query = {};
      const cursor = commentCollection.find(query);
      const data = await cursor.toArray();
      res.send(data);
    });

    app.get('/user', async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const data = await cursor.toArray();
      res.send(data);
    });

    app.post('/blog-upload', async (req, res) => {
      const addData = req.body;
      const result = await blogCollection.insertOne(addData)
      res.send(result)
    })

    app.post('/category-upload', async (req, res) => {
      const addData = req.body;
      const result = await categoryCollection.insertOne(addData)
      res.send(result)
    })


    app.put('/category/:id', async (req, res) => {
      const id = req.params.id;
      const updateCategory = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          categoryName: updateCategory.categoryName
        }
      };
      const result = await categoryCollection.updateOne(filter, updateDoc, options)
      res.send(result)
    })

    app.put('/update-blog/:id', async (req, res) => {
      const id = req.params.id;
      const updateBlog = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          blogTitle: updateBlog.blogTitle,
          content: updateBlog.content,
          blogCategory: updateBlog.blogCategory,
          featuredImage: updateBlog.blogImage,
          featuredBlog: updateBlog.featuredBlog
        }
      };
      const result = await blogCollection.updateOne(filter, updateDoc, options)
      res.send(result)
    })

    app.delete('/category-delete/:id', async (req, res) => {
      const id = req.params.id;
      const result = await categoryCollection.deleteOne({ _id: ObjectId(id) })
      res.send(result)
    })

    app.delete('/blog-delete/:id', async (req, res) => {
      const id = req.params.id;
      const result = await blogCollection.deleteOne({ _id: ObjectId(id) })
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