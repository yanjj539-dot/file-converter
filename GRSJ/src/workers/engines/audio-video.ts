import type { ConversionEngine } from './types';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;
  if (ffmpegLoadPromise) return ffmpegLoadPromise;

  ffmpegLoadPromise = (async () => {
    ffmpeg = new FFmpeg();

    await ffmpeg.load({
      coreURL: await toBlobURL(new URL('/ffmpeg/ffmpeg-core.js', self.location.origin).href, 'text/javascript'),
      wasmURL: await toBlobURL(new URL('/ffmpeg/ffmpeg-core.wasm', self.location.origin).href, 'application/wasm'),
    });

    return ffmpeg;
  })();

  return ffmpegLoadPromise;
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

    await ff.exec(['-i', inputName, outputName]);
    onProgress(90);

    const data = await ff.readFile(outputName);
    onProgress(100);

    return (data as Uint8Array).buffer.slice(0) as ArrayBuffer;
  },
};
