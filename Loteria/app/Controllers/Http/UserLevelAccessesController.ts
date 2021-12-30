import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UserLevelAccess from 'App/Models/UserLevelAccess'

export default class UserLevelAccessesController {
  public async index({auth, response}: HttpContextContract) {
    const user = await User.findOrFail(auth.user?.id)
    const levels = await UserLevelAccess.query().where('user_id', user.id)

    let isAdministrator = false
    levels.forEach((level) => {
      if(level.level_access_id === 1){
        isAdministrator = true
      }
    })

    if(isAdministrator){
      try{
        const user_level = await UserLevelAccess.all()
        return response.status(200).json({user_level_access: user_level})
      }catch{
        return response.status(500).json({Error: 'Can not find the Users_levels_Acccesses'})
      }
    }else{
      return response.status(403).json({Error: 'Only administrators can see all the level_access users'})
    }

  }

  public async store({ request, auth, response }: HttpContextContract) {
    const data = await request.only(['user_id', 'level_access_id'])
    const user = await User.findOrFail(auth.user?.id)
    const levels = await UserLevelAccess.query().where('user_id', user.id)

    let isAdministrator = false
    levels.forEach((level) => {
      if(level.level_access_id === 1){
        isAdministrator = true
      }
    })

    if(isAdministrator){
      try{
        const user_level = await UserLevelAccess.create({
          user_id: data.user_id,
          level_access_id: data.level_access_id
        })

        return response.status(200).json({created: true, user_level_access: user_level})
      }catch{
        return response.status(500).json({Error: `Error on add a level_access to user ${user.id}`})
      }
    }else{
      return response.status(403).json({Error: 'Only adminsitrators can confere a level_access to another user!'})
    }

  }

  public async show({ params, auth, response }: HttpContextContract) {
    const user = await User.findOrFail(auth.user?.id)
    const user_level = await UserLevelAccess.query().where('user_id', user.id)

    let isAdministrator = false
    user_level.forEach((level) => {
      if(level.level_access_id === 1){
        isAdministrator = true
      }
    })
    if(isAdministrator){
      try{
        const user_level = await UserLevelAccess.findOrFail(params.id)
        return response.status(200).json({user_level_access: user_level})
      }catch{
        return response.status(500).json({Error: 'Error user_level_access not found'})
      }
    }else{
      return response.status(403).json({Error: 'Only administrators can show all the users_level_access'})
    }
  }

  public async update({ request, auth, response }: HttpContextContract) {

    const data = await request.only(['user_id', 'level_access_id'])
    const user = await User.findOrFail(auth.user?.id)
    const levels = await UserLevelAccess.query().where('user_id', user.id)
    const user_level = await UserLevelAccess.findByOrFail('user_id', user.id)

    let isAdministrator = false
    levels.forEach((level) => {
      if(level.level_access_id === 1){
        isAdministrator = true
      }
    })
    if(isAdministrator){
      try{
        user_level.merge(data)
        await user_level.save()

        return response.status(200).json({Updated: true, user_level: user_level})
      }catch{
        return response.status(500).json({Error: 'Error on try update'})
      }
    }else{
      return response.status(403).json({Error: 'Only administrators can update a level_access to one user!'})
    }

  }

  public async destroy({ params, auth, response }: HttpContextContract) {
    const user = await User.findOrFail(auth.user?.id)
    const user_level = await UserLevelAccess.query().where('user_id', user.id)
    let isAdministrator = false
    user_level.forEach((level) => {
      if(level.level_access_id === 1){
        isAdministrator = true
      }
    })

    if(isAdministrator){
      try{
        const user_level = await UserLevelAccess.findOrFail(params.id)
        user_level.delete()

        return response.status(200).json({Deleted: true})
      }catch{
        return response.status(500).json({Error: 'Error on delete user_level'})
      }
    }else{
      return response.status(403).json({Error: 'Only administrators can remove a level_access from another user!'})
    }

  }
}
