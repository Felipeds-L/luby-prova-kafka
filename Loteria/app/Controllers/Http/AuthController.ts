import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UserLevelAccess from 'App/Models/UserLevelAccess'
import LevelAccess from 'App/Models/LevelAccess'
import EmailValidator from 'App/Validators/EmailValidator'


export default class AuthController {

  public async login({ auth, request, response }: HttpContextContract){
    await request.validate(EmailValidator)
    const email = request.input('email')
    const password = request.input('password')

    const user = await User.findByOrFail('email', email)

    const level = await LevelAccess.query().whereIn('id', UserLevelAccess.query().select('level_access_id').where('user_id', user.id))


    try{
      const token = await auth.use('api').attempt(email, password)
      return response.status(200).json({token: token, user: [user.username, user.email], level_access: level})
    }catch{
      return response.status(401).json({Error: 'Invalid credential'})
    }
  }
}
