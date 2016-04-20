sap.ui.define([
    "sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";

	return UIComponent.extend("SCILoginPlugin.Component", {

		metadata: {
			manifest: "json"
		},

		sciConfig: null,

		init: function() {
			UIComponent.prototype.init.apply(this, arguments);

			this.sciConfig = this.getMetadata().getConfig().sci;
			var isGuest = sap.ushell.Container.getUser().getFullName() === "Guest";

			var renderer = sap.ushell.Container.getRenderer("fiori2");
			renderer.addHeaderEndItem("sap.ushell.ui.shell.ShellHeadItem", {
				id: isGuest ? "headerLoginButton" : "headerLogoutButton",
				icon: isGuest ? "sap-icon://cause" : "sap-icon://log",
				press: isGuest ? this.login.bind(this) : this.logout
			}, true, false);

			if (this.sciConfig.useOverlay) {
				var search = window.location.search === "" ? "?hc_login" : window.location.search + "&hc_login";
				var href = window.location.origin + window.location.pathname + search;
				$("#shell").append("<div id=\"hiddenLoginButton\" style=\"display: none;\"><a href=" + href + " rel=\"IDS_login\">Login</a></div>");
				jQuery.sap.require("sap.ui.thirdparty.datajs");
				jQuery.sap.includeScript(this.sciConfig.sci_tenant + this.sciConfig.sap_ids_path);
			}
		},

		login: function() {
			if (this.sciConfig.useOverlay) {
				$("#hiddenLoginButton").find("a").click();
			}
			else {
				var search = window.location.search === "" ? "?hc_login" : window.location.search + "&hc_login";
				window.location.search = search;
			}
		},

		logout: function() {
			sap.ushell.Container.logout();
		}

	});
});