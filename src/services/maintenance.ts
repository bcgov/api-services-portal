const redis = require('redis');

export class MaintenanceService {
  private handler: any;

  constructor() {
    if (process.env.SESSION_STORE === 'redis') {
      const redis = this.getRedisClient();
      this.handler = (() => {
        return {
          get: async () => redis.get('maintenance'),
          set: async (maintenance: boolean) =>
            redis.set('maintenance', maintenance),
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
    this.handler.set(maintenance);
  }

  public async get(): Promise<boolean> {
    return this.handler.get();
  }

  private getRedisClient(): any {
    return redis.createClient({
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD,
    });
  }
}

export const maintenance = new MaintenanceService();
