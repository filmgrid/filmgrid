// =================================================================================================
// FILMGRID - DROPDOWN
// =================================================================================================


Template.dropdown.created = function() {
    var _this = this;
    this.selected = new ReactiveVar(this.data.selected || []);
    this.expanded = new ReactiveVar(false);

    $('body').click(function() {
        _this.expanded.set(false);
    });
};

Template.dropdown.helpers({
    dropdownClass: function() {
        return Template.instance().expanded.get() ? 'expanded' : '';
    },
    wrapClass: function(x) {
        var selected = Template.instance().selected.get();
        var active = x ? _.contains(selected, x) : !selected.length;
        return active ? 'active' : '';
    },
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
        template.data.onChange([]);
    },
    'click .dropdown-wrap': function(event, template) {
        if (!template.expanded.get()) return;

        var selected = template.selected.get();
        var item = '' + this;

        if (_.contains(selected, item)) {
            selected = _.without(selected, item);
        } else {
            selected.push(item);
        }

        template.selected.set(selected);
        template.data.onChange(selected);
    }
};
