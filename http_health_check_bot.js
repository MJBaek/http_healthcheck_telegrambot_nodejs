require('dotenv').config()
const Telegraf = require('telegraf')
const cronJob = require('cron').CronJob
const fetch = require ('node-fetch')


const bot = new Telegraf(process.env.BOT_TOKEN,{username: 'http_healthcheck_bot'})

const dns = require('dns')


let botStatus = false
let appAccCount = 0
let appDelay = 0
let app2AccCount = 0
let app2Delay = 0
let siteAccCount = 0
let siteDelay = 0


//https://cosmos.codes/server_status
//https://lunagram.network/server_status

const appJsonHelathCheck = (url)=>{
	
	let startTime = Date.now()
	
	timeout(5000,getFetchData(url)).then((json) => {
		
		let endTime = Date.now()
		appDelay = endTime - startTime
		
 		if(json.active === true){
 			//without time out
			if(appAccCount > 0){
				appAccCount = 0
				bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`${url} server is active! (${appDelay}ms)`)
			}
 		}else{
 			log(`${url}\nappAccCount - ${appAccCount}`)
 			//active is not true
 			if(appAccCount == 10){
 				bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`${url} server is inactive!`)
 			}
 			
 			if(appAccCount >= 15){
 				appAccCount = 0
 			}else{
 				appAccCount = appAccCount + 1
 			}
 		}
	}).catch(function(err){
		
		log(`${url} catch error\n${err}`)
		
		if(appAccCount == 0){
			bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`${url} server is timeout!`)
		}
		//log dns
//		getIpWithUrl(url)
		
		//0 alert and after 15 alert
		if(appAccCount >= 15){
			appAccCount = 0
		}else{
			appAccCount = appAccCount + 1
		}
		
	})
}
const app2JsonHelathCheck = (url)=>{
	
	let startTime = Date.now()
	
	timeout(5000,getFetchData(url)).then((json) => {
		
		let endTime = Date.now()
		app2Delay = endTime - startTime
		
 		if(json.active === true){
 			//without time out
			if(app2AccCount > 0){
				app2AccCount = 0
				bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`${url} server is active! (${app2Delay}ms)`)
			}
 		}else{
 			log(`${url}\napp2AccCount - ${app2AccCount}`)
 			//active is not true
 			if(app2AccCount == 10){
 				bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`${url} server is inactive!`)
 			}
 			
 			if(app2AccCount >= 15){
 				app2AccCount = 0
 			}else{
 				app2AccCount = app2AccCount + 1
 			}
 		}
	}).catch(function(err){
		
		log(`${url} catch error\n${err}`)
		
		if(app2AccCount == 0){
			bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`${url} server is timeout!`)
		}
		//log dns
//		getIpWithUrl(url)
		
		//0 alert and after 15 alert
		if(app2AccCount >= 15){
			app2AccCount = 0
		}else{
			app2AccCount = app2AccCount + 1
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
 			log(`${url}\nsiteAccCount - ${siteAccCount}`)
 			//active is not true
 			if(siteAccCount == 10){
 				bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`${url} server is active inactive!`)
 			}
 			
 			if(siteAccCount >= 15){
 				siteAccCount = 0
 			}else{
 				siteAccCount = siteAccCount + 1
 			}
 		}
	}).catch(function(err){
		
		log(`${url} catch error\n${err}`)
		
		if(siteAccCount == 0){
			bot.telegram.sendMessage(process.env.BOT_CHAT_ID,`${url} server is timeout!`)
		}
		//log dns
//		getIpWithUrl(url)
		
		//0 alert and after 15 alert
		if(siteAccCount >= 15){
			siteAccCount = 0
		}else{
			siteAccCount = siteAccCount + 1
		}
		
	})
}

//every 10 sec iterate
const cron = new cronJob('*/10 * * * * *', function() {
	appJsonHelathCheck(process.env.APP_URL)
	app2JsonHelathCheck(process.env.APP2_URL)
	siteJsonHelathCheck(process.env.SITE_URL)
})


//bot command setting
bot.startPolling()

//status
bot.command('app_status', (ctx) => {
	ctx.reply(`serverUrl : ${process.env.APP_URL}\naccCount : ${appAccCount}\ndelay : ${appDelay} ms`)
})
bot.command('app2_status', (ctx) => {
	ctx.reply(`serverUrl : ${process.env.APP2_URL}\naccCount : ${app2AccCount}\ndelay : ${app2Delay} ms`)
})
bot.command('site_status', (ctx) => {
	ctx.reply(`serverUrl : ${process.env.SITE_URL}\naccCount : ${siteAccCount}\ndelay : ${siteDelay} ms`)
})
bot.command('start', (ctx) => {
	console.log(`\n[${new Date()}] bot start!\n`)
	cron.start()
	botStatus = true
	ctx.reply(`bot start!`)
	log(`bot start!`)
})
bot.command('stop', (ctx) => {
	cron.stop()
	botStatus = false
	ctx.reply(`bot stop!`)
	log(`bot stop!`)
})
bot.command('status', (ctx) => {
	ctx.reply(`bot status : ${botStatus}`)
	log(`bot status : ${botStatus}`)
})

// async function
async function getFetchData(url) {
	let data = ''	
	let response = await fetch(url)
	
	if (response.headers.has('Content-Type') && response.headers.get('Content-Type').includes('json')) {
		data = await response.json()
	}
	return data
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

function log(str){
	let today = new Date();
	let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	let dateTime = date+' '+time;
	
	console.log(`[${dateTime}] - ${str}`)
	
}

function getIpWithUrl(fullUrl){
	let host = require('url').parse(fullUrl).hostname
	dns.lookup(host, (err, address, family) => {
		if(err){
			log(`dns lookup error - ${fullUrl}\n${err}`)
		}else{
			log(`dns get ip - ${host} => ${address}`)
		}
	})
}