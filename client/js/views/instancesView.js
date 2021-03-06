/**
* COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

define(["jquery", "backbone", "underscore", "../broadcast",
        "../collections/instances",
        "../models/filter",
        "hbars!templates/instances.template",
        "hbars!templates/instanceFiltering.template"],
function($, Backbone, _, Broadcast, InstancesCollection, FilterModel, instancesTemplate,
    instanceFilterTemplate) {
    
    return Backbone.View.extend({
        el : "#main-content",

        initialize: function() {
            this.filters = new FilterModel();
            this.filters.on("change", _.bind(this.filterChange, this));

            Broadcast.on("change:instances", _.bind(this.instancesChange, this));
        },

        events : {
            "click .metadata-value" : "filterByMetadata",
            "click .filter-remove" : "removeFilter"
        },

        filterByMetadata: function(event) {
            var target = $(event.currentTarget);
            this.filters.set(target.data("key"), target.text());
        },

        renderFilters : function() {
            this.$(".instance-filtering").html(instanceFilterTemplate(this.filters.toJSON()));
        },

        filterChange: function() {
            this.renderInstances();
            this.renderFilters();
        },

        instancesChange: function(roleName) {
            if (this.$(".instance-list[data-role='"+roleName+"']").length) {
                this.render(roleName);
            }
        },

        removeFilter: function(event) {
            this.filters.unset($(event.currentTarget).data("key"));
        },

        renderInstances : function() {
            var data = {},
                filtersJson = this.filters.toJSON(),
                filteredSet = [];

            if (_.keys(filtersJson).length > 0) {
                _.each(this.instances.toJSON(), function(instance) {
                    var filterCount = 0;

                    for (var key in filtersJson) {
                        var meta = instance.metadata;
                        if (meta.hasOwnProperty(key) && meta[key] === filtersJson[key]) {
                            filterCount++;
                        }
                    }

                    // check each filter
                    if (filterCount === _.keys(filtersJson).length) {
                        filteredSet.push(instance);
                    }
                });
            } else {
                filteredSet = this.instances.toJSON();
            }

            // Handlebars doesn't consider '{}' to be falsy with #if
            _.each(filteredSet, function(instance) {
                instance.hasMetadata = !_.isEmpty(instance.metadata);
            });

            data.instances = filteredSet;
            data.role = this.roleName;
            data.showing = filteredSet.length;
            data.total = this.total;

            this.$el.html(instancesTemplate(data));
        },

        fetchCallback: function(collection) {
            this.total = collection.length;

            this.renderInstances();
            Broadcast.trigger("role:change", {name : this.roleName, silent : true});
        },

        render: function(roleName) {
            this.filters.clear({silent: true});

            this.roleName = roleName;
            this.instances = new InstancesCollection([], {name:this.roleName});
            this.instances.fetch({success : _.bind(this.fetchCallback, this)});
        }
    });
});