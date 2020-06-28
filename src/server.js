const express = require('express');
const app = express();
const redis = require('redis');
const client = redis.createClient({ db: 1 });
const imageSets = require('./imageSets');
const Scheduler = require('./scheduler');
const Agent = require('./agent');

const getWorkerOptions = function (port) {
  return { host: 'localhost', port, method: 'post', path: '/process' };
};

const PORT = 8000;
const scheduler = new Scheduler();
scheduler.addAgent(new Agent(1, getWorkerOptions(5000)));
scheduler.addAgent(new Agent(2, getWorkerOptions(5001)));

app.use((req, res, next) => {
  console.log(`${req.method}, ${req.url}`);
  next();
});

app.post('/job-completed/:id/:ID', (req, res) => {
  scheduler.setAgentFree(+req.params.ID);
  res.end();
});

app.get('/status/:id', (req, res) => {
  imageSets.get(client, req.params.id).then((imageSet) => {
    res.send(JSON.stringify(imageSet));
  });
});

app.post('/process/:name/:count/:width/:height/:tags', (req, res) => {
  imageSets.addImageSet(client, req.params).then((id) => {
    res.send(`id:${id}`);
    res.end();
    scheduler.schedule(id);
  });
});

app.listen(PORT, () => console.log(`server started listening on port ${PORT}`));
