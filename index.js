var reqwest = require('reqwest'),
    pad = require('pad'),
    zlib = require('zlib'),
    through = require('through');

function osmMinutely() {
    var s = {};

    // presets
    var baseUrl = 'http://planet.openstreetmap.org/',
        changePath = 'replication/changesets/',
        minuteStatePath = 'replication/changesets/state.yaml';

    function minuteStateUrl() { return baseUrl + minuteStatePath; }
    function changeUrl() { return baseUrl + changePath; }

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

    function binreq(u, c) {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", u, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
          var arrayBuffer = oReq.response; // Note: not oReq.responseText
          var byteArray = new Uint8Array(arrayBuffer);
          c(arrayBuffer);
        };

        oReq.send(null);
    }

    function requestChangeset(url, cb) {
        binreq(url, function(res) {
            try {
            console.log(zlib.inflateSync(res));
            } catch(e) {
                throw e;
            }
        });
    }

    function getSequence(body) {
        var match = body.match(/sequence\: (\d+)/);
        if (match) return pad(9, match[1], '0');
    }

    function getSeqUrl(seq) {
        return changeUrl() + seq.slice(0, 3) +
            '/' + seq.slice(3, 6) + '/' + seq.slice(6, 9) + '.osm.gz';
    }

    requestState(function(err, resp) {
        var seq = getSequence(resp);
        var url = getSeqUrl(seq);
        requestChangeset(url, function() {
            console.log(arguments);
        });
    });

    return s;
}

module.exports = osmMinutely;
