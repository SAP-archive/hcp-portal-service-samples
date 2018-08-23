sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("googleMapWidget.controller.Map", {

		marker: null,
		
		onInit: function() {
			this.subscribeToSiteEvent();
			this.view = this.getView();
			this.oCmp = this.getOwnerComponent();
			this.core = sap.ui.getCore();
			this.view.setBusyIndicatorDelay(0);

			this.config = this.oCmp.getMetadata().getConfig();
			this.oCmp.attachEvent("open.dialog", this.openSettingsFragment.bind(this));
		},
		
		onAfterRendering: function() {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			//var setApiKeyMessageStrip = this.view.byId("setApiKeyMessageStrip");
			if(settings && settings.widgetProperties && (settings.widgetProperties.apiKey !== '')){
				//setApiKeyMessageStrip.setVisible(false);
				this.loadGoogleMaps(settings.widgetProperties.apiKey);
			}/*else{
				setApiKeyMessageStrip.setVisible(true);
			}*/
		},
		
		loadGoogleMaps: function(apiKey){
			//if(typeof(google) === "undefined" ){
			jQuery.sap.includeScript(
				"https://maps.googleapis.com/maps/api/js?key="+apiKey+"&v=3.31",
				this.failGoogleMapLoad.bind(this),
				this.successGoodlMapLoad.bind(this)
			);
			/*}else{
				this.successGoodlMapLoad();
			}*/
		},
		
		onSubmitGoogleKey: function(oEvent){
			var widgetPropertiesModel = this.fragment.getModel("widgetProperties");
			if(widgetPropertiesModel){
				var googleSettingsTab = this.core.byId("googleSettingsTab");
				var apiKey = widgetPropertiesModel.getData().apiKey;
				//var setApiKeyMessageStrip = this.view.byId("setApiKeyMessageStrip");
				debugger;
				if(apiKey !== ''){
					googleSettingsTab.setEnabled( (apiKey !== '') );
					//setApiKeyMessageStrip.setVisible(false);
					this.loadGoogleMaps(apiKey);
				}/*else{
					setApiKeyMessageStrip.setVisible(true);
				}*/
			}
		},

		onConfigChange: function() {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			this.changeWidgetHeight(settings.widgetProperties);
			
			var lat = settings.googleMapsProperties.positionLat;
			var lng = settings.googleMapsProperties.positionLng; 
			var zoomLevel = settings.googleMapsProperties.zoomLevel;
			var fullAddress = settings.googleMapsProperties.fullAddress; 
			
			if(this.map){
				this.setLocationLatLng(lat, lng, fullAddress, zoomLevel);
			}
		},

		openSettingsFragment: function() {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;

			this.fragment = sap.ui.xmlfragment("googleMapWidget.fragment.WidgetSettings", this);
			this.fragment.setModel(this.view.getModel("i18n"), "i18n");

			this.fragment.setModel(new sap.ui.model.json.JSONModel(jQuery.extend({}, settings.widgetProperties)), "widgetProperties");
			this.fragment.setModel(new sap.ui.model.json.JSONModel(jQuery.extend({}, settings.googleMapsProperties)), "googleMapsProperties");
			this.fragment.attachAfterClose(function() {
				this.destroy();
			});
			
			this.fragment.attachBeforeOpen(function(){
				var googleSettingsTab = this.core.byId("googleSettingsTab");
				var widgetPropertiesModel = this.fragment.getModel("widgetProperties");
				if(widgetPropertiesModel){
					googleSettingsTab.setEnabled( (widgetPropertiesModel.getData().apiKey !== '') );
				}
				
			}.bind(this));

			this.fragment.setBusyIndicatorDelay(0);
			this.fragment.open();
		},

		changeWidgetHeight: function(properties) {
			var isDT = sap.ushell.Container.getService("SiteService").isDesignTime(),
			mobile = sap.ui.Device.system.phone,
			height = "inherit";
			
			if (isDT || (!isDT && !mobile)) {
				height = properties.desktopHeight + "px";
			} else if (!isDT && mobile) {
				height = properties.mobileHeight + "px";
			}
			this.view.byId("map_canvas").setHeight(height);
		},

		onWidgetHeightChange: function(oEvent) {
			var widgetHeight = oEvent.getSource();
			if (widgetHeight.getValue().length === 0) {
				widgetHeight.setValueState(sap.ui.core.ValueState.Error);
				widgetHeight.setValueStateText(this.view.getModel("i18n").getProperty("SETTINGS_HEIGHT_ERROR"));
			} else {
				widgetHeight.setValueState(sap.ui.core.ValueState.None);
				if (widgetHeight.sId.indexOf("Desktop") > -1) {
					this.view.byId("map_canvas").setHeight(widgetHeight.getValue() + "px");
				}
			}
		},
		
		onLiveZoomChange: function(oEvent) {
			var params = oEvent.getParameters();
			var currentZoomLevel = params.value;
			this.map.setZoom(currentZoomLevel);
		},

		onSettingsSubmit: function(oEvent) {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			settings.widgetProperties = {
				"desktopHeight": sap.ui.getCore().byId("widgetHeightDesktop").getValue(),
				"mobileHeight": sap.ui.getCore().byId("widgetHeightMobile").getValue(),
				"apiKey": sap.ui.getCore().byId("apiKey").getValue()
			};
			
			settings.googleMapsProperties = {
				"fullAddress": sap.ui.getCore().byId("defaultFullAddress").getValue(),
				"positionLat": sap.ui.getCore().byId("defaultPositionLat").getValue(),
				"positionLng": sap.ui.getCore().byId("defaultPositionLng").getValue(),
				"zoomLevel": sap.ui.getCore().byId("zoomLevel").getValue()
			};

			this.oCmp.fireEvent("save.settings", settings);
			oEvent.getSource().getParent().close();
		},

		onSettingCancel: function(oEvent) {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			this.changeWidgetHeight(settings.widgetProperties);
			oEvent.getSource().getParent().close();
		},

		subscribeToSiteEvent: function() {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.subscribe("google.maps", "location-change", this.handleLocationChange.bind(this), this);
			eventBus.subscribe("google.maps", "location-search-and-change", this.handleLocationSearchAndChange.bind(this), this);
		},

		handleLocationChange: function(channel, event, data) {
			if (channel === "google.maps" && event === "location-change") {
				var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
				var zoomLevel = settings.googleMapsProperties.zoomLevel;
				this.setLocationLatLng(data.customData.lat, data.customData.lng, data.customData.address, zoomLevel);
			}
		},
		
		handleLocationSearchAndChange: function(channel, event, data) {
			if (channel === "google.maps" && event === "location-search-and-change") {
				this.view.setBusy(true);
				var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
				var apiKey = settings.widgetProperties.apiKey;
				var zoomLevel = settings.googleMapsProperties.zoomLevel;
				this.searchAddress(apiKey, data.customData.address).then(function(response){
					if(response.results.length > 0){
						var searchResult = response.results[0];
						this.setLocationLatLng(searchResult.geometry.location.lat, searchResult.geometry.location.lng, searchResult.formatted_address, zoomLevel);
						this.view.setBusy(false);
					}
				}.bind(this));
			}
		},

		successGoodlMapLoad: function() {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			var lat = settings.googleMapsProperties.positionLat;
			var lng = settings.googleMapsProperties.positionLng; 
			var fullAddress = settings.googleMapsProperties.fullAddress; 
			var zoomLevel = settings.googleMapsProperties.zoomLevel; 
			
			this.setLocationLatLng(lat, lng, fullAddress, zoomLevel);
		},

		setLocationLatLng: function(lat, lng, title, zoomLevel) {
			if (this.marker) {
				this.marker.setMap(null);
			}
			
			var pos = new google.maps.LatLng(lat, lng);
			
			var mapOptions = {
				center: pos,
				zoom: zoomLevel,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			this.map = new google.maps.Map(this.getView().byId("map_canvas").getDomRef(), mapOptions);

			this.marker = new google.maps.Marker({
				position: pos,
				animation: google.maps.Animation.BOUNCE
			});

			this.marker.setMap(this.map);

			var infowindow = new google.maps.InfoWindow({
				content: title
			});

			infowindow.open(this.map, this.marker);
		},

		failGoogleMapLoad: function(oEvent) {},
		
		onAddressSearchSettings: function(oEvent){
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			var apiKey = settings.widgetProperties.apiKey;
			var parameters = oEvent.getParameters();
			this.fragment.setBusy(true);
			this.searchAddress(apiKey, parameters.query).then(function(response){
				this.fragment.setBusy(false);
				if(response.results.length > 0){
					var searchResult = response.results[0];
					sap.ui.getCore().byId("defaultFullAddress").setValue(searchResult.formatted_address);
					sap.ui.getCore().byId("defaultPositionLat").setValue(searchResult.geometry.location.lat);
				    sap.ui.getCore().byId("defaultPositionLng").setValue(searchResult.geometry.location.lng);
				}
			}.bind(this));                               
		},
		
		searchAddress: function(apiKey, searchTerm){
			var oDeferred = $.Deferred();
			var that = this;
			var URL = "https://maps.googleapis.com/maps/api/geocode/json?&address=" + encodeURI(searchTerm) + "&key=" + apiKey;
			$.ajax({
				method: "GET",
				url: URL,
				success: function(result) {
					oDeferred.resolve(result);
				}.bind(that),
				error: function(error) {
					oDeferred.reject(error);
				}.bind(that)
			});
			
			return oDeferred.promise();
		}

	});

});