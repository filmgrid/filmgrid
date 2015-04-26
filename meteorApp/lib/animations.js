// =============================================================================
// FILMGRID - ANIMATION FUNCTIONS
// =============================================================================


if (Meteor.isServer) return;


// =============================================================================
// Animation Helpers

var rAF = (function() {
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function(callback) { window.setTimeout(callback, 1000 / 60); };
})();

var ease = function(t) {
    if (t < 0.5) return 4 * t * t * t;
    return 1 - 4 * (1 - t) * (1 - t) * (1 - t);
};

animate = function(callback, duration) {
    var startTime = Date.now();
    var time = 0;

    function getFrame() {
        if (time < duration) rAF(getFrame);
        time = Date.now() - startTime;
        callback(Math.min(1, time/duration));
    }

    getFrame();
};

transition = function($el, property, value, duration) {
    $el.css('transition', property + ' ' + duration);

    document.body.offsetTop;  // redraw
    $el.css(property, value);

    // only trigger the transitionend callback once
    function callback() {
        $el.off('transitionend webkitTransitionEnd', callback);
        $el.css('transition', '');
    }
    $el.off('transitionend webkitTransitionEnd', callback);
}


// =============================================================================
// Effects

scrollTo = function(pos, time) {
    if (pos < 0) pos = 0;
    if (time == null) time = 1000;

    var startPosition = $(window).scrollTop();
    var distance = pos - startPosition;

    var animation = animate(function(t) {
        document.body.scrollTop = document.documentElement.scrollTop = startPosition + distance * ease(t);
    }, time);
};

// Adds an animation class to $el and removes it when the animation is complete
flash = function($el, className, time) {
    setTimeout(function() {
        $el.removeClass(className);
    }, time);
    $el.addClass(className);
}


// =============================================================================
// Slider

touchSlider = function($el, callbacks) {
    var $body = $('body');
    var startX;
    var moveX

    function onStart(e) {
        $body.on('touchmove', onMove);
        $body.on('touchend touchcancel', onEnd);
        startX = moveX = e.originalEvent.touches[0].clientX;
        if (callbacks.onStart) callbacks.onStart(startX);
    }

    function onMove(e) {
        moveX = e.originalEvent.touches[0].clientX;
        var x = Math.max(-240, moveX - startX);
        if (callbacks.onMove) callbacks.onMove(moveX - startX);
        e.preventDefault();
    }

    function onEnd(e) {
        $body.off('touchmove', onMove);
        $body.off('touchend touchcancel', onEnd);
        if (callbacks.onEnd) callbacks.onEnd(moveX - startX);
    }

    $el.on('touchstart', onStart);
};


easeExpo = function(i, halflife) {
    return 1 - Math.exp(-i/halflife);
}