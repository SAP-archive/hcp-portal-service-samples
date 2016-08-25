sap.ui.define([
    "sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";

	return UIComponent.extend("SCILoginWidget.Component", {

		metadata: {
			manifest: "json"
		},

		init: function() {
			UIComponent.prototype.init.apply(this, arguments);

			var sciConfig = this.getMetadata().getConfig().sci,
				siteService = sap.ushell.Container.getService("SiteService");
			if (sciConfig.useOverlay && siteService.isRuntime() && !siteService.isDraftPreview()) {
				var search = window.location.search === "" ? "?hc_login" : window.location.search + "&hc_login";
				var href = encodeURI(window.location.origin + window.location.pathname + search);
				$("#shell").append("<div id=\"hiddenLoginButton\" style=\"display: none;\"><a href=" + href + " rel=\"IDS_login\">Login</a></div>");

				jQuery.sap.require("sap.ui.thirdparty.datajs");
				jQuery.sap.includeScript(sciConfig.sci_tenant + sciConfig.sap_ids_path);
			}

		}
	});
});