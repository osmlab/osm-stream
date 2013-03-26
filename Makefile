all: bundle.js osmstream.js

bundle.js: index.js package.json site.js
	browserify site.js > bundle.js

osmstream.js: index.js
	browserify index.js -s osmStream > osmstream.js
