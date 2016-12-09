// declaring the state so it can be used later
let state = {}

// function that will be called to change the state
function setState(changes, key) {
  Object.assign(state, changes)
	ReactDOM.render(
		<Minister
			crumbs={changes[key].crumbs}
			dirs={changes[key].dirs}
			files={changes[key].files}
		/>, document.getElementById('minister')
	)
	console.log('state', state)
}

// translate URLs between client and server side
function translate(url) {
	return url.replace('http://127.0.0.1:8000', 'http://127.0.0.1:8080/outputer')
}

// set the API URI based on the browser adress, and translate it to API call
let fetchPath = ('http://127.0.0.1:8000'+window.location.pathname).replace('/outputer', '')

// promisse a request to the API
fetch(fetchPath)
	// parse the body of the response
	.then(res=>res.json())
	// Change the state, with the key being the the current page
	// and the value the parsed json
	.then(value=>{
		let changes = {}
		let key = value.crumbs[value.crumbs.length-1].name
		changes[key] = value
		console.log('changes', key, changes)
		setState(changes, key)
	})

// Master component
const Minister = React.createClass({
  render: function() {
		let {crumbs, dirs, files} = this.props
    return (
			<div>
				<Navbar crumbs={crumbs}/>
				<article className="container">
					{console.log('props', this.props)}
					{dirs[0] 		?	<Directories	dirs={dirs}/>			:	null}
					{files[0]		?	<Files 				files={files}/>		:	null}
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
			<ol className="breadcrumb mt-1 mb-0">
				{crumbs.map((crumb, i)=><li key={i} className="breadcrumb-item"><a href={translate(crumb.URL)}>{crumb.name}</a></li>)}
			</ol>
    )
  }
})

// Displays the sub directories fot the current page
const Directories = React.createClass({
  render: function() {
		let {dirs} = this.props
    return (
			<header className="ot-directories list-group mt-1">
				{dirs.map((dir, i)=><a href={translate(dir.URL)} className="list-group-item list-group-item-action" key={i}>{dir.name}</a>)}
			</header>
    )
  }
})

// Displays the files in the current page, in Cards
const Files = React.createClass({
  render: function() {
		let {files} = this.props
    return (
			<main className="files mt-1">
				{files.map((file, i)=><Card file={file} key={i}/>)}
			</main>
    )
  }
})

// Displays a file as a linked images
const Card = React.createClass({
  render: function() {
		let {file} = this.props
    return (
			<div className="card">
				<div className="card-block hidden-xs-up">
			    <h4 className="card-title">{file.sequence}</h4>
			  </div>
				<div className="ot-imageWrapper">
					<a target="_blank" href={file.URL}>
						<img className="card-img-top img-fluid" src={file.URL} />
					</a>
					<button className="ot-btn-clipboard btn" type="button" name="Copy to clipboard" data-clipboard-text={file.URL}>
						<i className="fa fa-link"></i>
					</button>
				</div>
				<ul className="list-group list-group-flush hidden-xs-up">
					{file.keywords ?
						file.keywords.map((keyword, i)=><li className="list-group-item" key={i}>{keyword}</li>)
					: null}
			  </ul>
			</div>
    )
  }
})

// Displays the Navbar
// Its functionality will be developed in next commits. Right now just the breadcrumbs are dynamic
const Navbar = React.createClass({
  render: function() {
		let {crumbs} = this.props
    return (
			<nav>
				<div className="navbar">
					<div className="container">
						<button className="navbar-toggler hidden-md-up" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation"></button>
						<div className="collapse navbar-toggleable-sm" id="navbarResponsive">

							<div className="btn-group ot-images" role="group" aria-label="Resize images">
								<button type="button" className="btn btn-secondary"><i className="fa fa-compress" aria-hidden="true"></i></button>
								<button type="button" className="btn btn-secondary"><i className="fa fa-expand" aria-hidden="true"></i></button>
							</div>

							<div className="btn-group ot-container" role="group" aria-label="Resize container">
								<button type="button" className="btn btn-secondary"><i className="fa fa-mobile" aria-hidden="true"></i></button>
								<button type="button" className="btn btn-secondary"><i className="fa fa-desktop" aria-hidden="true"></i></button>
							</div>

							<div className="btn-group ot-code" role="group" aria-label="Resize container">
								<button type="button" className="btn btn-secondary"><i className="fa fa-code" aria-hidden="true"></i></button>
							</div>

							<form className="form-inline float-md-right">
								<input className="ot-input form-control" type="text" placeholder="Search" />
								<input className="ot-input form-control" type="text" placeholder="Exclude" />
							</form>
						</div>
					</div>
				</div>
				<div className="container">
					{crumbs[0] 	?	<Breadcrumbs	crumbs={crumbs}/>	:	null}
				</div>
			</nav>
		)
	}
})
