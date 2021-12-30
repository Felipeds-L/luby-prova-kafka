import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cart from 'App/Models/Cart'
import User from 'App/Models/User'
import UserLevelAccess from 'App/Models/UserLevelAccess'

export default class CartsController {
  public async index({ response }: HttpContextContract) {
    const cart = await Cart.all()

    try{
      return response.status(200).json({cart: cart})
    }catch{
      return response.status(500).json({Error: 'Can not find any cart!'})
    }
  }
  // Essa função deve na realidade, criar se não existir, e editar o valor caso já exista um min_cart_value cadastrado
  public async store({ request, response, auth }: HttpContextContract) {
    const user = await User.findOrFail(auth.user?.id)
    const user_level = await UserLevelAccess.findByOrFail('user_id', user.id)

    const cart = await Cart.all();
    const data = await request.only(['min_cart_value'])
    if(user_level.level_access_id === 1){
      try{
        if(cart.length > 0){
          return response.status(500).json({Error: "There's already a cart in table, please update de value"})
        }else{
          const cartData = await Cart.create(data)

          return response.status(200).json({Created: true, cart: cartData})
        }
      }catch{
        return response.status(500).json({Error: 'Error on try create a cart'})
      }
    }else{
      return response.status(403).json({Error: `you don't have permission to define a min-cart-value.`})
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try{
      const cart = await Cart.findOrFail(params.id)
      return response.status(200).json( {Cart: cart})
    }catch{
      return response.status(500).json({Error: 'Error cart do not found'})
    }
  }

  public async update({ params, request, response, auth }: HttpContextContract) {
    const cart = await Cart.findOrFail(params.id)
    const data = await request.only(['min_cart_value'])

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
        cart.merge(data)
        await cart.save()

        return response.status(200).json({Updated: true, Cart: cart})
      }catch{
        return response.status(500).json({Updated: false, Error: 'Erro on update cart'})
      }
    }else{
      return response.status(403).json({Error: `you don't have permission to define a min-cart-value.`})
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
        const cart = await Cart.findOrFail(params.id)
        cart.delete()

        return response.status(200).json({Deleted: true})
      }catch{
        return response.status(500).json({Deleted: false, Error: 'Erron on try delete the cart'})
      }
    }else{
      return response.status(403).json({Error: 'Only Administrators can delete a cart'})
    }

  }
}
