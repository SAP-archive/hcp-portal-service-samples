sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function(Controller, MessageBox) {
	"use strict";

	return Controller.extend("JamGroupFeedWidget.controller.Main", {

		onPost: function(oEvent) {
			this.getView().byId("feedInput").setBusy(true);
			var config = this.getOwnerComponent().config;

			$.ajax({
				url: jQuery.sap.getModulePath("JamGroupFeedWidget") + config.jamUrl + config.feedEntries.replace("{groupId}", config.groupId),
				method: "POST",
				contentType: "application/json",
				data: JSON.stringify({
					Text: oEvent.getParameter("value")
				}),
				success: function() {
					this.getOwnerComponent().createModel();
				}.bind(this),
				error: function() {
					MessageBox.alert("Could not post to group feed");
				},
				complete: function() {
					this.getView().byId("feedInput").setBusy(false);
				}.bind(this)
			});
		},

		iconPathFormatter: function(str) {
			var config = this.getOwnerComponent().config;
			return jQuery.sap.getModulePath("JamGroupFeedWidget") + config.jamUrl + "/" + str;
		}

	});

});