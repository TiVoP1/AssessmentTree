import { Prisma } from '@prisma/client';
import { prisma } from '#src/prisma/client.js';
import { fetchWeatherForLocation } from '#src/services/weather.service.js';
import { GraphQLError } from 'graphql';

type SortOrder = 'asc' | 'desc';

interface PropertyFilters {
  city?: string;
  state?: string;
  zipCode?: string;
}

interface ListPropertiesArgs {
  filters?: PropertyFilters;
  sortByCreatedAt?: SortOrder;
  limit?: number;
  offset?: number;
}

interface CreatePropertyInput {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function listProperties({
  filters,
  sortByCreatedAt,
  limit,
  offset,
}: ListPropertiesArgs) {
  const where: Prisma.PropertyWhereInput = {};

  if (filters?.city) {
    where.city = filters.city;
  }
  if (filters?.state) {
    where.state = filters.state;
  }
  if (filters?.zipCode) {
    where.zipCode = filters.zipCode;
  }

  const take = Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT);

  return prisma.property.findMany({
    where,
    orderBy: sortByCreatedAt ? { createdAt: sortByCreatedAt } : undefined,
    take,
    skip: offset ?? 0,
  });
}

export async function getPropertyById(id: string) {
  return prisma.property.findUnique({ where: { id } });
}

export async function createProperty(input: CreatePropertyInput) {
  let weather;
  try {
    weather = await fetchWeatherForLocation(input.zipCode);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new GraphQLError(`Failed to fetch weather data: ${message}`, {
      extensions: { code: 'WEATHER_API_ERROR' },
    });
  }

  return prisma.property.create({
    data: {
      street: input.street,
      city: input.city,
      state: input.state,
      zipCode: input.zipCode,
      lat: weather.lat,
      long: weather.long,
      weatherData: weather.current as Prisma.InputJsonObject,
    },
  });
}

export async function deleteProperty(id: string) {
  try {
    return await prisma.property.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return null;
    }
    throw error;
  }
}
