var osmStream = require('osm-stream');

osmStream()
    .stream()
    .on('data', function(d) {
        console.log(d);
    });
