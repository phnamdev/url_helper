// Global
//==============================================================================
//
//
// Định dạng lại tên 
chrome.runtime.onStartup.addListener(function () {
    localStorage.clear();
});

function NormalizeFileName(filename) {
    var s = filename;
    s = s.replace(/(\>|\<|\&|\:|\*|\?|\\|\/)/g, '');
    s = s.replace(/\"/g, '\'');
    s = s.replace(/\|/g, '-');
    s = s.replace(/'  '/g, ' ');
    return s;
}

// Tạo mã hash
function hash(a, b) {
    if (b = 0 | b, 0 === a.length) return b;
    var c, d;
    for (c = 0, d = a.length; d > c; c++)
        b = (b << 5) - b + a.charCodeAt(c), b |= 0;
    return b;
}

// Tạo id cho url hiện tại
function GetPreKey(url) {
    // Apply simple hash algo to gen ID for URL
    return chrome.runtime.id + hash(url, "1234567890");
}

//==============================================================================
var youtubeEmbed = false;
var hls_play = false;
var MediaDB = function() {
    this.hasInit = false;
    this.index = -1;
    this.tabId = -1;
    this._url = {};
};
var last_playlist = ''; // Lưu request or url chứa link download gần nhất

MediaDB.prototype = {
    constructor: MediaDB,
    addURL: function(url, tabId) {
        if (!this._url.hasOwnProperty(tabId))
            this._url[tabId] = url;
    },
    isEmty: function() {
        return Object.keys(this._url).length === 0;
    },
    reset: function() {
        this.hasInit = false;
        this.index = -1;
        this.tabId = -1;
        this._url = {};
    }
};

var BKAV_Controller = {
    curTabId: 0,
    hasUpdated: false,
    lasturl: new Object(),
    mediaDB: new MediaDB(),
    current_url: undefined,
    hd_site_host: null,
    hd_playlist: [],
    substrack: '',

    //Reset all media object
    onCompleted: function(details) {
        chrome.tabs.get(details.tabId, function(tab) {
            if (tab) {
                vdl.videolist[tab.tabId] = false;
                vdl.urllist[tab.tabId] = false;
                mediaObject.medialist[tab.tabId] = false;
                mediaObject.urlPlaying[tab.tabId] = false;
                mediaObject.urllist[tab.tabId] = false;
            }
        });
        return;
    },

    // Xảy ra khi một tab mới được tạo
    onCreated: function(tab) {
        vdl.videolist[tab.id] = false;
        vdl.urllist[tab.id] = false;
        mediaObject.medialist[tab.tabId] = false;
        mediaObject.urllist[tab.tabId] = false;
        BKAV_Controller.lasturl[tab.tabId] = tab.url;
        BKAV_Controller.mediaDB.reset();
        return;
    },

    // Xảy ra khi một tab được cập nhật
    onUpdated: function(id, change, tab) {
        youtubeEmbed = false;
        hls_play = false;
        if (change.url != undefined) { // Nếu url của tab thay đổi
            var mediaKey = GetPreKey(change.url); // Tạo key cho url đó
            for (var i in embedYoututeSite) { // loại bỏ hết thông tin của url đó trong localStorage
                if (change.url.indexOf(embedYoututeSite[i]) >= 0) {
                    localStorage.removeItem(mediaKey);
                    return;
                }
            }
        }

        // Tạo key cho url mới thay đổi
        var mediaKey = GetPreKey(tab.url);
        var items = null;
        // Nếu localStorage đã có thuộc tính key của url trên
        if (localStorage.hasOwnProperty(mediaKey)) {
            items = JSON.parse(localStorage.getItem(mediaKey));
            // Lấy thông tin của url trên qua key 
        }

        // Sau khi lấy thông tin nếu tồn tại ít nhất 1 thông tin
        // Active icon của extension
        if (items && items.length) {
            Audio.audio.AudioPlayState = false;
            BKAV_Controller.hasUpdated = true; 
            var popupHTML = "popup.html?";
            popupHTML += "&version=audio";
            popupHTML += "&tabid=" + id;
            chrome.pageAction.setPopup({
                tabId: tab.id,
                popup: popupHTML
            });
            chrome.pageAction.show(id);
            chrome.pageAction.setIcon({
                tabId: id,
                path: "../images/icon18_bold.png"
            });
            return;
        }

        // Nếu url của tab không thay đổi thì thoát
        if (change.url == undefined) return;

        // Nếu url gần nhất của BKAV_Controller của tab có id khác với url của tab khi xảy ra cập nhật
        if (BKAV_Controller.lasturl[id] != change.url) {
            BKAV_Controller.mediaDB.reset(); // Reset lại toàn bộ thông tin của BKAV_Controller của tab đó
            if (!timeEvent) // Loop to scan media in 1,5s interval
                timeEvent = window.setInterval(timeFunc, 1500);
            BKAV_Controller.hasUpdated = false;
            BKAV_Controller.lasturl[id] = change.url; // Cập nhật lại url của BKAV_Conttroller tab đó
            vdl.videolist[id] = false;
            vdl.urllist[id] = false;
            Video.VideoPlayState = true;
            mediaObject.medialist[tab.tabId] = false;
            mediaObject.urllist[tab.tabId] = false;

            Audio.audio.AudioPlayState = true;
            for (var site in media_site["VideoSites"]) {
                if (change.url.match(media_site["VideoSites"][site]["filterUrl"])) {
                    chrome.pageAction.setPopup({
                        tabId: tab.id,
                        popup: "popup.html"
                    });
                    chrome.pageAction.hide(id);
                    return;
                }
            }
            for (var site in media_site["AudioSites"]) {
                if (change.url.match(media_site["AudioSites"][site]["filterUrl"])) {
                    chrome.pageAction.setPopup({
                        tabId: tab.id,
                        popup: "popup.html"
                    });
                    chrome.pageAction.hide(id);
                    return;
                }
            }
        }
    },

    // Xảy ra khi tab hoạt động thay đổi
    onActivated: function(activeInfo) {
        // Set for auto capture link for new activeted tab
        chrome.tabs.get(activeInfo.tabId, function(tab) {
            var url = tab.url;
            var tab_id = tab.id;
            for (var site in media_collections) {
                if (url.match(media_collections[site]["filterUrl"])) {
                    BKAV_Controller.mediaDB.hasInit = true;
                    BKAV_Controller.mediaDB.index = site;
                    BKAV_Controller.mediaDB.tabId = tab_id;
                    BKAV_Controller.mediaDB.addURL(url, tab_id);
                    break;
                }
            }
            if (BKAV_Controller.mediaDB.hasInit) {
                chrome.tabs.sendMessage(tab_id,
                    // create message object
                    {
                        msg: "ON_QUERY_PLAYLIST" + media_collections[BKAV_Controller.mediaDB.index]["type"],
                        url: url,
                        tabid: tab_id
                    },
                    //callback function
                    getLinkResponse.bind());
            }
        });
    },

    // [VanDD] add this for restore pinvideo
    onAttached: function(tab_id, b, pinid) {
        chrome.tabs.sendMessage(tab_id, {
            // msg object
            msg: "ON_RESTORE_PIN",
            tabid: tab_id,
            video_id: pinid
        }, function(argument) {
            // body...
        });
    },

    onRestorePin: function(tab_id, status_) {
        chrome.tabs.sendMessage(tab_id, {
            // msg object
            msg: "ON_RESTORE_PIN",
            tabid: tab_id,
            status: status_
        }, function(argument) {
            // body...
        });
    },

    // 
    onQueryPlaylist: function(org_url, type, srt) {
        for (var item in ADS_URLS) {
            if (org_url.indexOf(ADS_URLS[item]) != -1) {
                return '';
            }
        }
        if (type == 3) {
            if (org_url.indexOf("nhaccuatui.com/flash/xml?") != -1) {
                return org_url;
            }
            return;
        } else if (type == 5 || type == 6) { // NamPHb [06/08/18]
            if (org_url.indexOf("api.kinghub.vn/video/api/v1/detailVideoByGet?FileName=") >= 0)
                return org_url;
            return ;
        } // end
        // Test for has Youtube embed
        var file_name = 'playlist.m3u8';
        if (type == 0)
            file_name = "chunklist.m3u8";
        else if (type == 2)
            file_name = "playlist_m.m3u8";

        if (srt == true)
            file_name = ".srt";

        var playlist = '';
        if (org_url.indexOf(file_name) != -1) {
            url = decodeURIComponent(org_url);
            var pos = url.toLowerCase().indexOf(file_name);
            url = url.substr(0, pos + file_name.length + 1);
            // Check filename match exactly
            pos = url.lastIndexOf("/");
            var filename = url.substr(pos + 1, url.length - pos - 1);
            if (file_name != filename)
                return '';

            playlist = url;
            if (url.lastIndexOf("http://") > 0) {
                pos = url.lastIndexOf("http://") + 7;
                playlist = url.substr(pos, url.length - pos);
            } else if (url.lastIndexOf("https://") > 0) {
                pos = url.lastIndexOf("https://") + 8;
                playlist = url.substr(pos, url.length - pos);
            }
        }

        return playlist;
    },

    // Kiểm tra link tải trên phần tử của trang
    onCheckUrlMedia: function(org_url, from_video_tag) {
        var audio = ["mp3", "flac", "m4a", "wma", "ogg", "wav", "aif", "mid"];
        var video = ["mp4", "mpeg4", "mpg", "mpeg", "m4v", "avi", "divx", "mov",
            "wmv", "movie", "asf", "webm", "flv", "3gp"
        ];
        var hls = ["m3u8"];
        var ret_templ = {
            type: undefined,
            url: undefined,
            ext: undefined,
            filename: undefined
        };

        // Nếu là video quảng cáo thì bỏ qua
        for (var item in ADS_URLS) {
            if (org_url.indexOf(ADS_URLS[item]) != -1) {
                return ret_templ;
            }
        }
        for (var i in block_urls_regex) {
            for (var j = 0; j < block_urls_regex[i].length; j++) {
                if (compare_regex(org_url, block_urls_regex[i][j]))
                    return ret_templ;
            }
        }

        url = decodeURIComponent(org_url);
        if (url[url.length - 1] == '/')
            url = url.substr(0, url.length - 1);
        if (url.lastIndexOf("/") != -1) {
            var filename = url.substr(url.lastIndexOf("/") + 1, url.length - url.lastIndexOf("/") - 1);
            ret_templ.filename = NormalizeFileName(filename.substr(0, filename.lastIndexOf(".")));
        }

        // Support pin-video
        for (var item in hls) {
            if (url.indexOf("." + hls[item]) != -1) {
                var pos = url.toLowerCase().indexOf("." + hls[item]);
                url = url.substr(0, pos + hls[item].length + 1),
                    pos1 = url.lastIndexOf("http://"),
                    pos2 = url.lastIndexOf("https://");
                if (pos1 > 0) {
                    pos = pos1 + 7;
                    url = url.substr(pos, url.length - pos);
                } else if (pos2 > 0) {
                    pos = pos2 + 8;
                    url = url.substr(pos, url.length - pos);
                }

                var scheme = location.protocol;
                if (pos1 == -1 && pos2 == -1)
                    url = scheme + '//' + url;
                ret_templ.url = url;
                ret_templ.type = Media_type[3];
                ret_templ.ext = hls[item];
                return ret_templ;
            }
        }

        for (var item in audio) {
            if (url.indexOf("." + audio[item]) != -1 ||
                url.indexOf("." + audio[item].toUpperCase()) != -1) {
                var pos = url.toLowerCase().indexOf("." + audio[item]);
                url = url.substr(0, pos + audio[item].length + 1);
                if (url.lastIndexOf("http://") > 0) {
                    pos = url.lastIndexOf("http://") + 7;
                    url = url.substr(pos, url.length - pos);
                } else if (url.lastIndexOf("https://") > 0) {
                    pos = url.lastIndexOf("https://") + 8;
                    url = url.substr(pos, url.length - pos);
                }
                ret_templ.url = url;
                ret_templ.type = Media_type[1];
                ret_templ.ext = audio[item];
                return ret_templ;
            }
        }

        for (var item in video) {
            if (url.indexOf("." + video[item]) != -1 ||
                url.indexOf("." + video[item].toUpperCase()) != -1) {
                var pos = url.toLowerCase().indexOf("." + video[item]);
                url = url.substr(0, pos + video[item].length + 1);
                if (url.lastIndexOf("http://") > 0) {
                    pos = url.lastIndexOf("http://") + 7;
                    url = url.substr(pos, url.length - pos);
                } else if (url.lastIndexOf("https://") > 0) {
                    pos = url.lastIndexOf("https://") + 8;
                    url = url.substr(pos, url.length - pos);
                }
                // VanDD
                if (from_video_tag)
                    url = org_url;
                // End of comment
                ret_templ.url = /*(org_url.indexOf("vhosting.vcmedia.vn") == -1)? org_url :*/ url;
                ret_templ.type = Media_type[0];
                ret_templ.ext = video[item];
                return ret_templ;
            }
        }

        // VanDD : Have to dump this
        if (!ret_templ.url && from_video_tag) {
            ret_templ.url = url;
            ret_templ.ext = "mp4";
            ret_templ.type = Media_type[0];
        }
        return ret_templ;
    },

    onResponseStarted: function(detail, tab) {
        if (tab.url.indexOf("chrome://") != -1)
            return;
        // [NamPHb 06/09/18] declare variable for reuse 
        var decodeURL = decodeURIComponent(detail.url);
        // end
        // Check for response get from youtube
        if (decodeURL.indexOf("googlevideo.com/videoplayback") >= 0 &&
            tab.url.indexOf("youtube") == -1) {
            youtubeEmbed = true;
            // chrome.bkavMediaTabHelper.Notify({
            //     type: Media_type[0],
            //     mediaURL: [detail.url],
            //     tab_index: tab.index
            // });

            for (var i in embedYoututeSite) {
                if (tab.url.match(embedYoututeSite[i]) != null) {
                    var headers = detail.responseHeaders;
                    var len = undefined;

                    for (var i in headers) {
                        if ((headers[i].name == 'status' && headers[i].value == '302') ||
                            (headers[i].name == 'Content-Length' && headers[i].value == '0')) {
                            return;
                        }
                        if (headers[i].name == 'Content-Length')
                            len = parseInt(headers[i].value);
                    };

                    var links = [];
                    // Videos
                    links.push({
                        url: detail.url,
                        mime: 'mp4',
                        len: len,
                        resolution: undefined,
                        quality: undefined,
                        title: tab.title,
                        media_type: Media_type[0],
                    });

                    getLinkResponse({
                        org_id: detail.tabId,
                        org_url: tab.url,
                        ot_link: true,
                        links: links
                    });
                    break;
                }
            }
        }

        // [NamPHb 06/09/18] query playlist of phimbathu.com
        if (decodeURL.indexOf("http://api.phimbathu.com/getcs/index.php") >= 0)
        {
            chrome.tabs.sendMessage(detail.tabId, {
                msg: "ON_QUERY_PLAYLIST_PHIMBATHU_PLAYLIST_", 
                tabId: detail.tabId, 
                url: detail.url
            });
            return ;
        }
        // end

        if (decodeURL.match("^https?:\/\/(?:www\.)?(api|api-v2\.soundcloud.com)\/([a-zA-Z\/]+)(\\d+)\\?client_id=[a-zA-Z0-9]+") ||
            decodeURL.match("^https?:\/\/(?:www\.)?(api|api-v2\.soundcloud.com)\/([a-zA-Z]+)\\?ids=[0-9]+&client_id=[a-zA-Z0-9]+") ||
            decodeURL.match("^https?:\/\/(?:www\.)?(api|api-v2).soundcloud.com\/([a-zA-Z\/]+)(\\d+)\\S+&client_id=[a-zA-Z0-9]+")) {
            // chrome.bkavMediaTabHelper.Notify({
            //     type: Media_type[1],
            //     mediaURL: [detail.url],
            //     tab_index: tab.index
            // });

            if (playlist != detail.url) {
                BKAV_Controller.current_url = playlist = detail.url;
                BKAV_Controller.hd_playlist.push(playlist);
                chrome.tabs.sendMessage(detail.tabId,
                    //create message object
                    {
                        msg: "ON_QUERY_PLAYLIST_SOUNDCLOUD_PLAYLIST_",
                        tabid: detail.tabId,
                        playlist: playlist
                    });
            }
        }

        var hls_playlist = media_site["EventSites"][media_site["EventSites"].length - 1];
        // [NamPHb 06/08/18] dimiss download hls video from dantri and kenh14
        // Replace download hls video by mp4 video
        if (tab.url.indexOf("dantri") < 0 && tab.url.indexOf("kenh14") < 0) {
            for (var i in hls_playlist["filterUrl"]) {
                if (decodeURL.match(hls_playlist["filterUrl"][i])) {
                    hls_play = true;
                    // Get playlist at most one times
                    if (detail.url != last_playlist) {
                        last_playlist = detail.url;
                        //console.log('Get m3u8 file: ' + last_playlist);
                        // chrome.bkavMediaTabHelper.Notify({
                        //     type: Media_type[3],
                        //     mediaURL: [last_playlist],
                        //     tab_index: tab.index
                        // });
                        getLinkFromEventPage(tab.id, media_site["EventSites"].length - 1, detail.url);
                    } else { // [NamPHb 15/08/18]
                        var mediaKey = GetPreKey(tab.url);
                        var urls = JSON.parse(localStorage.getItem(mediaKey));
                        if (urls && urls.link && urls.link.length > 0) {
                            var popupHTML = "popup.html?";
                            popupHTML += "&version=media";
                            popupHTML += "&tabid=" + tab.id;
                            chrome.pageAction.setPopup({
                                tabId: tab.id,
                                popup: popupHTML
                            });
                            chrome.pageAction.show(tab.id);
                            chrome.pageAction.setIcon({
                                tabId: tab.id,
                                path: "../images/icon18_bold.png"
                            });
                        }
                    }
                    return;
                }
            }
        } // end

        // Query playlist for streamming site
        for (var site = 0; site < media_site["EventSites"].length - 1; site++) {
            for (var k in media_site["EventSites"][site]["filterUrl"]) {
                if (tab.url.match(RegExp(media_site["EventSites"][site]["filterUrl"][k], 'g'))) {
                    // chrome.bkavMediaTabHelper.Notify({
                    //     type: Media_type[0],
                    //     mediaURL: [detail.url],
                    //     tab_index: tab.index
                    // });

                    // Continue get hdstream
                    var playlist = this.onQueryPlaylist(detail.url, site);
                    if (playlist /*&& playlist != ''*/ && playlist != last_playlist) {
                        BKAV_Controller.current_url = tab.url;
                        last_playlist = playlist;
                        BKAV_Controller.hd_playlist.push(playlist);
                        BKAV_Controller.hd_site_host = playlist.substr(0, playlist.lastIndexOf('/') + 1);
                        GetLinkFromEventPage(tab.id, site, playlist);
                    }

                    if (site == 1) {
                        var srt = this.onQueryPlaylist(detail.url, site, true);
                        if (srt != '') {
                            BKAV_Controller.substrack = srt;
                        }
                    }
                    return;
                }
            }
        }

        BKAV_Controller.current_url = tab.url;
        var url = detail.url;
        var check_url = this.onCheckUrlMedia(url);
        var response = undefined;

        if (check_url.type != undefined) {
            var headers = detail.responseHeaders,
                len = null;
            for (var i in headers) {
                if (headers[i].name == 'Content-Length') {
                    len = headers[i].value;
                    break;
                }
            };

            var links = [];
            if (check_url.type == Media_type[3]) {
                if (!hls_play) {
                    hls_play = true;
                    // chrome.bkavMediaTabHelper.Notify({
                    //     type: check_url.type,
                    //     mediaURL: [check_url.url],
                    //     tab_index: tab.index
                    // });
                }
                return;
            } else if (check_url.type == Media_type[0]) {
                // Videos
                links.push({
                    url: check_url.url,
                    mime: check_url.ext,
                    len: check_url.url == url ? len : undefined,
                    resolution: undefined,
                    quality: undefined,
                    title: NormalizeFileName(check_url.filename),
                    media_type: Media_type[0],
                });
            } else {
                // Audio
                links.push({
                    url: check_url.url,
                    mime: check_url.ext,
                    len: check_url.url == url ? len : undefined,
                    resolution: undefined,
                    quality: undefined,
                    title: NormalizeFileName(check_url.filename),
                    media_type: Media_type[1],
                });
            }

            // chrome.bkavMediaTabHelper.Notify({
            //     type: check_url.type,
            //     mediaURL: [url],
            //     tab_index: tab.index
            // });

            getLinkResponse({
                org_id: detail.tabId,
                org_url: tab.url,
                links: links
            });
        }
    },
};

var onWebRequestCallback = function(detail) {
    if (detail.tabId < 0)
        return;

    chrome.tabs.get(detail.tabId, function(tab) {
        if (tab == undefined)
            return;

        check = false;
        type = "";
        for (var site in media_collections) {
            if (tab.url.match(media_collections[site]["filterUrl"])) {
                check = true;
                type = media_collections[site]["media_type"];
                break;
            }
        }

        if (check == false)
            BKAV_Controller.onResponseStarted(detail, tab);
    });
};
var filters = {
    urls: ["*://*/*"],
    types: ["xmlhttprequest", "object", "other"]
};

var lst_tabs = [];

function fetch_tabs_url(tabs) {
    for (var i = 0; i < tabs.length; i++) {
        window.lst_tabs[tabs[i].id] = tabs[i].url;
    }
};

function FakeTime() {
    var current_date = new Date();
    var y = current_date.getFullYear().toString();
    var m = (current_date.getMonth() + 1).toString(); // getMonth() is zero-based
    var d = current_date.getDate().toString();
    return y + (m[1] ? m : "0" + m[0]) + (d[1] ? d : "0" + d[0]); // padding
};

var onAdBlockCallback = function(detail) {
    if (detail.tabId < 0)
        return;

    if (detail.url && detail.url.match(/video.*.fbcdn.net\//))
        return {
            cancel: false
        };

    chrome.tabs.query({}, function(tabs) {
        fetch_tabs_url(tabs);
    });

    //match tab
    if (lst_tabs[detail.tabId]) {
        var url = lst_tabs[detail.tabId];
        var url_parts = parseUri(url);
        var current_domain = url_parts.host;
        var flag_skip = false;

        if (detail.url.indexOf('ads.hosting.vcmedia.vn/Jinfo.ashx') > 0 ||
            detail.url.indexOf('google.com/ads/admob') > 0) {
            return {
                cancel: false
            };
        }

        // Create fake pattern here
        if (current_domain.indexOf('hdonline.vn') > -1 && detail.url.indexOf('plusone.js') > -1) {
            return {
                redirectUrl: "http://www.tvhd365.com/others/hdo_plusone.js?" + FakeTime()
            };
        }
        if (current_domain.indexOf('movies.hdviet.com') > -1 && detail.url.indexOf('eclick.js') > -1) {
            return {
                redirectUrl: "http://www.tvhd365.com/others/hdviet_eclick.js?" + FakeTime()
            };
        }
        if (current_domain.indexOf('hayhaytv.vn') > -1 && detail.url.indexOf('addthis_widget.js') > -1) {
            return {
                redirectUrl: "http://www.tvhd365.com/others/hhtv_addthis_widget.js?" + FakeTime()
            };
        }

        if (current_domain.indexOf('hayhaytv') > -1) {
            if (block_urls["hayhaytv"].indexOf(detail.url) >= 0) {
                return {
                    cancel: true
                };
            } else { // compare regex
                for (var i in block_urls_regex["hayhaytv"]) {
                    if (compare_regex(detail.url, block_urls_regex["hayhaytv"][i])) {
                        return {
                            cancel: true
                        };
                    }
                }
            }
            return {
                cancel: false
            };
        } else if (current_domain.indexOf('hdonline') > -1) {
            if (block_urls["hdonline"].indexOf(detail.url) >= 0) {
                return {
                    cancel: true
                };
            } else { // compare regex
                for (var i in block_urls_regex["hdonline"]) {
                    if (compare_regex(detail.url, block_urls_regex["hdonline"][i])) {
                        return {
                            cancel: true
                        };
                    }
                }
            }
            return {
                cancel: false
            };
        } else if (current_domain.indexOf('hdviet') > -1) {
            if (block_urls["hdviet"].indexOf(detail.url) >= 0) {
                return {
                    cancel: true
                };
            } else { // compare regex
                for (var i in block_urls_regex["hdviet"]) {
                    if (compare_regex(detail.url, block_urls_regex["hdviet"][i])) {
                        return {
                            cancel: true
                        };
                    }
                }
            }
            return {
                cancel: false
            };
        }
    }
};

/*chrome.webRequest.onBeforeRequest.addListener(onAdBlockCallback, {
    urls: ['<all_urls>']
}, ['blocking']);*/
chrome.webRequest.onBeforeRedirect.addListener(onWebRequestCallback, filters, ["responseHeaders"]);
//chrome.webRequest.onResponseStarted.addListener(onWebRequestCallback, filters, ["responseHeaders"]);
chrome.webRequest.onHeadersReceived.addListener(onWebRequestCallback, filters, ["responseHeaders"]);

chrome.tabs.onUpdated.addListener(BKAV_Controller.onUpdated);
chrome.tabs.onCreated.addListener(BKAV_Controller.onCreated);
chrome.tabs.onActivated.addListener(BKAV_Controller.onActivated);
// VanDD : Pinvideo
chrome.tabs.onAttached.addListener(BKAV_Controller.onAttached);

chrome.tabs.restoreMediaPin.addListener(BKAV_Controller.onRestorePin);

chrome.runtime.onInstalled.addListener(function(a) {
    // Clear old local storage
    localStorage.clear();
})

var timeEvent = null;

function timeFunc() {
    if (!BKAV_Controller.mediaDB.isEmty()) {
        var tabid = BKAV_Controller.mediaDB.tabId;
        // NamTB: If current request not success (because page has not loaded yet, ect)
        // we try again in next time. To be sure capture link has start
        chrome.tabs.sendMessage(tabid,
            // create message object
            {
                msg: "ON_QUERY_PLAYLIST" + media_collections[BKAV_Controller.mediaDB.index]["type"],
                url: BKAV_Controller.mediaDB._url[tabid],
                tabid: tabid
            },
            //callback function
            getLinkResponse.bind());
        if (BKAV_Controller.mediaDB.hasInit) {
            //BKAV_Controller.mediaDB.reset();
            window.clearInterval(timeEvent);
            timeEvent = null;
        }
    } else {
        chrome.tabs.getSelected(undefined, function(tab) {
            for (var site in media_collections) {
                if (tab.url.match(media_collections[site]["filterUrl"])) {
                    BKAV_Controller.mediaDB.hasInit = true;
                    BKAV_Controller.mediaDB.index = site;
                    BKAV_Controller.mediaDB.tabId = tab.id;
                    BKAV_Controller.mediaDB.addURL(tab.url, tab.id);
                    break;
                }
            }
        })
    }
};

function getYoutubeEmbedded(response, embed_title, page_url) {
    // Get format mime
    function formatMime(mimeType) {
        if (mimeType.indexOf('flv') >= 0)
            return "flv";
        else if (mimeType.indexOf('mp4') >= 0)
            return "mp4";
        else if (mimeType.indexOf('webm') >= 0)
            return "webm";
        else if (mimeType.indexOf('3gp') >= 0)
            return "3gp";
        else if (mimeType.indexOf('m4a') >= 0)
            return "m4a";
        else if (mimeType.indexOf('ogg') >= 0)
            return "ogg";
        return "Unknown";
    };
    if (response.length == 0)
        return;

    var yt_links = [];
    if (response.length == 1) {
        var tracks = response[0];
        for (var i in tracks) {
            yt_links.push({
                url: [tracks[i].url],
                audioUrl: tracks[i].audioUrl != undefined ? tracks[i].audioUrl : '',
                mime: [formatMime(tracks[i].mime)],
                len: [tracks[i].len],
                resolution: tracks[i].res,
                quality: tracks[i].quality,
                title: NormalizeFileName(embed_title[0]),
                media_type: Media_type[0],
            });
        }
    } else {
        for (var k in response) {
            var tracks = response[k];
            if (!tracks)
                continue;
            var url = [],
                audio_list = [],
                mime = [],
                len = [],
                res = [],
                qual = [];
            for (var i in tracks) {
                url.push(tracks[i].url);
                audio_list.push(tracks[i].audioUrl != undefined ? tracks[i].audioUrl : '');
                mime.push(formatMime(tracks[i].mime));
                len.push(tracks[i].len);
                res.push(tracks[i].res);
                qual.push(tracks[i].quality);
            }
            yt_links.push({
                url: url,
                audioUrl: audio_list,
                mime: mime,
                len: len,
                resolution: res,
                quality: qual,
                title: NormalizeFileName(embed_title[k]),
                media_type: Media_type[0],
            });
        }
    }


    if (yt_links.length > 0) {
        //chrome.tabs.getSelected(undefined, function(tab) {
        chrome.tabs.query({
            url: page_url
        }, function(tab) {
            //Store result to local storage
            var tabid = tab[0].id;
            var mediaKey = GetPreKey(page_url);
            localStorage.setItem(mediaKey, JSON.stringify(yt_links));

            Audio.audio.AudioPlayState = false;
            BKAV_Controller.hasUpdated = true;
            var popupHTML = "popup.html?";
            popupHTML += "&version=media";
            popupHTML += "&tabid=" + tabid;

            chrome.pageAction.setPopup({
                tabId: tabid,
                popup: popupHTML
            }), chrome.pageAction.show(tabid);
            chrome.pageAction.setIcon({
                tabId: tabid,
                path: "../images/icon18_bold.png"
            });
        });
    }
};

function getSoundCloudEmbedded(sc_links, embed_title, page_url) {
    if (sc_links.length > 0) {
        var esp_postfix = sc_links.length > 1;
        for (var i in sc_links) {
            sc_links[i].title = NormalizeFileName(embed_title);
            if (esp_postfix) {
                sc_links[i].title += "_esp " + i;
            }
        }
        //chrome.tabs.getSelected(undefined, function(tab) {
        chrome.tabs.query({
            url: page_url
        }, function(tab) {
            //Store result to local storage
            var tabid = tab[0].id;
            var mediaKey = GetPreKey(page_url);
            localStorage.setItem(mediaKey, JSON.stringify(sc_links));

            Audio.audio.AudioPlayState = false;
            BKAV_Controller.hasUpdated = true;
            var popupHTML = "popup.html?";
            popupHTML += "&version=media";
            popupHTML += "&tabid=" + tabid;

            chrome.pageAction.setPopup({
                tabId: tabid,
                popup: popupHTML
            }), chrome.pageAction.show(tabid);
            chrome.pageAction.setIcon({
                tabId: tabid,
                path: "../images/icon18_bold.png"
            });
        });
    }
};

function getFacebookEmbedded(fb_url, page_url) {
    var fb_links = [];
    for (var k in fb_url) {
        fb_links.push({
            url: [fb_url[k].link],
            mime: ['mp4'],
            len: [''],
            quality: [fb_url[k].quality],
            title: fb_url[k].title,
            media_type: Media_type[0],
        });
    }

    if (fb_links.length > 0) {
        //chrome.tabs.getSelected(undefined, function(tab) {
        chrome.tabs.query({
            url: page_url
        }, function(tab) {
            //Store result to local storage
            var tabid = tab[0].id;
            var mediaKey = GetPreKey(page_url);
            localStorage.setItem(mediaKey, JSON.stringify(fb_links));

            Audio.audio.AudioPlayState = false;
            BKAV_Controller.hasUpdated = true;
            var popupHTML = "popup.html?";
            popupHTML += "&version=media";
            popupHTML += "&tabid=" + tabid;

            chrome.pageAction.setPopup({
                tabId: tabid,
                popup: popupHTML
            }), chrome.pageAction.show(tabid);
            chrome.pageAction.setIcon({
                tabId: tabid,
                path: "../images/icon18_bold.png"
            });
        });
    }
};

// Phan tich |response| tra ve
function getLinkResponse(response) {
    if (response == undefined || response.links == undefined)
        return;

    if (response.org_id == null) {
        chrome.tabs.query({
            active: true
        }, function(tab) {
            response.org_id = tab[0].id;
            getLinkResponse(response);
        })
        return;
    }

    var tabid = response.org_id;
    var url = response.org_url;
    if (url == undefined) {
        url = BKAV_Controller.current_url;
    }
    url.trim();

    var links = response.links;
    mediaObject.urllist[tabid] = new Array;

    //Remove duplicate link + group all media link relate
    var title = null,
        index = -1;
    for (var i = 0; i < links.length; i++) {
        if (links[i].title !== title) {
            mediaObject.urllist[tabid].push({
                url: [links[i].url],
                mime: [links[i].mime],
                len: [links[i].len],
                quality: [links[i].quality],
                resolution: [links[i].resolution],
                media_type: [links[i].media_type],
                title: links[i].title
            });
            index++;
            title = links[i].title;
        } else {
            mediaObject.urllist[tabid][index].url.push(links[i].url);
            mediaObject.urllist[tabid][index].mime.push(links[i].mime);
            mediaObject.urllist[tabid][index].len.push(links[i].len);
            mediaObject.urllist[tabid][index].quality.push(links[i].quality);
            mediaObject.urllist[tabid][index].resolution.push(links[i].resolution);
            mediaObject.urllist[tabid][index].media_type.push(links[i].media_type);
        };
    }

    if (links.length > 0) {
        //Store result to local storage
        var mediaKey = GetPreKey(url);
        var items = undefined;
        if (!localStorage.hasOwnProperty(mediaKey)) {
            // [14/6/2018 VanDD] : add this
            if (links.from_suggest && mediaObject.urllist[tabid][0])
                mediaObject.urllist[tabid][0].from_suggest = true;
            // End of comment
            items = mediaObject.urllist[tabid];
        } else {
            items = JSON.parse(localStorage.getItem(mediaKey));
            if (!Array.isArray(items)) {
                return;
            }

            for (var i = 0; i < mediaObject.urllist[tabid].length; i++) {
                var check = false;
                for (var j = 0; j < items.length; j++) {
                    if (JSON.stringify(items[j].url) == JSON.stringify(mediaObject.urllist[tabid][i].url)) {
                        if (items[j].title.length < mediaObject.urllist[tabid][i].title.length) {
                            // items.spline(j, 1, mediaObject.urllist[tabid][i]);
                            items[j].title = mediaObject.urllist[tabid][i].title;
                        }
                        check = true;
                        break;
                    }
                }

                if (check == false) {
                    // VanDD : add this
                    if (links.from_suggest)
                        mediaObject.urllist[tabid][i].from_suggest = true;
                    // VanDD : check this to avoid duplicate
                    var duplicated = false;
                    for (var k = 0; k < items.length; k++) {
                        if (items[k].title == mediaObject.urllist[tabid][i].title) {
                            duplicated = true;
                            break;
                        }
                    }
                    if (!duplicated) {
                        items.push(mediaObject.urllist[tabid][i]);
                    }
                }
            }
        }
        if (response.ot_link === true) {
            for (var i in items)
                items[i].ot_link = true;
        }

        localStorage.setItem(mediaKey, JSON.stringify(items));

        Audio.audio.AudioPlayState = false;
        BKAV_Controller.hasUpdated = true;
        var popupHTML = "popup.html?";
        popupHTML += "&version=media";
        popupHTML += "&tabid=" + tabid;
        chrome.pageAction.setPopup({
            tabId: tabid,
            popup: popupHTML
        }), chrome.pageAction.show(tabid);
        chrome.pageAction.setIcon({
            tabId: tabid,
            path: "../images/icon18_bold.png"
        });
    }
};

// [13/6/2018 VanDD] : query info for a suggest link
function getLinkFromSuggest(details) {
    var links = [];
    var check_url = BKAV_Controller.onCheckUrlMedia(details.suggest_link, true);
    var filename = "", tabId = details.tab_id;
    chrome.tabs.get(tabId, function(tab) {
        if (tab != undefined) {
            filename = tab.title;
            console.log(filename);
            console.log(tab);
            links.push({
                url: check_url.url,
                mime: check_url.ext,
                len: undefined,
                resolution: undefined,
                quality: undefined,
                title: filename,
                media_type: Media_type[0],
            });
            links.from_suggest = true;
            getLinkResponse({
                org_id: details.tab_id,
                org_url: details.org_url,
                links: links
            });
        }
    });
    // if (title == "" && check_url != "")
    //     title = check_url.filename;
    // else
    //     title = "Video";
    var mediaKey = GetPreKey(details.org_url);
    var urls = JSON.parse(localStorage.getItem(mediaKey));
    return urls;
}
// End of comment

// Gửi message sang content để get link tải
function getLinkFromEventPage(tabId, site, playlist) {
    
    chrome.tabs.sendMessage(tabId,
        //create message object
        {
            msg: "ON_QUERY_PLAYLIST" + media_site["EventSites"][site]["ID"],
            tabid: tabId,
            playlist: playlist
        });
    
};

// [NamPHb 17/08/18] Gửi message sang content để get link tải
function GetLinkFromEventPage(tabId, tabURL, siteIndex, requestURL) {
    chrome.tabs.sendMessage(tabId, {
        msg: "ON_QUERY_PLAYLIST" + media_site["EventSites"][siteIndex]["ID"], 
        url: tabURL, 
        tabid: tabId,
        playlist: requestURL
    });
};
// end

// [NamPHb 17/08/18]
function GetLinkFromEventPage(tabId, tabURL, siteIndex, requestURL) {
    chrome.tabs.sendMessage(tabId, {
        msg: "ON_QUERY_PLAYLIST" + media_site["EventSites"][siteIndex]["ID"], 
        url: tabURL, 
        tabid: tabId,
        playlist: requestURL
    });
};
// end

chrome.extension.onMessage.addListener(function(details, sender, callback) {
    if (details.msg === "ON_SHOW_EMBEDED_YOUTUBE_VIDEO") {
        getYoutubeEmbedded(details.yturl, details.title, details.url);
    }

    if (details.msg === "ON_SHOW_EMBEDED_SOUNDCLOUD") {
        getSoundCloudEmbedded(details.sc_links, details.title, details.url);
    }

    if (details.msg === "ON_SHOW_EMBEDED_FACEBOOK_VIDEO") {
        getFacebookEmbedded(details.fb_url, details.url);
    }

    if (details.msg === "ON_SHOW_EMBEDED_VIMEO_VIDEO") {
        chrome.tabs.query({
            url: details.url
        }, function(tab) {
            //Store result to local storage
            var tabid = tab[0].id;
            var mediaKey = GetPreKey(details.url);
            localStorage.setItem(mediaKey, JSON.stringify(details.vimeo_url));

            Audio.audio.AudioPlayState = false;
            BKAV_Controller.hasUpdated = true;
            var popupHTML = "popup.html?";
            popupHTML += "&version=media";
            popupHTML += "&tabid=" + tabid;

            chrome.pageAction.setPopup({
                tabId: tabid,
                popup: popupHTML
            }), chrome.pageAction.show(tabid);
            chrome.pageAction.setIcon({
                tabId: tabid,
                path: "../images/icon18_bold.png"
            });
        });
    }

    // Lấy được link tải từ content
    if (details.msg === "ON_RESPONSE_EVENT_URLS") {
        getLinkResponse(details.response);
    }

    if (details.msg === "ON_SYNC_MEDIA_REFERER_URL") {
        chrome.tabs.query({
            url: details.response.org_url
        }, function(tabs) {
            var tab_index = tabs[0].index;
            // chrome.bkavMediaTabHelper.Notify({
            //     type: Media_type[2],
            //     mediaURL: details.response.sync_url,
            //     tab_index: tab_index
            // });
        });
    }

    // TH lấy được link download qua request
    if (details.msg === "ON_RESPONSE_STREAMMING_URLS") {
        // chrome.tabs.getSelected(undefined, function(tab) {
        chrome.tabs.query({
            url: details.org_url
        }, function(tabs) {
            //Store result to local storage
            var tab = tabs[0];
            var tabid = tab.id;
            var mediaKey = GetPreKey(tab.url);
            var link = details.url;
            var host_name = (link[0].urls[0].indexOf('http') == -1);
            if (host_name) {
                for (var i in link) {
                    for (var j in link[i].urls)
                        link[i].urls[j] = BKAV_Controller.hd_site_host + link[i].urls[j];
                }
            }

            // May be raise quota exception ?
            // if (!localStorage.hasOwnProperty(mediaKey) || youtubeEmbed) {
            try {
                localStorage.setItem(mediaKey, JSON.stringify({
                    type: 'HD_STREAM',
                    id: details.id,
                    substrack: BKAV_Controller.substrack,
                    fileName: details.fileName,
                    link: link
                }));
            } catch (e) {
                localStorage.clear();
                localStorage.setItem(mediaKey, JSON.stringify({
                    type: 'HD_STREAM',
                    id: details.id,
                    substrack: BKAV_Controller.substrack,
                    fileName: details.fileName,
                    link: link
                }));
            }
            // }

            var popupHTML = "popup.html?";
            popupHTML += "&version=media";
            popupHTML += "&tabid=" + tabid;

            chrome.pageAction.setPopup({
                tabId: tabid,
                popup: popupHTML
            }), chrome.pageAction.show(tabid);
            chrome.pageAction.setIcon({
                tabId: tabid,
                path: "../images/icon18_bold.png"
            });
        });
    }
    // [13/6/2018 VanDD] : get links for download panel
    // Trường hợp không lấy được link tải qua request
    if (details.msg == "ON_QUERY_READY_URLS") {
        var mediaKey = GetPreKey(details.org_url);
        var urls = JSON.parse(localStorage.getItem(mediaKey));
        if (!details.suggest_link) {
            if (!urls && BKAV_Controller.mediaDB.hasInit) {
                chrome.tabs.sendMessage(sender.tab.id,
                    // create message object
                    {
                        msg: "ON_QUERY_PLAYLIST" + media_collections[BKAV_Controller.mediaDB.index]["type"],
                        url: details.org_url,
                        tabid: sender.tab.id
                    },
                    //callback function
                    getLinkResponse.bind());
            } else {
                timeFunc(); // Call once to init mediaDB
                callback({
                    result: urls
                });
            }
            return;
        }
        if (!urls || urls[0].from_suggest) {
            if (urls) {
                for (var i = 0; i < urls.length; i++) {
                    if (urls[i].url[0] == details.suggest_link) {
                        var tmp_list = [urls[i]];
                        callback({
                            result: tmp_list
                        });
                        return;
                    }
                }
            }
            details.tab_id = sender.tab.id;
            urls = getLinkFromSuggest(details);
            return;
        }
        if (!urls[0].mime || urls[0].mime == "mp3") {
            localStorage.removeItem(mediaKey);
            details.tab_id = sender.tab.id;
            urls = getLinkFromSuggest(details);
            return;
        }
        callback({
            result: urls
        });
    }
    // End of comment
});