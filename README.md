OSM Minutely Stream

```js
osmMinutely()
    .stream()
    .on('data', function(d) {
        console.log(d);
    });
```
