/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.FileUploader.
sap.ui.define([
	"sap/ui/core/Control",
	"./library",
	"sap/m/library",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/Element",
	"sap/ui/core/LabelEnablement",
	"sap/ui/core/InvisibleText",
	"sap/m/delegate/ValueStateMessage",
	"sap/m/Button",
	"sap/m/Tokenizer",
	"sap/m/Token",
	"sap/ui/core/Icon",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/StaticArea",
	"sap/ui/Device",
	"./FileUploaderRenderer",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/base/security/encodeXML",
	"sap/ui/base/ManagedObject",
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "addAriaDescribedBy"
	"sap/ui/dom/jquery/Aria"
], function(
	Control,
	library,
	mLibrary,
	ControlBehavior,
	Element,
	LabelEnablement,
	InvisibleText,
	ValueStateMessage,
	Button,
	Tokenizer,
	Token,
	Icon,
	Library,
	coreLibrary,
	StaticArea,
	Device,
	FileUploaderRenderer,
	containsOrEquals,
	KeyCodes,
	Log,
	encodeXML,
	ManagedObject,
	jQuery
) {

	// shortcut for sap.ui.core.ValueState
	const ValueState = coreLibrary.ValueState;
	const HttpRequestMethod = library.FileUploaderHttpRequestMethod;

	const TokenizerRenderMode = mLibrary.TokenizerRenderMode;

	/**
	 * Constructor for a new <code>FileUploader</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The framework generates an input field and a button with text "Browse ...".
	 * The API supports features such as on change uploads (the upload starts immediately after
	 * a file has been selected), file uploads with explicit calls, adjustable control sizes,
	 * text display after uploads, or tooltips containing complete file paths.
	 *
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/upload-collection/ Upload Collection}
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent, sap.ui.unified.IProcessableBlobs
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.unified.FileUploader
	 */
	var FileUploader = Control.extend("sap.ui.unified.FileUploader", /** @lends sap.ui.unified.FileUploader.prototype */ { metadata : {

		interfaces : ["sap.ui.core.IFormContent", "sap.ui.unified.IProcessableBlobs"],
		library : "sap.ui.unified",
		designtime: "sap/ui/unified/designtime/FileUploader.designtime",
		properties : {

			/**
			 * Value of the path for file upload.
			 */
			value : {type : "string", group : "Data", defaultValue : ''},

			/**
			 * Disabled controls have different colors, depending on customer settings.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Used when URL address is on a remote server.
			 */
			uploadUrl : {type : "sap.ui.core.URI", group : "Data", defaultValue : ''},

			/**
			 * Unique control name for identification on the server side after sending data to the server.
			 */
			name : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Specifies the displayed control width.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : ''},

			/**
			 * If set to "true", the upload immediately starts after file selection.
			 * With the default setting, the upload needs to be explicitly triggered.
			 */
			uploadOnChange : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Additional data that is sent to the back end service.
			 *
			 * Data will be transmitted as value of a hidden input where the name is derived from the
			 * <code>name</code> property with suffix "-data".
			 */
			additionalData : {type : "string", group : "Data", defaultValue : null},

			/**
			 * If the FileUploader is configured to upload the file directly after the file is selected,
			 * it is not allowed to upload a file with the same name again. If a user should be allowed
			 * to upload a file with the same name again this parameter has to be "true".
			 *
			 * A typical use case would be if the files have different paths.
			 */
			sameFilenameAllowed : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * The button's text can be overwritten using this property.
			 */
			buttonText : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * The chosen files will be checked against an array of file types.
			 *
			 * If at least one file does not fit the file type restriction, the upload is prevented.
			 *
			 * Example: <code>["jpg", "png", "bmp"]</code>.
			 */
			fileType : {type : "string[]", group : "Data", defaultValue : null},

			/**
			 * Allows multiple files to be chosen and uploaded from the same folder.
			 *
			 * <b>Note:</b> Keep in mind that the various operating systems for mobile devices
			 * can react differently to the property so that fewer upload functions may be
			 * available in some cases.
			 */
			multiple : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * A file size limit in megabytes which prevents the upload if at least one file exceeds it.
			 */
			maximumFileSize : {type : "float", group : "Data", defaultValue : null},

			/**
			 * The chosen files will be checked against an array of MIME types defined in this property.
			 *
			 * If at least one file does not fit the MIME type restriction, the upload is prevented.
			 *
			 * <b>Note:</b> This property is only reliable for common file types like images, audio, video,
			 * plain text and HTML documents. File types that are not recognized by the browser result
			 * in <code>file.type</code> to be returned as an empty string. In this case the verification
			 * could not be performed. The file upload is not prevented and the validation based on file type
			 * is left to the receiving backend side.
			 *
			 *
			 * Example: <code>["image/png", "image/jpeg"]</code>.
			 */
			mimeType : {type : "string[]", group : "Data", defaultValue : null},

			/**
			 * If set to "true", the request will be sent as XHR request instead of a form submit.
			 */
			sendXHR : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Chosen HTTP request method for file upload.
			 * @since 1.81.0
			 *
			 */
			httpRequestMethod : {type: "sap.ui.unified.FileUploaderHttpRequestMethod", group : "Behavior", defaultValue : HttpRequestMethod.POST},

			/**
			 * Placeholder for the text field.
			 */
			placeholder : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Style of the button.
			 *
			 * Values "Transparent, "Accept", "Reject", or "Emphasized" are allowed.
			 */
			style : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * If set to "true", the <code>FileUploader</code> will be rendered as Button only,
			 * without showing the input field.
			 */
			buttonOnly : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * If set to "false", the request will be sent as file only request instead of a multipart/form-data request.
			 *
			 * Only one file could be uploaded using this type of request. Required for sending such a request is
			 * to set the property <code>sendXHR</code> to "true". This property is not supported by Internet Explorer 9.
			 */
			useMultipart : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * The maximum length of a filename which the <code>FileUploader</code> will accept.
			 *
			 * If the maximum filename length is exceeded, the corresponding event <code>filenameLengthExceed</code> is fired.
			 * @since 1.24.0
			 */
			maximumFilenameLength : {type : "int", group : "Data", defaultValue : null},

			/**
			 * Visualizes warnings or errors related to the text field.
			 *
			 * Possible values: Warning, Error, Success, None.
			 * @since 1.24.0
			 */
			valueState : {type : "sap.ui.core.ValueState", group : "Data", defaultValue : ValueState.None},

			/**
			 * Custom text for the value state message pop-up.
			 *
			 * <b>Note:</b> If not specified, a default text, based on the value state type, will be used instead.
			 * @since 1.52
			 */
			valueStateText : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Icon to be displayed as graphical element within the button.
			 *
			 * This can be a URI to an image or an icon font URI.
			 * @since 1.26.0
			 */
			icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : ''},

			/**
			 * Icon to be displayed as graphical element within the button when it is hovered (only if also a base icon was specified).
			 *
			 * If not specified, the base icon is used. If an icon font icon is used, this property is ignored.
			 * @since 1.26.0
 			 * @deprecated Since version 1.144 because it was relevant for <code>sap.ui.commons.FileUploader</code>.
			 */
			iconHovered : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : ''},

			/**
			 * Icon to be displayed as graphical element within the button when it is selected (only if also a base icon was specified).
			 *
			 * If not specified, the base or hovered icon is used. If an icon font icon is used, this property is ignored.
			 * @since 1.26.0
 			 * @deprecated Since version 1.144 because it was relevant for <code>sap.ui.commons.FileUploader</code>.
			 */
			iconSelected : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : ''},

			/**
			 * If set to true (default), the display sequence is 1. icon 2. control text.
			 * @since 1.26.0
			 */
			iconFirst : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * If set to true, the button is displayed without any text.
			 * @since 1.26.0
			 */
			iconOnly : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Allows users to upload all files from a given directory and its corresponding subdirectories.
			 *
			 * <b>Note:</b> This feature is supported on all WebKit-based browsers as well as Microsoft Edge and Firefox after version 50.
			 * <b>Note:</b> Multiple directory selection is not supported.
			 * @since 1.105.0
			 */
			directory : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Indicates whether the file uploader is required.
			 *
			 * <b>Note:</b> The control can be marked as required either by setting this property to <code>true</code>
			 * or by using the legacy approach of setting the <code>required</code> property to <code>true</code>
			 * on a <code>sap.m.Label</code> that has its <code>labelFor</code> property pointing to this control.
			 * @since 1.144
			 */
			required : {type : "boolean", group : "Behavior", defaultValue : false}
		},
		aggregations : {

			/**
			 * The parameters for the <code>FileUploader</code> which are rendered as a hidden input field.
			 * @since 1.12.2
			 */
			parameters : {type : "sap.ui.unified.FileUploaderParameter", multiple : true, singularName : "parameter"},

			/**
			 * The header parameters for the <code>FileUploader</code> which are only submitted with XHR requests.
			 */
			headerParameters : {type : "sap.ui.unified.FileUploaderParameter", multiple : true, singularName : "headerParameter"},

			/**
			 * Settings for the <code>XMLHttpRequest</code> object.
			 * <b>Note:</b> This aggregation is only used when the <code>sendXHR</code> property is set to <code>true</code>.
			 * @since 1.52
			 */
			xhrSettings : {type : "sap.ui.unified.FileUploaderXHRSettings", multiple : false},

			/**
			 * Internal tokenizer to display selected files.
			 * @private
			 * @since 1.144
			 */
			_tokenizer: { type: "sap.m.Tokenizer", multiple: false, visibility: "hidden" },

			/**
			 * Internal icon to open file dialog and browse files.
			 * @private
			 * @since 1.144
			 */
			_browseIcon: { type: "sap.ui.core.Icon", multiple: false, visibility: "hidden" },

			/**
			 * Internal icon to remove all selected files.
			 * @private
			 * @since 1.144
			 */
			_clearIcon: { type: "sap.ui.core.Icon", multiple: false, visibility: "hidden" }
		},
		associations : {

			/**
			 * Association to controls / IDs which describe this control (see WAI-ARIA attribute <code>aria-describedby</code>).
			 */
			ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"},

			/**
			 * Association to controls / IDs which label this control (see WAI-ARIA attribute <code>aria-labelledby</code>).
			 */
			ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
		},
		events : {

			/**
			 * Event is fired when the value of the file path has been changed.
			 *
			 * <b>Note:</b> Keep in mind that because of the HTML input element of type file, the
			 * event is also fired in Chrome browser when the Cancel button of the
			 * uploads window is pressed.
			 */
			change : {
				parameters : {

					/**
					 * New file path value.
					 */
					newValue : {type : "string"},

					/**
					 * Files.
					 */
					files : {type : "object[]"}
				}
			},

			/**
			 * Event is fired as soon as the upload request is completed (either successful or unsuccessful).
			 *
			 * To see if the upload request was successful, check the <code>status</code> parameter for a value 2xx.
			 * The actual progress of the upload can be monitored by listening to the <code>uploadProgress</code> event.
			 * However, this covers only the client side of the upload process and does not give any success status
			 * from the server.
			 */
			uploadComplete : {
				parameters : {

					/**
					 * The name of a file to be uploaded.
					 */
					fileName : {type : "string"},

					/**
					 * Response message which comes from the server.
					 *
					 * On the server side this response has to be put within the &quot;body&quot; tags of the response
					 * document of the iFrame. It can consist of a return code and an optional message. This does not
					 * work in cross-domain scenarios.
					 */
					response : {type : "string"},

					/**
					 * ReadyState of the XHR request.
					 *
					 * Required for receiving a <code>readyStateXHR</code> is to set the property <code>sendXHR</code>
					 * to true.
					 */
					readyStateXHR : {type : "string"},

					/**
					 * Status of the XHR request.
					 *
					 * Required for receiving a <code>status</code> is to set the property <code>sendXHR</code> to true.
					 */
					status : {type : "int"},

					/**
					 * Http-Response which comes from the server.
					 *
					 * Required for receiving <code>responseRaw</code> is to set the property <code>sendXHR</code> to true.
					 */
					responseRaw : {type : "string"},

					/**
					 * Http-Response-Headers which come from the server.
					 *
					 * Provided as a JSON-map, i.e. each header-field is reflected by a property in the <code>headers</code>
					 * object, with the property value reflecting the header-field's content.
					 *
					 * Required for receiving <code>headers</code> is to set the property <code>sendXHR</code> to true.
					 */
					headers : {type : "object"},

					/**
					 * Http-Request-Headers.
					 *
					 * Required for receiving <code>requestHeaders</code> is to set the property <code>sendXHR</code> to true.
					 */
					requestHeaders : {type : "object[]"}
				}
			},

			/**
			 * Event is fired when the type of a file does not match the <code>mimeType</code> or <code>fileType</code> property.
			 */
			typeMissmatch : {
				parameters : {

					/**
					 * The name of a file to be uploaded.
					 */
					fileName : {type : "string"},

					/**
					 * The file ending of a file to be uploaded.
					 */
					fileType : {type : "string"},

					/**
					 * The MIME type of a file to be uploaded.
					 */
					mimeType : {type : "string"}
				}
			},

			/**
			 * Event is fired when the size of a file is above the <code>maximumFileSize</code> property.
			 */
			fileSizeExceed : {
				parameters : {

					/**
					 * The name of a file to be uploaded.
					 */
					fileName : {type : "string"},

					/**
					 * The size in MB of a file to be uploaded.
					 */
					fileSize : {type : "string"}
				}
			},

			/**
			 * Event is fired when the size of the file is 0
			 */
			fileEmpty : {
				parameters : {

					/**
					 * The name of the file to be uploaded.
					 */
					fileName: {type : "string"}
				}
			},

			/**
			 * Event is fired when the file is allowed for upload on client side.
			 */
			fileAllowed : {},

			/**
			 * Event is fired after the upload has started and before the upload is completed.
			 *
			 * It contains progress information related to the running upload. Depending on file size, band width
			 * and used browser the event is fired once or multiple times.
			 *
			 * This event is only supported with property <code>sendXHR</code> set to true.
			 *
			 * @since 1.24.0
			 */
			uploadProgress : {
				parameters : {

					/**
					 * Indicates whether or not the relative upload progress can be calculated out of loaded and total.
					 */
					lengthComputable : {type : "boolean"},

					/**
					 * The number of bytes of the file which have been uploaded by the time the event was fired.
					 */
					loaded : {type : "float"},

					/**
					 * The total size of the file to be uploaded in bytes.
					 */
					total : {type : "float"},

					/**
					 * The name of a file to be uploaded.
					 */
					fileName : {type : "string"},

					/**
					 * Http-Request-Headers.
					 *
					 * Required for receiving <code>requestHeaders</code> is to set the property <code>sendXHR</code> to true.
					 */
					requestHeaders : {type : "object[]"}
				}
			},

			/**
			 * Event is fired after the current upload has been aborted.
			 *
			 * This event is only supported with property <code>sendXHR</code> set to true.
			 * @since 1.24.0
			 */
			uploadAborted : {
				parameters : {

					/**
					 * The name of a file to be uploaded.
					 */
					fileName : {type : "string"},

					/**
					 * Http-Request-Headers.
					 *
					 * Required for receiving <code>requestHeader</code> is to set the property <code>sendXHR</code> to true.
					 */
					requestHeaders : {type : "object[]"}
				}
			},

			/**
			 * Event is fired, if the filename of a chosen file is longer than the value specified with the
			 * <code>maximumFilenameLength</code> property.
			 * @since 1.24.0
			 */
			filenameLengthExceed : {
				parameters : {

					/**
					 * The filename, which is longer than specified by the value of the property <code>maximumFilenameLength</code>.
					 */
					fileName : {type : "string"}
				}
			},

			/**
			 * Event is fired before an upload is started.
			 * @since 1.30.0
			 */
			uploadStart : {
				parameters : {

					/**
					 * The name of a file to be uploaded.
					 */
					fileName : {type : "string"},

					/**
					 * Http-Request-Headers.
					 *
					 * Required for receiving <code>requestHeaders</code> is to set the property <code>sendXHR</code>
					 * to true.
					 */
					requestHeaders : {type : "object[]"}
				}
			},
			/**
			 * Fired before select file dialog opens.
			 * @since 1.102.0
			 */
			beforeDialogOpen : {},

			/**
			 * Fired after select file dialog closes.
			 * @since 1.102.0
			 */
			afterDialogClose : {}
		}
	}, renderer: FileUploaderRenderer});


	/**
	 * Initializes the control.
	 * It is called from the constructor.
	 * @private
	 */
	FileUploader.prototype.init = function(){
		this.oRb = Library.getResourceBundleFor("sap.ui.unified");

		this.oBrowse = new Button(this.getId() + "-fu_button");
		this.oBrowse.setParent(this);
		this._oBrowseDelegate = {
			onAfterRendering: () => {
				const oDomRef = this.oBrowse.getDomRef();
				oDomRef.setAttribute("tabindex", "-1");
				oDomRef.removeAttribute("aria-labelledby");
				oDomRef.removeAttribute("aria-describedby");
			}
		};
		this.oBrowse.addEventDelegate(this._oBrowseDelegate);

		this._oTokenizerDelegate = {
			onfocusin: () => {
				if (!this._bTokenizerFocus && this.shouldValueStateMessageBeOpened()) {
					this.openValueStateMessage();
				}
				this._bTokenizerFocus = true;
				this._removeFocusClass();
			}
		};

		this.oFileUpload = null;

		if (ControlBehavior.isAccessibilityEnabled()) {
			if (!FileUploader.prototype._sAccText) {
				FileUploader.prototype._sAccText = this.oRb.getText("FILEUPLOADER_ACC_TEXT");
			}
		}
		this._submitAfterRendering = false;

		this._selectedFileNames = [];
		this._bTokenizerFocus = false;
		this._oValueStateMessage = new ValueStateMessage(this);
	};

	FileUploader.prototype.setIcon = function(sIcon) {
		this.oBrowse.setIcon(sIcon);
		this.setProperty("icon", sIcon, false);
		return this;
	};

	FileUploader.prototype.setIconHovered = function(sIconHovered) {
		this.setProperty("iconHovered", sIconHovered, false);
		if (this.oBrowse.setIconHovered) {
			this.oBrowse.setIconHovered(sIconHovered);
		}
		return this;
	};

	FileUploader.prototype.setIconSelected = function(sIconSelected) {
		this.setProperty("iconSelected", sIconSelected, false);
		if (this.oBrowse.setIconSelected) {
			this.oBrowse.setIconSelected(sIconSelected);
		} else {
			this.oBrowse.setActiveIcon(sIconSelected);
		}
		return this;
	};

	FileUploader.prototype.setIconFirst = function(bIconFirst) {
		this.oBrowse.setIconFirst(bIconFirst);
		this.setProperty("iconFirst", bIconFirst, false);
		return this;
	};

	FileUploader.prototype.setName = function (sName) {
		this.setProperty("name", sName, false);
		this._rerenderInputField();
		return this;
	};

	FileUploader.prototype.setFileType = function(vTypes) {
		// Compatibility issue: converting the given types to an array in case it is a string
		var aTypes = this._convertTypesToArray(vTypes);
		this.setProperty("fileType", aTypes, false);
		this._rerenderInputField();
		return this;
	};

	FileUploader.prototype.setMimeType = function(vTypes) {
		// Compatibility issue: converting the given types to an array in case it is a string
		var aTypes = this._convertTypesToArray(vTypes);
		this.setProperty("mimeType", aTypes, false);
		this._rerenderInputField();
		return this;
	};

	FileUploader.prototype.setMultiple = function(bMultiple) {
		this.setProperty("multiple", bMultiple, false);
		this._rerenderInputField();
		return this;
	};

	FileUploader.prototype.setDirectory = function(bDirectory) {
		this.setProperty("directory", bDirectory, false);
		this._rerenderInputField();
		return this;
	};

	/**
	 * Recreates the native file input when properties affecting it change.
	 * The implementation attempts to preserve files and rebind handlers where possible.
	 *
	 * @private
	 */
	FileUploader.prototype._rerenderInputField = function() {
		if (this.oFileUpload) {
			var aFiles = this.oFileUpload.files;
			this._clearInputField();
			this._prepareFileUpload();

			// Register change event listener for the new input field
			jQuery(this.oFileUpload).on("change", this.handlechange.bind(this));
			// Reattach files to the input field if already selected
			/*eslint strict: [2, "never"]*/
			this.oFileUpload.files = aFiles;
			this._cacheDOMEls();
		}
	};

	FileUploader.prototype.setTooltip = function(oTooltip) {
		var sTooltip;

		Control.prototype.setTooltip.call(this, oTooltip);

		if (this.oFileUpload) {
			sTooltip = this.getTooltip_AsString();

			if (sTooltip) {
				this.oFileUpload.setAttribute("title", sTooltip);
			} else {
				this.oFileUpload.setAttribute("title", this.getValue() ? this.getValue() : this._getEffectivePlaceholder());
			}
		}
		return this;
	};

	/**
	 * Adds a focus CSS class to the root DOM element.
	 * @private
	 */
	FileUploader.prototype._addFocusClass = function() {
		this.getDomRef().classList.add("sapMFocus");
	};

	/**
	 * Removes the focus CSS class from the root DOM element.
	 * @private
	 */
	FileUploader.prototype._removeFocusClass = function() {
		this.getDomRef().classList.remove("sapMFocus");
	};

	/**
	 * Returns or lazily creates the internal Tokenizer.
	 *
	 * @returns {sap.m.Tokenizer} The Tokenizer control instance.
	 * @private
	 */
	FileUploader.prototype._getTokenizer = function() {
		let oTokenizer = this.getAggregation("_tokenizer");

		if (!oTokenizer) {
			oTokenizer = new Tokenizer(this.getId() + "-fu_tokenizer", {
				editable: false,
				width: "100%"
			});

			oTokenizer.addEventDelegate(this._oTokenizerDelegate);

			oTokenizer._getTokenToFocus = () => {
				return this._bTokenizerFocus ? Tokenizer.prototype._getTokenToFocus.apply(oTokenizer, arguments) : null;
			};

			this.setAggregation("_tokenizer", oTokenizer);
		}
		return oTokenizer;
	};

	/**
	 * Returns or lazily creates the internal browse icon.
	 *
	 * @returns {sap.ui.core.Icon} The icon control instance.
	 * @private
	 */
	FileUploader.prototype._getBrowseIcon = function() {
		let oBrowseIcon = this.getAggregation("_browseIcon");

		if (!oBrowseIcon) {
			oBrowseIcon = new Icon(this.getId() + "-fu_browse_icon", {
				src: "sap-icon://browse-folder",
				press: this._onBrowseIconPress.bind(this),
				noTabStop: true
			});
			this.setAggregation("_browseIcon", oBrowseIcon);
		}
		return oBrowseIcon;
	};

	/**
	 * Returns or lazily creates the internal clear icon.
	 *
	 * @returns {sap.ui.core.Icon} The icon control instance.
	 * @private
	 */
	FileUploader.prototype._getClearIcon = function() {
		let oClearIcon = this.getAggregation("_clearIcon");

		if (!oClearIcon) {
			oClearIcon = new Icon(this.getId() + "-fu_clear_icon", {
				src: "sap-icon://decline",
				tooltip: this.oRb.getText("FILEUPLOADER_CLEAR_ICON_TOOLTIP"),
				press: this._onClearIconPress.bind(this),
				noTabStop: true
			});
			this.setAggregation("_clearIcon", oClearIcon);
		}
		return oClearIcon;
	};

	/**
	 * Handles press on the browse icon: notifies and opens the native picker when enabled.
	 * @private
	 */
	FileUploader.prototype._onBrowseIconPress = function(oEvent) {
		if (this.getEnabled()) {
			this.fireBeforeDialogOpen();
			this.openFilePicker(oEvent);
		}
	};

	/**
	 * Handles press on the clear icon: clears current selection when enabled.
	 * @private
	 */
	FileUploader.prototype._onClearIconPress = function(oEvent) {
		if (this.getEnabled()) {
			this._clearSelectedFiles();
			// Prevent the click from bubbling up to the container handler
			if (oEvent) {
				oEvent.preventDefault();
				oEvent.stopPropagation && oEvent.stopPropagation();
			}
		}
	};

	/**
	 * Removes all selected files and fires a change event with empty selection.
	 * @private
	 */
	FileUploader.prototype._clearSelectedFiles = function() {
		if (this._selectedFileNames.length > 0) {
			this.clear();
			this.fireChange({newValue: "", files: []});
		}
	};

	/**
	 * Synchronizes tokenizer content with the list of selected file names.
	 * @param {boolean} [bFocus] Set to true to focus the file uploader after the next rendering
	 * @private
	 */
	FileUploader.prototype._updateTokenizer = function(bFocus) {
		const oTokenizer = this._getTokenizer();

		// Remove all existing tokens
		oTokenizer.removeAllTokens();

		// Add new tokens for selected files
		this._selectedFileNames.forEach((fileName) => {
			oTokenizer.addToken(new Token({
				text: ManagedObject.escapeSettingsValue(fileName),
				tooltip: ManagedObject.escapeSettingsValue(fileName),
				selected: false
			}));
		});

		if (bFocus) {
			this._bFocusFileUploader = true;
		}
	};

	/**
	 * Generates the text, which would be placed as an accessibility description,
	 * based on the current FileUploader's placeholder, value and tooltip.
	 * @private
	 */
	FileUploader.prototype._generateAccDescriptionText = function () {
		const sTooltip = this.getTooltip_AsString(),
			sPlaceholder = this.getPlaceholder(),
			sValue = this.getValue();
		let sAccDescription = "";

		if (sTooltip) {
			sAccDescription += sTooltip + " ";
		}

		if (sValue) {
			sAccDescription += sValue + " ";
		} else if (sPlaceholder && !this.getButtonOnly()) {
			sAccDescription += sPlaceholder + " ";
		}

		sAccDescription += this._sAccText;

		return sAccDescription;
	};

	/**
	 * Helper to ensure, that the types (file or mime) are inside an array.
	 * The FUP also accepts comma-separated strings for its fileType and mimeType property.
	 * @private
	 */
	FileUploader.prototype._convertTypesToArray = function (vTypes) {
		if (typeof vTypes === "string") {
			if (vTypes === "") {
				return [];
			} else {
				return vTypes.split(",").map(function (sType) {
					return sType.trim();
				});
			}
		}
		return vTypes;
	};

	/**
	 * Terminates the control when it has been destroyed.
	 * @private
	 */
	FileUploader.prototype.exit = function() {
		const oTokenizer = this.getAggregation("_tokenizer"),
			oClearIcon = this.getAggregation("_clearIcon"),
			oBrowseIcon = this.getAggregation("_browseIcon");

		// Clean up label click handlers
		this._detachLabelClickHandlers();

		// destroy the nested controls
		this.oBrowse.removeEventDelegate(this._oBrowseDelegate);
		this._oBrowseDelegate = null;
		this.oBrowse.destroy();
		this.oBrowse = null;

		if (oTokenizer) {
			oTokenizer.removeEventDelegate(this._oTokenizerDelegate);
			this._oTokenizerDelegate = null;
			oTokenizer.destroy();
		}

		if (oClearIcon) {
			oClearIcon.destroy();
		}

		if (oBrowseIcon) {
			oBrowseIcon.destroy();
		}

		this._oValueStateMessage.destroy();
		this._oValueStateMessage = null;

		// remove the IFRAME
		if (this.oIFrameRef) {
			jQuery(this.oIFrameRef).off();
			StaticArea.getDomRef().removeChild(this.oIFrameRef);
			this.oIFrameRef = null;
		}

		if (this.oFileUpload) {
			this._clearInputField();
		}

		if (this.FUEl) {
			this.FUEl = null;
		}

		if (this.FUDataEl) {
			this.FUDataEl = null;
		}
	};

	FileUploader.prototype._clearInputField = function() {
		jQuery(this.oFileUpload).off();
		this.oFileUpload.parentElement.removeChild(this.oFileUpload);
		this.oFileUpload = null;
	};

	/**
	 * Clean up event listeners before rendering
	 * @private
	 */
	FileUploader.prototype.onBeforeRendering = function() {
		// store the file uploader outside in the static area
		const oStaticArea = StaticArea.getDomRef(),
			bButtonOnly = this.getButtonOnly(),
			sTooltip = this.getTooltip_AsString() || this._getBrowseIconTooltip();

		jQuery(this.oFileUpload).appendTo(oStaticArea);

		if (!this.getName()) {
			Log.warning("Name property is not set. It would be used instead to identify the control on the server.", this);
		}

		// unbind the custom event handlers
		jQuery(this.oFileUpload).off();

		if (!bButtonOnly) {
			this._getBrowseIcon().setTooltip(this._getBrowseIconTooltip());
		} else if (this.getIconOnly() && bButtonOnly) {
			this.oBrowse.setText("");
			this.oBrowse.setTooltip(sTooltip);
		} else if (this.getIconOnly()) {
			this.oBrowse.setText("");
			this.oBrowse.setTooltip(sTooltip);
		} else {
			this.oBrowse.setText(this._getEffectiveButtonText());
			this.oBrowse.setTooltip(sTooltip);
		}
	};

	/**
	 * Prepare the upload processing, establish the change handler for the
	 * pure html input object.
	 * @private
	 */
	FileUploader.prototype.onAfterRendering = function() {
		// Setup tracking of clicks on associated labels
		this._attachLabelClickHandlers();

		// prepare the file upload control and the upload iframe
		this.prepareFileUploadAndIFrame();

		this._cacheDOMEls();
		this._addLabelFeaturesToBrowse();

		// event listener registration for change event
		jQuery(this.oFileUpload).on("change", this.handlechange.bind(this));

		if (this._submitAfterRendering) {
			this._submitAndResetValue();
			this._submitAfterRendering = false;
		}

		// Attach click handler to the main container
		this._attachContainerClickHandler();
	};

	/**
	 * Attaches click handlers to associated labels to prevent the file dialog from opening on label clicks.
	 * @private
	 */
	FileUploader.prototype._attachLabelClickHandlers = function() {
		// First detach any existing handlers to avoid duplicates
		this._detachLabelClickHandlers();

		this._bLabelClickInProgress = false;
		this._labelClickHandlers = [];

		// Track clicks on associated labels
		LabelEnablement.getReferencingLabels(this).forEach((sLabelId) => {
			const oLabel = document.getElementById(sLabelId);
			if (oLabel) {
				// Create handler bound to this instance
				const fnHandler = () => {
					this._bLabelClickInProgress = true;
					setTimeout(() => { this._bLabelClickInProgress = false; }, 0);
				};

				// Store handler reference for cleanup
				this._labelClickHandlers.push({
					element: oLabel,
					handler: fnHandler
				});

				// Attach the handler
				oLabel.addEventListener("click", fnHandler);
			}
		});
	};

	/**
	 * Detaches click handlers from associated labels.
	 * @private
	 */
	FileUploader.prototype._detachLabelClickHandlers = function() {
		if (this._labelClickHandlers) {
			this._labelClickHandlers.forEach(({element, handler}) => {
				element.removeEventListener("click", handler);
			});
			this._labelClickHandlers = [];
		}
		this._bLabelClickInProgress = false;
	};

	FileUploader.prototype._attachContainerClickHandler = function() {
		this.$().off("click.fileuploader").on("click.fileuploader", (e) => {
			// If this click was triggered by a label, just focus - don't open dialog
			if (this._bLabelClickInProgress) {
				e.preventDefault();
				e.stopPropagation();
				this.oFileUpload.focus();
				return;
			}

			// Prevent if clicking on a token
			if (e.target.classList.contains("sapMToken") ||
				e.target.classList.contains("sapMTokenizer") ||
				e.target.classList.contains("sapMTokenizerIndicator") ||
				jQuery(e.target).closest(".sapMToken, .sapMTokenizerIndicator").length > 0) {
				return;
			}

			// Check if click is directly on the icon elements themselves
			const $browseIcon = jQuery(e.target).closest(".sapUiIcon");
			if ($browseIcon.length > 0) {
				const oBrowseIconControl = this._getBrowseIcon(),
					oClearIconControl = this._getClearIcon();

				// Check if the clicked icon is one of our control icons
				if (($browseIcon[0] === oBrowseIconControl.getDomRef()) ||
					($browseIcon[0] === oClearIconControl.getDomRef())) {
					// Icon's own press handler will handle this, don't duplicate
					return;
				}
			}

			// Check if click is within browse icon container (but not on icon itself)
			const $browseIconContainer = jQuery(e.target).closest(".sapUiFupBrowseIcon");
			if ($browseIconContainer.length > 0) {
				if (this.getEnabled()) {
					this.fireBeforeDialogOpen();
					this.openFilePicker();
				}
				return;
			}

			// Check if click is within clear icon container (but not on icon itself)
			const $clearIconContainer = jQuery(e.target).closest(".sapUiFupClearIcon");
			if ($clearIconContainer.length > 0) {
				if (this.getEnabled()) {
					this._clearSelectedFiles();
				}
				return;
			}

			// Prevent double triggering if the file input is clicked directly
			if (e.target === this.oFileUpload) {
				return;
			}

			// Check if the click was on the browse button in buttonOnly mode
			if (this.getButtonOnly() &&
				(e.target === this.oBrowse.getDomRef() ||
				jQuery(e.target).closest(this.oBrowse.getDomRef()).length > 0)) {
				// Remove focus from the button and focus the file input instead
				this.oBrowse.getDomRef().blur();
				this.oFileUpload.focus();
				// The button's own click handler will open the file dialog
				return;
			}

			if (this.getEnabled()) {
				this.openFilePicker();
			}
		});
	};

	FileUploader.prototype._cacheDOMEls = function() {
		this.FUEl = this.getDomRef("fu");
		this.FUDataEl = this.getDomRef("fu_data");
	};


	/**
	 * Returns the id that should be used by external labels pointing to the native input.
	 *
	 * @returns {string} ID of the native input element.
	 * @public
	 */
	FileUploader.prototype.getIdForLabel = function() {
		return this.getId() + "-fu";
	};

	FileUploader.prototype.onfocusin = function(oEvent) {
		const bButtonOnly = this.getButtonOnly();

		if (bButtonOnly) {
			this.oBrowse.getDomRef().blur();
			this.oFileUpload.focus();
		}

		if (this._bTokenizerFocus) {
			return;
		}

		// Expand tokenizer when FileUploader gets focus and there are tokens
		if (!bButtonOnly && !this._bTokenizerFocus && this._selectedFileNames.length > 0) {
			this._getTokenizer().setRenderMode(TokenizerRenderMode.Loose);
		}

		this._addFocusClass();

		if (this.shouldValueStateMessageBeOpened()) {
			this.openValueStateMessage();
		}
	};

	FileUploader.prototype.onsapfocusleave = function(oEvent) {
		// Collapse tokenizer when FileUploader loses focus and there are tokens
		if (!this.getButtonOnly() && !this._bTokenizerFocus && this._selectedFileNames.length > 0) {
			this._getTokenizer().setRenderMode(TokenizerRenderMode.Narrow);
		}

		this._bTokenizerFocus = false;

		this._removeFocusClass();

		if (!oEvent.relatedControlId || !containsOrEquals(this.getDomRef(), Element.getElementById(oEvent.relatedControlId).getFocusDomRef())) {
			this.closeValueStateMessage();
		}
	};

	/**
	 * Returns the DOM element that should be focused, when the focus is set onto the control.
	 * @returns {Element} The DOM element that should be focused
	 */
	FileUploader.prototype.getFocusDomRef = function() {
		return this.oFileUpload;
	};

	FileUploader.prototype.setEnabled = function(bEnabled){
		var $oFileUpload = jQuery(this.oFileUpload);

		this.setProperty("enabled", bEnabled, false);
		this.oBrowse.setEnabled(bEnabled);

		if (this.getEnabled()) {
			$oFileUpload.removeAttr('disabled');
		} else {
			$oFileUpload.attr('disabled', 'disabled');
		}

		return this;
	};

	/**
	 * Updates the browse button type based on the current value state.
	 * @private
	 */
	FileUploader.prototype._updateButtonType = function() {
		if (!this.oBrowse) {
			return;
		}

		const sValueState = this.getValueState();
		let sButtonType;

		switch (sValueState) {
			case ValueState.Error:
				sButtonType = "Reject";
				break;
			case ValueState.Success:
				sButtonType = "Accept";
				break;
			case ValueState.Warning:
				sButtonType = "Attention";
				break;
			case ValueState.None:
			case ValueState.Information:
			default:
				sButtonType = "Default";
				break;
		}

		this.oBrowse.setType(sButtonType);
	};

	/**
	 * Checks whether the control is currently focused.

	 * @returns {boolean} true if <code>this</code> is focused
	 * @private
	 */
	FileUploader.prototype._isFocused = function() {
		return containsOrEquals(this.getDomRef(), document.activeElement);
	};

	FileUploader.prototype.setValueState = function(sValueState) {
		const bControlFocused = this._isFocused();

		this.setProperty("valueState", sValueState, false);

		// Update button type based on value state
		this._updateButtonType();

		switch (sValueState) {
			case ValueState.Error:
			case ValueState.Warning:
			case ValueState.Success:
				if (bControlFocused) {
					this.openValueStateMessage();
				}
				break;
			default:
				if (bControlFocused) {
					this.closeValueStateMessage();
				}
		}

		return this;
	};

	FileUploader.prototype.setStyle = function(sStyle) {
		this.setProperty("style", sStyle, true);
		if (sStyle) {
			if (sStyle == "Transparent") {
				if (this.oBrowse.setLite) {
					this.oBrowse.setLite(true);
				} else {
					this.oBrowse.setType("Transparent");
				}
			} else {
				if (this.oBrowse.setType) {
					this.oBrowse.setType(sStyle);
				} else {
					if (sStyle == "Emphasized") {
						sStyle = "Emph";
					}
					this.oBrowse.setStyle(sStyle);
				}
			}
		}
		return this;
	};

	FileUploader.prototype.setValue = function(sValue, bFireEvent) {
		const oldValue = this.getValue();
		let oFiles;
		if ((oldValue != sValue) || this.getSameFilenameAllowed()) {
			// only upload when a valid value is set
			const bUpload = this.getUploadOnChange() && sValue;

			// when we do not upload we re-render (cause some browsers don't like
			// to change the value of file uploader INPUT elements)
			this.setProperty("value", sValue, bUpload);
			if (this.oFileUpload && !this.getTooltip_AsString()) {
				this.oFileUpload.setAttribute("title", sValue ? sValue : this._getEffectivePlaceholder());
			}

			const oForm = this.getDomRef("fu_form");

			//reseting the input fields if setValue("") is called, also for undefined and null
			if (this.oFileUpload && !sValue) {
				// some browsers do not allow to clear the value of the fileuploader control
				// therefore we utilize the form and reset the values inside this form and
				// apply the additionalData again afterwards
				if (oForm) {
					oForm.reset();
					//keep the additional data on the form
					jQuery(this.FUDataEl).val(this.getAdditionalData());
				} else {
					// If the form doesn't exist (e.g., FileUploader is invisible),
					// directly clear the files using DataTransfer
					this.oFileUpload.files = new DataTransfer().files;
				}
				this._selectedFileNames = [];
			}
			// only fire event when triggered by user interaction
			if (bFireEvent) {
				if (window.File) {
					oFiles = this.FUEl.files;
				}
				if (!this.getSameFilenameAllowed() || (sValue && oldValue != sValue)) {
					this.fireChange({id:this.getId(), newValue:sValue, files:oFiles});
				}
			}
			if (bUpload) {
				this.upload();
			}
			this._updateTokenizer(this._isFocused());
		}
		return this;
	};


	/**
	 * Clears the content of the <code>FileUploader</code>.
	 *
	 * <b>Note:</b> The attached additional data however is retained.
	 *
	 * @public
	 * @since 1.25.0
	 * @returns {this} Reference to <code>this</code> for method chaining.
	 */
	FileUploader.prototype.clear = function () {
		const uploadForm = this.getDomRef("fu_form");
		if (uploadForm) {
			uploadForm.reset();
		} else if (this.oFileUpload) {
			this.oFileUpload.files = new DataTransfer().files;
		}
		// Clear selected file names and update Tokenizer
		this._selectedFileNames = [];
		this._updateTokenizer();

		// Clear the value, don't fire change event, and suppress refocusing
		return this.setValue("", false, true);
	};

	/**
	 * Programmatically opens the file picker dialog.
	 * <b>Note:</b> if oEvent is provided, the default action and event propagation of this event are prevented.
	 *
	 * @since 1.112
	 * @param {jQuery.Event} [oEvent] The event object associated with the user action that triggered the file picker opening.
	 * @returns {this} Reference to <code>this</code> for method chaining.
	 * @private
	 */
	FileUploader.prototype.openFilePicker = function (oEvent) {
		if (this.oFileUpload) {
			this.oFileUpload.click();
			if (oEvent) {
				oEvent.preventDefault();
				oEvent.stopPropagation && oEvent.stopPropagation();
			}
		}

		return this;
	};

	/**
	 * Provides a reference to the type "file" input field of the control.
	 *
	 * @since 1.112
	 * @returns {HTMLElement|null} The input type "file" DOM representation.
	 * @private
	 * @ui5-restricted sap.suite.ui.commons.CloudFilePicker
	 */
	FileUploader.prototype.getInputReference = function () {
		return this.oFileUpload;
	};

	FileUploader.prototype.setAdditionalData = function(sAdditionalData) {
		// set the additional data in the hidden input
		this.setProperty("additionalData", sAdditionalData, true);
		var oAdditionalData = this.FUDataEl;
		if (oAdditionalData) {
			sAdditionalData = this.getAdditionalData() || "";
			oAdditionalData.value = sAdditionalData;
		}
		return this;
	};

	FileUploader.prototype.sendFiles = function(aXhr, iIndex) {
		var that = this;
		var bAllPosted = true;

		for (var i = 0; i < aXhr.length; i++) {
			if (!aXhr[i].bPosted) {
				bAllPosted = false;
				break;
			}
		}

		if (bAllPosted) {
			if (this.getSameFilenameAllowed() && this.getUploadOnChange()) {
				that.setValue("", true);
			}
			return;
		}

		var oXhr = aXhr[iIndex];
		var sFilename = oXhr.file.name ? oXhr.file.name : "MultipartFile";
		var oRequestHeaders = oXhr.requestHeaders;

		var fnProgressListener = function(oProgressEvent) {
			var oProgressData = {
				lengthComputable: !!oProgressEvent.lengthComputable,
				loaded: oProgressEvent.loaded,
				total: oProgressEvent.total
			};
			that.fireUploadProgress({
				"lengthComputable": oProgressData.lengthComputable,
				"loaded": oProgressData.loaded,
				"total": oProgressData.total,
				"fileName": sFilename,
				"requestHeaders": oRequestHeaders
			});
		};

		oXhr.xhr.upload.addEventListener("progress", fnProgressListener);

		oXhr.xhr.onreadystatechange = function() {

			var sResponse;
			var sResponseRaw;
			var mHeaders = {};
			var sPlainHeader;
			var aHeaderLines;
			var iHeaderIdx;
			var sReadyState;
			sReadyState = oXhr.xhr.readyState;
			var iStatus = oXhr.xhr.status;

			if (oXhr.xhr.readyState == 4) {
				//this check is needed, because (according to the xhr spec) the readyState is set to OPEN (4)
				//as soon as the xhr is aborted. Only after the progress events are fired, the state is set to UNSENT (0)
				if (oXhr.xhr.responseXML) {
					sResponse = oXhr.xhr.responseXML.documentElement.textContent;
				}
				sResponseRaw = oXhr.xhr.response;

				//Parse the http-header into a map
				sPlainHeader = oXhr.xhr.getAllResponseHeaders();
				if (sPlainHeader) {
					aHeaderLines = sPlainHeader.split("\u000d\u000a");
					for (var i = 0; i < aHeaderLines.length; i++) {
						if (aHeaderLines[i]) {
							iHeaderIdx = aHeaderLines[i].indexOf("\u003a\u0020");
							mHeaders[aHeaderLines[i].substring(0, iHeaderIdx)] = aHeaderLines[i].substring(iHeaderIdx + 2);
						}
					}
				}
				that.fireUploadComplete({
					"fileName": sFilename,
					"headers": mHeaders,
					"response": sResponse,
					"responseRaw": sResponseRaw,
					"readyStateXHR": sReadyState,
					"status": iStatus,
					"requestHeaders": oRequestHeaders
				});
			}
			that._bUploading = false;
		};
		if (oXhr.xhr.readyState === 0 || oXhr.bPosted) {
			iIndex++;
			that.sendFiles(aXhr, iIndex);
		} else {
			oXhr.xhr.send(oXhr.file);
			oXhr.bPosted = true;
			iIndex++;
			that.sendFiles(aXhr, iIndex);
		}
	};


	/**
	 * Starts the upload (as defined by uploadUrl).
	 *
	 * @param {boolean} [bPreProcessFiles] Set to <code>true</code> to allow pre-processing of the files before sending the request.
	 * As a result, the <code>upload</code> method becomes asynchronous. See {@link sap.ui.unified.IProcessableBlobs} for more information.
	 * <b>Note:</b> This parameter is only taken into account when <code>sendXHR</code> is set to <code>true</code>.
	 *
	 * @type void
	 * @public
	 */
	FileUploader.prototype.upload = function(bPreProcessFiles) {
		var uploadForm,
			sActionAttr;

		//supress Upload if the FileUploader is not enabled
		if (!this.getEnabled()) {
			return;
		}

		uploadForm = this.getDomRef("fu_form");

		try {
			this._bUploading = true;
			if (this.getSendXHR() && window.File) {
				var aFiles = this.FUEl.files;
				if (bPreProcessFiles) {
					this._sendProcessedFilesWithXHR(aFiles);
				} else {
					this._sendFilesWithXHR(aFiles);
				}
			} else if (uploadForm) {
				// In order to do the submit, the action DOM attribute of the inner form should be accurate.
				// If there is a change in the passed to the uploadUrl property string, we must ensure that it is
				// applied in the DOM and the submit is performed after there is new rendering.
				sActionAttr = uploadForm.getAttribute("action");
				if (sActionAttr !== this.getUploadUrl()) {
					this._submitAfterRendering = true;
				} else {
					this._submitAndResetValue();
				}
			}
		} catch (oException) {
			Log.error("File upload failed:\n" + oException.message);
		}
	};

	FileUploader.prototype._submitAndResetValue = function() {
		var uploadForm = this.getDomRef("fu_form");

		uploadForm.submit();
		this.fireUploadStart();
		this._resetValueAfterUploadStart();
	};

	/**
	 * Aborts the currently running upload.
	 *
	 * @param {string} sHeaderParameterName
	 *                 The name of the parameter within the <code>headerParameters</code> aggregation to be checked.
	 *
	 *                 <b>Note:</b> aborts the request, sent with a header parameter with the provided name.
	 *                 The parameter is taken into account if the sHeaderParameterValue parameter is provided too.
	 *
	 * @param {string} sHeaderParameterValue
	 *                 The value of the parameter within the <code>headerParameters</code> aggregation to be checked.
	 *
	 *                 <b>Note:</b> aborts the request, sent with a header parameter with the provided value.
	 *                 The parameter is taken into account if the sHeaderParameterName parameter is provided too.
	 * @public
	 * @since 1.24.0
	 */
	FileUploader.prototype.abort = function(sHeaderParameterName, sHeaderParameterValue) {
		if (!this.getUseMultipart()) {
			var iStart = this._aXhr.length - 1;
			for (var i = iStart; i > -1 ; i--) {
				if (sHeaderParameterName && sHeaderParameterValue) {
					for (var j = 0; j < this._aXhr[i].requestHeaders.length; j++) {
						var sHeader = this._aXhr[i].requestHeaders[j].name;
						var sValue = this._aXhr[i].requestHeaders[j].value;
						if (sHeader == sHeaderParameterName && sValue == sHeaderParameterValue) {
							this._aXhr[i].xhr.abort();
							this.fireUploadAborted({
								"fileName": this._aXhr[i].fileName,
								"requestHeaders": this._aXhr[i].requestHeaders
							});
							// Remove aborted entry from internal array.
							this._aXhr.splice(i, 1);
							Log.info("File upload aborted.");
							break;
						}
					}
				} else {
					this._aXhr[i].xhr.abort();
					this.fireUploadAborted({
						"fileName": this._aXhr[i].fileName,
						"requestHeaders": this._aXhr[i].requestHeaders
					});
					// Remove aborted entry from internal array.
					this._aXhr.splice(i, 1);
					Log.info("File upload aborted.");
				}
			}
		} else if (this._uploadXHR && this._uploadXHR.abort) {
			// fires a progress event 'abort' on the _uploadXHR
			this._uploadXHR.abort();
			this.fireUploadAborted({
				"fileName": null,
				"requestHeaders": null
			});
			Log.info("File upload aborted.");
		}
	};

	FileUploader.prototype.onclick = function(oEvent) {
		var bFileInput = oEvent.target.getAttribute("type") === "file";
		if (bFileInput && this.getSameFilenameAllowed() && this.getEnabled()) {
			this.setValue("", true);
		}

		if (oEvent.target.getAttribute("type") === "file") {
			this.fireBeforeDialogOpen();

			document.body.onfocus = function () {
				this.fireAfterDialogClose();
				document.body.onfocus = null;
			}.bind(this);
		}
	};

	FileUploader.prototype._clickHiddenFileInput = function(oEvent) {
		this.openFilePicker(oEvent);
	};

	//
	//Event Handling
	//

	FileUploader.prototype._nextToken = function(oEvent) {
		const oTokenizer = this._getTokenizer();

		oEvent.preventDefault();

		if (this._bTokenizerFocus || !oTokenizer || !oTokenizer.getTokens().length) {
			return;
		}

		this._bTokenizerFocus = true;

		const oTokenToFocus = oTokenizer._getTokenToFocus();

		if (oTokenToFocus && oTokenToFocus.getDomRef()) {
			oTokenToFocus.focus();
		} else {
			this._bTokenizerFocus = false;
		}
	};

	FileUploader.prototype._previousToken = function(oEvent) {
		oEvent.preventDefault();

		if (this._bTokenizerFocus && oEvent.isMarked("forwardFocusToParent")) {
			this._bTokenizerFocus = false;
			this.oFileUpload.focus();
		}
	};

	FileUploader.prototype.onsapnext = function(oEvent) {
		this._nextToken(oEvent);
	};

	FileUploader.prototype.onsapprevious = function(oEvent) {
		this._previousToken(oEvent);
	};

	FileUploader.prototype.onkeydown = function(oEvent) {
		if (!this.getEnabled()) {
			return;
		}

		if (this.getSameFilenameAllowed() && this.getUploadOnChange()) {
			this.setValue("", true);
		}

		const iKeyCode = oEvent.keyCode;

		if (iKeyCode === KeyCodes.ENTER && !this._bTokenizerFocus) {
			// consider to always put the focus on the hidden file uploader
			// and let the fileuploader manage the keyboard interaction
			this._clickHiddenFileInput(oEvent);
		}

		this.oBrowse._bPressedSpace = false;
	};

	FileUploader.prototype.onkeyup = function(oEvent) {
		if (!this.getEnabled()) {
			return;
		}
		if (this.getSameFilenameAllowed() && this.getUploadOnChange()) {
			this.setValue("", true);
		}
		const iKeyCode = oEvent.keyCode,
			eKC = KeyCodes;

		if (
			!this._bTokenizerFocus &&
			this.oFileUpload &&
			(iKeyCode === KeyCodes.DELETE || iKeyCode === KeyCodes.BACKSPACE)
		) {
			this._clearSelectedFiles();
		} else if (iKeyCode === eKC.ESCAPE) {
			this.closeValueStateMessage();
		} else if (
			!this._bTokenizerFocus &&
			(
				iKeyCode === eKC.SPACE ||
				iKeyCode === eKC.F4 ||
				(
					(iKeyCode === eKC.ARROW_DOWN || iKeyCode === eKC.ARROW_UP) &&
					oEvent.altKey
				)
			)
		) {
			this._clickHiddenFileInput(oEvent);
		} else if (iKeyCode !== eKC.TAB &&
					iKeyCode !== eKC.SHIFT &&
					iKeyCode !== eKC.F6 &&
					iKeyCode !== eKC.PAGE_UP &&
					iKeyCode !== eKC.PAGE_DOWN &&
					iKeyCode !== eKC.ESCAPE &&
					iKeyCode !== eKC.END &&
					iKeyCode !== eKC.HOME &&
					iKeyCode !== eKC.ARROW_LEFT &&
					iKeyCode !== eKC.ARROW_UP &&
					iKeyCode !== eKC.ARROW_RIGHT &&
					iKeyCode !== eKC.ARROW_DOWN) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}

		this.oBrowse._bPressedSpace = false;
	};

	/**
	 * Helper function to check if the given filename is longer than the specified 'maximumFilenameLength'.
	 * @param {string} [sFilename] the filename which should be tested
	 * @param {boolean} [bFireEvent] if necessary, this flag triggers that a filenameLengthExceed event is fired
	 * @returns {boolean} whether the filename is too long or not
	 * @private
	 */
	FileUploader.prototype._isFilenameTooLong = function (sFilename) {
		var iMaxFilenameLength = this.getMaximumFilenameLength();
		if (iMaxFilenameLength !== 0 && sFilename.length > iMaxFilenameLength) {
			Log.info("The filename of " + sFilename + " (" + sFilename.length + " characters)  is longer than the maximum of " + iMaxFilenameLength + " characters.");
			return true;
		}

		return false;
	};

	FileUploader.prototype.handlechange = function(oEvent) {
		if (this.oFileUpload && this.getEnabled()) {
			var aFileTypes = this.getFileType();

			var sFileString = '';
			var bWrongType, sName, iIdx, sFileEnding;
			var uploadForm = this.getDomRef("fu_form");

			if (window.File) {
				var aFiles = oEvent.target.files;

				if (this._areFilesAllowed(aFiles)) {
					this.fireFileAllowed();
					sFileString = this._generateInputValue(aFiles);
				} else {
					uploadForm.reset();
					this.setValue("", true, true);
					return;
				}
			} else if (aFileTypes && aFileTypes.length > 0) {
				// This else case is executed if the File-API is not supported by the browser (especially IE9).
				// Check if allowed file types match the chosen file from the oFileUpload IFrame Workaround.
				bWrongType = true;
				sName = this.oFileUpload.value || "";
				iIdx = sName.lastIndexOf(".");
				sFileEnding = (iIdx === -1) ? "" : sName.substring(iIdx + 1);
				for (var l = 0; l < aFileTypes.length; l++) {
					if (sFileEnding == aFileTypes[l]) {
						bWrongType = false;
					}
				}
				if (bWrongType) {
					Log.info("File: " + sName + " is of type " + sFileEnding + ". Allowed types are: "  + aFileTypes + ".");
					this.fireTypeMissmatch({
						fileName:sName,
						fileType:sFileEnding
					});
					uploadForm.reset();
					this.setValue("", true, true);
					return;
				}
				//check if the filename is too long and fire the corresponding event if necessary
				if (this._isFilenameTooLong(sName)) {
					this.fireFilenameLengthExceed({
						fileName: sName
					});
					uploadForm.reset();
					this.setValue("", true, true);
					return;
				}
				if (sName) {
					this.fireFileAllowed();
				}
			}

			// due to new security mechanism modern browsers simply
			// append a fakepath in front of the filename instead of
			// returning the filename only - we strip this path now
			var sValue = this.oFileUpload.value || "";
			var iIndex = sValue.lastIndexOf("\\");

			if (iIndex >= 0) {
				sValue = sValue.substring(iIndex + 1);
			}

			if (this.getMultiple() || this.getDirectory()) {
				sValue = sFileString;
			}

			//sValue has to be filled to avoid clearing the FilePath by pressing cancel
			if (sValue || Device.browser.chrome) { // in Chrome the file path has to be cleared as the upload will be avoided
				this.setValue(sValue, true);
			}

			// Collect selected file names
			const aFileNames = [];
			if (window.File) {
				const aFiles = oEvent.target.files;
				for (let i = 0; i < aFiles.length; i++) {
					aFileNames.push(aFiles[i].name);
				}
			} else {
				// Fallback for old browsers
				const sName = this.oFileUpload.value || "";
				if (sName) {
					aFileNames.push(sName);
				}
			}

			// Update Tokenizer with selected file names
			this._selectedFileNames = aFileNames;
			this._updateTokenizer(true);
		}
	};

	//
	// Private
	//

	/*
	* Send passed files as argument trough XHR request.
	* @param {array} [aFiles] list of files from type window.File, this array is returned from input type="file" or from Drag and Drop
	* @returns this
	* @private
	*/
	FileUploader.prototype._sendFilesWithXHR = function (aFiles) {
		var iFiles,
			sHeader,
			sValue,
			oXhrEntry,
			oXHRSettings = this.getXhrSettings();

		if (aFiles.length > 0) {
			if (this.getUseMultipart()) {
				//one xhr request for all files
				iFiles = 1;
			} else {
				//several xhr requests for every file
				iFiles = aFiles.length;
			}
			// Save references to already uploading files if a new upload comes between upload and complete or abort
			this._aXhr = this._aXhr || [];
			for (var j = 0; j < iFiles; j++) {
				//keep a reference on the current upload xhr
				this._uploadXHR = new window.XMLHttpRequest();

				oXhrEntry = {
					xhr: this._uploadXHR,
					requestHeaders: []
				};
				this._aXhr.push(oXhrEntry);
				oXhrEntry.xhr.open(this.getHttpRequestMethod(), this.getUploadUrl(), true);
				if (oXHRSettings) {
					oXhrEntry.xhr.withCredentials = oXHRSettings.getWithCredentials();
				}
				if (this.getHeaderParameters()) {
					var aHeaderParams = this.getHeaderParameters();
					for (var i = 0; i < aHeaderParams.length; i++) {
						sHeader = aHeaderParams[i].getName();
						sValue = aHeaderParams[i].getValue();
						oXhrEntry.requestHeaders.push({
							name: sHeader,
							value: sValue
						});
					}
				}
				var sFilename = aFiles[j].name;
				var aRequestHeaders = oXhrEntry.requestHeaders;
				oXhrEntry.fileName = sFilename;
				oXhrEntry.file = aFiles[j];
				this.fireUploadStart({
					"fileName": sFilename,
					"requestHeaders": aRequestHeaders
				});
				for (var k = 0; k < aRequestHeaders.length; k++) {
					// Check if request is still open in case abort() was called.
					if (oXhrEntry.xhr.readyState === 0) {
						break;
					}
					sHeader = aRequestHeaders[k].name;
					sValue = aRequestHeaders[k].value;
					oXhrEntry.xhr.setRequestHeader(sHeader, sValue);
				}
			}
			if (this.getUseMultipart()) {
				var formData = new window.FormData();
				var name = this.FUEl.name;
				for (var l = 0; l < aFiles.length; l++) {
					this._appendFileToFormData(formData, name, aFiles[l]);
				}
				formData.append("_charset_", "UTF-8");
				var data = this.FUDataEl.name;
				if (this.getAdditionalData()) {
					var sData = this.getAdditionalData();
					formData.append(data, sData);
				} else {
					formData.append(data, "");
				}
				if (this.getParameters()) {
					var oParams = this.getParameters();
					for (var m = 0; m < oParams.length; m++) {
						var sName = oParams[m].getName();
						sValue = oParams[m].getValue();
						formData.append(sName, sValue);
					}
				}
				oXhrEntry.file = formData;
				this.sendFiles(this._aXhr, 0);
			} else {
				this.sendFiles(this._aXhr, 0);
			}
			this._bUploading = false;
			this._resetValueAfterUploadStart();
		}

		return this;
	};

	/**
	 * Append a file to passed FormData object handling special case where there is a Blob or window.File with a name
	 * parameter passed.
	 * @param {object} oFormData receiving FormData object
	 * @param {string} sFieldName name of the form field
	 * @param {object} oFile object to be appended
	 * @private
	 */
	FileUploader.prototype._appendFileToFormData = function (oFormData, sFieldName, oFile) {
		// BCP: 1770523801 We pass third parameter 'name' only for instance of 'Blob' that has a 'name'
		// parameter to prevent the append method failing on Safari browser.
		if (oFile instanceof window.Blob && oFile.name) {
			oFormData.append(sFieldName, oFile, oFile.name);
		} else {
			oFormData.append(sFieldName, oFile);
			}
	};

	/**
	* Processes the passed files and sends them afterwards via XHR request.
	* @param {window.File[]} [aFiles] list of files from type window.File
	* @returns {this} Reference to <code>this</code> for method chaining
	* @private
	*/
	FileUploader.prototype._sendProcessedFilesWithXHR = function (aFiles) {
		this.getProcessedBlobsFromArray(aFiles).then(function(aBlobs){
			this._sendFilesWithXHR(aBlobs);
		}.bind(this)).catch(function(oResult){
			Log.error("File upload failed: " + oResult && oResult.message ? oResult.message : "no details available");
		});
		return this;
	};

	/*
	* Check if passed files complies with the provided file restrictions.
	* These restrictions are the values of properties like "fileType", "maximumFileSize", "mimeType", "maximumFilenameLength"
	* @param {array} [aFiles] list of files from type window.File, this array is returned from input type="file" or from Drag and Drop
	* @returns {boolean}
	* @private
	*/
	FileUploader.prototype._areFilesAllowed = function (aFiles) {
		var sName, bWrongType, iIdx, sFileEnding, sType,
			fMaxSize = this.getMaximumFileSize(),
			aMimeTypes = this.getMimeType(),
			aFileTypes = this.getFileType();

		for (var i = 0; i < aFiles.length; i++) {
			sName = aFiles[i].name;
			sType = aFiles[i].type || "unknown";

			var fSize = ((aFiles[i].size / 1024) / 1024);
			if (fMaxSize && (fSize > fMaxSize)) {
				Log.info("File: " + sName + " is of size " + fSize + " MB which exceeds the file size limit of " + fMaxSize + " MB.");
				this.fireFileSizeExceed({
					fileName: sName,
					fileSize: fSize
				});

				return false;
			}
			if (fSize === 0){
				Log.info("File: " + sName + " is empty!");
				this.fireFileEmpty({
					fileName: sName
				});
			}
			//check if the filename is too long and fire the corresponding event if necessary
			if (this._isFilenameTooLong(sName)) {
				this.fireFilenameLengthExceed({
					fileName: sName
				});

				return false;
			}
			//check allowed mime-types for potential mismatches
			if (aMimeTypes && aMimeTypes.length > 0) {
				var bWrongMime = true;
				for (var j = 0; j < aMimeTypes.length; j++) {
					if (sType == aMimeTypes[j] || aMimeTypes[j] == "*/*" || sType.match(aMimeTypes[j])) {
						bWrongMime = false;
					}
				}
				if (bWrongMime && sType !== "unknown") {
					Log.info("File: " + sName + " is of type " + sType + ". Allowed types are: "  + aMimeTypes + ".");
					this.fireTypeMissmatch({
						fileName: sName,
						mimeType: sType
					});

					return false;
				}
			}
			//check allowed file-types for potential mismatches
			if (aFileTypes && aFileTypes.length > 0) {
				bWrongType = true;
				iIdx = sName.lastIndexOf(".");
				sFileEnding = (iIdx === -1) ? "" : sName.substring(iIdx + 1);
				for (var k = 0; k < aFileTypes.length; k++) {
					if (sFileEnding.toLowerCase() == aFileTypes[k].toLowerCase()) {
						bWrongType = false;
					}
				}
				if (bWrongType) {
					Log.info("File: " + sName + " is of type " + sFileEnding + ". Allowed types are: "  + aFileTypes + ".");
					this.fireTypeMissmatch({
						fileName:sName,
						fileType:sFileEnding
					});

					return false;
				}
			}
		}

		return true;
	};

	/**
	 * Validate provided files from drag and drop event and send them trough XHR
	 * Be aware that this method is private and is created only for drag and drop enablement inside sap.m.UploadCollection
	 * @param {window.File[]} [aFiles] list of files from type window.File, this array is returned from input type="file" or from Drag and Drop
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @private
	 */
	FileUploader.prototype._sendFilesFromDragAndDrop = function (aFiles) {
		if (this._areFilesAllowed(aFiles)) {
			this._sendFilesWithXHR(aFiles);
		}
		return this;
	};

	/**
	 * The value in the FileUplader input is generated from this method.
	 * It contains the names of the files in quotes divided by space.
	 * @param {window.File[]} [aFiles] list with files from type window.File, this array is returned from input type="file" or from Drag and Drop
	 * @returns {string} The value of the input
	 */
	FileUploader.prototype._generateInputValue = function (aFiles) {
		var sFileString = "";

		for (var i = 0; i < aFiles.length; i++) {
			sFileString = sFileString + '"' + aFiles[i].name + '" ';
		}

		return sFileString;
	};

	/**
	 * Helper to retrieve the I18N texts for a button
	 * @private
	 */
	FileUploader.prototype._getEffectiveButtonText = function() {
		return this.getButtonText() || this.oRb.getText("FILEUPLOADER_BUTTON_TEXT");
	};

	/**
	 * Retrieves the I18N tooltip for the browse icon.
	 * @private
	 */
	 FileUploader.prototype._getBrowseIconTooltip = function() {
		if (this._selectedFileNames.length > 0) {
			return this.oRb.getText("FILEUPLOADER_VALUE_HELP_TOOLTIP");
		} else if (this.getMultiple() || this.getDirectory()) {
			return this.oRb.getText("FILEUPLOADER_DEFAULT_MULTIPLE_PLACEHOLDER");
		} else {
			return this.oRb.getText("FILEUPLOADER_DEFAULT_PLACEHOLDER");
		}
	};

	/**
	 * Checks whether the Tokenizer is present and has tokens.
	 * @private
	 * @returns {boolean} whether the Tokenizer is present and has tokens.
	 */
	FileUploader.prototype._hasTokenizer = function() {
		const oTokenizer = this._getTokenizer(),
			iTokensCount = oTokenizer ? oTokenizer.getTokens().length : 0;
		return !this.getButtonOnly() && iTokensCount > 0;
	};

	/**
	 * Getter for shortened value.
	 * @private
	 * @deprecated the value now is the short value (filename only)!
	 */
	FileUploader.prototype.getShortenValue = function() {
		return this.getValue();
	};

	/**
	 * Prepares the hidden IFrame for uploading the file (in static area).
	 * @private
	 */
	FileUploader.prototype.prepareFileUploadAndIFrame = function() {
		this._prepareFileUpload();

		if (!this.oIFrameRef) {
			// create the upload iframe
			var oIFrameRef = document.createElement("iframe");
			oIFrameRef.style.display = "none";
			/*eslint-enable no-script-url */
			oIFrameRef.id = this.getId() + "-frame";
			StaticArea.getDomRef().appendChild(oIFrameRef);
			oIFrameRef.contentWindow.name = this.getId() + "-frame";

			// sink the load event of the upload iframe
			this._bUploading = false; // flag for uploading
			jQuery(oIFrameRef).on("load", function(oEvent) {
				if (this._bUploading) {
					Log.info("File uploaded to " + this.getUploadUrl());
					var sResponse;
					try {
						sResponse = this.oIFrameRef.contentWindow.document.body.innerHTML;
					} catch (ex) {
						// in case of cross-domain submit we get a permission denied exception
						// when we try to access the body of the IFrame document
					}
					this.fireUploadComplete({"response": sResponse});
					this._bUploading = false;
				}
			}.bind(this));

			// keep the reference
			this.oIFrameRef = oIFrameRef;

		}
	};

	/**
	 * Gets all combined label IDs from both the aria-labelledby association and referencing labels.
	 * @returns {string[]} Array of label IDs that should reference this control.
	 * @private
	 */
	FileUploader.prototype._getCombinedLabelIds = function() {
		const aAriaLabelledBy = this.getAriaLabelledBy() || [],
			aReferencingLabels = LabelEnablement.getReferencingLabels(this),
			aCombinedLabels = aAriaLabelledBy.slice();

		aReferencingLabels.forEach((sLabelId) => {
			if (aCombinedLabels.indexOf(sLabelId) === -1) {
				aCombinedLabels.push(sLabelId);
			}
		});

		return aCombinedLabels;
	};

	/**
	 * Gets all aria-describedby IDs including placeholder, accessibility description, and value state.
	 * @returns {string[]} Array of IDs that should describe this control.
	 * @private
	 */
	FileUploader.prototype._getAriaDescribedByIds = function() {
		const sValueState = this.getValueState(),
			bEnabled = this.getEnabled(),
			aAriaDescribedBy = this.getAriaDescribedBy() || [],
			aDescribedByIds = aAriaDescribedBy.slice();

		// Always include the internal accessibility description
		aDescribedByIds.push(this.getId() + "-AccDescr");

		// Add value state message ID for non-None states (excluding Error)
		if (sValueState !== ValueState.None && sValueState !== ValueState.Error && bEnabled) {
			const sValueStateMessageId = this.getValueStateMessageId() + "-sr";
			if (aDescribedByIds.indexOf(sValueStateMessageId) === -1) {
				aDescribedByIds.push(sValueStateMessageId);
			}
		}

		return aDescribedByIds;
	};

	/**
	 * Prepares the accessibility attributes for the internal hidden file input.
	 * @private
	 * @returns {Array} An array of accessibility attributes.
	 */
	FileUploader.prototype._prepareAccessibilityAttributes = function() {
		const aAttributes = [],
			sValueState = this.getValueState(),
			bEnabled = this.getEnabled(),
			sAriaRoleDescription = this._getAriaRoleDescription(),
			aCombinedLabels = this._getCombinedLabelIds(),
			aAriaDescribedBy = this._getAriaDescribedByIds(),
			sTooltip = this.getTooltip_AsString(),
			sValue = this.getValue(),
			sLabel = sTooltip || sValue || this._getEffectivePlaceholder();

		if (sLabel) {
			aAttributes.push(`title="${encodeXML(sLabel)}" `);
			aAttributes.push(`aria-label="${encodeXML(sLabel)}" `);
		}

		// Aria-labelledby
		if (aCombinedLabels.length > 0) {
			aAttributes.push(`aria-labelledby="${aCombinedLabels.join(' ')}" `);
		}

		// Aria-describedby
		if (aAriaDescribedBy.length > 0) {
			aAttributes.push(`aria-describedby="${aAriaDescribedBy.join(' ')}" `);
		}

		// Value state handling
		if (sValueState === ValueState.Error && bEnabled) {
			aAttributes.push('aria-invalid="true" ');
			const sValueStateMessageId = this.getValueStateMessageId() + "-sr";
			aAttributes.push(`aria-errormessage="${sValueStateMessageId}" `);
		}

		// Required state
	if (this.getRequired() || LabelEnablement.isRequired(this)) {
			aAttributes.push('required ');
			aAttributes.push('aria-required="true" ');
		}

		// Role description for file input
		if (sAriaRoleDescription) {
			aAttributes.push(`aria-roledescription="${encodeXML(sAriaRoleDescription)}" `);
		}

		// Has popup (indicates file dialog will open)
		aAttributes.push('aria-haspopup="dialog" ');

		return aAttributes;
	};

	FileUploader.prototype._prepareFileUpload = function() {
		if (!this.oFileUpload) {
			// create the file uploader markup
			const aFileUpload = [],
				aAccessibilityAttrs = this._prepareAccessibilityAttributes();

			aFileUpload.push('<input ');
			aFileUpload.push('type="file" ');
			if (this.getName()) {
				if (this.getMultiple() || this.getDirectory()) {
					aFileUpload.push('name="' + encodeXML(this.getName()) + '[]" ');
				} else {
					aFileUpload.push('name="' + encodeXML(this.getName()) + '" ');
				}
			} else {
				if (this.getMultiple() || this.getDirectory()) {
					aFileUpload.push('name="' + this.getId() + '[]" ');
				} else {
					aFileUpload.push('name="' + this.getId() + '" ');
				}
			}
			aFileUpload.push('id="' + this.getId() + '-fu" ');
			// for IE9 the file uploader itself gets the focus to make sure that the
			// keyboard interaction works and there is no security issue - unfortunately
			// this has the negative side effect that 2 tabs are required.
			aFileUpload.push('tabindex="0" ');

			aFileUpload.push('size="1" ');

			if (!this.getEnabled()) {
				aFileUpload.push('disabled="disabled" ');
			}

			if (this.getDirectory()) {
				aFileUpload.push('webkitdirectory ');
			}

			if (this.getMultiple()) {
				aFileUpload.push('multiple ');
			}

			if ((this.getMimeType() || this.getFileType()) && window.File) {
				var sAcceptedTypes = this._getAcceptedTypes();
				aFileUpload.push('accept="' + encodeXML(sAcceptedTypes) + '" ');
			}

			aFileUpload.push(...aAccessibilityAttrs);

			aFileUpload.push('>');

			// add it into the control markup
			this.oFileUpload = jQuery(aFileUpload.join("")).prependTo(this.$().find(".sapUiFupInputMask")).get(0);
		} else {

			// move the file uploader from the static area to the control markup
			jQuery(this.oFileUpload).prependTo(this.$().find(".sapUiFupInputMask"));

		}

		if (this._bFocusFileUploader) {
			if (this.getButtonOnly()) {
				this.oBrowse.focus();
			} else {
				this.oFileUpload.focus();
			}
			this._bFocusFileUploader = false;
		}
	};

	FileUploader.prototype.openValueStateMessage = function() {
		if (this._oValueStateMessage && this.shouldValueStateMessageBeOpened()) {
			this._oValueStateMessage.open();
		}
	};

	FileUploader.prototype.closeValueStateMessage = function() {
		if (this._oValueStateMessage) {
			this._oValueStateMessage.close();
		}
	};

	FileUploader.prototype.shouldValueStateMessageBeOpened = function() {
		return this.getValueState() !== "None";
	};

	FileUploader.prototype.getValueStateMessageId = function() {
		return this.getId() + "-message";
	};

	FileUploader.prototype.getDomRefForValueStateMessage = function() {
		return this.getButtonOnly() ? this.getDomRef().querySelector(".sapMBtnInner") : this.getDomRef();
	};

	FileUploader.prototype._getAcceptedTypes = function() {
		var aMimeTypes = this.getMimeType() || [],
			aFileTypes = this.getFileType() || [];
		aFileTypes = aFileTypes.map(function(item) {
			return item.indexOf(".") === 0 ? item : "." + item;
		});
		return aFileTypes.concat(aMimeTypes).join(",");
	};

	FileUploader.prototype._resetValueAfterUploadStart = function () {
		Log.info("File uploading to " + this.getUploadUrl());
		if (this.getSameFilenameAllowed() && this.getUploadOnChange() && this.getUseMultipart()) {
			this.setValue("", true);
		}
	};

	FileUploader.prototype._getAriaRoleDescription = function() {
		return this.oRb.getText("FILEUPLOADER_ROLE_DESCRIPTION");
	};

	FileUploader.prototype._getTitleAttribute = function() {
		return this.oRb.getText("FILEUPLOADER_INPUT_TOOLTIP");
	};

	FileUploader.prototype._getEffectivePlaceholder = function() {
		return this.getPlaceholder() || this._getBrowseIconTooltip();
	};

	FileUploader.prototype._getValueStateMessageText = function() {
		const sText = this.getValueStateText(),
			sValueState = this.getValueState(),
			sValueStateTypeText = sValueState !== ValueState.Error ? `${this.oRb.getText("FILEUPLOADER_VALUE_STATE_" + sValueState.toUpperCase())} ` : "";

		if (sText) {
			return `${sValueStateTypeText}${sText}`;
		}

		// Let ValueStateMessage handle the default texts
		if (this._oValueStateMessage && this._oValueStateMessage._getValueStateText) {
			return `${sValueStateTypeText}${this._oValueStateMessage._getValueStateText(this, this.getValueState())}`;
		}

		return "";
	};

	/*
	 * Add default input type=file and label behaviour to file uploader.
	 */
	FileUploader.prototype._addLabelFeaturesToBrowse = function () {
		let $target;
		const fnBrowseClickHandler = (oEvent) => {
			oEvent.preventDefault();
			oEvent.stopPropagation();
			this.FUEl.click();
		};

		if (this.getButtonOnly() && this.oBrowse && this.oBrowse.$().length) {
			$target = this.oBrowse.$();

			if (this.oBrowse.getAriaLabelledBy()) {
				LabelEnablement.getReferencingLabels(this).forEach(function (sLabelId) {
					const $externalLabel = Element.getElementById(sLabelId).$();
					$externalLabel.off("click").on("click", fnBrowseClickHandler);
				}, this);
			}

			// Only attach click handler in button-only mode
			$target.off("click").on("click", fnBrowseClickHandler);
		} else {
			$target = this.$();
			// Do NOT attach click handler here!
			// The main click handler in onAfterRendering will handle it.
		}

		// Attach drag & drop handlers
		$target
			.off("dragover.fileuploader dragenter.fileuploader drop.fileuploader")
			.on("dragover.fileuploader", (oEvent) => {
				oEvent.preventDefault();
				oEvent.stopPropagation();
			})
			.on("dragenter.fileuploader", (oEvent) => {
				oEvent.preventDefault();
				oEvent.stopPropagation();
			})
			.on("drop.fileuploader", (oEvent) => {
				oEvent.preventDefault();
				oEvent.stopPropagation();
				var aFileList = oEvent.originalEvent.dataTransfer.files;
				if ((!this.getMultiple() && aFileList.length > 1) || this.getDirectory()) {
					return;
				}
				this.oFileUpload.files = aFileList;
				var oChangeEvent = {
					target: {
						files: aFileList
					}
				};
				this.handlechange(oChangeEvent);
			});
	};

	/**
	 * Allows to process Blobs before they get uploaded. This API can be used to create custom Blobs
	 * and upload these custom Blobs instead of the received/initials Blobs in the parameter <code>aBlobs</code>.
	 * One use case could be to create and upload zip archives based on the passed Blobs.
	 * The default implementation of this API should simply resolve with the received Blobs (parameter <code>aBlobs</code>).
	 *
	 * This API is only supported in case <code>sendXHR</code> is <code>true</code>. This means only IE10+ is supported, while IE9 and below is not.
	 *
	 * This is a default implementation of the interface <code>sap.ui.unified.IProcessableBlobs</code>.
	 *
	 * @public
	 * @since 1.52
	 * @param {Blob[]} aBlobs The initial Blobs which can be used to determine/calculate a new array of Blobs for further processing.
	 * @returns {Promise<Blob[]>} A Promise that resolves with an array of Blobs which is used for the final uploading.
	 */
	FileUploader.prototype.getProcessedBlobsFromArray = function (aBlobs){
		return new Promise(function(resolve){
			resolve(aBlobs);
		});
	};

	// If the file has been edited after it has been chosen,
	// Chrome 85 fails silently on submit, so we could
	// check if it is readable first.
	// https://stackoverflow.com/questions/61916331
	// BCP: 2070313680

	/**
	 * Checks if the chosen file is readable.
	 *
	 * @returns {Promise} A promise that resolves successfully
	 * if the chosen file can be read and fails with an error message if it cannot
	 * @public
	 */
	FileUploader.prototype.checkFileReadable = function() {
		return new Promise(function(resolve, reject) {
			var oReader;

			if (window.File && this.FUEl && this.FUEl.files.length) {
				oReader = new FileReader();
				oReader.readAsArrayBuffer(this.FUEl.files[0].slice(0, 1));

				oReader.onload = function() {
					resolve();
				};

				oReader.onerror = function() {
					reject(oReader.error);
				};
			} else {
				resolve();
			}
		}.bind(this));
	};

	return FileUploader;

});
