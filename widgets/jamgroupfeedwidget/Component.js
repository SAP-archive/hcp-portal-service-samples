sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"JamGroupFeedWidget/model/models",
	"sap/ui/model/Filter",
	"sap/ui/core/HTML",
	"sap/m/Dialog",
	"sap/m/Button"
], function(UIComponent, Device, models, Filter, HTML, Dialog, Button) {
	"use strict";

	return UIComponent.extend("JamGroupFeedWidget.Component", {

		metadata: {
			manifest: "json"
		},

		config: null,
		fragment: null,
		view: null,
		groupsModel: null,

		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			this.config = this.getMetadata().getConfig();
			this.attachEvent("open.dialog", this.onOpenDialog);

			this.view = this.getAggregation("rootControl");
			this.view.setBusyIndicatorDelay(0);
		},

		onConfigChange: function() {
			var settings = this.getMetadata().getManifest()["sap.cloud.portal"].settings;
			this.config.groupId = settings.groupId.value;
			this.config.groupName = settings.groupName;

			if (this.config.groupId !== "") {
				this.createModel();
				this.view.byId("feedInput").setPlaceholder("Post something in " + this.config.groupName);
			}
			else {
				this.view.byId("feedList").setNoDataText("Select a SAP Jam group by opening the widget settings");
				this.view.byId("feedInput").setEnabled(false);
			}
		},

		onOpenDialog: function() {
			this.fragment = sap.ui.xmlfragment("JamGroupFeedWidget.fragment.SelectGroup", this);
			if (!this.groupsModel) {
				var url = jQuery.sap.getModulePath("JamGroupFeedWidget") + this.config.jamUrl + this.config.groups;
				this.groupsModel = new sap.ui.model.json.JSONModel(url);
				this.groupsModel.attachRequestCompleted(this.onGroupsModelRequestCompleted.bind(this));
				this.groupsModel.attachRequestFailed(this.onGroupsModelRequestFailed.bind(this));
				this.fragment.setBusy(true);
			}
			this.fragment.setModel(this.groupsModel);
			this.fragment.attachAfterClose(function() {
				this.destroy();
			});
			this.fragment.getContent()[0].setSelectedKey(this.config.groupId);
			this.fragment.setBusyIndicatorDelay(0);
			this.fragment.open();
		},

		onGroupSelected: function(oEvent) {
			var item = oEvent.getParameter("item");
			var settings = this.getMetadata().getManifest()["sap.cloud.portal"].settings;
			settings.groupId.value = item.getKey();
			settings.groupName = item.getText();
			this.fireEvent("save.settings", settings);
			oEvent.getSource().getParent().close();
		},

		onCloseSelectGroup: function(oEvent) {
			oEvent.getSource().getParent().close();
		},

		createModel: function() {
			this.view.setBusy(true);
			this.view.byId("feedList").data("groupId", this.config.groupId);

			var url = jQuery.sap.getModulePath("JamGroupFeedWidget") + this.config.jamUrl + this.config.feedEntries.replace("{groupId}", this.config.groupId) + this.config.expandQuery,
				model = new sap.ui.model.json.JSONModel(url);
			model.attachRequestCompleted(this.onModelRequestCompleted.bind(this));
			model.attachRequestFailed(this.onModelRequestFailed.bind(this));
			this.setModel(model);
		},

		onModelRequestCompleted: function(oEvent) {
			if (oEvent.getParameter("errorobject")) {
				this.onModelRequestFailed();
			}
			else {
				var modulePath = jQuery.sap.getModulePath("JamGroupFeedWidget");
				var model = oEvent.getSource();
				var results = model.getData().d.results;
				var createdAt;

				for (var i = 0; i < results.length; i++) {
					createdAt = results[i].CreatedAt;
					results[i].CreatedDate = new Date(parseInt(createdAt.substring(createdAt.indexOf("(") + 1, createdAt.indexOf(")")))).toLocaleString();
				}
				model.setData(results);

				this.view.setBusy(false);
				this.view.byId("feedList").setVisible(true);
				this.view.byId("jamErrorHtml").setVisible(false);
			}
		},

		onModelRequestFailed: function() {
			this.view.setBusy(false);
			this.view.byId("feedInput").setEnabled(false);
			this.view.byId("feedList").setVisible(false);
			this.view.byId("jamErrorHtml").setVisible(true);

			if (sap.ushell.Container.getService("SiteService").isDesignTime() && !window.jamAdminErrorShown) {
				window.jamAdminErrorShown = true;
				var dialog = new Dialog({
					title: "Error",
					type: "Message",
					state: "Error",
					content: new HTML({
						content: "<div>Could not connect to SAP Jam. For more information, <a target=\"_blank\" href=\"http://help.sap.com/download/documentation/sapjam/developer/index.html#hcp/concepts/ADVANCED_TOPICS-API_integrate_features_data.html\">click here</a>.</div>"
					}),
					beginButton: new Button({
						text: "OK",
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
				dialog.open();
			}
		},

		onGroupsModelRequestCompleted: function(oEvent) {
			if (oEvent.getParameter("errorobject")) {
				this.onGroupsModelRequestFailed();
			}
			this.fragment.setBusy(false);
		},

		onGroupsModelRequestFailed: function() {
			var core = sap.ui.getCore();
			core.byId("groupList").setVisible(false);
			core.byId("jamErrorHtml").setVisible(true);
			this.fragment.setBusy(false);
			this.groupsModel = null;
		},

		onGroupSearch: function(oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}

			var list = this.fragment.getContent()[0];
			var binding = list.getBinding("items");
			binding.filter(aFilters, "Application");
		}

	});

});