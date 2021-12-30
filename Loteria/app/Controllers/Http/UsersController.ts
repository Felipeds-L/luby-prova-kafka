import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from 'App/Models/User';
import Bet from 'App/Models/Bet';
import UserLevelAccess from 'App/Models/UserLevelAccess';
import EmailValidator from 'App/Validators/EmailValidator';
import UserNameValidator from 'App/Validators/UserNameValidator';
import LevelAccess from 'App/Models/LevelAccess';

const nodemailer = require('nodemailer');


export default class UsersController{
  public async index({ auth, response }: HttpContextContract) {
    const user = await User.query().select('id','username', 'email')
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
        return response.status(200).json({User: user})
      }catch{
        return response.status(400).json({Error: `Problem on trying bring all users, please try again!`})
      }
    }else{
      return response.status(403).json({Error: `Only Administrators can see all user information`})
    }
  }

  public async store({request, response}: HttpContextContract) {

    await request.validate(EmailValidator)
    await request.validate(UserNameValidator)

    try{
      const data = await request.only(['email', 'username', 'password'])
      const user = await User.create(data)
      const user_level_data = request.only(['level_access'])
      await UserLevelAccess.create({
        user_id: user.id,
        level_access_id: user_level_data.level_access
      })
      const find_user = await User.findByOrFail('email', data.email)
      const find_level = await UserLevelAccess.findByOrFail('user_id', find_user.id)
      const find_leve_name = await LevelAccess.findOrFail(find_level.level_access_id)
      // this.congratSingIn(user.id)

      return response.status(200).json({created: true, user: user.username, level_access: find_leve_name.level})
    }catch{
      return response.status(400).json({Error: 'Can not create the user, please try it again!'})
    }
  }

  public async show({ params, auth, response }: HttpContextContract) {
    const user = await User.findOrFail(params.id)
    const logged = await User.findOrFail(auth.user?.id)
    const user_level = await UserLevelAccess.query().where('user_id', logged.id)

    let isAdministrator = false
    user_level.forEach((level) => {
      if(level.level_access_id === 1){
        isAdministrator = true
      }
    })

    if(isAdministrator || user.id === auth.user?.id){
      try{
        let lastWeek = (24*60*60*1000)*30
        let currentDate = new Date()
        let lastWeekDate = new Date()
        lastWeekDate.setTime(lastWeekDate.getTime()-lastWeek)

        const bets = await Bet.query().where('user_id', user.id).whereBetween('created_at', [lastWeekDate, currentDate])

        return response.status(200).json({User: user.username, Bets: bets})
      }catch{
        return response.status(400).json({Error: `Wasn't possible bring the user information, please try again!`})
      }
    }else{
      return response.status(403).json({Error: `Only Administrators can see another user information`})
    }

  }

  public async update({ request, response, auth }: HttpContextContract) {
    const user = await User.findOrFail(auth.user?.id)
    const data = request.only(['email', 'username', 'password'])
    await request.validate(UserNameValidator)
    await request.validate(EmailValidator)


    try{
      user.merge(data)
      await user.save()
      return response.status(200).json({updated: true, User: user.username})
    }catch{
      return response.status(400).json({Error: "Error to update user datas"})
    }

  }

  public async destroy({ auth, response}: HttpContextContract) {
    const userLogged = await User.findOrFail(auth.user?.id)


    try{
      userLogged.delete()
      return response.status(200).json({ Deleted: true})
    }catch{
      return response.status(400).json({Error: 'Error on delete user'})
    }

  }

  public async forgotPassword({ request, response}: HttpContextContract){
    const email = await request.only(['email'])
    const user = await User.findByOrFail('email', email.email)
    user.token = (Math.random() * 323242).toString()
    user.token_created_at = new Date()

    await user.save()

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
      subject: "Recuperação de Senha",
      text: `Prezado(a) ${user.username}. \n\n segue abaixo informações para que possa recuperar sua senha. \n\n
      Use o token: ${user.token}`,
      html: `<strong>Recuperação de Senha<strong>

      <p>Olá ${user.username}, você solicitou uma recuperação de senha.</p>

      <p>Para dar prosseguimento, utilize o token ${user.token}</p>

      <a href="${request.input('redirec_url')}?token=${user.token}">Reset Password</a>
      `
    };

    transport.sendMail(message, function(err) {
      if(err){
        return response.status(400).json({
          erro: true,
          message: "Email can't bee sent"
        })
      }
    })


    return response.status(200).send({
      error: false,
      message: 'Email sent correctly'
    })
  }

  public async resetPassword({ request, response}: HttpContextContract){
    try{
      const {token, password} = request.all()

      const user = await User.findByOrFail('token', token)
      user.token = '';
      user.password = password
      await user.save()

      return response.status(200).send({Error: {Message: `the password for the user ${user.email} has been changed correctly!`}})
    }catch(err){
      return response.status(err.status).send({Error: {Message: 'Something is wrong, verify the email!'}})
    }
  }

  public async congratSingIn(user_id){
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
      subject: "Sua conta foi criada!",
      text: `Prezado(a) ${user.username}. \n\n, seja muito bem vindo, sua conta foi criada com sucesso!. \n\n`,
      html: `<p>Prezado(a) ${user.username}. \n\n, seja muito bem vindo, sua conta foi criada com sucesso!. <br><br></p>`
    };

    transport.sendMail(message)
  }


}
