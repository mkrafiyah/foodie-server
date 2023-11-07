const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rfohvfe.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const foodCollection = client.db('restaurentManager').collection('allFoods');
    
    //total food items
    app.get('/allFoods', async(req, res)=>{
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size)
        console.log(page, size)
        const cursor = foodCollection.find().skip( page * size).limit(size);
        const result = await cursor.toArray();
        res.send(result)
    })

    //Name
    app.get('/allFoods/:Name', async (req, res) => {

        const name_in_param = req.params.Name;
        console.log(name_in_param);
        const result = await foodCollection.find({ Name: name_in_param }).toArray();
        console.log(result);
        res.send(result);
  
      })

       //id
    app.get('/allFoods/:Name/foodDetail/:id', async (req, res) => {

        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await foodCollection.findOne(query);
        res.send(result)
      })

    //total count
    app.get('/allFoodsCount', async(req, res)=>{
        const count = await foodCollection.estimatedDocumentCount();
        res.send({count});
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('restaurent server is running')
})

app.listen(port, ()=>{
    console.log(`restaurent server is running on port ${port}`)
})