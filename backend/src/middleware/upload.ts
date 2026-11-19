import multer from 'multer';

/** Uploads are buffered in memory (size-capped) and validated by content before anything is written to disk. */
export const uploadSingle = (field: string, maxMb: number) =>
  multer({ storage: multer.memoryStorage(), limits: { fileSize: maxMb * 1024 * 1024, files: 1, fields: 30, fieldSize: 20_000 } }).single(field);
