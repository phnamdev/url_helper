// Global
//==============================================================================
var timerOn, timerOff;
var url_page = location + "";
var jq = jQuery;
var jqBody;
var tab_id = false;
var has_yt_link = false;
var is_show_panel = false;
var is_force_close = false;
var float_panel;
var pTop = 0, pLeft = 0, pWidth = 0, pHeight = 0;
var youTubeLinks = false;
var old_panel_id = "";

var video_pin = false;
// VanDD : 
var youtube_player_id = false;
var is_channel = false;
// Setup
//==============================================================================
(function($) {
    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);

jq(function() {
    jqBody = jq("body");
    console.log("TEST");

    setup_youtube(), jqBody.click(function() {
        // VanDD : Check if change video
        if (url_page != location.href) { ResetInfo();}
        setTimeout(function() {
            jqBody.hasClass("yt_setup_done") || setup_youtube();
        }, 1500);
    })
});

function checkMouseHover() {
    //var hiden_panel = jq('.html5-main-video');
    var hiden_panel = jq('.html5-video-container');
    if (hiden_panel == "undefined")
        return false;

    var offset = hiden_panel.offset();
    pTop = offset.top;
    pLeft = offset.left;
    pWidth = hiden_panel.width();
    pHeight = hiden_panel.height();
    if (pHeight <= 0)
       pHeight = hiden_panel.prop('scrollHeight');

    // Kiem tra xem chuot thuc su di chuyen vao main player
    if ( event.x > pLeft && event.x < pLeft + pWidth
         && event.y > (pTop - scrollY) && event.y < pTop + pHeight)
        return true;

    return false;
}

//Them su kien youtube hover de jQuery goi lai
(function(a) {
    var check_is_first = true;
    a.fn.YoutubeHover = function(b) {
        moveIn = function() {
            if (!is_show_panel && is_force_close) {
                return true;
            }

            if (checkMouseHover()) {
                event.stopPropagation();
                // VanDD
                if (youTubeLinks == false) {
                  InitInfo();
                }
                showFloatPanel();
                check_is_first = false;
                return false;
            }
        };
        moveOut = function() {
            if (is_show_panel && checkMouseHover())
                return true;

            event.stopPropagation();

            if (check_is_first == false) {
                closePanel();
                is_force_close = false;
                return false;
            }
        };

        a(this).mouseenter(function() {
            moveIn();
        });

        a(this).mouseleave(function() {
            moveOut();
        });
    };

})(jQuery);

// Cai dat youtube
function setup_youtube() {
    // VanDD : unpin video 
    chrome.runtime.onMessage.addListener(onAttachedPin);

    // [13/6/2018 VanDD] : Them kich ban tren channel/user hoac 1 so youtubepage khac
    if (location.href.indexOf('/watch?v=') == -1) {
        youtube_player_id = '#c4-player';
        is_channel = true;
    } else {
        youtube_player_id = '#movie_player';
    }
    
    if(jq(youtube_player_id).length <= 0) {
        return;
    }

    setup_yt_hover();
    InitInfo();
    watch_detail();
    setupMainPlayerHover();
    playlist_sidebar();
    add_to_playlist_page();
    setup_yt_hover();

    //Thiet lap co (class) gan vao body
    jqBody.addClass("yt_setup_done");
}

//Them float panel vao trinh xem media
function setup_yt_hover() {
    jq(".html5-video-container").YoutubeHover();
}

// Them vao sau |.playlist-play-all|, khi click chuot vao se hien thi float panel
function add_to_playlist_page() {
    var a = '<a href="#" class="yt-uix-button yt-uix-button-default" style="margin-left:5px;"><img src="' + chrome.extension.getURL("/images/logo19.png") + '" alt="URL Helper" title="URL Helper" />' +
        ' <span class="yt-uix-button-content">URL Helper</span></a>',
        a = jq(a);
    a.click(function() {
        showFloatPanel(a);
        return !1;
    });
    jq(".playlist-actions .playlist-play-all").after(a);
}

// Them vao truoc nut |.ytp-settings-button|, khi click chuot vao se gui link
// de hien thi |float panel|
function add_to_main_player() {
    var a = '<span class="yt-uix-button-content">' +
        '<img class="panel-image" src="' + chrome.extension.getURL("/images/logo19_embed.png") + '" alt="URL Helper" title="URL Helper" />' +
        '</span>';
    a = jq(a);

    a.click(function() {
        var link = jq(this).parents("a").attr("href");
        showFloatPanel(a, link);
        return !1;
    });

    jq(".ytp-settings-button").before(a);
}

// Them mot nut |Download with URL Helper| vao truoc |.addto-watch-later-button|
function after_watchlater() {
    var a = '<button type="button" class="addto-button video-actions spf-nolink yt-uix-button yt-uix-button-default yt-uix-button-short yt-uix-tooltip" title="Download with URL Helper" data-video-ids="_l9IdwJQ7l4" role="button" data-tooltip-text="Download with URL Helper" style="margin-right:25px;"><span class="yt-uix-button-content"><img src="' + chrome.extension.getURL("/images/logo19.png") + '" title="Download with URL Helper" /></span></button>',
        a = jq(a);
    jq(".addto-watch-later-button, .addto-watch-later-button-sign-in").before(a);
}

// Cai dat nut hien thi float panel khi main player hover vao truoc
// |.html5-main-video|
function setupMainPlayerHover() {
    var image_path = chrome.extension.getURL("/images/logo19.png");
    var hover = jq('<button id="watch7-playlist-bar-urlhelper" title="URL Helper"' +
        'class="yt-uix-tooltip yt-uix-button-toggled yt-uix-button yt-uix-tooltip yt-uix-button-empty"' +
        'type="button" data-button-toggle="true" role="button" data-tooltip-text="URL Helper"' +
        'style="margin-right:10px;"><span class="yt-uix-button-icon-wrapper">' +
        '<img src="' + image_path + '" title="URL Helper" /> URL Helper</span></button>');

    hover.click(function() {
        showFloatPanel(location + "");
        return !1;
    });
    jq(".video-stream .html5-main-video").before(hover);
}

// Them nut hien thi float panel tai thanh ben vao truoc
// |#watch7-playlist-bar-autoplay-button|
function playlist_sidebar() {
    var image_path = chrome.extension.getURL("/images/logo19.png");

    var hover = jq('<button id="watch7-playlist-bar-miniplayer" title="URL Helper"' +
        'class="yt-uix-tooltip yt-uix-button-toggled yt-uix-button yt-uix-tooltip yt-uix-button-empty"' +
        'type="button" data-button-toggle="true" role="button" data-tooltip-text="URL Helper"' +
        'style="margin-right:10px;"><span class="yt-uix-button-icon-wrapper">' +
        '<img src="' + image_path + '" title="URL Helper" /> URL Helper</span></button>');

    hover.click(function() {
        showFloatPanel(location + "");
        return !1;
    });
    jq("#watch7-playlist-bar-autoplay-button").before(hover);
}

// Them nut hien thi float panel vao sau |#watch-like-dislike-buttons|
function watch_detail() {
    //Create button
    var a = '<button type="button" class="yt-uix-button yt-uix-button-text yt-uix-tooltip"' +
        'id="yt_loading_panel" title="URL Helper" data-button-toggle="true" data-orientation="vertical"' +
        'data-position="bottomright" role="button" data-tooltip="URL Helper"' +
        'data-tooltip-title="URL Helper"data-tooltip-text="URL Helper">' +
        '<span class="yt-uix-button-content">Đang tìm kiếm link tải xuống ...</span></button>';

    a = jq(a);

    a.click(function() {
        showFloatPanel(a, !0);
        return !1;
    });

    jq("#watch-like-dislike-buttons").after(a);
}

// VanDD : reset for new session
function ResetInfo() {
    jqBody.removeClass("yt_setup_done");
    has_yt_link = false;
    pTop = 0, pLeft = 0, pWidth = 0, pHeight = 0;
    youTubeLinks = false;
    url_page = location.href;
    video_pin = false;
    //old_panel_id = "";
}
// End VanDD

// Khoi tao thong tin
function InitInfo() {
    has_yt_link = false;
    var dictation_data = jq(youtube_player_id).attr('data-version');
    if (dictation_data.indexOf('s.ytimg.com') == -1)
        dictation_data = 's.ytimg.com/' + dictation_data;
    var watch_link = is_channel ? jq(".ytp-title-link")[0].href : location.href;
    chrome.extension.sendMessage({
        msg: "ON_QUERY_VIDEO_URLS",
        tabId: tab_id,
        js_dictate: dictation_data == undefined ? '' : 'http:' + dictation_data,
        org_link: watch_link
    },

    //callback function
    function(response) {
        youTubeLinks = response.videoUrls;
        if (youTubeLinks.length > 0) {
            has_yt_link = true;
            setupFloatPanel();
            return;
        }
    });
}

// Create float panel
function setupFloatPanel() {
    if (!has_yt_link) {
        return;
    }

    formatBytes = function(len) {
        var mb = Math.floor(len/1024/1024);
        return mb + "MB";
    }

    showPopupContent = function() {
        jq("#popup_list_download_item").css("height", youTubeLinks.length*30+"px");

        if(jq("#popup_list_download_item").hasClass("panel_show") == true) {
            jq("#popup_list_download_item").removeClass("panel_show");
            jq(".ytp-top-menu-container").removeClass("ytp-top-menu-container-extend");
        } else {
            jq("#popup_list_download_item").addClass("panel_show");
            jq(".ytp-top-menu-container").addClass("ytp-top-menu-container-extend");
        }
    }

    var d = new Date();
    var n = d.getTime();

    var found_link = document.getElementById('yt_loading_panel');
    if(found_link != null)
        found_link.textContent = 'Đã tìm thấy link tải!';
    a = chrome.extension.getURL("css_ext.css");
    // Tobe sure to remove old css node
    var ext_css = jq('<link rel="stylesheet" type="text/css" href="' + a + '" >');
    if (ext_css)
        ext_css.remove();
    jq('<link rel="stylesheet" type="text/css" href="' + a + '" >').appendTo("head");

    var current_panel_id = 'URLHelperPanel_'+n;
    var current_panel_header_title = 'header_title'+n;

    if (old_panel_id == 0)
        old_panel_id = current_panel_id;

    var float_panel_html = '<div name = "URLHelperPanel" id="' + current_panel_id + '" class="url_helper_panel ytp-top-menu-container html5-stop-propagation">'
    + '<div class="download_button_panel">'
    +   '<img class="header_icon" id = "download_yt_video_button" src="' + chrome.extension.getURL("/images/icon_download.png")+'" />'
    +   '<div class="header_title" id="' + current_panel_header_title + '">Tải xuống video</div>'
    +   '<div id="pinVideoHelper" class="pin_padding_panel"><div class="pin_button_panel"></div></div>'
    +   '<div id="closeUrlHelperPanel" class="close_padding_panel"><div class="close_button_panel"></div></div>'
    +   '<div id="popup_list_download_item">';

    var file_title, file_name, file_url ;
    float_panel_html =  float_panel_html + '<ul class="ul_download_list_item">';
    for(var i = 0; i < youTubeLinks.length; i++) {
        // Cat doan "- Youtube" trong link
        if(youTubeLinks[i].title.indexOf('- YouTube') != -1) {
            file_title = youTubeLinks[i].title.substr(0, youTubeLinks[i].title.length - 10);
        } else if (jq("#eow-title") != null) {
            file_title = jq("#eow-title").text().trim();
            if(file_title.indexOf('.') == file_title.length - 1)
               file_title =  file_title.substr(0, file_title.length - 1);
            youTubeLinks[i].title = file_title;
            if(youTubeLinks[i].audioTitle != undefined)
                youTubeLinks[i].audioTitle = file_title;
        } else {
            file_title = 'YouTube-Video';
            youTubeLinks[i].title = youTubeLinks[i].audioTitle = file_title;
        }

        file_name = cutStringTitle(file_title, 0, 36/*40*/) + '.' + formatMime(youTubeLinks[i].mime);
        float_panel_html += '<li id="item_' + n + '_' + i + '">';
            float_panel_html += '<div class="item_title">';
            float_panel_html += file_name + ' - ' + youTubeLinks[i].res;
            float_panel_html += '</div>';

        float_panel_html += '</li><!--End .item_' + i + ' -->';
    }
    float_panel_html = float_panel_html + '</ul><!--End .ul_download_list_item-->';

    float_panel_html = float_panel_html + '</div><!--End #popup_list_download_item-->'
        + '</div><!--End .download_button_panel-->'
        + '</div><!--End .ytp-top-menu-container-->';

    jq("#closeUrlHelperPanel").live('click', function(event) {    
        event.stopPropagation();
        is_force_close = true;
        closePanel();

        if(jq("#popup_list_download_item").hasClass("panel_show") == true) {
            jq("#popup_list_download_item").removeClass("panel_show");
            jq(".ytp-top-menu-container").removeClass("ytp-top-menu-container-extend");
        }

        return true;
    });
    //jq("#pinVideoHelper").off();
    // [19/4/2018 VanDD] : pinvideo
    jq(document).off("click", "#pinVideoHelper").on("click", "#pinVideoHelper", function(event) {
        var tmp = jq(".html5-main-video");
        var watch_link = is_channel ? jq(".ytp-title-link")[0].href : location.href;
        var yt_id = watch_link.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);

        var node = $(".html5-video-player")[0];
        var i = "https://www.youtube";
        i += ".com/embed/" + yt_id[1] + "?showinfo=0&autohide=1&enablejsapi=1";
        var video = closest(node, "video");
        // video.length && (video = video[0], video.currentTime > 0 && (i += "&start=" + Math.floor(video.currentTime)), video.ended || (i += "&autoplay=0"), video.pause()),
        //     document.body.style.overflow = "hidden", document.documentElement.style.overflow = "hidden";
        if (video.length) {
            video = video[0];
            if (video.currentTime > 0) {
              i += "&start=" + Math.floor(video.currentTime);
              video.paused || (i += "&autoplay=1"), video.pause();
            }
        }
        document.body.style.overflow = "hidden", document.documentElement.style.overflow = "hidden";
        var frame = document.createElement("iframe");
        frame.src = i;
        frame.setAttribute("allowfullscreen", !0);
        frame.style.position = "fixed";
        frame.style.left = "-2px";
        //frame.style.right = "0px";
        frame.style.top = "-2px";
        //frame.style.bottom = "0px";
        frame.style.width = "100%";
        frame.style.height = "100%";
        frame.style.zIndex = 10000;
        frame.id = "id_pin_video_frame";

        document.body.hidden = true;
        setTimeout(function () {
            document.body.hidden = false;
        }, 1000);

        var o = document.body.children[0];
        o ? document.body.insertBefore(frame, o) : document.body.appendChild(frame);
        var panel = jq("#" + old_panel_id);
        jq("#id_pin_video_frame").before(panel);
        jq("#pinVideoHelper").hide();
        setTimeout(function () {
            chrome.extension.sendMessage({
                msg: "ON_DETACH_VIDEO",
                tabId: tab_id,
                videoWid: 640,//video.videoWidth,
                videoHei: 360,//video.videoHeight,
                org_link: location.href
            },

            //callback function
            function(response) {
                tab_id = response.tabId;
                video_pin = true;
            })
        }, 1);
        $(document).mouseenter(function (event) {
            showFloatPanel();
        });
        $(document).mouseleave(function (event) {
            closePanel();
        });
        //return true;
    });
    // End of comment

    if (youTubeLinks.length > 0) {
        jq('#'+current_panel_header_title).live('click', function(event){
            event.stopPropagation();
            showPopupContent();
        });
        // Same as for download buttong
        jq('#download_yt_video_button').live('click', function(event) {
            event.stopPropagation();
            showPopupContent();
        });
    }
    // Insert to current page
    var hiden_panel = jq(float_panel_html);
    if (jq(".ytp-settings-button").length > 0)
        jq(".ytp-settings-button").before(hiden_panel);
    else
        jq(".watch-content").append(hiden_panel);

    // Bind event
    var li_item, file_url, root_title;
    for(i = 0; i < youTubeLinks.length; i++) {
        file_url  = youTubeLinks[i].url;
        root_title = youTubeLinks[i].title + '.' + formatMime(youTubeLinks[i].mime);
        li_item = document.getElementById("item_" + n + "_" + i + "");
        if(li_item) {
            li_item.yt_link = file_url;
            li_item.yt_title = root_title;
            if(youTubeLinks[i].audioUrl != undefined) {
                li_item.yt_audio = youTubeLinks[i].audioUrl;
                li_item.yt_title = youTubeLinks[i].title + ' ' + youTubeLinks[i].res
                                  + '.' + formatMime(youTubeLinks[i].mime);
                li_item.yt_audio_title = youTubeLinks[i].audioTitle + '.' + formatMime(youTubeLinks[i].audioMime);
            }
            li_item.addEventListener('click', function(event) {
                event.stopPropagation();
                closePanel();
                // If video in High quality Video format, add extra audio extractor
                if(event.currentTarget.yt_audio != undefined) {
                    saveAndCombineFile(event.currentTarget.yt_audio_title, event.currentTarget.yt_audio,
                        event.currentTarget.yt_title, event.currentTarget.yt_link);
                } else {
                    saveFile(event.currentTarget.yt_title, event.currentTarget.yt_link);
                }
            });
        }
    }

    if (old_panel_id != current_panel_id) {
        jq('#'+old_panel_id).remove();
        old_panel_id = current_panel_id;
    }

    MoveFloatPanel();
}

function closest(e, t) {
    return e.matches(t) ? [e] : queryAll(t, e);
}

function queryAll(e, t) {
    return t = t || document, toArray(t.querySelectorAll(e));
}

function toArray(e) {
    return Array.prototype.slice.call(e);
}

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
}

// Hien thi float panel
function showFloatPanel(obj, link) {
    if (youTubeLinks !== false) {
        is_show_panel = true;
        var position = "";
        if (video_pin) {
            position = "position : fixed;";
            position += "z-index : 10001;";
        }
        jq("div[name='URLHelperPanel']").attr("style", "display: block;" + position);
        jq("div[name='URLHelperPanel']").attr("aria-hidden", "true");
        if(jq("#popup_list_download_item").hasClass("panel_show") == true) {
            jq("#popup_list_download_item").removeClass("panel_show");
            jq(".ytp-top-menu-container").removeClass("ytp-top-menu-container-extend");
        }
        MoveFloatPanel();
    }
}

// Dong float panel
function closePanel() {
    is_show_panel = false;
    jq("div[name='URLHelperPanel']").attr("style", "display: none;");
    jq("div[name='URLHelperPanel']").attr("aria-hidden", "false");
    if (jq("#popup_list_download_item").hasClass("panel_show") == true) {
        jq("#popup_list_download_item").removeClass("panel_show");
        jq(".ytp-top-menu-container").removeClass("ytp-top-menu-container-extend");
    }
}

// Save download file
function saveFile(filename, link) {
    chrome.extension.sendMessage({
        msg: "ON_DOWNLOAD_LINK",
        link: decodeURIComponent(link),
        filename: NormalizeFileName(filename)
    });
}

// ThangLVb
function saveAndCombineFile(audio_title, link_audio, video_title, link_video) {
    chrome.extension.sendMessage({
        msg: "ON_DOWNLOAD_DASH_CONTENT",
        audio_link: decodeURIComponent(link_audio),
        video_link: decodeURIComponent(link_video),
        audio_title: NormalizeFileName(audio_title, true),
        video_title: NormalizeFileName(video_title, true)
    });
}
// End

// Set location for float panel
function MoveFloatPanel() {
    if (video_pin) {
       jq(".url_helper_panel").css("top", "7px");
       return;
    }
    var height = jq(".html5-video-container").height();
    if (height <= 0) {
        height = jq(".html5-video-container").prop('scrollHeight');
        jq(".url_helper_panel").css("top", "-" + (height - 50) + "px");
    } else {
        jq(".url_helper_panel").css("top", "-" + (height - 10) + "px");
    }
}

// [19/4/2018 VanDD] Set Unpin video
function onAttachedPin(message) {
    if (message.msg == "ON_RESTORE_PIN" && message.tabid == tab_id && message.status == "restore") {
        if (video_pin) {
            var pinVideo = jq('#id_pin_video_frame')[0].contentDocument.querySelector("video");
            var realVideo = document.querySelector("video");
            realVideo.currentTime = pinVideo.currentTime - 1;
            var paused = pinVideo.paused;
            jq('#id_pin_video_frame').remove();
            var panel = jq("#" + old_panel_id);
            if (jq(".ytp-settings-button").length > 0)
                jq(".ytp-settings-button").before(panel);
            else
                jq(".watch-content").append(panel);
            jq("#pinVideoHelper").show();
            document.body.style.overflow = "visible", document.documentElement.style.overflow = "visible";
            if (!paused)
                realVideo.play();
            video_pin = false;
            // cleanup mouse event
            $(document).off('mouseenter');
            $(document).off('mouseleave');
        }
    }
}