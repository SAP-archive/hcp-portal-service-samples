sap.ui.controller("cpv2.templates.template2.Template2", {

	onInit: function() {

	},

	navigateToPage: function(oEvent) {
		var comboBox = oEvent.getSource(),
			intentSemanticObject = comboBox.getSelectedKey();

		var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
		oCrossAppNavigator.toExternal({
			target: {
				semanticObject: intentSemanticObject,
				action: "show"
			}
		});
	},

	onAfterRendering: function() {
		if (!this.rendered) {
			this.rendered = true;
		} else {
			return;
		}

		var layouts = $('.site-nav-bar'),
			pagesTitle = $('.page-title'),
			pageTitle,
			layout,
			that = this;

		pagesTitle.each(function() {
			pageTitle = sap.ui.getCore().byId($(this).attr('id'));
			pageTitle.setText(window.location.hash ? window.location.hash.substring(1, window.location.hash.indexOf('-')) : window.siteConfig.appConfigurations[
				window.siteConfig.defaultPage].name);
		});

		layouts.each(function() {
			layout = sap.ui.getCore().byId($(this).attr('id'));
			that.addButtons(layout);
		});
	},

	addButtons: function getButtons(layout) {
		var navigateToPage = this.navigateToPage;
		var i,
			apps = window.siteConfig ? window.siteConfig.appConfigurations : {},
			button,
			navBar = new sap.m.IconTabBar({
				select: navigateToPage
			}),
			oItem;

		for (i in apps) {
			if (apps.hasOwnProperty(i) && (apps[i]._templateEntityID || apps[i]._templateRef)) {
				//page
				oItem = new sap.m.IconTabFilter();
				oItem.setText(apps[i].name);
				oItem.setKey(apps[i]["sap.hana.uis.flp.app.intentSemanticObject"]);
				navBar.addItem(oItem);
			}
		}

		layout.addItem(navBar);
	}
});