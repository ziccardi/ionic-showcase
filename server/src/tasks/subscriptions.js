const { gql } = require('apollo-server')
const { pubSub } = require('../subscriptions')

const TASKS_SUBSCRIPTION_KEY = 'tasks'


const typeDefs = gql`
    type Subscription {
      tasks: TaskSubscription!
    }

    type TaskSubscription {
      action: actionType!
      task: Task!
    }
    enum actionType {
      CREATED
      MUTATED
      DELETED
    }
`

const resolvers = {
  Subscription: {
    tasks: {
      subscribe: () => pubSub.asyncIterator(TASKS_SUBSCRIPTION_KEY)
    }
  },
}



module.exports = {
  typeDefs,
  resolvers,
  TASKS_SUBSCRIPTION_KEY
}