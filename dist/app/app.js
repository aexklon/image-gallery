'use strict';

var state = {};
function setState(changes, key) {
	Object.assign(state, changes);
	ReactDOM.render(React.createElement(Minister, {
		crumbs: changes[key].crumbs,
		dirs: changes[key].dirs,
		files: changes[key].files
	}), document.getElementById('minister'));
	console.log('state', state);
}
function translate(url) {
	return url.replace('http://127.0.0.1:8000', 'http://127.0.0.1:8080/outputer');
}
var fetchPath = ('http://127.0.0.1:8000' + window.location.pathname).replace('/outputer', '');
console.log(fetchPath);
fetch(fetchPath).then(function (res) {
	return res.json();
}).then(function (value) {
	var changes = {};
	var key = value.crumbs[value.crumbs.length - 1].name;
	changes[key] = value;
	console.log('changes', key, changes);
	setState(changes, key);
});

var Minister = React.createClass({
	displayName: 'Minister',

	render: function render() {
		var _props = this.props,
		    crumbs = _props.crumbs,
		    dirs = _props.dirs,
		    files = _props.files;

		return React.createElement(
			'div',
			null,
			React.createElement(Navbar, { crumbs: crumbs }),
			React.createElement(
				'article',
				{ className: 'container' },
				console.log('props', this.props),
				dirs[0] ? React.createElement(Directories, { dirs: dirs }) : null,
				files[0] ? React.createElement(Files, { files: files }) : null
			)
		);
	}
});
var Breadcrumbs = React.createClass({
	displayName: 'Breadcrumbs',

	render: function render() {
		var crumbs = this.props.crumbs;

		return React.createElement(
			'ol',
			{ className: 'breadcrumb mt-1 mb-0' },
			crumbs.map(function (crumb, i) {
				return React.createElement(
					'li',
					{ key: i, className: 'breadcrumb-item' },
					React.createElement(
						'a',
						{ href: translate(crumb.URL) },
						crumb.name
					)
				);
			})
		);
	}
});
var Directories = React.createClass({
	displayName: 'Directories',

	render: function render() {
		var dirs = this.props.dirs;

		return React.createElement(
			'header',
			{ className: 'ot-directories list-group mt-1' },
			dirs.map(function (dir, i) {
				return React.createElement(
					'a',
					{ href: translate(dir.URL), className: 'list-group-item list-group-item-action', key: i },
					dir.name
				);
			})
		);
	}
});
var Files = React.createClass({
	displayName: 'Files',

	render: function render() {
		var files = this.props.files;

		return React.createElement(
			'main',
			{ className: 'files mt-1' },
			files.map(function (file, i) {
				return React.createElement(Card, { file: file, key: i });
			})
		);
	}
});

var Card = React.createClass({
	displayName: 'Card',

	render: function render() {
		var file = this.props.file;

		return React.createElement(
			'div',
			{ className: 'card' },
			React.createElement(
				'div',
				{ className: 'card-block hidden-xs-up' },
				React.createElement(
					'h4',
					{ className: 'card-title' },
					file.sequence
				)
			),
			React.createElement(
				'div',
				{ className: 'ot-imageWrapper' },
				React.createElement(
					'a',
					{ target: '_blank', href: file.URL },
					React.createElement('img', { className: 'card-img-top img-fluid', src: file.URL })
				),
				React.createElement(
					'button',
					{ className: 'ot-btn-clipboard btn', type: 'button', name: 'Copy to clipboard', 'data-clipboard-text': file.URL },
					React.createElement('i', { className: 'fa fa-link' })
				)
			),
			React.createElement(
				'ul',
				{ className: 'list-group list-group-flush hidden-xs-up' },
				file.keywords ? file.keywords.map(function (keyword, i) {
					return React.createElement(
						'li',
						{ className: 'list-group-item', key: i },
						keyword
					);
				}) : null
			)
		);
	}
});
var Navbar = React.createClass({
	displayName: 'Navbar',

	render: function render() {
		var crumbs = this.props.crumbs;

		return React.createElement(
			'nav',
			null,
			React.createElement(
				'div',
				{ className: 'navbar' },
				React.createElement(
					'div',
					{ className: 'container' },
					React.createElement('button', { className: 'navbar-toggler hidden-md-up', type: 'button', 'data-toggle': 'collapse', 'data-target': '#navbarResponsive', 'aria-controls': 'navbarResponsive', 'aria-expanded': 'false', 'aria-label': 'Toggle navigation' }),
					React.createElement(
						'div',
						{ className: 'collapse navbar-toggleable-sm', id: 'navbarResponsive' },
						React.createElement(
							'div',
							{ className: 'btn-group ot-images', role: 'group', 'aria-label': 'Resize images' },
							React.createElement(
								'button',
								{ type: 'button', className: 'btn btn-secondary' },
								React.createElement('i', { className: 'fa fa-compress', 'aria-hidden': 'true' })
							),
							React.createElement(
								'button',
								{ type: 'button', className: 'btn btn-secondary' },
								React.createElement('i', { className: 'fa fa-expand', 'aria-hidden': 'true' })
							)
						),
						React.createElement(
							'div',
							{ className: 'btn-group ot-container', role: 'group', 'aria-label': 'Resize container' },
							React.createElement(
								'button',
								{ type: 'button', className: 'btn btn-secondary' },
								React.createElement('i', { className: 'fa fa-mobile', 'aria-hidden': 'true' })
							),
							React.createElement(
								'button',
								{ type: 'button', className: 'btn btn-secondary' },
								React.createElement('i', { className: 'fa fa-desktop', 'aria-hidden': 'true' })
							)
						),
						React.createElement(
							'div',
							{ className: 'btn-group ot-code', role: 'group', 'aria-label': 'Resize container' },
							React.createElement(
								'button',
								{ type: 'button', className: 'btn btn-secondary' },
								React.createElement('i', { className: 'fa fa-code', 'aria-hidden': 'true' })
							)
						),
						React.createElement(
							'form',
							{ className: 'form-inline float-md-right' },
							React.createElement('input', { className: 'ot-input form-control', type: 'text', placeholder: 'Search' }),
							React.createElement('input', { className: 'ot-input form-control', type: 'text', placeholder: 'Exclude' })
						)
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'container' },
				crumbs[0] ? React.createElement(Breadcrumbs, { crumbs: crumbs }) : null
			)
		);
	}
});