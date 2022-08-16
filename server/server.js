const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (_req, res) => {
  res.send(process.env);
});

app.listen(1337, () => {
  console.log("Listening on port 1337...");
});
