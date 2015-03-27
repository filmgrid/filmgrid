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

bound = function(x, min, max){
    return Math.min(Math.max(min, x), max);
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
