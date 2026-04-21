sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageStripUtilities'
], function(Controller, JSONModel, MessageStripUtilities) {
	"use strict";

	return Controller.extend("sap.m.sample.MessageStripWithEnableFormattedText.controller.MessageStripWithEnableFormattedText", {
		onInit: function () {
			this.getView().setModel(new JSONModel({
				"default": "Default <em>(Information)</em> with default icon and <strong>close button</strong>:",
				"error": '<strong>Error</strong> with link to ' +
				'<a target="_blank" href="http://www.sap.com">SAP Homepage</a> <em>(For more info)</em>',
				"warning": "<strong>Warning</strong> with default icon and close button:",
				"success": "<strong>Success</strong> with default icon and close button:",
				"inlineIconsUnicode": "System status: <span class='sapMMsgStripInlineIcon'>&#xe1b4;</span> critical error detected <span class='sapMMsgStripInlineIcon'>&#xe049;</span> in module <span class='sapMMsgStripInlineIcon'>&#xe126;</span> configuration.",
				"inlineIconsHelper": "<strong>Deployment successful!</strong> " + MessageStripUtilities.getInlineIcon("sap-icon://message-success") +
					" All services " + MessageStripUtilities.getInlineIcon("sap-icon://sys-enter-2") +
					" are running. <em>Check status</em> " + MessageStripUtilities.getInlineIcon("sap-icon://stethoscope")
			}));
		}
	});

});