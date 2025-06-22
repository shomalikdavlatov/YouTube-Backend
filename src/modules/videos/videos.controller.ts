import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  SetMetadata,
  UnsupportedMediaTypeException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import Short from 'short-unique-id';
import CreateVideoDto from './dto/create.video.dto';
import { Request, Response } from 'express';
import { VideosService } from './videos.service';
import { UpdateVideoDto } from './dto/update.video.dto';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}
  static generateSharedFileName = (req) => {
    if (!req.sharedFileName) {
      const short = new Short();
      req.sharedFileName = short.rnd(8);
    }
  };
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'thumbnail') {
              cb(null, 'uploads/thumbnails');
            } else {
              cb(null, 'uploads');
            }
          },
          filename: (req, file, cb) => {
            const short = new Short();
            const base = req['sharedFileName'] ?? short.rnd(8);
            req['sharedFileName'] = base;
            const ext = path.extname(file.originalname);
            cb(null, `${base}${ext}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          const isVideo =
            file.fieldname === 'video' &&
            [
              'video/mp4',
              'video/x-matroska',
              'video/webm',
              'video/quicktime',
            ].includes(file.mimetype);

          const isImage =
            file.fieldname === 'thumbnail' &&
            ['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype);

          if (!isVideo && !isImage) {
            return cb(
              new UnsupportedMediaTypeException(
                `Unsupported file type for ${file.fieldname}`,
              ),
              false,
            );
          }

          cb(null, true);
        },
      },
    ),
  )
  async uploadVideo(
    @Body() body: CreateVideoDto,
    @Req() request: Request,
    @UploadedFiles()
    files: {
      video: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    const video = files.video?.[0];
    const thumbnail = files.thumbnail?.[0];
    return await this.videosService.uploadVideo(
      request['user'].userId,
      body,
      video as Express.Multer.File,
      thumbnail,
    );
  }
  @Get(':slug')
  async getVideoDetails(@Param('slug') slug: string) {
    return await this.videosService.getVideoBySlug(slug);
  }
  @Get(':slug/stream')
  @SetMetadata('isFreeAuth', true)
  async streamVideo(
    @Param('slug') slug: string,
    @Query('quality') quality: string = '720p',
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const range = req.headers.range;
    await this.videosService.streamVideo(slug, quality, range as string, res);
  }
  @Put(':id')
  async updateVideo(
    @Param('id') id: string,
    @Body() body: UpdateVideoDto,
    @Req() req: Request,
  ) {
      return await this.videosService.updateVideo(
        id,
        req['user'],
        body,
      );
  }
}
