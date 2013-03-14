var osmStream = require('./');

osmStream.run(function(err, stream) {
    stream.on('data', function(d) {
        console.log(d);
    });
});

osmStream.once(function(err, d) {
});
