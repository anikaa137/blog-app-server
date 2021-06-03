const express = require('express')
const app = express()
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config()
console.log(process.env.DB_USER, process.env.DB_PASS, process.env.DB_NAME)

const port = process.env.PORT || 5000

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Readit Blog!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mivuu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('Are you there?', err)
  const blogsCollection = client.db("blogApp").collection("blogs");
    console.log('database connected successfully')

  app.post('/addingBlog', (req, res) => {
    console.log(req)
    const newBlog = req.body;
    // console.log('adding blog', newBlog)
    blogsCollection.insertOne(newBlog)
      .then(result => {
        console.log('inserted count',result.insertedCount )
        res.send(result.insertedCount > 0)
      })

    })

  app.get('/Blogs',(req,res)=>{
    blogsCollection.find()
      .toArray((err, post) => {
        // console.log('from database', post)
        res.send(post)
    })
})

   app.get('/OneUser',(req,res)=>{
    blogsCollection.find({email: req.query.email})
    .toArray((err, post) => {
        // console.log('from database', post)
        res.send(post)
    })
})

app.get('/blogDetails/:id',(req,res)=>{
  blogsCollection.find({ _id:ObjectId(req.params.id) })
    .toArray((err, documents) => {
      res.send(documents[0])
      console.log(err, documents)
})

})

// delete Blog
app.delete('/delete/:id', (req, res) => {
  // console.log(req.params.id)
  blogsCollection.deleteOne({ _id: ObjectId(req.params.id) })
    .then(result => {
      res.send(result.deletedCount > 0)
    })
})

app.patch('/updateBlog/:id', (req, res) => {
  console.log(req)
  blogsCollection.updateOne({ _id: ObjectId(req.params.id)},
    {
      $set: {
        title: req.body.title,
        blog: req.body.blog,
        Author: req.body.Author,
        email: req.body.email,
        imageURL: req.body.imageURL,
        date: req.body.date,
      }
    })
    .then(result => {
      res.json(result)
      console.log(result);
  })
})


});

app.listen(port)