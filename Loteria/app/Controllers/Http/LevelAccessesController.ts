import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LevelAccess from 'App/Models/LevelAccess'
import User from 'App/Models/User'
import UserLevelAccess from 'App/Models/UserLevelAccess'

export default class LevelAccessesController {
  public async index({auth, response}: HttpContextContract) {
    const level = await LevelAccess.all()
    const logged = await User.findOrFail(auth.user?.id)
    const user_level = await UserLevelAccess.query().where('user_id', logged.id)

    let isAdministrator = false
    user_level.forEach((level) => {
      if(level.level_access_id === 1){
        isAdministrator = true
      }
    })

    if(isAdministrator){
      return response.status(200).json({level_access: level})
    }else{
      return response.status(403).json({Error: 'Only Administrators can see all level_access!'})
    }

  }

  public async store({ request, auth, response }: HttpContextContract) {
    const data = await request.only(['level'])
    const logged = await User.findOrFail(auth.user?.id)
    const user_level = await UserLevelAccess.query().where('user_id', logged.id)

    let isAdministrator = false
    user_level.forEach((level) => {
      if(level.level_access_id === 1){
        isAdministrator = true
      }
    })
    if(isAdministrator){
      try{
        const level = await LevelAccess.create(data)
        return response.status(200).json({created: true, level_access: level})
      }catch{
        return response.status(500).json({created: false, Error: 'Error on create a new level access'})
      }
    }else{
      return response.status(403).json({Error: 'Only Administrators can create a new access_level!'})
    }
  }

  public async show({ params, auth, response }: HttpContextContract) {
    const logged = await User.findOrFail(auth.user?.id)
    const user_level = await UserLevelAccess.query().where('user_id', logged.id)

    let isAdministrator = false
    user_level.forEach((level) => {
      if(level.level_access_id === 1){
        isAdministrator = true
      }
    })
    if(isAdministrator){
      try{
        const level = await LevelAccess.findOrFail(params.id)

        return response.status(200).json({level_access: level})
      }catch{
        return response.status(500).json({Error: 'Level_Access do not found!'})
      }
    }else{
      return response.status(403).json({Error: 'Only Administrators can see the Level_Accesses'})
    }

  }

  public async update({ params, request, response, auth }: HttpContextContract) {
    const level = await LevelAccess.findOrFail(params.id)
    const data = await request.only(['level'])
    const logged = await User.findOrFail(auth.user?.id)
    const user_level = await UserLevelAccess.query().where('user_id', logged.id)

    let isAdministrator = false
    user_level.forEach((level) => {
      if(level.level_access_id === 1){
        isAdministrator = true
      }
    })

    if(isAdministrator){
      try{
        level.merge(data)
        await level.save()

        return response.status(200).json({updated: true, level_access: level})
      }catch{
        return response.status(500).json({Error: 'Error on update level_access'})
      }
    }else{
      return response.status(403).json({Error: 'Only Administrators can update level_accesses!'})
    }

  }

  public async destroy({ params, auth, response }: HttpContextContract) {
    const level = await LevelAccess.findOrFail(params.id)
    const logged = await User.findOrFail(auth.user?.id)
    const user_level = await UserLevelAccess.query().where('user_id', logged.id)

    let isAdministrator = false
    user_level.forEach((level) => {
      if(level.level_access_id === 1){
        isAdministrator = true
      }
    })

    if(isAdministrator){
      try{
        level.delete()
        return response.status(200).json({Deleted: true})
      }catch{
        return response.status(500).json({Error: 'Error on delete access_level'})
      }
    }else{
      return response.status(403).json({Error: 'Only Administrators can delete a level_access!'})
    }
  }
}
