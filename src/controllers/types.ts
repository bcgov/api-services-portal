export class TsoaErrorWrapper {
  inner: Error;
  constructor(inner: Error) {
    this.inner = inner;
  }
}
