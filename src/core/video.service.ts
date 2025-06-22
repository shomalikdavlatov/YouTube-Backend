import { Injectable } from '@nestjs/common';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import {ffprobe} from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

@Injectable()
export default class VideoService {
  constructor() {
    ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);
    ffmpeg.setFfprobePath(ffprobeInstaller.path);
  }
  getVideoResolution(videoPath: string) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) return reject(err);
        const videoStream = metadata.streams.find(
          (stream) => stream.codec_type === 'video',
        );
        if (!videoStream) return reject('No video stream found');
        resolve({ width: videoStream.width, height: videoStream.height });
      });
    });
  }
  getVideoDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata.format.duration ?? 0);
        }
      });
    });
  }
  convertToResolutions(
    inputPath: string,
    outputBasePath: string,
    resolutions: { height: number }[],
  ) {
    return Promise.all(
      resolutions.map((res) => {
        return new Promise((resolve, reject) => {
          const outputPath = `${outputBasePath}/${res.height}p.mp4`;
          ffmpeg(inputPath)
            .videoCodec('libx264')
            .size(`?x${res.height}`)
            .outputOptions(['-preset fast', '-crf 23', '-movflags +faststart'])
            .on('end', () => {
              resolve('Done');
            })
            .on('error', (error) => {
              reject(error);
            })
            .save(outputPath);
        });
      }),
    );
  }
  getAvailableVideoQualities(videoDir: string): string[] {
    const qualities = ['1080p', '720p', '480p', '360p', '240p'];
    const availableQualities: string[] = [];
    for (const quality of qualities) {
      const qualityPath = path.join(videoDir, `${quality}.mp4`);
      console.log(fs.existsSync(qualityPath));
      if (fs.existsSync(qualityPath)) {
        availableQualities.push(quality);
      }
    }
    return availableQualities;
  }
  getChunkProps(range: string, fileSize: number) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const maxChunkSize = 4 * 1024 * 1024;
    if (end - start > maxChunkSize) {
      end = start + maxChunkSize - 1;
    }
    return { start, end, chunkSize: end - start + 1 };
  }
}
