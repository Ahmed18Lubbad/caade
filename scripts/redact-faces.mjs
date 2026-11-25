import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import * as ort from 'onnxruntime-web';

const root = path.resolve('public/media');
const model = path.resolve('tmp/face_detection_yunet_2023mar.onnx');
const size = 640;
const threshold = 0.55;
const requestedFile = process.env.CAADE_REDACT_FILE ? path.resolve(process.env.CAADE_REDACT_FILE) : null;
const requestedFiles = process.env.CAADE_REDACT_FILES
  ? new Set(process.env.CAADE_REDACT_FILES.split('|').map(file => path.resolve(file)))
  : null;

async function filesIn(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(target));
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) files.push(target);
  }
  return files;
}

function detections(outputs, scaleX, scaleY) {
  const faces = [];
  for (const stride of [8, 16, 32]) {
    const cls = outputs[`cls_${stride}`].data;
    const obj = outputs[`obj_${stride}`].data;
    const bbox = outputs[`bbox_${stride}`].data;
    const columns = size / stride;
    for (let index = 0; index < cls.length; index += 1) {
      const score = Math.sqrt(
        Math.max(0, Math.min(1, cls[index])) * Math.max(0, Math.min(1, obj[index])),
      );
      if (score < threshold) continue;
      const offset = index * 4;
      const left = bbox[offset];
      const top = bbox[offset + 1];
      const right = bbox[offset + 2];
      const bottom = bbox[offset + 3];
      const gridX = index % columns;
      const gridY = Math.floor(index / columns);
      const centerX = (gridX + left) * stride;
      const centerY = (gridY + top) * stride;
      const width = Math.exp(right) * stride;
      const height = Math.exp(bottom) * stride;
      const x = (centerX - width / 2) * scaleX;
      const y = (centerY - height / 2) * scaleY;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;
      if (scaledWidth > 4 && scaledHeight > 4) faces.push({ x, y, width: scaledWidth, height: scaledHeight, score });
    }
  }
  return faces.sort((a, b) => b.score - a.score).filter((face, index, all) => all.slice(0, index).every(other => {
    const x = Math.max(face.x, other.x);
    const y = Math.max(face.y, other.y);
    const right = Math.min(face.x + face.width, other.x + other.width);
    const bottom = Math.min(face.y + face.height, other.y + other.height);
    const intersection = Math.max(0, right - x) * Math.max(0, bottom - y);
    return intersection / (face.width * face.height + other.width * other.height - intersection) <= 0.35;
  }));
}

async function redact(file, session) {
  if (/caade-logo|favicon/i.test(path.basename(file))) return false;
  const source = await sharp(file).rotate().toBuffer();
  const metadata = await sharp(source).metadata();
  const width = metadata.width;
  const height = metadata.height;
  const { data } = await sharp(source).resize(size, size, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const input = new Float32Array(3 * size * size);
  for (let index = 0; index < size * size; index += 1) {
    input[index] = data[index * 3 + 2];
    input[index + size * size] = data[index * 3 + 1];
    input[index + size * size * 2] = data[index * 3];
  }
  const outputs = await session.run({ input: new ort.Tensor('float32', input, [1, 3, size, size]) });
  const faces = detections(outputs, width / size, height / size);
  if (process.env.CAADE_REDACT_DEBUG) console.log(`Detections for ${path.relative(root, file)}:`, faces);
  if (!faces.length) return false;

  const overlays = [];
  for (const face of faces) {
    const paddingX = face.width * 0.12;
    const paddingY = face.height * 0.12;
    const left = Math.max(0, Math.floor(face.x - paddingX));
    const top = Math.max(0, Math.floor(face.y - paddingY));
    const overlayWidth = Math.min(width - left, Math.max(2, Math.floor(face.width + paddingX * 2)));
    const overlayHeight = Math.min(height - top, Math.max(2, Math.floor(face.height + paddingY * 2)));
    const pixelWidth = Math.max(3, Math.round(overlayWidth / 7));
    const pixelHeight = Math.max(3, Math.round(overlayHeight / 7));
    if (process.env.CAADE_REDACT_DEBUG) console.log({ left, top, overlayWidth, overlayHeight, pixelWidth, pixelHeight });
    const pixelated = await sharp(source)
      .extract({ left, top, width: overlayWidth, height: overlayHeight })
      .resize(pixelWidth, pixelHeight, { kernel: 'nearest' })
      .toBuffer();
    const crop = await sharp(pixelated)
      .resize(overlayWidth, overlayHeight, { kernel: 'nearest' })
      .toBuffer();
    overlays.push({ input: crop, left, top });
  }
  const temp = `${file}.redacted`;
  const output = sharp(source).composite(overlays);
  if (metadata.format === 'jpeg') output.jpeg({ quality: 92 });
  else if (metadata.format === 'png') output.png();
  else if (metadata.format === 'webp') output.webp({ quality: 92 });
  await output.toFile(temp);
  await fs.rename(temp, file);
  return true;
}

ort.env.wasm.wasmPaths = `file://${path.resolve('node_modules/onnxruntime-web/dist/').replaceAll('\\', '/')}/`;
const session = await ort.InferenceSession.create(model, { executionProviders: ['wasm'] });
const files = (await filesIn(root)).filter(file => {
  if (requestedFile) return file === requestedFile;
  return !requestedFiles || requestedFiles.has(file);
});
let redacted = 0;
for (const file of files) {
  try {
    if (await redact(file, session)) redacted += 1;
  } catch (error) {
    console.warn(`Skipped unreadable image: ${path.relative(root, file)} (${error.message})`);
  }
  console.log(`${redacted} redacted / ${files.length} checked: ${path.relative(root, file)}`);
}
console.log(`Finished: ${redacted} of ${files.length} images contained detected faces.`);
