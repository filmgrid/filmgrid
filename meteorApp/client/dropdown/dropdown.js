// =================================================================================================
// FILMGRID - DROPDOWN
// =================================================================================================



Template.dropdown.created = function() {
    var _this = this;

    this.items    = new ReactiveVar(this.data.items || []);
    this.selected = new ReactiveVar(this.data.selected || []);
    this.expanded = new ReactiveVar(false);
    
    if (this.data.select) {
        var options = {};
        _.each(this.data.select, function(x, y) { options[y] = x[0]; });
        this.options  = new ReactiveVar(options);
    }

    $('body').click(function() {
        _this.expanded.set(false);
    });

    // Dynamic updating of values based on session variables
    if (this.data.dynamic) {
        var update = function(value) {
            _this.data.items[_this.data.dynamic.index] = value;
            _this.items.set(_this.data.items);
            _this.selected.set([value]);
        }

        update(Session.get(this.data.dynamic.initial))

        App.on(this.data.dynamic.event, function(value) {
            _this.expanded.set(false);
            update(value);
            _this.data.onChange([value]);
        });
    }
};

Template.dropdown.helpers({
    allItems: function() {
        return Template.instance().items.get();
    },
    dropdownClass: function() {
        return Template.instance().expanded.get() ? 'expanded' : '';
    },
    showImages: function() {
        return !!Template.instance().data.images;
    },
    imageSrc: function(x) {
        return Template.instance().data.images[x];
    },
    wrapClass: function(x) {
        var selected = Template.instance().selected.get();
        var active = x ? _.contains(selected, x) : !selected.length;
        return active ? 'active' : '';
    },
    wrapStyle: function(x) {
        var colours = Template.instance().data.colours;
        return colours ? 'background-color: '+ colours[x] : '';
    },
    hasSelect: function(x) {
        return !!(Template.instance().data.select && Template.instance().data.select[x]);
    },
    selectItems: function(x) {
        return Template.instance().data.select[x];
    }
});

Template.dropdown.events = {
    'click .dropdown': function(event, template) {
        event.stopPropagation();
        if (!template.expanded.get()) template.expanded.set(true);
    },
    'click .dropdown-all': function(event, template) {
        if (!template.expanded.get()) return;
        event.stopPropagation();
        template.expanded.set(false);
        template.selected.set([]);
        template.data.onChange([], {});
    },
    'click .dropdown-wrap': function(event, template) {
        if (!template.expanded.get()) return;

        var selected = template.selected.get();
        var item = '' + this;
        var options = template.options ? template.options.get() : {};

        if (template.data.multiSelect) {
            if (_.contains(selected, item)) {
                selected = _.without(selected, item);
            } else {
                selected.push(item);
            }
        } else {
            selected = [item];
            event.stopPropagation();
            template.expanded.set(false);
        }

        template.selected.set(selected);
        template.data.onChange(selected, options);
    },
    'click select': function(event) {
        event.stopPropagation();
    },
    'change select': function(event, template) {
        var options = template.options.get();
        options['' + this] = event.target.value;
        template.options.set(options);

        template.data.onChange(template.selected.get(), options);
    },
    'click .dropdown-footer': function(event) {
        event.stopPropagation();
    }
};
