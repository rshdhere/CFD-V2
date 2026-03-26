// TIME
export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const DAY_IN_MS = 24 * 60 * 60 * 1000;

// REUSABLE
export const EMPTY_STRING = "";
export const LOCALHOST = "localhost";

// ENCODING & HASHING
export type EncodingAlgorithm = "hex";
export type HashingAlgorithm = "sha256";
export const DEFAULT_ENCODING: EncodingAlgorithm = "hex";
export const HASHING_ALGORITHM: HashingAlgorithm = "sha256";
