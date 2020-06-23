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
  req.write(JSON.stringify(tags));
  req.end();
};

app.use((req, res, next) => {
  console.log(`${req.method}, ${req.url}`);
  next();
});

app.post('/process', (req, res) => {
  let data = '';
  req.on('data', (chunk) => (data += chunk));
  req.on('end', () => {
    const params = JSON.parse(data);
    processImage(params)
      .then((tags) => {
        console.log(tags);
        return { id: params.id, tags };
      })
      .then(informWorkerFree);
  });
  res.end();
});

app.listen(PORT, () => console.log(`server started listening on port ${PORT}`));
