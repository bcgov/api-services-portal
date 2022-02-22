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

export type RateLimitingPayload = {
  name: string;
  protocols: string[];
  route?: {
    id: string;
  };
  service?: {
    id: string;
  };
  config: {
    second: number;
    minute: number;
    hour: number;
    day: number;
    policy: string;
  };
  tags: string[];
};
