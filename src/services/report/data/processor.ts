import { getNamespaces, getPolicies, processPolicies } from '.';
import PromisePool from 'es6-promise-pool';

interface ReportContext {
  users: string[];
  clients: string[];
  cache: Map<string, any>;
}

export class ReportProcessorService {
  reportContext: ReportContext;
  keystoneContext: any;

  constructor(keystoneContext: any) {
    this.keystoneContext = keystoneContext;
    this.reportContext = {
      users: [],
      clients: [],
      cache: {} as Map<string, any>,
    };
  }

  public async process() {
    const nsList: string[] = await getNamespaces();
    nsList.forEach(nsHandler);
  }

  public async getUser(username: string) {
    // add another item to process in the ProcessPool
    await this.concurrentWork(producer());
  }

  public async concurrentWork(producer: any, concurrency = 5) {
    var pool = new PromisePool(await producer, concurrency);

    // Start the pool.
    var poolPromise = pool.start();

    // Wait for the pool to settle.
    return poolPromise.then(
      function () {
        console.log('All promises fulfilled');
      },
      function (error: any) {
        console.log('Some promise rejected: ' + error.message);
        throw Error('Some promise rejected: ' + error.message);
      }
    );
  }
}

async function nsHandler(ns: string) {
  console.log('nsHandle', ns);

  const policies = await getPolicies();
  processPolicies(policies);
}

function producer() {
  const work = [];
  let index = 0;
  return () => {
    index++;
    if (index == 10) {
      return null;
    }
    // if the user is already cached then skip it
    // otherwise make a call to get the user
    console.log('Produce!');
    return new Promise((resolve, reject) => resolve(null));
  };
}
