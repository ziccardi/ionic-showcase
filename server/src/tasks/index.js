const GraphQLModule  = require('@graphql-modules/core').GraphQLModule

const { typeDefs, resolvers } = require('./schema')
const { subTypeDefs, subResolvers } = require('./subscriptions')

const TaskModule = new GraphQLModule({
    typeDefs,
    resolvers,
});

const TaskSubscriptionsModule = new GraphQLModule({
    subTypeDefs,
    subResolvers,
});

module.exports = {
    TaskModule,
    TaskSubscriptionsModule
}