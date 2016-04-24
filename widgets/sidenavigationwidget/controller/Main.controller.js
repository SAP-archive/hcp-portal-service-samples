sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("SideNavigationWidget.controller.Main", {

		onInit: function() {
			var siteService = sap.ushell.Container.getService("SiteService");
			var menuHierarchy = siteService.getMenuHierarchy();
			var navigationList = this.getView().byId("navigationList");

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