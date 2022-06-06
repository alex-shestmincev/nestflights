import { Test } from '@nestjs/testing';
const nock = require('nock'); // eslint-disable-line @typescript-eslint/no-var-requires
nock.disableNetConnect();
import { FlightsService } from './flights.service';
import { HttpModule } from 'nestjs-http-promise';
import { flightsMock } from '../../test/_helpers/flight.mocks';

describe('FEATURE: FlightsService', () => {
  let flightsService: FlightsService;

  beforeEach(async () => {
    nock.cleanAll();
    const module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [FlightsService],
    }).compile();
    flightsService = await module.get(FlightsService);
  });

  it('should be defined', () => {
    expect(flightsService).toBeDefined();
  });

  describe('GIVEN: getUniqueFlights static method', () => {
    it(`WHEN: passing an array of flights with duplication, THEN: it should remove duplicates`, () => {
      const flight1 = {
        slices: [
          {
            origin_name: 'Schonefeld',
            destination_name: 'Stansted',
            departure_date_time_utc: '2019-08-08T04:30:00.000Z',
            arrival_date_time_utc: '2019-08-08T06:25:00.000Z',
            flight_number: '144',
            duration: 115,
          },
          {
            origin_name: 'Stansted',
            destination_name: 'Schonefeld',
            departure_date_time_utc: '2019-08-10T05:35:00.000Z',
            arrival_date_time_utc: '2019-08-10T07:35:00.000Z',
            flight_number: '8542',
            duration: 120,
          },
        ],
        price: 129,
      };

      const result = FlightsService.getUniqueFlights([flight1, flight1]);
      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(
        '144_2019-08-08T04:30:00.000Z-8542_2019-08-10T05:35:00.000Z',
      );
    });
  });

  describe('GIVEN: getFlights method', () => {
    const urls = [
      'https://coding-challenge.powerus.de/flight/source1',
      'https://coding-challenge.powerus.de/flight/source2',
    ];

    it(`WHEN: calling getFlights AND request is timing out, THEN: after first time it should be empty but after second it will not be empty`, async () => {
      const scope1 = nock('https://coding-challenge.powerus.de')
        .get('/flight/source1')
        .delay(1000)
        .reply(200, flightsMock);

      const result = await flightsService.getFlights([urls[0]]);
      nock.cleanAll();
      expect(result).toEqual([]);
      expect(scope1.isDone()).toBe(true);

      const scope2 = nock('https://coding-challenge.powerus.de')
        .get('/flight/source1')
        .delay(1000)
        .reply(200, flightsMock);

      const result2 = await flightsService.getFlights([urls[0]]);
      nock.cleanAll();
      expect(result2).toMatchObject(flightsMock.flights);
      expect(scope2.isDone()).toBe(true);

      const scope3 = nock('https://coding-challenge.powerus.de')
        .get('/flight/source1')
        .reply(400, {});

      const result3 = await flightsService.getFlights([urls[0]]);
      nock.cleanAll();
      expect(result3).toEqual(result2);
      expect(scope3.isDone()).toBe(true);
    });

    it(`WHEN: calling getFlights and one of the requests is failing, THEN: it should return a list of unique flights`, async () => {
      const scope1 = nock('https://coding-challenge.powerus.de')
        .get('/flight/source1')
        .reply(200, flightsMock);

      const scope2 = nock('https://coding-challenge.powerus.de')
        .get('/flight/source2')
        .reply(400, { ' error': 'some error' });

      const result = await flightsService.getFlights(urls);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(scope1.isDone()).toBe(true);
      expect(scope2.isDone()).toBe(true);
    });
  });
});
