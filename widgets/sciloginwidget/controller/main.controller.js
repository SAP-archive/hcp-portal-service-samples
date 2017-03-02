sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sciloginwidget.controller.main", {
		
		onInit: function() {
			this.view = this.getView();
			this.oCmp = this.getOwnerComponent();
			this.core = sap.ui.getCore();

			this.view.setBusyIndicatorDelay(0);

			this.config = this.oCmp.getMetadata().getConfig();
			this.oCmp.attachEvent("open.dialog", this.openSettingsFragment.bind(this));
			this.oCmp.attachEvent("save.settings.error", function (oEvent) {
				alert("Save failed for widget settings.");
			});
		},

		onAfterRendering: function() {
			this.setLogInTextProperties();
		},
		
		
		onLogIconPress: function(){
			if(this.isUserLoggedIn()){
				this.onLogout();
			}else{
				this.onLogin();
			}
		},
		
		isUserLoggedIn: function(){
			return (sap.ushell.Container.getUser().getFullName() !== "Guest");
		},

		onLogin: function() {
			if (!sap.ushell.Container.getService("SiteService").isRuntime()) {
				return;
			}
			var sciConfig = this.getOwnerComponent().getMetadata().getConfig().sci;
			if (sciConfig.useOverlay) {
				$("#hiddenLoginButton").find("a").click();
			}
			else {
				window.location.search = encodeURI(window.location.search === "" ? "?hc_login" : window.location.search + "&hc_login");
			}
		},

		onLogout: function() {
			if (!sap.ushell.Container.getService("SiteService").isRuntime()) {
				return;
			}
			sap.ushell.Container.logout();
		},
		
		setLogInTextProperties: function(){
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			this.config.listHeaderTitle = settings.listHeaderTitle;
			this.config.listHeaderColor = settings.listHeaderColor;
			$(".logonColor").css('color', this.config.listHeaderColor);
			var userName = sap.ushell.Container.getUser().getFullName();
			var loginGreetingLabel = this.getView().byId("loginGreeting");

			var loginIcon = this.getView().byId("loginIcon");
			if(this.isUserLoggedIn()){
				loginIcon.setSrc("sap-icon://customer");
				var newHeaderPrefix = this.config.listHeaderTitle;
				if(newHeaderPrefix){
					loginGreetingLabel.setText(newHeaderPrefix + " " + userName);
				}else{
					loginGreetingLabel.setText(userName);
				}
			}else{
				loginIcon.setSrc("sap-icon://log");
				loginGreetingLabel.setText("LOGIN");
			}
		},
		
		/********************************************************************************************************************************************/
		
		setWidgetData: function(){
			this.setLogInTextProperties();
		},
		
		openSettingsFragment: function() {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;

			this.fragment = sap.ui.xmlfragment("sciloginwidget.fragment.WidgetSettings", this);
			this.fragment.setModel(this.view.getModel("i18n"), "i18n");

			this.fragment.setModel(new sap.ui.model.json.JSONModel(jQuery.extend({}, settings)), "visualProperties");
			this.fragment.attachAfterClose(function() {
				this.destroy();
			});

			this.fragment.setBusyIndicatorDelay(0);
			this.fragment.open();
		},
		
		onSettingsSubmit: function(oEvent) {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			var headetTitle = sap.ui.getCore().byId("listHeaderTitle").getValue();
			var headerColor = sap.ui.getCore().byId("listHeaderColor").Color.hex;
			settings.listHeaderTitle = headetTitle;
			settings.listHeaderColor = headerColor;                         
			this.oCmp.fireEvent("save.settings", settings);
			oEvent.getSource().getParent().close();
		},

		onSettingCancel: function(oEvent) {
			oEvent.getSource().getParent().close();
		}

	});
});