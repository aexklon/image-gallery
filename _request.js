module.exports = {
	promise: function(protocol, host, path) {
	  return new Promise((resolve, reject) => {
			const lib = protocol.startsWith('https') ? require('https') : require('http')
			const request = lib.get({
				host:host,
				path:path,
				headers: {'User-Agent': 'Mozilla/5.0'}
			}, (response) => {
				if (response.statusCode < 200 || response.statusCode > 299) {
					 reject(new Error('Failed to load page, status code: ' + response.statusCode))
				 }
				let body = []
				response.on('data', (chunk) => body.push(chunk))
				response.on('end', () => resolve(body.join('')))
			})
			request.on('error', (err) => reject(err))
		})
	},
	promiseUnrejectable: function(protocol, host, path) {
	  return new Promise((resolve, reject) => {
			let errObj = (err) => {return '{"error":'+err+'}'}
			const lib = protocol.startsWith('https') ? require('https') : require('http')
			const request = lib.get({
				host:host,
				path:path,
				headers: {'User-Agent': 'Mozilla/5.0'}
			}, (response) => {
				if (response.statusCode < 200 || response.statusCode > 299) {
					 resolve(errObj(response.statusCode))
				 }
				let body = []
				response.on('data', (chunk) => body.push(chunk))
				response.on('end', () => resolve(body.join('')))
			})
			request.on('error', (err) => resolve(errObj(err)))
		})
	},
	sync: function(protocol, host, path, callback) {
		const lib = protocol.startsWith('https') ? require('https') : require('http')
		lib.get({
			host:host,
			path:path,
			headers: {'User-Agent': 'Mozilla/5.0'}
		}, (response) => {
			if (response.statusCode < 200 || response.statusCode > 299) {
				 console.error('Failed to load page, status code: ' + response.statusCode)
			 }
			let body = []
			response.on('data', (chunk) => body.push(chunk))
			response.on('end', () => {
				try {
            var data = body.join('')
        } catch (err) {
            console.error(err)
        }
				callback(data)
			})
		}).on('error', (err) => console.error(err))
	}
}
