const http = require('http');
const express = require('express');
const app = express();
const processImage = require('./processImage');
const PORT = 5000;

const getWorkerOptions = function () {
  return { host: 'localhost', port: 8000, method: 'post' };
};

const informWorkerFree = function ({ id, tags }) {
  const options = getWorkerOptions();
  options.path = `/job-completed/${id}`;
  const req = http.request(options, (res) => {});
  req.end();
};

app.use((req, res, next) => {
  console.time(`${req.method}, ${req.url}`);
  next();
});

app.post('/process/:id/:count/:width/:height/:tags', (req, res) => {
  res.end();
  processImage(req.params)
    .then((tags) => {
      console.log(tags);
      return { id: req.id, tags };
    })
    .then(informWorkerFree);
});

app.listen(PORT, () => console.log(`server started listening on port ${PORT}`));
