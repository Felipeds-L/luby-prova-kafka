import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Kafka } from 'kafkajs';
import Bet from 'App/Models/Bet'
import User from 'App/Models/User'
import UserLevelAccess from 'App/Models/UserLevelAccess';
import Game from 'App/Models/Game';
import Cart from 'App/Models/Cart';

const nodemailer = require('nodemailer');



export default class BetsController {

  public async index({ auth, response }: HttpContextContract) {
    const bet = await Bet.all()
    const user = await User.findOrFail(auth.user?.id)
    const user_level = await UserLevelAccess.findByOrFail('user_id', user.id)

    if(user_level.level_access_id === 1){
      return response.status(200).json({Bets: bet})
    }else{
      return response.status(403).json({Error: 'Only administrators can see all the bets!'})
    }

  }

  public async store({ request, auth, response }: HttpContextContract) {
    const allData = await request.input('bets')
    const min_cart_value = await Cart.all()
    let cart_value = 0
    min_cart_value.forEach((cart) => {
      cart_value += cart.min_cart_value
    })

    let sum_price = 0
    for (let x=0;x<allData.length; x++){
      const aGame = await Game.findOrFail(allData[x].game_id)
      sum_price += aGame.price
    }

    if(sum_price >= cart_value){
      const user = await User.findOrFail(auth.user?.id)
      const admins = await UserLevelAccess.query().where('level_access_id', 1)

      let isBetAlreadyMade = false
      let inBetAlreadyExists = false

      let lastWeek = (24*60*60*1000)*30
      let currentDate = new Date()
      let lastWeekDate = new Date()
      lastWeekDate.setTime(lastWeekDate.getTime()-lastWeek)
      for(let x = 0; x < allData.length; x++){

        const betsFromUser = await Bet.query()
          .where('user_id', user.id)
          .where('game_id', allData[x].game_id)
          .whereBetween('created_at', [lastWeekDate, currentDate])

        // verifica se alguma aposta que está sendo feita já foi feita nos últimos 30 dias
        for (let x = 0;x < betsFromUser.length; x++){
          for (let y = 0; y < allData.length; y++){
            let bet_made = betsFromUser[x].numbers_choosed.split(',')
            let bet_now = allData[y].numbers_choosed.split(',')
            if(this.compareListas(bet_made.sort(), bet_now.sort())){
              isBetAlreadyMade = true
            }
          }
        }
        // verifica se há alguma aposta repetida dentro das que se está tentando fazer
        for (let x =0;x < allData.length; x++){
          for (let y = x+1; y < allData.length-1; y++){
            let current_bet = allData[x].numbers_choosed.split(',')
            let next_bet = allData[y].numbers_choosed.split(',')

            if(this.compareListas(current_bet.sort(), next_bet.sort())){
              inBetAlreadyExists = true
            }
          }
        }

        //falha na verificação de duplicidade

        if(!isBetAlreadyMade){
          if(!inBetAlreadyExists){
            try{
              for (let x=0;x<allData.length; x++){
                const gameIn = await Game.findOrFail(allData[x].game_id)
                const numbers = allData[x].numbers_choosed;
                let values = numbers.split(',')

                let listNonDuplicated = [...new Set(values)]

                if(listNonDuplicated.length === gameIn.max_number){
                  await Bet.create({
                    user_id: user.id,
                    game_id: gameIn.id,
                    numbers_choosed: allData[x].numbers_choosed
                  })
                }else{
                  return response.status(500).json({Error: `Verify on the position: ${x} if there's a duplicated number!`})
                }
              }

              const kafka = new Kafka({
                clientId: 'my-app',
                brokers: ['localhost:9092']
              })
              const new_producer = kafka.producer()

              await new_producer.connect()

              const message = {
                user: {username: user.username, email: user.email}
              }
              new_producer.send({
                topic: 'sendEmailToUserWhenMakeABet',
                messages: [
                  { value: JSON.stringify(message) },
                ],
              })
              for(let x = 0; x < admins.length; x++){

                const user_admin = await User.findOrFail(admins[x].user_id)

                const admins_message = {
                  admin: {username: user_admin.username, email: user_admin.email, gamer: user.username}
                }

                new_producer.send({
                  topic: 'sendEmailToAdmins',
                  messages: [
                    { value: JSON.stringify(admins_message) },
                  ],
                })
              }
              await new_producer.disconnect()

              return response.status(200).json({created: true})

            }catch{
              return response.status(500).json({Error: 'Can not make the bet, please try it again!'})
            }
          }else{
            return response.status(500).json({Error: 'There is a game duplicated from the same game on your bet, please check it and try it again!'})
          }
        }else{
          return response.status(406).json({Error: 'Thre is a bet that you already have been made in the last 30 days for this game with the same numbers, please choose another combination!'})
        }
      }
    }else{
      return response.status(500).json({Error: `Your bet only cost ${sum_price}, the minimun is ${cart_value}`})
    }
  }

  public async show({ params, auth, response }: HttpContextContract) {
    const user = await User.findOrFail(auth.user?.id)
    const bet = await Bet.findOrFail(params.id)
    if(user.id === bet.user_id){
      console.log(bet.numbers_choosed)
      return response.status(200).json({Bet: bet})
    }else{
      return response.status(403).json({Error: 'Your are trying access a bet whos the owner is not you.'})
    }
  }

  public async update({ params, request, response, auth }: HttpContextContract) {
    const data = await request.only(['user_id', 'game_id', 'numbers_choosed'])
    const bet = await Bet.findOrFail(params.id)
    const user = await User.findOrFail(auth.user?.id)

    if(user.id === bet.user_id){
      try{
        bet.merge(data)

        await bet.save()

        return response.status(200).json({Updated: true, Bet: bet})
      }catch{
        return response.status(400).json({Error: 'Could not update de bet. Try again.'})
      }
    }
  }

  public async destroy({ params, auth, response }: HttpContextContract) {
    const user = await User.findOrFail(auth.user?.id)
    const bet = await Bet.findOrFail(params.id)


    if(user.id === bet.user_id){
      try{
        bet.delete()

        return response.status(200).json({deleted: true})
      }catch{
        return response.status(400).json({Error: `Error on delele the bet ${bet.id}. Try again.`})
      }
    }else{
      return response.status(403).json({Error: `Your not the owner of this bet`})
    }

  }

  public async newBet(user_id){
    const user = await User.findOrFail(user_id)
    let transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "583128b8852a7b",
        pass: "495b0a35ecc53b"
      }
    });

    let message = {
      from: "noreply@milk.com",
      to: user.email,
      subject: "Aposta realizada!",
      text: `Prezado(a) ${user.username}. \n\n, sua aposta foi realizada com sucesso!. \n\n`,
      html: `<p>Prezado(a) ${user.username}. \n\n, sua aposta foi realizada com sucesso!<br><br></p>`
    }

    transport.sendMail(message)
  }

  public compareListas(lista1, lista2){
    if (lista1.length !== lista2.length) return false;
      for (let i = 0; i < lista2.length; i++){
        if (lista1[i] !== lista2[i]){
            return false;
        }
      }
    return true;
  }

  public compareValues(lista){
    for(let i = 0; i < lista.length; i++) {
        if(lista.indexOf(lista[i]) != i) {
            return true;
        };
    }
    return false;
  }
}
