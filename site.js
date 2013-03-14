var osmMinutely = require('./');

osmMinutely()
    .stream()
    .on('data', function(d) {
        console.log(d);
    });
