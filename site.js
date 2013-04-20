var osmStream = require('./');

var p = document.getElementById('output');

osmStream.runFn(function(err, data) {
    if (err) p.innerHTML += '\nError';
    p.innerHTML += '\nData: ' + data.length;
});

