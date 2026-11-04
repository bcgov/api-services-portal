import type { FastifyBaseLogger } from 'fastify';
import type { TaskFeedRecord } from '../clients/feed/types.js';
import type { SubsystemEntry } from '../clients/sdx-member/index.js';
import {
  BadGatewayError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../errors/api-errors.js';
import type {
  TNewIntegrationAccessRequest,
  TNewIntegrationAccessRequestResponse,
} from '../schemas/sdx.js';
import type { IntegrationAccessService } from './integration-access-service.js';
import {
  subsystemWithOrganization,
  type SdxMemberService,
} from './subsystems-service.js';

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
  subsystem?: SubsystemEntry;
}

/**
 * Holds an access request for an integration that is not registered in SDX,
 * then replays it once an operator marks onboarding complete.
 */
export class CssOnboardingService {
  // The feed write is not conditional, so two processes can still both pass
  // the pending read. This chains calls in one process. A retry uses the same
  // submission id, and connection writes for that id are idempotent.
  private readonly completions = new Map<string, Promise<void>>();

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
    const previous =
      this.completions.get(normalizedIntegrationId) ?? Promise.resolve();
    const run = previous.then(
      () => this.completeOnce(normalizedIntegrationId),
      () => this.completeOnce(normalizedIntegrationId)
    );
    const settled = run.then(
      () => undefined,
      () => undefined
    );
    this.completions.set(normalizedIntegrationId, settled);
    try {
      return await run;
    } finally {
      if (this.completions.get(normalizedIntegrationId) === settled) {
        this.completions.delete(normalizedIntegrationId);
      }
    }
  }

  private async completeOnce(
    normalizedIntegrationId: string
  ): Promise<OnboardingCompletion> {
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

    const registered =
      await this.sdxMember.findSubsystemByIntegrationClientId(
        normalizedIntegrationId
      );
    if (!registered) {
      throw new ConflictError(
        `Integration ${normalizedIntegrationId} is not registered`
      );
    }
    const subsystem = subsystemWithOrganization(
      registered,
      normalizedIntegrationId
    );

    const response =
      blob.results ??
      (await this.integrationAccess.submitIntegrationAccessRequest(
        blob.submissionId,
        subsystem,
        normalizedIntegrationId,
        blob.request
      ));

    const stored = {
      ref,
      type: CSS_ONBOARDING_TASK_TYPE,
      title: task.title,
      jsonBlob: {
        integrationId: blob.integrationId,
        submissionId: blob.submissionId,
        request: blob.request,
        results: response,
      },
    };
    try {
      await this.feed.putTask({ ...stored, status: 'processed' });
    } catch (err) {
      this.logger?.error(
        { err, integrationId: normalizedIntegrationId },
        'Held access request was submitted but the task was not marked processed'
      );
      try {
        await this.feed.putTask({ ...stored, status: 'pending' });
      } catch (persistErr) {
        this.logger?.error(
          { err: persistErr, integrationId: normalizedIntegrationId },
          'Held access request was submitted and its results could not be stored'
        );
        throw new BadGatewayError(
          `Access request for integration ${normalizedIntegrationId} was submitted, but the onboarding task could not be updated. Retrying completion may submit it again.`
        );
      }
      throw new BadGatewayError(
        `Access request for integration ${normalizedIntegrationId} was submitted, but the onboarding task is still pending. Retry completion to record it.`
      );
    }

    this.logger?.info(
      { integrationId: normalizedIntegrationId, submissionId: blob.submissionId },
      blob.results
        ? 'Recorded a previously submitted access request'
        : 'Submitted held access request'
    );

    return { response, replayed: true, request: blob.request, subsystem };
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
