class Agent {
  constructor(id, agentOptions) {
    this.id = id;
    this.agentOptions = agentOptions;
    this.isFree = true;
  }

  setBusy() {
    this.isFree = false;
  }

  setAvailable() {
    this.isFree = true;
  }
}

module.exports = Agent;
