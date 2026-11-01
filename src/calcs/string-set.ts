/**
 * String-set tension: per-string T from the tension calc; total = Σ Ti.
 * Never a green “safe for this neck” badge.
 * Never mix GHS ↔ D’Addario UW in one set. GHS cells are not shipped.
 */

import { computeStringTension, formatTensionCopy, type TensionInput, type TensionSuccess } from './string-tension.ts';
import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatLbf } from './format.ts';

export type SetStringInput = TensionInput & { name: string };

export type StringSetSuccess = {
	ok: true;
	strings: (TensionSuccess & { name: string })[];
	totalLbf: number;
	totalN: number;
};

export type StringSetResult = StringSetSuccess | CalcFailure;

function looksLikeGhsId(id: string | undefined): boolean {
	return Boolean(id && /ghs|boomers/i.test(id));
}

export function computeStringSet(strings: SetStringInput[]): StringSetResult {
	if (strings.length === 0) {
		return fail([{ field: 'strings', message: 'Add at least one string.' }]);
	}
	if (strings.some((s) => looksLikeGhsId(s.tableId))) {
		return fail([
			{
				field: 'uw',
				message:
					'GHS UW is a separate source path and is not blended with D’Addario Catalog Supplement cells. GHS presets are not in this table.',
			},
		]);
	}
	const errors: FieldError[] = [];
	const out: (TensionSuccess & { name: string })[] = [];
	strings.forEach((s, i) => {
		const result = computeStringTension(s);
		if (!result.ok) {
			for (const err of result.errors) {
				errors.push({ field: `${err.field}-${i}`, message: `${s.name || `String ${i + 1}`}: ${err.message}` });
			}
		} else {
			out.push({ ...result, name: s.name || `String ${i + 1}` });
		}
	});
	if (errors.length) return fail(errors);
	const totalLbf = out.reduce((a, s) => a + s.tensionLbf, 0);
	const totalN = out.reduce((a, s) => a + s.tensionN, 0);
	return { ok: true, strings: out, totalLbf, totalN };
}

export function formatStringSetCopy(result: StringSetSuccess): string {
	const lines = result.strings.map((s) => `${s.name}: ${formatTensionCopy(s)}`).join(' ');
	return `Total ${formatLbf(result.totalLbf)} lbf (${result.strings.length} strings). Not a neck-safe rating. ${lines}`;
}
