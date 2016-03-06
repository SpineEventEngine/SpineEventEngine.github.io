/*!
 * Spine Theme
 */

// Preloader
jQuery(window).load(function() {
  // will first fade out the loading animation
  jQuery("#status").fadeOut();
  // will fade out the whole DIV that covers the website.
  jQuery("#preloader").delay(1000).fadeOut("slow");
})

// jQuery to collapse the navbar on scroll
$(window).scroll(function() {
  if ($(".navbar").offset().top > 50) {
    $(".navbar-fixed-top").addClass("top-nav-collapse");
  } else {
    $(".navbar-fixed-top").removeClass("top-nav-collapse");
  }
});

$(document).ready(function(){

  if ( !$('body').hasClass('blog') ) {
    var scrollBarWidth = getScrollBarWidth();

    $('.navbar-fixed-top').width($('body').width()
        - scrollBarWidth
        - parseFloat($('.navbar-fixed-top').css('padding-left'))
        - parseFloat($('.navbar-fixed-top').css('padding-right')));
  }

  if ($('.parallax').scrollTop() > 100) {
    $(".navbar-fixed-top").addClass("top-nav-collapse animated");
  } else {
    $(".navbar-fixed-top").removeClass("top-nav-collapse animated");
  }

  $('.parallax').scroll(function(){
    if ($('.parallax').scrollTop() > 100) {
      $(".navbar-fixed-top").addClass("top-nav-collapse animated");
    } else {
      $(".navbar-fixed-top").removeClass("top-nav-collapse animated");
    }
  });

  $(window).resize(function(){
    if ( !$('body').hasClass('blog') ) {
      $('.navbar-fixed-top').width($('body').width()
          - scrollBarWidth
          - parseFloat($('.navbar-fixed-top').css('padding-left'))
          - parseFloat($('.navbar-fixed-top').css('padding-right')));
    }
  });
});

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
  $('a.page-scroll').bind('click', function(event) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top - 64)
    }, 1500, 'easeInOutExpo');
    event.preventDefault();
  });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
  target: '.navbar-fixed-top',
  offset: 65
})

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
  $('.navbar-toggle:visible').click();
});

// HTML5 Placeholder
$(function() {
  $('input, textarea').placeholder();
});

// Load WOW.js on non-touch devices
var isPhoneDevice = "ontouchstart" in document.documentElement;
$(document).ready(function() {
  if (isPhoneDevice) {
    //mobile
  } else {
    //desktop
    wow = new WOW({
      offset: 50
    });
    wow.init();
  }
});

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