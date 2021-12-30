import { BaseTask } from 'adonis5-scheduler/build'
import User from 'App/Models/User'
import Bet from 'App/Models/Bet'
const nodemailer = require('nodemailer');


export default class EmailTask extends BaseTask {
	public static get schedule() {

		return '* * 9 * * *'
	}
	/**
	 * Set enable use .lock file for block run retry task
	 * Lock file save to `build/tmpTaskLock`
	 */
	public static get useLock() {
		return false
	}

	public async handle() {
    this.findNoBetUser()
  }

  public async findNoBetUser(){
    const user = await User.all();
    let lastWeek = (24*60*60*1000)*7
    let currentDate = new Date()
    let lastWeekDate = new Date()
    lastWeekDate.setTime(lastWeekDate.getTime()-lastWeek)

    for(let x = 0; x<user.length; x++){
      const bet = await Bet.query().where('user_id', user[x].id).whereBetween('created_at', [lastWeekDate, currentDate])
      if(bet.length > 0){
        console.log(`The user ${user[x].username} already made a bet on the last 7 days`)
      }else{
        console.log(`The user ${user[x].username} don't make a bet yet, an email will be sent`)
        this.sendMail(user[x].id)
      }
    }
  }

  public async sendMail(user_id){
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
      subject: "Alerta: Você não joga há 7 dias!",
      text: `Prezado(a) ${user.username}. \n\n Olá Sr.Player, sabia que fazem 7 dias que você não faz uma bet?
       Que tal correr lá para o sistema e realizar uma nova aposta, e concorrer a milhares de reais?. \n\n`,

      html: `<p>Prezado(a) ${user.username}. <br><br> Olá Sr.Player, sabia que fazem 7 dias que você não faz uma bet?
      Que tal correr lá para o sistema e realizar uma nova aposta, e concorrer a milhares de reais?<br><br></p>`
    };

    transport.sendMail(message)
  }

}
