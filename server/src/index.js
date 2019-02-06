const express = require('express')
const http = require('http')
const cors = require('cors')
const GraphQLModule = require('@graphql-modules/core').GraphQLModule


const metrics = require('@aerogear/voyager-metrics')
const auditLogger = require('@aerogear/voyager-audit')
const { VoyagerServer } = require('@aerogear/voyager-server')

const { TaskModule, TaskSubscriptionsModule } = require('./tasks/index')
const connect = require("./db")

const appModule = new GraphQLModule({
  imports: [
    TaskModule,
    TaskSubscriptionsModule
    // FileModule
  ],
});

const config = require('./config/config')

let keycloakService = null
// if a keycloak config is present we create
// a keycloak service which will be passed into ApolloVoyagerServer
if (config.keycloakConfig) {
  keycloakService = new KeycloakSecurityService(config.keycloakConfig)
}

async function start() {

  const app = express()
  const httpServer = http.createServer(app)

  app.use(cors())
  metrics.applyMetricsMiddlewares(app, { path: '/metrics' })

  if (keycloakService) {
    keycloakService.applyAuthMiddleware(app)
  }

  app.get('/health', (req, res) => res.sendStatus(200))

  // connect to db
  const client = await connect(config.db);

  const schema = appModule.schema;
  const apolloConfig = {
    schema,
    playground: config.playgroundConfig,
    context: async ({ req }) => {
      // pass request + db ref into context for each resolver
      return {
        req: req,
        db: client,
      }
    }
  }

  const voyagerConfig = {
    securityService: keycloakService,
    metrics,
    auditLogger
  }

  const apolloServer = VoyagerServer(apolloConfig, voyagerConfig)

  apolloServer.applyMiddleware({ app })
  apolloServer.installSubscriptionHandlers(httpServer)

  httpServer.listen({ port: config.port }, () => {
    console.log(`🚀  Server ready at http://localhost:${config.port}/graphql`)
  })
}

start()
