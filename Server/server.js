const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

// MongoDB Connection
mongoose.connect(
  "mongodb://localhost:27017/votingDB"
)
.then(() => {

  console.log("MongoDB Connected");

})

.catch((err) => {

  console.log(err);

});

// User Schema
const UserSchema = new mongoose.Schema({

  username: String,

  password: String,

  voterId: String

});

// User Model
const User = mongoose.model(
  "User",
  UserSchema
);

// Register API
app.post("/register", async (req, res) => {

  try {

    const existingUser = await User.findOne({

      username: req.body.username

    });

    if (existingUser) {

      return res.send(
        "Username already exists"
      );

    }

    const user = new User(req.body);

    await user.save();

    res.send("Registration Successful");

  }

  catch (error) {

    console.log(error);

    res.send("Server Error");

  }

});

// Login API
app.post("/login", async (req, res) => {

  const { username, password } = req.body;

  const user = await User.findOne({

    username,

    password

  });

  if (user) {

    res.json(user);

  }

  else {

    res.json({

      message: "Invalid Username or Password"

    });

  }

});

// Start Server
app.listen(5000, () => {

  console.log("Server Started");

});