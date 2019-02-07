

async function createTasksTables(db) {
    const tasksExists = await db.schema.hasTable('files')
    if (!tasksExists) {
        await db.schema.createTable('files', function(table) {
            table.string('filename')
            table.string('url')
            table.string('mimetype')
            table.integer('encoding')
            table.increments('id')
        })
    }
}

module.exports = createTasksTables



