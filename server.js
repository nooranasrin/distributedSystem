const http = require('http');
const express = require('express');
const app = express();

const PORT = 8000;
let id = 0;
let isWorkerFree = true;
const jobs = [];

setInterval(() => {
  if (isWorkerFree && jobs.length > 0) {
    const job = jobs.shift();
    console.log('Setting up worker for ', job.id);
    delegateToWorker(job.id, job.params);
  }
});

const getWorkerOptions = function () {
  return { host: 'localhost', port: 5000, method: 'post' };
};

const delegateToWorker = function (id, { width, count, height, tags }) {
  const options = getWorkerOptions();
  options.path = `/process/${id}/${count}/${width}/${height}/${tags}`;
  const req = http.request(options, (res) => {
    console.log(`Got response from worker ${res.statusCode}`);
  });
  req.end();
  isWorkerFree = false;
};

app.post('/job-completed/:id', (req, res) => {
  isWorkerFree = true;
  res.end();
});

app.use((req, res, next) => {
  console.log(`${req.method}, ${req.url}`);
  next();
});

app.post('/process/:name/:count/:width/:height/:tags', (req, res) => {
  res.send(`id:${id}`);
  res.end();
  // delegateToWorker(id, req.params);
  jobs.push({ id, params: req.params });
  id++;
});

app.listen(PORT, () => console.log(`server started listening on port ${PORT}`));
