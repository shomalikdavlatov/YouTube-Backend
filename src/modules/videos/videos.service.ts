import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import slugify from 'slugify';
import CreateVideoDto from './dto/create.video.dto';
import VideoService from 'src/core/video.service';
import PrismaService from 'src/core/database/prisma.service';
import path from 'path';
import fs from 'fs';
import { Response } from 'express';
import { UpdateVideoDto } from './dto/update.video.dto';

@Injectable()
export class VideosService {
  constructor(
    private videoService: VideoService,
    private prismaService: PrismaService,
  ) {}

  async processUploadedVideo(
    videoId: string,
    originalFile: string,
    slug: string,
  ) {
    const inputPath = path.join(process.cwd(), 'uploads', originalFile);
    const outputBasePath = path.join(process.cwd(), 'uploads', 'videos', slug);

    const resolution = await this.videoService.getVideoResolution(inputPath);

    const resolutions = [
      { height: 240 },
      { height: 360 },
      { height: 480 },
      { height: 720 },
      { height: 1080 },
    ];
    const validResolutions = resolutions.filter(
      (r) =>
        r.height <=
        (resolution as { width: number; height: number }).height + 6,
    );

    fs.mkdirSync(outputBasePath, { recursive: true });

    await this.videoService.convertToResolutions(
      inputPath,
      outputBasePath,
      validResolutions,
    );

    fs.unlinkSync(inputPath);

    await this.prismaService.prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'PUBLISHED',
      },
    });
  }
  async uploadVideo(
    userId: string,
    body: CreateVideoDto,
    video: Express.Multer.File,
    thumbnail: Express.Multer.File | undefined,
  ) {
    const slug = `${slugify(body.title, { lower: true, strict: true })}-${video.filename.slice(0, 8)}`;
    const videoPath = `uploads/${video.filename}`;
    const thumbnailPath = thumbnail
      ? `uploads/thumbnails/${thumbnail.filename}`
      : null;

    const duration = await this.videoService.getVideoDuration(
      join(process.cwd(), videoPath),
    );

    const createdVideo = await this.prismaService.prisma.video.create({
      data: {
        title: body.title,
        slug,
        description: body.description ?? null,
        thumbnail: thumbnailPath,
        videoUrl: `uploads/videos/${slug}`,
        duration: Math.floor(duration),
        status: 'PROCESSING',
        visibility: body.visibility,
        authorId: userId,
      },
    });
    const startTime = performance.now();
    await this.processUploadedVideo(createdVideo.id, video.filename, slug);
    const endTime = performance.now();
    return {
      success: true,
      message: 'Video uploaded successfully',
      data: {
        id: createdVideo.id,
        title: createdVideo.title,
        slug,
        status: 'UPLOADED',
        uploadProgress: 100,
        processingProgress: 100,
        estimatedProcessingTime:
          Math.round((endTime - startTime) / 1000) + ' seconds',
      },
    };
  }
  async getVideoBySlug(slug: string) {
    const video = await this.prismaService.prisma.video.findFirst({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            channelBanner: true,
            subscribersCount: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!video)
      throw new NotFoundException('Video with the specified slug not found!');

    const availableQualities = this.videoService.getAvailableVideoQualities(
      video.videoUrl,
    );

    return {
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      videoUrl: video.videoUrl,
      availableQualities,
      duration: video.duration,
      viewsCount: video.viewsCount,
      likesCount: video.likesCount,
      dislikesCount: video.dislikesCount,
      commentsCount: video._count.comments,
      publishedAt: video.createdAt.toISOString(),
      author: {
        id: video.author.id,
        username: video.author.username,
        avatar: video.author.channelBanner,
        subscribersCount: video.author.subscribersCount,
      },
    };
  }
  async streamVideo(
    slug: string,
    quality: string,
    range: string,
    res: Response,
  ) {
    // First, check if video exists in database
    const video = await this.prismaService.prisma.video.findFirst({
      where: { slug },
      select: { id: true, videoUrl: true, status: true },
    });

    if (!video) {
      throw new NotFoundException('Video with specified slug not found!');
    }

    if (video.status !== 'PUBLISHED') {
      throw new NotFoundException('Video is not available for streaming!');
    }

    const baseQuality = `${quality}.mp4`;
    const basePath = path.join(process.cwd(), 'uploads', 'videos', slug);
    const readDir = fs.readdirSync(basePath);
    const videoActivePath = path.join(basePath, baseQuality);

    // Check if video directory exists
    if (!readDir.includes(baseQuality)) {
      throw new NotFoundException('Video file not found!');
    }
    // Get file stats
    const { size } = fs.statSync(videoActivePath);

    // Set default range if not provided
    if (!range) {
      range = `bytes=0-1048575`;
    }

    // Get chunk properties using VideoService
    const { start, end, chunkSize } = this.videoService.getChunkProps(
      range,
      size,
    );

    // Set response headers for video streaming
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    });

    // Create read stream
    const videoStream = fs.createReadStream(videoActivePath, {
      start,
      end,
    });

    videoStream.on('error', (err) => {
      throw new InternalServerErrorException(err.message);
    });

    // Pipe video stream to response
    videoStream.pipe(res);
  }
  async updateVideo(
    videoId: string,
    user: any,
    body: UpdateVideoDto,
  ) {

    // First, check if video exists and user has permission
    const video = await this.prismaService.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('Video with the specified id not found!');
    }

    if (
      video.authorId !== user.userId &&
      user.userRole !== 'ADMIN' &&
      user.userRole !== 'SUPERADMIN'
    ) {
      throw new ForbiddenException('Access denied!');
    }
    let slug = video.slug;
    if (body.title && body.title !== video.title) {
      slug = slugify(body.title, {lower: true, strict: true}) + '-' + video.slug.split('-').at(-1);
    }
    const updateData: any = {};

    if (body.title) {
      updateData.title = body.title;
      updateData.slug = slug;
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.visibility) {
      updateData.visibility = body.visibility;
    }
    const updatedVideo = await this.prismaService.prisma.video.update({
      where: { id: videoId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            channelBanner: true,
            channelDescription: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Video updated successfully',
      data: {
        id: updatedVideo.id,
        title: updatedVideo.title,
        slug: updatedVideo.slug,
        description: updatedVideo.description,
        thumbnail: updatedVideo.thumbnail,
        videoUrl: updatedVideo.videoUrl,
        duration: updatedVideo.duration,
        status: updatedVideo.status,
        visibility: updatedVideo.visibility,
        viewsCount: updatedVideo.viewsCount,
        likesCount: updatedVideo.likesCount,
        dislikesCount: updatedVideo.dislikesCount,
        createdAt: updatedVideo.createdAt,
        author: updatedVideo.author,
        commentsCount: updatedVideo._count.comments,
        totalLikes: updatedVideo._count.likes,
      },
    };
  }
}
 