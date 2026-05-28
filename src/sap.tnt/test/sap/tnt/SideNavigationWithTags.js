sap.ui.define([
  "sap/tnt/SideNavigation",
  "sap/tnt/NavigationList",
  "sap/tnt/NavigationListItem",
  "sap/m/ObjectStatus",
  "sap/tnt/NavigationListGroup",
  "sap/m/Button",
  "sap/m/ToggleButton",
  "sap/ui/Device",
  "sap/ui/thirdparty/jquery"
], function(
  SideNavigation,
  NavigationList,
  NavigationListItem,
  ObjectStatus,
  NavigationListGroup,
  Button,
  ToggleButton,
  Device,
  jQuery
) {
  "use strict";
  // Note: the HTML page 'SideNavigationWithTags.html' loads this module via data-sap-ui-on-init

  var sideNavigationWithTags = new SideNavigation("sideNavWithTags", {
	  expanded: true,
	  item: new NavigationList({
		  items: [
			  new NavigationListItem({
				  text: 'Overview',
				  icon: 'sap-icon://home',
				  tag: new ObjectStatus({
					  text: "Beta",
					  state: "Indication15",
					  inverted: true
				  })
			  }),
			  new NavigationListItem({
				  text: 'Favorites',
				  icon: 'sap-icon://unfavorite',
				  expanded: true,
				  selectable: false,
				  tag: new ObjectStatus({
					  text: "Beta",
					  state: "Indication15",
					  inverted: true
				  }),
				  items: [
					  new NavigationListItem({
						  text: 'My Accounts',
						  tag: new ObjectStatus({
							  text: "Active",
							  state: "Indication18",
							  inverted: true
						  })
					  }),
					  new NavigationListItem({
						  text: 'My Orders',
						  tag: new ObjectStatus({
							  text: "Pending",
							  state: "Indication17",
							  inverted: true
						  })
					  })
				  ]
			  }),
			  new NavigationListGroup({
				  text: 'Product Group',
				  expanded: true,
				  items: [
					  new NavigationListItem({
						  text: 'Products',
						  icon: 'sap-icon://product',
						  tag: new ObjectStatus({
							  text: "New",
							  state: "Indication16",
							  inverted: true
						  })
					  }),
					  new NavigationListItem({
						  text: 'Inventory',
						  icon: 'sap-icon://inventory',
						  tag: new ObjectStatus({
							  text: "Updated",
							  state: "Indication19",
							  inverted: true
						  })
					  }),
					  new NavigationListItem({
						  text: 'Orders',
						  icon: 'sap-icon://sales-order'
					  })
				  ]
			  }),
			  new NavigationListItem({
				  text: 'Features',
				  icon: 'sap-icon://activity-items',
				  expanded: true,
				  tag: new ObjectStatus({
					  text: "New",
					  state: "Indication16",
					  inverted: true
				  }),
				  items: [
					  new NavigationListItem({
						  text: 'Feature A',
						  tag: new ObjectStatus({
							  text: "Beta",
							  state: "Indication15",
							  inverted: true
						  })
					  }),
					  new NavigationListItem({
						  text: 'Feature B',
						  tag: new ObjectStatus({
							  text: "Deprecated",
							  state: "Indication18",
							  inverted: true
						  })
					  }),
					  new NavigationListItem({
						  text: 'Feature C'
					  })
				  ]
			  }),
			  new NavigationListItem({
				  text: 'Documentation',
				  icon: 'sap-icon://sys-help',
				  tag: new ObjectStatus({
					  text: "Updated",
					  state: "Indication16",
					  inverted: true
				  })
			  }),
			  new NavigationListItem({
				  text: 'Settings',
				  icon: 'sap-icon://action-settings'
			  }),
			  new NavigationListItem({
				  text: 'Single Item',
				  icon: 'sap-icon://hint',
				  tag: new ObjectStatus({
					  text: "Info",
					  state: "Indication15",
					  inverted: true
				  })
			  }),
			  new NavigationListItem({
				  text: 'Analytics',
				  icon: 'sap-icon://bar-chart',
				  tag: new ObjectStatus({
					  text: "Nightly",
					  state: "Indication17",
					  inverted: true
				  })
			  }),
			  new NavigationListItem({
				  text: 'Preview',
				  icon: 'sap-icon://show',
				  tag: new ObjectStatus({
					  text: "Experimental",
					  state: "Indication19",
					  inverted: true
				  })
			  }),
			  new NavigationListItem({
				  text: 'Reports',
				  icon: 'sap-icon://document',
				  tag: new ObjectStatus({
					  text: "Updated",
					  state: "Indication20",
					  inverted: true
				  })
			  }),
			  new NavigationListItem({
				  text: 'Administration',
				  icon: 'sap-icon://settings',
				  tag: new ObjectStatus({
					  text: "Long tag Long tag",
					  state: "Indication17",
					  inverted: true
				  })
			  })
		  ]
	  }),
	  fixedItem: new NavigationList({
		  items: [
			  new NavigationListItem({
				  text: 'Support',
				  icon: 'sap-icon://phone',
				  tag: new ObjectStatus({
					  text: "24/7",
					  state: "Indication16",
					  inverted: true
				  })
			  }),
			  new NavigationListItem({
				  text: 'Logout',
				  icon: 'sap-icon://log'
			  })
		  ]
	  })
  }).placeAt("sideNav-content");

  new Button({
	  text: 'Toggle Expand/Collapse',
	  press: function () {
		  sideNavigationWithTags.setExpanded(!sideNavigationWithTags.getExpanded());
	  }
  }).placeAt('header-1');

  new ToggleButton({
	  text: "Compact Mode",
	  pressed: !Device.system.phone && jQuery("html").hasClass("sapUiSizeCompact"),
	  press: function () {
		  jQuery("body").toggleClass("sapUiSizeCompact", this.getPressed());
		  jQuery("body").toggleClass("sapUiSizeCozy", !this.getPressed());
	  }
  }).placeAt('header-1');
});