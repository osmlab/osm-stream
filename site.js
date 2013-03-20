var osmStream = require('./');

osmStream.run(function(err, stream) {
    stream.on('data', function(d) {
        console.log(d);
    });
});

osmStream.runFn(function(err, data) {
    console.log(data);
});

osmStream.once(function(err, d) {
});
