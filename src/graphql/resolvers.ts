import { GraphQLError } from 'graphql';
import { DateTimeISOResolver, JSONResolver } from 'graphql-scalars';
import { z } from 'zod';
import {
  listProperties,
  getPropertyById,
  createProperty,
  deleteProperty,
} from '#src/services/property.service.js';

const US_STATE_ABBREVIATIONS = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
] as const;

const createPropertySchema = z.object({
  street: z.string().min(1, 'Street is required').max(255),
  city: z.string().min(1, 'City is required').max(100),
  state: z
    .string()
    .length(2, 'State must be a 2-letter abbreviation')
    .toUpperCase()
    .refine(
      (val): val is (typeof US_STATE_ABBREVIATIONS)[number] =>
        US_STATE_ABBREVIATIONS.includes(val as (typeof US_STATE_ABBREVIATIONS)[number]),
      { message: 'Must be a valid US state abbreviation' },
    ),
  zipCode: z.string().regex(/^\d{5}$/, 'Zip code must be exactly 5 digits'),
});

interface PropertyFilterArgs {
  city?: string;
  state?: string;
  zipCode?: string;
}

type SortOrder = 'asc' | 'desc';

const resolvers = {
  DateTime: DateTimeISOResolver,
  JSON: JSONResolver,

  Query: {
    properties: async (
      _: unknown,
      args: {
        filter?: PropertyFilterArgs;
        sortByCreatedAt?: SortOrder;
        limit?: number;
        offset?: number;
      },
    ) => {
      return listProperties({
        filters: args.filter,
        sortByCreatedAt: args.sortByCreatedAt,
        limit: args.limit ?? undefined,
        offset: args.offset ?? undefined,
      });
    },

    property: async (_: unknown, args: { id: string }) => {
      return getPropertyById(args.id);
    },
  },

  Mutation: {
    createProperty: async (
      _: unknown,
      args: { input: { street: string; city: string; state: string; zipCode: string } },
    ) => {
      const parsed = createPropertySchema.safeParse(args.input);
      if (!parsed.success) {
        const messages = parsed.error.issues.map((i) => i.message).join(', ');
        throw new GraphQLError(`Validation error: ${messages}`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      return createProperty(parsed.data);
    },

    deleteProperty: async (_: unknown, args: { id: string }) => {
      return deleteProperty(args.id);
    },
  },
};

export default resolvers;
