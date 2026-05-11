import type { ConversionEngine } from './types';

let ffmpeg: any = null;

async function getFFmpeg() {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;

  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const { toBlobURL } = await import('@ffmpeg/util');

  ffmpeg = new FFmpeg();

  ffmpeg.on('progress', ({ progress }: { progress: number }) => {
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

    await ff.writeFile(inputName, new Uint8Array(fileBuffer));
    onProgress(15);

    await ff.exec(['-i', inputName, '-progress', 'pipe:1', outputName]);
    onProgress(90);

    const data = await ff.readFile(outputName);
    onProgress(100);

    return (data as Uint8Array).buffer.slice(0) as ArrayBuffer;
  },
};
