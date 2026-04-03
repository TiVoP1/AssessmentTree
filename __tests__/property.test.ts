import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { ApolloServer } from '@apollo/server';
import { PrismaClient } from '@prisma/client';
import typeDefs from '#src/graphql/typeDefs.js';
import resolvers from '#src/graphql/resolvers.js';

// Mock the weather service — tests should never call the real Weatherstack API
vi.mock('#src/services/weather.service.js', () => ({
  fetchWeatherForLocation: vi.fn().mockResolvedValue({
    lat: 33.609,
    long: -111.729,
    current: {
      observation_time: '03:45 PM',
      temperature: 82,
      weather_code: 116,
      weather_icons: [
        'https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png',
      ],
      weather_descriptions: ['Partly cloudy'],
      wind_speed: 14,
      wind_degree: 170,
      wind_dir: 'S',
      pressure: 1015,
      precip: 0,
      humidity: 68,
      cloudcover: 25,
      feelslike: 86,
      uv_index: 7,
      visibility: 10,
    },
  }),
}));

const prisma = new PrismaClient();

let server: ApolloServer;

beforeAll(async () => {
  server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
});

afterAll(async () => {
  await server.stop();
  await prisma.$disconnect();
});

beforeEach(async () => {
  vi.clearAllMocks();
  await prisma.property.deleteMany();
});

async function executeQuery(query: string, variables?: Record<string, unknown>) {
  return server.executeOperation({ query, variables });
}

function getSingleResult(result: Awaited<ReturnType<typeof executeQuery>>) {
  expect(result.body.kind).toBe('single');
  if (result.body.kind !== 'single') throw new Error('Expected single result');
  return result.body.singleResult;
}

describe('Property GraphQL API', () => {
  // --------------------------------------------------
  // User Story 1: Query all properties
  // --------------------------------------------------
  describe('User Story 1: Query all properties', () => {
    it('should return an empty list when no properties exist', async () => {
      const result = getSingleResult(
        await executeQuery(`
        query { properties { id street city state zipCode } }
      `),
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.properties).toEqual([]);
    });

    it('should return all properties', async () => {
      await prisma.property.createMany({
        data: [
          { street: '123 Main St', city: 'Texas City', state: 'TX', zipCode: '77590' },
          { street: '456 Oak Ave', city: 'Dickinson', state: 'TX', zipCode: '77539' },
        ],
      });

      const result = getSingleResult(
        await executeQuery(`
        query { properties { id street city state zipCode } }
      `),
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.properties).toHaveLength(2);
    });
  });

  // --------------------------------------------------
  // User Story 2: Sort properties by date of creation
  // --------------------------------------------------
  describe('User Story 2: Sort by creation date', () => {
    it('should sort properties by createdAt ascending', async () => {
      await prisma.property.create({
        data: { street: 'First St', city: 'Texas City', state: 'TX', zipCode: '77590' },
      });
      await new Promise((resolve) => setTimeout(resolve, 50));
      await prisma.property.create({
        data: { street: 'Second St', city: 'Texas City', state: 'TX', zipCode: '77590' },
      });

      const result = getSingleResult(
        await executeQuery(`
        query { properties(sortByCreatedAt: asc) { street } }
      `),
      );

      expect(result.errors).toBeUndefined();
      const properties = result.data?.properties as { street: string }[];
      expect(properties[0].street).toBe('First St');
      expect(properties[1].street).toBe('Second St');
    });

    it('should sort properties by createdAt descending', async () => {
      await prisma.property.create({
        data: { street: 'First St', city: 'Texas City', state: 'TX', zipCode: '77590' },
      });
      await new Promise((resolve) => setTimeout(resolve, 50));
      await prisma.property.create({
        data: { street: 'Second St', city: 'Texas City', state: 'TX', zipCode: '77590' },
      });

      const result = getSingleResult(
        await executeQuery(`
        query { properties(sortByCreatedAt: desc) { street } }
      `),
      );

      expect(result.errors).toBeUndefined();
      const properties = result.data?.properties as { street: string }[];
      expect(properties[0].street).toBe('Second St');
      expect(properties[1].street).toBe('First St');
    });
  });

  // --------------------------------------------------
  // User Story 3: Filter by city, zip code, state
  // --------------------------------------------------
  describe('User Story 3: Filter properties', () => {
    beforeEach(async () => {
      await prisma.property.createMany({
        data: [
          { street: '123 Main St', city: 'Texas City', state: 'TX', zipCode: '77590' },
          { street: '456 Oak Ave', city: 'Dickinson', state: 'TX', zipCode: '77539' },
          { street: '789 Pine Dr', city: 'Texas City', state: 'TX', zipCode: '77591' },
          { street: '100 Broadway', city: 'New York', state: 'NY', zipCode: '10001' },
        ],
      });
    });

    it('should filter by city', async () => {
      const result = getSingleResult(
        await executeQuery(
          `
        query($filter: PropertyFilter) { properties(filter: $filter) { city } }
      `,
          { filter: { city: 'Dickinson' } },
        ),
      );

      expect(result.errors).toBeUndefined();
      const properties = result.data?.properties as { city: string }[];
      expect(properties).toHaveLength(1);
      expect(properties[0].city).toBe('Dickinson');
    });

    it('should filter by zip code', async () => {
      const result = getSingleResult(
        await executeQuery(
          `
        query($filter: PropertyFilter) { properties(filter: $filter) { zipCode } }
      `,
          { filter: { zipCode: '77591' } },
        ),
      );

      expect(result.errors).toBeUndefined();
      const properties = result.data?.properties as { zipCode: string }[];
      expect(properties).toHaveLength(1);
      expect(properties[0].zipCode).toBe('77591');
    });

    it('should filter by state', async () => {
      const result = getSingleResult(
        await executeQuery(
          `
        query($filter: PropertyFilter) { properties(filter: $filter) { state } }
      `,
          { filter: { state: 'NY' } },
        ),
      );

      expect(result.errors).toBeUndefined();
      const properties = result.data?.properties as { state: string }[];
      expect(properties).toHaveLength(1);
      expect(properties[0].state).toBe('NY');
    });

    it('should combine filters', async () => {
      const result = getSingleResult(
        await executeQuery(
          `
        query($filter: PropertyFilter) { properties(filter: $filter) { street } }
      `,
          { filter: { city: 'Texas City', zipCode: '77591' } },
        ),
      );

      expect(result.errors).toBeUndefined();
      const properties = result.data?.properties as { street: string }[];
      expect(properties).toHaveLength(1);
      expect(properties[0].street).toBe('789 Pine Dr');
    });
  });

  // --------------------------------------------------
  // User Story 4: Query details of any property
  // --------------------------------------------------
  describe('User Story 4: Query property details', () => {
    it('should return full property details by ID', async () => {
      const created = await prisma.property.create({
        data: {
          street: '123 Main St',
          city: 'Texas City',
          state: 'TX',
          zipCode: '77590',
          lat: 29.384,
          long: -94.903,
          weatherData: { temperature: 75, humidity: 60 },
        },
      });

      const result = getSingleResult(
        await executeQuery(
          `
        query($id: ID!) {
          property(id: $id) {
            id street city state zipCode lat long weatherData createdAt updatedAt
          }
        }
      `,
          { id: created.id },
        ),
      );

      expect(result.errors).toBeUndefined();
      const property = result.data?.property as Record<string, unknown>;
      expect(property.street).toBe('123 Main St');
      expect(property.city).toBe('Texas City');
      expect(property.state).toBe('TX');
      expect(property.zipCode).toBe('77590');
      expect(property.lat).toBe(29.384);
      expect(property.long).toBe(-94.903);
      expect(property.weatherData).toEqual({ temperature: 75, humidity: 60 });
      expect(property.createdAt).toBeDefined();
      expect(property.updatedAt).toBeDefined();
    });

    it('should return null for non-existent property', async () => {
      const result = getSingleResult(
        await executeQuery(
          `
        query($id: ID!) { property(id: $id) { id } }
      `,
          { id: 'non-existent-id' },
        ),
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.property).toBeNull();
    });
  });

  // --------------------------------------------------
  // User Story 5: Add a new property
  // (Weatherstack API called automatically — mocked here)
  // --------------------------------------------------
  describe('User Story 5: Create property with automatic weather fetch', () => {
    const CREATE_MUTATION = `
      mutation($input: CreatePropertyInput!) {
        createProperty(input: $input) {
          id street city state zipCode lat long weatherData createdAt
        }
      }
    `;

    it('should create a property and automatically fetch weather data', async () => {
      const { fetchWeatherForLocation } = await import('#src/services/weather.service.js');

      const result = getSingleResult(
        await executeQuery(CREATE_MUTATION, {
          input: {
            street: '15528 E Golden Eagle Blvd',
            city: 'Fountain Hills',
            state: 'AZ',
            zipCode: '85268',
          },
        }),
      );

      expect(result.errors).toBeUndefined();
      const property = result.data?.createProperty as Record<string, unknown>;

      // Property fields from user input
      expect(property.street).toBe('15528 E Golden Eagle Blvd');
      expect(property.city).toBe('Fountain Hills');
      expect(property.state).toBe('AZ');
      expect(property.zipCode).toBe('85268');

      // Fields populated automatically from Weatherstack API
      expect(property.lat).toBe(33.609);
      expect(property.long).toBe(-111.729);
      expect(property.weatherData).toBeDefined();
      const weather = property.weatherData as Record<string, unknown>;
      expect(weather.temperature).toBe(82);
      expect(weather.humidity).toBe(68);

      // Auto-generated fields
      expect(property.id).toBeDefined();
      expect(property.createdAt).toBeDefined();

      // Verify the weather service was called with the zip code
      expect(fetchWeatherForLocation).toHaveBeenCalledWith('85268');
      expect(fetchWeatherForLocation).toHaveBeenCalledTimes(1);
    });

    it('should persist the created property in the database', async () => {
      const result = getSingleResult(
        await executeQuery(CREATE_MUTATION, {
          input: {
            street: '100 Test Ave',
            city: 'Austin',
            state: 'TX',
            zipCode: '73301',
          },
        }),
      );

      const property = result.data?.createProperty as { id: string };
      const dbRecord = await prisma.property.findUnique({ where: { id: property.id } });

      expect(dbRecord).not.toBeNull();
      expect(dbRecord!.street).toBe('100 Test Ave');
      expect(dbRecord!.lat).toBe(33.609);
      expect(dbRecord!.weatherData).toBeDefined();
    });

    it('should normalize state to uppercase', async () => {
      const result = getSingleResult(
        await executeQuery(CREATE_MUTATION, {
          input: {
            street: '200 Lower St',
            city: 'Dallas',
            state: 'tx',
            zipCode: '75201',
          },
        }),
      );

      expect(result.errors).toBeUndefined();
      const property = result.data?.createProperty as { state: string };
      expect(property.state).toBe('TX');
    });

    it('should reject invalid state abbreviation', async () => {
      const result = getSingleResult(
        await executeQuery(CREATE_MUTATION, {
          input: { street: '123 Main St', city: 'Texas City', state: 'XX', zipCode: '77590' },
        }),
      );

      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toContain('Validation error');
    });

    it('should reject invalid zip code', async () => {
      const result = getSingleResult(
        await executeQuery(CREATE_MUTATION, {
          input: { street: '123 Main St', city: 'Texas City', state: 'TX', zipCode: '123' },
        }),
      );

      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toContain('Validation error');
    });

    it('should reject empty street', async () => {
      const result = getSingleResult(
        await executeQuery(CREATE_MUTATION, {
          input: { street: '', city: 'Texas City', state: 'TX', zipCode: '77590' },
        }),
      );

      expect(result.errors).toBeDefined();
    });

    it('should only call weather API during creation, not queries', async () => {
      const { fetchWeatherForLocation } = await import('#src/services/weather.service.js');
      vi.mocked(fetchWeatherForLocation).mockClear();

      // Query — should NOT call API
      await executeQuery(`query { properties { id } }`);
      expect(fetchWeatherForLocation).not.toHaveBeenCalled();

      // Create — SHOULD call API
      await executeQuery(CREATE_MUTATION, {
        input: { street: '1 Test St', city: 'Houston', state: 'TX', zipCode: '77001' },
      });
      expect(fetchWeatherForLocation).toHaveBeenCalledTimes(1);

      // Query again — should NOT call API
      vi.mocked(fetchWeatherForLocation).mockClear();
      await executeQuery(`query { properties { id weatherData } }`);
      expect(fetchWeatherForLocation).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // User Story 6: Delete any property
  // --------------------------------------------------
  describe('User Story 6: Delete property', () => {
    it('should delete an existing property and return it', async () => {
      const created = await prisma.property.create({
        data: { street: '123 Main St', city: 'Texas City', state: 'TX', zipCode: '77590' },
      });

      const result = getSingleResult(
        await executeQuery(
          `
        mutation($id: ID!) { deleteProperty(id: $id) { id street } }
      `,
          { id: created.id },
        ),
      );

      expect(result.errors).toBeUndefined();
      const deleted = result.data?.deleteProperty as Record<string, unknown>;
      expect(deleted.id).toBe(created.id);
      expect(deleted.street).toBe('123 Main St');

      // Verify actually deleted from DB
      const check = await prisma.property.findUnique({ where: { id: created.id } });
      expect(check).toBeNull();
    });

    it('should return null when deleting non-existent property', async () => {
      const result = getSingleResult(
        await executeQuery(
          `
        mutation($id: ID!) { deleteProperty(id: $id) { id } }
      `,
          { id: 'non-existent-id' },
        ),
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.deleteProperty).toBeNull();
    });
  });
});
