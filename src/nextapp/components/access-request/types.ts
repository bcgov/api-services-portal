export type IpRestrictionPayload = {
  name: string;
  route?: {
    id: string;
  };
  service?: {
    id: string;
  };
  config: {
    allow: string[];
  };
  tags: string[];
};

export type RateLimitingConfig = {
  second: FormDataEntryValue;
  minute: FormDataEntryValue;
  hour: FormDataEntryValue;
  day: FormDataEntryValue;
  policy: FormDataEntryValue;
};

export type RateLimitingPayload = {
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
};
