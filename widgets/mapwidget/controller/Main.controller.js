sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("MapWidget.controller.Main", {

		settings: null,

		applySettings: function(settings) {
			this.settings = settings;

			var view = this.getView();
			var map = view.byId("map");
			var spot = view.byId("spot");
			this.applyMapSettings(map, spot, false);

			if (sap.ushell.Container.getService("SiteService").isRuntime() && this.settings.useDialog) {
				this.setRuntimeDialogState();
			}
		},

		applyMapSettings: function(map, spot, isPopup) {
			var position = this.settings.longitude + ";" + this.settings.latitude + ";0";
			map.setHeight(isPopup ? "100%" : this.settings.height + "px");
			map.setInitialZoom(this.settings.zoom);
			map.setInitialPosition(position);
			map.zoomToGeoPosition(this.settings.longitude, this.settings.latitude, this.settings.zoom);
			spot.setPosition(position);
			spot.setLabelText(this.settings.name);
		},

		setRuntimeDialogState: function() {
			var map = this.getView().byId("map");
			map.setNavcontrolVisible(false);
			map.attachClick(this.onMapClick.bind(this));
		},

		onMapClick: function() {
			var core = sap.ui.getCore();
			var fragment = sap.ui.xmlfragment("MapWidget.fragment.Map", this);
			fragment.attachAfterClose(function() {
				this.destroy();
			});
			
			var map = core.byId("dialogMap");
			var spot = core.byId("dialogSpot");
			this.applyMapSettings(map, spot, true);

			core.byId("mapDialogPage").setTitle(this.settings.name);
			fragment.open();
		},

		onDialogMapClick: function(oEvent) {
			oEvent.getSource().getParent().getParent().getParent().close();
		},

		onCloseMapDialog: function(oEvent) {
			oEvent.getSource().getParent().close();
		}

	});

});