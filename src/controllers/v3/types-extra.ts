import { Scalars } from '../../services/keystone/types';

/**
 * @tsoaModel
 */
export interface ActivityDetail {
  id?: string;
  message: string;
  params: { [key: string]: string };
  activityAt: Scalars['DateTime'];
  blob?: any;
}

/**
 * @tsoaModel
 */
export interface PublishResult {
  message?: string;
  results?: string;
  error?: string;
}

/**
 * @tsoaModel
 */
export class TsoaErrorWrapper {
  inner: Error;
  constructor(inner: Error) {
    this.inner = inner;
  }
}
