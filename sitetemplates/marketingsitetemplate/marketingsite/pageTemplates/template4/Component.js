// define a root UIComponent which exposes the main view
/*global jQuery, sap */
jQuery.sap.declare("cpv2.templates.template4.Component");
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.core.routing.Router");

// new Component
sap.ui.core.UIComponent.extend("cpv2.templates.template4.Component", {

	oMainView: null,

	// use inline declaration instead of component.json to save 1 round trip
	metadata: {

		version: "@version@",

		//library : "sap.ushell.demo.cpv2",

		includes: ["../../css/main.css"],

		dependencies: {
			libs: ["sap.m"],
			components: []
		},

		"config": {
			fullWidth: true,
			hideLightBackground: true
		}
	},

	createContent: function() {
		"use strict";
		//jQuery.sap.registerModulePath("sap.ushell.demo.cpv2","/sap/fiori/cpv2developer");
		//jQuery.sap.registerModulePath("sap.ushell.demo.cpv2.controls","/sap/fiori/cpv2developer/controls");
		//jQuery.sap.registerResourcePath('sap/ushell/demo/Layouts', '/ushell/test-resources/sap/ushell/demoapps/Layouts/');
		this.oMainView = sap.ui.view({
			type: sap.ui.core.mvc.ViewType.XML,
			viewName: "cpv2.templates.template4.Template4",
			id: this.createId("MainView")
		});

		return this.oMainView;
	}
});