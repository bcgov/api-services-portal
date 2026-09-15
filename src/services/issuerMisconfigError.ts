export interface IssuerMisconfigDetail {
  reason: string;
  description: string;
  status: string;
  statusCode: number;
}

/** Pass 4xx from the upstream through; anything else stays a 500. */
export function httpStatusForIssuerMisconfig(
  detail: IssuerMisconfigDetail
): number {
  const code = detail?.statusCode;
  if (typeof code === 'number' && code >= 400 && code < 500) {
    return code;
  }
  return 500;
}

export function clientMessageForIssuerMisconfig(
  detail: IssuerMisconfigDetail
): string {
  const status = detail?.statusCode ?? '';
  if (detail?.description) {
    return `[${status}] ${detail.description}`;
  }
  return `[${status}] ${detail?.reason ?? 'misconfig_error'}`;
}

/** Parse a provisioner RFC 7807 body (or best-effort JSON) into a misconfig detail. */
export function issuerMisconfigFromHttpError(
  status: number,
  statusText: string,
  body: string
): IssuerMisconfigDetail {
  const error: IssuerMisconfigDetail = {
    reason: 'provisioner_error',
    description: '',
    status: `${status} ${statusText}`,
    statusCode: status,
  };
  try {
    const payload = JSON.parse(body);
    error.reason =
      payload.title || payload.code || payload.error || 'provisioner_error';
    error.description =
      payload.detail ||
      payload.message ||
      payload.error_description ||
      '';
    if (
      !error.description &&
      payload.details !== undefined &&
      payload.details !== null
    ) {
      error.description =
        typeof payload.details === 'string'
          ? payload.details
          : JSON.stringify(payload.details);
    }
  } catch {
    if (body) {
      error.description = body.slice(0, 500);
    }
  }
  return error;
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
