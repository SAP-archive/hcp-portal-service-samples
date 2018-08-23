sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("languageselectorwidget.controller.View1", {
		
		
		onAfterRendering: function(){
			this.UserInfoService = sap.ushell.Container.getService("UserInfo");
			var that = this;
			this.UserInfoService.getLanguageList().then(function(langJSON){
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(langJSON);
				that.getView().setModel(oModel, "AvailableLanguages");
				
				var user = that.UserInfoService.getUser();
				var userLanguage = user.getLanguage();
				
				var languageSelect = that.getView().byId("languageSelect");
				languageSelect.setSelectedKey(userLanguage);
			});
		},		
		
		onDropDownSelect: function(oEvent){
			var selectedItem = oEvent.getParameter("selectedItem");
			var selectedlaunguage = selectedItem.getKey();
			var user = this.UserInfoService.getUser();
			user.setLanguage(selectedlaunguage);
			this.UserInfoService.updateUserPreferences(user);
			
			location.reload();
		}

	});
});