sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/FlexBox",
	"sap/m/Image"
], function(Controller, FlexBox, Image) {
	"use strict";

	return Controller.extend("SocialNetworksWidget.controller.Main", {

		renderIcons: function(settings) {
			var modulePath = jQuery.sap.getModulePath("SocialNetworksWidget");
			var flexBox = this.getView().byId("flexBox");
			var size = settings.size;
			var orientation = settings.orientation;
			var networks = settings.networks;

			var justify;
			if (orientation === "Left") {
				justify = "Start";
			}
			else if (orientation === "Center") {
				justify = "Center";
			}
			else if (orientation === "Right") {
				justify = "End";
			}

			var side;
			if (size === "Large") {
				side = "64px";
			}
			else if (size === "Medium") {
				side = "48px";
			}
			else if (size === "Small") {
				side = "32px";
			}

			flexBox.setHeight((parseInt(side) + 32) + "px");
			flexBox.setJustifyContent(justify);
			flexBox.removeAllItems();

			for (var i = 0; i < networks.length; i++) {
				if (networks[i].isActive) {
					flexBox.addItem(new Image({
						width: side,
						height: side,
						src: modulePath + "/images/" + networks[i].image + ".png",
						densityAware: false,
						press: this.onItemPress
					}).data("url", networks[i].url).addStyleClass("networkImage" + size));
				}
			}
		},

		onItemPress: function(oEvent) {
			window.open(oEvent.getSource().data("url"));
		}
		
	});

});