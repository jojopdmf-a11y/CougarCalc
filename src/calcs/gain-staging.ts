/**
 * Compatibility re-export. Implementation lives in gain-staging-dbu-dbfs.ts.
 * max-spl imports dBuFromVrms from this path — do not change that import.
 */
export {
	VRMS_REF_DBU,
	PLUS4_DBU,
	MINUS10_DBV,
	SPL_AT_1_PA,
	RANE_BAL_TO_UNBAL_DB,
	PLUS4_VS_MINUS10_DB,
	vrmsFromDbu,
	dBuFromVrms,
	dBvFromVrms,
	computeGainStaging,
	formatGainCopy,
	type GainMode,
	type GainStagingInput,
	type GainStagingSuccess,
	type GainStagingResult,
} from './gain-staging-dbu-dbfs.ts';
