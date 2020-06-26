const http = require('http');

class Scheduler {
  constructor() {
    this.jobs = [];
    this.isWorkerFree = true;
    this.agents = [];
  }

  addAgent(agent) {
    this.agents.push(agent);
  }

  schedule(job) {
    const agent = this.agents.find((agent) => agent.isFree);
    if (agent) {
      this.delegateToWorker(job, agent);
    } else {
      this.jobs.push(job);
    }
  }

  delegateToWorker(data, agent) {
    const options = agent.agentOptions;
    const req = http.request(options, (res) => {
      console.log(`Got response from worker ${res.statusCode}`);
    });
    req.write(JSON.stringify(data));
    req.end();
    agent.setBusy();
  }

  setAgentFree(id) {
    const agent = this.agents.find((agent) => agent.id === id);
    agent.setAvailable();
    if (this.jobs.length > 0) {
      const job = this.jobs.shift();
      this.delegateToWorker(job, agent);
    }
  }
}

module.exports = Scheduler;
