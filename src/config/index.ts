export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  weatherstack: {
    apiKey: process.env.WEATHERSTACK_API_KEY ?? '',
    baseUrl: 'https://api.weatherstack.com/current',
  },
} as const;
