const express = require('express')
const http = require('http')
const cors = require('cors')

const metrics = require('@aerogear/voyager-metrics')
const auditLogger = require('@aerogear/voyager-audit')
const { VoyagerServer } = require('@aerogear/voyager-server')

const { appTypeDefs, appResolvers } = require('./schema')
const connect = require("./db")

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

  const { applyFileMiddelware } = require('./files');
  applyFileMiddelware(app);
  
  app.get('/health', (req, res) => res.sendStatus(200))

  // connect to db
  const client = await connect(config.db);

  const apolloConfig = {
    typeDefs: appTypeDefs,
    resolvers: appResolvers,
    playground: config.playgroundConfig,
    context: async ({ req }) => {
      // pass request + db ref into context for each resolver
      return {
        req: req,
        db: client,
      }
    },
    uploads: {
      // Limits here should be stricter than config for surrounding
      // infrastructure such as Nginx so errors can be handled elegantly by
      // graphql-upload:
      // https://github.com/jaydenseric/graphql-upload#type-uploadoptions
      maxFileSize: 10000000, // 10 MB
      maxFiles: 5
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
