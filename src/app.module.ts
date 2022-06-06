import { Module } from '@nestjs/common';
import { HttpModule } from 'nestjs-http-promise';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlightsController } from './controllers/flights/flights.controller';
import { FlightsService } from './services/flights.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController, FlightsController],
  providers: [AppService, FlightsService],
})
export class AppModule {}
