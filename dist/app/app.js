"use strict";

// Renders a transparent loading message,
// which becomes opaque whithin some milliseconds.
// This message is supposed to be overwritten by
// the next render at its ID.
ReactDOM.render(React.createElement(
	"div",
	{ id: "app-loading", className: "animated bounce infinite" },
	React.createElement(
		"span",
		null,
		"loading"
	)
), document.getElementById('app'));

// Declare the application state, which will be filled with data get from
// a path (based in the current browser address) that will be fetched.
// The fetch api returns a promise, whose response needs to be parsed into json.
// Then this json will be saved into the state as a key/value pair,
// and its key will be saved as the cwd (curret working directory).
// So, next requests can be looked up in the state before issuing a new requests
// TO-DO: make the state persistent during sessions, so the request cache system can be acessed after the windows.location changes
var state = {};
var fetchPath = ('http://127.0.0.1:8000' + window.location.pathname).replace('/outputer', '');
fetch(fetchPath).then(function (res) {
	return res.json();
}).then(function (value) {
	var changes = {};
	var key = window.location.pathname;
	changes[key] = value;
	changes.cwd = key;
	setState(changes);
}).then(function () {
	var changes = {};
	changes.filesFiltered = state[state.cwd].files;
	changes.containerSize = localStorage.getItem('containerSize');
	changes.cardSize = localStorage.getItem('cardSize');
	changes.cardInfo = false;
	setState(changes);
}).then(function () {
	$(document).ready(function () {
		new Clipboard('.ot-card__figure-btnClipboard'); // start clipboard
		$('#ot-files').lightGallery({ "selector": ".ot-card__figure-link" }); // start light gallery
		$('.collapse').collapse(); // start bootstrap collapse
	});
});

// Master Outputer component, which will be rendered on assigned state changes
// Its main logic can be found on the Navbar component
var Outputer = React.createClass({
	displayName: "Outputer",

	render: function render() {
		var _props = this.props,
		    crumbs = _props.crumbs,
		    dirs = _props.dirs,
		    files = _props.files,
		    filesFiltered = _props.filesFiltered,
		    containerSize = _props.containerSize,
		    cardSize = _props.cardSize,
		    cardInfo = _props.cardInfo;

		return React.createElement(
			"div",
			{ id: "app-outputer", className: "animated fadeIn" },
			React.createElement(
				"nav",
				null,
				React.createElement(Navbar, { containerSize: containerSize, cardSize: cardSize, cardInfo: cardInfo }),
				React.createElement(
					"div",
					{ className: 'container ' + containerSize },
					crumbs && crumbs[0] ? React.createElement(Breadcrumbs, { crumbs: crumbs }) : null
				)
			),
			React.createElement(
				"article",
				{ className: 'container ' + containerSize },
				dirs && dirs[0] ? React.createElement(Directories, { dirs: dirs }) : null,
				files && files[0] ? React.createElement(Files, { files: files, cardSize: cardSize, cardInfo: cardInfo }) : null
			)
		);
	}
});

// Displays Breadcrumbs for the current page
var Breadcrumbs = React.createClass({
	displayName: "Breadcrumbs",

	render: function render() {
		var crumbs = this.props.crumbs;

		return React.createElement(
			"ol",
			{ id: "ot-breadcrumb", className: "ot-breadcrumb breadcrumb mt-1 mb-0" },
			crumbs.map(function (crumb, i) {
				return React.createElement(
					"li",
					{ key: i, className: "ot-breadcrumb__item breadcrumb-item" },
					React.createElement(
						"a",
						{ className: "ot-breadcrumb__item-anchor", href: translate(crumb.URL) },
						crumb.name
					)
				);
			})
		);
	}
});

// Displays the sub directories fot the current page
var Directories = React.createClass({
	displayName: "Directories",

	render: function render() {
		var dirs = this.props.dirs;

		return React.createElement(
			"header",
			{ id: "ot-dirs", className: "ot-dirs list-group mt-1" },
			dirs.map(function (dir, i) {
				return React.createElement(
					"a",
					{ href: translate(dir.URL), className: "ot-dirs__anchor list-group-item list-group-item-action", key: i },
					dir.name
				);
			})
		);
	}
});

// Displays the files in the current page, in Cards
var Files = React.createClass({
	displayName: "Files",

	render: function render() {
		var _props2 = this.props,
		    files = _props2.files,
		    cardSize = _props2.cardSize,
		    cardInfo = _props2.cardInfo;

		return React.createElement(
			"main",
			{ id: "ot-files", className: "ot-files mt-1" },
			files.map(function (file, i) {
				return React.createElement(Card, { file: file, key: i, cardSize: cardSize, cardInfo: cardInfo });
			})
		);
	}
});

// Displays a file as a linked images
var Card = React.createClass({
	displayName: "Card",

	render: function render() {
		var _props3 = this.props,
		    file = _props3.file,
		    cardSize = _props3.cardSize,
		    cardInfo = _props3.cardInfo;

		return React.createElement(
			"div",
			{ "data-src": file.URL, className: 'ot-card card ' + cardSize },
			cardInfo ? React.createElement(
				"div",
				{ className: "card-block" },
				React.createElement(
					"h4",
					{ className: "card-title" },
					file.sequence
				)
			) : null,
			React.createElement(
				"div",
				{ className: "ot-card__figure" },
				React.createElement(
					"a",
					{ className: "ot-card__figure-link", target: "_blank", href: file.URL },
					React.createElement("img", { className: "ot-card__figure-link-image card-img-top img-fluid", src: file.URL })
				),
				React.createElement(
					"button",
					{ className: "ot-card__figure-btnClipboard btn", type: "button", name: "Copy to clipboard", "data-clipboard-text": file.URL },
					React.createElement("i", { className: "fa fa-link" })
				)
			),
			cardInfo && file.keywords ? React.createElement(
				"ul",
				{ className: "list-group list-group-flush" },
				file.keywords.map(function (keyword, i) {
					return React.createElement(
						"li",
						{ className: "list-group-item", key: i },
						keyword
					);
				})
			) : null
		);
	}
});

// Displays the Navbar
// and host the logic for changing card and container sizes, info and search
var Navbar = React.createClass({
	displayName: "Navbar",

	_changeContainerSize: function _changeContainerSize(containerSize, scale) {
		var sizes = ['container--500', 'container--900', 'container--1140', 'container--full'];
		var currentSize = sizes.indexOf(containerSize);
		var finalSize = containerSize;
		if (scale === "increase" && currentSize < sizes.length - 1) {
			finalSize = sizes[sizes.indexOf(containerSize) + 1];
		} else if (scale === "decrease" && currentSize > 0) {
			finalSize = sizes[sizes.indexOf(containerSize) - 1];
		}
		setState({ "containerSize": finalSize });
		localStorage.setItem('containerSize', finalSize);
	},
	_changeCardSize: function _changeCardSize(cardSize, scale) {
		var sizes = ['card--80', 'card--120', 'card--180', 'card--full'];
		var currentSize = sizes.indexOf(cardSize);
		var finalSize = cardSize;
		if (scale === "increase" && currentSize < sizes.length - 1) {
			finalSize = sizes[sizes.indexOf(cardSize) + 1];
		} else if (scale === "decrease" && currentSize > 0) {
			finalSize = sizes[sizes.indexOf(cardSize) - 1];
		}
		setState({ "cardSize": finalSize });
		localStorage.setItem('cardSize', finalSize);
	},
	_changeCardInfo: function _changeCardInfo(cardInfo) {
		setState({ "cardInfo": !cardInfo });
	},
	_search: function _search(kind, input) {
		switch (kind) {
			case "including":
				setState({ "searchIncluding": input });
				break;
			case "excluding":
				setState({ "searchExcluding": input });
				break;
		}
		// this timeouts purpose is aesthetic. It slows down the react to inputs
		// so there is a delay bewteen the user stoping typing and the state changing
		setTimeout(function () {
			if (state.searchIncluding) {
				if (!state.searchExcluding) {
					setState({ "filesFiltered": lookFor(state.searchIncluding, state[state.cwd].files) });
				} else {
					setState({ "filesFiltered": except(state.searchExcluding, lookFor(state.searchIncluding, state[state.cwd].files)) });
				}
			} else if (!state.searchIncluding) {
				setState({ "filesFiltered": state[state.cwd].files });
			}
		}, 200);
		function lookFor(term, files) {
			var re = new RegExp(term, "i");
			var filesFiltered = files.filter(function (file) {
				return file.keywords.map(function (keyword) {
					return re.test(keyword);
				}).reduce(function (a, b) {
					return a + b;
				});
			});
			return filesFiltered;
		}
		function except(term, files) {
			var re = new RegExp(term, "i");
			var filesFiltered = files.filter(function (file) {
				return !file.keywords.map(function (keyword) {
					return re.test(keyword);
				}).reduce(function (a, b) {
					return a + b;
				});
			});
			return filesFiltered;
		}
	},
	render: function render() {
		var _this = this;

		var _props4 = this.props,
		    containerSize = _props4.containerSize,
		    cardSize = _props4.cardSize,
		    cardInfo = _props4.cardInfo;

		return React.createElement(
			"div",
			{ className: "ot-navbar navbar" },
			React.createElement(
				"div",
				{ className: 'container ' + containerSize },
				React.createElement("button", { className: "navbar-toggler hidden-md-up", type: "button", "data-toggle": "collapse", "data-target": "#navbarResponsive", "aria-controls": "navbarResponsive", "aria-expanded": "false", "aria-label": "Toggle navigation" }),
				React.createElement(
					"div",
					{ className: "collapse navbar-toggleable-sm", id: "navbarResponsive" },
					React.createElement(
						"div",
						{ className: "btn-group ot-images", role: "group", "aria-label": "Resize images" },
						React.createElement(
							"button",
							{ type: "button", className: "btn btn-secondary", onClick: this._changeCardSize.bind(this, cardSize, "decrease") },
							React.createElement("i", { className: "fa fa-compress", "aria-hidden": "true" })
						),
						React.createElement(
							"button",
							{ type: "button", className: "btn btn-secondary", onClick: this._changeCardSize.bind(this, cardSize, "increase") },
							React.createElement("i", { className: "fa fa-expand", "aria-hidden": "true" })
						)
					),
					React.createElement(
						"div",
						{ className: "btn-group ot-container", role: "group", "aria-label": "Resize container" },
						React.createElement(
							"button",
							{ type: "button", className: "btn btn-secondary", onClick: this._changeContainerSize.bind(this, containerSize, "decrease") },
							React.createElement("i", { className: "fa fa-mobile", "aria-hidden": "true" })
						),
						React.createElement(
							"button",
							{ type: "button", className: "btn btn-secondary", onClick: this._changeContainerSize.bind(this, containerSize, "increase") },
							React.createElement("i", { className: "fa fa-desktop", "aria-hidden": "true" })
						)
					),
					React.createElement(
						"div",
						{ className: "btn-group ot-code", role: "group", "aria-label": "Resize container" },
						React.createElement(
							"button",
							{ type: "button", className: "btn btn-secondary", onClick: this._changeCardInfo.bind(this, cardInfo) },
							React.createElement("i", { className: "fa fa-code", "aria-hidden": "true" })
						)
					),
					React.createElement(
						"form",
						{ className: "form-inline float-md-right" },
						React.createElement("input", { className: "ot-input form-control", type: "text", placeholder: "Search", onChange: function onChange(e) {
								return _this._search("including", e.target.value);
							} }),
						React.createElement("input", { className: "ot-input form-control", type: "text", placeholder: "Exclude", onChange: function onChange(e) {
								return _this._search("excluding", e.target.value);
							}, disabled: !state.searchIncluding })
					)
				)
			)
		);
	}
});

// utility to translate URLs between back and front ends
function translate(url) {
	return url.replace('http://127.0.0.1:8000', 'http://127.0.0.1:8080/outputer');
}

// Utility that assign changes to the application state
// and renders its main component
function setState(changes) {
	Object.assign(state, changes);
	ReactDOM.render(React.createElement(Outputer, {
		crumbs: state[state.cwd].crumbs,
		dirs: state[state.cwd].dirs,
		files: state.filesFiltered,
		containerSize: state.containerSize,
		cardSize: state.cardSize,
		cardInfo: state.cardInfo
	}), document.getElementById('app'));
}