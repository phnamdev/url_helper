//Global param
var g_curTabId = 0;
var g_curUrl = 0;
var g_mediaUrls = undefined;
var g_mapUrls = {};
var g_check = 0;

function updateFileLenForStorage(idx, sel_dx, fileLen) {
    var items = undefined;
    var key = GetPreKey(g_curUrl);
    g_mediaUrls[idx].len[sel_dx] = fileLen;
    items = g_mediaUrls;
    localStorage.setItem(key, JSON.stringify(items));
}

function updateFinalURLForStorage(idx, sel_dx, fileURL) {
    var items = undefined;
    var key = GetPreKey(g_curUrl);
    g_mediaUrls[idx].url[sel_dx] = fileURL;
    items = g_mediaUrls;
    localStorage.setItem(key, JSON.stringify(items));
}

function RequestLinkInfo(TabId, index, sel_index, object, fileURL) {
    var xhr = new XMLHttpRequest();
        xhr.TabID = TabId;
        xhr.url = fileURL;
        xhr.idControl = "idd_" + index;
        xhr.idx = index;
        xhr.sel_idx = sel_index;
        xhr.object = object;
    if (fileURL.indexOf("mp3.zing.vn") >= 0 || fileURL.indexOf("clip.vegacdn.vn") >=0) {
        xhr.redirect = true;
        xhr.open("GET", fileURL);
        g_mapUrls[fileURL] = {index: index, select: sel_index};
    } else {
        xhr.open("HEAD", fileURL);
    }

    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.onreadystatechange = function() {
        if (this.readyState > 1 && 200 === this.status) {
            var len = this.getResponseHeader("Content-Length");
            var o = document.getElementById(this.idControl);
            var sel = false;
            if(o.className.indexOf('downloadLink') != -1) {
                sel = true;
                o = document.getElementById('multiple_link_selection_' + this.idx).childNodes[this.sel_idx];
            }
            if (len > 0 && o.innerHTML.indexOf('MB') == -1) {
                this.object[index].len[sel_index] = len;
                // Update to Storage
                updateFileLenForStorage(this.idx, this.sel_idx, len);
                var mb = len < 1024 ? parseFloat(len) : Math.floor(len * 100 / 1024 / 1024) / 100;
                if(sel) {
                    o.innerHTML += ", " + mb + " MB";
                } else {
                    o.innerHTML = getI18nMsg("Download") + mb + "MB";
                }
                o.title = "";
            }
        }
    };
    xhr.send();
}

function setInterFace() {
    var root = $('#idMediaList').children(".wrap");
    for (var index = root.length - 1; index >= 0; index--) {
        if (index % 2 == 0) {
            $(root[index]).css("background", "#ffffff");
        } else {
            $(root[index]).css("background", "#ebebeb");
        }
    };
}

function getMainURL() {
    $chromeurl = "";
    chrome.windows.getAll({
        "populate": true
    }, function(windows) {
        for (var i in windows) {
            var tabs = windows[i].tabs;
            for (var j in tabs) {
                var tab = tabs[j];
                if (tab.active) {
                    $chromeurl = tab.url;
                }
            }
        }

        var url = $chromeurl;
        // Neu tab hien tai la youtube thi khong hien popup.
        if (url.indexOf("youtube.com") != -1) {
            window.close();
        }

        return $chromeurl;
    });
}

function hideControl(id) {
    var o = document.getElementById(id);
    if (o) {
        o.style.display = "none";
    }
}

function showHDMedia() {
    var sInner = "";
    var media_list = document.getElementById("idMediaList");

    if (!g_mediaUrls.link.length) {
        var o = document.getElementById("idNoVideo");
        if (o) {
            o.innerHTML = "<a id='idNoVideoLink' style='margin-left:10px'> "
                + getI18nMsg("please_wait") + "</a>";
            o.style.display = "block";
        }
    } else {
        for (var i = 0; i < g_mediaUrls.link.length; i++) {
            var line = createHDStreamEntry(g_mediaUrls.fileName, g_mediaUrls.link[i].type, i);
            sInner += line;
        }
    }

    // VanDD : add this : for conver mp3
    var mimes = ["mp4" , "mp3"];
    var sFooter = '';

    sFooter += "<div class='wrap'>";
    sFooter += "<label class='preferred_quality'>";
    sFooter += "<input type='checkbox' id='chk_quality'/>";
    sFooter += getI18nMsg("preferred_quality");
    sFooter += '</label>';
    sFooter += '<select id = "quality-level-selection" width = "100px">';

    for (var i = 0; i < mimes.length; i++) {
        sFooter += '<option>';
        sFooter += mimes[i];
        sFooter += '</option>';
    }
    sFooter += '</option>';

    sFooter += '</select>';
    sFooter += '</label> ';
    sFooter += '</div > ';
    sInner += sFooter;
    // End of comment

    media_list.innerHTML = sInner;
    return sInner;
}

function showMediaUrls() {
    var sInner = "";
    var media_list = document.getElementById("idMediaList");

    if (!g_mediaUrls.length) {
        var o = document.getElementById("idNoVideo");
        if (o) {
            o.innerHTML = "<a id='idNoVideoLink' style='margin-left:10px'> "
                + getI18nMsg("please_wait") + "</a>";
            o.style.display = "block";
        }
    } else {
        for (var i = 0; i < g_mediaUrls.length; i++) {
            var object = g_mediaUrls[i];
            object.has_length = false;
            var line = '';
            if (object.url.length == 1) {
                object.has_length = object.len[0] ? true : false; //!= undefined;
                line = createSingleLinkEntry(object, i, Media_type[1]);
            } else {
                line = createMultipleLinkEntry(object, i);
            }

            sInner += line;
        }

        //Download album
        if (g_mediaUrls.length > 1) {
            var mimes = g_mediaUrls[0].mime;
            var qualities = g_mediaUrls[0].quality;
            var sFooter = ''; //'<div class="sep2"></div>';

            sFooter += "<div class='wrap'>";
            sFooter += "<label class='preferred_quality'>";
            sFooter += "<input type='checkbox' id='chk_quality'/>";
            sFooter += getI18nMsg("preferred_quality");
            sFooter += '</label>';
            sFooter += '<select id = "quality-level-selection" width = "100px">';
            // VanDD
            var contain_mp3 = false;
            for (var i = 0; i < mimes.length; i++) {
                sFooter += '<option>';
                sFooter += mimes[i];
                if (qualities != undefined && qualities[i])
                    sFooter += "," + qualities[i];
                sFooter += '</option>';
                if (mimes[i] == "mp3") contain_mp3 = true;
            }
            // VanDD : Add for convert audio option
            if (!contain_mp3) {
                sFooter += '<option>';
                sFooter += "mp3";
                sFooter += '</option>';
            }
            // End of comment
            sFooter += '</select>';
            sFooter += '</label> ';
            sFooter += '<button id = "DownloadAll">'
                + getI18nMsg("download_all_link") + '</button>';
            sFooter += '</div > ';

            sInner += sFooter;
        }
    }

    media_list.innerHTML = sInner;

    // Bind select change event for all control
    if (g_mediaUrls.length) {
        for (var i = 0; i < g_mediaUrls.length; i++) {
            var entry = document.getElementById('idd_' + i);
            if (entry) {
                entry.media_type = "audio";
                entry.filename = GetFileName(g_mediaUrls[i]);
                var select = document.getElementById('multiple_link_selection_' + i),
                    index = (select != undefined) ? select.selectedIndex : 0;
                entry.extension = g_mediaUrls[i].mime[index],
                entry.addEventListener("click", OnDownloadMedia);
            }
        }

        var downAll = document.getElementById('DownloadAll');
        if (downAll) {
            downAll.media_type = "audio";
            downAll.filename = GetFileName(g_mediaUrls[0]);
            var select = document.getElementById('quality-level-selection');
            downAll.index = (select != undefined) ? select.selectedIndex : 0;
            downAll.extension = g_mediaUrls[0].mime[downAll.index];

            downAll.addEventListener("click", OnDownloadAll);
        }

        var checkbox = document.getElementById('chk_quality');
        if (checkbox) {
            checkbox.checked = true;
            checkbox.addEventListener("click", function(e) {
                document.getElementById('quality-level-selection').disabled =
                    !checkbox.checked;
            });
        }

        var select = document.getElementById('quality-level-selection');
        if (select) {
            select.media_type = "audio";
            select.addEventListener('change', OnSelectChanged, false);
        };
    }

    return sInner;
}

function createSingleLinkEntry(object, index) {
    var sLine = "";
    var url = object.url[0],
        qual = object.quality,
        res = object.resolution,
        ext = object.mime[0],
        size = object.len[0],
        fname = GetFileName(object);

    if (fname.indexOf('bsc') != -1) return sLine;
    object.filename = fname;
    if (fname.length >= 42)
        fname = cutString(fname, 0, 40);

    sLine += "<div class='wrap'>";
    sLine += "<div class='clDownloadVideo' id='media_" + index + "'>" + fname
        + '.' + ext;
    if (qual != undefined)
        sLine += " - " + qual;
    if (res != undefined)
        sLine + " - " + res;
    sLine += "</div>";

    if (size == undefined || size == '' || size == 0) {
        sLine += "<div class='clDownloadButton download_button_wait' title='"
            + getI18nMsg("waiting_for_server_replies") + "'id='idd_" +
            index + "'><img src='images/loading.gif'></div>";
    } else {
        var mb = (size < 1024) ? parseFloat(size) : Math.floor(size * 100 / 1024 / 1024) / 100;
        sLine += "<div class='clDownloadButton' id='idd_"
            + index + "'>" +getI18nMsg("Download")+ mb + " MB</div>";
    }

    sLine +="</div>";
    return sLine;
}

function createHDStreamEntry(filename, type, index) {
    var sLine = "";
    var fname = filename;

    if (fname.length >= 42)
        fname = cutString(fname, 0, 40);
    fname += ' ' + type;
    if (parseInt(type) > 0)
        fname += 'p';
    sLine += "<div class='wrap'>";
    sLine += "<div class='clDownloadVideo' id='media_" + index + "'>" + fname
        + '.ts' + "</div>";

    sLine += "<div class='clDownloadButton' id='idd_" +
        index + "'>" + getI18nMsg("DownloadHD") + "</div>";

    sLine += "</div>";
    return sLine;
}

function createMultipleLinkEntry(object, index) {
    var sLine = "",
        fname = GetFileName(object),
        color = "#aaa";

    object.filename = fname;
    if (fname.length >= 42)
        fname = cutString(fname, 0, 40);

    sLine += "<div class='wrap'>";
    sLine += "<div class='clDownloadVideo' id='media_" + index + "'>"
        + fname + "</div>";
    sLine += "<button class = 'downloadLink' id='idd_" + index + "'></button>";
    sLine += "<select class = 'selectLink' name='selDownloadLink' id='multiple_link_selection_"
        + index + "'>";

    var has_length = object.len[0] != undefined && object.len[0] != '';
    for (var i = 0; i < object.url.length; i++) {
        var url = object.url[i],
            res = object.resolution[i],
            qual = object.quality[i],
            ext = object.mime[i].toUpperCase();
        sLine += '<option value = ';
        sLine += url;
        sLine += '>';
        sLine += ext;
    //ThangLVb - Hien thi res + size cua file download
        if (res != undefined) {
            sLine += ", " + res;
        }

        if (qual != undefined) {
            object.has_length = true;
            sLine += ", " + qual;
        } else if (has_length == true) {
            mb = (object.len[i] < 1024) ? parseFloat(object.len[i]) : Math.floor(object.len[i] * 100 / 1024 / 1024) / 100;
            sLine += ", " + mb + " MB";
        }
    // End [ThangLVb]
        sLine += '</option>';
    }
    sLine += '</select > ';
    sLine +="</div>";
    return sLine;
}

function OnDownloadMedia(ev) {
    var object = ev.srcElement;
    if (object.id == "")
        object = ev.srcElement.parentNode;

    var filename = object.filename;
    var i = parseInt(object.id.slice(4));
    if (g_mediaUrls[i].audioUrl && !Array.isArray(g_mediaUrls[i].audioUrl)) {
        chrome.extension.sendMessage({
            msg: "ON_DOWNLOAD_DASH_CONTENT",
            audio_link: decodeURIComponent(g_mediaUrls[i].audioUrl),
            video_link: decodeURIComponent(g_mediaUrls[i].url[0]),
            audio_title: NormalizeFileName(filename, true) + '.m4a',
            video_title: NormalizeFileName(filename, true) + ' ' + g_mediaUrls[i].resolution + '.mp4',
        });
        return;
    }

    var length =  g_mediaUrls.length;
    if (i < length) {
        var url_ =  g_mediaUrls[i].url;
        var select = document.getElementById('multiple_link_selection_' + i);
        var index = (select != undefined) ? select.selectedIndex : 0;

        if (g_mediaUrls[i].audioUrl && g_mediaUrls[i].audioUrl[index] != '') {
            chrome.extension.sendMessage({
                msg: "ON_DOWNLOAD_DASH_CONTENT",
                audio_link: decodeURIComponent(g_mediaUrls[i].audioUrl[index]),
                video_link: decodeURIComponent(g_mediaUrls[i].url[index]),
                audio_title: NormalizeFileName(filename, true) + '.m4a',
                video_title: NormalizeFileName(filename, true) + ' ' + g_mediaUrls[i].resolution[index] + '.mp4',
            });
            return;
        }

        // VanDD : add this : maybe convert to audio
        var selector = document.getElementById('quality-level-selection');
        var selected_type;
        if (selector) {
            selected_type = selector[selector.selectedIndex].label;
            selected_type = selected_type == "mp3" ? selected_type : "";
        }
        // End of comment
        var ext =  g_mediaUrls[i].mime[index], ot_link = g_mediaUrls[i].ot_link;
        if (ext == "video/mp4") ext = "mp4";
        chrome.downloads.download({
            url: NormalizeUrl(url_[index]),
            filename: NormalizeFileName(filename) + '.' + ext,
            forceSingle: ot_link,
            totalBytes: g_mediaUrls[i].len[index] != null ? parseInt(g_mediaUrls[i].len[index]) : 0,
            method: "GET",
            mime: selected_type
        }, function(response) {
            window.close();
        });

        // Also clear old local storage
        if (ot_link) {
            var key = GetPreKey(g_curUrl);
            localStorage.removeItem(key);
        }
    }
}

function downloadSequence(index) {
    var i = numberOfDownload;
    var filename = GetFileName(g_mediaUrls[i]),
        url_ = g_mediaUrls[i].url,
        ext = g_mediaUrls[i].mime;

    chrome.downloads.download({
        url: NormalizeUrl(url_[index]),
        filename: absolutePath + '\\' + NormalizeFileName(filename)
            + '.' + ext[index],
        method: "GET"
    });

    if (--numberOfDownload <= 0) {
        clearInterval(downloadEvent);
        downloadEvent = null;
    }
}

var jobID = null;

function OnDownloadAll(ev) {
    var count_item = 0;
    //Call download batch api
    var object = ev.srcElement;
    var urls = [],
        filenames = [],
        index = object.index,
        ext = g_mediaUrls[0].mime[index];
    g_mediaUrls.sort(function(a, b) {
        if(a.len[index] != null && b.len[index] != null) {
            return a.len[index] > b.len[index];
        } else {
            return a.len[index] != null  ? true : (b.len[index] != null ? false : true);
        }
    });

    for (var i in g_mediaUrls) {
        if (g_mediaUrls[i].url[index] != undefined) {
            urls.push(NormalizeUrl(g_mediaUrls[i].url[index]));
            var filename = GetFileName(g_mediaUrls[i]);
            var node = NormalizeFileName(filename) + '.' + ext;
            filenames.push(node);
            count_item++;
        }
    }

    chrome.downloadsBatch.downloadBatch({
        url: urls,
        filename: filenames,
        promptChangePath: false,
        method: "GET"
    }, function(id) {
        if (id >= 0) {
            jobID = id;
        }
        //window.close();
    });
    window.close();
}

function downloadHDStream(ev) {
    var object = ev.srcElement;
    var div_id = object.id;
    var index = div_id.substr(div_id.lastIndexOf('_') + 1, div_id.length);
    var id = g_mediaUrls.id, urls = g_mediaUrls.link[index].urls, filename = g_mediaUrls.fileName;
    var filenames = [];
    for (var i in urls) {
        filenames[i] = filename + '_' + i + ".ts";
    }

    var selector = document.getElementById('quality-level-selection');
    var selected_type = selector[selector.selectedIndex].label;
    selected_type = selected_type == "mp3" ? selected_type : "";
    
    chrome.downloadsBatch.downloadBatch({
        url: urls,
        filename: filenames,
        promptChangePath: false,
        combineStream: true,
        srt: g_mediaUrls.substrack,
        hd_site: id,
        method: "GET",
        mine : selected_type
    }, function(id) {
        if (id >= 0) {
            jobID = id;
        }
        //window.close();
    });
    window.close();
}

function OnSelectChanged(ev) {
    var selected = ev.target.selectedIndex,
        length =  g_mediaUrls.length;
    for (var i = 0; i < length; i++) {
        var select = document.getElementById('multiple_link_selection_' + i);
        select.selectedIndex = selected;
    }
    // Update to Download All button
    var downAll = document.getElementById('DownloadAll');
    if (downAll)
        downAll.index = selected;
}

function ResizePopup() {
    document.body.style.height = "38px";
    document.body.parentNode.style.height = "50px";
}

function UpdateItemFromXToY(left, right, object) {
    var current_page = parseCurrentURL();
    if (left > right) {
        var temp = left;
        left = right;
        right =  temp;
    }

    if (right >= object.length)
        right = object.length - 1;

    for (var i = left; i <= right; i++) {
        if (object[i].has_length == true)
            continue;
        // Check neu noi dung da duoc load roi thi bo qua
        var element = document.getElementById("idd_" + i);
        if (element) {
            var e_class = element.className;
            var e_content = element.textContent;
            if (e_class.indexOf("requested") > -1 || e_content.indexOf("MB") > -1)
                continue;
        }

        element.className = element.className + " " + "requested";
        for (var j = 0; j < object[i].url.length; j++) {
            RequestLinkInfo(current_page.CurrentTabID, i, j, object, object[i].url[j]);
        }
    }
}

function CompleteItemview(sr_top,sr_height,div_height) {
    var object = undefined;
    object = g_mediaUrls;

    if (object != undefined) {
        if (sr_top == 0) {
            UpdateItemFromXToY(0, 8, object);
            return;
        }

        for(var i = 9; i < object.length; i++) {
            if (i * 50 <= sr_top + sr_height) {
                UpdateItemFromXToY(i, i, object);
            }
        }
    }

}

//Page load
document.addEventListener("DOMContentLoaded", function() {
    var resultUrl = parseCurrentURL();
    // Load from storage
    chrome.tabs.get(resultUrl.CurrentTabID, function(tab) {
        g_curUrl = tab.url.trim();
        var mediaKey = GetPreKey(g_curUrl);
        g_mediaUrls = JSON.parse(localStorage.getItem(mediaKey));
        if (g_mediaUrls != null) {
            // Reset popup
            ResizePopup();
            var s = "";
            if (g_mediaUrls.type != undefined) {
                s += showHDMedia();
                setInterFace();

                // Bind download event to all quality
                for (var i = 0; i < g_mediaUrls.link.length; i++) {
                    var entry = document.getElementById('idd_' + i);
                    if (entry) {
                        entry.addEventListener("click", downloadHDStream);
                    }
                }

            } else {
                s += showMediaUrls();
                setInterFace();
                CompleteItemview(0, 0, 0);
            }
        }
    });

    getMainURL();
    });

jQuery(function($) {
    $('#wrapper').bind('scroll', function() {
        var sr_top = $(this).scrollTop();
        var sr_height = this.scrollHeight;
        var div_height = $(this).innerHeight();
        CompleteItemview(sr_top, sr_height, div_height);
    })
});

