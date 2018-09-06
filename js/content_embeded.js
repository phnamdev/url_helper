// Disable auto play video when scroll throughout video content
function randomString(length) {
    return Math.round((Math.pow(10, length + 1) - Math.random() * Math.pow(10, length))).toString().slice(1);
}

function GetFileName(title) {
    var s = "";
    for (var j = 0; j < title.length; j++) {
        var c = title.charAt(j);
        if ("_|():;,.".indexOf(c) >= 0) {
            s += " ";
        } else s += c;
    }
    return s.trim();
}

// <iframe id="youtube_iframe" width="640" height="390" src="//www.youtube.com/embed/Wdk0uYui3eQ?enablejsapi=1&amp;autoplay=1"
// frameborder="0" allowfullscreen="" data-autoplay-src="//www.youtube.com/embed/Wdk0uYui3eQ?enablejsapi=1&amp;autoplay=1"
// style="width: 640px; height: 390px;"></iframe>

// <div class="html5-video-player iv-module-loaded paused-mode" tabindex="-1" id="player_uid_475363499_1" data-version="/yts/jsbin/player-vi_VN-vflQyxsBl/base.js" aria-label="Trình phát video YouTube"><div class="html5-video-container" data-layer="0"><video tabindex="-1" class="video-stream html5-main-video" style="width: 640px; height: 360px; left: 0px; top: 15px;" src="blob:https%3A//www.youtube.com/55bec1c3-7411-43dd-b012-5848e796ca07"></video></div><div class="ytp-gradient-top" data-layer="1"></div><div class="ytp-chrome-top ytp-watch-later-button-visible ytp-share-button-visible" data-layer="1"><button class="ytp-playlist-menu-button ytp-button" aria-owns="ytp_playlist_menu" aria-haspopup="true" aria-label="Danh sách phát" style="display: none;"><div class="ytp-playlist-menu-button-icon"><svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ytp-svg-2"></use><path d="m 22.53,21.42 0,6.85 5.66,-3.42 -5.66,-3.42 0,0 z m -11.33,0 9.06,0 0,2.28 -9.06,0 0,-2.28 0,0 z m 0,-9.14 13.6,0 0,2.28 -13.6,0 0,-2.28 0,0 z m 0,4.57 13.6,0 0,2.28 -13.6,0 0,-2.28 0,0 z" fill="#fff" id="ytp-svg-2"></path></svg></div><div class="ytp-playlist-menu-button-text"></div></button><div class="ytp-title"><a class="ytp-title-channel-logo" target="_blank"></a><div class="ytp-title-text"><a class="ytp-title-link yt-uix-sessionlink" target="_blank" data-sessionlink="feature=player-title" href="https://www.youtube.com/watch?v=Wdk0uYui3eQ"><span class="ytp-title-playlist-icon" style="display: none;"><svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ytp-svg-3"></use><path d="m 22.53,21.42 0,6.85 5.66,-3.42 -5.66,-3.42 0,0 z m -11.33,0 9.06,0 0,2.28 -9.06,0 0,-2.28 0,0 z m 0,-9.14 13.6,0 0,2.28 -13.6,0 0,-2.28 0,0 z m 0,4.57 13.6,0 0,2.28 -13.6,0 0,-2.28 0,0 z" fill="#fff" id="ytp-svg-3"></path></svg></span><span>HIGHLIGHT | TP.HỒ CHÍ MINH vs LONG AN (5-2) | VÒNG 6 VLEAGUE 2017</span></a></div><div class="ytp-title-subtext"><a class="ytp-title-channel-name" target="_blank"></a><span class="ytp-title-view-count"></span></div></div><div class="ytp-chrome-top-buttons"><button class="ytp-watch-later-button ytp-button" title="Xem sau bằng tên Trương Bảo Nam" data-tooltip-image="https://yt3.ggpht.com/-BczbUFxKYbw/AAAAAAAAAAI/AAAAAAAAAAA/6M1UBlMtTfk/s28-c-k-no-mo-rj-c0xffffff/photo.jpg"><svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ytp-svg-4"></use><path class="ytp-svg-fill" d="M18,8 C12.47,8 8,12.47 8,18 C8,23.52 12.47,28 18,28 C23.52,28 28,23.52 28,18 C28,12.47 23.52,8 18,8 L18,8 Z M16,19.02 L16,12.00 L18,12.00 L18,17.86 L23.10,20.81 L22.10,22.54 L16,19.02 Z" id="ytp-svg-4"></path></svg></button><button class="ytp-button ytp-share-button" title="Chia sẻ" aria-haspopup="true" aria-owns="ytp-share-panel"><svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ytp-svg-5"></use><path class="ytp-svg-fill" d="m 20.20,14.19 0,-4.45 7.79,7.79 -7.79,7.79 0,-4.56 C 16.27,20.69 12.10,21.81 9.34,24.76 8.80,25.13 7.60,27.29 8.12,25.65 9.08,21.32 11.80,17.18 15.98,15.38 c 1.33,-0.60 2.76,-0.98 4.21,-1.19 z" id="ytp-svg-5"></path></svg></button></div></div><button class="ytp-button ytp-cards-button" aria-label="Hiển thị thẻ" aria-owns="ytp-cards" aria-haspopup="true" data-layer="2" style="display: none;"><span class="ytp-cards-button-icon-default"><svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ytp-svg-1"></use><path class="ytp-svg-fill" d="M18,8 C12.47,8 8,12.47 8,18 C8,23.52 12.47,28 18,28 C23.52,28 28,23.52 28,18 C28,12.47 23.52,8 18,8 L18,8 Z M17,16 L19,16 L19,24 L17,24 L17,16 Z M17,12 L19,12 L19,14 L17,14 L17,12 Z" id="ytp-svg-1"></path></svg></span><span class="ytp-cards-button-icon-shopping"><svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><path class="ytp-svg-shadow" d="M 27.99,18 A 9.99,9.99 0 1 1 8.00,18 9.99,9.99 0 1 1 27.99,18 z"></path><path class="ytp-svg-fill" d="M 18,8 C 12.47,8 8,12.47 8,18 8,23.52 12.47,28 18,28 23.52,28 28,23.52 28,18 28,12.47 23.52,8 18,8 z m -4.68,4 4.53,0 c .35,0 .70,.14 .93,.37 l 5.84,5.84 c .23,.23 .37,.58 .37,.93 0,.35 -0.13,.67 -0.37,.90 L 20.06,24.62 C 19.82,24.86 19.51,25 19.15,25 c -0.35,0 -0.70,-0.14 -0.93,-0.37 L 12.37,18.78 C 12.13,18.54 12,18.20 12,17.84 L 12,13.31 C 12,12.59 12.59,12 13.31,12 z m .96,1.31 c -0.53,0 -0.96,.42 -0.96,.96 0,.53 .42,.96 .96,.96 .53,0 .96,-0.42 .96,-0.96 0,-0.53 -0.42,-0.96 -0.96,-0.96 z" fill-opacity="1"></path><path class="ytp-svg-shadow-fill" d="M 24.61,18.22 18.76,12.37 C 18.53,12.14 18.20,12 17.85,12 H 13.30 C 12.58,12 12,12.58 12,13.30 V 17.85 c 0,.35 .14,.68 .38,.92 l 5.84,5.85 c .23,.23 .55,.37 .91,.37 .35,0 .68,-0.14 .91,-0.38 L 24.61,20.06 C 24.85,19.83 25,19.50 25,19.15 25,18.79 24.85,18.46 24.61,18.22 z M 14.27,15.25 c -0.53,0 -0.97,-0.43 -0.97,-0.97 0,-0.53 .43,-0.97 .97,-0.97 .53,0 .97,.43 .97,.97 0,.53 -0.43,.97 -0.97,.97 z" fill="#000" fill-opacity="0.15"></path></svg></span></button><div class="ytp-unmute ytp-popup" data-layer="3" style="display: none;"><div class="ytp-unmute-inner"><div class="ytp-unmute-icon"><svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ytp-svg-27"></use><path class="ytp-svg-fill" d="m 21.48,17.98 c 0,-1.77 -1.02,-3.29 -2.5,-4.03 v 2.21 l 2.45,2.45 c .03,-0.2 .05,-0.41 .05,-0.63 z m 2.5,0 c 0,.94 -0.2,1.82 -0.54,2.64 l 1.51,1.51 c .66,-1.24 1.03,-2.65 1.03,-4.15 0,-4.28 -2.99,-7.86 -7,-8.76 v 2.05 c 2.89,.86 5,3.54 5,6.71 z M 9.25,8.98 l -1.27,1.26 4.72,4.73 H 7.98 v 6 H 11.98 l 5,5 v -6.73 l 4.25,4.25 c -0.67,.52 -1.42,.93 -2.25,1.18 v 2.06 c 1.38,-0.31 2.63,-0.95 3.69,-1.81 l 2.04,2.05 1.27,-1.27 -9,-9 -7.72,-7.72 z m 7.72,.99 -2.09,2.08 2.09,2.09 V 9.98 z" id="ytp-svg-27"></path></svg></div><div class="ytp-unmute-text">Bật âm thanh</div></div></div><div class="ytp-webgl-spherical-control" tabindex="0" aria-label="Kiểm soát video hình cầu. Sử dụng các phím mũi tên để xoay video." data-layer="4" style="display: none;"><svg height="100%" version="1.1" viewBox="0 0 50 50" width="100%"><use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ytp-svg-6"></use><use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ytp-svg-7"></use><circle cx="25" cy="25" fill="#fff" r="24" id="ytp-svg-6"></circle><path d="M11.46,29.41 L9.97,30.90 L4,24.95 L9.97,19 L11.46,20.48 L7.00,24.95 L11.46,29.41 M42.46,24.95 L38,20.48 L39.48,19 L45.46,24.95 L39.48,30.90 L38,29.41 L42.46,24.95 M24.5,42.43 L28.96,37.96 L30.45,39.45 L24.5,45.43 L18.54,39.45 L20.03,37.96 L24.5,42.43 M24.5,6.97 L20.03,11.43 L18.54,9.94 L24.5,3.96 L30.45,9.94 L28.96,11.43 L24.5,6.97 Z" fill="#999" id="ytp-svg-7"></path></svg></div><div class="ytp-thumbnail-overlay ytp-cued-thumbnail-overlay" data-layer="5" style="display: none;"><div class="ytp-thumbnail-overlay-image"></div><button class="ytp-large-play-button ytp-button" aria-label="Xem HIGHLIGHT | TP.HỒ CHÍ MINH vs LONG AN (5-2) | VÒNG 6 VLEAGUE 2017" style="display: none;"><svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%"><path class="ytp-large-play-button-bg" d="m .66,37.62 c 0,0 .66,4.70 2.70,6.77 2.58,2.71 5.98,2.63 7.49,2.91 5.43,.52 23.10,.68 23.12,.68 .00,-1.3e-5 14.29,-0.02 23.81,-0.71 1.32,-0.15 4.22,-0.17 6.81,-2.89 2.03,-2.07 2.70,-6.77 2.70,-6.77 0,0 .67,-5.52 .67,-11.04 l 0,-5.17 c 0,-5.52 -0.67,-11.04 -0.67,-11.04 0,0 -0.66,-4.70 -2.70,-6.77 C 62.03,.86 59.13,.84 57.80,.69 48.28,0 34.00,0 34.00,0 33.97,0 19.69,0 10.18,.69 8.85,.84 5.95,.86 3.36,3.58 1.32,5.65 .66,10.35 .66,10.35 c 0,0 -0.55,4.50 -0.66,9.45 l 0,8.36 c .10,4.94 .66,9.45 .66,9.45 z" fill="#1f1f1e" fill-opacity="0.81"></path><path d="m 26.96,13.67 18.37,9.62 -18.37,9.55 -0.00,-19.17 z" fill="#fff"></path><path d="M 45.02,23.46 45.32,23.28 26.96,13.67 43.32,24.34 45.02,23.46 z" fill="#ccc"></path></svg></button></div><div class="ytp-spinner" data-layer="5" style="display: none;"><div class="ytp-spinner-dots"><div class="ytp-spinner-dot ytp-spinner-dot-0"></div><div class="ytp-spinner-dot ytp-spinner-dot-1"></div><div class="ytp-spinner-dot ytp-spinner-dot-2"></div><div class="ytp-spinner-dot ytp-spinner-dot-3"></div><div class="ytp-spinner-dot ytp-spinner-dot-4"></div><div class="ytp-spinner-dot ytp-spinner-dot-5"></div><div class="ytp-spinner-dot ytp-spinner-dot-6"></div><div class="ytp-spinner-dot ytp-spinner-dot-7"></div></div><div class="ytp-spinner-message" style="display: none;">Nếu phát lại không bắt đầu ngay, hãy thử khởi động lại thiết bị của bạn.</div></div><div class="ytp-bezel" role="status" data-layer="5" style="display: none;"><div class="ytp-bezel-icon"></div></div><div data-layer="5" style="max-width: 200px; top: 315px; left: 458px; display: none;" class="ytp-tooltip ytp-bottom" aria-hidden="true"><div class="ytp-tooltip-bg" style="width: 159px; height: 89.5px;"><div class="ytp-tooltip-duration"></div></div><div class="ytp-tooltip-text-wrapper"><div class="ytp-tooltip-image"></div><div class="ytp-tooltip-title"></div><span class="ytp-tooltip-text">Phụ đề</span></div></div><div class="ytp-paid-content-overlay" aria-live="assertive" aria-atomic="true" data-layer="5"><div class="ytp-button ytp-paid-content-overlay-text" style="display: none;"></div></div><div class="ytp-storyboard" data-layer="5" style="display: none;"><div class="ytp-storyboard-filmstrip"></div><div class="ytp-storyboard-lens"><div class="ytp-storyboard-lens-thumbnail"></div><div class="ytp-storyboard-lens-timestamp-wrapper"><span class="ytp-storyboard-lens-timestamp"></span></div></div></div><div class="ytp-storyboard-framepreview" data-layer="5" style="display: none;"><div class="ytp-storyboard-framepreview-img"></div></div><div class="ytp-remote" data-layer="5" style="display: none;"><div class="ytp-remote-display-status"><div class="ytp-remote-display-status-icon"><svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ytp-svg-21"></use><path d="M7,24 L7,27 L10,27 C10,25.34 8.66,24 7,24 L7,24 Z M7,20 L7,22 C9.76,22 12,24.24 12,27 L14,27 C14,23.13 10.87,20 7,20 L7,20 Z M25,13 L11,13 L11,14.63 C14.96,15.91 18.09,19.04 19.37,23 L25,23 L25,13 L25,13 Z M7,16 L7,18 C11.97,18 16,22.03 16,27 L18,27 C18,20.92 13.07,16 7,16 L7,16 Z M27,9 L9,9 C7.9,9 7,9.9 7,11 L7,14 L9,14 L9,11 L27,11 L27,25 L20,25 L20,27 L27,27 C28.1,27 29,26.1 29,25 L29,11 C29,9.9 28.1,9 27,9 L27,9 Z" fill="#fff" id="ytp-svg-21"></path></svg></div><div class="ytp-remote-display-status-text"></div><div class="ytp-remote-display-status-receiver"></div></div></div><div class="ytp-ad-persistent-progress-bar-container" data-layer="5" style="display: none;"><div class="ytp-ad-persistent-progress-bar"></div></div><div class="ytp-upnext ytp-upnext-autoplay-paused" data-layer="5" style="display: none;"><div class="ytp-thumbnail-overlay-image"></div><div class="ytp-thumbnail-overlay-curtain"></div><span class="ytp-upnext-top"><span class="ytp-upnext-header">Tiếp theo</span><span class="ytp-upnext-title"></span><span class="ytp-upnext-author"></span></span><a class="ytp-upnext-autoplay-icon"><svg height="100%" version="1.1" viewBox="0 0 98 98" width="100%"><circle class="ytp-svg-autoplay-circle" cx="49" cy="49" fill="#000" fill-opacity="0.8" r="48"></circle><circle class="ytp-svg-autoplay-ring" cx="-49" cy="49" fill-opacity="0" r="46.5" stroke="#FFFFFF" stroke-dasharray="293" stroke-dashoffset="-293.00786865234375" stroke-width="4" transform="rotate(-90)"></circle><polygon class="ytp-svg-autoplay-triangle" fill="#fff" points="32,27 72,49 32,71"></polygon></svg></a><span class="ytp-upnext-bottom"><span class="ytp-upnext-cancel"><button class="ytp-upnext-cancel-button ytp-button" tabindex="0" aria-label="Hủy tự động phát">Hủy</button></span><span class="ytp-upnext-paused">Tự động phát bị tạm dừng.</span></span><span class="ytp-upnext-close"><button class="ytp-upnext-close-button ytp-button"></button></span></div><div class="html5-endscreen ytp-player-content videowall-endscreen" data-layer="5" style="display: none;"><button class="ytp-button ytp-endscreen-previous" aria-label="Trước"><svg height="100%" version="1.1" viewBox="0 0 32 32" width="100%"><path d="M 19.41,20.09 14.83,15.5 19.41,10.91 18,9.5 l -6,6 6,6 z" fill="#fff"></path></svg></button><div class="ytp-endscreen-content"></div><button class="ytp-button ytp-endscreen-next" aria-label="Tiếp theo"><svg height="100%" version="1.1" viewBox="0 0 32 32" width="100%"><path d="m 12.59,20.34 4.58,-4.59 -4.58,-4.59 1.41,-1.41 6,6 -6,6 z" fill="#fff"></path></svg></button></div><div class="ytp-player-content ytp-iv-player-content" data-layer="5"><div class="annotation annotation-type-custom iv-branding"><div class="branding-img-container"><img src="https://i.ytimg.com/an/qOmFFbm6NBv_1u9hnIZJmA/featured_channel.jpg?v=586f6f8b" class="branding-img iv-click-target" width="40" height="40" style="left: 0px; top: 0px;"></div><div class="branding-context-container-outer" style="right: 40px; width: 0px;"><div class="branding-context-container-inner" style="width: 134px; display: none;"><div class="iv-branding-context-subscribe-caret" style="left: 134px; top: 33px;"></div><div class="iv-branding-context-name">VPF Media</div><div class="iv-branding-context-subscribe"><span class="html5-stop-propagation yt-uix-button-subscription-container"><button class="yt-uix-button yt-uix-button-size-default yt-uix-button-subscribe-branded yt-uix-button-has-icon no-icon-markup yt-uix-subscription-button yt-can-buffer" type="button" onclick=";return false;" aria-role="button" aria-busy="false" aria-live="polite" data-style-type="branded" data-channel-external-id="UCqOmFFbm6NBv_1u9hnIZJmA" data-clicktracking="ei=E0WqWIi-GsbP4ALx_4_gAQ&amp;feature=iv"><span class="yt-uix-button-content"><span class="subscribe-label" aria-label="Đăng ký">Đăng ký</span><span class="subscribed-label" aria-label="Hủy đăng ký">Đã đăng ký</span><span class="unsubscribe-label" aria-label="Hủy đăng ký">Hủy đăng ký</span></span></button><span class="yt-subscription-button-subscriber-count-branded-horizontal subscribed yt-uix-tooltip" title="63.453 người đăng ký" tabindex="0">63K</span>


BKAV_Embbed = function() {
    this.yt_links = [];
    this.yt_titles = [];
    this.sc_links = [];
    this.page_url = location.href;
    this.embeded_count = 0;
    this.embed_query_pattern = /^(http|https)?:\/\/(?:www\.)youtube([a-zA-Z-])*\.com\/embed\/([^"]+)/gi;
    this.query_pattern = /^(http|https)?:\/\/(?:www\.)youtube([a-zA-Z-])*\.com\/v\/([^"]+)/gi;
    this.soundcloud_pattern = /^(http|https)?:\/\/w\.soundcloud\.com\/player\/([^"]+)/gi;
    this.vimeo_pattern = /^(http|https)?:\/\/([a-z\.\/]+)([0-9]+)/; //http://player.vimeo.com/video/160486354
    this.fb_pattern = '';
    this.selector = ['iframe[src*="youtube"]', 'embed[src*="youtube"]',
                     'iframe[src*="soundcloud.com"]', 'embed[src*="soundcloud.com"]',
                     'iframe[src*="player.vimeo.com/video/"]', 'embed[src*="player.vimeo.com/video/"]',
                     'span[data-video*="https://www.youtube.com/"]'
                     ].join();
 }

BKAV_Embbed.prototype = {
    fb_event: null,
    constructor: BKAV_Embbed,
    scanAllEmbededContent: function() {
        var embeded = document.querySelectorAll(this.selector);
        if (embeded.length > 0) {
            embeded_count = embeded.length;
            // Sample resource: http://www.youtube.com/embed/TGxEQhdi1AQ?rel=0
            // https://www.youtube-nocookie.com/embed/C-KGjXbfn_c?rel=0&amp;autoplay=1&amp;controls=2&amp;showinfo=0&amp;iv_load_policy=3&amp;cc_load_policy=1&amp;enablejsapi=1
            for (var i = 0; i < embeded.length; i++) {
                var title = GetFileName(embeded[i].ownerDocument.title);
                let source_ = embeded[i].src ? embeded[i].src : embeded[i].dataset.video;
                if (source_ && source_.match(this.embed_query_pattern)) {
                    var id = source_.split(/^(http|https)?:\/\/(?:www\.)youtube([a-zA-Z-])*\.com\/embed\//gi)[3];
                    id = id.split(/\?rel=([0-9]+)/)[0];
                    // ZBmGQeXHBEA?wmode=opaque"
                    if ((pos = id.indexOf('?')) != -1) id = id.substr(0, pos);
                    var yt_url = "https://www.youtube.com/watch?v=" + id;
                    var dictation_data = this.scanYoutubeDictateContent(source_, yt_url);
                    // this.queryData(url, title, dictation_data);
                } else if (embeded[i].src.match(this.query_pattern)) {
                    // http://www.youtube.com/v/rbQOkLOi9AA&hl=en_GB&fs=1&
                    var id = embeded[i].src.split(/^(http|https)?:\/\/(?:www\.)youtube([a-zA-Z-])*\.com\/v\//gi)[3];
                    id = id.split(/\?rel=([0-9]+)/)[0];
                    var yt_url = "https://www.youtube.com/watch?v=" + id;
                    var dictation_data = this.scanYoutubeDictateContent(embeded[i].src, yt_url);
                    // this.queryData(url, title, dictation_data);
                } else if (embeded[i].src.match(this.vimeo_pattern)) {
                    var id = embeded[i].src.match(this.vimeo_pattern)[3];
                    this.queryVimeoEmbedContent(id);
                }
                /*else if (embeded[i].src.match(this.soundcloud_pattern)) {
                    //https%3A//api.soundcloud.com/playlists/112136456%3Fsecret_token%3Ds-2H3uY
                    var url = embeded[i].src.split(this.soundcloud_pattern)[2];
                    url = url.split("&")[0].split("url=")[1];
                    this.querySoundCloud(url, title);
                }*/ else {
                    embeded_count--;
                }
            };
        }
    },

    // Temp download frame embeded content to analysis
    scanYoutubeDictateContent: function(url, yt_url) {
        var xhr = new XMLHttpRequest();
        xhr.url = yt_url;
        xhr.callback = this.queryData.bind();
        //Call in closure manner to reuse xhr request
        xhr.onload = function() {
            if (this.readyState == 4 && 200 === this.status) {
                var data = new DOMParser().parseFromString(this.responseText, "text/html");
                var title = data.title ? data.title : '';
                var scripts = data.scripts;
                var found_js = false;
                if (scripts != undefined) {
                    var arr = Array.prototype.slice.call(scripts);
                    if (Array.isArray(arr)) {
                        for (var i in arr) {
                            if (arr[i].hasAttribute('src')) {
                                var dictate = arr[i].getAttribute('src');
                                if (dictate.indexOf('//s.ytimg.com/yts/jsbin/player') >= 0) {
                                    found_js = true;
                                    this.callback(this.url, title, dictate);
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!found_js) {
                    this.callback(this.url, title, '');
                }
            }
        };
        xhr.onerror = function() {
            this.callback(this.url, '', '');
        }

        xhr.open('GET', url, true);
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.send();

        return [];
    },

    //https://www.facebook.com/doi4vodoi?fref=ts
    scanFacebookEmbededContent: function() {
        var fb_selector = 'embed[flashvars*="fbcdn.net"], embed[flashvars*="fbcdn-video-a"]';
        var embeded = document.querySelectorAll(fb_selector);
        if (embeded.length > 0) {
            window.clearInterval(_embed.fb_event);
            _embed.fb_event = null;
            var fb_links = [];
            for (var i = 0; i < embeded.length; i++) {
                var e = embeded[i].getAttribute("flashvars")
                var lst = e.split("&");
                for (var j = 0; j < lst.length; j++) {
                    if (lst[j].indexOf("params=") != -1) {
                        var f = decodeURIComponent(lst[j].split('=')[1]);
                        video_data = JSON.parse(f)['video_data'];
                        for (var k = 0; k < video_data.length; k++) {
                            if (video_data[k].hd_src != null) {
                                fb_links.push({
                                    title: video_data[k].video_id,
                                    quality: 'HD',
                                    link: video_data[k].hd_src
                                });
                            } else if (video_data[k].sd_src != null) {
                                fb_links.push({
                                    title: video_data[k].video_id,
                                    quality: 'SD',
                                    link: video_data[k].sd_src
                                });
                            }
                        }
                        break;
                    }
                }
            }

            if(fb_links.length > 0) {
                chrome.extension.sendMessage({
                    msg: "ON_SHOW_EMBEDED_FACEBOOK_VIDEO",
                    url: location.href,
                    fb_url: fb_links,
                })
            }
        }
    },
    // Assume only query link in current page, ignore other request
    queryData: function(url, title, dictation_data) {
        chrome.extension.sendMessage({
                msg: "ON_QUERY_VIDEO_URLS",
                tabId: randomString(6),
                yturl: url,
                js_dictate: dictation_data == '' ? '' : 'http:' + dictation_data
            },
            //callback function
            function processResponse(response) {
                _embed.getLinkResponse(response, title);
            });
    },
    querySoundCloud: function(url, title) {
        //callback function
        function processResponse(response) {
            this.page_url = location.href;
            this.sc_links = response.links;
            for (var i in this.sc_links) {
                var url = this.sc_links[i].url;
                var mime = this.sc_links[i].mime;
                var len = this.sc_links[i].len;
                if (!Array.isArray(url)) {
                    this.sc_links[i].url = [url];
                }
                if (!Array.isArray(mime)) {
                    this.sc_links[i].mime = [mime];
                }
                if (!Array.isArray(len)) {
                    this.sc_links[i].len = [len];
                }
            }
            chrome.extension.sendMessage({
                msg: "ON_SHOW_EMBEDED_SOUNDCLOUD",
                url: this.page_url,
                sc_links: this.sc_links,
                title: title
            })
        }
        SC.getPlaylist(decodeURIComponent(url), processResponse, true);
    },
    queryVimeoEmbedContent: function(id) {
        var url = "https://player.vimeo.com/video/" + id + "/config";
        var xhr = new XMLHttpRequest();
        xhr.callback = this.sendVimeoLink.bind();
        xhr.onload = function() {
            if (this.readyState == 4 && 200 === this.status) {
                var object = JSON.parse(this.responseText);
                var data = object.request.files.progressive;
                var title = object.video.title;
                var links = [];
                var Qualities = {
                    "f1080": "Full HD",
                    "f720": "HD",
                    "f480": "Standard",
                    "f360": "Medium",
                    "f240": "Small",
                    "source": "Normal",
                    "f": "Small"
                };

                for (var i = 0; i < data.length; i++) {
                  links.push({
                    url: [data[i].url],
                    mime: ['mp4'],
                    title: title + ' - ' + data[i].quality,
                    quality: [Qualities[data[i].quality]],
                    len: [undefined],
                    resolution: undefined,
                    media_type: "VIDEO_TYPE",
                  });
                }
                this.callback(title, links);
            }
        };
        xhr.onerror = function() {
            this.callback('', []);
        }

        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Referer', location.href);
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.setRequestHeader("Content-type", "text/html; charset=ISO-8859-1");
        xhr.send();
    },

    sendVimeoLink: function(title, vimeo_links) {
        embeded_count--;
        if(vimeo_links.length > 0) {
            chrome.extension.sendMessage({
                msg: "ON_SHOW_EMBEDED_VIMEO_VIDEO",
                title: title,
                url: location.href,
                vimeo_url: vimeo_links,
            })
        }
    },
    // Send to background
    // ThangLVb - fix loi mot so link embeded khong download duoc
    getLinkResponse: function(link, title) {
        embeded_count--;
        console.log('Get');
        if (link.length == 0) return;
        // Add title field
        this.yt_links.push(link.videoUrls);
        this.yt_titles.push(title);
        if (embeded_count == 0) {
            chrome.extension.sendMessage({
                msg: "ON_SHOW_EMBEDED_YOUTUBE_VIDEO",
                url: this.page_url,
                yturl: this.yt_links,
                title: this.yt_titles
            })
        }
    }
    // End [ThangLVb]
}
var _embed = new BKAV_Embbed();
_embed.scanAllEmbededContent();
