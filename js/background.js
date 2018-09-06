var BKAVMessageHandler = {
    StartPage: {
        //Extension message handler
        onMessage: function(details, sender, callback) {
            if (details.tabId === false) {
                details.tabId = sender.tab.id;
            }

            //Get video links
            if (details.msg == "ON_QUERY_VIDEO_URLS") {
                if (callback) {
                    // For embeded link
                    if (details.yturl != undefined) {
                        // Setup global variables
                        if (Video.isYoutube(details.yturl)) {
                            vdl.urlPlaying[details.tabId] = new Object;
                            vdl.urlPlaying[details.tabId].url = details.yturl;
                        }
                        if (vdl.urlPlaying[details.tabId]) {
                            if (Video.scanHtmlForVideos(details.tabId, details.js_dictate, callback)) {
                                return true;
                            }
                        }
                        return true;
                    }

                    chrome.tabs.get(details.tabId, function(tab) {
                        if (Video) {
                            if (Video.isYoutube(tab.url)) {
                                vdl.urlPlaying[details.tabId] = new Object;
                                vdl.urlPlaying[details.tabId].url = tab.url;
                                vdl.urlPlaying[details.tabId].title = tab.title;
                            }

                            if (tab && vdl.urlPlaying[details.tabId]) {
                                if (Video.scanHtmlForVideos(details.tabId, details.js_dictate, callback, details.org_link)) {
                                    return true;
                                }
                            }
                        } else {
                            //Response result to callback function
                            callback({
                                videoUrls: vdl.urllist[details.tabId]
                            });
                        }
                    });

                    return true;
                }
            } else if (details.msg == "ON_DOWNLOAD_LINK") {
                chrome.downloads.download({
                    url: details.link,
                    filename: details.filename,
                    method: "GET"
                }, function(response) {});
            } else if (details.msg == "ON_DOWNLOAD_DASH_CONTENT") {
                var download_manager = new DownloadManager();
                download_manager.setItem({link: details.audio_link, filename: details.audio_title},
                                        {link: details.video_link, filename: details.video_title});
                download_list.push(download_manager);
                download_manager.startDownload();
            } else if(details.msg == "MSG_RESET_STORAGE_FOR_URL") {
                var tabid = sender.tab.id;
                chrome.tabs.get(tabid, function(tab) {
                    if (tab) {
                        var preKey = GetPreKey(tab.url);
                        localStorage.removeItem(preKey);
                    }
                });
            // VanDD add this : Pin video
            } else if (details.msg == "ON_DETACH_VIDEO") {
                var left_ = screen.availWidth - details.videoWid;
                var windowOptions = {
                    setDetachTab: true,
                    width: details.videoWid,
                    height: details.videoHei + 33,
                    type: "normal",
                    left: left_,
                    top: 0,
                    tabId: details.tabId
                }
                callback({tabId: details.tabId });
                chrome.windows.create(windowOptions, function () {
                    // body...
                })
            }
        }
    },

    setupContextMenu: function(argument) {

        chrome.contextMenus.removeAll();

        //Add context menu in selected page
        chrome.contextMenus.create({
            title: "Download with Tải nhạc",
            contexts: ["page", "link"],
            onclick: function(info, tab) {
                BKAVMessageHandler.context_onclick(info, tab);
            },
            documentUrlPatterns: "http://www.youtube.com/* https://www.youtube.com/* http://m.youtube.com/* https://m.youtube.com/* http://vimeo.com/* https://vimeo.com/* http://www.facebook.com/video/* https://www.facebook.com/video/* http://www.facebook.com/photo.php?v=* https://www.facebook.com/photo.php?v=* http://play.spotify.com/* https://play.spotify.com/*".split(" "),
            targetUrlPatterns: ["http://vimeo.com/*", "https://vimeo.com/*"]
        });

        //Add context menu in selected link
        chrome.contextMenus.create({
            title: "Download with Tải nhạc",
            contexts: ["link"],
            onclick: function(info, tab) {
                BKAVMessageHandler.context_onclick(info, tab);
            },
            targetUrlPatterns: "http://vimeo.com/* https://vimeo.com/* http://www.facebook.com/video/video.php?v=* https://www.facebook.com/video/video.php?v=* http://www.facebook.com/photo.php?v=* https://www.facebook.com/photo.php?v=* http://www.youtube.com/watch?v=* https://www.youtube.com/watch?v=*".split(" ")
        });
    },

    context_onclick: function(info, tab) {
        var url = vdl.urllist[tab.id][0].url;
        var filename = vdl.urllist[tab.id][0].title;
        if (url != NaN) {
            BKAVMessageHandler.download_from_context_menu(url, filename);
        }
    },

    //get the fisrt link
    find_download_url: function(url, id) {
        chrome.extension.sendMessage({
                msg: "ON_QUERY_VIDEO_URLS",
                tabId: id
            },
            //callback function
            function(response) {
                return response.videoUrls[0];
            });
    },

    download_from_context_menu: function(url_, filename_) {
        chrome.downloads.download({
            url: url_,
            filename: filename_
        }, function(response) {});
    },
};

chrome.extension.onMessage.addListener(BKAVMessageHandler.StartPage.onMessage);
chrome.runtime.onInstalled.addListener(function(a) {
    //Clear out all storage for experiment version
    localStorage.clear();
}),

chrome.downloads.onChanged.addListener(function(item) {
  if (!item.state || (item.state.current != 'complete')) {
    return;
  }

  for (var i in download_list) {
    if (download_list[i].is_finish(item.id) == true) {
        download_list[i].combineStream();
        download_list.splice(i, 1);
        break;
    }
  }
});

var DownloadManager = function() {
    this.audio_id = "";
    this.video_id = "";
    this.audioItem = {};
    this.videoItem = {};
    this.audio_finish = false;
    this.video_finish = false;
};

DownloadManager.prototype = {
    constructor: DownloadManager,
    getAudioItem: function() {
        return this.videoItem;
    },
    getVideoItem: function() {
        return this.videoItem;
    },
    setItem: function(audio, video) {
        this.audioItem = audio;
        this.videoItem = video;
    },
    startDownload: function() {
        // To persistance download file, first we must be complete download audio and video first
        var _this = this;
        chrome.downloads.download({
            url: _this.audioItem.link,
            filename: _this.audioItem.filename,
            method: "GET",
            body: "combine_stream",
        }, function(id) {
            _this.audio_id = id;
            // Continue download video file
            console.log("on response for video");
            chrome.downloads.download({
            url: _this.videoItem.link,
            filename: _this.videoItem.filename,
            method: "GET",
            body: "Audio_Id: " + id,
            }, function(id) {
                _this.video_id = id;
            })
        });
    },

    is_finish: function(id) {
        if (id == this.audio_id)
            this.audio_finish = true;
        else if (id == this.video_id)
            this.video_finish = true;
        if (this.audio_finish && this.video_finish) {
            return true;
        }

        return false;
    },

    combineStream: function() {
        // Combine stream to get complete file
        chrome.bkavCombineDashStream.CombineStream(
            this.audio_id.toString(), //this.audioItem.filename,
            this.video_id.toString(), //this.videoItem.filename,
            function() {
                console.log('Finish');
            });
    }
};

var download_list = [];
