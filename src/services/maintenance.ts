const redis = require('redis');

export class MaintenanceService {
  private handler: any;

  constructor() {
    if (process.env.SESSION_STORE === 'redis') {
      this.handler = (async () => {
        const client = this.getRedisClient();
        client.on('error', (err: any) =>
          console.log('Redis Client Error', err)
        );

        return {
          get: async () => (await client.get('maintenance')) === 'true',
          set: async (maintenance: boolean) => {
            console.log('GET ' + (await client.get('maintenance')));
            console.log(' THEN ' + maintenance);
            await client.set('maintenance', '' + maintenance);
          },
        };
      })();
    } else {
      this.handler = (() => {
        let state = false;
        return {
          get: async () => state,
          set: async (maintenance: boolean) => {
            state = maintenance;
          },
        };
      })();
    }
  }

  public async set(maintenance: boolean) {
    (await this.handler).set(maintenance);
  }

  public async get(): Promise<boolean> {
    return (await this.handler).get();
  }

  private getRedisClient(): any {
    return redis.createClient({
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD,
    });
  }
}

export const maintenance = new MaintenanceService();
