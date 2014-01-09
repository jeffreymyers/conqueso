/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "backbone", "underscore", "../broadcast", "../models/role", "../collections/properties",
        "./deletePropertyView", "./addPropertyView",
        "hbars!templates/properties.template"],
function($, Backbone, _, Broadcast, RoleModel, PropertiesCollection,
         DeletePropertyView, AddPropertyView, mainTemplate) {
    
    return Backbone.View.extend({
        el : "#main-content",

        initialize: function() {
            this.removeView = new DeletePropertyView();
            this.removeView.on("property:delete", _.bind(this.render, this));

            this.addView = new AddPropertyView();
            this.addView.on("property:add", _.bind(this.render, this));
        },

        events : {
            "mouseover .list-group-item" : "mouseOverPropertyRow",
            "mouseout  .list-group-item" : "mouseOutPropertyRow",
            "click .remove"              : "removeProperty",
            "click .add-property"        : "addProperty"
        },

        fetchCallback: function(model) {
            this.properties = new PropertiesCollection(model.properties, {name : model.get("name")});
            this.$el.html(mainTemplate(model.toJSON()));
            Broadcast.trigger("role:change", {name : model.get("name")});
        },

        render: function(roleName) {
            this.roleName = roleName;
            this.role = new RoleModel({id : roleName});
            this.role.getProperties(_.bind(this.fetchCallback, this));
        },

        toggleRemove: function(event, showHide) {
            $(event.currentTarget).find(".controls").toggle(showHide);
        },

        mouseOutPropertyRow: function(event) {
            this.toggleRemove(event, false);
        },

        mouseOverPropertyRow: function(event) {
            this.toggleRemove(event, true);
        },

        getRole: function(event) {
            return $(event.currentTarget).data("role");
        },

        getPropertyName: function(event) {
            return $(event.currentTarget).data("name");
        },

        addProperty: function(event) {
            this.addView.render(this.getRole(event));
        },

        removeProperty: function(event) {
            this.removeView.render(this.getRole(event), this.getPropertyName(event));
        },
    });

});