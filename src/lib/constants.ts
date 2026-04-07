export const VDC_API_BASE = "https://vdcmap.bcthomas.com/api/v1";

/** Each write/read operation processes 1 MB of data */
export const OPERATION_SIZE_MB = 1;

/** 20% of stored data is read back per year */
export const ANNUAL_READ_FACTOR = 0.2;

/** 20% of stored data is egressed per year */
export const ANNUAL_EGRESS_FACTOR = 0.2;

/** 1 TiB = 1024 GB */
export const TIB_TO_GB = 1024;

/** 1 TiB = 1,048,576 MB */
export const TIB_TO_MB = 1024 * 1024;

/** Months per year */
export const MONTHS_PER_YEAR = 12;
