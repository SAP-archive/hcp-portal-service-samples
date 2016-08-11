// define a root UIComponent which exposes the main view
/*global jQuery, sap */
jQuery.sap.declare("parallaxPage.Component");
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.core.routing.Router");

// new Component
sap.ui.core.UIComponent.extend("parallaxPage.Component", {

	oMainView: null,

	// use inline declaration instead of component.json to save 1 round trip
	metadata: {

		version: "@version@",

		includes: ["../../css/main.css", "parallax.css"],

		dependencies: {
			libs: ["sap.m"],
			components: []
		},
		config: {
			fullWidth: true,
			hideLightBackground: true
		}
	},

	init: function() {
		var oRenderer = sap.ushell.Container.getRenderer("fiori2");
		if (oRenderer.setHeaderVisibility) {
			oRenderer.setHeaderVisibility(false, false, ["home", "app"]);
		}
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
	},

	createContent: function() {
		"use strict";
		this.oMainView = sap.ui.view({
			type: sap.ui.core.mvc.ViewType.HTML,
			viewName: "parallaxPage.Template",
			id: this.createId("MainView")
		});

		return this.oMainView;
	}
});