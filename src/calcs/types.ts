export type FieldError = {
	field: string;
	message: string;
};

export type CalcFailure = {
	ok: false;
	errors: FieldError[];
};

export function fail(errors: FieldError[]): CalcFailure {
	return { ok: false, errors };
}

export function failMsg(field: string, message: string): CalcFailure {
	return { ok: false, errors: [{ field, message }] };
}
