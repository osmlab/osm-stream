## OSM Stream

Uses the [Overpass API](http://overpass-api.de/) for
[Augmented Diffs](http://wiki.openstreetmap.org/wiki/Overpass_API/Augmented_Diffs),
loads data with CORS and exposes a stream.

```js
var osmStream = require('osmStream');

// re-request every 60s
osmStream
    .run(function(err, stream) {
        stream.on('data', function(d) {
            console.log(d);
        });
    });

// re-request every 60s
// callback-style interface
osmStream
    .runFn(function(err, data) {
        // ...
    });

// one-time request
osmStream
    .once(function(err, d) {
        console.log(d);
    });
```

The stream returned uses [through](https://github.com/dominictarr/through), so
you can end it and that will also stop the run cycle.

### See Also

* [osm-stream-process](https://github.com/iandees/osm-stream-process) in Python
