const processImage = function (image) {
  return new Promise((resolve, reject) => {
    let a = 0;
    let b = 0;
    for (let count = 0; count < +image.count; count++) {
      for (let height = 0; height < +image.height; height++) {
        for (let width = 0; width < +image.width; width++) {
          a = 1 - a;
          b = b * b;
        }
      }
    }
    let tags = image.tags.split('_');
    resolve(tags);
  });
};

module.exports = processImage;
