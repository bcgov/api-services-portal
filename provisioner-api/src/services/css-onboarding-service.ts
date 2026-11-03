import type { FastifyBaseLogger } from 'fastify';
import type { TaskFeedRecord } from '../clients/feed/types.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../errors/api-errors.js';
import type {
  TNewIntegrationAccessRequest,
  TNewIntegrationAccessRequestResponse,
} from '../schemas/sdx.js';
import type { IntegrationAccessService } from './integration-access-service.js';
import type { SdxMemberService } from './subsystems-service.js';

export const CSS_ONBOARDING_TASK_TYPE =
  'integrationAccessRequest-subsystemLinking';
export const HELD_FOR_ONBOARDING = 'held for onboarding';

export function cssOnboardingTaskRef(integrationId: string): string {
  return `css-onboarding:${integrationId}`;
}

interface OnboardingFeed {
  getTaskByRef(ref: string): Promise<TaskFeedRecord | undefined>;
  putTask(task: TaskFeedRecord): Promise<unknown>;
}

interface OnboardingBlob {
  integrationId: string;
  submissionId: string;
  request: TNewIntegrationAccessRequest;
  results?: TNewIntegrationAccessRequestResponse;
}

export interface OnboardingCompletion {
  response: TNewIntegrationAccessRequestResponse;
  replayed: boolean;
  request: TNewIntegrationAccessRequest;
}

/**
 * Holds an access request for an integration that is not registered in SDX,
 * then replays it once an operator marks onboarding complete.
 */
export class CssOnboardingService {
  constructor(
    private readonly feed: OnboardingFeed,
    private readonly integrationAccess: IntegrationAccessService,
    private readonly sdxMember: SdxMemberService,
    private readonly logger?: FastifyBaseLogger
  ) {}

  async hold(
    integrationId: string,
    submissionId: string,
    request: TNewIntegrationAccessRequest
  ): Promise<TNewIntegrationAccessRequestResponse> {
    const normalizedIntegrationId = requireNonBlank(
      integrationId,
      'Integration ID'
    );
    const normalizedSubmissionId = requireNonBlank(
      submissionId,
      'Submission ID'
    );
    const validated =
      await this.integrationAccess.validateCatalogAndPolicy(request);

    const ref = cssOnboardingTaskRef(normalizedIntegrationId);
    const results: Record<string, string> = {};
    for (const requested of validated.requests) {
      results[requested.name] = HELD_FOR_ONBOARDING;
    }

    await this.feed.putTask({
      ref,
      type: CSS_ONBOARDING_TASK_TYPE,
      status: 'pending',
      title: `Onboard ${normalizedIntegrationId} (${request.requester.displayName})`,
      jsonBlob: {
        integrationId: normalizedIntegrationId,
        submissionId: normalizedSubmissionId,
        request,
      },
    });

    this.logger?.info(
      { integrationId: normalizedIntegrationId, submissionId: normalizedSubmissionId },
      'Held access request for onboarding'
    );

    return { submissionId: normalizedSubmissionId, results };
  }

  async complete(integrationId: string): Promise<OnboardingCompletion> {
    const normalizedIntegrationId = requireNonBlank(
      integrationId,
      'Integration ID'
    );
    const ref = cssOnboardingTaskRef(normalizedIntegrationId);
    const task = await this.feed.getTaskByRef(ref);
    if (!task) {
      throw new NotFoundError(
        `Onboarding task for integration ${normalizedIntegrationId} not found`
      );
    }
    if (task.type !== CSS_ONBOARDING_TASK_TYPE) {
      throw new ConflictError(
        `Task ${ref} is not an integration onboarding task`
      );
    }

    const blob = readOnboardingBlob(task.jsonBlob, normalizedIntegrationId);
    if (task.status === 'processed') {
      if (!blob.results) {
        throw new ConflictError(
          `Onboarding task for integration ${normalizedIntegrationId} is missing its submission results`
        );
      }
      return {
        response: blob.results,
        replayed: false,
        request: blob.request,
      };
    }
    if (task.status !== 'pending') {
      throw new ConflictError(
        `Onboarding task for integration ${normalizedIntegrationId} is ${task.status}`
      );
    }

    const registration = await this.sdxMember.getIntegrationStatus(
      normalizedIntegrationId
    );
    if (registration.status !== 'registered') {
      throw new ConflictError(
        `Integration ${normalizedIntegrationId} is not registered`
      );
    }

    const subsystem =
      await this.sdxMember.getSubsystemByIntegrationClientId(
        normalizedIntegrationId
      );
    const response =
      await this.integrationAccess.submitIntegrationAccessRequest(
        blob.submissionId,
        subsystem,
        normalizedIntegrationId,
        blob.request
      );

    await this.feed.putTask({
      ref,
      type: CSS_ONBOARDING_TASK_TYPE,
      status: 'processed',
      title: task.title,
      jsonBlob: {
        integrationId: blob.integrationId,
        submissionId: blob.submissionId,
        request: blob.request,
        results: response,
      },
    });

    this.logger?.info(
      { integrationId: normalizedIntegrationId, submissionId: blob.submissionId },
      'Submitted held access request'
    );

    return { response, replayed: true, request: blob.request };
  }
}

function readOnboardingBlob(
  value: unknown,
  integrationId: string
): OnboardingBlob {
  let parsed = value;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      throw new ConflictError(
        `Onboarding task for integration ${integrationId} payload is not valid JSON`
      );
    }
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new ConflictError(
      `Onboarding task for integration ${integrationId} is missing its stored submission`
    );
  }

  const blob = parsed as OnboardingBlob;
  if (
    typeof blob.submissionId !== 'string' ||
    blob.submissionId.trim() === '' ||
    !blob.request ||
    typeof blob.request !== 'object'
  ) {
    throw new ConflictError(
      `Onboarding task for integration ${integrationId} is missing its stored submission`
    );
  }
  if (blob.integrationId && blob.integrationId !== integrationId) {
    throw new ConflictError(
      `Onboarding task is for integration '${blob.integrationId}', not '${integrationId}'`
    );
  }
  return blob;
}

function requireNonBlank(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestError(`${label} must not be blank`);
  }
  return value.trim();
}
