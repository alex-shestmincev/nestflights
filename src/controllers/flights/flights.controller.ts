import { Controller, Get } from '@nestjs/common';
import { Flight } from '../../interfaces/flight.interface';
import { FlightsService } from '../../services/flights.service';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  private urls: string[] = [
    'https://coding-challenge.powerus.de/flight/source1',
    'https://coding-challenge.powerus.de/flight/source2',
  ];

  @Get()
  findAll(): Promise<Flight[]> {
    return this.flightsService.getFlights(this.urls);
  }
}
