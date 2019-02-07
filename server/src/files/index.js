const express = require('express')
const { fileTypeDefs, fileResolvers } = require('./schema')

const applyFileMiddelware = (app) => {
    app.use('/files', express.static('files'))
}

module.exports = {
    fileTypeDefs, fileResolvers,
    applyFileMiddelware
}