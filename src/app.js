// Renders a transparent loading message,
// which becomes opaque whithin some milliseconds.
// This message is supposed to be overwritten by
// the next render at its ID.
ReactDOM.render(
	<div id="app-loading" className="animated bounce infinite">
		<span>loading</span>
	</div>,
	document.getElementById('app')
)

// Declare the application state, which will be filled with data get from
// a path (based in the current browser address) that will be fetched.
// The fetch api returns a promise, whose response needs to be parsed into json.
// Then this json will be saved into the state as a key/value pair,
// and its key will be saved as the cwd (curret working directory).
// So, next requests can be looked up in the state before issuing a new requests
// TO-DO: make the state persistent during sessions, so the request cache system can be acessed after the windows.location changes
let state = {}
let fetchPath = ('http://127.0.0.1:8000'+window.location.pathname).replace('/outputer', '')
fetch(fetchPath)
	.then(res=>res.json())
	.then(value=>{
		let changes = {}
		let key = window.location.pathname
		changes[key] = value
		changes.cwd = key
		setState(changes)
	})
	.then(()=>{
		let changes = {}
		changes.filesFiltered = state[state.cwd].files
		changes.containerSize =  localStorage.getItem('containerSize')
		changes.cardSize = localStorage.getItem('cardSize')
		changes.cardInfo = false
		setState(changes)
	})
	.then(()=>{
		$(document).ready(()=>{
			new Clipboard('.ot-card__figure-btnClipboard') // start clipboard
			$('#ot-files').lightGallery({"selector":".ot-card__figure-link"}) // start light gallery
			$('.collapse').collapse() // start bootstrap collapse
		})
	})

// Master Outputer component, which will be rendered on assigned state changes
// Its main logic can be found on the Navbar component
const Outputer = React.createClass({
  render: function() {
		let {crumbs, dirs, files, filesFiltered, containerSize, cardSize, cardInfo} = this.props
    return (
			<div id="app-outputer" className="animated fadeIn">
				<nav>
					<Navbar containerSize={containerSize} cardSize={cardSize} cardInfo={cardInfo}/>
					<div className={'container ' + containerSize}>
						{crumbs && crumbs[0] 	?	<Breadcrumbs	crumbs={crumbs}/>	:	null}
					</div>
				</nav>
				<article className={'container ' + containerSize}>
					{dirs && dirs[0] ?	<Directories dirs={dirs}/> : null}
					{files && files[0] ? <Files files={files} cardSize={cardSize} cardInfo={cardInfo}/> : null}
				</article>
			</div>
    )
  }
})

// Displays Breadcrumbs for the current page
const Breadcrumbs = React.createClass({
  render: function() {
		let {crumbs} = this.props
    return (
			<ol id="ot-breadcrumb" className="ot-breadcrumb breadcrumb mt-1 mb-0">
				{crumbs.map((crumb, i)=>
					<li key={i} className="ot-breadcrumb__item breadcrumb-item">
						<a className="ot-breadcrumb__item-anchor" href={translate(crumb.URL)}>{crumb.name}</a>
					</li>
				)}
			</ol>
    )
  }
})

// Displays the sub directories fot the current page
const Directories = React.createClass({
  render: function() {
		let {dirs} = this.props
    return (
			<header id="ot-dirs" className="ot-dirs list-group mt-1">
				{dirs.map((dir, i)=><a href={translate(dir.URL)} className="ot-dirs__anchor list-group-item list-group-item-action" key={i}>{dir.name}</a>)}
			</header>
    )
  }
})

// Displays the files in the current page, in Cards
const Files = React.createClass({
  render: function() {
		let {files, cardSize, cardInfo} = this.props
    return (
			<main id="ot-files" className="ot-files mt-1">
				{files.map((file, i)=><Card file={file} key={i} cardSize={cardSize} cardInfo={cardInfo}/>)}
			</main>
    )
  }
})

// Displays a file as a linked images
const Card = React.createClass({
  render: function() {
		let {file, cardSize, cardInfo} = this.props
    return (
			<div data-src={file.URL} className={'ot-card card ' + cardSize}>
				{cardInfo ?
					<div className="card-block">
						<h4 className="card-title">{file.sequence}</h4>
					</div>
				: null}
				<div className="ot-card__figure">
					<a className="ot-card__figure-link" target="_blank" href={file.URL}>
						<img className="ot-card__figure-link-image card-img-top img-fluid" src={file.URL} />
					</a>
					<button className="ot-card__figure-btnClipboard btn" type="button" name="Copy to clipboard" data-clipboard-text={file.URL}>
						<i className="fa fa-link"></i>
					</button>
				</div>
				{cardInfo && file.keywords ?
				<ul className="list-group list-group-flush">
					{file.keywords.map((keyword, i)=><li className="list-group-item" key={i}>{keyword}</li>)}
			  </ul>
				: null}
			</div>
    )
  }
})

// Displays the Navbar
// and host the logic for changing card and container sizes, info and search
const Navbar = React.createClass({
	_changeContainerSize: function(containerSize, scale) {
		let sizes = ['container--500', 'container--900', 'container--1140', 'container--full']
		let currentSize = sizes.indexOf(containerSize)
		let finalSize = containerSize
		if (scale==="increase" && currentSize < sizes.length-1) {
			finalSize= sizes[sizes.indexOf(containerSize)+1]
		} else if (scale==="decrease"  && currentSize > 0) {
			finalSize= sizes[sizes.indexOf(containerSize)-1]
		}
		setState({"containerSize": finalSize})
		localStorage.setItem('containerSize', finalSize)
	},
	_changeCardSize: function(cardSize, scale) {
		let sizes = ['card--80', 'card--120', 'card--180', 'card--full']
		let currentSize = sizes.indexOf(cardSize)
		let finalSize = cardSize
		if (scale==="increase" && currentSize < sizes.length-1) {
			finalSize = sizes[sizes.indexOf(cardSize)+1]
		} else if (scale==="decrease"  && currentSize > 0) {
			finalSize = sizes[sizes.indexOf(cardSize)-1]
		}
		setState({"cardSize": finalSize})
		localStorage.setItem('cardSize', finalSize)
	},
	_changeCardInfo: function(cardInfo) {
		setState({"cardInfo":!cardInfo})
	},
	_search: function(kind, input){
		switch(kind) {
			case "including":
				setState({"searchIncluding": input})
				break
			case "excluding":
				setState({"searchExcluding": input})
				break
		}
		// this timeouts purpose is aesthetic. It slows down the react to inputs
		// so there is a delay bewteen the user stoping typing and the state changing
		setTimeout(()=>{
			if(state.searchIncluding) {
				if(!state.searchExcluding) {
					setState({"filesFiltered": lookFor(state.searchIncluding, state[state.cwd].files)})
				} else {
					setState({"filesFiltered": except(state.searchExcluding, lookFor(state.searchIncluding, state[state.cwd].files))})
				}
			} else if (!state.searchIncluding) {
				setState({"filesFiltered": state[state.cwd].files})
			}
		}, 200)
		function lookFor(term, files) {
			let re = new RegExp(term, "i")
			let filesFiltered = files
				.filter(file=>file.keywords
					.map(keyword=>re.test(keyword))
					.reduce((a,b)=>a+b)
				)
			return filesFiltered
		}
		function except(term, files) {
			let re = new RegExp(term, "i")
			let filesFiltered = files
				.filter(file=>!file.keywords
						.map(keyword=>re.test(keyword))
						.reduce((a,b)=>a+b)
				)
			return filesFiltered
		}
	},
  render: function() {
		let {containerSize, cardSize, cardInfo} = this.props
    return (
			<div className="ot-navbar navbar">
				<div className={'container ' + containerSize}>
					<button className="navbar-toggler hidden-md-up" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation"></button>
					<div className="collapse navbar-toggleable-sm" id="navbarResponsive">

						<div className="btn-group ot-images" role="group" aria-label="Resize images">
							<button type="button" className="btn btn-secondary" onClick={this._changeCardSize.bind(this, cardSize, "decrease")}>
								<i className="fa fa-compress" aria-hidden="true"></i>
							</button>
							<button type="button" className="btn btn-secondary" onClick={this._changeCardSize.bind(this, cardSize, "increase")}>
								<i className="fa fa-expand" aria-hidden="true"></i>
							</button>
						</div>

						<div className="btn-group ot-container" role="group" aria-label="Resize container">
							<button type="button" className="btn btn-secondary" onClick={this._changeContainerSize.bind(this, containerSize, "decrease")}>
								<i className="fa fa-mobile" aria-hidden="true"></i>
							</button>
							<button type="button" className="btn btn-secondary" onClick={this._changeContainerSize.bind(this, containerSize, "increase")}>
								<i className="fa fa-desktop" aria-hidden="true"></i>
							</button>
						</div>

						<div className="btn-group ot-code" role="group" aria-label="Resize container">
							<button type="button" className="btn btn-secondary" onClick={this._changeCardInfo.bind(this, cardInfo)}>
								<i className="fa fa-code" aria-hidden="true"></i>
							</button>
						</div>

						<form className="form-inline float-md-right">
							<input className="ot-input form-control" type="text" placeholder="Search" onChange={e=>this._search("including", e.target.value)}/>
							<input className="ot-input form-control" type="text" placeholder="Exclude" onChange={e=>this._search("excluding", e.target.value)} disabled={!state.searchIncluding}/>
						</form>
					</div>
				</div>
			</div>
		)
	}
})

// utility to translate URLs between back and front ends
function translate(url) {
	return url.replace(
		'http://127.0.0.1:8000',
		'http://127.0.0.1:8080/outputer'
	)
}

// Utility that assign changes to the application state
// and renders its main component
function setState(changes) {
  Object.assign(state, changes)
	ReactDOM.render(
		<Outputer
			crumbs={state[state.cwd].crumbs}
			dirs={state[state.cwd].dirs}
			files={state.filesFiltered}
			containerSize={state.containerSize}
			cardSize={state.cardSize}
			cardInfo={state.cardInfo}
		/>, document.getElementById('app')
	)
}
