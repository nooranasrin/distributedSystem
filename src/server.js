const express = require('express');
const app = express();
const ImageSets = require('./imageSets');
const Scheduler = require('./scheduler');
const Agent = require('./agent');

const getWorkerOptions = function (port) {
  return { host: 'localhost', port, method: 'post', path: '/process' };
};

const PORT = 8000;
const imageSets = new ImageSets();
const scheduler = new Scheduler();
scheduler.addAgent(new Agent(1, getWorkerOptions(5000)));

app.use((req, res, next) => {
  console.log(`${req.method}, ${req.url}`);
  next();
});

app.post('/job-completed/:id/', (req, res) => {
  let data = '';
  req.on('data', (chunk) => (data += chunk));
  req.on('end', () => {
    imageSets.completedProcessing(req.params.id, JSON.parse(data));
    scheduler.setAgentFree(1);
    res.end();
  });
});

app.get('/status/:id', (req, res) => {
  const imageSet = imageSets.get(req.params.id);
  res.send(JSON.stringify(imageSet));
});

app.post('/process/:name/:count/:width/:height/:tags', (req, res) => {
  const job = imageSets.addImageSet(req.params);
  res.send(`id:${job.id}`);
  res.end();
  scheduler.schedule(job);
});

app.listen(PORT, () => console.log(`server started listening on port ${PORT}`));
