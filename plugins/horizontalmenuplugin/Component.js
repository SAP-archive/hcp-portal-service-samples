sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device"
], function(UIComponent, Device) {
	"use strict";

	return UIComponent.extend("HorizontalMenuPlugin.Component", {

		metadata: {
			manifest: "json"
		},

		megamenu: null,

		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			// set the device model

			this.setModulePath();
			if (Device.system.phone || window.megaMenuLoaded) {
				return;
			}
			this.view = sap.ui.view({
				viewName: "HorizontalMenuPlugin.view.Menu",
				type: sap.ui.core.mvc.ViewType.XML,
				async: true
			});

			var bar = sap.ushell.Container.getRenderer("fiori2").addSubHeader("sap.m.Bar", {
				id: "menuBar"
			}, true, false);

			bar = sap.ui.getCore().byId("menuBar-__clone0") || bar;
			bar.addStyleClass("megaMenuContainer");
			bar.addContentMiddle(this.view);
		},

		setModulePath: function() {
			try {
				jQuery.sap.registerModulePath("HorizontalMenuPlugin", "");
				if (typeof parent.name !== "undefined" && parent.name !== "preview") {
					jQuery.sap.registerModulePath("HorizontalMenuPlugin", "/sap/fiori/horizontalmenuplugin");
				}
			} catch (e) {
				//preview mode in some cases
			}
		}

	});

});