declare module 'express-jwt' {
  import { RequestHandler } from 'express';

  interface Options {
    secret: any;
    algorithms?: string[];
    getToken?: (req: any) => string;
    credentialsRequired?: boolean;
    requestProperty?: string;
    [key: string]: any;
  }

  export class UnauthorizedError extends Error {
    constructor(code: string, options: { message: string });
    code: string;
    status: number;
    inner: any;
  }

  function jwt(options: Options): RequestHandler;
  export default jwt;
}
