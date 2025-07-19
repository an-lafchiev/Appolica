export const CONNECTED = "LN";
export const REJECTED = "RJ";
export const PENDING = "GA";
export const CREATED = "CR";

export const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15; // 15 days
export const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2; // 30 days
