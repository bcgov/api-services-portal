export interface IssuerMisconfigDetail {
  reason: string;
  description: string;
  status: string;
}

export class IssuerMisconfigError extends Error {
  public errors: IssuerMisconfigDetail[];

  constructor(message: IssuerMisconfigDetail) {
    super(JSON.stringify(message));
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.errors = [message];
  }

  text() {
    const detail = this.errors[0];
    return `[status] "${detail.status}" [reason] "${detail.reason}" [description] "${detail.description}"`;
  }
}
