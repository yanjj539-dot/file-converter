import type { ConversionEngine } from './types';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;

  ffmpeg = new FFmpeg();

  ffmpeg.on('progress', ({ progress }) => {
    // progress is 0-1
  });

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
}

export const audioVideoEngine: ConversionEngine = {
  async convert(fileBuffer, sourceFormat, targetFormat, onProgress) {
    const ff = await getFFmpeg();

    const inputExt = sourceFormat === 'jpg' ? 'jpeg' : sourceFormat;
    const outputExt = targetFormat === 'jpg' ? 'jpeg' : targetFormat;

    const inputName = `input.${inputExt}`;
    const outputName = `output.${outputExt}`;

    // Write input
    await ff.writeFile(inputName, new Uint8Array(fileBuffer));
    onProgress(15);

    // Execute conversion
    await ff.exec(['-i', inputName, '-progress', 'pipe:1', outputName]);
    onProgress(90);

    // Read output
    const data = await ff.readFile(outputName);
    onProgress(100);

    return (data as Uint8Array).buffer.slice(0) as ArrayBuffer;
  },
};
