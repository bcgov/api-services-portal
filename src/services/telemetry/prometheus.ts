import * as client from 'prom-client';

export class Telemetry {
  private register: any;

  constructor() {
    const collectDefaultMetrics = client.collectDefaultMetrics;
    this.register = new client.Registry();
    collectDefaultMetrics({ register: this.register });
  }

  public expose(server: any): void {
    server.get('/metrics', async (req: any, res: any) => {
      try {
        res.set('Content-Type', this.register.contentType);
        res.end(await this.register.metrics());
      } catch (ex) {
        res.status(500).end(ex);
      }
    });
  }

  public newCounter(name: string, help: string, labels: string[]): any {
    const counter = new client.Counter({
      name: name,
      help: help,
      // add `as const` here to enforce label names
      labelNames: labels,
      registers: [this.register],
    });
    return counter;
  }
}
