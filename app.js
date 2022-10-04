require('newrelic');
const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

const response = fs.readFileSync("./file.txt").toString(); // ~1MB

app.use(express.static('public'));

app.get("/noop", (req, res) => {
  res.send(0 + "\n" + response);
});

let slowLeak = 0;
app.get("/slow-leak", (req, res) => {
  slowLeak += 1;
  res.send(slowLeak + "\n" + response);
});

// The array storageSmallLeak has an increasing length, containing references to a long string
const storageSmallLeak = [];
app.get("/small-leak", (req, res) => {
  storageSmallLeak.push(response);
  const counterSmallLink = storageSmallLeak.length;
  res.send(counterSmallLink + "\n" + response);
});

// The array storageBigLeak has an increasing length, containing long strings (of 1 MB each)
const storageBigLeak = [];
app.get("/big-leak", (req, res) => {
  storageBigLeak.push(fs.readFileSync("./file.txt").toString());
  const counterBigLink = storageBigLeak.length;
  res.send(counterBigLink + "\n" + response);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
