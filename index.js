const express = require('express')
const app = express()
const port = process.env.PORT || 5000
var cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

app.use(cors())
app.use(express.json())
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fshf8lh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {

    const categoryCollection = client.db('cms-blog-redux').collection('category');
    const blogCollection = client.db('cms-blog-redux').collection('blog');
    const commentCollection = client.db('cms-blog-redux').collection('comment');
    const userCollection = client.db('cms-blog-redux').collection('user');
    const favoriteCollection = client.db('cms-blog-redux').collection('favorite');

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

    app.get('/users', verifyJWT, async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const data = await cursor.toArray();
      res.send(data);
    });

    app.get('/blog', verifyJWT, async (req, res) => {
      const page = parseInt(req.query.page) - 1;
      const size = 10;
      const query = {};
      const cursor = blogCollection.find(query).sort({ _id: -1 })
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

    app.get('/favorite-data', verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email
      if (email === decodedEmail) {
        const query = { userEmail: email }
        const result = await favoriteCollection.find(query).toArray()
        res.send(result)
      }
    })

    app.post('/comment-upload', verifyJWT, async (req, res) => {
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

    app.get('/user/:id', async (req, res) => {
      const id = req.params.id;
      const query = { uid: id }
      const result = await userCollection.findOne(query)
      res.send(result)
    });

    app.post('/blog-upload', verifyJWT, async (req, res) => {
      const addData = req.body;
      const result = await blogCollection.insertOne(addData)
      res.send(result)
    })

    app.post('/category-upload', verifyJWT, async (req, res) => {
      const addData = req.body;
      const result = await categoryCollection.insertOne(addData)
      res.send(result)
    })

    app.put('/add-favorite', async (req, res) => {
      const id = req.query.postId
      const data = req.body;
      const filter = { postId: id }
      const options = { upsert: true };
      const updateDoc = {
        $set: data,
      };
      const result = await favoriteCollection.updateOne(filter, updateDoc, options);
      res.send(result)
    })

    app.put('/user/admin/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const adminRequest = req.decoded.email;
      const data = req.body
      // console.log(data)
      const adminRequestAccount = await userCollection.findOne({ email: adminRequest });
      console.log(adminRequestAccount)
      if (adminRequestAccount.role === 'admin') {
        const filter = { _id: ObjectId(id) };
        const updateDoc = {
          $set: { role: data.role },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      } else {
        return res.status(403).send({ message: 'forbidden access' })
      }
    })

    app.get('/admin/:email', verifyJWT,async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const adminCheck = user.role === 'admin';
      res.send({ admin: adminCheck })
    })

    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '24h' });
      res.send({ result, token });
    })

    app.put('/comment-update/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const updateComment = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          blogComment: updateComment.editComment
        }
      };
      const result = await commentCollection.updateOne(filter, updateDoc, options)
      res.send(result)
    })

    app.put('/category/:id', verifyJWT, async (req, res) => {
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

    app.put('/update-blog/:id', verifyJWT, async (req, res) => {
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

    app.delete('/delete-favorite/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const result = await favoriteCollection.deleteOne({ postId: id })
      res.send(result)
    })

    app.delete('/delete-comment/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const result = await commentCollection.deleteOne({ _id: ObjectId(id) })
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

    app.delete('/user-delete/:id', async (req, res) => {
      const id = req.params.id;
      const result = await userCollection.deleteOne({ _id: ObjectId(id) })
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