//Using chrome.i18n.* api
function getI18nMsg(msgname) {
    try {
        return chrome.i18n.getMessage(msgname);
    } catch (err) {
        return msgname;
    }
};

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
                "òóỏõọ", "ôồốổỗộ", "ơờớởỡợ", "ùúủũụ", "ưừứửữự", "ỳýỷỹỵ", "đ", "Đ"],
            Chars: ["", "a", "a", "a", "e", "e", "i", "o", "o", "o", "u", "u", "y",
                "d", "d"]
        };
        //ThangLVb - Làm chặt lại đoạn đổi chữ hoa, chữ thường
        for (var i = 0; i < arr.length; i ++) {
            for (var j in strVN.Phonetics) {
                if (strVN.Phonetics[j].indexOf(arr[i]) != -1) {
                    arr[i] = strVN.Chars[j];
                    break;
                }
                else if (strVN.Phonetics[j].toUpperCase().indexOf(arr[i]) != -1) {
                    arr[i] = strVN.Chars[j].toUpperCase();
                    break;
                }
            }
        }
        // End [ThangLVb]

        for (var i = 0; i < arr.length; i ++) {
            if (arr[i] == ' ' || arr[i] == '.' || (arr[i] >= 'a' && arr[i] <= 'z') || (arr[i] >= 'A' && arr[i] <= 'Z') || (arr[i] >= '0' && arr[i] <= '9'))
                continue;
            arr[i] = '';
        }
        s = arr.join('');
    }
    return s.trim();
}

function GetFileName(object) {
    var s = "";
    for (var j = 0; j < object.title.length; j++) {
        var c = object.title.charAt(j);
        if ("_|():;,.".indexOf(c) >= 0) {
            s += " ";
        } else
            s += c;
    }

    return s.trim();
}

function NormalizeUrl(url) {
    var s = "";
    for (var j = 0; j < url.length; j++) {
        var c = url.charAt(j);
        if (c == ' ') {
            s += '%20';
        } else
            s += c;
    }
    return s;
}

function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function cutString(string, position, length) {
    if (string.indexOf(" ") == -1) {
       return string.substr(position, length) + " ... ";
    }

    if (position < 0 || length < 0)
        return "";

    if (position >= string.length)
        return string;

    var post_fix = '';
    if((pos = string.indexOf('esp ')) != -1) {
        post_fix = '_' + string.substr(pos, string.length);
        string = string.substr(0, pos);
    }
    if (position + length < string.length) {
        while (string.charAt(position + length) != " " &&
            string.charAt(position + length) != "" &&
            (position + length) > 0) {
            length--;
        }

        return string.substr(position, length) + " ... " + post_fix;
    }

    return string.substr(position, length);
}


// Cat chuoi |string| tu vi tri |position| va do dai |length| cua no
function cutStringTitle(string, position, length) {
    // Kiem tra vi tri cat
    if (position < 0 || length < 0)
        return "";

    if (position >= string.length)
        return string;

    if (position + length < string.length) {
        while(string.charAt(position + length)  != " " &&
                 string.charAt(position + length) != ""  &&
                    (position + length) > 0) {
            length --;
        }
        return string.substr(position,length) + " ... ";
    }
    return string.substr(position,length);
}

function parseCurrentURL() {
    var curTabId = undefined;

    //Get url of current page: popup.html
    var query = window.location.search.substring(1);

    var j = query.indexOf("&tabid=");
    if (j >= 0) {
        curTabId = parseInt(query.slice(j + 7));
    }

    return  {
        CurrentTabID: curTabId
    }
}

function hash(a, b) {
    if (b = 0 | b, 0 === a.length) return b;
    var c, d;
    for (c = 0, d = a.length; d > c; c++)
        b = (b << 5) - b + a.charCodeAt(c), b |= 0;
    return b;
}

function GetPreKey(Url) {
    return chrome.runtime.id.toString() + hash(Url, "1234567890");
}

parseUri.options = {
    strictMode: false,
    key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
    q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
}

function parseUri(str) {
    var o = parseUri.options,
        m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while(i--){
        uri[o.key[i]] = m[i] || "";
    }

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if($1){
            uri[o.q.name][$1] = $2;
        }
    });

    return uri;
}
