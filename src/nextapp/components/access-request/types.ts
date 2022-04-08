export interface IpRestrictionPayload {
  name: string;
  route?: {
    id: string;
  };
  service?: {
    id: string;
  };
  config: {
    allow: string;
  };
  tags: string[];
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
export interface RateLimitingPayload {
  name: string;
  protocols: string[];
  route?: {
    id: string;
  };
  service?: {
    id: string;
  };
  config: RateLimitingConfig;
  tags: string[];
}
