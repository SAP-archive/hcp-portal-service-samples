sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/Filter',
	'sap/m/MessageBox',
	"sap/ui/Device"
], function(Controller, Filter, MessageBox, Device) {
	"use strict";
	var ContentTypes = {
		FOLDER: "Folder",
		BLOG_ENTRY: "BlogEntry",
		DOCUMENT: "Document",
		PAGE: "Page",
		TOOL: "Tool",
		POLL: "Poll",
		WIKI: "text/html;type=wiki",
		LINK: "Link"
	};
	return Controller.extend("jamcontentwidget.controller.jamcontent", {
		SHORT_MONTHS: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		TypeInformation: {
			FOLDER: {
				icon: "open-folder",
				tooltip: "Folder",
				displayName: "Folder",
				type: ContentTypes.FOLDER
			},
			PAGE: {
				icon: "customer-financial-fact-sheet",
				tooltip: "SAP Jam page",
				displayName: "SAP Jam Page",
				type: ContentTypes.PAGE
			},
			WIKI: {
				icon: "customer-financial-fact-sheet",
				tooltip: "Wiki page",
				displayName: "Wiki Page",
				type: ContentTypes.WIKI
			},
			BLOG_ENTRY: {
				icon: "newspaper",
				tooltip: "Blog entry",
				displayName: "Blog Entry",
				type: ContentTypes.BLOG_ENTRY
			},
			TOOL: {
				icon: "wrench",
				tooltip: "SAP Jam tool",
				displayName: "SAP Jam Tool",
				type: ContentTypes.TOOL
			},
			POLL: {
				icon: "company-view",
				tooltip: "Poll",
				displayName: "Poll",
				type: ContentTypes.POLL
			},
			IMAGE: {
				icon: "picture",
				tooltip: "Image",
				displayName: "Image",
				type: ContentTypes.DOCUMENT
			},
			VIDEO: {
				icon: "video",
				tooltip: "Video",
				displayName: "Video",
				type: ContentTypes.DOCUMENT
			},
			PDF: {
				icon: "pdf-attachment",
				tooltip: "PDF",
				displayName: "PDF",
				type: ContentTypes.DOCUMENT
			},
			DOCUMENT: {
				icon: "document-text",
				tooltip: "Document",
				displayName: "Document",
				type: ContentTypes.DOCUMENT
			},
			AUDIO: {
				icon: "sound-loud",
				tooltip: "Audio file",
				displayName: "Audio File",
				type: ContentTypes.DOCUMENT
			},
			TEXT: {
				icon: "attachment-text-file",
				tooltip: "Text file",
				displayName: "Text File",
				type: ContentTypes.DOCUMENT
			},
			PRESENTATION: {
				icon: "projector",
				tooltip: "Presentation",
				displayName: "Presentation",
				type: ContentTypes.DOCUMENT
			},
			GENERAL: {
				icon: "document-text",
				tooltip: "Content item",
				displayName: "Content Item",
				type: ContentTypes.DOCUMENT
			},
			LINK: {
				icon: "chain-link",
				tooltip: "SAP Jam link",
				displayName: "SAP Jam link",
				type: ContentTypes.LINK
			}
		},
		onInit: function() {
			this.view = this.getView();
			this.oCmp = this.getOwnerComponent();
			this.view.setBusyIndicatorDelay(0);
			this.config = this.oCmp.getMetadata().getConfig();
			this.oCmp.attachEvent("open.dialog", this.openSettingsFragment.bind(this));
			this.folderTrail = [];
			this.heightInputError = false;
			this.jamUrlError = false;
			this.groupError = false;
			var oDeviceModel = new sap.ui.model.json.JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.view.setModel(oDeviceModel, "device");
		},
		openSettingsFragment: function() {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			this.settingsDialog = sap.ui.xmlfragment("jamcontentwidget.view.fragment.widgetSettings", this);
			var groupList = sap.ui.getCore().byId("groupList");
			if (!this.groupsModel) {
				var url = jQuery.sap.getModulePath("jamcontentwidget") + this.config.jamUrl + this.config.groups;
				this.groupsModel = new sap.ui.model.json.JSONModel(url);
				this.groupsModel.attachRequestCompleted(this.onGroupsModelRequestCompleted.bind(this));
				this.groupsModel.attachRequestFailed(this.onGroupsModelRequestFailed.bind(this));
				groupList.setBusy(true);
			} else {
				groupList.addStyleClass("groupListDataLoaded");
			}
			this.settingsModel = new sap.ui.model.json.JSONModel();
			var widgetHeight = settings.height;
			var showGroupName = settings.showGroupName === "true" || settings.showGroupName === true;
			this.settingsModel.setProperty("/showGroupName", showGroupName);
			this.settingsModel.setProperty("/widgetHeight", widgetHeight);
			this.settingsModel.setProperty("/jamHost", settings.jamHost);
			this.settingsModel.setProperty("/groupError", this.groupError);
			this.settingsDialog.setModel(this.groupsModel, "GroupsData");
			this.settingsDialog.setModel(this.settingsModel, "Settings");
			this.settingsDialog.attachAfterClose(function() {
				this.destroy();
			});
			if (settings.groupId) {
				groupList.setSelectedKey(settings.groupId);
			}
			this.settingsDialog.setBusyIndicatorDelay(0);
			this.settingsDialog.open();
		},
		onGroupsModelRequestCompleted: function(oEvent) {
			if (oEvent.getParameter("errorobject")) {
				this.onGroupsModelRequestFailed();
			}
			var groupList = sap.ui.getCore().byId("groupList");
			groupList.setBusy(false);
			groupList.addStyleClass("groupListDataLoaded");

		},
		onConfigChange: function() {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			if (settings.groupId) {
				if (this.folderTrail.length === 0) {
					this.folderTrail.push({
						href: settings.groupId,
						name: settings.groupName
					});
				}
				this.createModel();

			} else {
				settings.isGroupSet = false;
				var contentModel = this.view.getModel("Content");
				if (contentModel) {
					contentModel.setData({});
				}
				this.view.byId("groupListItems").setNoDataText("Select a SAP Jam group by opening the widget settings");
				this.view.byId("groupNameHeader").setVisible(false);
			}
			if (settings.height) {
				this.view.byId("scrollCntr").setHeight(settings.height + "px");
			}
		},
		createModel: function() {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			this.view.byId("groupListItems").setBusyIndicatorDelay(0);
			this.view.byId("groupListItems").setBusy(true);
			this.getContentItemsAndFolders({
				isGroup: true,
				showGroupName: settings.showGroupName === "true" || settings.showGroupName === true,
				isGroupSet: true
			});
		},
		onWidgetHeightChange: function(oEvent) {
			var widgetHeight = oEvent.getSource();
			if (widgetHeight.getValue().length === 0) {
				this.heightInputError = true;
				widgetHeight.setValueState(sap.ui.core.ValueState.Error);
				widgetHeight.setValueStateText("Please enter height in pixels");
			} else {
				widgetHeight.setValueState(sap.ui.core.ValueState.None);
				this.view.byId("scrollCntr").setHeight(widgetHeight.getValue() + "px");
				this.heightInputError = false;
			}
		},
		onGroupsModelRequestFailed: function() {
			var core = sap.ui.getCore();
			core.byId("groupList").setVisible(false);
			core.byId("jamErrorHtml").setVisible(true);
			this.settingsDialog.setBusy(false);
			this.groupsModel = null;
		},
		onSettingCancel: function(oEvent) {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			if (settings.groupId) {
				this.folderTrail = [];
				this.folderTrail.push({
					href: settings.groupId,
					name: settings.groupName
				});
				this.getContentItemsAndFolders({
					isGroup: true,
					showGroupName: settings.showGroupName === "true" || settings.showGroupName === true,
					isGroupSet: true
				});
			} else {
				this.isGroupSet = false;
			}
			this.view.byId("scrollCntr").setHeight(settings.height + "px");
			sap.ui.getCore().byId("messageStripGroupError").setVisible(false);
			this.groupError = false;
			this.view.byId("groupName").setVisible(settings.showGroupName === "true" || settings.showGroupName === true);
			this.oCmp.fireEvent("save.settings", settings);
			oEvent.getSource().getParent().close();
		},
		onGroupSearch: function(oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			var list = sap.ui.getCore().byId("groupList");
			if (sQuery && sQuery.length > 0) {
				if (this.folderTrail[0]) {
					list.setSelectedItem(null);
				}
				var filter = new Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			} else {
				list.setSelectedKey(this.folderTrail[0].href);
			}

			var binding = list.getBinding("items");
			binding.filter(aFilters, "Application");
			oEvent.preventDefault();
		},
		onGroupSelected: function(oEvent) {
			var groupList = oEvent.getSource();
			var item = oEvent.getParameter("item");
			this.folderTrail = [];
			this.folderTrail.push({
				href: item.getKey(),
				name: item.getText()
			});
			this.groupError = false;
			groupList.removeStyleClass("on-group-error");
			sap.ui.getCore().byId("messageStripGroupError").setVisible(false);
			this.view.byId("groupListItems").removeStyleClass("groupContentLoaded");
			this.getContentItemsAndFolders({
				isGroup: true,
				showGroupName: sap.ui.getCore().byId("showGroupName").getSelected(),
				isGroupSet: true
			});
		},
		onSettingsSubmit: function(oEvent) {
			this.isJamHostValid();
			this.isWidgetHeightValid();
			if (this.groupSelectedIsValid() && !this.heightInputError && !this.jamUrlError) {
				var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
				var groupList = sap.ui.getCore().byId("groupList");
				settings.groupId = groupList.getSelectedItem().getKey();
				settings.groupName = groupList.getSelectedItem().getText();
				settings.height = sap.ui.getCore().byId("widgetHeightInput").getValue();
				settings.showGroupName = sap.ui.getCore().byId("showGroupName").getSelected();
				settings.jamHost = sap.ui.getCore().byId("jamUrl").getValue();
				this.oCmp.fireEvent("save.settings", settings);
				oEvent.getSource().getParent().close();
			}
		},
		isWidgetHeightValid: function() {
			var widgetHeight = sap.ui.getCore().byId("widgetHeightInput");
			if (widgetHeight.getValue().length === 0) {
				this.heightInputError = true;
				widgetHeight.setValueState(sap.ui.core.ValueState.Error);
				widgetHeight.setValueStateText("Please enter height in pixels");
			} else {
				widgetHeight.setValueState(sap.ui.core.ValueState.None);
				this.view.byId("scrollCntr").setHeight(widgetHeight.getValue() + "px");
				this.heightInputError = false;
			}
		},
		isJamHostValid: function() {
			var jamUrlInput = sap.ui.getCore().byId("jamUrl");
			if (jamUrlInput.getValue().length === 0) {
				jamUrlInput.setValueState(sap.ui.core.ValueState.Error);
				jamUrlInput.setValueStateText("Please enter SAP Jam URL");
				this.jamUrlError = true;
			} else {
				var urlValidator = new RegExp(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/);
				if (urlValidator.test(jamUrlInput.getValue())) {
					jamUrlInput.setValueState(sap.ui.core.ValueState.None);
					this.jamUrlError = false;
				} else {
					jamUrlInput.setValueState(sap.ui.core.ValueState.Error);
					jamUrlInput.setValueStateText("Please enter a valid URL");
					this.jamUrlError = true;
				}
			}
		},
		groupSelectedIsValid: function() {
			var groupList = sap.ui.getCore().byId("groupList");
			if (!groupList.getSelectedItem()) {
				groupList.addStyleClass("on-group-error");
				sap.ui.getCore().byId("messageStripGroupError").setVisible(true);
				this.groupError = true;
			} else {
				this.groupError = false;
			}
			return !this.groupError;
		},
		onSelectShowGroupName: function(oEvent) {
			var isSelected = oEvent.getSource().getSelected();
			this.view.byId("groupName").setVisible(isSelected);
		},
		getContentItemsAndFolders: function(modelConfig) {
			this.view.byId("groupListItems").setBusy(true);
			var path;
			if (modelConfig.isGroup) {
				path = "/Groups('" + this.folderTrail[this.folderTrail.length - 1].href + "')";
			} else {
				path = this.folderTrail[this.folderTrail.length - 1].href;
			}
			this.contentItemsRequestCompleted = false;
			this.foldersRequestCompleted = false;
			var requestPath = jQuery.sap.getModulePath("jamcontentwidget") + this.config.jamUrl + path;
			this.contentItemsModel = new sap.ui.model.json.JSONModel(requestPath + this.config.contentItems + this.config.expandQuery);
			this.contentItemsModel.attachRequestCompleted(function(oEvent) {
				this.onContentItemsRequestCompleted(oEvent, modelConfig);
			}.bind(this));
			this.contentItemsModel.attachRequestFailed(this.onRequestFailed.bind(this));
			this.foldersModel = new sap.ui.model.json.JSONModel(requestPath + this.config.folderItems + this.config.expandQuery);
			this.foldersModel.attachRequestCompleted(function(oEvent) {
				this.onFoldersRequestCompleted(oEvent, modelConfig);
			}.bind(this));
			this.foldersModel.attachRequestFailed(this.onRequestFailed.bind(this));
		},
		onContentItemsRequestCompleted: function(oEvent, modelConfig) {
			if (oEvent.getParameter("success")) {
				this.contentItemResult = this.contentItemsModel.oData.d.results;
				for (var i = 0; i < this.contentItemResult.length; i++) {
					this.contentItemResult[i].Href = jQuery.sap.getModulePath("jamcontentwidget") + this.config.jamUrl + "/" + this.contentItemResult[i].__metadata.media_src;
				}
				this.contentItemsRequestCompleted = true;
				this.onAfterRequestCompleted(modelConfig);
			} else {
				this.onRequestFailed();
			}

		},
		onFoldersRequestCompleted: function(oEvent, modelConfig) {
			if (oEvent.getParameter("success")) {
				this.folderResults = this.foldersModel.oData.d.results;
				for (var i = 0; i < this.folderResults.length; i++) {
					this.folderResults[i].ContentItemType = "Folder";
				}
				this.foldersRequestCompleted = true;
				this.onAfterRequestCompleted(modelConfig);
			} else {
				this.onRequestFailed();
			}
		},
		onAfterRequestCompleted: function(modelConfig) {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			if (this.contentItemsRequestCompleted && this.foldersRequestCompleted) {
				this.content = this.folderResults.concat(this.contentItemResult);
				for (var i = 0; i < this.content.length; i++) {
					if (this.content[i].ContentItemType === "Folder") {
						this.content[i].Href = "/" + this.content[i].__metadata.uri;
					}
				}
				var dataModel = new sap.ui.model.json.JSONModel(this.createNewModel(this.content));
				var viewModel = new sap.ui.model.json.JSONModel();
				settings.isGroupSet = true;
				viewModel.setProperty("/showHeaderBox", modelConfig.isGroupSet);
				viewModel.setProperty("/groupName", this.folderTrail[0].name);
				viewModel.setProperty("/showGroupName", modelConfig.showGroupName);
				//viewModel.setProperty("/showGroupName", settings.showGroupName === "true" || settings.showGroupName === true);
				this.view.setModel(viewModel, "Settings");
				this.view.setModel(dataModel, "Content");
				this.view.byId("groupListItems").setBusy(false);
				if (this.content.length === 0) {
					this.view.byId("groupListItems").setNoDataText("No content is available");
				}
				this.view.byId("groupListItems").addStyleClass("groupContentLoaded");
				this.updateBreadcrumbsToolbar();
			}
		},
		updateBreadcrumbsToolbar: function() {
			var breadcrumbs = this.view.byId("breadcrumbsToolbar");
			breadcrumbs.removeAllLinks();
			breadcrumbs.removeStyleClass("breadCrumbsLoaded");
			for (var i = 0; i < this.folderTrail.length; i++) {
				breadcrumbs.addLink(new sap.m.Link({
					href: this.folderTrail[i].href,
					text: this.folderTrail[i].name
				}).attachPress(this.onBreadcrumbLinkPress.bind(this)));
			}
			breadcrumbs.addStyleClass("breadCrumbsLoaded");
		},
		onBreadcrumbLinkPress: function(oEvent) {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			oEvent.cancelBubble();
			oEvent.preventDefault();
			this.view.byId("groupListItems").removeStyleClass("groupContentLoaded");
			var href = oEvent.getSource().getProperty('href');
			for (var i = 0; i < this.folderTrail.length; i++) {
				if (this.folderTrail[i].href === href) {
					this.folderTrail.splice(i + 1);
					break;
				}
			}
			this.getContentItemsAndFolders({
				isGroup: this.folderTrail.length === 1,
				showGroupName: settings.showGroupName === "true" || settings.showGroupName === true,
				isGroupSet: true
			});
		},
		onRequestFailed: function() {
			this.view.byId("groupListItems").setBusy(false);
			this.view.byId("scrollCntr").setHeight("50px");
			this.isGroupSet = false;
			this.view.byId("groupListItems").setVisible(false);
			this.view.byId("contentErrorHTML").setVisible(true);
		},
		createNewModel: function(items) {
			var dataArr = [];
			jQuery.each(items, function(k, v) {
				var listItem = this.createListItem(v);
				dataArr.push(listItem);
			}.bind(this));
			return dataArr;
		},
		createListItem: function(data) {
			var finalItem = null;
			var realType = null;
			switch (data.ContentItemType) {
				case ContentTypes.FOLDER:
					data.contentTypeAction = this.TypeInformation.FOLDER.type;
					finalItem = this.createFolderItem(data);
					break;
				case ContentTypes.BLOG_ENTRY:
					data.contentTypeAction = this.TypeInformation.BLOG_ENTRY.type;
					finalItem = this.createContentItem(data, this.TypeInformation.BLOG_ENTRY);
					break;
				case ContentTypes.DOCUMENT:
					realType = this.getRealType(data.ContentType);
					data.contentTypeAction = realType.type;
					finalItem = this.createContentItem(data, realType);
					break;
				case ContentTypes.PAGE:
					realType = this.getRealType(data.ContentType);
					data.contentTypeAction = realType.type;
					finalItem = this.createContentItem(data, realType);
					break;
				case ContentTypes.POLL:
					data.contentTypeAction = this.TypeInformation.POLL.type;
					finalItem = this.createContentItem(data, this.TypeInformation.POLL);
					break;
				case ContentTypes.LINK:
					data.contentTypeAction = this.TypeInformation.LINK.type;
					finalItem = this.createContentItem(data, this.TypeInformation.LINK);
					break;
				case ContentTypes.TOOL:
					data.contentTypeAction = this.TypeInformation.TOOL.type;
					finalItem = this.createContentItem(data, this.TypeInformation.TOOL);
					break;
				default:
					data.contentTypeAction = this.TypeInformation.GENERAL.type;
					finalItem = this.createContentItem(data, this.TypeInformation.GENERAL);
					break;
			}
			return finalItem;
		},
		createContentItem: function(data, infoType) {
			return {
				name: data.Name,
				creator: data.Creator.FullName,
				contentType: infoType.type,
				displayName: infoType.displayName,
				createdAt: this.toLongJamString(data.CreatedAt),
				icon: "sap-icon://" + infoType.icon,
				tooltip: infoType.tooltip,
				data: data
			};
		},
		createFolderItem: function(data) {
			return {
				name: data.Name,
				creator: data.Creator.FullName,
				createdAt: this.toLongJamString(data.LastModifiedAt),
				fileName: this.TypeInformation.FOLDER.type,
				contentType: data.ContentItemType,
				displayName: this.TypeInformation.FOLDER.displayName,
				icon: "sap-icon://" + this.TypeInformation.FOLDER.icon,
				tooltip: this.TypeInformation.FOLDER.tooltip,
				data: data
			};
		},
		getRealType: function(contentType) {
			if (contentType.indexOf("image") !== -1)
				return this.TypeInformation.IMAGE;
			else if (contentType.indexOf("pdf") !== -1)
				return this.TypeInformation.PDF;
			else if (contentType.indexOf("video") !== -1)
				return this.TypeInformation.VIDEO;
			else if ((contentType.indexOf("powerpoint") !== -1) || (contentType.indexOf("presentation") !== -1))
				return this.TypeInformation.PRESENTATION;
			else if (contentType.indexOf("wiki") !== -1)
				return this.TypeInformation.WIKI;
			else if (contentType.indexOf("text/plain") !== -1)
				return this.TypeInformation.LINK;
			else if (contentType.indexOf("word") !== -1)
				return this.TypeInformation.DOCUMENT;
			else {
				return this.TypeInformation.GENERAL;
			}
		},
		toLongJamString: function(str) {
			var strDate = new Date(parseInt(str.substring(6, str.length - 2)));
			return (new Date().toLocaleDateString() === strDate.toLocaleDateString() ? "" : this.SHORT_MONTHS[strDate.getMonth()] + " " + strDate.getDate() + ", ") + this.getAMPMTime(strDate);
		},
		getAMPMTime: function(date) {
			var hours = date.getHours();
			var minutes = date.getMinutes();
			var ampm = hours >= 12 ? "PM" : "AM";
			hours = hours % 12;
			hours = hours ? hours : 12;
			minutes = minutes < 10 ? "0" + minutes : minutes;
			return hours + ":" + minutes + " " + ampm;
		},
		onLinkPress: function(oEvent) {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			var contentItem = oEvent.getSource().data("content");
			var href = contentItem.Href;
			switch (contentItem.contentTypeAction) {
				case ContentTypes.FOLDER:
					this.folderTrail.push({
						href: href,
						name: contentItem.Name
					});
					this.getContentItemsAndFolders({
						isGroup: false,
						showGroupName: settings.showGroupName === "true" || settings.showGroupName === true,
						isGroupSet: true
					});
					oEvent.preventDefault();
					break;
				case ContentTypes.BLOG_ENTRY:
					window.open(settings.jamHost + "/blogs/show/" + contentItem.Id);
					oEvent.preventDefault();
					break;
				case ContentTypes.TOOL:
					window.open(settings.jamHost + "/groups/" + settings.groupId + "/sw_items/" + contentItem.Id);
					oEvent.preventDefault();
					break;
				case ContentTypes.POLL:
					window.open(settings.jamHost + "/poll/show/" + contentItem.Id);
					oEvent.preventDefault();
					break;
				case ContentTypes.PAGE:
					window.open(href);
					oEvent.preventDefault();
					break;
				case ContentTypes.DOCUMENT:
					window.open(href);
					oEvent.preventDefault();
					break;
				case ContentTypes.LINK:
					window.open(settings.jamHost + "/profile/" + contentItem.Creator.Id + "/documents/" + contentItem.Id);
					oEvent.preventDefault();
					break;
				case ContentTypes.WIKI:
					window.open(settings.jamHost + "/wiki/show/" + contentItem.Id);
					oEvent.preventDefault();
					break;
				default:
					MessageBox.alert("This capability is not supported yet",
						{title: "Information"}
					);
					oEvent.preventDefault();
			}
		}

	});

});