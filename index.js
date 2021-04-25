const express = require("express");
const { getUID, getPhoto } = require("./Services");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;

const server = express();

//DATABASE
const connectionString = process.env.connectionString;

MongoClient.connect(
  connectionString,
  {
    useUnifiedTopology: true,
  },
  (err, client) => {
    console.log("connect to Database");

    const destColletion = client.db("test").collection("Destination");

    server.use(cors());

    //data from json
    server.use(express.json());
    //data from form
    server.use(express.urlencoded({ extended: true }));

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
      console.log(`Server is listening on ${PORT}.`);
    });

    //GET / best practice is to use query parameters
    server.get("/", (req, res) => {
      console.log("Inside Get");
      destColletion
        .find()
        .toArray()
        .then((result) => {
          res.send(result);
        });
    });

    // server.get("/:location",(req,res)=>{
    //   const location = req.params;
    //   if(!location) return res.status(400).json({error:"need location"});

    //   const locations = db.filter(place => place.location === location);
    //   res.send(locations);
    // })

    //POST /
    server.post("/", async (req, res) => {
      console.log(req.body);
      const { name, location, description } = req.body;

      if (!name || !location) {
        return res
          .status(400)
          .json({ error: "name and location are required" });
      }

      const uid = getUID();
      const photo = await getPhoto(name);
      const newLocation = {
        uid,
        name,
        location,
        photo,
        description: description || "",
      };
      destColletion.insertOne(newLocation);

      res.redirect("/");
    });

    //PUT /?uid :UPDATE operation
    server.put("/", async (req, res) => {
      console.log("Inside PUT");
      const { uid, name, location, description } = req.body;

      if (name || location || description) {
        destColletion
          .findOneAndUpdate(
            { uid: uid },
            {
              $set: {
                name: name,
                location: location,
                photo: await getPhoto(name),
                description: description,
              },
            },
            { returnOriginal: false }
          )
          .then(() =>
            destColletion
              .find()
              .toArray()
              .then((result) => {
                res.send(result);
              })
          );
      }
    });

    //DELETE
    server.delete("/", (req, res) => {
      console.log("INside DElete");
      const { uid } = req.body;

      destColletion.deleteOne({ uid: uid }).then(() =>
        destColletion
          .find()
          .toArray()
          .then((result) => res.send(result))
      );
    });
  }
);
