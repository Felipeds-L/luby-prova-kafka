import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import LevelAccess from 'App/Models/LevelAccess'

export default class LevelAccessSeeder extends BaseSeeder {
  public async run () {
    await LevelAccess.createMany([
      {
        level: 'adm'
      },
      {
        level: 'client'
      }
    ])
  }
}
