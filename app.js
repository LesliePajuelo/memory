if(!process.env.NODE_ENV){
  console.log('nr')
  require('newrelic');
}

const express = require("express");
const fs = require("fs");
const app = express();
var path = require('path')
const morgan = require('morgan');
const cpu = require("./controller");

// logger

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

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
  console.log(req)
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

app.get('/hopandlock/:hop', (req, res)=>{
  let hop = req.params.hop || 1

  setTimeout(()=>{
    cpu.patchwork();
    res.send(response)
  },hop)
})
app.get('/hop/:hop', (req, res)=>{
  let hop = req.params.hop || 1
  setTimeout(()=>{
    res.send(hop + "\n" +response)
  },hop)
})


app.get('/blocking', (req, res) => {
  let value = req.query.value || 8
  q=(M,K,S,L,A)=>{for(var s=(1<<M)-1,t="",i=~(S|L|A);i&s;R=q(M,K?K+","+a:a,(S|a)>>1,L|a,(A|a)<<1),t+=t&&R?"|"+R:R)i-=a=i&-i;return L==s?K:t}
  res.send(`${value}, ${q(value, value, value, value, value)}, ${response}`)
});


app.get('/patch',(req, res)=>{
  cpu.patchwork();
  res.send(response);
})

app.listen(conf.CPU_LOAD_PORT, async () => {
  console.log('App listening',conf.CPU_LOAD_PORT );
});