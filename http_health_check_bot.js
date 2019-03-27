require('dotenv').config()
const Telegraf = require('telegraf')
const cronJob = require('cron').CronJob
const fetch = require ('node-fetch')


const bot = new Telegraf(process.env.BOT_TOKEN)

const dns = require('dns')



let appAccCount = 0
let appDelay = 0
let siteAccCount = 0
let siteDelay = 0

//https://cosmos.codes/server_status
//https://lunagram.network/server_status

const appJsonHelathCheck = (url)=>{
	
	let startTime = Date.now()
	
	timeout(5000,getFetchData(url)).then((json) => {
		console.log(`json : ${json.active}\n`)
		
		let endTime = Date.now()
		appDelay = endTime - startTime
		
 		if(json.active === true){
 			//without time out
			if(appAccCount > 0){
				appAccCount = 0
				bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`${url} server is active! (${appDelay}ms)`)
			}
 		}else{
 			//active is not true
 			if(appAccCount == 0){
 				bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`${url} server is active is not true`)
 			}
 			
 			if(appAccCount >= 15){
 				appAccCount = 0
 			}else{
 				appAccCount = appAccCount + 1
 			}
 		}
	}).catch(function(err){
		
		if(appAccCount == 0){
			bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`${url} server is timeout!`)
		}
		//log dns
		getIpWithUrl(process.env.APP_URL)
		
		//0 alert and after 15 alert
		if(appAccCount >= 15){
			appAccCount = 0
		}else{
			appAccCount = appAccCount + 1
		}
		
	})
}
const siteJsonHelathCheck = (url)=>{
	
	let startTime = Date.now()
	
	timeout(5000,getFetchData(url)).then((json) => {
		let endTime = Date.now()
		siteDelay = endTime - startTime
		
 		if(json.active === true){
 			//without time out
			if(siteAccCount > 0){
				siteAccCount = 0
				bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`${url} server is active! (${siteDelay}ms)`)
			}
 		}else{
 			//active is not true
 			if(siteAccCount == 0){
 				bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`${url} server is active is not true`)
 			}
 			
 			if(siteAccCount >= 15){
 				siteAccCount = 0
 			}else{
 				siteAccCount = siteAccCount + 1
 			}
 		}
	}).catch(function(err){
		
		if(siteAccCount == 0){
			bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`${url} server is timeout!`)
		}
		//log dns
		getIpWithUrl(process.env.SITE_URL)
		
		//0 alert and after 15 alert
		if(siteAccCount >= 15){
			siteAccCount = 0
		}else{
			siteAccCount = siteAccCount + 1
		}
		
	})
}

//every 2 sec iterate
const cron = new cronJob('*/2 * * * * *', function() {
	appJsonHelathCheck(process.env.APP_URL)
	siteJsonHelathCheck(process.env.SITE_URL)
}).start()


//bot command setting
bot.startPolling()

//status
bot.command('app_status', (ctx) => {
	ctx.reply(`serverUrl : ${process.env.SITE_URL}\naccCount : ${appAccCount}\ndelay : ${appDelay} ms`)
})
bot.command('site_status', (ctx) => {
	ctx.reply(`serverUrl : ${process.env.APP_URL}\naccCount : ${siteAccCount}\ndelay : ${siteDelay} ms`)
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

//time out
function timeout(ms, promise) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(new Error('timeout'))
    }, ms)
    promise.then(resolve, reject)
  })
}

function getIpWithUrl(fullUrl){
	let host = require('url').parse(fullUrl).hostname
	dns.lookup(host, (err, address, family) => {
		if(err){
			console.log(`[${new Date()}]dns lookup error - ${err}\n`)
		}else{
			console.log(`[${new Date()}]dns ip - ${host} => ${address}\n`)
		}
	})
}