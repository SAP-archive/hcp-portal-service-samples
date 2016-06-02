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
			if (!sap.ushell.Container.getService("SiteService").isRuntime()) {
				return;
			}
			var sciConfig = this.getOwnerComponent().getMetadata().getConfig().sci;
			if (sciConfig.useOverlay) {
				$("#hiddenLoginButton").find("a").click();
			}
			else {
				window.location.search = encodeURI(window.location.search === "" ? "?hc_login" : window.location.search + "&hc_login");
			}
		},

		onLogout: function() {
			if (!sap.ushell.Container.getService("SiteService").isRuntime()) {
				return;
			}
			sap.ushell.Container.logout();
		}

	});
});