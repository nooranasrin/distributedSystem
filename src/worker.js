const redis = require('redis');
const client = redis.createClient({ db: 1 });
const imageSets = require('./imageSets');
const processImage = require('./processImage');

const getJob = function () {
  return new Promise((resolve, reject) => {
    client.brpop('imageList', 1, (err, res) => {
      if (res) {
        resolve(res[1]);
      } else {
        reject('no job');
      }
    });
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
    .catch(runLoop);
};

runLoop();
