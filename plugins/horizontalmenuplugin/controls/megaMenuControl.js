/**
 * Created by i048697 on 1/4/16.
 */

sap.ui.core.Control.extend("HorizontalMenuPlugin.control", { // call the new Control type "my.Hello"
	// and let it inherit from sap.ui.core.Control
	metadata: { // the Control API
		properties: {
			name: "string", // setter and getter are created behind the scenes,
			displayMenuLevel: {
				type: "boolean",
				defaultValue: true
			},
			items: {
				type: "any[]",
				defaultValue: []
			},
			overFlowItems: {
				type: "any[]",
				defaultValue: []
			},
			overFlowStartIndex: {
				type: "number",
				defaultValue: -1
			}

		},
		aggregations: {

			overflowItem: {
				type: "HorizontalMenuPlugin.item.control",
				multiple: false,
				visibility: "public"
			},
			items: {
				type: "HorizontalMenuPlugin.item.control",
				multiple: true,
				visibility: "public"
			}
		}
	},

	setPages: function(pages, currentTarget) {
		this.setItems(pages);
		var oControl = this;
		if (this.getDisplayMenuLevel()) {
			var items = this.getItems();

			$.each(items, function(index) {

				var menuItem = new HorizontalMenuPlugin.item.control({
					title: this.title,
					index: index,
					megamenu: oControl,
					parentItem: null,
					target: this.target,
					itemClicked: oControl._onMenuItemClicked
				});
				oControl.addAggregation("items", menuItem, true);
				if (this.target.semanticObject === currentTarget.semanticObject && this.target.action === currentTarget.action) {
					menuItem.fireItemClicked({
						target: this.target,
						menuItem: menuItem
					});

				}
				menuItem.addSubItems(this.entities);

			});

		}

	},

	_onMenuItemClicked: function(evt) {
		var mParameters = evt.mParameters;
		var oControl = this.getMegamenu();
		oControl._navigate(mParameters.target);
		evt.bCancelBubble = true;
		evt.bPreventDefault = true;
		return false;
	},

	_findItemBySemanticObject: function(sObject, items, stack) {
		var _items = items || this.getItems();
		var arr = stack || [];
		var oControl = this;
		var item, foundItem;
		if (_items && _items.length) {
			$.each(_items, function(i, v) {
				item = v;
				var target = item.target;
				var hash = target.semanticObject + "-" + target.action;
				if (sObject === hash) {
					foundItem = this;
					arr.push(item);
					return false;
				}
				if (v.entities) {
					var obj = oControl._findItemBySemanticObject(sObject, v.entities, arr);
					if (obj.foundItem) {
						arr.push(item);
						foundItem = item;
						return false;
					}
				}

			});
		}
		return {
			foundItem: foundItem,
			stack: arr
		};

	},
	_findMenuItemBySemanticObject: function(sObject) {
		var items = this.getAggregation("items");
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
	_navigate: function(target) {
		var crossApplicationNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
		crossApplicationNavigator.toExternal({
			target: target
		});
	},
	renderer: {
		render: function(oRm, oControl) {
			if (oControl.getDisplayMenuLevel()) {
				oRm.addClass("sapThemeBarBG");
				oRm.addClass("megaMenu");
				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.write(">");
				oRm.write("<ul tabindex='-1'");
				oRm.writeClasses();
				oRm.write(">");
				var topLevelItems = oControl.getAggregation("items");
				var overflowStartIndex = oControl.getOverFlowStartIndex();
				var overFlowItem = oControl.getAggregation("overflowItem");
				for (var i = 0; i < topLevelItems.length; i++) {
					oRm.renderControl(topLevelItems[i]);

					if (i == (overflowStartIndex - 1)) {

						oRm.renderControl(overFlowItem);
					}

				}

			}

			oRm.write("</ul>");
			oRm.write("</div>");

		}
	},
	hideOverflow: function(containerWidth) {
		var items = this.getAggregation("items");
		var itemsData = this.getItems();
		var entities = [];

		var i;
		var len = items.length;
		this.removeAggregation("overflowItem");
		var startOverFlowIndex = -1;
		for (i = 0; i < len; i++) {
			items[i].hideIfOverFlow(containerWidth);
			if (items[i].getIsOverflow() && startOverFlowIndex === -1) {
				if (i - 1 >= 1) {
					items[i - 1].setIsOverflow(true);
					startOverFlowIndex = i - 1;

				} else {
					startOverFlowIndex = i;
				}
			}

		}

		this.setAggregation("overflowItem", new HorizontalMenuPlugin.item.control({
			title: "More",
			megamenu: this
		}));
		if (startOverFlowIndex !== -1) {
			for (i = startOverFlowIndex; i < itemsData.length; i++) {
				entities.push(itemsData[i]);
			}
			if (entities.length > 0) {
				var overFlowItem = this.getAggregation("overflowItem");

				overFlowItem.removeAllAggregation("subitems");
				overFlowItem.addSubItems(entities);
			}

		}
		this.setOverFlowStartIndex(startOverFlowIndex);

	}

});