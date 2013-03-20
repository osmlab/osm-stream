var reqwest = require('reqwest'),
    qs = require('qs'),
    through = require('through');

var osmStream = (function osmMinutely() {
    var s = {};

    // presets
    var baseUrl = 'http://overpass-api.de/',
        minuteStatePath = 'augmented_diffs/state.txt',
        changePath = 'api/augmented_diff?id=229543&info=no&bbox=-253,-62,253,62';

    function minuteStateUrl() {
        return baseUrl + minuteStatePath;
    }

    function changeUrl(id) {
        return baseUrl + changePath + qs.stringify({
            id: id, info: 'no', bbox: '-180,-90,180,90'
        });
    }

    function requestState(cb) {
        reqwest({
            url: minuteStateUrl(),
            crossOrigin: true,
            type: 'text',
            success: function(res) {
                cb(null, res.response);
            }
        });
    }

    function requestChangeset(state, cb) {
        reqwest({
            url: changeUrl(state),
            crossOrigin: true,
            type: 'xml',
            success: function(res) {
                cb(null, res);
            }
        });
    }

    function parseNode(x) {
        if (!x) return undefined;
        var o = {
            type: x.tagName,
            lat: +x.getAttribute('lat'),
            lon: +x.getAttribute('lon'),
            user: x.getAttribute('user'),
            timestamp: x.getAttribute('timestamp')
        };
        if (o.type == 'way') {
            var bounds = get(x, ['bounds']);
            o.bounds = [
                +bounds.getAttribute('maxlat'),
                +bounds.getAttribute('maxlon'),
                +bounds.getAttribute('minlat'),
                +bounds.getAttribute('minlon')];
        }
        return o;
    }

    function get(x, y) {
        if (!x) return undefined;
        for (var i = 0; i < y.length; i++) {
            var o = x.getElementsByTagName(y[i])[0];
            if (o) return o;
        }
    }

    function run(id, cb) {
        requestChangeset(id, function(err, xml) {
            var actions = xml.getElementsByTagName('action'), a;
            var items = [];
            for (var i = 0; i < actions.length; i++) {
                var o = {};
                a = actions[i];
                o.type = a.getAttribute('type');
                if (o.type == 'modify') {
                    o.old = parseNode(get(get(a, 'old'), ['node', 'way']));
                    o.neu = parseNode(get(get(a, 'new'), ['node', 'way']));
                } else {
                    o.neu = parseNode(get(a, ['node', 'way']));
                }
                if (o.old || o.neu) {
                    items.push(o);
                }
            }
            cb(items);
        });
    }

    s.once = function(cb) {
        requestState(function(err, resp) {
            var stream = through(function write(data) {
                cb(null, data);
            });
            run(resp, stream);
        });
    };

    s.run = function(cb, duration) {
        requestState(function(err, resp) {
            var state = resp;
            var stream = through(
                function write(data) {
                    this.queue(data);
                },
                function end() {
                    window.clearInterval(interval);
                    this.queue(null);
                });
            cb(null, stream);
            run(state++, function(items) {
                for (var i = 0; i < items.length; i++) {
                    stream.write(items[i]);
                }
            });
            var interval = setInterval(function() {
                run(state++, stream);
            }, duration || 60 * 1000);
        });
    };

    s.runFn = function(cb, duration) {
        requestState(function(err, resp) {
            function write(items) {
                cb(null, items);
            }
            var state = resp;
            run(state++, write);
            var interval = setInterval(function() {
                run(state++, write);
            }, duration || 60 * 1000);
        });
    };

    return s;
})();

module.exports = osmStream;
