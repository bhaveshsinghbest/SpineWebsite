// Identify uploads by their content (magic bytes), never by file name or client-supplied MIME type.
export type DetectedType = { ext: string; mime: string; kind: 'image' | 'document' };

export function detectFileType(buf: Buffer): DetectedType | null {
  const b = buf;
  if (b.length < 12) return null;
  if (b.subarray(0, 5).toString('latin1') === '%PDF-') return { ext: 'pdf', mime: 'application/pdf', kind: 'document' };
  if (b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0) return { ext: 'doc', mime: 'application/msword', kind: 'document' };
  if (b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04) {
    // DOCX is a ZIP container that must include word/document.xml.
    if (b.includes(Buffer.from('word/'))) {
      return { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', kind: 'document' };
    }
    return null;
  }
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg', kind: 'image' };
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: 'png', mime: 'image/png', kind: 'image' };
  if (b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return { ext: 'webp', mime: 'image/webp', kind: 'image' };
  return null;
}

export const CV_TYPES = new Set(['pdf', 'doc', 'docx']);
export const IMAGE_TYPES = new Set(['jpg', 'png', 'webp']);
export const DOCUMENT_TYPES = new Set(['pdf', 'doc', 'docx']);
