import {
  GatewayPlugin,
  GatewayPluginCreateInput,
} from '@/shared/types/query.types';

export interface IpRestrictionConfig {
  allow: string;
}
export interface IpRestrictionPayload
  extends Omit<GatewayPluginCreateInput, 'config'> {
  config: IpRestrictionConfig;
}

export interface IpRestrictionRecord
  extends Omit<GatewayPlugin, 'config' | 'id'> {
  id?: string;
  config: IpRestrictionConfig;
}

export interface RateLimitingConfig {
  second: FormDataEntryValue;
  minute: FormDataEntryValue;
  hour: FormDataEntryValue;
  day: FormDataEntryValue;
  policy: FormDataEntryValue;
  service?: FormDataEntryValue;
  route?: FormDataEntryValue;
}

// The form has more values in it
export interface RateLimitingForm extends RateLimitingConfig {
  scope?: string;
  route?: string;
  service?: string;
}

export interface RateLimitingPayload
  extends Omit<GatewayPluginCreateInput, 'config'> {
  config: RateLimitingConfig;
}

export interface RateLimitingPayload
  extends Omit<GatewayPluginCreateInput, 'config'> {
  config: RateLimitingConfig;
}
export interface RateLimitingRecord
  extends Omit<GatewayPlugin, 'config' | 'id'> {
  id?: string;
  config: RateLimitingConfig;
}

export type RateLimitingItem = RateLimitingPayload | RateLimitingRecord;
export type IpRestrictionItem = IpRestrictionPayload | IpRestrictionRecord;
