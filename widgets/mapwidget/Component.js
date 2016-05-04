sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"MapWidget/model/models",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("MapWidget.Component", {

		metadata: {
			manifest: "json"
		},

		tempSettings: null,

		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.attachEvent("open.dialog", this.onOpenDialog);
		},

		onConfigChange: function() {
			var settings = this.getMetadata().getManifest()["sap.cloud.portal"].settings;
			if (!settings.height) {
				settings.height = 300;
			}
			this.getAggregation("rootControl").getController().applySettings(settings);
		},

		onOpenDialog: function() {
			var fragment = sap.ui.xmlfragment("MapWidget.fragment.Settings", this);
			fragment.attachAfterClose(function() {
				this.destroy();
			});

			var core = sap.ui.getCore();
			var settings = this.getMetadata().getManifest()["sap.cloud.portal"].settings;
			this.tempSettings = $.extend(true, {}, settings);

			core.byId("mapNameInput").setValue(settings.name);
			core.byId("mapLongitudeInput").setValue(settings.longitude);
			core.byId("mapLatitudeInput").setValue(settings.latitude);
			core.byId("mapHeightInput").setValue(settings.height);
			core.byId("mapZoomSlider").setValue(parseInt(settings.zoom));
			core.byId("mapUseDialogCheckbox").setSelected(settings.useDialog);

			fragment.open();
		},

		onSaveSettings: function(oEvent) {
			var core = sap.ui.getCore();
			var error = sap.ui.core.ValueState.Error;

			if (core.byId("mapLongitudeInput").getValueState() !== error &&
				core.byId("mapLatitudeInput").getValueState() !== error &&
				core.byId("mapHeightInput").getValueState() !== error) {
				this.tempSettings.name = core.byId("mapNameInput").getValue();
				this.tempSettings.useDialog = core.byId("mapUseDialogCheckbox").getSelected();
				this.fireEvent("save.settings", this.tempSettings);
				oEvent.getSource().getParent().close();
			}
		},

		onCancelSettings: function(oEvent) {
			var settings = this.getMetadata().getManifest()["sap.cloud.portal"].settings;
			this.getAggregation("rootControl").getController().applySettings(settings);
			oEvent.getSource().getParent().close();
		},

		onLongitudeChange: function(oEvent) {
			var value = oEvent.getParameter("value");
			var floatValue = parseFloat(value);
			if (value === "" || floatValue < -180 || floatValue > 180) {
				oEvent.getSource().setValueState("Error");
			}
			else {
				oEvent.getSource().setValueState("None");
				this.tempSettings.longitude = oEvent.getSource().getValue();
				this.getAggregation("rootControl").getController().applySettings(this.tempSettings);
			}
		},

		onLatitudeChange: function(oEvent) {
			var value = oEvent.getParameter("value");
			var floatValue = parseFloat(value);
			if (value === "" || floatValue < -90 || floatValue > 90) {
				oEvent.getSource().setValueState("Error");
			}
			else {
				oEvent.getSource().setValueState("None");
				this.tempSettings.latitude = oEvent.getSource().getValue();
				this.getAggregation("rootControl").getController().applySettings(this.tempSettings);
			}
		},

		onHeightChange: function(oEvent) {
			var value = oEvent.getParameter("value");
			var floatValue = parseFloat(value);
			if (value === "" || floatValue <= 0) {
				oEvent.getSource().setValueState("Error");
			}
			else {
				oEvent.getSource().setValueState("None");
				this.tempSettings.height = oEvent.getSource().getValue();
				this.getAggregation("rootControl").getController().applySettings(this.tempSettings);
			}
		},

		onSliderChange: function(oEvent) {
			this.tempSettings.zoom = oEvent.getSource().getValue();
			this.getAggregation("rootControl").getController().applySettings(this.tempSettings);
		},

		onHelpPress: function(oEvent) {
			var popover = sap.ui.xmlfragment("MapWidget.fragment.SettingsHelp", this);
			popover.openBy(oEvent.getSource());
		}

	});

});