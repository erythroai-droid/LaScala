/* La Scala — главная страница. jQuery 3.x */
(function ($) {
  'use strict';

  $(function () {
    var $win = $(window);
    var $page = $('html, body');

    /* ---------- мобильное меню ---------- */
    var $toggle = $('.header__toggle');
    var $nav = $('.nav');

    function closeNav() {
      if (!$toggle.is(':visible')) { return; }
      $toggle.removeClass('is-open').attr('aria-expanded', 'false');
      $nav.stop(true, true).slideUp(200);
    }
    $toggle.on('click', function () {
      var open = !$toggle.hasClass('is-open');
      $toggle.toggleClass('is-open', open).attr('aria-expanded', String(open));
      $nav.stop(true, true).slideToggle(200);
    });
    $win.on('resize', function () {
      // вернуть меню в исходное состояние при переходе на десктоп
      if (!$toggle.is(':visible')) {
        $toggle.removeClass('is-open').attr('aria-expanded', 'false');
        $nav.removeAttr('style');
      }
    });

    /* ---------- плавный скролл по якорям ---------- */
    $('a[href^="#"]').on('click', function (e) {
      var id = $(this).attr('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var $target = $(id);
      if (!$target.length) { return; }
      e.preventDefault();
      closeNav();
      // фиксированная шапка перекрывает верх секции — оставляем под неё место
      var offset = $target.is('.hero, .footer') ? 0 : $('.header__bar').outerHeight() - 20;
      $page.stop().animate({ scrollTop: id === '#top' ? 0 : $target.offset().top - offset }, 700);
    });

    /* ---------- подсветка активного пункта меню ---------- */
    var $links = $('.nav__link');
    var sections = $links.map(function () {
      var $s = $($(this).attr('href'));
      return $s.length ? { $link: $(this), $el: $s } : null;
    }).get();

    function spy() {
      var pos = $win.scrollTop() + $win.height() * 0.4;
      var current = null;
      $.each(sections, function (i, s) {
        var top = s.$el.offset().top;
        if (top <= pos && (!current || top > current.$el.offset().top)) { current = s; }
      });
      $links.removeClass('is-active');
      if (current) { current.$link.addClass('is-active'); }
    }
    $win.on('scroll resize', spy);
    spy();

    /* ---------- слайдер в шапке ---------- */
    (function () {
      var $hero = $('.hero');
      var $slides = $hero.find('.hero__slide');
      var index = 0;
      var DELAY = 6000;
      var timer;

      function go(n) {
        index = (n + $slides.length) % $slides.length;
        $slides.removeClass('is-active').eq(index).addClass('is-active');
      }
      function play() { stop(); timer = setInterval(function () { go(index + 1); }, DELAY); }
      function stop() { clearInterval(timer); }

      $hero.find('.hero__arrow--next').on('click', function () { go(index + 1); play(); });
      $hero.find('.hero__arrow--prev').on('click', function () { go(index - 1); play(); });
      $hero.on('mouseenter', stop).on('mouseleave', play);

      swipe($hero, function () { go(index + 1); play(); }, function () { go(index - 1); play(); });
      play();
    })();

    /* ---------- карусель галереи (бесконечная) ---------- */
    (function () {
      var $carousel = $('.gallery__carousel');
      var $viewport = $carousel.find('.gallery__viewport');
      var $track = $carousel.find('.gallery__track');
      var busy = false;
      var SPEED = 450;

      function step() { return $track.children().first().outerWidth(true); }

      // базовый сдвиг: центрируем второй элемент, чтобы крайние превью уходили за края экрана
      function base() {
        var s = step();
        var gap = s - $track.children().first().outerWidth();
        return Math.round(($viewport.width() - (s - gap)) / 2 - s * 2);
      }
      function set(x, animate, done) {
        $track.css({
          transition: animate ? 'transform ' + SPEED + 'ms ease' : 'none',
          transform: 'translateX(' + x + 'px)'
        });
        if (animate) { setTimeout(done, SPEED + 20); }
      }

      function next() {
        if (busy) { return; }
        busy = true;
        set(base() - step(), true, function () {
          $track.append($track.children().first());
          set(base(), false);
          busy = false;
        });
      }
      function prev() {
        if (busy) { return; }
        busy = true;
        $track.prepend($track.children().last());
        set(base() - step(), false);
        $track[0].offsetWidth; // reflow
        set(base(), true, function () { busy = false; });
      }

      $carousel.find('.gallery__arrow--next').on('click', next);
      $carousel.find('.gallery__arrow--prev').on('click', prev);
      swipe($carousel, next, prev);
      $win.on('resize load', function () { if (!busy) { set(base(), false); } });
      set(base(), false);
    })();

    /* ---------- лайтбокс ---------- */
    (function () {
      var $box = $('.lightbox');
      var $img = $box.find('.lightbox__img');

      function close() { $box.removeClass('is-open').attr('aria-hidden', 'true'); }

      $(document).on('click', '.gallery__item', function (e) {
        e.preventDefault();
        $img.attr({ src: $(this).attr('href'), alt: $(this).find('img').attr('alt') || '' });
        $box.addClass('is-open').attr('aria-hidden', 'false');
      });
      $box.on('click', function (e) { if (!$(e.target).is($img)) { close(); } });
      $(document).on('keydown', function (e) { if (e.key === 'Escape') { close(); } });
    })();

    /* ---------- свайп для тач-устройств ---------- */
    function swipe($el, onLeft, onRight) {
      var x0 = null;
      $el.on('touchstart', function (e) { x0 = e.originalEvent.touches[0].clientX; });
      $el.on('touchend', function (e) {
        if (x0 === null) { return; }
        var dx = e.originalEvent.changedTouches[0].clientX - x0;
        x0 = null;
        if (Math.abs(dx) < 40) { return; }
        if (dx < 0) { onLeft(); } else { onRight(); }
      });
    }
  });
})(jQuery);
