sap.ui.core.Control.extend("parallaxPage.parallaxLogo", {

	metadata: { // the megaMenuItem API
		properties: {
			cssURL: {
				type: "string",
				defaultValue: ""
			}
		}
	},
	init: function() {
		jQuery.sap.require("sap.ui.core.theming.Parameters");
		var cssURL = sap.ui.core.theming.Parameters.get("sapUiGlobalLogo");
		if (!cssURL || cssURL === "none") {

			cssURL = "url(" + sap.ui.resource("sap.ui.core", "mimes/logo/sap_50x26.png") + ")";

		}
		this.setCssURL(cssURL);
		var _self = this;
		sap.ui.getCore().attachThemeChanged(function() {
			var cssURL = sap.ui.core.theming.Parameters.get("sapUiGlobalLogo");
			if (!cssURL || cssURL === "none") {

				cssURL = "url(" + sap.ui.resource("sap.ui.core", "mimes/logo/sap_50x26.png") + ")";

			}
			_self.setCssURL(cssURL);
		});
	},

	renderer: {
		render: function(oRm, oControl) {
			var cssURL = oControl.getCssURL();
			oRm.addClass("parallax-header-logo");
			oRm.addStyle("background-image", cssURL);
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");
			oRm.write("</div>");
		}
	}
});