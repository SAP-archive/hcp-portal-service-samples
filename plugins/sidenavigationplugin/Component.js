sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"SideNavigationPlugin/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("SideNavigationPlugin.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			if (this.getModel("device").getData().system.desktop) {
				this.createMenu();
			}
		},

		createMenu: function() {
			var siteService = sap.ushell.Container.getService("SiteService");
			var renderer = sap.ushell.Container.getRenderer("fiori2");
			renderer.setLeftPaneVisibility(sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState.Home, true);
			renderer.setLeftPaneVisibility(sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState.App, true);
			var sideNavigation = renderer.addLeftPaneContent("sap.tnt.SideNavigation", {id: "sideNavigation"}, true, false);
			var navigationList = new sap.tnt.NavigationList("navigationList");
			sideNavigation.setItem(navigationList);

			var menuHierarchy = siteService.getMenuHierarchy();
			var page,
				subPage,
				nli,
				subNli;
			for (var i = 0; i < menuHierarchy.length; i++) {
				page = menuHierarchy[i];
				nli = new sap.tnt.NavigationListItem({
					text: page.title,
					select: this.onNavigationItemSelect
				});
				nli.data("target", page.target);
				navigationList.addItem(nli);

				if (page.entities) {
					for (var j = 0; j < page.entities.length; j++) {
						subPage = page.entities[j];
						subNli = new sap.tnt.NavigationListItem({
							text: subPage.title,
							select: this.onNavigationItemSelect
						});
						subNli.data("target", subPage.target);
						nli.addItem(subNli);
					}
				}
			}
		},

		onNavigationItemSelect: function() {
			var crossApplicationNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			crossApplicationNavigator.toExternal({
				target: this.data("target")
			});
		}
	});

});