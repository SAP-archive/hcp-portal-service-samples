jQuery.sap.registerModulePath("rtewidget", "/sap/fiori/portalapptemplates/rtewidget");

sap.ui.define([
	"rtewidget/Component"
], function(RTEBaseComponent) {
	"use strict";

	return RTEBaseComponent.extend("RTEExtension.Component", {

		metadata: {
			manifest: "json"
		}

	});

});