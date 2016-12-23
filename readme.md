# Image Gallery
Consists of a react.js bootstrap gallery driven by node.js express servers/API that builds breadcrumbs, lists directories and serves images. Clone it, `npm install` its dependencies, start `node serve` and hit http://127.0.0.1:8080/outputer for the front-end or http://127.0.0.1:8000/ for JSON. By default images are searched within `../!gal` and hosted at http://127.0.0.1:8081

![readme.gif](https://github.com/al-lopes/image-gallery/blob/master/readme.gif?raw=true)

## The Servers
are inside `./serve.js` and consists of four main services:

1. The Gallery server &mdash; Which serves webpages in the dist folder, making them public in the galSrvrAdress (http://127.0.0.1:8080/outputer)

2. The API &mdash; Listen to requests from the gallery server, and outputs JSON at http://127.0.0.1:8000/. When a request is made, it activates the child lister for the directory selected and it answers with a JSON object that contains a list of files, folders and path elements for a breadcrumb

   2.1. The Child Lister &mdash; Reads a directory relative to the imgSrvrRoot, path which is defined in the request and parses its files

	 Optionally files can be named following the pattern `{sequence}-{rating}-{keywords}.extension` (easily be obtained from softwares like Adobe Lightroom), where:
	 - Sequence is a unique key 4 characters long
	 - Rating is a one character tag
	 - Keywords are comma separated values that will be used by the search form for filtering displayed files

	 E.g.: by default, `../!gal/0012-6-cat, water, infinite loop.jpg` will be parsed into:
	 ```
	{
		"sequence":"0012",
		"rating":"6",
		"keywords":["cat","water","infinite loop"],
		"URL":"http://127.0.0.1:8081/0014-5-cat,%20water,%20infinite%20loop.jpg"
	}
	 ```
3. The Image Server &mdash; Statically serves the images and files inside the imgSrvrRoot to http://127.0.0.1:8081, so that they can be requested by the gallery server when a page is loaded

  3.1. The IP Tracker &mdash; Tracks each file/image request ips and logs it
4. Message &mdash; It logs predefined messages to the console, for debugging

## The Client
source is located under `./src` and production files under `./dist`. Dependencies are managed with bower and build system / automation by gulp

# To-do list:
- make the state persistent during sessions, so the request cache system can be acessed after the windows.location changes
- allow filtering by rating
