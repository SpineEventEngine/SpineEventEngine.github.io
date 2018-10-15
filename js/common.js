//Mobile navigation toggle
$(document).ready(function(){
    $('#nav-icon-menu').click(function(){
        $(this).toggleClass('open');
        $('body').toggleClass('navigation-opened');
        return false;
    });
});

//Mobile navigation — doc-list toggle
$('.doc-list-toggle').on('click', function(){
    $('.doc-list-inside').toggleClass('active');
    $(this).toggleClass('active');
});

// Youtube Player API
// create script tag and add to DOM
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Array of videoIds
// The key corresponds to the data attributes in about/index.html
var playerInfoList = [
    {type: 'yt', key: 'UOIJNygDNlE'}, 
    {type: 'yt', key: 'nz-LcdoMYWA'}, 
    {type: 'yt', key: 'sZx3oZt7LVg'}, 
    {type: 'yt', key: 'RvUP7vX2P4s'}, 
    {type: 'slideshare', key: 'https://www.slideshare.net/sujatatibre/g-rpc-talk-with-intel-3'}, 
    {type: 'slideshare', key: 'https://www.slideshare.net/VarunTalwar4/grpc-design-and-implementation'},
    {type: 'slideshare', key: 'https://www.slideshare.net/VarunTalwar4/grpc-overview'},
    {type: 'slideshare', key: 'https://www.ustream.tv/recorded/86187859'}
];  

function createPlayer(key) {
  $('#player').append('<iframe id="ytplayer" type="text/html" width="640" height="390" src="https://www.youtube.com/embed/'+key+'" frameborder="0" allowfullscreen>');
}

// click event for presentations/talks in about 
$('.pt').on('click', function() {
  var self = this,
      video = playerInfoList.filter(function(obj) {
        return obj.key == $(self).data('key'); 
      })[0];


  if (video.type == 'yt') {
    createPlayer(video.key);
  } else {
    window.open(video.key);
  }

  resizePlayer();
  $('#player iframe').on('load', function() {
    $('.pt-lightbox').addClass('active');
  });
});


// Close lightbox when clicking anywhere on overlay
$('.pt-lightbox').on('click', function() {
  if ($(this).hasClass('active')) {
    $(this).removeClass('active');
    $(this).find('iframe').remove();
    $('body, html').removeClass('noscroll');
  }
});

// Resize Player 
function resizePlayer() {
  var $inner = $('.pt-player'),
      defaultHeight = window.innerHeight || document.documentElement.clientHeight,
      defaultWidth = window.innerWidth || document.documentElement.clientWidth,
      maxHeight = defaultHeight*.75,
      maxWidth = defaultWidth*.75,
      newWidth = maxWidth,
      newHeight = 16 * maxWidth / 9;

  if (defaultWidth > defaultHeight){
      if (newHeight > maxHeight){
        newWidth = 16 * maxHeight / 9;
        newHeight = maxHeight;
      }   
  } else {
      newWidth = 16 * maxHeight / 9;
      newHeight = maxHeight;
      if (newWidth > maxWidth){
          newHeight = 9 * maxWidth / 16; 
          newWidth = maxWidth;
      }   
  }   

  $inner.css({"width": newWidth, "height": newHeight});
}



// Jquery UI for tabbed panes
$.getScript("https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js", function(){
  setupTabs();
});

// Add the 'external' class to every outbound link on the site.
// The css will add a small right arrow after the link.
$('a').filter(function() {
   return this.hostname && this.hostname !== location.hostname;
}).addClass("external");

// Remove external mark on Octocat icons, that already look external enough.
$("i.fa-github-alt").parent().removeClass("external");

//Set up tabs
function setupTabs(rootElement) {
      rootElement = rootElement || document;
      var tabs = $(rootElement).find('div.tabs');
      if(tabs.length > 0) {
        tabs.tabs();
      }
};

// Prettyprint
$('pre').addClass("prettyprint");
$.getScript("https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js", function(){
});

// Collapsible navbar menu, using https://github.com/jordnkr/collapsible
$.getScript("/js/jquery.collapsible.js", function(){
  highlightActive();
  $('.submenu').collapsible();
});

// Remove class from the paren element when the child is active
$(function() {
    if ($('#doc-side-nav-inside a').hasClass('current')) {
        var element = document.getElementById('side-nav-parent-item');
        element.classList.remove('current');
    }
});

var tocNav = $('#toc');
$(function() {
//Calls the tocify method on your HTML nav.
    tocNav.tocify({selectors:"h2, h3, h4", showAndHide: false, scrollTo: 64, extendPage: false});
});

window.onscroll = function() {
    FixToc();
    FixHead();
};

//Fix TOC navigation on page while scrolling
function FixToc() {
    if (tocNav.length > 0) {
        var tocNavFixedPosition = 120; //Sticky TOC offset
        if (window.pageYOffset > tocNavFixedPosition) {
            tocNav.addClass("sticky");
        }
        else {
            tocNav.removeClass("sticky");
        }
    }
}

//Animation header on scroll
function FixHead() {
    var header = $('#header');
    if (header.length > 0) {
        var headerFixPosition = $(".nav-hero-container").innerHeight();
        if (window.pageYOffset > headerFixPosition) {
            header.addClass("not-top"); //When navigation below offset
            header.addClass("pinned"); //When navigation below hero section
            header.removeClass("unpinned");
        }
        else {
            header.removeClass("pinned");
            header.addClass("unpinned");
        }

        //Return classes to the initial state when the navigation at the top of the page
        if (window.pageYOffset === 0) {
            header.removeClass("not-top");
            header.removeClass("unpinned");
        }
    }
}
