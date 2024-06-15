const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('doctor server is running')
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

// middleware
const logger = async (req, res, next) => {
  console.log('called:', req.host, req.originalUrl);
  next()
}

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log('value of token in middleware:', token);
  if (!token) {
    return res.status(401).send({ message: 'not authorized!' })
  }
  next()
}



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviseCollection = client.db("CarDoctor").collection("services");
    const bookingCollection = client.db("CarDoctor").collection("bookings");

    // auth related api **************************
    // auth related api **************************
    app.post('/jwt', logger, async (req, res) => {
      const user = req.body;
      console.log("jwt user", user);

      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      });
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: false
        })
        .send({ success: true })
    })


    // services related api ***************************
    // services related api ***************************
    app.get('/services', logger, async (req, res) => {
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

    app.get('/bookings', logger, verifyToken, async (req, res) => {
      // console.log('token token', req.cookies.token);
      // console.log(req.query.email);
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




app.listen(port, () => {
  console.log(`Car Doctor Server is running on port: ${port}`);
})