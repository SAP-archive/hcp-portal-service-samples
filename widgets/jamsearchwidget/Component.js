sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"JamSearchWidget/model/models",
	"sap/ui/core/HTML",
	"sap/m/Dialog",
	"sap/m/Button"
], function(UIComponent, Device, models, HTML, Dialog, Button) {
	"use strict";

	return UIComponent.extend("JamSearchWidget.Component", {

		metadata: {
			manifest: "json"
		},

		config: null,
		view: null,
		isRuntime: null,

		icons: {
			"ContentItem/Document": "document",
			"ContentItem/BlogEntry": "marketing-campaign",
			Group: "group",
			"ContentItem/Page": "document-text",
			Member: "person-placeholder",
			"ForumItem/Discussion": "discussion",
			FeedEntry: "post",
			Comment: "comment"
		},

		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			this.isRuntime = sap.ushell.Container.getService("SiteService").isRuntime();

			this.config = this.getMetadata().getConfig();
			this.view = this.getAggregation("rootControl");
		},

		onConfigChange: function() {
			var settings = this.getMetadata().getManifest()["sap.cloud.portal"].settings;
			this.config.searchQuery = settings.searchQuery.value;
			this.createModel();
		},

		createModel: function() {
			var url = jQuery.sap.getModulePath("JamSearchWidget") + this.config.jamUrl.replace("{query}", this.config.searchQuery);
			this.view.setBusy(true);
			var model = new sap.ui.model.json.JSONModel(url);
			model.attachRequestCompleted(this.onModelRequestCompleted.bind(this));
			model.attachRequestFailed(this.onModelRequestFailed.bind(this));
			this.setModel(model);
		},

		onModelRequestCompleted: function(oEvent) {
			if (oEvent.getParameter("errorobject")) {
				this.onModelRequestFailed();
			}
			else {
				var model = oEvent.getSource();
				var results = model.getData().d.results;
				var fullPath;

				for (var i = 0; i < results.length; i++) {
					fullPath = results[i].ObjectReference.FullPath;
					results[i].Icon = this.icons[fullPath];
				}
				model.setData(results);

				this.view.setBusy(false);
				this.view.byId("searchList").setVisible(true);
				this.view.byId("jamErrorHtml").setVisible(false);
			}
		},

		onModelRequestFailed: function() {
			this.view.setBusy(false);
			this.view.byId("searchList").setVisible(false);
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
		}

	});

});