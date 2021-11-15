export class IssuerMisconfigError extends Error {
  public errors: any;

  constructor(message: any) {
    super(JSON.stringify(message));
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.errors = message;
  }
}
