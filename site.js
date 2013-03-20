var osmStream = require('./');

// osmStream.run(function(err, stream) {
//     stream.on('data', function(d) {
//         console.log(d);
//     });
// });

osmStream.runFn(function(err, data) {
    console.log(data);
});
//
// var downto = 5;
// 
// var s = osmStream.runFn(function(err, data) {
//     console.log('backwards!');
//     // console.log(data);
//     if (!(downto--)) {
//         console.log('cancelling');
//         s.cancel();
//     }
// }, 10, -1);

osmStream.once(function(err, d) {
    console.log(d);
});
