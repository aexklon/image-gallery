// *****************************************************************************
/*
	This gallery app consists in four main services:

	1) The Gallery server
			Which serves webpages in the dist folder,
			making them public in the galSrvrAdress

	2) The API
			Listen to requests from the gallery server, and outputs JSON.
			When a request is made, it activates the child lister for the directory
			selected and it answers with a JSON object that contains a list of
			files, folders and path elements for a breadcrumb.

			2.1) The Child Lister
						Reads a directory relative to the imgSrvrRoot,
						path which is defined in the request

	3) The Image Server
			Statically serves the images and files inside the imgSrvrRoot,
			so that they can be requested by the gallery server

			3.1) The IP Tracker
						Tracks each file/image request ips and logs it

	4) Message
			It logs predefined messages to the console, for debugging

*/
// *****************************************************************************
// *****************************************************************************
const chalk = require('chalk')
const express = require('express')
const helmet = require('helmet')
// *****************************************************************************
const fs = require('fs')
const path = require("path")
const request = require('./_request.js')
// *****************************************************************************
const api = express()
const apiHome = '127.0.0.1'
const apiPort = 8000
const apiAddress = apiPort===80 ? 'http://'+apiHome : 'http://'+apiHome+':'+apiPort
// *****************************************************************************
const galSrvr = express()
const galSrvrRoot = './dist'
const galSrvrHome = '127.0.0.1'
const galSrvrPort = process.env.PORT || 8080
const galSrvrAddress = galSrvrPort===80 ? 'http://'+galSrvrHome : 'http://'+galSrvrHome+':'+galSrvrPort
// *****************************************************************************
const imgSrvr = express()
const imgSrvrRoot = '../!gal'
const imgSrvrHome = '127.0.0.1'//'187.38.46.160'
const imgSrvrPort = 8081
const imgSrvrAddress = imgSrvrPort===80 ? 'http://'+imgSrvrHome : 'http://'+imgSrvrHome+":"+imgSrvrPort

// *****************************************************************************
// BOOT
console.log(chalk.cyan('\nMinister is booting'))
let apiBuffer = {}
let messageObj = {}
apiStart()
galServerStart()
imgSrvrStart()

// *****************************************************************************
// API SERVER
function apiStart() {
	api.use(helmet())
	api.use('/', (req, res) => {
		if (req.path in apiBuffer) {
			res.send(apiBuffer[req.path])
		} else {
			listChildsOf(imgSrvrRoot, req.path.replace('/api', ''))
				.then(
					list => {
						res.header("Access-Control-Allow-Origin", "http://127.0.0.1:8080")
						res.send(list)
						apiBuffer[req.path] = list
					}, err =>	console.error(chalk.red(err))
				)
		}
	})
	api.use((err, req, res, next) => {
	  console.error(chalk.red(err))
	})
	api.listen(apiPort, message('api', 'online'))
}

// *****************************************************************************
// GALLERY SERVER
function galServerStart() {
	galSrvr.set('views', galSrvrRoot)
	galSrvr.engine('html', require('ejs').renderFile)
	galSrvr.set("view options", {layout: false})
	galSrvr.use(helmet())
	galSrvr.use(require('connect-livereload')())
	galSrvr.use('/outputer', (req, res) => {
		res.render('index.html')
	})
	galSrvr.use('/app', express.static(galSrvrRoot+'/app'))
	galSrvr.use('/fonts', express.static(galSrvrRoot+'/fonts'))
	galSrvr.use('/vendor', express.static(galSrvrRoot+'/vendor'))
	galSrvr.listen(galSrvrPort, message('galSrvr', 'online'))
}

// *****************************************************************************
// IMAGE SERVER
function imgSrvrStart() {
	imgSrvr.use(helmet())
	imgSrvr.use((req, res, next) => {
		trackIp(req)
		next()
	}, express.static(imgSrvrRoot))
	imgSrvr.listen(imgSrvrPort, message('imgSrvr', 'online'))
}

// *****************************************************************************
// CHILD LISTER
function listChildsOf(root, cwdPartial) {
	if (cwdPartial!==undefined && cwdPartial!==null) {
		cwdPartial = (cwdPartial+'/').replace('//', '/')
	}
	let cwd = root+cwdPartial
	return new Promise(
		(resolve, reject) => {
			fs.readdir(cwd, (err, list) => {
				if (err) {
					reject(err)
				} else {
					let crumbs = function(){
						let serverHome = {
							"name": "home",
							"URL": apiAddress
						}
						if (cwdPartial==='/') {
							return [serverHome]
						} else {
							let cwdPartialArr = cwdPartial
													.replace(/(^\/+|\/+$)/g, '')
													.split('/')
							let breadcrumbs = cwdPartialArr.map((crumb, i) => {
								return {
									"name": crumb,
									"URL": apiAddress+'/'+(
														cwdPartialArr
															.map((crumblet, j) => j <= i ? crumblet : null)
															.filter(crumblet => crumblet === null ? false : true)
															.join('/')
													)+'/'
								}
							})
							breadcrumbs.unshift(serverHome)
							return breadcrumbs
						}
					}
					let dirs = list
											.filter(item => fs.statSync(path.join(cwd, item)).isDirectory())
											.map(item => parseChildrenOf(item, 'directory'))
					let files = list
											.filter(item => fs.statSync(path.join(cwd, item)).isFile())
											.map(item => parseChildrenOf(item, 'file'))
					let result = {
						'crumbs': crumbs(),
						'dirs': dirs,
						'files': files,
					}
					resolve(result)
				}
			})
		}// resolve, reject
	)// promise
	function parseChildrenOf(item, itemType) {
		let output = {}
		switch (itemType) {
			case 'directory': {
				output = {
					"name":			item,
					"URL":			apiAddress+encodeURI(cwdPartial+item)
				}
				break
			}
			case 'file': {
				const re = /\d{4}-\d/g
				if (re.test(item)) {
					output = {
						"sequence":	item.substring(0,4),
						"rating":		item.substring(5,6),
						"keywords":	item.substring(0, item.length -4).substring(7).split(', '),
						"URL":			imgSrvrAddress+encodeURI(cwdPartial+item)
					}
				} else {
					output = {
						"URL":			imgSrvrAddress+encodeURI(cwdPartial+item)
					}
				}
				break
			}
		}
		return output
	}// parseChildrenOf
}// listChildsOf

// *****************************************************************************
// IP TRACKER
function trackIp(req) {
	let client_ip = req.ip.substring(7, req.ip.length)
	if (client_ip==='127.0.0.1') {
		//console.log(chalk.yellow(req.url))
	} else {
		let startingPath = '/json/'
		request.promise('http', 'ip-api.com', startingPath+client_ip)
			.then(data=>{
				data = JSON.parse(data)
				let reqFileSequence = req.url.match(/\/(\d{4})-/);
				let date = new Date();
				let time = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
				console.log(
					'\n'
					+reqFileSequence[1]+' by '+client_ip+' at '+time+'\n'
					+'@'+data.city+' ('+data.region+'/'+data.country+')'
				)
			})
			.catch(err=>console.error(chalk.red(err)))
	}
}

// *****************************************************************************
// MESSAGE
function message(key, value) {
	messageObj[key] = value
	if (value==='online') {
		switch (key) {
			case 'api':
				console.log(chalk.inverse(apiAddress), chalk.green(value), chalk.grey(key))
				break
			case 'galSrvr':
				console.log(chalk.inverse(galSrvrAddress), chalk.green(value), chalk.grey(key))
				break
			case 'imgSrvr':
				console.log(chalk.inverse(imgSrvrAddress), chalk.green(value), chalk.grey(key))
				break
		}
	}
	if (messageObj.api==='online' && messageObj.galSrvr==='online' && messageObj.imgSrvr==='online') {
		console.log(chalk.cyan('Minister is online\n'))
	}
}
