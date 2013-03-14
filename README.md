## OSM Stream

Uses the [Overpass API](http://overpass-api.de/) for
[Augmented Diffs](http://wiki.openstreetmap.org/wiki/Overpass_API/Augmented_Diffs),
loads data with CORS and exposes a stream.

```js
osmStream()
    .stream()
    .on('data', function(d) {
        console.log(d);
    });
```
