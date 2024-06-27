const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: [
    'https://car-doctor-51e3e.web.app', 
    'https://car-doctor-51e3e.firebaseapp.com',
    //'http://localhost:5173' // Add localhost for development
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('doctor server is running');
});


// console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ev4byy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middleware *******************************
// middleware *******************************
// just for idea, no need

const verifyToken = (req, res, next) =>{
  const token = req.cookies?.token;
  console.log('token in the middle ware', token);
  if(!token){
    return res.status(401).send({message: 'unauthorized access'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
    if(err){
      return res.suatus(401).send({message: 'unauthorized access'})
    }
    req.user = decoded
    next();
  })
}



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviseCollection = client.db("CarDoctor").collection("services");
    const bookingCollection = client.db("CarDoctor").collection("bookings");


    // auth related api **************************
    // auth related api **************************
    app.post('/jwt', async(req, res) =>{
      const user = req.body;
      console.log('user for token', user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});

      res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      .send({success: true});
    })

    app.post('/logout', async(req, res) =>{
      const user = req.body;
      console.log('logout user:', user);
      res.clearCookie('token', {maxAge: 0}).send({success: true})
    })


    // services related api ***************************
    // services related api ***************************
    app.get('/services', async (req, res) => {
      const cursor = serviseCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const options = {
        // sort matched documents in descending order by rating
        // Include only the `title` and `imdb` fields in the returned document
        projection: { title: 1, price: 1, service_id: 1, img: 1 },
      };

      const result = await serviseCollection.findOne(query, options)
      res.send(result);
    })


    // Bookings ************************************
    // Bookings ************************************
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking)
      res.send(result)
      // console.log("bookings", booking);
    })

    app.get('/bookings', verifyToken, async (req, res) => {
      // console.log('token token from cookie:::', req.cookies.token);
      // console.log(req.query.email);
      console.log('user in the valid token', req.user);

      // if (req.query.email !== req.user.email) {
      //   return res.status(403).send({ message: 'Forbidden access' })
      // }
      if(req.query?.email !== req.user?.email){
        return res.status(403).send({message: 'Forbidden Access!!'})
      }

      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result)
    })


    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query)
      res.send(result)
      // console.log(id);
    })

    app.patch('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) }
      const updatedBookings = req.body;
      console.log(updatedBookings);

      const updateDoc = {
        $set: {
          status: updatedBookings.status
        },
      }
      const result = await bookingCollection.updateOne(filter, updateDoc)
      res.send(result)
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


if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Car Doctor Server is running on port: ${port}`);
  });
}

module.exports = app;