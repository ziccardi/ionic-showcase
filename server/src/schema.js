const { gql } = require('apollo-server')
const deepmerge = require("deepmerge")
const {
    taskTypeDefs,
    subscriptionTypeDefs,
    taskResolvers,
    subscriptionResolvers
} = require('./tasks')

// TODO Replace with GraphQL-modules once Voyager will allow for that

const appResolvers = deepmerge(taskResolvers, subscriptionResolvers)
const appTypeDefs = gql`
    ${taskTypeDefs} 

    ${subscriptionTypeDefs}
`

module.exports = {
    appTypeDefs, appResolvers
}