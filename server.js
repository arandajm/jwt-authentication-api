const express = require("express");
const mongoose = require("mongoose");

const app = express();

// DB config keys
const db = require("./config/keys").mongoURI;

// Connect to MongoDB with Mongoose
mongoose
  .connect(db)
  .then(() => console.log("MongoDB Connected!"))
  .catch(err => console.error(err));

app.get("/", (req, res) => {
  res.send("Hello!!");
});

//Heroku port set process.env.PORT, default 5000;
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
