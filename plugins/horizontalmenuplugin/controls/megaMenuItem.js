/**
 * Created by i048697 on 1/4/16.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/core/Control", "sap/ui/core/EnabledPropagator"],
	function(jQuery, Control, EnabledPropagator) {
		"use strict";

		var megaMenuItem = Control.extend("HorizontalMenuPlugin.item.control", {

			metadata: { // the megaMenuItem API
				properties: {
					name: "string", // setter and getter are created behind the scenes,
					// including data binding and type validation
					index: "string",
					level: {
						type: "number",
						defaultValue: 0
					},
					subitems: {
						type: "any[]",
						defaultValue: []
					},
					isOverflow: {
						type: "boolean",
						defaultValue: false
					},
					parentItem: "any",
					megamenu: "any",
					title: "string",
					target: "any"
				},

				events: {
					itemClicked: {}
				},

				aggregations: {
					subitems: {
						type: "HorizontalMenuPlugin.item.control",
						multiple: true,
						visibility: "public"
					}
				}

			},
			_findMenuItemBySemanticObject: function(sObject) {
				var target = this.getTarget();
				var hash = target.semanticObject + "-" + target.action;
				if (sObject === hash) {
					return this;
				}
				var items = this.getAggregation("subitems");
				var menuItem;
				if (items && items.length) {
					$.each(items, function(i, v) {
						menuItem = v._findMenuItemBySemanticObject(sObject);
						if (menuItem) {
							return false;
						}
					});
				}
				return menuItem;

			},
			addSubItems: function(subItems) {
				this.setSubitems(subItems);
				var items = this.getSubitems();
				var level = this.getLevel();
				var oControl = this;
				$.each(items, function(i, v) {
					var menuItem = new HorizontalMenuPlugin.item.control({
						title: v.title,
						index: i,
						target: v.target,
						level: level + 1,
						parentItem: oControl,
						megamenu: oControl.getMegamenu(),
						itemClicked: function(evt) {
							if (evt.oSource === menuItem) {
								oControl.getMegamenu()._navigate(v.target);
								//	target: v.target,
								//	menuItem: evt.oSource

								evt.bCancelBubble = true;
								evt.bPreventDefault = true;
								return false;
							}

						}
					});
					menuItem.addSubItems(items[i].entities);
					oControl.addAggregation("subitems", menuItem, true);
				});

			},

			onAfterRendering: function() {

				var self = this;
				this.$().blur(function(evt) {
					if (!evt.relatedTarget) {
						self.closeAll();
					} else if ($(evt.relatedTarget).closest(".menuItem.open").length === 0) {
						$(this).removeClass("open");
					}
					delete self._target;

				});
			},

			renderer: function(oRm, oControl) { // the part creating the HTML

				oRm.addClass("sapMFocusable");
				oRm.addClass("menuItem");
				if (oControl.getLevel() === 0) {
					oRm.addClass("sapThemeBarText");

				} else {
					oRm.addClass("sapThemeLightText");
					oRm.addClass("sapMListBGSolid");
					oRm.addClass("sapMLIBHoverable");
					oRm.addClass("sapMLIB");

				}
				oRm.addClass("sapMLIBFocusable");
				var subItemsAggregation = oControl.getAggregation("subitems");
				if (subItemsAggregation && subItemsAggregation.length > 0) {

					oRm.addClass("parentMenu");
				}
				var i = oControl.getIndex();
				var isOverflow = oControl.getIsOverflow();
				var style = "";
				if (isOverflow) {
					oRm.addStyle("visibility", "hidden");
				}

				oRm.write("<li  tabindex='" + (i + 1) + "'");
				oRm.writeControlData(oControl);
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.write("><a>" + oControl.getTitle() + "</a>");

				if (subItemsAggregation) {
					oControl._drawSubItems(oRm, subItemsAggregation, oControl);
				}
				oRm.write("</li>");

			},
			_drawSubItems: function(oRm, subItemsAggregation) {
				oRm.write("<div class=\"sapUiMnu\">");
				oRm.write("<ul tabindex='-1' class='sapMLIBHoverable subMenu'>");
				for (var i = 0; i < subItemsAggregation.length; i++) {
					oRm.renderControl(subItemsAggregation[i]);
				}
				oRm.write("</ul>");
				oRm.write("</div>");
			}

		});
		EnabledPropagator.call(megaMenuItem.prototype);
		megaMenuItem.prototype.onkeydown = function(oEvent) {

			if (oEvent.which === jQuery.sap.KeyCodes.SPACE || oEvent.which === jQuery.sap.KeyCodes.ENTER) {

				this._target = oEvent.target;
			}
		};

		/**
		 * Handle the key up event for SPACE and ENTER.
		 *
		 * @param {jQuery.Event} oEvent - the keyboard event.
		 * @private
		 */
		megaMenuItem.prototype.onkeyup = function(oEvent) {

			// if keydown isn't caught by button, ignore the keyup.
			if (!this._target) {
				return;
			}

			this._target = null;

			if (oEvent.which === jQuery.sap.KeyCodes.SPACE || oEvent.which === jQuery.sap.KeyCodes.ENTER) {
				// mark the event for components that needs to know if the event was handled by the megaMenuItem
				this.fireItemClicked({
					menuItem: this,
					target: this.getTarget()
				});

			}

			oEvent.stopPropagation();
			return false;
		};

		megaMenuItem.prototype.ontouchstart = function(oEvent) {

			// change the source only when the first finger is on the control, the
			// following fingers doesn't affect
			if (oEvent.targetTouches.length === 1) {
				// set target which started the event
				this._target = oEvent.target;
			}
		};
		megaMenuItem.prototype.onmouseout = function(oEvent) {
			if ($(oEvent.relatedTarget).closest(".menuItem.open").length === 0) {
				this.closeAll();
			} else {
				var $outItem = $(oEvent.currentTarget);
				this.closeAllSiblings($outItem);

				oEvent.stopPropagation();
				return false;

			}
		};
		megaMenuItem.prototype.onmouseover = function(oEvent) {
			var $overMenuItem = $(oEvent.currentTarget);

			if (this.getSubitems().length > 0 && !$overMenuItem.hasClass("open")) {
				this.openSubMenu($overMenuItem);
				this.closeAllSiblings($overMenuItem);

				oEvent.stopPropagation();
				return false;
			}

		};

		megaMenuItem.prototype.openSubMenu = function($menuItem) {
			$menuItem.addClass("open");
			if (this.getLevel() === 1) {
				var menuItemAverageWidth = $menuItem.width();
				var numChildOfSubMenus = $menuItem.find(".sapUiMnu").length;
				var totalWidth = menuItemAverageWidth * numChildOfSubMenus;
				var subMenu = $menuItem.find(">.sapUiMnu:first");
				$menuItem.removeClass("rightMenu");
				if (subMenu && (subMenu.offset().left + totalWidth) > $(window).width() && (subMenu.offset().left - totalWidth) > 0) {
					$menuItem.addClass("rightMenu");
				}
			}

		};
		megaMenuItem.prototype.closeAllSiblings = function($menuItem) {

			var $siblings = $menuItem.siblings(".menuItem.open");
			$siblings.removeClass("open");
			$siblings.find(".menuItem.open").removeClass("open");
		};

		megaMenuItem.prototype.closeAll = function() {
			var $openMenuItem = this.getMegamenu().$().find(".menuItem.open");
			$openMenuItem.removeClass("open");
			$openMenuItem.blur();

		};

		megaMenuItem.prototype.hideIfOverFlow = function(containerWidth) {
			var $item = this.$();
			var width = $item.outerWidth(true);
			var offset = $item.position();
			if (offset.left + width > containerWidth) {
				this.setIsOverflow(true);
			} else {
				this.setIsOverflow(false);
			}
		};
		megaMenuItem.prototype.ontap = function(oEvent) {

			// if target is empty set target (specially for selenium test)
			if (!this._target) {
				this._target = oEvent.target;
			}

			// check if target which started the event is the same
			if ((!!this._target) && (this._target === oEvent.target)) {
				var $tapMenuItem = $(oEvent.currentTarget);

				// note: on mobile, the press event should be fired after the focus is on the megaMenuItem
				if (oEvent.originalEvent && oEvent.originalEvent.type === "touchend") {

					//first tap on touch device
					this.focus();
					if (this.getSubitems().length > 0 && !$tapMenuItem.hasClass("open")) {
						this.closeAllSiblings($tapMenuItem);
						oEvent.stopPropagation();
						return false;
					}

				}

				this.closeAll();

				this.fireItemClicked({
					menuItem: this,
					target: this.getTarget()
				});
			}

			// reset target which started the event
			delete this._target;

			oEvent.stopPropagation();
			return false;

		};
	});