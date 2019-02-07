const { gql } = require('apollo-server')
const mkdirp = require('mkdirp')
const shortid = require('shortid')

const fileTypeDefs = gql`
 type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }
  type Query {
    uploads: [File]
  }
  type Mutation {
    singleUpload(file: Upload!): File!
  }
`

const UPLOAD_DIR = './files'
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
    files: async (obj, args, context) => {
      const result = context.db.select().from('files')
      if (args.first && args.after) {
        result.limit(args.first)
        result.offset(args.after)
      } else if (args.first) {
        result.limit(args.first)
      }
      return result
    }
  },
  Mutation: {
    async singleUpload(parent, { file }) {
      const { stream, filename, mimetype, encoding } = await file;
      const filename = await storeFS(stream, fileName)
      const url = `http://localhost:4000/files/${filename}`
      const result = await context.db('files').insert({
        filename, mimetype, encoding, url
      }).returning('*').then((rows) => rows[0])
      return result
    }
  }
}

module.exports = {
  fileTypeDefs,
  fileResolvers
}