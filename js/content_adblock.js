var ADS_URLS = ["akamaihd.net", /*"fbcdn.net",*/ "dmcdn.net", /*"nixcdn.com",*/ "adnetwork.vn", "doubleclick.net", "admicro", "adnet.vn", "ds-vn.serving-sys.com", "lavanetwork.net", "serving-sys.com", "adv.vcmedia.vn", ".swf?"];
var block_urls = {
    "hayhaytv" : [ "http://cdn.ambientplatform.vn/flash/jwplayer/ova-jw.swf",
                "http://static.hayhaytv.com/layout/skycrappers/BiaSaiGon160x600.jpg",
                "http://static.hayhaytv.com/layout/skycrappers/epl-live-120x600.gif",
                "http://imasdk.googleapis.com/flash/sdkloader/adsapi_3.swf",
                "http://imasdk.googleapis.com/flash/core/adsapi_3_0_175.swf",
            ],
    "hdonline" : [
                "http://hdonline.vn/images/laban_728x90.jpg",
                "http://hdonline.vn/cafedj_doc.jpg",
                "http://hdonline.vn/template/frontend/adsfloat/bac_dau_1.jpg",
                "http://hdonline.vn/template/frontend/adsfloat/HDO-Banner-HQ.gif",
                "http://hdonline.vn/images/Bacdau-banner-650x90.jpg"
            ],
    "hdviet" : ["http://210.211.120.146/videos/HDViet_Dune_TV_800.mp4"]
};

var block_urls_regex = {
    "hayhaytv" : [ "hayhaytv\.com/ads",
                "hayhaytv\.vn/ads_clip",
                "hayhaytv\.com/ads.*\.swf",
                "cloudfront\.net",
                "hayhaytv\.vn/ads",
                "/adsbanner/",
                "/videoad/",
                "adnetwork_hayhaytv",
                "/ovavideoad/",
                "addthis\.com",
                "romano\.vn",
                "/romano2/",
                "layout/skycrappers/.*\.gif",
                "hayhaytv\.vn/advertise/.*\.gif",
                "hayhaytv\.vn/advertise/.*\.swf",
                "hayhaytv\.vn/advertise/.*\.png",
                "hayhaytv\.vn/advertise/.*\.jpg",
                "at\.hayhaytv\.vn/api/miss_hit",
                "hayhaytv\.vn/vod/player_ads",
                "cdn-static\.hayhaytv\.vn/at_files",
                "gammaplatform\.com",
                "anthill\.vn",
                "yomedia\.vn"
            ],
    "hdonline" : [
                "amung\\.us",
                "novanet\\.vn",
                "eclick\\.vn",
                "crwdcntrl\\.net",
                "bluekai\\.com",
                "mediaquark\\.com",
                "mookie1\\.com",
                "exelator\\.com",
                "addthis\\.com",
                "demdex\\.net",
                "/adsfloat/",
                "googlesyndication\\.com",
                "googleadservices\\.com",
                "serving-sys\\.com/.*\\.mp4\\.*",
                "serving-sys\\.com/.*\\.swf\\.*",
                "/blueseed-cdn/.*\\.mp4\\.*",
                "/blueseed-cdn/.*\\.swf\\.*",
                "bluesering\\.com/.*\\.mp4\\.*",
                "bluesering\\.com/.*\\.swf\\.*",
                "blueseed\\.tv/.*\\.mp4\\.*",
                "blueseed\\.tv/.*\\.swf\\.*",
                "tidaltv\\.com/.*\\.mp4\\.*",
                "tidaltv\\.com/.*\\.swf\\.*"
            ],
    "hdviet" : [
                "210\\.211\\.120\\.146.*swf",
                "hdv_tracking\\.js",
                "210\\.211\\.120\\.146/videos",
                "eclick\\.vn",
                "lijit\\.com",
                "adtimaserver\\.vn",
                "laban\\.vn",
                "ad\\.vatgia\\.com",
                "lavanetwork\\.net",
                "popnet\\.vn",
                "serving-sys\\.com",
                "novanet\\.vn",
                "ad360.vn",
                "adnet\\.vn",
                "vcmedia\\.vn",
                "adfox\\.vn",
                "serving-sys\\.com/.*\\.mp4\\.*",
                "serving-sys\\.com/.*\\.swf\\.*",
                "/blueseed-cdn/.*\\.mp4\\.*",
                "/blueseed-cdn/.*\\.swf\\.*",
                "bluesering\\.com/.*\\.swf\\.*",
                "bluesering\\.com/.*\\.mp4\\.*",
                "blueseed\\.tv/.*\\.mp4\\.*",
                "blueseed\\.tv/.*\\.swf\\.*",
                "tidaltv\\.com/.*\\.mp4\\.*",
                "tidaltv\\.com/.*\\.swf\\.*",
                "scorecardresearch\\.com",
                "revsci\\.net",
                "pubads\\.g\\.doubleclick\\.net/pagead/adview",
                "____pubads\\.g\\.doubleclick\\.net/pagead/conversion",
                "cdn\\.blueseed\\.tv/img/2014/.*jpg",
                "cdn\\.blueseed\\.tv/img/2015/.*\\.jpg",
                "ytimg\\.com/.*watch_as3\\.swf"
            ]
};



function compare_regex(str, regex){
    var pattern = new RegExp(regex, 'g');
    if (pattern.test(str) == true) {
        return true;
    }
    return false;
};

function compare_domain(domain, domain_to_compare){
    if (domain_to_compare.indexOf('*') >= 0) {
        var pattern = new RegExp(domain_to_compare, 'g');
        return domain.match(pattern);
    } else {
        if (domain == domain_to_compare) {
            return true;
        }
    }

    return false;//ignore domain
};


chrome.runtime.onConnect.addListener(function(port) {
  if (port.name = "GetEnableAdblock") {
    var url = port.sender.url;
    chrome.bkavAdblock.isAdblockEnabled(url, function(enabled) {
        //console.log(enabled);
        if (enabled)
            port.postMessage({enableAdblock : true});
    });
  } else {
    //console.log(port);
  }
});