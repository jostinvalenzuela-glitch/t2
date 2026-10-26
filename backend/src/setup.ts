import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function setup(app: INestApplication) {
  const config = app.get(ConfigService);
  app.enableCors({ origin: config.get<string>('FRONTEND_ORIGIN') || 'http://localhost:5173' });
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
}
