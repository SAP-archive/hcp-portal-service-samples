/**
 * Created by i048697 on 11/04/2016.
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/ui/core/Control",
	"sap/m/Input",
	"sap/m/HBox",
	"sap/ushell/designer/apps/contentRepository/Component",
	"common/widget/control/EcmControl"
], function(jQuery, Button, Dialog, Control, Input, HBox, ContentRepository, EcmControl) {
	return EcmControl.extend("parallaxPage.controls.EmcFilePicker", {
		metadata: {
			properties: {
				funcNumber: {
					type: "integer"
				}
			}
		},

		initDialogContent: function() {
			var aFileType = this.getProperty("fileType"),
				oCompCont;
			this.displayDialogUI();
			if (this.oComponent === undefined) {
				this.oComponent = new ContentRepository();
			}

			this.oComponent.setHeaderTitle(this.oBundle.getProperty("SELECT_FROM_REPOSITORY_TITLE"));

			if (aFileType.length > 0) {
				this.oComponent.setFileTypeFilter(aFileType);
			}

			oCompCont = this.getAggregation("_componentContainer");
			oCompCont.setComponent(this.oComponent);
			this.oComponent.attachSelectionChanged(function(oFile) {
				if (oFile) {
					this.onItemClicked(oFile);
					this._imageUrl = oFile.url;
				}
			}.bind(this));

			this.oDialog = this.getAggregation("_dialog");
			this.oDialog.addContent(oCompCont);

			if (sap.ui.core.Popup.getLastZIndex() < 10010) {
				var nextZIndex = sap.ui.core.Popup.getNextZIndex();
				while (nextZIndex < 10010) {
					nextZIndex = sap.ui.core.Popup.getNextZIndex();
				}
			}

			this.oDialog.attachAfterClose(function() {
				this.destroy();
			}.bind(this));

			this.oDialog.open();
		},

		renderer: function(oRM, oControl) {

		}

	});
});