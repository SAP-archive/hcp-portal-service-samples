// define a root UIComponent which exposes the main view
/*global jQuery, sap */
jQuery.sap.declare("cpv2.templates.HeaderFooter.Component");
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.core.routing.Router");

// new Component
sap.ui.core.UIComponent.extend("cpv2.templates.HeaderFooter.Component", {

	oMainView: null,

	// use inline declaration instead of component.json to save 1 round trip
	metadata: {
		manifest: "json"
	},

	createContent: function() {
		"use strict";
		this.oMainView = sap.ui.view({
			type: sap.ui.core.mvc.ViewType.XML,
			viewName: "cpv2.templates.HeaderFooter.Template",
			id: this.createId("MainView")
		});

		return this.oMainView;
	}
});