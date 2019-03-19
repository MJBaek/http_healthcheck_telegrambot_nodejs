require('dotenv').config()
const Telegraf = require('telegraf')
const cronJob = require('cron').CronJob
const fetch = require ('node-fetch')


const bot = new Telegraf(process.env.BOT_TOKEN)



let accCount = 0
let delay = 0
//https://cosmos.codes/server_status
//https://lunagram.network/server_status

//every 2 sec iterate
const cron = new cronJob('*/2 * * * * *', function() {
	let startTime = Date.now()
	timeout(5000,getFetchData(process.env.APP_URL)).then((json) => {
		let endTime = Date.now()
		delay = endTime - startTime
		
 		if(json.active === true){
 			//without time out
			if(accCount > 0){
				accCount = 0
				bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`server is active! (${delay}ms)`)
			}
 		}else{
 			//active is not true
 			if(accCount == 0){
 				bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`server is active is not true`)
 			}
 			
 			if(accCount >= 15){
 				accCount = 0
 			}else{
 				accCount = accCount + 1
 			}
 		}
	}).catch(function(err){
		
		if(accCount == 0){
			bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`server is timeout!`)
		}
		
		//0 alert and after 15 alert
		if(accCount >= 15){
			accCount = 0
		}else{
			accCount = accCount + 1
		}
		
	})
}).start()


//bot command setting
bot.startPolling()

//status
bot.command('status', (ctx) => {
	ctx.reply(`serverUrl : ${process.env.APP_URL}\naccCount : ${accCount}\ndelay : ${delay} ms`)
})

// async function
async function getFetchData(url) {
	try{
		let response = await fetch(url)
		let data = await response.json()
		return data
	}catch(err){
		return err
	}
}

//Rough implementation. Untested.
function timeout(ms, promise) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(new Error("timeout"))
    }, ms)
    promise.then(resolve, reject)
  })
}