const express = require('express');
const app = express();

const jobs = [];

app.get('/request-job', (req, res) => {
  let job = {};
  if (jobs.length > 0) {
    job = jobs.shift();
  }
  res.write(JSON.stringify(job));
  res.end();
});

app.post('/push-job/:id', (req, res) => {
  jobs.push(req.params);
});

app.listen(8001, () => console.log(`server started listening on port 8001`));
