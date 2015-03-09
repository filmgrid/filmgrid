// =================================================================================================
// FILMGRID - SHARED FUNCTIONS
// =================================================================================================


// Wrapper that prevents a function `fn` from being triggered more than every `t` ms.
throttle = function(fn, t) {
    var delay = false;
    var repeat = false;
    return function() {
        if (delay) {
            repeat = true;
        } else {
            fn.apply(null, arguments);
            delay = true;
            setTimeout(function() {
                if (repeat) fn.apply(null, arguments);
                delay = false;
                repeat = false;
            }, t);
        }
    }
};


// Returns the index of the first element `x` in `array`, where `fn(x)` is truthy.
// Returns -1 otherwise.
findIndex = function (array, fn) {
    for (var i = 0; i < array.length; ++i) {
        if (fn(array[i])) return i;
    }
    return -1;
};


// Swaps elements `i` and `j` in `array`
swap = function(array, i, j){
    if (array[i] && array[j]) {
        var buff = array[i]
        array[i] = array[j]
        array[j] = buff;
    }
};


var eventCache = {};

App = {
    on: function(name, callback) {
        if (!eventCache[name]) eventCache[name] = [];
        eventCache[name].push(callback);
    },
    off: function(name, callback) {
        if (eventCache[name]) {
            eventCache[name] = _.filter(eventCache[name], function(fn) { return fn !== callback });
        }
    },
    clear: function(name) {
        eventCache[name] = null;
    },
    trigger: function(name, args) {
        if (eventCache[name]) {
            _.each(eventCache[name], function(fn) { fn(args); });
        }
    }
};


if (Meteor.isClient) {

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
    flash = function($el, class) {
        $el.one('webkitAnimationEnd animationend', function() {
            $el.removeClass(class);
        });
        $el.addClass(class);
    }

}
