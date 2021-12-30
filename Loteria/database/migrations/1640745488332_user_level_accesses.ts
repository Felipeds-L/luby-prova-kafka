import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserLevelAccesses extends BaseSchema {
  protected tableName = 'user_level_accesses'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE')
        table
        .integer('level_access_id')
        .unsigned()
        .defaultTo(2)
        .references('level_accesses.id')
        .onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
