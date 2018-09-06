// Video object
var CorrectSignatureLength = 81;

var Video = {
    VideoPlayState: false,
    Player_Action: '',
    Player_Action_v2: '',

    checkForValidUrl: function(tabId, changeInfo, tab) {
        return true;
    },
    isYoutube: function(url) {
        if (url && url.indexOf("youtube.") >= 0) {
            return true;
        }
        return false;
    },
    // NamTB: For now, we must be support youtube dash stream, with 480p and 1080p
    // video content
    DecryptContent: function(tabid, list, adaptive, embed) {
        var url, itag, sig, len, bitrate, decryptSig,
        title = vdl.urlPlaying[tabid].title;

        var URL = "url=";
        var SIG = "s=";
        var LEN = "clen=";
        var ITAG = "itag=";
        var BITRATE = "bitrate=";

        if (!vdl.urllist[tabid]) {
            vdl.urllist[tabid] = new Array();
            vdl.audiolist[tabid] = new Array();
            vdl.urlPlaying[tabid].quality = {};
        }

        var p = decodeURIComponent(list).split(",");
        url = itag = sig = len = bitrate = '';
        // Detach to url block
        for (var j = 0; j < p.length; j++) {
            if (p[j].indexOf(URL) == -1)
                continue;

            var q = p[j].split("&");
            url = itag = sig = len = bitrate = '';
            for (var k = 0; k < q.length; k++) {
                if (q[k].indexOf(URL) == 0) {
                    url = decodeURIComponent(q[k]).split(URL)[1];
                }
                if (q[k].indexOf(ITAG) == 0) {
                    itag = parseInt(q[k].split(ITAG)[1]);
                }
                if (q[k].indexOf(SIG) == 0) {
                    sig = q[k].split(SIG)[1];
                }
                if (q[k].indexOf(LEN) == 0) {
                    len = q[k].split(LEN)[1];
                }
                if (q[k].indexOf(BITRATE) == 0) {
                    bitrate = q[k].split(BITRATE)[1];
                }
            }

            // Add extra url param
            if (sig != '' && url != '') {
                // decryptSig = (embed ? Video.decipher(Video.Player_Action, sig) :
                //                    Video.decipher_v2(Video.Player_Action_v2, sig));
                decryptSig = Video.decipher(Video.Player_Action, sig);
                url += "&signature=";
                url += decryptSig;
            }

            if (Video.video.formats[itag]) {
                if (Video.video.formats[itag].resolution == '480p' || Video.video.formats[itag].resolution == '1080p')
                    adaptive = true;
                if (!vdl.urlPlaying[tabid].quality.hasOwnProperty(Video.video.formats[itag].resolution)) {
                    vdl.urlPlaying[tabid].quality[Video.video.formats[itag].resolution] = true;
                    vdl.urllist[tabid].splice(0, 0, {
                        url: url,
                        adaptive: adaptive,
                        mime: Video.video.formats[itag].mime,
                        res: Video.video.formats[itag].resolution,
                        quality: Video.video.formats[itag].quality,
                        len: len,
                        title: title
                    });
                }
            } else if (Video.audio.formats[itag]) {
                vdl.audiolist[tabid].splice(0, 0, {
                    audioURL: url,
                    mime: Video.audio.formats[itag].mime,
                    type: Video.audio.formats[itag].type,
                    kbs: Video.audio.formats[itag].kbs,
                    bitrate: bitrate.length ? parseInt(bitrate) : 0,
                    len: len,
                    title: title
                });
            }
        }
    },
    //Make new async request to fetch download links
    scanHtmlForVideos: function(tabid, js_dictate, callback, org_link) {
        if (js_dictate.length > 0) {
            var xmlHttpReq = new XMLHttpRequest();
            xmlHttpReq.open("GET", js_dictate, true);
            xmlHttpReq.onreadystatechange = function() {
                if (this.readyState == 4) {
                    Video.Player_Action = Video.extractActions(this.responseText);
                    Video.Player_Action_v2 = Video.extractActions_v2(this.responseText);
                    Video.queryAllVideoFormats(tabid, callback, org_link);
                }
            }

            xmlHttpReq.send(null);
        } else {
            Video.queryAllVideoFormats(tabid, callback);
        }
    },

    queryAllVideoFormats: function(tabid, callback, org_link) {
        var url = (org_link != undefined) ? org_link : vdl.urlPlaying[tabid].url;
        if(Video.isYoutube(url)) {
            url = Video.getYoutubeMediaInfoURL(url);
        }
        if (!url || typeof url == "undefined") {
            return false;
        }

        var xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.embeded = org_link != undefined;
        xmlHttpReq.open("GET", url, true);
        xmlHttpReq.onreadystatechange = function() {
            if (this.readyState != 4) {
                return;
            }
            //Get response content
            var innerHTML = this.responseText;
            var list_fmt = innerHTML.match(/url_encoded_fmt_stream_map=([^"]+)/);
            var adapt_fmt = innerHTML.match(/adaptive_fmts=([^"]*)/);
            if (!list_fmt && !adapt_fmt) {
                callback({
                    videoUrls: vdl.urllist[tabid]
                });
                return;
            }
            list_fmt = list_fmt[1];
            adapt_fmt = adapt_fmt != null && Array.isArray(adapt_fmt) ? adapt_fmt[1] : undefined;

            vdl.urllist[tabid] = false;
            vdl.audiolist[tabid] = false;
            Video.DecryptContent(tabid, list_fmt, false, this.embeded);
            if(adapt_fmt != undefined) {
                Video.DecryptContent(tabid, adapt_fmt, true,  this.embeded);
                //Sort adaptive audio content base bitrates
                vdl.audiolist[tabid].sort(function(a,b) { return Video.getBitRates(a) - Video.getBitRates(b) });
            }

            // Combine with adaptive audio content
            for(var i in vdl.urllist[tabid]) {
                if(vdl.urllist[tabid][i].adaptive == true && vdl.audiolist[tabid][0] != null) {
                    vdl.urllist[tabid][i].audioUrl = vdl.audiolist[tabid][0].audioURL;
                    vdl.urllist[tabid][i].audioTitle = vdl.audiolist[tabid][0].title;
                    vdl.urllist[tabid][i].audioMime = vdl.audiolist[tabid][0].mime;
                    vdl.urllist[tabid][i].len = parseInt(vdl.urllist[tabid][i].len) + parseInt(vdl.audiolist[tabid][0].len);
                }
            }
            // Reorder video list
            vdl.urllist[tabid].sort(function(a, b) { return Video.getQualities(a) - Video.getQualities(b) });
            callback({
                videoUrls: vdl.urllist[tabid]
            })
        };
        xmlHttpReq.send(null);
        return true;
    },
    getYoutubeMediaInfoURL: function(org_link) {
        var start_pos = org_link.indexOf("v=");
        var end_pos = org_link.lastIndexOf("&");
        if (end_pos < start_pos) end_pos = org_link.length;
        var video_id = org_link.substr(start_pos + "v=".length, end_pos - start_pos);
        return Video.video.YOUTUBE_INFO_URL + video_id + Video.video.YOUTUBE_EL_PARAMS;
    },
    getBitRates: function(a) {
        return a.bitrate * (-1 !== a.type.indexOf("Vorbis") ? 10 : 1);
    },
    getQualities: function(a) {
        var q = {
            "Small": 0,
            "Medium": 1,
            "Standard": 2,
            "HD": 3,
            "Full HD": 4,
            "Ultra HD": 5
        };

        var f = {
            "video/x-flv": 100,
            "video/webm": 200,
            "video/mp4": 400
        }

        return f[a.mime] + q[a.quality];
    },
    scram: function(a, b) {
        var c = a[0];
        return a[0] = a[b % a.length], a[b] = c, a
    },
    decipher: function(a, c) {
        if (a == null || a.length == 0)
            return c;

        c = c.split("");
        for (var d, e = 0, f = a.length; f > e; e++) {
            var g = a[e];
            switch (g[0]) {
                case "r":
                    c = c.reverse();
                    break;
                case "w":
                    d = ~~g.slice(1), c = Video.scram(c, d);
                    break;
                case "s":
                    d = ~~g.slice(1), c = c.slice(d);
                    break;
                case "p":
                    d = ~~g.slice(1), c.splice(0, d)
            }
        }
        return c.join("")
    },
    extractActions: function(script) {
        var a = "[a-zA-Z_\\$][a-zA-Z_0-9]*",
            s = "(?:'[^'\\\\]*(:?\\\\[\\s\\S][^'\\\\]*)*'|" + '"[^"\\\\]*(:?\\\\[\\s\\S][^"\\\\]*)*")',
            u = "(?:" + a + "|" + s + ")",
            l = ":function\\(a\\)\\{(?:return )?a\\.reverse\\(\\)\\}",
            c = ":function\\(a,b\\)\\{return a\\.slice\\(b\\)\\}",
            d = ":function\\(a,b\\)\\{a\\.splice\\(0,b\\)\\}",
            f = ":function\\(a,b\\)\\{var c=a\\[0\\];a\\[0\\]=a\\[b(?:%a\\.length)?\\];a\\[b(?:%a\\.length)?\\]=c(?:;return a)?\\}",
            h = new RegExp("var (" + a + ")=\\{((?:(?:" + u + l + "|" + u + c + "|" + u + d + "|" + u + f + "),?\\r?\\n?)+)\\};"),
            p = new RegExp("function(?: " + a + ")?\\(a\\)\\{a=a\\.split\\((?:''|\"\")\\);\\s*((?:(?:a=)?" + a + "(?:\\.[a-zA-Z_\\$][a-zA-Z_0-9]*|\\[(?:'[^'\\\\]*(:?\\\\[\\s\\S][^'\\\\]*)*'|\"[^\"\\\\]*(:?\\\\[\\s\\S][^\"\\\\]*)*\")\\])\\(a,\\d+\\);)+)return a\\.join\\((?:''|\"\")\\)\\}"),
            m = new RegExp("(?:^|,)(" + u + ")" + l, "m"),
            g = new RegExp("(?:^|,)(" + u + ")" + c, "m"),
            v = new RegExp("(?:^|,)(" + u + ")" + d, "m"),
            b = new RegExp("(?:^|,)(" + u + ")" + f, "m");
        var t = h.exec(script),
            r = p.exec(script);
        if (!t || !r) return null;
        var n = t[1].replace(/\$/g, "\\$"),
            i = t[2].replace(/\$/g, "\\$"),
            o = r[1].replace(/\$/g, "\\$"),
            a = m.exec(i),
            s = a && a[1].replace(/\$/g, "\\$").replace(/\$|^'|^"|'$|"$/g, "");
        a = g.exec(i);
        var u = a && a[1].replace(/\$/g, "\\$").replace(/\$|^'|^"|'$|"$/g, "");
        a = v.exec(i);
        var l = a && a[1].replace(/\$/g, "\\$").replace(/\$|^'|^"|'$|"$/g, "");
        a = b.exec(i);
        for (var c = a && a[1].replace(/\$/g, "\\$").replace(/\$|^'|^"|'$|"$/g, ""), d = "(" + [s, u, l, c].join("|") + ")", f = "(?:a=)?" + n + "(?:\\." + d + "|\\['" + d + "'\\]|\\[\"" + d + '"\\])\\(a,(\\d+)\\)', y = new RegExp(f, "g"), q = []; null !== (a = y.exec(o));) {
            switch (a[1] || a[2] || a[3]) {
                case c:
                    q.push("w" + a[4]);
                    break;
                case s:
                    q.push("r");
                    break;
                case u:
                    q.push("s" + a[4]);
                    break;
                case l:
                    q.push("p" + a[4])
            }
        }
        return q;
    },

    // Sample pattern to drive encode process
    // var cr=function(a){a=a.split("");dr.RC(a,2);dr.Bw(a,50);dr.C5(a,17);dr.Bw(a,15);dr.Bw(a,66);dr.RC(a,3);return a.join("")};
    extractActions_v2: function(a) {
        // Find "C" in this: var A = B.sig||C (B.s)
        var funcNamePattern = RegExp(/\.sig\s*\|\|([a-zA-Z0-9\$]+)\(/i);
        if (funcNamePattern.exec(a) == null)
            return '';
        var funcName = funcNamePattern.exec(a)[1];
        // Need to make escape with Dollar sign
        if (funcName.indexOf('$') != -1) {
            funcName = "\\" + funcName;
        }

        var funcPattern = funcName + "=function\\(\\w+\\)\\{\\S+?\\n\\S+"; //Escape funcName string
        var funcPattern = RegExp(funcPattern); //Escape funcName string
        if (funcPattern.exec(a) == null)
            return '';

        var funcBody = funcPattern.exec(a)[0]; //Entire sig function
        var lines = funcBody.split(';'); //Each line in sig function

        var idReverse = '', idSlice = '', idCharSwap = ''; //Hold name for each cipher method
        var functionIdentifier = '', funcList = [''];
        var operations = '';
        // Ignore first item
        for (var i = 1; i < lines.length - 1; i++) {
            var line = lines[i];
            //Regex for reverse (one parameter)
            functionIdentifier = this.getFunctionFromLine(line);
            if (functionIdentifier == 'invalid') {
                return '';
            }

            funcList.push(functionIdentifier);

            // Loop until to get all three define pattern
            if (idReverse.length && idSlice.length && idCharSwap.length)
                break;

            //Regex for reserve
            var reverse = functionIdentifier+ ":function\\(\\w+\\)";
            //Regex for slice (return or not): {RC:function(a,b){a.splice(0,b)}
            var slice = functionIdentifier + ":function\\([a],b\\).(return)?.?\\w+\\.";
            //Regex for the char swap: {aC:function(a,b){var c=a[0];a[0]=a[b%a.length];a[b]=c},
            var swap = functionIdentifier + ":function\\(\\w+\\,\\w\\).var\\b.\\bc=a\\b";
            if (RegExp(reverse).exec(a)) {
                idReverse = functionIdentifier;
            }

            if (RegExp(slice).exec(a)) {
                idSlice = functionIdentifier;
            }

            if (RegExp(swap).exec(a)) {
                idCharSwap = functionIdentifier;
            }
        }
        // Extract operation
        // dr.KX(a,73)", "dr.iG(a,1)", "dr.KX(a,28)", "dr.aC(a,31)", "dr.iG(a,1)
        // swap: aC -->w31
        // slice: iG -->s1
        // reverse: KX
        for (var i = 1; i < lines.length - 1; i++) {
            var m, line = lines[i];
            functionIdentifier = i < funcList.length ? funcList[i] : this.getFunctionFromLine(line);
            // Swap operation
            if ((m = RegExp(/\(\w+\,(\d+)\)/).exec(line)) != null && functionIdentifier == idCharSwap) {
                operations += "w" + m[1] + " ";
            }
            // Slice operation
            if ((m = RegExp(/\(\w+\,(\d+)\)/).exec(line)) != null && functionIdentifier == idSlice) {
                operations += "s" + m[1] + " ";
            }

            if (functionIdentifier == idReverse) {
                operations += "r "; //operation is a reverse
            }
        }

        operations = operations.trim();
        return operations;
    },
    //lc.ac(b,c) --> get ac part.
    getFunctionFromLine: function(currentLine) {
        var functionRegex = RegExp(/\w+\.(\w+)/);
        if (functionRegex.exec(currentLine) != null)
            return functionRegex.exec(currentLine)[1];
        return 'invalid';
    },
    // r s1 r w31 s1
    applyOperation: function(cipher, op) {
        switch (op[0])
        {
            case 'r':
                return cipher.split('').reverse().join('');

            case 'w':
                {
                    var index = this.getOperationIndex(op);
                    return this.swapFirstChar(cipher, index);
                }

            case 's':
                {
                    var index = this.getOperationIndex(op);
                    return cipher.substr(index);
                }

            default:
                throw "Couldn't find cipher operation";
        }
    },
    decipher_v2: function(operations, cipher) {
        if (operations.length == 0)
            return cipher;

        operations.split(" ").forEach(function(e) {
            cipher = Video.applyOperation(cipher, e);
        });

        return cipher;
    },
    swapFirstChar: function(a, b) {
        a = a.split('');
        var c = a[0];
        a[0] = a[b % a.length], a[b] = c;
        return a.join('');
    },
    getOperationIndex: function(op) {
        parsed = RegExp(/.(\d+)/).exec(op)[1];
        var index = parseInt(parsed);
        return index;
    },

};

Video.video = {
    //address path of get youtube video info.
    //Sample: "http://www.youtube.com/get_video_info?&video_id=%lertk9&el=detailpage&ps=default&eurl=&gl=US&hl=en"
    YOUTUBE_INFO_URL: "http://www.youtube.com/get_video_info?video_id=",
    YOUTUBE_EL_PARAMS: "&el=detailpage&ps=default&eurl=&gl=US&hl=en",
    //YOUTUBE_EL_PARAMS: "&el=vevo",
    formats: {
        5: {
            resolution: "240p",
            mime: "video/x-flv",
            quality: "Small"
        },
        6: {
            resolution: "270p",
            mime: "video/x-flv",
            quality: "Small"
        },
        17: {
            resolution: "270p",
            mime: "video/x-flv",
            quality: "Small"
        },
        18: {
            resolution: "360p",
            mime: "video/x-flv",
            quality: "Medium"
        },
        22: {
            resolution: "720p",
            mime: "video/mp4",
            quality: "HD"
        },
        34: {
            resolution: "360p",
            mime: "video/x-flv",
            quality: "Medium"
        },
        35: {
            resolution: "480p",
            mime: "video/x-flv",
            quality: "Standard"
        },
        37: {
            resolution: "1080p",
            mime: "video/mp4",
            quality: "Full HD"
        },
        38: {
            resolution: "2304p",
            mime: "video/mp4",
            quality: "Ultra HD"
        },
        43: {
            resolution: "360p",
            mime: "video/webm",
            quality: "Medium"
        },
        44: {
            resolution: "480p",
            mime: "video/webm",
            quality: "Standard"
        },
        45: {
            resolution: "720p",
            mime: "video/webm",
            quality: "HD"
        },
        46: {
            resolution: "1080p",
            mime: "video/webm",
            quality: "Full HD"
        },
        83: {
            resolution: "240p 3D",
            mime: "video/mp4",
            quality: "Small"
        },
        82: {
            resolution: "360p 3D",
            mime: "video/mp4",
            quality: "Medium"
        },
        85: {
            resolution: "520p 3D",
            mime: "video/mp4",
            quality: "Standard"
        },
        84: {
            resolution: "720p 3D",
            mime: "video/mp4",
            quality: "HD"
        },
        120: {
            resolution: "f720",
            mime: "video/x-flv",
            quality: "HD"
        },
        160: {
            resolution: "270p",
            mime: "video/mp4",
            quality: "Small"
        },
        133: {
            resolution: "240p",
            mime: "video/mp4",
            quality: "Small"
        },
        134: {
            resolution: "360p",
            mime: "video/mp4",
            quality: "Small"
        },
        135: {
            resolution: "480p",
            mime: "video/mp4",
            quality: "Standard"
        },
        136: {
            resolution: "720p",
            mime: "video/mp4",
            quality: "HD"
        },
        137: {
            resolution: "1080p",
            mime: "video/mp4",
            quality: "Full HD"
        },
        138: {
            resolution: "2304p",
            mime: "video/mp4",
            quality: "Ultra HD"
        }
    },
};

Video.audio = {
    AudioType: ['Aac', 'Vorbis'],
    formats: {
        139: {
            mime: "audio/m4a",
            type: 'Aac',
            kbs: 48
        },
        140: {
            mime: "audio/m4a",
            type: 'Aac',
            kbs: 128
        },
        141: {
            mime: "audio/m4a",
            type: 'Aac',
            kbs: 256
        }
        // 171: {
        //     mime: "audio/webm",
        //     type: 'Vorbis',
        //     kbs: 128
        // },
        // 172: {
        //     mime: "audio/webm",
        //     type: 'Vorbis',
        //     kbs: 192
        // }
    },
};

var vdl = {
    videolist: new Object(),
    urllist: new Object(),
    urlPlaying: new Object(),
    audiolist: new Object(),
    videoHandler: [{
        mime: "flv",
        urlParts: [""],
        isVideo: true,
        priority: 1
    }, {
        mime: "mp4",
        urlParts: [""],
        isVideo: true,
        priority: 1
    }, {
        mime: "plain",
        urlParts: ["youtube.com", "videoplayback", "range"],
        isVideo: true,
        priority: 1
    }, {
        mime: "m4v",
        urlParts: [""],
        isVideo: true,
        priority: 1
    }, {
        mime: "octet-stream",
        urlParts: ["mp4", "flv"],
        isVideo: true,
        priority: 1
    }]
};
