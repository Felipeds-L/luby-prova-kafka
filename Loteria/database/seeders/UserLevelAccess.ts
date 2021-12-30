import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import UserLevelAccess from 'App/Models/UserLevelAccess'
export default class UserLevelAccessSeeder extends BaseSeeder {
  public async run () {
    await UserLevelAccess.createMany([
      {
        user_id: 1,
        level_access_id: 1
      },
      {
        user_id: 1,
        level_access_id: 2
      },
      {
        user_id: 2,
        level_access_id: 2
      },
      {
        user_id: 3,
        level_access_id: 2
      },
      {
        user_id: 4,
        level_access_id: 1
      },
      {
        user_id: 4,
        level_access_id: 2
      }
    ])
  }
}
