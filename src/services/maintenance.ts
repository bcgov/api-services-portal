const redis = require('redis');

export class MaintenanceService {
  private handler: any;

  constructor() {
    if (process.env.SESSION_STORE === 'redis') {
      this.handler = (() => {
        const client = this.getRedisClient();
        client.on('error', (err: any) =>
          console.log('Redis Client Error', err)
        );

        return {
          get: async () => {
            return new Promise((resolve, reject) => {
              client.get('maintenance', function (err: any, data: any) {
                if (err) {
                  reject(err);
                } else {
                  resolve(data === 'true');
                }
              });
            });
          },
          set: (maintenance: boolean) => {
            client.set('maintenance', '' + maintenance);
          },
        };
      })();
    } else {
      this.handler = (() => {
        let state = false;
        return {
          get: async () => state,
          set: (maintenance: boolean) => {
            state = maintenance;
          },
        };
      })();
    }
  }

  public set(maintenance: boolean) {
    this.handler.set(maintenance);
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
