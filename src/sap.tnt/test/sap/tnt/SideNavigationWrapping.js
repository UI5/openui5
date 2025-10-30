sap.ui.define([
	"sap/m/library",
	"sap/m/Button",
	"sap/tnt/NavigationList",
	"sap/tnt/NavigationListItem",
	"sap/tnt/NavigationListGroup",
	"sap/ui/model/json/JSONModel",
	"sap/m/NavContainer",
	"sap/m/ScrollContainer",
	"sap/m/Text",
	"sap/m/Dialog",
	"sap/tnt/ToolHeader",
	"sap/tnt/ToolPage",
	"sap/tnt/SideNavigation",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/OverflowToolbarButton",
	"sap/m/ToolbarSpacer",
	"sap/ui/Device",
	"sap/m/SearchField",
	"sap/m/Image",
	"sap/m/Title",
	"sap/m/ToolbarSeparator"

],
function (
	mLibrary,
	Button,
	NavigationList,
	NavigationListItem,
	NavigationListGroup,
	JSONModel,
	NavContainer,
	ScrollContainer,
	Text,
	Dialog,
	ToolHeader,
	ToolPage,
	SideNavigation,
	OverflowToolbarLayoutData,
	OverflowToolbarButton,
	ToolbarSpacer,
	Device,
	SearchField,
	Image,
	Title,
	ToolbarSeparator
) {
	"use strict";

	//shortcuts
	const ButtonType = mLibrary.ButtonType;
	const OverflowToolbarPriority = mLibrary.OverflowToolbarPriority;

	const model = new JSONModel();
	const data = {
		navigation: [{
			title: 'Home',
			icon: 'sap-icon://home',
			key: 'home',
			href: '#/home'
		}, {
			title: 'Resource Planning and Business Management Solutions',
			icon: 'sap-icon://business-one',
			key: 'enterpriseManagement',
			href: '#/enterpriseManagement'
		}],
		businessOperations: [{
			title: 'Favorites and Most Frequently Used Items',
			icon: 'sap-icon://unfavorite',
			expanded: true,
			selectable: false,
			items: [{
				title: 'My Personal Accounts and Account Management',
				key: 'myAccounts',
				href: '#/myAccounts'
			}, {
				title: 'My Order History and Current Order Status',
				key: 'myOrders',
				href: '#/myOrders'
			}]
		}, {
			title: 'Customer Relationship Management and Customer Data',
			icon: 'sap-icon://account',
			expanded: true,
			selectable: false,
			key: 'CustomerManagement',
			href: '#CustomerManagement',
			items: [{
				title: 'Contact Information and Communication History',
				key: 'contacts',
				href: '#/contacts'
			}, {
				title: 'Company Profiles and Business Information',
				key: 'companies',
				href: '#/companies'
			}, {
				title: 'Business Partners and Strategic Relationships',
				key: 'partners',
				href: '#/partners'
			}]
		}, {
			title: 'SAP Best Practices and Implementation Guidelines',
			icon: 'sap-icon://learning-assistant',
			key: 'sapBestPractices',
			href: 'https://sap.com',
			target: '_blank',
			selectable: false
		}, {
			title: 'Sales Management and Revenue Operations',
			icon: 'sap-icon://crm-sales',
			expanded: true,
			selectable: false,
			key: 'Sales',
			href: '#/Sales',
			items: [{
				title: 'Lead Generation and Qualification Process',
				key: 'leads',
				href: '#/leads'
			}, {
				title: 'Sales Opportunities and Pipeline Management',
				key: 'opportunities',
				href: '#/opportunities'
			}, {
				title: 'Price Quotes and Proposal Management',
				key: 'quotes',
				href: '#/quotes'
			}, {
				title: 'Order Processing and Fulfillment Tracking',
				key: 'orders',
				href: '#/orders'
			}, {
				title: 'Invoice Generation and Payment Processing',
				key: 'invoices',
				href: '#/invoices'
			}]
		}, {
			title: 'Product Management and Catalog Administration',
			icon: 'sap-icon://customer-view',
			expanded: true,
			key: 'products',
			href: '#/products',
			items: [{
				title: 'Complete Product Catalog and Item Database',
				key: 'productCatalog',
				href: '#/productCatalog'
			}, {
				title: 'Pricing Strategy and Cost Management',
				key: 'pricing',
				href: '#/pricing'
			}, {
				title: 'Inventory Management and Stock Control Systems',
				key: 'inventoryManagement',
				href: '#/inventoryManagement'
			}]
		}, {
			title: 'Marketing Campaigns and Brand Management',
			icon: 'sap-icon://customer-view',
			expanded: true,
			selectable: false,
			key: 'marketing',
			href: '#/marketing',
			items: [{
				title: 'Marketing Campaigns and Promotional Activities',
				key: 'campaigns',
				href: '#/campaigns'
			}, {
				title: 'E-mail Marketing and Communication Strategies',
				key: 'emailMarketing',
				href: '#/emailMarketing'
			}, {
				title: 'Marketing Automation and Workflow Management',
				key: 'marketingAutomation',
				href: '#/marketingAutomation'
			}]
		}, {
			title: 'Financial Management and Accounting Operations',
			icon: 'sap-icon://money-bills',
			expanded: true,
			selectable: false,
			items: [{
				title: 'Accounts Receivable and Customer Payment Tracking',
				key: 'accountsReceivable',
				href: '#/accountsReceivable'
			}, {
				title: 'Accounts Payable and Vendor Payment Management',
				key: 'accountsPayable',
				href: '#/accountsPayable'
			}, {
				title: 'Budget Planning and Financial Forecasting',
				key: 'budgetPlanning',
				href: '#/budgetPlanning'
			}, {
				title: 'Tax Management and Compliance Reporting',
				key: 'taxManagement',
				href: '#/taxManagement'
			}]
		}, {
			title: 'Year-End Financial Reports and Business Analytics',
			icon: 'sap-icon://manager-insight',
			expanded: true,
			key: 'reports',
			href: '#/reports',
			items: [{
				title: 'Comprehensive Sales Reports and Performance Metrics',
				key: 'salesReports',
				href: '#/salesReports'
			}, {
				title: 'Customer Analysis Reports and Behavioral Insights',
				key: 'customerReports',
				href: '#/customerReports'
			}]
		}],
		systemAdministration: [{
			title: 'Business Analytics and Data Visualization Tools',
			icon: 'sap-icon://bar-chart',
			key: 'analytics',
			href: '#/analytics'
		}, {
			title: 'SAP Community Portal and Knowledge Sharing',
			icon: 'sap-icon://discussion-2',
			key: 'sapCommunity',
			href: 'https://sap.com',
			target: '_blank',
			selectable: false
		}, {
			title: 'System Administration and Configuration Management',
			icon: 'sap-icon://settings',
			expanded: false,
			selectable: false,
			items: [{
				title: 'User Management and Access Control Administration',
				key: 'userManagement',
				href: '#/userManagement'
			}, {
				title: 'System Configuration and Environment Settings',
				key: 'systemConfig',
				href: '#/systemConfig'
			}, {
				title: 'Audit Log and Security Monitoring Dashboard',
				key: 'auditLog',
				href: '#/auditLog'
			}]
		}, {
			title: 'Service Management and Customer Support Operations',
			icon: 'sap-icon://customer-and-supplier',
			expanded: false,
			selectable: false,
			items: [{
				title: 'Service Tickets and Customer Issue Resolution',
				key: 'serviceTickets',
				href: '#/serviceTickets'
			}, {
				title: 'Knowledge Base and Documentation Repository',
				key: 'knowledgeBase',
				href: '#/knowledgeBase'
			}, {
				title: 'Service Contracts and Agreement Management',
				key: 'serviceContracts',
				href: '#/serviceContracts'
			}]
		}, {
			title: 'System Notifications and Alert Management',
			icon: 'sap-icon://message-information',
			key: 'notifications',
			href: '#/notifications'
		}, {
			title: 'SAP Training Portal and Learning Management System',
			icon: 'sap-icon://course-book',
			key: 'sapTraining',
			href: 'https://sap.com',
			target: '_blank',
			selectable: false
		}, {
			title: 'Integration Hub and Enterprise Connectivity Platform',
			icon: 'sap-icon://connected',
			expanded: false,
			key: 'integrationHub',
			href: '#/integrationHub',
			items: [{
				title: 'API Management and Service Integration Platform',
				key: 'apiManagement',
				href: '#/apiManagement'
			}, {
				title: 'Data Synchronization and Real-time Integration',
				key: 'dataSync',
				href: '#/dataSync'
			}]
		}],
		fixedNavigation: [{
			title: 'Quick Create New Items and Records',
			icon: 'sap-icon://add',
			ariaHasPopup: "Dialog",
			design: "Action",
			selectable: false,
			key: 'quickCreate'
		}, {
			title: 'Product Settings and Configuration Options',
			icon: 'sap-icon://settings',
			key: 'productSettings',
			href: '#/productSettings'
		}, {
			title: 'SAP Support Portal and Technical Assistance',
			icon: 'sap-icon://sys-help',
			key: 'sapSupport',
			href: 'https://sap.com',
			target: '_blank',
			selectable: false
		}]
	};

	const oQuickCreateDialog = new Dialog({
		title: "Create Item",
		type: "Message",
		content: [
			new Text({ text: "Create New Navigation List Item." })
		],
		beginButton: new Button({
			type: ButtonType.Emphasized,
			text: "Create",
			press: function () {
				oQuickCreateDialog.close();
			}
		}),
		endButton: new Button({
			text: "Cancel",
			press: function () {
				oQuickCreateDialog.close();
			}
		})
	});

	function onFixedItemPress(event) {
		const item = event.getParameter("item");
		if (item && item.getKey && item.getKey() === "quickCreate") {
			oQuickCreateDialog.open();
		}
	}

	model.setData(data);

	const sideNavigation = new SideNavigation("SNav", {
		itemSelect: function (event) {
			navContainer.to(event.getParameter('item').getKey());
		},
		item: new NavigationList("NList", {
			items: [
				new NavigationListItem({
					text: '{/navigation/0/title}',
					icon: '{/navigation/0/icon}',
					key: '{/navigation/0/key}',
					href: '{/navigation/0/href}'
				}),
				new NavigationListItem({
					text: '{/navigation/1/title}',
					icon: '{/navigation/1/icon}',
					key: '{/navigation/1/key}',
					href: '{/navigation/1/href}'
				}),
				new NavigationListGroup({
					text: "Business Operations",
					expanded: true,
					items: {
						template: new NavigationListItem({
							text: '{title}',
							icon: '{icon}',
							enabled: '{enabled}',
							expanded: '{expanded}',
							hasExpander: '{hasExpander}',
							selectable: '{selectable}',
							key: '{key}',
							href: '{href}',
							target: '{target}',
							items: {
								template: new NavigationListItem({
									selectable: '{selectable}',
									text: '{title}',
									key: '{key}',
									href: '{href}',
									enabled: '{enabled}',
									target: '{target}'
								}),
								path: 'items',
								templateShareable: true
							}
						}),
						path: '/businessOperations'
					}
				}),
				new NavigationListGroup({
					text: "System & Administration Management",
					expanded: true,
					items: {
						template: new NavigationListItem({
							text: '{title}',
							icon: '{icon}',
							enabled: '{enabled}',
							expanded: '{expanded}',
							hasExpander: '{hasExpander}',
							selectable: '{selectable}',
							key: '{key}',
							href: '{href}',
							target: '{target}',
							items: {
								template: new NavigationListItem({
									selectable: '{selectable}',
									text: '{title}',
									key: '{key}',
									href: '{href}',
									enabled: '{enabled}',
									target: '{target}'
								}),
								path: 'items',
								templateShareable: true
							}
						}),
						path: '/systemAdministration'
					}
				})
			]
		}),
		fixedItem: new NavigationList({
			items: {
				template: new NavigationListItem({
					text: '{title}',
					selectable: '{selectable}',
					icon: '{icon}',
					key: '{key}',
					href: '{href}',
					target: '{target}',
					ariaHasPopup: '{ariaHasPopup}',
					design: '{design}',
					press: onFixedItemPress
				}),
				path: '/fixedNavigation'
			}
		})
	}).setModel(model);

	const navContainer = new NavContainer({
		pages: [new ScrollContainer({
				id: 'home',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content of "Home" item'
					})
				]
			}),
			new ScrollContainer({
				id: 'enterpriseManagement',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content of "Enterprise Resource Planning and Comprehensive Business Management Solutions with Advanced Analytics and Reporting Capabilities" item'
					})
				]
			}),
			new ScrollContainer({
				id: 'myAccounts',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "My Accounts"'
					})
				]
			}),
			new ScrollContainer({
				id: 'myOrders',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "My Orders"'
					})
				]
			}),
			new ScrollContainer({
				id: 'contacts',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Contacts"'
					})
				]
			}),
			new ScrollContainer({
				id: 'companies',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Companies"'
					})
				]
			}),
			new ScrollContainer({
				id: 'partners',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Partners"'
					})
				]
			}),
			new ScrollContainer({
				id: 'leads',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Leads"'
					})
				]
			}),
			new ScrollContainer({
				id: 'opportunities',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Opportunities"'
					})
				]
			}),
			new ScrollContainer({
				id: 'quotes',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Quotes"'
					})
				]
			}),
			new ScrollContainer({
				id: 'orders',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Orders"'
					})
				]
			}),
			new ScrollContainer({
				id: 'invoices',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Invoices"'
					})
				]
			}),
			new ScrollContainer({
				id: 'products',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Products"'
					})
				]
			}),
			new ScrollContainer({
				id: 'productCatalog',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Product Catalog"'
					})
				]
			}),
			new ScrollContainer({
				id: 'pricing',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Pricing"'
					})
				]
			}),
			new ScrollContainer({
				id: 'inventoryManagement',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Inventory Management"'
					})
				]
			}),
			new ScrollContainer({
				id: 'campaigns',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Campaigns"'
					})
				]
			}),
			new ScrollContainer({
				id: 'emailMarketing',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "E-mail Marketing"'
					})
				]
			}),
			new ScrollContainer({
				id: 'marketingAutomation',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Marketing Automation"'
					})
				]
			}),
			new ScrollContainer({
				id: 'reports',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Reports"'
					})
				]
			}),
			new ScrollContainer({
				id: 'salesReports',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Sales Reports"'
					})
				]
			}),
			new ScrollContainer({
				id: 'customerReports',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Customer Reports"'
					})
				]
			}),
			new ScrollContainer({
				id: 'productSettings',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Product Settings"'
					})
				]
			}),
			new ScrollContainer({
				id: 'analytics',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Analytics"'
					})
				]
			}),
			new ScrollContainer({
				id: 'userManagement',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "User Management"'
					})
				]
			}),
			new ScrollContainer({
				id: 'systemConfig',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "System Configuration"'
					})
				]
			}),
			new ScrollContainer({
				id: 'auditLog',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Audit Log"'
					})
				]
			}),
			new ScrollContainer({
				id: 'serviceTickets',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Service Tickets"'
					})
				]
			}),
			new ScrollContainer({
				id: 'knowledgeBase',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Knowledge Base"'
					})
				]
			}),
			new ScrollContainer({
				id: 'serviceContracts',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Service Contracts"'
					})
				]
			}),
			new ScrollContainer({
				id: 'accountsReceivable',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Accounts Receivable"'
					})
				]
			}),
			new ScrollContainer({
				id: 'accountsPayable',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Accounts Payable"'
					})
				]
			}),
			new ScrollContainer({
				id: 'budgetPlanning',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Budget Planning"'
					})
				]
			}),
			new ScrollContainer({
				id: 'taxManagement',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Tax Management"'
					})
				]
			}),
			new ScrollContainer({
				id: 'notifications',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Notifications"'
					})
				]
			}),
			new ScrollContainer({
				id: 'apiManagement',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "API Management"'
					})
				]
			}),
			new ScrollContainer({
				id: 'dataSync',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Data Sync"'
					})
				]
			}),
			new ScrollContainer({
				id: 'integrationHub',
				vertical: true,
				height: "100%",
				horizontal: false,
				content: [
					new Text({
						text: 'Content corresponding to "Integration Hub"'
					})
				]
			})
		]
	});

	const toolHeader = new ToolHeader('tHeader', {
		content: [
			new Button('menuToggleButton', {
				icon: 'sap-icon://menu2',
				tooltip: 'Menu',
				type: ButtonType.Transparent,
				press: function () {
					const sideExpanded = toolPage.getSideExpanded();

					if (sideExpanded) {
						this.setTooltip('Large Size Navigation');
					} else {
						this.setTooltip('Small Size Navigation');
					}

					toolPage.setSideExpanded(!sideExpanded);
				},
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				})
			}),
			new Image({
				src: "./images/SAP_Logo.png",
				tooltip: "SAP logo",
				press: function () {},
				decorative: false,
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				})
			}),
			new Title({
				id: "productName",
				text: "Product name",
				wrapping: false
			}),
			new Text({
				id: "secondTitle",
				text: "Second title",
				wrapping: false
			}),
			new ToolbarSpacer(),
			new SearchField({
				id: "searchField",
				width: "16rem",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low,
					group: 1
				})
			}),
			new ToolbarSpacer({
				id: "spacer",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low,
					group: 1
				})
			}),
			new Button({
				id: "searchButton",
				tooltip: "Search",
				type: ButtonType.Transparent,
				icon: "sap-icon://search",
				visible: false
			}),
			new ToolbarSeparator({
				layoutData: new OverflowToolbarLayoutData({
					group: 2
				})
			}),
			new OverflowToolbarButton({
				text: "Settings",
				type: ButtonType.Transparent,
				icon: "sap-icon://action-settings"
			}),
			new Button({
				tooltip: "Notifications",
				type: ButtonType.Transparent,
				icon: "sap-icon://bell",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				})
			})
		]
	});

	if (Device.media.getCurrentRange('StdExt').name === 'Phone' ||
		Device.media.getCurrentRange('StdExt').name === 'Tablet') {
		toolHeader.getAggregation('content')[0].setTooltip('Large Size Navigation');
	}

	const toolPage = new ToolPage({
		header: toolHeader,
		sideContent: sideNavigation,
		mainContents: [navContainer]
	}).placeAt('body');

});
