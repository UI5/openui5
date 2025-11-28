sap.ui.define([
  "sap/ui/test/utils/nextUIUpdate",
  "sap/m/App",
  "sap/m/BusyDialog",
  "sap/ui/model/json/JSONModel",
  "sap/m/Page",
  "sap/m/Button",
  "jquery.sap.script",
  "sap/ui/core/HTML"
], function(nextUIUpdate, App, BusyDialog, JSONModel, Page, Button, jQuery, HTML) {
  "use strict";
  // Note: the HTML page 'BusyDialog.html' loads this module via data-sap-ui-on-init

  var app = new App('myApp', {initialPage: 'initialPage'});
  var _buttonWidth = '300px';

  var defaultLightBusyDialog = new BusyDialog('defaultLightBusyDialog', {
	  close: function (oEvent) {
		  alert('cancelPressed: ' + oEvent.getParameter('cancelPressed'));
	  }
  });

  var standartBusyDialog = new BusyDialog('standaratBusyDialog', {
	  title: 'Dummy preloader',
	  text: '... this is just a demo, we are not waiting for anything.',
	  showCancelButton: true,
	  close: function (oEvent) {
		  alert('cancelPressed: ' + oEvent.getParameter('cancelPressed'));
	  }
  });

  var customCancelButtonTextBusyDialog = new BusyDialog('customCancelButtonTextBusyDialog', {
	  tooltip: 'BusyDialog example with custom "cancel button text, custom icon and tooltip.',
	  cancelButtonText: 'Custom Close Text',
	  customIcon: 'images/synchronise_48.png',
	  customIconRotationSpeed: 5000
  });

  var standartNoHeaderBusyDialog = new BusyDialog('standartNoHeaderBusyDialog', {
	  text: 'Sending data...',
	  showCancelButton: true
  });

  var standartNoHeaderAndFooterBusyDialog = new BusyDialog('standartNoHeaderAndFooterBusyDialog', {
	  text: 'Loading data...'
  });

  // Binding example =========================================================================================
  var data = {
	  text: 'Initial text',
	  title: 'Initial title'
  };

  var model = new JSONModel();
  model.setData(data);

  var bindingBusyDialog = new BusyDialog('bindingBusyDialog', {
	  text: '{/text}',
	  title: '{/title}'
  }).setModel(model);

  //==========================================================================================================

  var initialPage = new Page('initialPage', {
	  title: 'Busy Dialog Control',
	  content: [
		  new Button({
			  text: 'Default (light)',
			  width: _buttonWidth,
			  press: function () {
				  defaultLightBusyDialog.open();
				  jQuery.sap.delayedCall(2000, this, function () {
					  defaultLightBusyDialog.close();
				  });
			  }
		  }),
		  new Button({
			  text: 'Default (light, no autoclose)',
			  width: _buttonWidth,
			  press: function () {
				  defaultLightBusyDialog.open();
			  }
		  }),
		  new Button({
			  text: 'Standart (static)',
			  width: _buttonWidth,
			  press: function () {
				  standartBusyDialog.open();
			  }
		  }),
		  new HTML({content: "<br>"}),
		  new Button({
			  text: 'Standart (testing setters)',
			  width: _buttonWidth,
			  press: function () {
				  standartBusyDialog.open();

				  var delay = 0;
				  var step = 1000;

				  // =========================================================================================
				  // test the title
				  // =========================================================================================
				  jQuery.sap.delayedCall(delay += step, this, function () {
					  standartBusyDialog.setTitle('');
				  });

				  jQuery.sap.delayedCall(delay += step, this, function () {
					  standartBusyDialog.setTitle('Set Title');
				  });

				  // =========================================================================================
				  // test the toolbar
				  // =========================================================================================
				  jQuery.sap.delayedCall(delay += step, this, function () {
					  standartBusyDialog.setCancelButtonText('');
				  });

				  jQuery.sap.delayedCall(delay += step, this, function () {
					  standartBusyDialog.setCancelButtonText('SetCancelButtonText');
				  });

				  // =========================================================================================
				  // test the toolbar visibility
				  // =========================================================================================
				  jQuery.sap.delayedCall(delay += step, this, function () {
					  standartBusyDialog.setShowCancelButton(false);
				  });

				  jQuery.sap.delayedCall(delay += step, this, function () {
					  standartBusyDialog.setShowCancelButton(true);
				  });

				  // =========================================================================================
				  // test the text
				  // =========================================================================================

				  jQuery.sap.delayedCall(delay += step, this, function () {
					  standartBusyDialog.setText('');
				  });

				  jQuery.sap.delayedCall(delay += step, this, function () {
					  standartBusyDialog.setText('Set text');
				  });
			  }
		  }),
		  new Button({
			  text: 'Standart - no header',
			  width: _buttonWidth,
			  press: function () {
				  standartNoHeaderBusyDialog.open();
			  }
		  }),
		  new Button({
			  text: 'Standart without footer and header',
			  width: _buttonWidth,
			  press: function () {
				  standartNoHeaderAndFooterBusyDialog.open();

				  jQuery.sap.delayedCall(2000, this, function () {
					  standartNoHeaderAndFooterBusyDialog.close();
				  });
			  }
		  }),
		  new HTML({content: "<br>"}),
		  new Button({
			  text: "Binding BusyDialog",
			  width: _buttonWidth,
			  press: function () {
				  bindingBusyDialog.open();

				  setTimeout(function () {
					  model.setData({
						  title: 'Changed data',
						  text: 'Changed text'
					  });
				  }, 1000);
			  }
		  }),
		  new Button({
			  text: 'Get the Dom reference',
			  width: _buttonWidth,
			  press: function () {
				  defaultLightBusyDialog.open();
				  nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;

				  alert('oBusyDialog.$() should be 1 dom element: ' + defaultLightBusyDialog.$().length);
			  }
		  }),
		  new Button({
			  text: 'Custom Cancel Text and Icon',
			  width: _buttonWidth,
			  press: function () {
				  customCancelButtonTextBusyDialog.open();
			  }
		  })
	  ]
  });

  var busyDialogInstantOpen = new BusyDialog({
	  text: "new sap.m.BusyDialog().open() should work. This will self close after: 3.5sec.",
	  title: 'busyDialogInstantOpen'
  }).open();

  jQuery.sap.delayedCall(3500, this, function () {
	  busyDialogInstantOpen.close();
  });

  app.addPage(initialPage).placeAt('content');
});