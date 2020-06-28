const http = require('http');
const express = require('express');
const app = express();
const redis = require('redis');
const client = redis.createClient({ db: 1 });
const imageSets = require('./imageSets');
const processImage = require('./processImage');
const PORT = +process.argv[2] || 5000;
const ID = +process.argv[3];

const getWorkerOptions = function () {
  return { host: 'localhost', port: 8000, method: 'post' };
};

const informWorkerFree = function ({ id, tags }) {
  const options = getWorkerOptions();
  options.path = `/job-completed/${id}/${ID}`;
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
    const id = JSON.parse(data);
    imageSets.get(client, id).then((imageSet) => {
      processImage(imageSet)
        .then((tags) => {
          console.log(tags);
          imageSets.completedProcessing(client, id, tags);
          return { id, tags };
        })
        .then(informWorkerFree);
    });
  });
  res.end();
});

const main = function (id) {
  app.listen(PORT, () =>
    console.log(`server started listening on port ${PORT} and id is ${id}`)
  );
};

main(ID);
