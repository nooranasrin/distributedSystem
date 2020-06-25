const express = require('express');
const app = express();
const ImageSets = require('./imageSets');
const Scheduler = require('./scheduler');

const getWorkerOptions = function () {
  return { host: 'localhost', port: 5000, method: 'post', path: '/process' };
};

const PORT = 8000;
const imageSets = new ImageSets();
const scheduler = new Scheduler(getWorkerOptions());

app.use((req, res, next) => {
  console.log(`${req.method}, ${req.url}`);
  next();
});

app.post('/job-completed/:id/', (req, res) => {
  let data = '';
  req.on('data', (chunk) => (data += chunk));
  req.on('end', () => {
    imageSets.completedProcessing(req.params.id, JSON.parse(data));
    scheduler.setWorkerFree();
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
