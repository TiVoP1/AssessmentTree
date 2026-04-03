import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import typeDefs from '#src/graphql/typeDefs.js';
import resolvers from '#src/graphql/resolvers.js';
import { config } from '#src/config/index.js';
import { prisma } from '#src/prisma/client.js';

async function bootstrap() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use('/graphql', cors(), express.json(), expressMiddleware(server));

  const httpServer = app.listen(config.port, () => {
    console.log(`Server ready at http://localhost:${config.port.toString()}/graphql`);
  });

  const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await server.stop();
    httpServer.close();
    await prisma.$disconnect();
  };

  process.on('SIGTERM', () => void shutdown());
  process.on('SIGINT', () => void shutdown());
}

bootstrap().catch((err: unknown) => {
  console.error('Failed to start server:', err);
});
