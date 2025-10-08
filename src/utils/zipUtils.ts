import { FileItem } from '../types';

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[<>:"/\\|?*]/g, '_').replace(/^\.+/, '');
};

export const calculateCRC32 = (data: Uint8Array): number => {
  const crcTable: number[] = [];
  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
    crcTable[i] = crc;
  }

  let crc = 0 ^ -1;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
};

export const createZipWithBrowserAPIs = async (
  convertedFiles: FileItem[]
): Promise<Blob> => {
  const zipData: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;

  for (const file of convertedFiles) {
    if (!file.convertedBlob) continue;

    // Use correct extension based on file type
    const extension = file.isVideo ? '.webm' : '.webp';
    const fileName = sanitizeFilename(file.name.replace(/\.[^/.]+$/, extension));
    const fileNameBytes = new TextEncoder().encode(fileName);
    const fileData = new Uint8Array(await file.convertedBlob.arrayBuffer());

    const crc32 = calculateCRC32(fileData);

    const localHeader = new ArrayBuffer(30 + fileNameBytes.length);
    const headerView = new DataView(localHeader);

    headerView.setUint32(0, 0x04034b50, true);
    headerView.setUint16(4, 20, true);
    headerView.setUint16(6, 0, true);
    headerView.setUint16(8, 0, true);
    headerView.setUint16(10, 0, true);
    headerView.setUint16(12, 0, true);
    headerView.setUint32(14, crc32, true);
    headerView.setUint32(18, fileData.length, true);
    headerView.setUint32(22, fileData.length, true);
    headerView.setUint16(26, fileNameBytes.length, true);
    headerView.setUint16(28, 0, true);

    const headerBytes = new Uint8Array(localHeader);
    headerBytes.set(fileNameBytes, 30);

    zipData.push(headerBytes);
    zipData.push(fileData);

    const centralEntry = new ArrayBuffer(46 + fileNameBytes.length);
    const centralView = new DataView(centralEntry);

    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc32, true);
    centralView.setUint32(20, fileData.length, true);
    centralView.setUint32(24, fileData.length, true);
    centralView.setUint16(28, fileNameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);

    const centralBytes = new Uint8Array(centralEntry);
    centralBytes.set(fileNameBytes, 46);
    centralDirectory.push(centralBytes);

    offset += headerBytes.length + fileData.length;
  }

  const centralDirSize = centralDirectory.reduce(
    (sum, entry) => sum + entry.length,
    0
  );

  const endRecord = new ArrayBuffer(22);
  const endView = new DataView(endRecord);

  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, convertedFiles.length, true);
  endView.setUint16(10, convertedFiles.length, true);
  endView.setUint32(12, centralDirSize, true);
  endView.setUint32(16, offset, true);
  endView.setUint16(20, 0, true);

  const allParts = [
    ...zipData,
    ...centralDirectory,
    new Uint8Array(endRecord),
  ] as BlobPart[];

  return new Blob(allParts, { type: 'application/zip' });
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
