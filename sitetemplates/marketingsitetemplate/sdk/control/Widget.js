(function () {
    "use strict";

    sap.m.HBox.extend("sap.hana.uis.flp.control.Widget", {

        _oDialog: null,
        library: "sap.m",
        isEmpty: true,
        copyOfModelData: null,
        widgetContent: null,
        menu: null,
        metadata: {
            properties: {
                alias: "string",
                css: "string",
                isRuntime: 'boolean'

            },
            defaultAggregation: "content",
            aggregations: {
                optionsMenuButton: {type: "sap.ui.core.Icon", multiple: false}
            }
        },


        init: function () {
            sap.m.HBox.prototype.init.call(this);
            if (sap.ushell) {
                var templateService = sap.ushell.Container.getService('TemplateService');
                this.setIsRuntime(templateService.getIsRuntime());
            }
            
            var oControl = this, menuButton;
            oControl.addStyleClass("widget-container");
            menuButton = new sap.ui.core.Icon({
                src: "sap-icon://action-settings",
                press: function (oEvent) {
                    oControl.displayMenu(oEvent);
                }
            });
            menuButton.addStyleClass("widget-options sapThemeHighlight-asColor");
            oControl.setAggregation("optionsMenuButton", menuButton);
        },

        onWidgetSettingsDialogClose: function () {
            //Rollback
            if (this.copyOfModelData) {
                var _self = this;
                var config = this.settingsModel.getData();
                jQuery.each(config, function (k) {
                    this.value = _self.copyOfModelData[k].value;
                });

                this.settingsModel.refresh();


            }
            this._oDialog.close();
        },
        onWidgetSettingsDialogSave: function () {

            var configurationService = sap.ushell.Container.getService('ConfigurationService');
            if (this.widgetComponent.onSettingsChange) {
                var config = this.settingsModel.getData();
                configurationService.updateConfig(this.getAlias(), config);
                this.widgetComponent.onSettingsChange();
            }
            this._oDialog.close();
        },
        addSettingsContent: function (data) {

            this.dialogModel = new sap.ui.model.json.JSONModel();
            this.dialogModel.setData(data);

            this.settingList = new sap.m.List();
            this._oDialog.addContent(this.settingList);
            this.settingList.setModel(this.dialogModel);
            this.settingList.bindItems({
                path: "/settings",
                template: new sap.m.InputListItem({
                    label: "{displayName}",
                    content: new sap.m.Input({
                        value: "{value}",
                        placeholder: "new value"
                    })
                })
            });


        },


        getWidgetSettingsToArray: function (config) {

            var settings = jQuery.map(config, function (v, k) {
                v.id = k;
                return v;
            });
            return {settings: settings};
        },
        openSettingsDialog: function () {
            var config = this.settingsModel.getData();
            this.copyOfModelData = jQuery.extend(true, {}, config);
            var settings = this.getWidgetSettingsToArray(config);

            if (!this._oDialog) {

                //if (this.widgetComponent.getSettingsDialog) {
                //    this._oDialog = this.widgetComponent.getSettingsDialog({
                //        onSave: function (data) {
                //            //
                //        }
                //    });
                //
                //} else {
                this._oDialog = sap.ui.xmlfragment("sap.ushell.designer.apps.siteEditor.view.widgetSettingsDialog", this);

                //Reference to siteEditor properties file
                var oI18nAppModel;
                oI18nAppModel = new sap.ui.model.resource.ResourceModel({
                    bundleUrl: "/sap.ushell.designer.apps.siteEditor.resources.i18nApp.properties"
                });
                this._oDialog.setModel(oI18nAppModel, "i18nApp");

                this.addSettingsContent(settings);
                //}

                this.addDependent(this._oDialog);
            } else {
                this.dialogModel.setData(settings);
                this.dialogModel.refresh();
            }

            jQuery.sap.syncStyleClass("sapUiSizeCompact", this, this._oDialog);
            this._oDialog.open();
        },
        displayMenu: function (oEvent) {
            var oControl = this;
            var button = oEvent.oSource;
            if (!this.menu) {
                this.menu = new sap.m.ActionSheet({
                    showCancelButton: false,
                    afterClose: function () {
                        button.removeStyleClass("menu-open");
                    },
                    beforeOpen: function () {
                        button.addStyleClass("menu-open");
                    },
                    buttons: [
                        new sap.m.Button({
                            icon: "sap-icon://settings",
                            text: "Setting",
                            press: oControl.openSettingsDialog.bind(oControl)
                        }),
                        new sap.m.Button({
                            icon: "sap-icon://edit",
                            text: "Edit"
                        }),
                        new sap.m.Button({
                            icon: "sap-icon://delete",
                            text: "Delete"
                        })
                    ],
                    placement: sap.m.PlacementType.Bottom

                });
            }

            this.menu.openBy(button);


        },
        renderer: function (oRm, oControl) {

            var isRuntime = oControl.getIsRuntime();
            var className = isRuntime ? "widget sapThemeBaseBG" : "widget sapThemeBaseBG sapThemeHighlight-asBorderColor";


            oRm.write('<div class="' + className + '" style="' + oControl.getCss() + '"');
            oRm.write(">");
            if (!oControl.isEmpty && !isRuntime) {
                oRm.renderControl(oControl.getAggregation("optionsMenuButton"));
            }
            oRm.write('<div');
            oRm.writeControlData(oControl);
            oRm.write("></div>");
            oRm.write("</div>");
        },


        onBeforeRendering: function () {
            var _self = this;
            if (sap.ushell) {
                var templateService = sap.ushell.Container.getService('TemplateService');
                var configurationService = sap.ushell.Container.getService('ConfigurationService');
                this.widgetContent = templateService.getWidget(this.getAlias());
                if (this.widgetContent.mProperties.url !== "") {
                    this.isEmpty = false;
                    this.widgetContent.attachEvent("applicationConfiguration", function () {
                        _self.widgetComponent = sap.ui.getCore().getComponent(this.sId + "-component");
                        var widgetConfig = configurationService.getConfig(_self.getAlias());
                        if (widgetConfig) {
                            var settingsModel = new sap.ui.model.json.JSONModel();
                            settingsModel.setData(widgetConfig);
                            _self.widgetComponent.setModel(settingsModel, 'settings');

                        } else {
                            if (_self.widgetComponent.setDefaultSettings) {
                                _self.widgetComponent.setDefaultSettings();
                            }
                        }
                        _self.settingsModel = _self.widgetComponent.getModel('settings');


                    });
                }
            } else {
                this.widgetContent = new sap.m.Label({text: "Place Holder"});
            }
        },

        onAfterRendering: function () {
            sap.m.HBox.prototype.onAfterRendering.call(this);
            this.widgetContent.placeAt(this.getDomRef());
        },

        destroy: function () {
            if (this.widgetContent && this.widgetContent.destroy) {
                this.widgetContent.destroy();
            }
            sap.m.HBox.prototype.destroy.call(this);
        }
    });

}());