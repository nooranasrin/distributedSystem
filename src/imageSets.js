const getId = function (client) {
  return new Promise((resolve, reject) => {
    client.incr('curr_id', (err, res) => {
      resolve(res);
    });
  });
};

const scheduleProcessing = function (client, id, imageSet) {
  return new Promise((resolve, reject) => {
    const status = ['status', 'scheduled'];
    const receivedAt = ['receivedAt', new Date()];
    const list = Object.keys(imageSet).reduce((list, key) => {
      return list.concat([key, imageSet[key]]);
    }, []);
    client.hmset(`job_${id}`, list.concat(status, receivedAt), (err, res) => {
      resolve(id);
    });
  });
};

const addImageSet = function (client, imageSet) {
  return new Promise((resolve, reject) => {
    getId(client)
      .then((id) => scheduleProcessing(client, id, imageSet))
      .then((imageSet) => resolve(imageSet));
  });
};

const completedProcessing = function (client, id, tags) {
  const status = ['status', 'completed'];
  const updatedTags = ['tags', JSON.stringify(tags)];
  client.hmset(`job_${id}`, status.concat(updatedTags));
};

const get = function (client, id) {
  return new Promise((resolve, reject) => {
    client.hgetall(`job_${id}`, (err, res) => resolve(res));
  });
};

module.exports = { addImageSet, completedProcessing, get };
