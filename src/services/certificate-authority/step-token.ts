import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { Logger } from '../../logger';

const logger = Logger('StepTokenService');

export interface StepTokenRequest {
  subject: string;
  san: string[];
}

export class StepTokenService {
  private stepTokenUrl: string;

  constructor(stepTokenUrl: string) {
    this.stepTokenUrl = stepTokenUrl;
  }

  public async requestOneTimeUseToken(
    request: StepTokenRequest
  ): Promise<string> {
    const url = `${this.stepTokenUrl}/tokens`;
    logger.debug('[requestOneTimeUseToken]');
    return await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
      .then(checkStatus)
      .then((res) => res.json())
      .then((data) => data.token);
  }
}
