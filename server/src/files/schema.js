const mkdirp = require('mkdirp')
const shortid = require('shortid')
const express = require('express')

const fileTypeDefs = `
 type File {
    filename: String!
    mimetype: String!
    encoding: String!
    url: String!
  }
  type Query {
    uploads: [File]
  }
  type Mutation {
    singleUpload(file: Upload!): File!
  }
`

const PREFIX = 'files'
const UPLOAD_DIR = `./${PREFIX}`
// Ensure upload directory exists.
mkdirp.sync(UPLOAD_DIR)

const storeFS = ({ stream, filename }) => {
  const id = shortid.generate()
  const name = `${id}_${filename}`
  const path = `${UPLOAD_DIR}/${name}`
  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated)
          // Delete the truncated file.
          fs.unlinkSync(path)
        reject(error)
      })
      .pipe(fs.createWriteStream(path))
      .on('error', error => reject(error))
      .on('finish', () => resolve(name))
  )
}

const fileResolvers = {
  Query: {
    uploads: async (obj, args, context) => {
      console.log("Fetching files")
      return context.db.select().from(PREFIX)
    }
  },
  Mutation: {
    async singleUpload(parent, { file }) {
      const { stream, filename, mimetype, encoding } = await file;
      const filename = await storeFS(stream, fileName)
      const url = `/${PREFIX}/${filename}`
      const result = await context.db(PREFIX).insert({
        filename, mimetype, encoding, url
      }).returning('*').then((rows) => rows[0])
      return result
    }
  }
}

const applyFileMiddelware = (app) => {
  app.use('/files', express.static('files'))
}


module.exports = {
  applyFileMiddelware,
  fileTypeDefs,
  fileResolvers,
  PREFIX
}