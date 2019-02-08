const fs = require('fs')
const path = require('path')

class Config {
  constructor() {
    this.port = process.env.PORT || 4000
    this.db = {
      database: process.env.DB_NAME || 'users',
      user: process.env.DB_USERNAME || 'postgresql',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOSTNAME || '127.0.0.1',
      port: process.env.DB_PORT || '5432'
    }

    this.keycloakConfigPath = process.env.KEYCLOAK_CONFIG || path.resolve(__dirname, './keycloak.json')
    this.keycloakConfig = {
      "realm": "voyager-testing",
      "auth-server-url": "https://keycloak-09271b-collab-project.comm2.skunkhenry.com/auth",
      "ssl-required": "none",
      "resource": "scoady-test",
      "credentials": {
        "secret": "ae60ac07-f62a-4748-a9f6-ebec5670e1cd"
      },
      "confidential-port": 0
    }

    this.playgroundConfig = {
      settings: {
        'editor.theme': 'light',
        'editor.cursorShape': 'block'
      },
      tabs: [{
        endpoint: `/graphql`,
        variables: {},
        query: fs.readFileSync(path.resolve(__dirname, './playground.gql'), 'utf8')
      }]
    }
  }
}

function readKeycloakConfig(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'))
  } catch (e) {
    console.error(`Warning: couldn't find a keycloak config at ${path}`)
  }
}

module.exports = new Config()