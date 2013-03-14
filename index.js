var reqwest = require('reqwest'),
    pad = require('pad'),
    qs = require('qs'),
    through = require('through');

function osmMinutely() {
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
            id: id, info: 'no',
            bbox: '-180,-90,180,90'
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

    function getSequence(body) {
        var match = body.match(/sequence\: (\d+)/);
        if (match) return pad(9, match[1], '0');
    }

    var state;

    var stream = through(function(data) {
        this.queue(data);
    },
    function() {
        this.queue(null);
    });

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

    requestState(function(err, resp) {
        state = resp;
        requestChangeset(resp, function(err, xml) {
            var actions = xml.getElementsByTagName('action'), a;
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
                    stream.write(o);
                }
            }
        });
    });

    s.stream = function() {
        return stream;
    };

    return s;
}

module.exports = osmMinutely;
