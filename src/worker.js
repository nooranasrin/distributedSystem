const http = require('http');
const redis = require('redis');
const client = redis.createClient({ db: 1 });
const imageSets = require('./imageSets');
const processImage = require('./processImage');

const getWorkerOptions = function () {
  return { host: 'localhost', port: 8000, method: 'get', path: '/request-job' };
};

const getJob = function () {
  return new Promise((resolve, reject) => {
    const options = getWorkerOptions();
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (JSON.parse(data).id != undefined) {
          resolve(JSON.parse(data).id);
        } else {
          reject('No job found');
        }
      });
    });
    req.end();
  });
};

const runLoop = function () {
  getJob()
    .then((id) => {
      imageSets.get(client, id).then((imageSet) => {
        processImage(imageSet)
          .then((tags) => {
            console.log(tags);
            imageSets.completedProcessing(client, id, tags);
            return id;
          })
          .then((id) => console.log('finished', id))
          .then(runLoop);
      });
    })
    .catch(() => setTimeout(runLoop, 1000));
};

runLoop();
