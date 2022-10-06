require('newrelic');
const express = require("express");
const fs = require("fs");
const app = express();
const cpu = require("./controller");
const conf = {
  CPU_LOAD_PORT: 3000,
  CPU_LOAD_DEFAULT_PERCENTAGE: 0,
  CPU_LOAD_DEFAULT_PERCENTAGE_URL: null
};

const response = fs.readFileSync("./file.txt").toString(); // ~1MB

app.use(express.static('public'));

app.get("/noop", (req, res)=>{
  res.send("hellow world")
})


app.get("/sendfile", (req, res) => {
  res.send(0 + "\n" + response);
});

app.get("/sf-clutter", (req, res) => {
  console.log(req, res)
  res.send(0 + "\n" + response);
});

let tiny = 0;
app.get("/nr-cuz", (req, res) => {
  tiny += 1;
  res.send(tiny + "\n" + response);
});

const mediumProblem = [];
app.get("/medium-hold", (req, res) => {
  mediumProblem.push(response);
  res.send(mediumProblem.length + "\n" + response);
});

//  1 MB Strings
const storageBigLeak = [];
app.get("/hold-tight", (req, res) => {
  storageBigLeak.push(fs.readFileSync("./file.txt").toString());
  res.send(storageBigLeak.length + "\n" + response);
});


app.get('/blocking', (req, res) => {
  //git@github.com:jamesskinner/node-cpu-load-server.git
  
  let seconds = +req.query.seconds;
  let percent = +req.query.percent;
  if (Number.isNaN(percent)) {
    res.status(400).send('Query param percent must be a number\n');
    return;
  }
  if (req.params.seconds && Number.isNaN(seconds)) {
    res.status(400).send('Query param seconds must be number\n');
    return;
  }
  if (percent > 100 || percent < 1) {
    res.status(400).send('Percentage needs to be...a percentage\n');
    return;
  }
  cpu.blockCpu(seconds, percent, conf);
  res.send(`Blocking ${percent}% for ${seconds} seconds\n`);
});



app.listen(conf.CPU_LOAD_PORT, async () => {
  console.log('App listening',conf.CPU_LOAD_PORT );
  //git@github.com:jamesskinner/node-cpu-load-server.git
  await cpu.setDefaultPercentage(conf);
  cpu.blockCpu(0, conf.CPU_LOAD_DEFAULT_PERCENTAGE, conf);
  cpu.repeat(async () => {
    const change = await cpu.setDefaultPercentage(conf);
    if (!change) return;
    cpu.blockCpu(1, conf.CPU_LOAD_DEFAULT_PERCENTAGE, conf);
  }, 5000);
});