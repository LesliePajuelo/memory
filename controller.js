const packageLock = require("./package-lock.json")

patchwork = function(){
  let newLock = Object.create(packageLock)
  let packages = Object.keys(newLock.packages);
  
  packages.forEach((package)=>{
    let temp = package.integrity
    package.integrity = package.resolved
  }) 
  return packages;
}
let activeInteval;
// Set an interval which blocks for given % of a second, then waits for the
// remaining part of the second before doing the same again
function blockCpu(seconds, percent, conf) {
  clearSingleInterval();

  const blockFor = (1000 / 100) * percent;
  const waitFor = 1000 - blockFor;

  const handler = singleInterval(() => block(blockFor), waitFor);
  activeInteval = handler;
  if (seconds) {
    setTimeout(() => {
      if (activeInteval === handler) {
        blockCpu(1,1,conf);
      }
    }, seconds * 1000);
  }
}

function block(blockFor) {
  const blockEnd = Date.now() + blockFor;
  while (Date.now() < blockEnd) {
    Math.random(); // eslint-disable-line
  }
}

let intervalId;
function singleInterval(f, timeout, id) {
  if (!id) {
    id = Date.now();
    intervalId = id;
  }
  setTimeout(() => {
    if (id !== intervalId) return;
    f();
    singleInterval(f, timeout, id);
  }, timeout);
  return id;
}
function clearSingleInterval() {
  intervalId = null;
}

function filterObj(obj, filter) {
  return Object.entries(obj)
    .filter(([k, v]) => filter(v, k))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
}

async function setDefaultPercentage(conf) {
  const before = conf.CPU_LOAD_DEFAULT_PERCENTAGE;
  if (!conf.CPU_LOAD_DEFAULT_PERCENTAGE_URL) return false;
  try {
    const response = await got(conf.CPU_LOAD_DEFAULT_PERCENTAGE_URL);
    const percent = +response.body;
    if (Number.isNaN(percent)) throw new Error(`Bad percent from URL: ${response.body}`);
    conf.CPU_LOAD_DEFAULT_PERCENTAGE = percent;
  } catch (e) {
    console.log('Failed to load percent from url', conf.CPU_LOAD_DEFAULT_PERCENTAGE_URL);
    console.error(e);
  }
  if (before !== conf.CPU_LOAD_DEFAULT_PERCENTAGE) return true;
  return false;
}

function repeat(task, gap) {
  task().then(() => {
    setTimeout(() => repeat(task, gap), gap);
  });
}


module.exports = {blockCpu, setDefaultPercentage, repeat, patchwork}