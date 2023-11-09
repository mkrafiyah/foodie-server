const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    // await client.connect();

    const foodCollection = client.db('restaurentManager').collection('allFoods');
    const orderCollection = client.db('restaurentManager').collection('order');
    
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

        const options = {
            projection: {price: 1, Quantity: 1, Name: 1, Image: 1, _id: 1}
        }
        const result = await foodCollection.findOne(query, options);
        res.send(result)
      })
      
      app.get('/foodDetail/:id', async (req, res) => {

        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await foodCollection.findOne(query);
        res.send(result)
      }) 

      //add new food
      app.post('/addNewFood', async(req, res)=>{
        const newFood = req.body;
        console.log(newFood)
        const result = await foodCollection.insertOne(newFood);
        res.send(result);
      }) 

      //get added products
      app.get('/addNewFood', async(req, res)=>{
        console.log(req.query)
        let query = {}
        if(req.query?.email){
            query = {email: req.query.email}
        }
        const result = await foodCollection.find(query).toArray();
        res.send(result);
      }) 

      //update food
      app.get('/update/:id', async(req, res)=>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await foodCollection.findOne(query)
        res.send(result)
      })

      app.put('/update/:name', async(req, res)=>{
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const options = { upsert: true };
        const updatedFood = req.body;
        const food ={
            $set:{
                name: updatedFood.name,
                image: updatedFood.image,
                category: updatedFood.category,
                quantity: updatedFood.quantity,
                description: updatedFood.description,
                origin: updatedFood.origin,
                price: updatedFood.price,
                email:updatedFood.email
            }
        }
        
        const result = await foodCollection.updateOne(filter, food, options)
        res.send(result)
      })

       //order post
    app.post('/order', async (req, res) => {
        const newOrder = req.body; 
        const result = await orderCollection.insertOne(newOrder);
        res.send(result)
      })
      //order get
      app.get('/order', async(req, res)=>{
        console.log(req.query)
        let query = {}
        if(req.query?.email){
            query = {email: req.query.email}
        }
        const result = await orderCollection.find(query).toArray();
        res.send(result);
      })

      //top order
      app.get('/order', async(req, res)=>{
        let query = {}
        if(req.query?.count){
            query = {count: req.query.count}
        }
        const result = await orderCollection.find(query).toArray();
        res.send(result);
      })

      //order delete

    app.delete('/order/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await orderCollection.deleteOne(query);
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