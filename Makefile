bundle.js: index.js package.json site.js
	browserify site.js > bundle.js
