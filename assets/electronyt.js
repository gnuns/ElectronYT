var appUserAgent = 'Mozilla/5.0 (X11; CrOS x86_64 7520.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.4 Safari/537.36';
var ytdl = require('ytdl-core');
var request = require("request");
var cheerio = require("cheerio");
window.$ = window.jQuery = require('./assets/jquery.min.js');
$.ajaxSetup({
  beforeSend: function(request) {
    request.setRequestHeader("User-Agent",appUserAgent);
  }
});
document.addEventListener("keydown", function (e) {
  if (e.which === 123) {
    require('remote').getCurrentWindow().toggleDevTools();
  } else if (e.which === 116) {
    location.reload();
  }
});
var sPage = 1,
    sQuery = "";
function loadvideo(vURL) {
  $("#playerContainer").show();
  $("#player").html("");
  $("#urlInput").val(vURL);
  $("body").css("cursor", "progress");
  $("#pluswrap").fadeToggle();
  $("html, body").animate({ scrollTop: 0 }, "slow");
  ytdl.getInfo(vURL, {
    downloadURL: true,
    debug: true,
    }, function(err, info) {
    if (err) {
      console.error(err);
      $("#player").html('<div class="alert alert-danger" role="alert"> '+
                        '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> '+
                        err.message+'</div>');
      $("body").css("cursor", "default");
      $("#pluswrap").fadeToggle();
      return;
    }
    console.log(info);
    var video = info.formats.find(function(element, index, array){
        return (element.itag == "22"); //hq
    });
    format = "mp4";
    if(typeof video == 'undefined') {
      video = info.formats.find(function(element, index, array){
          return (element.itag == "43");
      });
      var format = "webm";
      if(typeof video == 'undefined') {
        video = info.formats.find(function(element, index, array){
            return (element.itag == "18");
        });
      }
      var format = "mp4";
    }
    console.log(video.url);
    $("#player").html("");
    $("body").css("cursor", "default");
    $("#pluswrap").fadeToggle();
    var player = new Clappr.Player(
      {
        mimeType:"video/" +format,
        source: video.url,
        poster: info.iurlhq,
        preload: 'auto',
        parentId: "#player",
        width:"100%",
        height:"100%",
        mediacontrol: {seekbar: "#16a085"},
        baseUrl: "./assets/clappr",
        watermark: info.watermark[0],
        position: 'top-right',
        /*watermarkLink: 'https://www.youtube.com/channel/' + info.ucid,*/
        plugins: {
          'core': [PlaybackRatePlugin]
        },
        playbackRateConfig: {
          defaultValue: '1.0',
          options: [
              {value: '0.25', label: '0.25x'},
              {value: '0.5', label: '0.5x'},
              {value: '0.75', label: '0.75x'},
              {value: '1.0', label: '1x'},
              {value: '1.25', label: '1.25x'},
              {value: '1.50', label: '1.5x'},
              {value: '2.0', label: '2x'},
          ]
        }
      }
    );
    function resizePlayer(){
      var aspectRatio = 9/16,
      newWidth = document.getElementById('player').parentElement.offsetWidth - 30,
      newHeight = 2 * Math.round(newWidth * aspectRatio/2);
      player.resize({width: newWidth, height: newHeight});
    }

    resizePlayer();
    window.onresize = resizePlayer;
    $("#vTitle").html('<b style="color:#191919">'+ info.title +
                      '</b> <span style="font-size:0.9em;color:#909090">'+
                      'by <a target="_blank" href="https://www.youtube.com/channel/' +
                      info.ucid +'">' + info.author + "</a></span>");
    $("#vTitle").show();
    document.title = info.title + ' by ' + info.author + ' - Youtube';
  });
}
function searchVideos(word, more) {
  if(typeof more == 'undefined') {
    sPage = 1;
  }
  else {
    sPage++;
  }
  request({
    url: "http://www.youtube.com/results?search_query=" + encodeURIComponent(word) + "&page=" + sPage,
    headers: {
      'User-Agent': appUserAgent
    }
  }, function(error, response, body) {
    var _ = cheerio.load(body);
    $("body").css("cursor", "default");
    $("#pluswrap").fadeToggle();
    if(sPage === 1) {
      $("#searchResults").html("");
    }
    _(".yt-lockup").each(function() {
      var res = _(this);
      if(res.hasClass("yt-lockup-video")){
        var vidId = res.attr("data-context-item-id");
        var vidComp = '<li class="col-md-3" onclick="loadvideo(\'http://www.youtube.com/watch?v='+vidId+'\')">' +
          '<div class="thumbnail vidresult" style="padding: 0">'+
            '<div style="padding:4px">'+
            '  <img alt="300x200" style="width: 100%" src="http://img.youtube.com/vi/'+vidId+'/mqdefault.jpg">'+
            '</div>'+
          '  <div class="caption">'+
            '  <p><strong>'+_(res.find(".yt-uix-tile-link")).text()+'</strong> <br> '+_(res.find(".video-time")).text()+'</p>'+
            '</div>'+
          '</div>'+
        '</li>';
        $("#searchResults").append(vidComp);
      }
    });
    $('#loadMore').fadeIn('fast');
    document.title = word + ' - Youtube';
  });
}
