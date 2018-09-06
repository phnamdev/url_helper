//////////////
var jq = jQuery;

var tab_id = false;
var pin_id = false; // id of element we detach
var video_pin = false; // on pin mode or not
var save_style = false;
var save_size = false;
var maybe_hls_ = false;

var is_already_has_video = false;

var change_id = false; // We fake element_id to avoid page resize it
// Page contain video in uncommon rule
var fixed_item = false;

// Video download panel
var is_force_close = false;
var youTubeLinks = false;

// Ds video tren trang
var list_video = [];

var current_href = location.href;
var can_reset_panel_ = false;

var retry_query_time = 0;

var fullsize_style_id = "fullsize_style_id";

var video_controls_default = false;

var pinvideo_fixed_list = [{
    "domain": "hdonline.vn",
    "query": "#hdoplayer",
    "ad_plugin": "#video-vplugin"
}, {
    "domain": "dailymotion.com",
    "query": ".Player__player___wX05I",
}, {
    "domain": "beta-video.vnexpress",
    "query": "#player_scroll"
}, {
    "domain": "vnexpress.net",
    "query": "#block_video_html5",
}, {
    "domain": "vtv.vn/video",
    "query": ".VCSortableInPreviewMode",
    "type": "VideoStream"
}, {
    "domain": "dantri.com",
    "query": ".VCSortableInPreviewMode",
    "type": "VideoStream"
}, {
    "domain": "mp3.zing.vn/",
    //"query" : ".zcontainer.pointer-enabled"
    "query": "#zplayerjs-wrapper :first",
    "might_change": true
}];
// 

jq(function() {
    // Them kich ban cho yt embedded sd iframe
    setTimeout(function() {
        var embed_iframes = $('iframe');
        console.log("test");
        var embed_items = [];
        for (var i = 0; i < embed_iframes.length; i++) {
            if (embed_iframes[i].src.indexOf(".youtube.com/embed") != -1 ||
                embed_iframes[i].src.indexOf("videoembed") != -1 || embed_iframes[i].src.indexOf("/embed/") != -1) {
                if (embed_iframes[i].src.split('/')[2].indexOf(location.host) != -1) {
                    if (!embed_iframes[i].contentDocument.querySelector("video"))
                        continue;
                }
                if (!embed_iframes[i].id)
                    embed_iframes[i].id = "id_" +
                    embed_iframes[i].src.substr(embed_iframes[i].src.lastIndexOf("/") + 1, embed_iframes[i].src.length);
                embed_items.push({
                    query: "#" + embed_iframes[i].id
                });
            }
        }
        for (var i = 0; i < embed_items.length; i++) {
            CreateFixedHover(embed_items[i]);
        }
    }, 3000);

    for (var i = 0; i < pinvideo_fixed_list.length; i++) {
        if (location.hostname.indexOf(pinvideo_fixed_list[i].domain) != -1 ||
            location.href.indexOf(pinvideo_fixed_list[i].domain) != -1) {
            fixed_item = pinvideo_fixed_list[i];
            setTimeout(function() {
                CreateFixedHover(pinvideo_fixed_list[i]);
            }, 3000);
            return;
        }
    }

    if (jq("video")[0] == undefined) {
        setTimeout(function() {
            CreateHover();
        }, 3000);
    } else {
        var videos = jq("video");
        for (var i = 0; i < videos.length; i++) {
            var this_video = jq(videos[i]);
            //if (!this_video[0].id) {
            var this_video = GetParentTag(this_video);
            //}
            this_video.videoHover();
            PreCreatePinItem(this_video);
        }
    }
});

// VanDD
document.addEventListener("DOMContentLoaded", function() {
    chrome.runtime.onMessage.addListener(onAttachedPinVideo);
});

function PreCreatePinItem(videos) {
    if (videos[0] == undefined) {
        if (videos.id == "") {
            if (videos.tagName == "VIDEO")
                videos = GetParentTag(videos)
            else
                return;
        }
        var div = create_pin_div(videos);
        videos.before(div);
        HandleDetachClick(div);
        return;
    }

    for (var i = 0; i < videos.length; i++) {
        if (videos.id == "" || !videos[0].id) {
            if (videos[0].tagName == "VIDEO")
                videos = GetParentTag(videos)
            else
                continue;
        }
        var div = create_pin_div(videos[i]);
        videos[i].before(div);
        HandleDetachClick(div);
    }
}

function PinTabToPanel(w, h) {
    // body...
    setTimeout(function() {
        chrome.extension.sendMessage({
                msg: "ON_DETACH_VIDEO",
                tabId: tab_id,
                videoWid: w,
                videoHei: h,
                org_link: location.href,
                pinId: pin_id
            },
            //callback function
            function(response) {
                tab_id = response.tabId;
                SetVideoAsFullSize();
            })
    }, 1);
}

function SetVideoAsFullSize() {
    var sheet = document.createElement('style')
    sheet.id = fullsize_style_id;
    sheet.innerHTML = "#" + pin_id + " {width: 100% !important; height: 100% !important; position: fixed;}";
    document.body.appendChild(sheet);
}

// [19/4/2018 VanDD] Set Unpin video
function onAttachedPinVideo(message) {
    //console.log(message);
    if ((maybe_hls_ || HLSSite()) && !video_pin && !pin_id) {
        var reg_hls = /hls\.mediacdn\.vn\/(vtv|kenh14|afamily|gamek|sohanews|dantri)\/\S+\.mp4\//;
        if (reg_hls.test(message.playlist)) {
            DetectFrameToDetach(message.playlist);
        } else {
            // co the trang bay h moi attach the video.
            if (!is_already_has_video)
                CreateHover();
        }
        return;
    }
    if (message.msg == "ON_RESTORE_PIN" && message.tabid == tab_id && pin_id && message.status == "restore") {
        if (video_pin) {
            var tmp = document.body.children;
            document.body.hidden = false;
            document.body.style.overflow = "visible", document.documentElement.style.overflow = "visible";
            var video_container = jq('#' + pin_id);
            if (video_container[0].tagName == "IMG")
                video_container = jq('div[id=' + pin_id + ']');

            if (change_id) {
                video_container[0].id = change_id;
                pin_id = change_id;
            }
            var video = video_container[0].tagName == "VIDEO" ? video_container : video_container.find("video");
            if (!video[0] && video_container[0].tagName == "IFRAME" &&
                video_container[0].src.split('/')[2].indexOf(location.host) != -1)
                video = jq(video_container[0].contentDocument.querySelector("video"));

            var is_playing = video && video[0] && !video[0].paused;
            var time = video && video[0] && !video[0].currentTime;
            jq("#pinVideoId").replaceWith(video_container);
            if (is_playing)
                video[0].play();
            if (time)
                video[0].currentTime = time;
            if (save_style) {
                video_container[0].style.top = save_style.top;
                video_container[0].style.left = save_style.left;
                video_container[0].style.right = save_style.right;
                video_container[0].style.bottom = save_style.bottom;
                video_container[0].style.width = save_style.width;
                video_container[0].style.height = save_style.height;
                video_container[0].style.position = save_style.pos;
                video_container[0].style.background = "";
            }
            if (!HLSSite()) {
                jq("body")[0].style.position = "";
            }
            if (list_video[pin_id]) {
                jq("#pin" + pin_id).show();
            }
            var id_to_remove = pin_id;
            video_pin = false;
            pin_id = false;
            change_id = false;
            setTimeout(function() {
                if (jq("#" + id_to_remove).height() == 0)
                    jq("#" + id_to_remove).parent().parent().attr('style', "height : \"\"");
            }, 100);
            jq("#" + id_to_remove)[0].scrollIntoView();
            if (HLSSite()) {
                jq("#" + id_to_remove).children()[0].style.height = "";
                if (save_size) {
                    var width = 'width:' + save_size.width;
                    var height = 'height' + save_size.height;
                    jq("#" + id_to_remove).find("video").parent().attr('style', width);
                    jq("#" + id_to_remove).find("video").parent().attr('style', height);
                }
                /*setTimeout(function() {
                  if (jq('#pin'+id_to_remove).prev()[0].id.match(0, id_to_remove.length - 10))
                    jq('#pin'+id_to_remove).prev().remove();
                    //jq('[id^='+id_to_remove+']')[0].remove();
                }, 1000);*/
            }
            save_size = false;
            document.getElementById(fullsize_style_id).remove();
        } else {
        }
    }
}

function CreateHover() {
    var this_video;
    if (!fixed_item) {
        this_video = jq("video");
        // Add check cho 1so trang bao co video hls
        if (this_video[0] == undefined) {
            maybe_hls_ = true;
            if (!is_already_has_video && retry_query_time <= 3)
                setTimeout(function() {
                    retry_query_time += 1;
                    CreateHover();
                }, 2000);
            return;
        }

        if (HLSSite()) {
            for (var i = 0; i < this_video.length; i++) {
                var id = this_video[i].id;
                var par_id;
                if (this_video[i].parentElement.parentElement.clientWidth > 2 * this_video[i].width ||
                    this_video[i].parentElement.parentElement.clientHeight > 2 * this_video[i].height) {
                    par_id = this_video[i].parentElement.id;
                    if (!par_id)
                        this_video[i].parentElement.id = id + "_parent";
                    par_id = this_video[i].parentElement.id;
                } else {
                    this_video[i].parentElement.parentElement.id = id + "_parent";
                    par_id = id + "_parent";
                }
                var this_video_ = jq("#" + par_id);
                this_video_.videoHover();
                PreCreatePinItem(this_video_);
            }
            return;
        }
    } else {
        this_video = jq(fixed_item.query);
    }

    for (var i = 0; i < this_video.length; i++) {
        this_video[i] = GetParentTag(jq(this_video[i]));
        jq(this_video[i]).videoHover();
    }
    PreCreatePinItem(this_video);
}

(function(a) {
    var check_is_first = true;
    a.fn.videoHover = function(b) {
        is_already_has_video = true;
        queryVideoFromStorage(this[0].id);

        moveIn = function(video_id) {
            queryVideoFromStorage(video_id);

            if (!is_force_close && list_video[video_id]) {
                showFloatPanel(video_id);
                if (!video_pin)
                    jq("#pin" + video_id).show();
                else
                    jq("#pin" + video_id).hide();
                MoveFloatPanel(video_id);
            }
            if (video_pin || AdsPlaying())
                return;

            if (!list_video[video_id]) {
                var div = jq("#pin" + video_id);
                if (!div.length) return;
                var video = jq("#" + video_id);
                div[0].style.top = video[0].offsetTop + "px";
                div[0].style.left = video[0].offsetLeft + "px";
                if (div.width() > 20 || div.height() > 20)
                    div.parent().removeClass("player");
                div.show();
            }
        };
        moveOut = function(video_id) {
            console.log("out");
            var video = jq("#" + video_id);
            if (video[0].tagName == "IMG")
                video = jq('div[id=' + video_id + ']');

            // Check if mouse realy out the video range
            var offsetLeft = video.offset().left,
                offsetTop = video.offset().top;
            if (video.offsetLeft == 0) offsetLeft = video.parentElement.offsetLeft;
            if (video.offsetTop == 0) offsetTop = video.parentElement.offsetTop;

            var w = video.width() > 0 ? video.width() : video.innerWidth(),
                h = video.height() > 0 ? video.height() : video.innerHeight();
            if (event.pageX < offsetLeft || event.pageX > offsetLeft + w ||
                event.pageY < offsetTop || event.pageY > offsetTop + h) {
                jq("#pin" + video_id).hide();
                if (list_video[video_id])
                    closePanel(video_id);
            }
            return;
        };

        mouseClick = function(video_id) {
            // var video = jq("#" + video_id)[0];
            // video.paused ? video.play() : video.pause();
        }
        if (LostTrackSite()) {
            $(document).on({
                mouseenter: function() {
                    moveIn(this.id);
                },

                mouseleave: function() {
                    moveOut(this.id);
                }
            }, "#" + this[0].id);
        } else {
            a(this).mouseenter(function() {
                moveIn(this.id);
            });

            a(this).mouseleave(function() {
                moveOut(this.id);
            });

            a(this).click(function() {
                mouseClick(this.id);
            })
        }
    };
})(jQuery);


function AdsPlaying() {
    return (fixed_item.ad_plugin && jq(fixed_item.ad_plugin)[0].style.display != "none") ||
        jq("#preroll-player")[0] != undefined && location.host != "www.phimmoi.net";
}

function HLSSite() {
    return location.hostname.match(/dantri|kenh14|vtv|afamily|gamek|sohanews|soha.vn/);
}

function LostTrackSite() {
    return location.hostname.match(/www.yan.vn|phimbathu|hdonline|thethao247.vn|video.ngoisao.net|bilutv.com/);
}

function PageAutoResizeList() {
    return location.hostname.match(/vnexpress/);
}

function ForceParentPage(this_video) {
    if (!!this_video[0].attributes.controls) {
        if (!this_video[0].id)
            this_video[0].id = "_id_" + Date.now();
        return false;
    }
    return !HLSSite() && !fixed_item;
    return location.hostname.match(/vnexpress|eva.vn|fptplay.vn|nhaccuatui.com|video.ngoisao.net/);
}

// Các trang đã có kịch bản bắt link cụ thể
function isTrustedDomain() {
    return location.hostname.match(/mp3.zing|dailymotion.com|vimeo.com/);
}

function GetParentTag(this_video) {
    if (ForceParentPage(this_video))
        this_video = this_video.parent();

    // if (this_video[0].id)
    //     return this_video;

    while (this_video[0].id == "") {
        var tmp = this_video.parent();
        for (var i = 0; i < tmp.length; i++) {
            if (tmp[i].id == "preroll-player")
                tmp.remove();
            else
                this_video = tmp;
            if (this_video[i].id) {
                return this_video;
            }
        }
    }
    return this_video;
}

function queryVideoFromStorage(video_id) {
    if (current_href != location.href) {
        current_href = location.href;
        list_video[video_id] = false;
        can_reset_panel_ = true;
    }
    if (!list_video[video_id] && !HLSSite()) {
        // link du phong`, neu ko bat dc tren request thi` get tren element
        var link = isTrustedDomain() ? "" : GetVideoURLSrc(video_id);
        // Chưa support hiện panel cho các trang video Streamming
        if (link && link.startsWith("blob:http"))
            return;

        chrome.extension.sendMessage({
                msg: "ON_QUERY_READY_URLS",
                org_url: location.href,
                suggest_link: link
            },
            //callback function
            function processResponse(response) {
                if (list_video[video_id])
                    return;
                // Chua xuly duoc van de vi tri video tren trang)
                if (!response || !response.result || response.result.type == "HD_STREAM")
                    return;
                //youTubeLinks = response.result;
                // Assert thats video type
                var test_mime = response.result[0].mime;

                if (!test_mime || formatMime(test_mime) == "Unknown")
                    return;

                // Xử lý vấn đề 1 trang load nhiều video tại 1 element
                // thì chỉ support đúng video mới nhất thôi.
                // Chưa chuẩn lắm, tạm thời thấy chạy vẫn ổn :v
                if (response.result[0].url.length > 2)
                    response.result = [response.result[response.result.length - 1]];

                // VanDD : truong hop get link tren 1 so trang nhac, can tach rieng tung` resolution
                var links = [];
                for (var i in response.result) {
                    if (response.result[i].url[0].startsWith("blob:http"))
                        return;
                    if (response.result[i].url.length > 1) {
                        for (var j = 0; j < response.result[i].url.length; j++) {
                            links.push({
                                url: [response.result[i].url[j]],
                                mime: [response.result[i].mime[j]],
                                len: [response.result[i].len[j]],
                                resolution: response.result[i].resolution[j],
                                quality: response.result[i].quality[j],
                                title: response.result[i].title,
                                media_type: response.result[i].media_type[j],
                            });
                        }
                    } else {
                        links.push(response.result[i]);
                    }
                }
                list_video[video_id] = links;
                setupMainPlayerHover(video_id);
                closePanel(video_id);
            });
    }
}

function GetVideoURLSrc(video_id) {
    var video = jq("#" + video_id);
    if (video.length) {
        video = video[0].tagName == "VIDEO" ? video = video[0] : video.find("video")[0];
        if (video && video.tagName == "VIDEO")
            return video.currentSrc;
        video = jq('#' + video_id);
        if (video[0].tagName == "IFRAME" &&
            video[0].src.split('/')[2].indexOf(location.host) != -1)
            video = jq(video[0].contentDocument.querySelector("video"));
        if (video) {
            var url = video[0].src;
            return url ? url : video.parent()[0].src;
        }
    }
    return "";
}

function create_pin_div(video) {
    var pinbutton_id = "pin" + video.id;
    var old_pin = $("#" + pinbutton_id);
    // VanDD : this id must be unique
    if (old_pin.length > 0)
        old_pin.remove();
    var div = document.createElement("div");
    div.id = pinbutton_id;
    div.style.top = "0px";
    div.style.left = "0px";
    div.style.position = "absolute";
    div.style.zIndex = Number.MAX_SAFE_INTEGER - 1;
    div.hidden = true;
    var img = document.createElement("img");
    img.src = chrome.extension.getURL("/images/pin_video.png");
    jq(img)[0].setAttribute("style", "width : 16px !important; height: 16px !important");
    div.appendChild(img);
    return div;
}

function HandleDetachClick(div) {
    jq(document).off("click", "#" + div.id).on("click", "#" + div.id, function(event) {
        OnDetachVideo(this);
    });
}

function OnDetachVideo(this_pin) {
    if (video_pin)
        return;

    video_pin = true;
    var elemDiv = document.createElement('div');
    elemDiv.id = "pinVideoId";
    var this_video = jq("#" + this_pin.id.substring(3));
    // Using this later
    // if (this_video[0].attributes.controls)
    //     video_controls_default = true;
    // else
    //     this_video[0].setAttribute("controls", "");

    // Store this, bs size change rightafter hide content
    var w = this_video.width() > 0 ? this_video.width() : this_video.innerWidth(),
        h = this_video.height() > 0 ? this_video.height() : this_video.innerHeight();
    document.body.hidden = true;

    save_style = {
        top: this_video[0].style.top,
        left: this_video[0].style.left,
        right: this_video[0].style.right,
        bottom: this_video[0].style.bottom,
        width: this_video[0].style.width,
        height: this_video[0].style.height,
        pos: this_video[0].style.position
    };

    this_video[0].style.width = "100%";
    this_video[0].style.height = "100%";
    if (!HLSSite()) {
        jq("body")[0].style.position = "relative";
        this_video[0].style.position = "fixed";
        this_video[0].style.top = "0px";
        this_video[0].style.left = "0px";
        this_video[0].style.right = "0px";
        this_video[0].style.bottom = "0px";
        this_video[0].style.background = "black";
    }
    if (HLSSite()) {
        this_video[0].style.height = "100vh";
        this_video.children()[0].style.height = "100%";
        save_size = {
            width: this_video.find("video").parent()[0].style.width,
            height: this_video.find("video").parent()[0].style.width,
        }
        this_video.find("video").parent().attr('style', 'height: 100% !important');
        this_video.find("video").parent().attr('style', 'height: 100% !important');
    }
    pin_id = this_video[0].id;
    //this_video[0].parentElement.appendChild(elemDiv);
    this_video.before(elemDiv);
    // Move element make video stop playing
    var video = this_video[0].tagName == "VIDEO" ? this_video : this_video.find("video");
    if (!video[0] && this_video[0].tagName == "IFRAME" &&
        this_video[0].src.split('/')[2].indexOf(location.host) != -1)
      video = jq(this_video[0].contentDocument.querySelector("video"));

    var time = video && video[0] && !video[0].currentTime;
    var is_playing = video && video[0] && !video[0].paused;
    try {
        document.documentElement.append(this_video[0]);
    } catch (e) {
        document.documentElement.append(this_video[0]);
    }

    if (is_playing)
        video[0].play();
    if (time)
        video[0].currentTime = time;

    document.body.style.overflow = "hidden", document.documentElement.style.overflow = "hidden";
    if (list_video[this_video[0].id]) {
        jq("#pin" + pin_id).hide();
    }

    console.log(this_video[0].id);
    PinTabToPanel(w, h);
}

//////////////////////////////////////
// kich ban co nhieu video chay tren 1 trang (vd: kenh14.vn)
function DetectFrameToDetach(playlist_m3u8) {
    var name = location.hostname.split(".")[0]
    playlist_m3u8 = playlist_m3u8.substring(playlist_m3u8.indexOf(name + "/") + name.length + 1);
    var id = playlist_m3u8.substring(0, playlist_m3u8.indexOf("/"));
    var list_frame = jq("iframe");
    for (var i = 0; i < list_frame.length; ++i) {
        if (list_frame[i].src.indexOf(id) > 0) {
            PreCreatePinItem(list_frame[i]);
            list_frame.videoHover();
            return;
        }
    }
}
// })();

// Pinvideo theo whitelist
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function CreateFixedHover(this_element) {
    var this_video = jq(this_element.query);
    if (this_element.type && this_video.attr("type") != this_element.type)
        return;
    if (this_element.might_change && !this_video.find("video").length)
        return;
    // Check for embeded frame
    if (this_video.children().size() == 1 && this_video.children()[0].tagName == 'IFRAME') {
        if (!this_video.children()[0].id)
            this_video.children()[0].id = "video_tag_id";
        this_video = jq("#video_tag_id");
    }
    if (this_video[0] == undefined) {
        fixed_item = false;
        CreateHover();
        return;
    }
    this_video.videoHover();
    // We may query adiv without id
    if (this_video[0] && !this_video[0].id) {
        this_video[0].id = "video_tag_id";
    }
    PreCreatePinItem(this_video);
}

// VanDD : Ve lai floatbar tren cac video bat dc link download
///////////////////////////////////////////////////////////////////////////
// Media float bar
function setupMainPlayerHover(player_id_) {
    var helper_panel = jq("#URLHelperPanel_pin" + player_id_);
    if (helper_panel.length) {
        // Xử lý việc chuyển video trên cùng 1 element nhưng trang không load lại
        if (can_reset_panel_) {
            can_reset_panel_ = false;
            helper_panel.remove();
        } else
            return;
    }

    showPopupContent = function(playerid) {
        jq("#popup_list_download_item" + playerid).css("height", list_video[playerid].length * 30 + "px");

        if (jq("#popup_list_download_item" + playerid).hasClass("panel_show") == true) {
            jq("#popup_list_download_item" + playerid).removeClass("panel_show");
            //jq("#URLHelperPanel_pin" + playerid).removeClass("ytp-top-menu-container-extend");
        } else {
            jq("#popup_list_download_item" + playerid).addClass("panel_show");
            //jq("#URLHelperPanel_pin" + playerid).addClass("ytp-top-menu-container-extend");
        }
    }

    player_id = "pin" + player_id_;

    var found_link = document.getElementById('yt_loading_panel');
    if (found_link != null)
        found_link.textContent = 'Đã tìm thấy link tải!';
    var a = chrome.extension.getURL("css_ext.css");
    // Tobe sure to remove old css node
    var ext_css = jq('<link rel="stylesheet" type="text/css" href="' + a + '" >');
    if (ext_css)
        ext_css.remove();
    jq('<link rel="stylesheet" type="text/css" href="' + a + '" >').appendTo("head");

    var current_panel_id = 'URLHelperPanel_' + player_id;
    var current_panel_header_title = 'header_title_' + player_id;
    var download_button_image = 'download_video_button' + player_id_;
    var popup_list_download_item = 'popup_list_download_item' + player_id_;
    var float_panel_html = '<div name = "URLHelperPanel" id="' + current_panel_id + '" class="url_helper_panel ytp-top-menu-container html5-stop-propagation">' +
        '<div class="download_button_panel" video_id ="' + player_id_ + '">' +
        '<img class="header_icon" id = ' + download_button_image + ' src="' + chrome.extension.getURL("/images/icon_download.png") + '" />' +
        '<div class="header_title" id="' + current_panel_header_title + '">Tải xuống video</div>' +
        '<div id=' + player_id + ' class="pin_padding_panel"><div class="pin_button_panel"></div></div>' +
        '<div id="closeUrlHelperPanel" class="close_padding_panel"><div class="close_button_panel"></div></div>' +
        '<div class="popup_list_download_item" id=' + popup_list_download_item + '>';

    var file_title, file_name, file_url;
    float_panel_html = float_panel_html + '<ul class="ul_download_list_item">';
    for (var i = 0; i < list_video[player_id_].length; i++) {
        // Cat doan "- Youtube" trong link
        if (list_video[player_id_][i].title.indexOf('- YouTube') != -1) {
            file_title = list_video[player_id_][i].title.substr(0, list_video[player_id_][i].title.length - 10);
        } else {
            file_title = list_video[player_id_][i].title ? list_video[player_id_][i].title : 'video_' + i;
            if (!file_title.match(/[a-zA-Z].../)) {
                if (jq('title').length > 0 && jq("video").length == 1)
                    file_title = jq('title')[0].innerHTML;
                else
                    file_title = location.href.substring(location.host.length + 8, location.href.length - 1);
            }
            list_video[player_id_][i].title = list_video[player_id_][i].audioTitle = file_title;
        }

        var name_ = cutStringTitle(file_title, 0, 36);
        if (!name_.match("[a-zA-Z0-9]{3,}"))
            name_ = "Video Play"

        file_name = name_ + '.' + formatMime(list_video[player_id_][i].mime);
        float_panel_html += '<li id="item_' + player_id + '_' + i + '">';
        float_panel_html += '<div class="item_title">';
        if (list_video[player_id_][i].resolution)
            float_panel_html += file_name + ' - ' + list_video[player_id_][i].resolution;
        else if (list_video[player_id_][i].quality)
            float_panel_html += file_name + ' - ' + list_video[player_id_][i].quality;
        else
            float_panel_html += file_name;
        float_panel_html += '</div>';

        float_panel_html += '</li><!--End .item_' + i + ' -->';
    }
    float_panel_html = float_panel_html + '</ul><!--End .ul_download_list_item-->';

    float_panel_html = float_panel_html + '</div><!--End #popup_list_download_item-->' +
        '</div><!--End .download_button_panel-->' +
        '</div><!--End .ytp-top-menu-container-->';

    jq("#closeUrlHelperPanel").die("click").live('click', function(event) {
        event.stopPropagation();
        is_force_close = true;
        var videoid = jq(this).parent()[0].getAttribute("video_id");
        closePanel(videoid);

        if (jq("#popup_list_download_item" + videoid).hasClass("panel_show") == true) {
            jq("#popup_list_download_item" + videoid).removeClass("panel_show");
            //jq("#URLHelperPanel_pin" + videoid).removeClass("ytp-top-menu-container-extend");
        }

        return true;
    });

    jq(document).off("click", "#" + player_id).on("click", "#" + player_id, function(event) {
        event.stopPropagation();
        var videoid = jq(this).parent()[0].getAttribute("video_id");
        closePanel(videoid);
        OnDetachVideo(this);
        return true;
    });

    if (list_video[player_id_].length > 0) {
        jq('#' + current_panel_header_title).die("click").live('click', function(event) {
            event.stopPropagation();
            var id = jq(this).parent()[0].getAttribute("video_id");
            showPopupContent(id);
        });
        // Same as for download buttong
        jq('#' + download_button_image).die("click").live('click', function(event) {
            event.stopPropagation();
            var id = jq(this).parent()[0].getAttribute("video_id");
            showPopupContent(id);
        });
    }

    // Delete single pinvideo button
    if (jq("#" + player_id).length > 0)
        jq("#" + player_id).remove();
    // And replace by this panel
    var panel = document.createElement("div");
    panel.innerHTML = float_panel_html;
    document.documentElement.appendChild(panel);

    // Bind event
    var li_item, file_url, root_title;
    for (i = 0; i < list_video[player_id_].length; i++) {
        if (list_video[player_id_][i].url == "") continue;
        file_url = list_video[player_id_][i].url;
        root_title = list_video[player_id_][i].title + '.' + formatMime(list_video[player_id_][i].mime);
        li_item = document.getElementById("item_" + player_id + "_" + i + "");
        if (li_item) {
            li_item.yt_link = file_url;
            li_item.yt_title = root_title;
            if (list_video[player_id_][i].audioUrl != "") {
                li_item.yt_audio = list_video[player_id_][i].audioUrl;
                li_item.yt_title = list_video[player_id_][i].title + ' ' + list_video[player_id_][i].resolution +
                    '.' + formatMime(list_video[player_id_][i].mime);
                if (list_video[player_id_][i].audioTitle == undefined) list_video[player_id_][i].audioTitle = list_video[player_id_][i].title;
                li_item.yt_audio_title = list_video[player_id_][i].audioTitle + '.' + formatMime(list_video[player_id_][i].audioMime);
            }
            $(document).on({
                click: function(event) {
                    event.stopPropagation();
                    var v_id = this.id.substr(8, this.id.length - 10);
                    closePanel(v_id);
                    // If video in High quality Video format, add extra audio extractor
                    if (event.currentTarget.yt_audio != undefined) {
                        saveAndCombineFile(event.currentTarget.yt_audio_title, event.currentTarget.yt_audio,
                            event.currentTarget.yt_title, event.currentTarget.yt_link);
                    } else {
                        saveFile(event.currentTarget.yt_title, event.currentTarget.yt_link);
                    }
                },
            }, "#" + li_item.id);
        }
    }
    MoveFloatPanel(player_id_);
}

// Hien thi float panel
function showFloatPanel(video_id) {
    if (list_video[video_id]) {
        var helper_panel = jq("#URLHelperPanel_pin" + video_id);
        if (!helper_panel.length) {
            setupMainPlayerHover(video_id);
            return;
        }
        is_show_panel = true;
        var position = "";
        if (video_pin) position = "position : fixed;";
        helper_panel.attr("style", "display: block;" + position);
        helper_panel.attr("aria-hidden", "true");
        if (jq("#popup_list_download_item" + video_id).hasClass("panel_show") == true) {
            jq("#popup_list_download_item" + video_id).removeClass("panel_show");
            //helper_panel.removeClass("ytp-top-menu-container-extend");
        }
        // MoveFloatPanel();
    }
}

// Set location for float panel
function MoveFloatPanel(video_id) {
    var video = jq("#" + video_id);
    var top_ = video.offset().top + 10,
        left_ = video.offset().left + 5;
    jq("#URLHelperPanel_pin" + video_id).offset({
        top: top_,
        left: left_
    });

    if (jq("#URLHelperPanel_pin" + video_id).height() < 20)
        jq("#URLHelperPanel_pin" + video_id).addClass("pin-class");
    if (jq("#URLHelperPanel_pin" + video_id).height() != 20) {
        var id = video_id;
        setTimeout(function() {
            MoveFloatPanel(id);
        }, 200);
    }
    // else 
    //   jq("#URLHelperPanel_pin" + video_id).removeClass("pin-class");
}

// Dong float panel
function closePanel(video_id) {
    is_show_panel = false;
    jq("#URLHelperPanel_pin" + video_id).attr("style", "display: none;");
    jq("#URLHelperPanel_pin" + video_id).attr("aria-hidden", "false");
    if (jq("#popup_list_download_item" + video_id).hasClass("panel_show") == true) {
        jq("#popup_list_download_item" + video_id).removeClass("panel_show");
        //jq("#URLHelperPanel_pin" + video_id).removeClass("ytp-top-menu-container-extend");
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

// For youtube & youtube embeded with 2 seperated links
function saveAndCombineFile(audio_title, link_audio, video_title, link_video) {
    chrome.extension.sendMessage({
        msg: "ON_DOWNLOAD_DASH_CONTENT",
        audio_link: decodeURIComponent(link_audio),
        video_link: decodeURIComponent(link_video),
        audio_title: NormalizeFileName(audio_title, true),
        video_title: NormalizeFileName(video_title, true)
    });
}
////////////////////////////////////////////

// VanDD : Redefined for ez uses
// Cat chuoi |string| tu vi tri |position| va do dai |length| cua no
function cutStringTitle(string, position, length) {
    // Kiem tra vi tri cat
    if (position < 0 || length < 0)
        return "";

    if (position >= string.length)
        return string;

    if (position + length < string.length) {
        while (string.charAt(position + length) != " " && string.charAt(position + length) != "-" &&
            string.charAt(position + length) != "+" && string.charAt(position + length) != "" &&
            (position + length) > 0) {
            length--;
        }
        return string.substr(position, length) + " ... ";
    }
    return string.substr(position, length);
}

function NormalizeFileName(filename, removetone) {
    var s = filename;
    s = s.replace(/(\>|\<|\&|\:|\*|\?|\\|\/)/g, '');
    s = s.replace(/\"/g, '\'');
    s = s.replace(/\|/g, '-');
    s = s.replace(/'  '/g, ' ');


    if (removetone != undefined) {
        var arr = s.split('');
        var strVN = {
            Phonetics: ["", "àáảãạ", "âầấẩẫậ", "ăằắẳẵặ", "èéẻẽẹ", "êềếểễệ", "ìíỉĩị",
                "òóỏõọ", "ôồốổỗộ", "ơờớởỡợ", "ùúủũụ", "ưừứửữự", "ỳýỷỹỵ", "đ", "Đ"
            ],
            Chars: ["", "a", "a", "a", "e", "e", "i", "o", "o", "o", "u", "u", "y",
                "d", "d"
            ]
        };
        //ThangLVb - Làm chặt lại đoạn đổi chữ hoa, chữ thường
        for (var i = 0; i < arr.length; i++) {
            for (var j in strVN.Phonetics) {
                if (strVN.Phonetics[j].indexOf(arr[i]) != -1) {
                    arr[i] = strVN.Chars[j];
                    break;
                } else if (strVN.Phonetics[j].toUpperCase().indexOf(arr[i]) != -1) {
                    arr[i] = strVN.Chars[j].toUpperCase();
                    break;
                }
            }
        }
        // End [ThangLVb]

        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == ' ' || arr[i] == '.' || (arr[i] >= 'a' && arr[i] <= 'z') || (arr[i] >= 'A' && arr[i] <= 'Z') || (arr[i] >= '0' && arr[i] <= '9'))
                continue;
            arr[i] = '';
        }
        s = arr.join('');
    }
    return s.trim();
}

// Get format mime
function formatMime(mimeType) {
    if (Array.isArray(mimeType))
        mimeType = mimeType[0];

    if (mimeType == undefined)
        return "m4a";
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
//////////////////////////////////////////////////////////////////////