const express = require('express');
const app = express();
const redis = require('redis');
const client = redis.createClient({ db: 1 });
const imageSets = require('./imageSets');

const PORT = 8000;

app.use((req, res, next) => {
  console.log(`${req.method}, ${req.url}`);
  next();
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
    client.lpush('imageList', id, () => {});
  });
});

app.listen(PORT, () => console.log(`server started listening on port ${PORT}`));
