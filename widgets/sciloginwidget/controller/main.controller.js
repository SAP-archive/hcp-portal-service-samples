sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("SCILoginWidget.controller.main", {

		onBeforeRendering: function() {
			if (sap.ushell.Container.getUser().getFullName() === "Guest") {
				this.getView().byId("logoutButton").setVisible(false);
			}
			else {
				this.getView().byId("loginButton").setVisible(false);
			}
		},

		onLogin: function() {
			var sciConfig = this.getOwnerComponent().getMetadata().getConfig().sci;
			if (sciConfig.useOverlay) {
				$("#hiddenLoginButton").find("a").click();
			}
			else {
				var search = window.location.search === "" ? "?hc_login" : window.location.search + "&hc_login";
				window.location.search = search;
			}
		},

		onLogout: function() {
			sap.ushell.Container.logout();
		}

	});
});