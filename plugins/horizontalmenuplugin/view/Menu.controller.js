sap.ui.controller("HorizontalMenuPlugin.view.Menu", {
	onInit: function() {
		var showFirstLevel = true;

		jQuery.sap.registerModulePath("HorizontalMenuPlugin.control", "/sap/fiori/horizontalmenuplugin/controls");
		jQuery.sap.require("HorizontalMenuPlugin.control.megaMenuControl");
		jQuery.sap.require("HorizontalMenuPlugin.control.megaMenuItem");

		var siteService = sap.ushell.Container.getService("SiteService");
		var pages = siteService.getMenuHierarchy();
		var target = siteService.getCurrentAppTarget();
		var megamenu = new HorizontalMenuPlugin.control();

		megamenu.setDisplayMenuLevel(showFirstLevel);
		megamenu.setPages(pages, target);

		var view = this.getView();

		var megaMenuBar = view.byId("megaMenuBar");
		megaMenuBar.addItem(megamenu);

		sap.ui.core.ResizeHandler.register(megaMenuBar, this.onMenuResize.bind({
			megamenu: megamenu,
			oComp: this
		}));
	},

	onMenuResize: function() {
		var view = this.oComp.getView();
		var megaMenuBar = view.byId("megaMenuBar");
		var barWidth = megaMenuBar.$().width();
		this.megamenu.hideOverflow(barWidth);
	}

});