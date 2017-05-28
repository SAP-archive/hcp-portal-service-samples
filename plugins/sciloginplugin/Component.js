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
				icon: "sap-icon://log",
				press: isGuest ? this.login.bind(this) : this.logout,
				tooltip: isGuest ? "Log On" : "Log Off"
			}, true, false);

			var siteService = sap.ushell.Container.getService("SiteService");
			if (this.sciConfig.useOverlay && siteService.isRuntime() && !siteService.isDraftPreview()) {
				var href = encodeURI(this.getLoginUrl());
				$("#shell").append("<div id=\"hiddenLoginButton\" style=\"display: none;\"><a href=" + href + " rel=\"IDS_login\">Login</a></div>");
				jQuery.sap.require("sap.ui.thirdparty.datajs");
				jQuery.sap.includeScript(this.sciConfig.sci_tenant + this.sciConfig.sap_ids_path);
			}
		},

		getLoginUrl: function() {
			var location = window.top.location;
			var params = location.search;
			if (params === '?') {
				params += 'hc_login';
			} else if (params.length > 0) {
				params += '&hc_login';
			} else {
				params = '?hc_login';
			}
			var loginUrl = location.origin + location.pathname + params;
			return loginUrl;
		},

		login: function() {
			if (!sap.ushell.Container.getService("SiteService").isRuntime()) {
				return;
			}
			if (this.sciConfig.useOverlay) {
				$("#hiddenLoginButton").find("a").click();
			}
			else {
				window.top.location = encodeURI(this.getLoginUrl());
			}
		},

		logout: function() {
			if (!sap.ushell.Container.getService("SiteService").isRuntime()) {
				return;
			}
			sap.ushell.Container.logout();
		}

	});
});