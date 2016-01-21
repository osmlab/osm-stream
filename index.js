var reqwest = require('reqwest'),
    qs = require('qs'),
    through = require('through');

var osmStream = (function osmMinutely() {
    var s = {};

    // presets
    var baseUrl = 'https://overpass-api.de/',
        minuteStatePath = 'api/augmented_diff_status',
        changePath = 'api/augmented_diff?';

    function minuteStateUrl() {
        return baseUrl + minuteStatePath;
    }

    function changeUrl(id, bbox) {
        return baseUrl + changePath + qs.stringify({
            id: id, info: 'no', bbox: bbox || '-180,-90,180,90'
        });
    }

    function requestState(cb) {
        reqwest({
            url: minuteStateUrl(),
            crossOrigin: true,
            type: 'text',
            success: function(res) {
                cb(null, parseInt(res.response, 10));
            }
        });
    }

    function requestChangeset(state, cb, bbox) {
        reqwest({
            url: changeUrl(state, bbox),
            crossOrigin: true,
            type: 'xml',
            success: function(res) {
                cb(null, res);
            }
        });
    }

    function parseNodeBase(x) {
        if (!x) return undefined;
        return {
            type: x.tagName,
            id: +x.getAttribute('id'),
            version: +x.getAttribute('version'),
            timestamp: x.getAttribute('timestamp'),
            changeset: +x.getAttribute('changeset'),
            uid: +x.getAttribute('uid'),
            user: x.getAttribute('user'),
            visible: x.getAttribute('visible') !== 'false'
        };
    }

    function parseNode(x) {
        if (!x) return undefined;
        var o = parseNodeBase(x);
        if (o.type === 'node') {
            o.lat = +x.getAttribute('lat');
            o.lon = +x.getAttribute('lon');
        } else if (o.type === 'way') {
            var bounds = get(x, ['bounds']);
            o.bounds = [
                +bounds.getAttribute('maxlat'),
                +bounds.getAttribute('maxlon'),
                +bounds.getAttribute('minlat'),
                +bounds.getAttribute('minlon')];

            var nds = x.getElementsByTagName('nd');
            var nodes = [];
            for (var i = 0; i < nds.length; i++) {
                nodes.push([
                    +nds[i].getAttribute('lat'),
                    +nds[i].getAttribute('lon')
                ]);
            }
            if (nodes.length > 0) {
                o.linestring = nodes;
            }

            var tgs = x.getElementsByTagName('tag');
            var tags = {};
            for (var j = 0; j < tgs.length; j++) {
                tags[tgs[j].getAttribute("k")] = tgs[j].getAttribute("v");
            }
            o.tags = tags;
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

    function run(id, cb, bbox) {
        requestChangeset(id, function(err, xml) {
            if (err) return cb('Error');
            if (!xml.getElementsByTagName) return cb('No items');
            var actions = xml.getElementsByTagName('action'), a;
            var items = [];
            for (var i = 0; i < actions.length; i++) {
                var o = {};
                a = actions[i];
                o.type = a.getAttribute('type');
                if (o.type == 'create') {
                    o.neu = parseNode(get(a, ['node', 'way']));
                } else if (o.type == 'modify') {
                    o.old = parseNode(get(get(a, ['old']), ['node', 'way']));
                    o.neu = parseNode(get(get(a, ['new']), ['node', 'way']));
                } else if (o.type == 'delete') {
                    o.old = parseNode(get(get(a, ['old']), ['node', 'way']));
                    o.neu = parseNodeBase(get(get(a, ['new']), ['node', 'way']));
                }
                if (o.old || o.neu) {
                    items.push(o);
                }
            }
            cb(null, items);
        }, bbox);
    }

    s.once = function(cb, bbox) {
        requestState(function(err, state) {
            var stream = through(function write(err, data) {
                cb(null, data);
            });
            run(state, stream.write, bbox);
        });
    };

    s.run = function(cb, duration, dir, bbox) {
        dir = dir || 1;
        duration = duration || 60 * 1000;
        var cancel = false;
        function setCancel() { cancel = true; }
        requestState(function(err, state) {
            var stream = through(
                function write(data) {
                    this.queue(data);
                },
                function end() {
                    cancel = true;
                    this.queue(null);
                });
            function write(items) {
                for (var i = 0; i < items.length; i++) {
                    stream.write(items[i]);
                }
            }
            cb(null, stream);
            function iterate() {
                run(state, function(err, items) {
                    if (!err) {
                        write(items);
                        state += dir;
                    }
                    if (!cancel) setTimeout(iterate, duration);
                }, bbox);
            }
            iterate();
        });
        return { cancel: setCancel };
    };

    s.runFn = function(cb, duration, dir, bbox) {
        dir = dir || 1;
        duration = duration || 60 * 1000;
        function setCancel() { cancel = true; }
        var cancel = false;
        requestState(function(err, state) {
            function write(items) { cb(null, items); }
            function iterate() {
                run(state, function(err, items) {
                    if (!err) {
                        write(items);
                        state += dir;
                    }
                    if (!cancel) setTimeout(iterate, duration);
                }, bbox);
            }
            iterate();
        });
        return { cancel: setCancel };
    };

    return s;
})();

module.exports = osmStream;
