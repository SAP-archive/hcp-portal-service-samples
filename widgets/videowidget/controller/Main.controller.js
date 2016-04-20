sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("VideoWidget.controller.Main", {

		onAfterRenderingDone: false,
		videoId: null,
		widgetHeight: null,

		onInit: function() {
			this.getOwnerComponent().widgetController = this;
		},

		onAfterRendering: function() {
			if (!this.onAfterRenderingDone) {
				this.onAfterRenderingDone = true;
				this.renderView();
			}
		},

		updateViewSettings: function(settings) {
			var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
			var match = settings.videoUrl.value.match(regExp);

			this.videoId = match[2];
			this.widgetHeight = settings.widgetHeight.value;
			if (this.onAfterRenderingDone) {
				this.renderView();
			}
		},

		renderView: function() {
			var view = this.getView().$();
			view.empty();
			view.css("height", this.widgetHeight + "px");

			var iFrame = $("<iframe class=\"youtubeFrame\" src=\"https://www.youtube.com/embed/" + this.videoId + "\" frameborder=\"0\"></iframe>");
			iFrame.css("height", this.widgetHeight + "px");
			view.append(iFrame);
		}

	});

});