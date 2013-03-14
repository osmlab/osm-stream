## OSM Stream

Uses the [Overpass API](http://overpass-api.de/) for
[Augmented Diffs](http://wiki.openstreetmap.org/wiki/Overpass_API/Augmented_Diffs),
loads data with CORS and exposes a stream.

```js
// re-request every 60s
osmStream()
    .run(function(err, stream) {
        stream.on('data', function(d) {
            console.log(d);
        });
    });

// one-time request
osmStream()
    .once(function(err, d) {
        console.log(d);
    });
```

The stream returned uses [through](https://github.com/dominictarr/through).

### See Also

* [osm-stream-process](https://github.com/iandees/osm-stream-process) in Python
