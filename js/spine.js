/*!
 * Spine Theme
 */


$(document).ready(function(){

  $(window).scroll(function() {
    if ($(".navbar").offset().top > 50) {
      $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
      $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
  });

  if ($(".navbar").offset().top > 50) {
    $(".navbar-fixed-top").addClass("top-nav-collapse");
    wow.init();
  } else {
    $(".navbar-fixed-top").removeClass("top-nav-collapse");
  }

  if ( !$('body').hasClass('blog') ) {
    var scrollBarWidth = getScrollBarWidth();
    calculateNaviWidth(scrollBarWidth);
  }

  $('.parallax').scroll(function(){
    anmatedNaviMain();
  });

  $(window).resize(function(){
    if ( !$('body').hasClass('blog') ) {
      calculateNaviWidth(scrollBarWidth);
    }
  });

  // Load WOW.js on non-touch devices
  var isPhoneDevice = "ontouchstart" in document.documentElement;
  if (isPhoneDevice) {
  } else {
    wow = new WOW({
      offset: 50
    });
    wow.init();
  }
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
  $('.navbar-toggle:visible').click();
});

function anmatedNaviMain() {
  if ($('.parallax').scrollTop() > 100) {
    $(".navbar-fixed-top").addClass("top-nav-collapse");
  } else {
    $(".navbar-fixed-top").removeClass("top-nav-collapse");
  }
}

function calculateNaviWidth(scrollBarWidth) {
  $('.navbar-fixed-top').width($('body').width()
      - scrollBarWidth
      - parseFloat($('.navbar-fixed-top').css('padding-left'))
      - parseFloat($('.navbar-fixed-top').css('padding-right')));
}

function getScrollBarWidth() {
  var inner = document.createElement('p');
  inner.style.width = "100%";
  inner.style.height = "200px";

  var outer = document.createElement('div');
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild(inner);

  document.body.appendChild(outer);
  var w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  var w2 = inner.offsetWidth;

  if (w1 == w2) {
    w2 = outer.clientWidth;
  }

  document.body.removeChild(outer);

  return (w1 - w2);
}