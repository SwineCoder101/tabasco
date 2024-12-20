import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from './config/validationSchema';
import { TokenService } from './token.service';
import { SolanaOrcaService } from './orca.service';
import { AIService } from './ai.service';
import { NeynarService } from './neynar.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [async () => await configuration()],
      validationSchema,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TokenService,
    SolanaOrcaService,
    AIService,
    NeynarService,
  ],
})
export class AppModule {}
