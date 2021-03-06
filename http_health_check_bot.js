require('dotenv').config()
const Telegraf = require('telegraf')
const cronJob = require('cron').CronJob
const fetch = require ('node-fetch')


const bot = new Telegraf(process.env.BOT_TOKEN,{username: 'http_healthcheck_bot'})

const dns = require('dns')


let botStatus = false

let appStatus = true
let app2Status = true
let siteStatus = true

let appWarningCount = 0
let app2WarningCount = 0
let siteWarningCount = 0


//https://cosmos.codes/server_status
//https://lunagram.network/server_status

const appJsonHelathCheck = (url)=>{
	
	let startTime = Date.now()
	let delay = 0
	
	timeout(5000,getFetchData(url)).then((json) => {
		
		let endTime = Date.now()
		delay = endTime - startTime
		
 		if(json.active === true){
 			log(`${url} server is active! (${delay}ms)`)
 			appStatus = true
 			appWarningCount = 0
 			
 			//without time out
			if(appStatus == false){
				sendTelegramMsg(`${url} server is active! (${delay}ms)`)
			}
 		}
	}).catch(function(err){
		
		log(`${url} catch error - ${err}`)
		
		//timeout
		if(appWarningCount == 6){
			appStatus = false
			appWarningCount = 0
			sendTelegramMsg(`${url} server is inactive!`)
		}
			
		appWarningCount = appWarningCount + 1
		
	})
}
const app2JsonHelathCheck = (url)=>{
	
	let startTime = Date.now()
	let delay = 0
	
	timeout(5000,getFetchData(url)).then((json) => {
		
		let endTime = Date.now()
		delay = endTime - startTime
		
 		if(json.active === true){
 			log(`${url} server is active! (${delay}ms)`)
 			app2Status = true
 			app2WarningCount = 0
 			
 			//without time out
			if(app2Status == false){
				sendTelegramMsg(`${url} server is active! (${delay}ms)`)
			}
 		}
	}).catch(function(err){
		
		log(`${url} catch error - ${err}`)
		
		//timeout
		if(app2WarningCount == 6){
			app2Status = false
			app2WarningCount = 0
			sendTelegramMsg(`${url} server is inactive!`)
		}
			
		app2WarningCount = app2WarningCount + 1
		
	})
}
const siteJsonHelathCheck = (url)=>{
	
	let startTime = Date.now()
	let delay = 0
	
	timeout(5000,getFetchData(url)).then((json) => {
		
		let endTime = Date.now()
		delay = endTime - startTime
		
 		if(json.active === true){
 			log(`${url} server is active! (${delay}ms)`)
 			siteStatus = true
 			siteWarningCount = 0
 			
 			//without time out
			if(siteStatus == false){
				sendTelegramMsg(`${url} server is active! (${delay}ms)`)
			}
 		}
	}).catch(function(err){
		
		log(`${url} catch error - ${err}`)
		
		//timeout
		if(siteWarningCount == 6){
			siteStatus = false
			siteWarningCount = 0
			sendTelegramMsg(`${url} server is inactive!`)
		}
			
		siteWarningCount = siteWarningCount + 1
		
	})
}

//every 10 sec iterate
const cron = new cronJob('*/5 * * * * *', function() {
	appJsonHelathCheck(process.env.APP_URL)
//	app2JsonHelathCheck(process.env.APP2_URL)
	siteJsonHelathCheck(process.env.SITE_URL)
})


//bot command setting
bot.startPolling()

//status
bot.command('app_status', (ctx) => {
	ctx.reply(`serverUrl : ${process.env.APP_URL}\nappWarningCount : ${appWarningCount}`)
})
//bot.command('app2_status', (ctx) => {
//	ctx.reply(`serverUrl : ${process.env.APP2_URL}\napp2WarningCount : ${app2WarningCount}`)
//})
bot.command('site_status', (ctx) => {
	ctx.reply(`serverUrl : ${process.env.SITE_URL}\nsiteWarningCount : ${siteWarningCount}`)
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
function sendTelegramMsg(str){
	bot.telegram.sendMessage(process.env.BOT_CHAT_ID,str)
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