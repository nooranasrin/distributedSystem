const http = require('http');

class Scheduler {
  constructor(workerOptions) {
    this.jobs = [];
    this.isWorkerFree = true;
    this.workerOptions = workerOptions;
  }

  schedule(job) {
    this.jobs.push(job);
  }

  delegateToWorker(data) {
    const options = this.workerOptions;
    const req = http.request(options, (res) => {
      console.log(`Got response from worker ${res.statusCode}`);
    });
    req.write(JSON.stringify(data));
    req.end();
    this.isWorkerFree = false;
  }

  start() {
    setInterval(() => {
      if (this.isWorkerFree && this.jobs.length > 0) {
        const job = this.jobs.shift();
        console.log('Setting up worker for ', job.id);
        this.delegateToWorker(job);
      }
    });
  }

  setWorkerFree() {
    this.isWorkerFree = true;
  }
}

module.exports = Scheduler;
