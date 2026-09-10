export type ParseFailure = { ok: false; reason: 'empty' | 'invalid' };
export type ParseSuccess = { ok: true; value: number };
export type ParseResult = ParseSuccess | ParseFailure;

/**
 * Strict decimal parse. Rejects empty strings, NaN, Infinity, and junk
 * such as "12ms" so the UI never displays NaN.
 */
export function parseFiniteNumber(raw: string): ParseResult {
	const trimmed = raw.trim();
	if (trimmed === '') {
		return { ok: false, reason: 'empty' };
	}
	if (!/^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/.test(trimmed)) {
		return { ok: false, reason: 'invalid' };
	}
	const value = Number(trimmed);
	if (!Number.isFinite(value)) {
		return { ok: false, reason: 'invalid' };
	}
	return { ok: true, value };
}

export function parseOptionalFiniteNumber(raw: string): ParseResult | { ok: true; value: null } {
	if (raw.trim() === '') {
		return { ok: true, value: null };
	}
	return parseFiniteNumber(raw);
}

export function parseInteger(raw: string): ParseResult {
	const parsed = parseFiniteNumber(raw);
	if (!parsed.ok) {
		return parsed;
	}
	if (!Number.isInteger(parsed.value)) {
		return { ok: false, reason: 'invalid' };
	}
	return parsed;
}
