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
