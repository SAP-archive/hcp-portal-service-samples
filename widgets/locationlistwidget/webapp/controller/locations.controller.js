sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType"
], function (Controller, JSONModel, Filter, FilterOperator, FilterType) {
	"use strict";

	return Controller.extend("locationListWidget.controller.locations", {

		onInit: function () {
			this.view = this.getView();
			this.oCmp = this.getOwnerComponent();
			this.core = sap.ui.getCore();
			this.config = this.oCmp.getMetadata().getConfig();
			this.oCmp.attachEvent("open.dialog", this.openSettingsFragment.bind(this));
		},

		onAfterRendering: function () {
			this.oSF = this.oView.byId("searchField");
			var siteService = this.getSiteService();
			if (!siteService) {
				//not running in portal
				var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
				this.setWidgetHeader(settings.visualProperties);
				this.setLocationModel(settings.locationDataProperties);
			}
		},

		setWidgetData: function () {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			this.changeWidgetHeight(settings.visualProperties);
			this.setWidgetHeader(settings.visualProperties);
			this.setLocationModel(settings.locationDataProperties);
		},

		setWidgetHeader: function (visualProperties) {
			var headerTitle = this.view.byId("headerTitleID");
			if (headerTitle) {
				headerTitle.setText(visualProperties.listHeaderTitle);
				debugger;
				$(".headerToolBar").css('background-color', visualProperties.listHeaderColor + " !important");
			}
		},

		openSettingsFragment: function () {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;

			this.fragment = sap.ui.xmlfragment("locationListWidget.fragment.WidgetSettings", this);
			this.fragment.setModel(this.view.getModel("i18n"), "i18n");

			this.fragment.setModel(new sap.ui.model.json.JSONModel(jQuery.extend({}, settings.visualProperties)), "visualProperties");
			this.fragment.setModel(new sap.ui.model.json.JSONModel(jQuery.extend({}, settings.locationDataProperties)),
				"locationDataProperties");
			this.fragment.attachAfterClose(function () {
				this.destroy();
			});
			
			this.fragment.attachAfterOpen(function () {
				var selectedDataSource = this.core.byId("dataSourceRadioBtns").getSelectedIndex();
				this.setDataSourceInputVisibility(selectedDataSource);
			}.bind(this));
			
			this.fragment.setBusyIndicatorDelay(0);
			this.fragment.open();

			this.onWidgetHeightRadioBtnSelect();
		},

		changeWidgetHeight: function (properties) {
			var isDT = sap.ushell.Container.getService("SiteService").isDesignTime(),
				mobile = sap.ui.Device.system.phone,
				height = "inherit";

			if (properties.widgetHeight === 1) {
				if ( isDT || ( !isDT && !mobile)) {
					height = properties.desktopHeight + "px";
				} else if ( !isDT && mobile) {
					height = properties.mobileHeight + "px";
				}
			}
			this.view.byId("scrollContainer").setHeight(height);
		},

		onWidgetHeightRadioBtnSelect: function () {
			var oSelectedIndex = sap.ui.getCore().byId("widgetHeight").getProperty("selectedIndex"),
				height = "inherit";

			if (oSelectedIndex === 0) {
				jQuery(".fixedWidgetHeight").addClass("disableChange");
			} else {
				height = sap.ui.getCore().byId("widgetHeightDesktop").getValue() + "px";
				jQuery(".fixedWidgetHeight").removeClass("disableChange");
			}

			this.view.byId("scrollContainer").setHeight(height);
		},

		onWidgetHeightChange: function (oEvent) {
			var widgetHeight = oEvent.getSource();
			if (widgetHeight.getValue().length === 0) {
				widgetHeight.setValueState(sap.ui.core.ValueState.Error);
				widgetHeight.setValueStateText(this.view.getModel("i18n").getProperty("SETTINGS_HEIGHT_ERROR"));
			} else {
				widgetHeight.setValueState(sap.ui.core.ValueState.None);
				if (widgetHeight.sId.indexOf("Desktop") > -1) {
					this.view.byId("mainList").setHeight(widgetHeight.getValue() + "px");
				}
			}
		},

		onDataSourceRadioBtnSelect: function (oEvent) {
			var params = oEvent.getParameters();
			var selectedIndex = params.selectedIndex;
			this.setDataSourceInputVisibility(selectedIndex);
		},
		
		setDataSourceInputVisibility: function(selectedIndex){
			var mockFilePathBox = sap.ui.getCore().byId("mockFilePathFE");
			var siteSettingsMessageFE = sap.ui.getCore().byId("siteSettingsMessageFE");
			var siteSettingsMessage = sap.ui.getCore().byId("siteSettingsMessage");
			var repositoryFilePathBox = sap.ui.getCore().byId("repositoryFilePathFE");

			if (selectedIndex === 0) {
				mockFilePathBox.setVisible(true);
				siteSettingsMessageFE.setVisible(false);
				repositoryFilePathBox.setVisible(false);
			} else if (selectedIndex === 1) {
				mockFilePathBox.setVisible(false);
				siteSettingsMessageFE.setVisible(true);
				var message = this.view.getModel("i18n").getProperty("SITE_PROPERTY_MESSAGE");
				siteSettingsMessage.setText(message);
				repositoryFilePathBox.setVisible(false);
			} else {
				mockFilePathBox.setVisible(false);
				siteSettingsMessageFE.setVisible(false);
				repositoryFilePathBox.setVisible(true);
			}
		},


		onSettingsSubmit: function (oEvent) {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			settings.visualProperties = {
				"widgetHeight": sap.ui.getCore().byId("widgetHeight").getSelectedIndex(),
				"desktopHeight": sap.ui.getCore().byId("widgetHeightDesktop").getValue(),
				"mobileHeight": sap.ui.getCore().byId("widgetHeightMobile").getValue(),
				"listHeaderTitle": sap.ui.getCore().byId("listHeaderTitle").getValue(),
				"listHeaderColor": sap.ui.getCore().byId("listHeaderColor").Color.hex
			};

			settings.locationDataProperties = {
				"dataSource": sap.ui.getCore().byId("dataSourceRadioBtns").getSelectedIndex(),
				"mockFilePath": sap.ui.getCore().byId("mockFilePath").getValue(),
				"repositoryFilePath": sap.ui.getCore().byId("repositoryFilePath").getValue()
			};

			this.oCmp.fireEvent("save.settings", settings);
			this.oCmp.attachEvent("save.settings.error", function (oEvent) {
				alert("error");
			});

			oEvent.getSource().getParent().close();
		},

		onHeaderColorChange: function (oEvent) {
			var colors = oEvent.getParameters();
			$(".headerToolBar").css('background-color', colors.hex);
		},

		onSettingCancel: function (oEvent) {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			this.changeWidgetHeight(settings.visualProperties);
			oEvent.getSource().getParent().close();
		},

		onSelectionChange: function (oEvent) {
			var source = oEvent.getSource();
			var selectedCtx = source.getSelectedContexts()[0];
			var obj = selectedCtx.getObject();
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("google.maps", "location-search-and-change", {
				customData: obj
			});
		},

		setLocationModel: function (locationDataProperties) {
			if (locationDataProperties) {
				var model;
				if (locationDataProperties.dataSource === 0) { //"DEFAULT"
					this.loadDefaultLocationModel();
					return;
				} else if (locationDataProperties.dataSource === 1) { //"SITE_PROPERTIES"
					model = this.loadSitePropertiesLocationModel(locationDataProperties);
					this.view.setModel(model, "locationModel");
					return;
				} else if (locationDataProperties.dataSource === 2) { //"ASSET_REPOSITORY"
					this.loadDocumentRepLocationModel(locationDataProperties);
				}
			}
			this.loadDefaultLocationModel();
		},

		loadDefaultLocationModel: function () {
			var oModel = new JSONModel();
			oModel.loadData(jQuery.sap.getModulePath("locationListWidget") + "/model/locations.json");
			this.view.setModel(oModel, "locationModel");
		},

		loadSitePropertiesLocationModel: function (portalSettings) {
			var siteService = this.getSiteService();
			if (siteService ) {
				var siteSettings = siteService.getSiteSettings();
				if (siteSettings !== undefined && typeof (siteSettings["location_list"]) !== undefined) {
					var locationJSONText = siteSettings["location_list"];
					if (locationJSONText && locationJSONText !== "") {
						var oModel = new JSONModel();
						oModel.setJSON(locationJSONText);
						this.view.setModel(oModel, "locationModel");
						return;
					}
				}
			}
			this.loadDefaultLocationModel();
		},

		loadDocumentRepLocationModel: function (portalSettings, controller) {
			var attributeID = portalSettings.repositoryFilePath;
			var assetService = this.getAsserService();
			var siteService = this.getSiteService();
			if (assetService && siteService && attributeID !== "") {
				assetService.getAsset(attributeID, siteService.getSiteID())
					.done(function (response) {
						var oModel = new JSONModel();
						oModel.setJSON(response.trim());
						this.view.setModel(oModel, "locationModel");
					}.bind(this))
					.fail(function () {
						var model = this.loadDefaultLocationModel();
						this.view.setModel(model, "locationModel");
					}.bind(this));
			} else {
				return this.loadDefaultLocationModel();
			}
		},

		onSearch: function (event) {
			var filters = [];
			var suggestionItem = event.getParameter("suggestionItem");
			var searchQuery = event.getParameter("query");
			
			if (suggestionItem) {
				var key = suggestionItem.getKey();
				if (key && key.length > 0) {
					var filter = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.EQ, key);
					filters.push(filter);
				}
			}else if(searchQuery){
				filter = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, searchQuery);
				filters.push(filter);
			}
			
			var clearButtonPressed = event.getParameter("clearButtonPressed");
			if(clearButtonPressed){
				filters = [];
			}
			
			var list = this.view.byId("locationList");
			var binding = list.getBinding("items");
			binding.filter(filters);
		},

		onSuggest: function (event) {
			var value = event.getParameter("suggestValue");
			var filters = [];
			if (value) {
				filters = [
					new Filter([
						new sap.ui.model.Filter("name", function (sDes) {
							return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
						})
					], false)
				];
			}
			this.oSF.getBinding("suggestionItems").filter(filters);
			this.oSF.suggest();
		},

		getSiteService: function () {
			try {
				return sap.ushell.Container.getService("SiteService");
			} catch (err) {
				return;
			}
		},

		getAsserService: function () {
			try {
				return sap.ushell.Container.getService('AssetService');
			} catch (err) {
				return;
			}
		}

	});

});