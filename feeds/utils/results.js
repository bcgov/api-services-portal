const { Logger } = require('../logger');

const log = Logger('results');

class ResultsService {
  init() {
    this.results = {
      'no-change': 0,
      exception: 0,
      created: 0,
      'created-failed': 0,
      updated: 0,
      deleted: 0,
      'updated-failed': 0,
      'deleted-failed': 0,
    };
  }

  inc(result) {
    this.results[result]++;
  }

  output() {
    const { results } = this;
    Object.keys(results)
      .filter((r) => results[r] != 0)
      .forEach((r) => {
        log.info('[%s] %d', String(r).padStart(15, ' '), results[r]);
      });
  }
}

module.exports = {
  ResultsService,
};
