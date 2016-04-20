sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("BreadcrumbsWidget.controller.Main", {

		menuHierarchy: null,

		onInit: function() {
			var siteService = sap.ushell.Container.getService("SiteService");
			this.menuHierarchy = this.populateParentsInMenuHierarchy(siteService.getMenuHierarchy());
			siteService.subscribeOnAppNavigation(this.onAppNavigation.bind(this));
		},

		onAppNavigation: function() {
			var breadcrumbs = this.getView().byId("breadcrumbs");
			if (breadcrumbs) {
				var siteService = sap.ushell.Container.getService("SiteService");
				var currentAppTarget = siteService.getCurrentAppTarget();
				var page = this.getPageInHierarchy(this.menuHierarchy, currentAppTarget);

				breadcrumbs.setCurrentLocationText(page.title);

				var parents = [];
				while (page.parent) {
					parents.unshift(page.parent);
					page = page.parent;
				}

				for (var i = 0; i < parents.length; i++) {
					breadcrumbs.addLink(new sap.m.Link({
						text: parents[i].title,
						press: this.onBreadcrumbPress
					}).data("target", parents[i].target));
				}
			}
		},

		populateParentsInMenuHierarchy: function(menuHierarchy) {
			for (var i = 0; i < menuHierarchy.length; i++) {
				if (menuHierarchy[i].entities) {
					for (var j = 0; j < menuHierarchy[i].entities.length; j++) {
						menuHierarchy[i].entities[j].parent = menuHierarchy[i];
						menuHierarchy[i].entities = this.populateParentsInMenuHierarchy(menuHierarchy[i].entities);
					}
				}
			}
			return menuHierarchy;
		},

		getPageInHierarchy: function(menuHierarchy, currentAppTarget) {
			for (var i = 0; i < menuHierarchy.length; i++) {
				if (menuHierarchy[i].target.semanticObject === currentAppTarget.semanticObject && menuHierarchy[i].target.action === currentAppTarget.action) {
					return menuHierarchy[i];
				}
				else if (menuHierarchy[i].entities) {
					var page;
					for (var j = 0; j < menuHierarchy[i].entities.length; j++) {
						page = this.getPageInHierarchy(menuHierarchy[i].entities, currentAppTarget);
						if (page !== null) {
							return page;
						}
					}
				}
			}
			return null;
		},

		onBreadcrumbPress: function(oEvent) {
			var crossApplicationNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			crossApplicationNavigator.toExternal({
				target: this.data("target")
			});
		}

	});

});