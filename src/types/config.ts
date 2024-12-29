export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export interface Config {
  nodeEnv: string;
  port: number;
  corsOrigins: string[];
  rateLimits: {
    public: RateLimitConfig;
    authenticated: RateLimitConfig;
  };
  logging: {
    level: string;
    file: string;
  };
}