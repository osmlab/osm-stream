## OSM Stream

Uses the [Overpass API](http://overpass-api.de/) for
[Augmented Diffs](http://wiki.openstreetmap.org/wiki/Overpass_API/Augmented_Diffs),
loads data with CORS and exposes a stream.

## using

Without browserify: copy `osmstream.js`. That works as an `osmStream` global
and with UMD.

With browserify `npm install osm-stream`

## api

`s.once(function(err, data) { }, [bbox])`

Get one batch of changes right now.

`s.run(function(err, stream), duration, [dir], [bbox])`

duration is how long between runs: default 1 minute

dir is direction: either `1`, the default, or `-1` for rewind.

`s.runFn(function(err, stream), duration, [dir], [bbox])`

Same as `.run` but instead of returning a stream that pipes objects, calls
the callback once per object.

duration is how long between runs: default 1 minute

dir is direction: either `1`, the default, or `-1` for rewind.

## example

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

### As Seen

* [Show Me The Way](http://osmlab.github.io/show-me-the-way/) [source](https://github.com/osmlab/show-me-the-way)
* [OSM Live Map](http://osmlab.github.io/osm-live-map/) [source](https://github.com/osmlab/osm-live-map)
* [OSMBuzz](http://spatialbit.com/osmbuzz/)
