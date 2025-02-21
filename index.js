require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = process.env.port || 4000;
const app = express();

// middleswars
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ejql3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const userCollection = client.db("Tasks").collection("users");
   const tasksCollection = client.db("Tasks").collection('tasks');

    app.post('/users', async (req, res) => {
        const user = req.body;
      const query = { email: user.email }
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: 'user already exists', insertedId: null })
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
});
app.get('/users',async (req, res) => {
    const result = await userCollection.find().toArray();
    res.send(result);
  });
  app.post("/tasks", async (req, res) => {
    const newTask = {
      title: req.body.title,
      description: req.body.description || "",
      category: req.body.category || "To-Do",
      timestamp: new Date(),
      email:req.body.email,
    };
    const result = await tasksCollection.insertOne(newTask);
    res.send(result);
  });

  app.get("/tasks/:email", async (req, res) => {
    const {email} = req.params;
    const tasks = await tasksCollection.find({email}).toArray();
    res.send(tasks);
  });
  app.get('/tasks',async(req,res)=>{
    const tasks = await tasksCollection.find().toArray();
    res.send(tasks);
  })
  
  app.put("/tasks/:id", async (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    res.send(result);
  });
  
  app.delete("/tasks/:id", async (req, res) => {
    const id = req.params.id;
    const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get('/',async(req,res)=>{
    res.send('Server is Running')
})
app.listen(port,()=>{
    console.log(`Server is running in ${port}`)
})