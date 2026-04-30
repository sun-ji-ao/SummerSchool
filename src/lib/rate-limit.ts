type RateLimitOptions = {
  key: string;
  maxRequests: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as unknown as {
  __summerSchoolRateLimitStore?: Map<string, Bucket>;
};

const store = globalStore.__summerSchoolRateLimitStore ?? new Map<string, Bucket>();
globalStore.__summerSchoolRateLimitStore = store;

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  return headers.get("x-real-ip") ?? "unknown";
}

export function isRateLimited(options: RateLimitOptions): boolean {
  const now = Date.now();
  const bucket = store.get(options.key);
  if (!bucket || now > bucket.resetAt) {
    store.set(options.key, { count: 1, resetAt: now + options.windowMs });
    return false;
  }
  if (bucket.count >= options.maxRequests) {
    return true;
  }
  bucket.count += 1;
  return false;
}
