define([
        'text!templates/Filter/FilterTemplate.html',
        'custom',
        'common'
    ],
    function (ContentFilterTemplate, Custom, Common) {
        var FilterView;
        FilterView = Backbone.View.extend({
            el: '#searchContainer',
            contentType: "Filter",
            template: _.template(ContentFilterTemplate),

            events: {
                "mouseover .search-content": 'showSearchContent',
                "click .filter": 'showFilterContent',
                "click .drop-down-filter > input[type='checkbox']": "writeValue",
                "click #defaultFilter": "writeValue",
                "click .drop-down-filter > li": "triggerClick",
                "click .removeValues": "removeValues",
                'change .chooseTerm': 'chooseOptions',
                'click .addCondition': 'addCondition',
                'click .removeFilter': 'removeFilter',
                'click .customFilter': 'showCustomFilter',
                'click .applyFilter': 'applyFilter',
                'click .condition li': 'conditionClick'
            },


            initialize: function (options) {
                this.render(options);
            },

            render: function (options) {
                this.customCollection =  options.customCollection;

                this.$el.html(this.template({collection: this.collection, customCollection: options.customCollection}));

                return this;
            },

            applyFilter: function () {

                if (this.$el.find('.filterValues').children()[0] && this.$el.find('.filterValues').children()[0].className === 'Clear') {
                    this.$el.find('.filterValues').empty();
                    this.$el.find('.filter-icons').removeClass('active');
                    this.$el.find('#defaultFilter').removeAttr("checked");
                }
                this.trigger('filter');
            },

            conditionClick: function (e) {
                if (e.target.localName === 'li') {
                    $(e.target.children[0]).trigger('click');
                }
            },

            showCustomFilter: function () {
                this.$el.find(".filterOptions, .filterActions").toggle();
            },

            removeFilter: function (e) {
                var filter = this.$el.find('.filterOptions');
                var opt = this.$el.find('.chooseOption');
                var term = this.$el.find('.chooseTerm');
                var date = this.$el.find('.chooseDate');

                if (filter.length > 1 && e && e.target) {
                    if ( e && e.target) {
                        $(e.target).closest('.filterOptions').remove();
                    }
                } else {
                    filter.removeClass('chosen');
                    opt.children().remove();
                    term.val($(".chooseTerm option:first").val());
                    date.remove();
                    opt.removeClass('activated').show();
                    this.$el.find(".filterOptions, .filterActions").hide();
                   /* if (e && e.target) {
                        this.trigger('defaultFilter');
                        e.stopPropagation();
                    }*/

                }
            },

            addCondition: function () {
                var lastOpt;
                this.$el.find(".filterOptions:first").clone().insertBefore('.filterActions');

                lastOpt = this.$el.find(".filterOptions:last");
                lastOpt.children('.chooseOption').children().remove();
                lastOpt.children('.chooseOption').show().removeClass('activated');
                lastOpt.children('.chooseDate').remove();
                lastOpt.removeClass('chosen');
            },

            chooseOptions: function (e) {
                var el = $(e.target.nextElementSibling);
                var value  = e.target.value;
                var optDate = this.$el.find('.chooseDate');
                var liText;
                var values = this.customCollection[0][value]['values'] ? this.customCollection[0][value]['values'] : this.customCollection[0][value];

                $(e.target).closest('.filterOptions').addClass('chosen');

                if (/date/.test(value.toLowerCase())) {
                    el.html('').hide();
                    $('<div class=\'chooseDate\'><input id="start" type="date"/><input id="end" type="date"/><div>').insertBefore(el);
                } else {
                    if (optDate.length) {
                        optDate.remove();
                        el = $(e.target).next();
                    }

                    el.show();
                    el.children().remove();

                    values.forEach(function (opt) {
                        if (opt) {
                            if (opt.displayName) {
                                liText = opt.displayName;
                            } else {
                                liText = opt.fullName ? opt.fullName : (opt.projectName ? opt.projectName : opt.name);
                            }
                        }
                        el.addClass('activated')

                        if (opt && liText) {
                            el.append('<li><input type="checkbox" id=' + opt._id + ' value=' + opt._id + '><label for=' + opt._id + '>' + liText  + '</label></li>');
                        } else {
                            el.append('<li><input type="checkbox" id=' + opt + ' value=' + opt + '><label for=' + opt + '>' + opt  + '</label></li>');
                        }
                    });
                }
            },

            triggerClick: function (e) {
                if (e.target.localName === 'li') {
                    $(e.target.children[0]).trigger('click');
                }
            },

            showSearchContent: function () {
                var el = this.$el.find('.search-content');
                var searchOpt = this.$el.find('.search-options');
                var selector = 'fa-caret-up';

                searchOpt.toggle();

                if (el.hasClass(selector)) {
                    el.removeClass(selector)
                } else {
                    el.addClass(selector)
                }
                this.showFilterContent();
                this.showCustomFilter();
            },

            showFilterContent: function () {
                var filter = this.$el.find('.drop-down-filter');

                filter.toggle();
                return false;
            },

            writeValue: function (e) {
                var inputText = e.target.nextElementSibling.textContent;
                var filterValues = this.$el.find('.filterValues');
                var filterIcons = this.$el.find('.filter-icons');
                var input = this.$el.find('.drop-down-filter input');
                var defaultFilter = this.$el.find('#defaultFilter');
                var checked;

                filterIcons.addClass('active');

                $.each(input, function (index, value) {
                    if (value.checked) {
                        return checked = true
                    }
                });
                if (!checked) {
                    //this.trigger('defaultFilter');
                    filterValues.empty();
                    filterIcons.removeClass('active');
                }
                if (e.target.checked) {
                    filterValues.append('<span class=' + '"' + inputText + '">' + inputText + '</span>');

                } else {
                    filterValues.find('.' + inputText).remove();
                }

                if (e.target.id !== 'defaultFilter') {

                    defaultFilter.removeAttr('checked');
                    filterValues.find('.Default').remove();
                    this.trigger('filter');
                } else {
                    $.each(input, function (index, value) {
                        if (value.id !== 'defaultFilter') value.checked = false
                    });
                    $.each($('.filterValues span'), function (index, item) {
                        if (item.className !== 'Clear') item.remove();
                    });
                    this.removeFilter()
                    this.trigger('defaultFilter');
                }

               /* if ($('.drop-down-filter input:checkbox:checked').length === 0) {
                    this.trigger('defaultFilter');
                    //this.$el.find('.removeFilter').trigger('click')
                }*/

            },

            removeValues: function () {
                this.$el.find('.filterValues').empty();
                this.$el.find('.filter-icons').removeClass('active');

                $.each($('.drop-down-filter input'), function (index, value) {
                    value.checked = false
                });

                this.removeFilter()
                this.trigger('defaultFilter');
            }
        });

        return FilterView;
    });
