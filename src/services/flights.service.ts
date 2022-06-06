import { Injectable } from '@nestjs/common';
import { HttpService } from 'nestjs-http-promise';
import { Flight, Slice } from '../interfaces/flight.interface';
import { asyncFallbackDecorator } from '../decorators/fallback.decorator';

@Injectable()
export class FlightsService {
  static getUniqueFlights(flights: Flight[]): Flight[] {
    const uniqueMap = new Map();
    flights.forEach((flight) => {
      const [slice1, slice2]: Slice[] = flight.slices;
      const id = `${slice1.flight_number}_${slice1.departure_date_time_utc}-${slice2.flight_number}_${slice2.departure_date_time_utc}`;
      if (!uniqueMap.get(id)) {
        uniqueMap.set(id, { ...flight, id });
      }
    });

    return Array.from(uniqueMap.values());
  }

  constructor(private httpService: HttpService) {}

  @asyncFallbackDecorator(1000)
  private async getFlight(url) {
    return this.httpService
      .get(url)
      .then((response) => response?.data?.flights);
  }

  async getFlights(urls: string[]): Promise<Flight[]> {
    const httpResults = await Promise.all(
      urls.map((url) => this.getFlight(url)),
    );

    const allFlights = httpResults.reduce((acc: Flight[], curr: Flight[]) => {
      acc.push(...curr);
      return acc;
    }, []);

    return FlightsService.getUniqueFlights(allFlights);
  }
}
