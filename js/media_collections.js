var Media_type = [
    "VIDEO_TYPE",
    "AUDIO_TYPE",
    "REFERRENCE_TYPE",
    "HLS_TYPE"
];

var media_site = {
    "VideoSites":
    [{
        "url": "http://www.youtube.com",
        "filterUrl": "^https?:\/\/(?:www\.)?youtube.com\/watch\?",
        "filter": "youtube.com",
        "name": "youtube.com",
    }, {
        "url": "http://www.vimeo.com",
        "filterUrl": "^.*(vimeo\.com\/)((channels\/[a-zA-Z0-9]+\/)|(groups\/[a-zA-Z0-9]+\/videos\/))?([0-9]+)",
        "filter": "vimeo.com",
        "name": "vimeo.com",
    }, {
        "url": "http://www.dailymotion.com",
        "filterUrl": "^http:\/\/(?:www\.)?dailymotion.com\/video\?",
        "filter": "dailymotion.com",
        "name": "dailymotion.com",
    }, {
        "url": "http://www.facebook.com",
        "filterUrl": "/^https?:\/\/(?:www\.)(?:facebook|fb)\.com\/(?:v\/|photo\.php\?v=)([0-9]+)/i,",
        "filter": "facebook.com",
        "name": "facebook.com",
    }, {
        "url": "https://www.vnexpress.net",
        "filterUrl": "^.*vnexpress\.net\/(([a-zA-Z0-9-_])+\/){2,10}(video)",
        "filter": "vnexpress",
        "name": "vnexpress",
    }, {
        "url": "https://www.nhaccuatui.com",
        "filterUrl": "^(http|https)?:\/\/(?:www\.)?nhaccuatui.com\/video\?",
        "filter": "nhaccuatui.com",
        "name": "nhaccuatui.com",
    }, {
        "url": "https://www.mp3.zing.vn",
        "filterUrl": "^https:\/\/(?:www\.)?mp3.zing.vn\/video-clip\?",
        "filter": "mp3.zing.vn",
        "name": "mp3.zing.vn",
    }, {
        "url": "http://tv.zing.vn/",
        "filterUrl": "^http:\/\/(?:www\.)?tv.zing.vn\/(([a-zA-Z0-9-])+)",
        "filter": "tv.zing.vn",
        "name": "tv.zing.vn",
    }, {
        "url": "http://vuiviet.us/",
        "filterUrl": "^http:\/\/(?:www\.)?vuiviet.us\?",
        "filter": "vuiviet.us",
        "name": "vuiviet.us",
    },],

    "AudioSites":
    [{
        "url": "https://www.nhaccuatui.com",
        "filterUrl": "^(http|https)?:\/\/(?:www\.)?nhaccuatui.com\?",
        "filter": "nhaccuatui.com",
        "name": "nhaccuatui.com",
    }, {
        "url": "http://www.chiasenhac.vn",
        "filterUrl": "^.*chiasenhac\.(vn|com)\?",
        "filter": "chiasenhac",
        "name": "chiasenhac",
    }, {
        "url": "http://www.xzone.vn",
        "filterUrl": "^.*xzone.vn\?",
        "filter": "/http?:\/\/nhac\.xzone\.vn\/web\/([0-9a-z_-]+)/i",
        "name": "xzone",
    }, {
        "url": "https://soundcloud.com",
        "filterUrl": "^(http|https)?:\/\/(?:www\.)?soundcloud.com\?",
        "filter": "soundcloud.com",
        "name": "soundcloud.com",
    }],

    "EventSites":
    [{
        "filterUrl": ["^(http|https)?:\/\/(?:www\.)?hayhaytv\.vn\/xem-phim\/(([a-zA-Z0-9-#])+)",
            "^(http|https)?:\/\/(?:www\.)?hayhaytv\.vn\/xem-show\/(([a-zA-Z0-9-#])+)",
            "^(http|https)?:\/\/(?:www\.)?jj.hayhaytv\.vn\/anime\/(([a-zA-Z0-9-#])+)"
        ],
        "ID": "_HAYHAYTV_PLAYLIST_",
    }, {
        "filterUrl": ["^http?:\/\/(?:www\.)?movies\.hdviet\.com\/(([a-zA-Z0-9-])+)"],
        "ID": "_HDVIET_PLAYLIST_",
    }, {
        "filterUrl": ["^http?:\/\/hdonline\.vn\/(([0-9a-z_-])+)"],
        "ID": "_HDONLINE_PLAYLIST_",
    }, {
        "filterUrl": ["^(http|https)?:\/\/(?:www\.)?nhaccuatui.com\/playlist\/\?",
            "^(http|https)?:\/\/(?:www\.)?nhaccuatui.com\/bai-hat\/\?",
            "^(http|https)?:\/\/(?:www\.)?(?:([0-9a-z_-])+\.)nhaccuatui.com\/video\/\?"
        ],
        "ID": "_NHACCUATUI_PLAYLIST_",
    }, {
        "filterUrl": ["^(http|https)?:\/\/(?:www\.)?nhaccuatui.com\/playlist\/\?",
            "^(http|https)?:\/\/(?:www\.)?nhaccuatui.com\/bai-hat\/\?",
            "^(http|https)?:\/\/(?:www\.)?(?:([0-9a-z_-])+\.)nhaccuatui.com\/video\/\?"
        ],
        "ID": "_NHACCUATUI_PLAYLIST_",
    }, { // NamPHb 06/08/18
        "filterUrl": ["^(http|https):?\/\/(www\.)?dantri\.com\.vn\/video"], 
        "ID": "_DANTRI_PLAYLIST_",
    }, {
        "filterUrl": ["^(http|https):?\/\/(www\.)?video\.kenh14\.vn"], 
        "ID": "_KENH14_PLAYLIST_", 
    }, // end
    /*{
        "filterUrl": ["^http?:\/\/(?:www\.)?mp3.zing.vn\/video-clip\/\?"],
        "ID": "_ZVIDEO_PLAYLIST_",
    }, {
        "filterUrl": ["^http?:\/\/(?:www\.)?mp3.zing.vn\/bai-hat\/\?"],
        "ID": "_ZSINGLE_PLAYLIST_",
    },*/ {
        // NamTB: alway set last item to popular site
        // http://clipv3.vegacdn.vn/hlsedge/_definst_/amlst:edge/cmc/media1/0/0/1/54611.mp4/playlist.m3u8?tokenendtime=1467316800&tokenhash=Gvc_B_72sl5CaixXkHEQHZUqfnQ8jwmLu9XnoaDtKkE=&levels=3,2,1
        // http://cliptv5.vegacdn.vn/cliptv_live/amlst:vtv3hd:levels*7_6_5_4_3_2/playlist.m3u8?hotkey=1b5204e2e925328131441ea39663fa38eb26835c&time=1490081495
        // http://media2.yan.vn/YanVideo/201611/30a1d9d2-dd7d-4d4c-9baf-4de0b7125e8d/30a1d9d2-dd7d-4d4c-9baf-4de0b7125e8d.m3u8
        // http://clip-vod.vegacdn.vn/cliptv_liverecord/_definst_/amlst:records/2017/03/20/vtv6hd.stream/5d37628b-c283-4bfd-a2ca-be40972cb4b0.mp4:levels*level5_level4_level2/chunklist_b1670000.m3u8?hotkey=zMbW6elhOUQS3ojPJVEYJQ&time=1490017715
        "filterUrl": ["^(http|https)?:\/\/(vhosting|hls)?.vcmedia.vn\/([a-zA-Z0-9\/]+)\/([a-zA-Z0-9\-_\/]+\.mp4)\/([a-z]+\.m3u8)",
                      "^(http|https)?:\/\/hls.mediacdn.vn\/([a-zA-Z0-9\/]+)\/([a-zA-Z0-9\-_\/]+\.mp4)\/([a-z]+\.m3u8)",
                      "^(http|https)?:\/\/((vdc[0-9]+\.)?clipv[0-9]+)\.vegacdn.vn\/([a-zA-Z0-9\/-_]+)\/([a-zA-Z0-9\-_\/]+\.mp4)\/([a-z]+\.m3u8)",
                      "^(http|https)?:\/\/media[0-9]+\.yan.vn\/[a-zA-Z0-9/-]+\.m3u8",
                      "^(http|https):\/\/clip-vod.vegacdn.vn\/cliptv_liverecord/[a-zA-Z0-9\/\*\:\._-]+/[a-zA-Z0-9_]+.m3u8\\?hotkey=[a-zA-Z0-9]+&time=[0-9]+",
                      "\/playlist.m3u8\?",
                      "\/master.m3u8"],
        "ID": "_INFANT_PLAYLIST_",
    }],
};

var media_collections = [
    {
        "url": "^(http|https)?:\/\/(?:www\.)?nhaccuatui([0-9a-z_-]+)\?",
        "filterUrl": "^(http|https)?:\/\/(?:www\.)?nhaccuatui.com\/video\/\?",
        "type": "_NCTVIDEO_PLAYLIST_",
        "media_type": Media_type[0],
    }, {
        "url": "http:\/\/data([0-9]*).chiasenhac.vn\/([0-9a-z_-]+)?",
        "filterUrl": "^http?:\/\/(?:www\.)?chiasenhac.vn\/nhac-hot\?",
        "type": "_CHIASENHAC_PLAYLIST_",
        "media_type": Media_type[1],
    }, {
        "url": "http:\/\/data([0-9]*).chiasenhac.vn\/([0-9a-z_-]+)?",
        "filterUrl": "^http?:\/\/(?:www\.)?chiasenhac.vn\/nghe-album\?",
        "type": "_CHIASENHAC_PLAYLIST_",
        "media_type": Media_type[1],
    }, {
        "url": "https:\/\/mp3.zing.vn\/?",
        "filterUrl": "^https?:\/\/(?:www\.)?mp3.zing.vn\/album\/\?",
        "type": "_ZING_PLAYLIST_",
        "media_type": Media_type[1],
    }, {
        "url": "https:\/\/mp3.zing.vn\/?",
        "filterUrl": "^https?:\/\/(?:www\.)?mp3.zing.vn\/bai-hat\/\?",
        "type": "_ZSINGLE_PLAYLIST_",
        "media_type": Media_type[1],
    }, {
        "url": "https:\/\/mp3.zing.vn\/?",
        "filterUrl": "^https?:\/\/(?:www\.)?mp3.zing.vn\/playlist\/\?",
        "type": "_ZING_PLAYLIST_",
        "media_type": Media_type[1],
    }, {
        "url": "https:\/\/mp3.zing.vn\/?",
        "filterUrl": "^https?:\/\/(?:www\.)?mp3.zing.vn\/video-clip\/\?",
        "type": "_ZVIDEO_PLAYLIST_",
        "media_type": Media_type[0],
    }, {
        "url": "http:\/\/([a-z]+\.)nhac.vui.vn\/?",
        "filterUrl": "^http?:\/\/(?:www\.)?([a-z]+\.)?nhac.vui.vn\/album(([a-zA-Z0-9-])+)",
        "type": "_NHACVUI_PLAYLIST_",
        "media_type": Media_type[1],
    }, {
        "url": "http:\/\/nhac.vietgiaitri.com\/?",
        "filterUrl": "^http?:\/\/(?:www\.)?nhac.vietgiaitri.com\/album-nhac\/(([a-zA-Z0-9-])+)",
        "type": "_VIETGIAITRI_PLAYLIST_",
        "media_type": Media_type[1],
    }, {
        "url": "https:\/\/nhac.vn\/?",
        "filterUrl": "^https?:\/\/(?:www\.)?nhac.vn\/[a-zA-Z0-9-?]*",
        "type": "_NHACVN_PLAYLIST_",
        "media_type": Media_type[1],
    }, 
    // }, {
    //     "url": "http:\/\/nhac.vn\/?",
    //     "filterUrl": "^https?:\/\/(?:www\.)?nhac.vn\/album-[a-zA-Z0-9-?]+\?st=\s+",
    //     "type": "_NHACVN_PLAYLIST_",
    //     "media_type": Media_type[1],
    // }, {
    {
        "url": "^.*nhac.xzone.vn",
        "filterUrl": "^http?:\/\/(?:www\.)?nhac.xzone.vn\/\?",
        "type": "_COMMON_PLAYLIST_",
        "media_type": Media_type[1],
    }, {
        "url": "http:\/\/tv.zing.vn\/?",
        "filterUrl": "^http?:\/\/(?:www\.)?tv.zing.vn\/(([a-zA-Z0-9-])+)",
        "type": "_ZTV_PLAYLIST_",
        "media_type": Media_type[0],
    }, {
        "url": "http:\/\/vnews.gov.vn\/?",
        "filterUrl": "^http?:\/\/(?:www\.)?vnews.gov.vn\/video\/(([a-zA-Z0-9-])+)",
        "type": "_VNN_PLAYLIST_",
        "media_type": Media_type[0],
    }, {
        "url": "^(http|https):\/\/www.facebook.com\/?",
        // "filterUrl": "^(http|https)?:\/\/(?:www\.)(?:facebook|fb)\.com\/(video\/)?(?:video|photo)\.php",
        "filterUrl": "^(http|https)?:\/\/(?:www\.)(?:facebook|fb)\.com\/",
        "type": "_FACEBOOK_PLAYLIST_",
        "media_type": Media_type[0],
    }, {
        "url": "https://www.vimeo.com",
        "filterUrl": "^https?:\/\/vimeo.com\/(([a-zA-Z0-9-])+)",
        "type": "_VIMEO_PLAYLIST_",
        "media_type": Media_type[0],
    }, {
        "url": "http://www.dailymotion.com",
        "filterUrl": "^http:\/\/(?:www\.)?dailymotion.com\/video\?",
        "type": "_DAILYMOTION_PLAYLIST_",
        "media_type": Media_type[0],
    },
];

// Some event site, must be clear cache before get link
var embedYoututeSite = [
    "http://phim3s.net/",
    "http://phimmoi.com/",
    "http://bilutv.com/",
    "http://phimbathu.com/",
    "http://phim14.net/"
];

var mediaObject = {
    urlPlaying : new Object(),
    medialist: new Object(),
    urllist: new Object(),
}


