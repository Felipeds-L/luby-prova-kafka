import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cart from 'App/Models/Cart';
import Game from 'App/Models/Game'
import User from 'App/Models/User';
import UserLevelAccess from 'App/Models/UserLevelAccess';
import GameNameValidator from 'App/Validators/GameNameValidator';

export default class GamesController {
  public async index({ response }: HttpContextContract) {
    try{
      const games = await Game.query();
      const gamesJSON = games.map((game) => game.serialize())
      const cart = await Cart.query().select('id', 'min_cart_value').first();

      return response.status(200).json({'min-cart-value': cart?.min_cart_value, types: gamesJSON})
    }catch{
      return response.status(406).json({Error: 'Any Game has been found!'})
    }
  }

  public async store({ request, auth, response }: HttpContextContract) {
    await request.validate(GameNameValidator)
    const logged = await User.findOrFail(auth.user?.id)
    const user_level = await UserLevelAccess.query().where('user_id', logged.id)

    let isAdministrator = false
    user_level.forEach((level) => {
      if(level.level_access_id === 1){
        isAdministrator = true
      }
    })

    if(isAdministrator){
      const data = await request.only(['type', 'description', 'range', 'price', 'max_number', 'color'])

      try{
        const game = await Game.create(data);
        return response.status(200).json({created_game: game})

      }catch{
        return response.status(400).json({error: 'Error on create a new game'})
      }
    }else{
      return response.status(403).json({Error: 'Only Administrators can create a game'})
    }

  }

  public async show({ params }: HttpContextContract) {

    try{
      const game = await Game.findOrFail(params.id)
      return {game: game}
    }catch{
      return {error: 'Game do not found'}
    }
  }

  public async update({ params, request, response, auth}: HttpContextContract) {
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
        const data = await request.only(['type', 'description', 'range', 'price', 'max_number', 'color'])
        const game = await Game.findOrFail(params.id)
        try{
          game.merge(data)
          await game.save()
          return {game: game}
        }catch{
          return response.status(400).json({Error: `Error on update game ${game.id}`})
        }
      }catch{
        return {Error: 'Game not found, or column invalid'}
      }
    }else{
      return response.status(403).json({Error: `You don't have permission to change a game, ask for the administrator.`})
    }
  }

  public async destroy({ params, auth, response }: HttpContextContract) {
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
        const game = await Game.findOrFail(params.id)
        try{
          game.delete()
          return {deleted: true}
        }catch{
          return response.status(200).json({Error: 'Error on delete game'})
        }
      }catch{
        return response.status(400).json({error: 'Game do not found'})
      }
    }else{
      return response.status(403).json({Error: 'Only Administrators can delete a game!'})
    }

  }
}
