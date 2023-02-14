// Mimicks what the prom-client Gauge does as far as collecting metrics
// Original design was to use Prometheus but had difficulty getting the
// right graphs in Grafana so switched to putting the same information in
// Postgres and then using a query like:
//
// SELECT specs.*
// FROM
//   "Blob" as btable,
//   json_to_recordset(cast(btable.blob as json))
//     AS specs(namespace text, value int)
// WHERE ref = 'ops_metrics_namespaces'
//
export class Gauge {
  _name: string;
  _values: { [key: string]: any } = {};

  constructor(config: { name: string; help: string; labelNames: string[] }) {
    this._name = config.name;
  }

  public set(labels: any, value: number) {
    this._values[JSON.stringify(labels)] = { value, labels };
  }

  public inc(labels: any, inc: number = 1) {
    const val = this._values[JSON.stringify(labels)]
      ? this._values[JSON.stringify(labels)]
      : { value: 0 };
    this._values[JSON.stringify(labels)] = { value: val.value + inc, labels };
  }

  public reset() {
    this._values = {};
  }

  public name() {
    return this._name;
  }

  public data() {
    return Object.keys(this._values).map((k: string) => {
      const record: any = { value: this._values[k].value };
      for (const [key, value] of Object.entries(this._values[k].labels)) {
        record[key] = value;
      }
      return record;
    });
  }
}
