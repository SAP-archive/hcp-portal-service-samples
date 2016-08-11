sap.ui.define([
	"sap/ui/model/resource/ResourceModel",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/m/Input",
	"sap/m/Select",
	"sap/m/MessageStrip",
	"sap/ui/core/Item",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout"

], function(ResourceModel, Button, Dialog, MessageToast, Text, TextArea, Input, Select, MessageStrip, Item, HorizontalLayout,
	VerticalLayout) {
	"use strict";
	var CController = sap.ui.controller("parallaxPage.Template", {
		onInit: function() {
			var _self = this;

			var i18nModel = new ResourceModel({
				bundleName: "parallaxPage.i18n.i18n"
			});
			this.getView().setModel(i18nModel, "i18n");
			var $paralaxImages = $(".parallax-layer-bg");
			$.each($paralaxImages, function() {
				var $self = $(this);
				var parallaxImageId = $self.attr("id");
				var parallaxData = _self.getParallaxBGDataById(parallaxImageId);
				_self.setParallaxData($self, parallaxData);

			});
			$(".parallax-page").scroll(function() {
				this.updatePosition();
				this.applyEffects();
			}.bind(this));

			var siteService = sap.ushell.Container.getService("SiteService");
			if (siteService.isDesignTime()) {
				$.each($paralaxImages, function() {
					var $bg_parallax = $(this);
					var $ps = $("<div class='parallax-settings'>");
					$ps.bind("click", _self.onParallaxSettingsDialog.bind({
						oController: _self,
						$bg_parallax: $bg_parallax
					}));
					$($bg_parallax).append($ps);
				});
			}
			this.drawSiteNav();

		},
		setParallaxData: function($parallax, data) {
			$parallax.attr("data-scroll-speed", data.scrollSpeed);
			if (data) {
				if (data.mediaType !== "video") {
					$parallax.find(".parallax-video").remove();
					$parallax.css("backgroundImage", "url(" + data.mediaURL + ")");
					$parallax.css("backgroundPosition", data.alignment + " center");

				} else {
					$parallax.css("backgroundImage", "");

					setTimeout(function() {
						var $video = $("<video class='parallax-video' muted loop autoplay><source src='" + data.mediaURL +
							"' type='video/mp4'></video>");

						$parallax.append($video);
					}, 500);

				}
			}
		},
		onAfterRendering: function() {
			this.updatePosition();
			this.applyEffects();
		},
		onParallaxSettingsDialog: function() {
			var oBundle = this.oController.getView().getModel("i18n").getResourceBundle();
			var $bg_parallax = this.$bg_parallax;
			var bgImageId = $bg_parallax.attr("id");
			var oController = this.oController;
			var pData = oController.getParallaxBGDataById(bgImageId);
			var URLTextArea = new Input("bgUrlDialogTextarea", {
				width: "220px",
				value: (pData ? pData.mediaURL : "")
			});

			var selectedType = new Select("mediaType", {
				width: "320px",
				selectedKey: (pData ? pData.mediaType : "image")
			});

			var video = new Item({
				key: "video",
				text: oBundle.getText("video_option")
			});

			selectedType.insertItem(video, 0);

			var image = new Item({
				key: "image",
				text: oBundle.getText("image_option")
			});
			selectedType.insertItem(image, 1);

			var alignment = new Select("alignment", {
				width: "320px",
				selectedKey: (pData ? pData.alignment : "center")
			});

			var top = new Item({
				key: "top",
				text: oBundle.getText("top_option")
			});

			alignment.insertItem(top, 0);

			var center = new Item({
				key: "center",
				text: oBundle.getText("center_option")
			});

			alignment.insertItem(center, 1);

			var bottom = new Item({
				key: "bottom",
				text: oBundle.getText("bottom_option")
			});

			alignment.insertItem(bottom, 2);

			var speed = new Select("speed", {
				width: "320px",
				selectedKey: (pData ? pData.scrollSpeed : "default")
			});

			var speed25 = new Item({
				key: "speed25",
				text: oBundle.getText("slow_option")
			});

			speed.insertItem(speed25, 0);
			var speed50 = new Item({
				key: "speed50",
				text: oBundle.getText("medium_option")
			});

			speed.insertItem(speed50, 1);

			var speed75 = new Item({
				key: "speed75",
				text: oBundle.getText("fast_option")
			});
			speed.insertItem(speed75, 2);
			var speedAuto = new Item({
				key: "default",
				text: oBundle.getText("regular_scroll_option")
			});
			speed.insertItem(speedAuto, 3);
			var speed0 = new Item({
				key: "speed0",
				text: oBundle.getText("no_scroll_option")
			});
			speed.insertItem(speed0, 4);

			if (pData.mediaType !== "image") {
				alignment.setEnabled(false);
			}
			selectedType.attachChange(function(evt) {
				if (evt.mParameters.selectedItem !== image) {
					alignment.setEnabled(false);
				} else {
					alignment.setEnabled(true);
				}
			});
			var dialog = new Dialog({
				title: oBundle.getText("parallax_setting_dialog_title"),
				type: "Message",
				content: [

					new VerticalLayout({

						content: [

							new Text({

								text: oBundle.getText("assetType_label")
							}).addStyleClass("sapUiSmallMarginTop"),

							selectedType,
							new Text({

								text: oBundle.getText("url_text")
							}).addStyleClass("sapUiSmallMarginTop"),

							new HorizontalLayout({

								content: [
									URLTextArea,
									new Button({

										text: oBundle.getText("select_file_button"),
										press: function() {
											jQuery.sap.require("parallaxPage.controls.EmcFilePicker");
											var ecmControl = new parallaxPage.controls.EmcFilePicker();
											ecmControl.placeAt($bg_parallax);
											ecmControl.setFuncNumber(bgImageId);
											ecmControl.onBrowsePress();
											ecmControl.attachEvent("selected", function(evt) {
												var params = evt.getParameters();
												URLTextArea.setValue(params.url);
												URLTextArea.setValue(params.url);
											});
										}
									}).addStyleClass("sapUiSmallMarginBegin")
								]
							}),
							new Text({
								text: oBundle.getText("alignment_text")
							}).addStyleClass("sapUiSmallMarginTop"),
							alignment,
							new Text({
								text: oBundle.getText("parallax_scroll_pace_text")
							}).addStyleClass("sapUiSmallMarginTop"),
							speed,
							new MessageStrip({
								text: oBundle.getText("parallax_scroll_pace_tooltip"),
								type: "Information",
								showIcon: true,
								width: "320px"
							})
						]
					}).addStyleClass("sapUiResponsiveMargin")
				],
				beginButton: new Button({
					text: oBundle.getText("save_button"),
					type: "Emphasized",
					press: function() {
						var bgURL = sap.ui.getCore().byId("bgUrlDialogTextarea").getValue();
						var type = selectedType.getSelectedKey();
						var bgAlignment = alignment.getSelectedKey();
						var scrollSpeed = speed.getSelectedKey();
						var parallaxData = {
							mediaURL: bgURL,
							mediaType: type,
							alignment: bgAlignment,
							scrollSpeed: scrollSpeed
						};
						oController.setParallaxData($bg_parallax, parallaxData);
						oController.setParallaxBGDataById(bgImageId, parallaxData);
						dialog.close();
					}
				}),
				endButton: new Button({
					text: oBundle.getText("cancel_button"),
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		getParallaxBGDataById: function(parallaxImageId) {
			var siteService = sap.ushell.Container.getService("SiteService");
			var pageSettings = siteService.getPageSettings();

			var parallaxImageDefaults = {
				mediaURL: "",
				mediaType: "image",
				alignment: "center",
				scrollSpeed: "default"
			};

			if (pageSettings && pageSettings.parallaxImages && pageSettings.parallaxImages[parallaxImageId]) {
				return pageSettings.parallaxImages[parallaxImageId];
			} else {
				return parallaxImageDefaults;
			}

		},
		setParallaxBGDataById: function(parallaxImageId, data) {
			var siteService = sap.ushell.Container.getService("SiteService");
			var pageSettings = siteService.getPageSettings();
			if (!pageSettings) {
				pageSettings = {
					parallaxImages: {}
				};
			}
			pageSettings.parallaxImages[parallaxImageId] = data;
			siteService.savePageSettings(pageSettings);
		},
		drawSiteNav: function() {

			var user = sap.ushell.Container.getUser();
			$(".user-section-name").text(user.getFullName());
			var target;
			var siteService = sap.ushell.Container.getService("SiteService");
			var isRuntime = siteService.isRuntime();
			if (isRuntime) {
				target = siteService.getCurrentAppTarget();
			}
			var pages = siteService.getMenuHierarchy();
			var $nav = $(".parallax-page-nav-menu");
			var oController = this;

			$.each(pages, function() {
				var title = this.title;
				var $li = $("<li>");
				$li.data("menudata", this);
				if (target && target.semanticObject === this.target.semanticObject && target.action === this.target.action) {
					$li.addClass("selected");
				}
				$li.text(title);
				$li.on("click", oController.navigate);
				$nav.append($li);

			});

			if (isRuntime) {
				hasher.changed.add(function(toObject) {
					var menuItems = $nav.find("li");
					menuItems.removeClass("selected");
					var i = 0;
					var len = menuItems.length;
					for (; i < len; i++) {
						var $item = $(menuItems[i]);
						var menudata = $item.data("menudata");
						if (menudata.target.semanticObject === toObject.semanticObject && menudata.target.action === toObject.action) {
							$item.addClass("selected");
						}

					}

				}, this);
			}
		},

		applyEffects: function() {
			var $parallaxPage = $(".parallax-page");
			var $dataEffects = $($parallaxPage).find("[data-effects]");

			var st = $parallaxPage.scrollTop();
			var viewPortHeight = $parallaxPage.height();
			var _self = this;
			$.each($dataEffects, function() {
				var $element = $(this);
				var runOnce = $element.data("effects-once");
				if (runOnce && $element.data("effect-done")) {
					return;
				}
				var $parallax = $element.closest(".parallax");
				var effects = $element.data("effects");
				var effectOn = $element.data("effects-on");
				var height;
				var offsetTop;
				var diff, delta;
				if ($parallax && $parallax.length > 0) {
					offsetTop = $parallax[0].offsetTop;
					height = $parallax.height();

				} else {
					var offset = _self.cumulativeOffset(this);
					offsetTop = offset.top;
					height = $element.height();
				}

				if (st >= offsetTop && st <= (offsetTop + height) && (!effectOn || effectOn === "exit")) {
					diff = st - (offsetTop);
					delta = diff / height;
					$element.data("effect-done", false);
					_self.calcEffects($element, delta, effects);
				} else if (st + viewPortHeight >= offsetTop && st + viewPortHeight < offsetTop + height && (!effectOn || effectOn === "enter")) {
					diff = (st + viewPortHeight) - (offsetTop + height);
					delta = Math.abs(diff / height);
					$element.data("effect-done", false);
					_self.calcEffects($element, delta, effects);
				} else {

					if ($element.data("effect-done") === false) {
						$element.data("effect-done", true);
					}

					_self.calcEffects($element, 0, effects);
				}

			});

		},
		cumulativeOffset: function(element) {

			var top = 0,
				left = 0;
			do {
				top += element.offsetTop || 0;
				left += element.offsetLeft || 0;
				element = element.offsetParent;
			} while ($(element).hasClass("parallax-page") === false);

			return {
				top: top,
				left: left
			};
		},
		updatePosition: function() {
			var $parallax = $(".parallax");
			var $parallaxPage = $(".parallax-page");
			var st = $parallaxPage.scrollTop();
			var $parallaxHeader = $(".parallax-header");
			if (st > $parallaxHeader.height()) {
				$parallaxHeader.addClass("stick");
			} else {
				$parallaxHeader.removeClass("stick");
			}
			//Stick the header to the top
			this.translateY($parallaxHeader, st);

			var _self = this;
			var viewPortHeight = $parallaxPage.height();
			$.each($parallax, function() {
				var $this = $(this);

				var $parallaxPlus75 = $this.find("[data-scroll-speed='speed75']");
				var $parallaxPlus25 = $this.find("[data-scroll-speed='speed25']");
				var $parallaxPlus50 = $this.find("[data-scroll-speed='speed50']");
				var $parallaxPlus0 = $this.find("[data-scroll-speed='speed0']");

				var offsetTop = $this[0].offsetTop;
				var diff = st - (offsetTop);
				var newPos50 = diff * 0.5;
				var newPos25 = diff * 0.25;
				var newPos75 = diff * 0.75;
				var newPos0 = diff * 1;

				if (st >= offsetTop && st <= (offsetTop + $this.height())) {

					_self.translateY($parallaxPlus50, newPos50);
					_self.translateY($parallaxPlus25, newPos25);
					_self.translateY($parallaxPlus75, newPos75);
					_self.translateY($parallaxPlus0, newPos0);

				} else {

					if (st + viewPortHeight >= offsetTop && st + viewPortHeight < offsetTop + $this.height()) {

						diff = (st + viewPortHeight) - (offsetTop + $this.height());

						newPos50 = diff * 0.5;
						newPos25 = diff * 0.25;
						newPos75 = diff * 0.75;
						newPos0 = diff * 1;
						_self.translateY($parallaxPlus50, newPos50 < 0 ? newPos50 : 0);
						_self.translateY($parallaxPlus25, newPos25 < 0 ? newPos25 : 0);
						_self.translateY($parallaxPlus75, newPos75 < 0 ? newPos75 : 0);
						_self.translateY($parallaxPlus0, newPos0);

					} else {

						_self.translateY($parallaxPlus50, 0);
						_self.translateY($parallaxPlus25, 0);
						_self.translateY($parallaxPlus75, 0);
						_self.translateY($parallaxPlus0, 0);
					}

				}

			});

		},
		navigate: function() {
			var menudata = $(this).data("menudata");
			var crossApplicationNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			crossApplicationNavigator.toExternal({
				target: menudata.target
			});
		},

		calcEffects: function($element, delta, effectStr) {

			var EFFECTS = {
				translateX: 0,
				translateY: 0,
				translateZ: 0,
				rotateX: 0,
				rotateY: 0,
				rotateZ: 0,
				scaleX: 1,
				scaleY: 1,
				scaleZ: 1,
				opacity: 1,
				grayscale: 0,
				blur: 0
			};

			var filtersProp = ["opacity", "grayscale", "blur"];

			var arr = effectStr.split(";");
			var effects = $.extend({}, EFFECTS);
			$.each(arr, function(i, v) {
				if (v) {
					var parts = v.split(":");
					if (parts.length === 2) {
						var value = parseFloat(parts[1]);
						var unit = parts[1].replace(value, "");
						effects[parts[0]] = (EFFECTS[parts[0]] === 1) ? 1 - ((1 - value) * delta) : ((value * delta) + unit);
					}
				}
			});

			var transform = [];
			var filters = [];
			$.each(effects, function(key) {

				if (parseFloat(effects[key]) !== parseFloat(EFFECTS[key])) {

					if (filtersProp.indexOf(key) === -1) {
						transform.push(key + "(" + effects[key] + ")");
					} else {
						filters.push(key + "(" + effects[key] + ")");
					}

				}

			});

			$element.css({
				filter: filters.join(" "),
				webkitFilter: filters.join(" "),
				transform: transform.join(" ")
			});

		},
		translateY: function($elm, value) {
			var translate = value === 0 ? "" : "translate3d(0," + value + "px ,0)";

			$elm.css({
				transform: translate,
				MozTransform: translate,
				WebkitTransform: translate,
				msTransform: translate
			});
		}

	});

	return CController;

});