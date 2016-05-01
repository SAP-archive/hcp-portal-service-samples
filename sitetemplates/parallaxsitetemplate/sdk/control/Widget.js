(function() {
	"use strict";
	/*eslint consistent-this: [2, "self"]*/
	sap.m.HBox.extend("sap.hana.uis.flp.control.Widget", {
		library: "sap.m",
		metadata: {
			properties: {
				alias: "string",
				css: "string",
				widgetDelegate: 'any',
				settingsModel: 'any',
				isEmpty: {
					type: "any",
					defaultValue: true
				}
			},
			defaultAggregation: "content",
			aggregations: {
				emptySection: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				widgetContent: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			}
		},

		renderer: function(oRm, oControl) {

			var isMenuOpen = false;
			var className = "",
				style = oControl.getCss(),
				isEmpty = false;

			oRm.write('<div class="' + (isEmpty ? 'emptySection sapThemeBaseBG ' : '') + (oControl.isLocal ? 'lockedWidget ' : '') + (isMenuOpen ?
				'show-menu ' : '') + 'widget ' + className + '"' + (style ? ' style="' + style + '"' : ''));
			oRm.writeControlData(oControl);
			oRm.write(">");

			try {
				oRm.renderControl(oControl.getAggregation("widgetContent"));
			} catch (err) {

				oRm.write('<div>' + err.message + '</div>');
			}
			oRm.write("</div>");
		},

		onBeforeRendering: function() {

			var widgetConfig,
				widgetApplication,
				self = this;

			var siteService = sap.ushell.Container.getService('SiteService');
			//@todo should be called once per navigation
			siteService.refreshPageContext();
			var siteModel = siteService.getSiteModel();

			var widgetApp = siteModel.getWidget(this.getAlias());

			if (!widgetApp) {
				widgetApplication = new sap.ushell.components.container.ApplicationContainer(null);
				this.setAggregation("widgetContent", widgetApplication);
				return;
			}

			widgetConfig = widgetApp.getAsWidgetConfig();
			widgetApplication = new sap.ushell.components.container.ApplicationContainer(widgetConfig);

			widgetApplication.attachEvent("applicationConfiguration", function() {

				var widgetComponent = sap.ui.getCore().getComponent(this.sId + "-component");
				//@todo widgets should not expected to have delegate in runtime.
				var widgetDelegate = {
					onSettingsModelInit: function() {
						return;
					}
				};

				if (widgetComponent.onWidgetInit) {
					widgetComponent.onWidgetInit(widgetDelegate);
				}

				self.widgetName = widgetApp.getTitle();

				if (widgetConfig) {

					var settingsModel = new sap.ui.model.json.JSONModel();

					if (widgetConfig.config) {
						settingsModel.setData(widgetConfig.config);
					} else {
						settingsModel.setData(widgetDelegate.getDefaultSettings());
					}

					widgetDelegate.onSettingsModelInit(settingsModel);
					self.setSettingsModel(settingsModel);
				}
			});

			this.setAggregation("widgetContent", widgetApplication);
		}

	});
}());