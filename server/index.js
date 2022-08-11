const express = require("express"); //express
const app = express(); // express --> app
const bodyParser = require("body-parser"); // body parser
var cors = require("cors"); // cors
app.use(cors()); // cors --> app
app.use(bodyParser.json()); // body parser --> app
app.use(bodyParser.urlencoded({ extended: false })); // use body parser middleware for url encoded
const ObjectId = require("mongodb").ObjectID;
require("dotenv").config();


const MongoClient = require("mongodb").MongoClient; //required always

const uri = process.env.REACT_APP_MONGO_URL;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); //unified topology set
client.connect((err) => {
  const collection = client.db("volunteer").collection("volunteerCollection"); //connecting the collection
  const organization = client
    .db("volunteer")
    .collection("organizationCollection"); //all orgnaization detail
  const event = client.db("volunteer").collection("organizationevent"); //ALL EVENT POSTED BY THE ORGANIZAIOTN
  // perform actions on the collection object

  // loading data
  app.get("/info", (req, res) => {
    collection
      .find({}) //find all data from database
      .toArray((err, document) => {
        // to array is being used to load all data from db
        res.send(document); //data send to html
      });
  });

  //GET ORGANIZATION DATA
  app.get("/organizationinfo", (req, res) => {
    event
      .find({}) //find all data from database
      .toArray((err, document) => {
        // to array is being used to load all data from db
        res.send(document); //data send to html
      });
  });

  //LOADING FOR ORGANIZATION

  app.get("/", (req, res) => {
    collection
      .find({}) //find all data from database
      .toArray((err, document) => {
        // to array is being used to load all data from db
        res.send(document); //data send to html
      });
  });

  app.get("/task", (req, res) => {
    // console.log(req.query);
    collection.find({ mail: req.query.mail }).toArray((err, document) => {
      res.send(document);
    });
  });

  // update
  app.patch("/update/:id", (req, res) => {
    console.log(req.body);

    collection
      .updateOne(
        { _id: ObjectId(req.params.id) }, //update data using update one & ObjectId for matching
        {
          $set: {
            name: req.body.name,
            mail: req.body.mail,
          },
        }
      )
      .then((result) => {
        res.send(result);
        // console.log(result);
        // result is to say that data is updated
      });
  });

  // sending/posting data to database
  app.post("/addPeople", (req, res) => {
    const pd = req.body;
    // console.log(pd);
    collection.insertOne(pd).then((result) => {
      res.send(true);
    });
  });

  //ADD ORGANIZATION EVENT AND DISPLAY IT IN ADMIN
  app.post("/eventinfoadd", (req, res) => {

    const pd = req.body;
    // console.log(pd);
    event.insertOne(pd).then((result) => {
      res.send(true);
    });
  });

  // sending/posting data to database to add organization
  app.post("/addOrganization", async (req, res) => {
    const pd = req.body;
    // console.log(req.body);
    // console.log(pd);
    var checkpoint1 = await organization.findOne({
      orgnaizationname: req.body.organizationname,
    });
    var checkpoint2 = await organization.findOne({ email: req.body.email });
    console.log(
      JSON.stringify(checkpoint1) + " " + JSON.stringify(checkpoint2)
    );
    if (checkpoint1 != null || checkpoint2 != null) {
      res.send({ success: false, statement: "ALREADY EXISTED" });
      return;
    }

    organization.insertOne(pd).then((result) => {
      res.send({ success: true });
    });
  });

  //login organizaiton

  app.post("/loginOrganization", async (req, res) => {
    console.log(req.body);
    await organization.findOne({ email: req.body.email }, (err, user) => {
      if (!user)
        return res.json({
          success: false,
          message: "Authentication failed, email not found",
        });
      //   console.log("user found",user)

      // console.log(req.body.password," ",user.password)

      if (req.body.password === user.password) {
        return res
          .status(200)
          .json({ success: true, statement: "Login success", info: user });
      } else {
        return res
          .status(401)
          .json({
            success: false,
            statement: "Invalid credencial",
            info: user,
          });
      }
    });
  });

  // app.post('/loginOrganization',async (req,res)=>{
  //   const pd=req.body;
  //   console.log(pd);

  //   var email=await organization.findOne({email:req.body.email})
  //   console.log(JSON.stringify(email))
  //   if(email==null)
  //   {
  //     res.send({success:false,statement:"WRONG EMAIL ID OR PASSWORD"})
  //     return;
  //   }

  // })

  app.post("/deleteActivity", (req, res) => {
    // console.log(req.body);

    collection
      .findOneAndDelete({ _id: ObjectId(req.body.id) })
      .then((err, doc) => {
        if (err) return res.send({ success: false, err });
        res.send({ success: true, doc });
      });
  });

  app.post("/deleteActivityOrganization", (req, res) => {
    // console.log(req.body);

    event.findOneAndDelete({ _id: ObjectId(req.body.id) }).then((err, doc) => {
      if (err) return res.send({ success: false, err });
      res.send({ success: true, doc });
    });
  });


  app.post("/updateActivity", (req, res) => {
    console.log(req.body);
    // const replacement = {
    //   title: `The Cat from Sector ${Math.floor(Math.random() * 1000) + 1}`,
    // };

    const filter={_id:ObjectId(req.body.id)}
   let newstatus;
    if(req.body.status==="Accepted")
    {
      newstatus={
        $set:{
          status:"Waiting",
        }
      };
    }
    else{
     newstatus={
      $set:{
        status:"Accepted",
      }
    };
  }
   
  collection.updateOne(filter, newstatus)
      .then((err, doc) => {
        if (err) return res.send({ success: false, err });
        res.send({ success: true, doc });
      });
  });



//   const filter = { _id: 465 };
// // update the value of the 'z' field to 42
// const updateDocument = {
//    $set: {
//       z: 42,
//    },
// };
// const result = await collection.updateOne(filter, updateDocument);


  // MongoClient.connect(url, function(err, db) {
  //   if (err) throw err;
  //   var dbo = db.db("mydb");
  //   var myquery = { address: "Valley 345" };
  //   var newvalues = { $set: {name: "Mickey", address: "Canyon 123" } };
  //   dbo.collection("customers").updateOne(myquery, newvalues, function(err, res) {
  //     if (err) throw err;
  //     console.log("1 document updated");
  //     db.close();
  //   });
  // });




  // load single data
  app.get("/product/:id", (req, res) => {
    // console.log(req.params.id);
    collection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  // deleting data
  app.delete("/delete/:id", (req, res) => {
    console.log(req.params.id);
    console.log(req.query);
    collection
      .deleteOne({
        $and: [{ _id: ObjectId(req.params.id) }, { mail: req.query.mail }],
      }) //delete one & object id
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });

  console.log("DB Connected");
  //   client.close();
});

// app listen
app.listen(3006, () => {
  console.log("Listening to port at 3006 ");
});
