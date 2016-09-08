sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("JamSearchWidget.controller.Main", {

		onInit: function() {
			this.getView().setBusyIndicatorDelay(0);
		},
		
		onSearch: function(oEvent) {
			var component = this.getOwnerComponent();
			component.config.searchQuery = oEvent.getParameter("query");
			component.createModel();
		},
		
		onSelectionChange: function(oEvent) {
			var webUrl = oEvent.getSource().getSelectedItem().data("webUrl");
			var prefix = jQuery.sap.getModulePath("JamSearchWidget") + "/destinations/jam";
			var suffix = webUrl.substring(webUrl.indexOf(prefix) + prefix.length);
			window.open(this.getOwnerComponent().config.jamTenantUrl + suffix);
		}
		
	});

});