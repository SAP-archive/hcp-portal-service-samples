sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"SocialNetworksWidget/model/models",
	"sap/m/HBox",
	"sap/m/Switch",
	"sap/m/Image",
	"sap/m/Label",
	"sap/m/Input"
], function(UIComponent, Device, models, HBox, Switch, Image, Label, Input) {
	"use strict";

	return UIComponent.extend("SocialNetworksWidget.Component", {

		metadata: {
			manifest: "json"
		},

		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.attachEvent("open.dialog", this.onOpenDialog);
		},

		onConfigChange: function() {
			var settings = this.getMetadata().getManifest()["sap.cloud.portal"].settings;
			this.getAggregation("rootControl").getController().renderIcons(settings);
		},

		onOpenDialog: function() {
			var fragment = sap.ui.xmlfragment("SocialNetworksWidget.fragment.Settings", this);
			fragment.attachAfterClose(function() {
				this.destroy();
			});

			var modulePath = jQuery.sap.getModulePath("SocialNetworksWidget");
			var core = sap.ui.getCore();

			var settings = $.extend(true, {}, this.getMetadata().getManifest()["sap.cloud.portal"].settings);
			var size = settings.size;
			var orientation = settings.orientation;
			var networks = settings.networks;

			var sizeRadioGroup = core.byId("sizeRadioGroup");
			var sizeButtons = sizeRadioGroup.getButtons();
			for (var i = 0; i < sizeButtons.length; i++) {
				if (sizeButtons[i].getText() === size) {
					sizeRadioGroup.setSelectedButton(sizeButtons[i]);
					break;
				}
			}

			var orientationRadioGroup = core.byId("orientationRadioGroup");
			var orientationButtons = orientationRadioGroup.getButtons();
			for (i = 0; i < orientationButtons.length; i++) {
				if (orientationButtons[i].getText() === orientation) {
					orientationRadioGroup.setSelectedButton(orientationButtons[i]);
					break;
				}
			}

			var vbox = core.byId("networksVbox");
			for (i = 0; i < networks.length; i++) {
				var hbox = new HBox();
				hbox.addItem(new Switch({
					state: networks[i].isActive,
					change: this.onSwitchChange.bind(this)
				}).addStyleClass("networkSwitch"));
				hbox.addItem(new Image({
					src: modulePath + "/images/" + networks[i].image + (networks[i].isActive ? "" : "_gray") + ".png",
					densityAware: false,
					width: "32px"
				}).addStyleClass("networkImage"));
				hbox.addItem(new Label({
					text: networks[i].name,
					width: "100px"
				}).addStyleClass("networkName"));
				hbox.addItem(new Input({
					width: "25.5rem",
					value: networks[i].url,
					enabled: networks[i].isActive,
					change: this.onUrlChange.bind(this),
					valueStateText: "Enter a valid URL"
				}).addStyleClass("networkUrl"));
				hbox.data("network", networks[i]);
				vbox.addItem(hbox);
			}

			fragment.open();
		},

		onSwitchChange: function(oEvent) {
			var modulePath = jQuery.sap.getModulePath("SocialNetworksWidget");
			var state = oEvent.getParameter("state");
			var hbox = oEvent.getSource().getParent();
			var network = hbox.data("network");
			var items = hbox.getItems();

			network.isActive = state;
			items[1].setSrc(modulePath + "/images/" + network.image + (network.isActive ? "" : "_gray") + ".png");
			items[3].setEnabled(network.isActive);
		},

		onUrlChange: function(oEvent) {
			oEvent.getSource().getParent().data("network").url = oEvent.getParameter("value");
		},

		onSaveSettings: function(oEvent) {
			var core = sap.ui.getCore();
			var emptyFields = false;
			var networks = [];
			var network;

			var items = core.byId("networksVbox").getItems();
			for (var i = 0; i < items.length; i++) {
				network = items[i].data("network");
				if (network.isActive && (!network.url || network.url === "")) {
					items[i].getItems()[3].setValueState("Error");
					emptyFields = true;
				}
				else {
					items[i].getItems()[3].setValueState("None");
					networks.push(network);
				}
			}

			if (!emptyFields) {
				var size = core.byId("sizeRadioGroup").getSelectedButton().getText();
				var orientation = core.byId("orientationRadioGroup").getSelectedButton().getText();

				var settings = {
					size: size,
					orientation: orientation,
					networks: networks
				};
				this.fireEvent("save.settings", settings);
				oEvent.getSource().getParent().close();
			}
		},

		onCancelSettings: function(oEvent) {
			oEvent.getSource().getParent().close();
		}

	});

});