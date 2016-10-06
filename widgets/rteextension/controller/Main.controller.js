jQuery.sap.registerModulePath("rtewidget", "/sap/fiori/portalapptemplates/rtewidget");

sap.ui.define([
	"rtewidget/controller/RTEBase.controller"
], function(RTEBaseController) {
	"use strict";

	return RTEBaseController.extend("RTEExtension.controller.Main", {

		getDefaultContent: function() {
			return "Insert your text here instead of this default placeholder. To do so, select this widget and click the pencil icon to edit. You can then type or copy your text here, and format the text however you want. Change fonts and styles and add headings, tables and images.";
		}

	});

});