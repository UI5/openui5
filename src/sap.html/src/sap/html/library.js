/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/Lib", "sap/ui/base/DataType", "sap/ui/core/library"], function (Library, DataType) {
	"use strict";
	const { registerEnum } = DataType;

	/**
	 * The SAPUI5 library <code>sap.html</code> provides lightweight control wrappers for native HTML elements.
	 *
	 * With these controls you can use standard HTML tags (such as <code>&lt;div&gt;</code>, <code>&lt;span&gt;</code>, <code>&lt;form&gt;</code> or <code>&lt;input&gt;</code>) directly inside XML views and freely mix native HTML markup with regular UI5 controls, while staying within the UI5 programming model (data binding, models, event handling).
	 *
	 * @namespace
	 * @alias sap.html
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.154.0
	 * @public
	 */
	var thisLib = Library.init({
		"apiVersion": 2,
		"name": "sap.html",
		"version": "${version}",
		"dependencies": ["sap.ui.core"],
		"types": [
			"sap.html.enums.AriaRole",
			"sap.html.enums.Autocomplete",
			"sap.html.enums.Boolean",
			"sap.html.enums.ButtonType",
			"sap.html.enums.CrossOrigin",
			"sap.html.enums.Current",
			"sap.html.enums.Decision",
			"sap.html.enums.Decoding",
			"sap.html.enums.Direction",
			"sap.html.enums.EncodingType",
			"sap.html.enums.EnterKeyHint",
			"sap.html.enums.FetchPriority",
			"sap.html.enums.HasPopup",
			"sap.html.enums.InputAutocomplete",
			"sap.html.enums.InputMode",
			"sap.html.enums.InputType",
			"sap.html.enums.Invalid",
			"sap.html.enums.ListType",
			"sap.html.enums.Live",
			"sap.html.enums.Loading",
			"sap.html.enums.Method",
			"sap.html.enums.OptionalBoolean",
			"sap.html.enums.Orientation",
			"sap.html.enums.Popover",
			"sap.html.enums.ReferrerPolicy",
			"sap.html.enums.Shape",
			"sap.html.enums.Sort",
			"sap.html.enums.TableSection",
			"sap.html.enums.Toggle",
			"sap.html.enums.Tristate",
			"sap.html.enums.Wrapping"
		],
		"interfaces": [],
		"controls": [
			"sap.html.HTMLElementBase",
			"sap.html.A",
			"sap.html.Abbr",
			"sap.html.Address",
			"sap.html.Area",
			"sap.html.Article",
			"sap.html.Aside",
			"sap.html.B",
			"sap.html.Bdi",
			"sap.html.Bdo",
			"sap.html.Blockquote",
			"sap.html.Br",
			"sap.html.Button",
			"sap.html.Canvas",
			"sap.html.Caption",
			"sap.html.Cite",
			"sap.html.Code",
			"sap.html.Col",
			"sap.html.Colgroup",
			"sap.html.Data",
			"sap.html.Datalist",
			"sap.html.Dd",
			"sap.html.Del",
			"sap.html.Details",
			"sap.html.Dfn",
			"sap.html.Div",
			"sap.html.Dl",
			"sap.html.Dt",
			"sap.html.Em",
			"sap.html.Fieldset",
			"sap.html.Figcaption",
			"sap.html.Figure",
			"sap.html.Footer",
			"sap.html.Form",
			"sap.html.H1",
			"sap.html.H2",
			"sap.html.H3",
			"sap.html.H4",
			"sap.html.H5",
			"sap.html.H6",
			"sap.html.Header",
			"sap.html.Hgroup",
			"sap.html.Hr",
			"sap.html.I",
			"sap.html.Img",
			"sap.html.Input",
			"sap.html.Ins",
			"sap.html.Kbd",
			"sap.html.Label",
			"sap.html.Legend",
			"sap.html.Li",
			"sap.html.Main",
			"sap.html.Map",
			"sap.html.Mark",
			"sap.html.Menu",
			"sap.html.Meter",
			"sap.html.Nav",
			"sap.html.Ol",
			"sap.html.Optgroup",
			"sap.html.Option",
			"sap.html.Output",
			"sap.html.P",
			"sap.html.Pre",
			"sap.html.Progress",
			"sap.html.Q",
			"sap.html.Rp",
			"sap.html.Rt",
			"sap.html.Ruby",
			"sap.html.S",
			"sap.html.Samp",
			"sap.html.Search",
			"sap.html.Section",
			"sap.html.Select",
			"sap.html.Selectedcontent",
			"sap.html.Small",
			"sap.html.Span",
			"sap.html.Strong",
			"sap.html.Sub",
			"sap.html.Summary",
			"sap.html.Sup",
			"sap.html.Table",
			"sap.html.Tbody",
			"sap.html.Td",
			"sap.html.Textarea",
			"sap.html.Tfoot",
			"sap.html.Th",
			"sap.html.Thead",
			"sap.html.Time",
			"sap.html.Tr",
			"sap.html.U",
			"sap.html.Ul",
			"sap.html.Var",
			"sap.html.Wbr"
		],
		"elements": [],
		"noLibraryCSS": true
	});

	thisLib.enums = {};

	// Enums
	/**
	 * Enum for AriaRole
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.AriaRole = {
		/**
		 * alert
		 *
		 * @public
		 */
		"alert": "alert",
		/**
		 * alertdialog
		 *
		 * @public
		 */
		"alertdialog": "alertdialog",
		/**
		 * application
		 *
		 * @public
		 */
		"application": "application",
		/**
		 * article
		 *
		 * @public
		 */
		"article": "article",
		/**
		 * banner
		 *
		 * @public
		 */
		"banner": "banner",
		/**
		 * blockquote
		 *
		 * @public
		 */
		"blockquote": "blockquote",
		/**
		 * button
		 *
		 * @public
		 */
		"button": "button",
		/**
		 * caption
		 *
		 * @public
		 */
		"caption": "caption",
		/**
		 * cell
		 *
		 * @public
		 */
		"cell": "cell",
		/**
		 * checkbox
		 *
		 * @public
		 */
		"checkbox": "checkbox",
		/**
		 * code
		 *
		 * @public
		 */
		"code": "code",
		/**
		 * columnheader
		 *
		 * @public
		 */
		"columnheader": "columnheader",
		/**
		 * combobox
		 *
		 * @public
		 */
		"combobox": "combobox",
		/**
		 * complementary
		 *
		 * @public
		 */
		"complementary": "complementary",
		/**
		 * contentinfo
		 *
		 * @public
		 */
		"contentinfo": "contentinfo",
		/**
		 * definition
		 *
		 * @public
		 */
		"definition": "definition",
		/**
		 * deletion
		 *
		 * @public
		 */
		"deletion": "deletion",
		/**
		 * dialog
		 *
		 * @public
		 */
		"dialog": "dialog",
		/**
		 * directory
		 *
		 * @public
		 */
		"directory": "directory",
		/**
		 * doc-abstract
		 *
		 * @public
		 */
		"doc-abstract": "doc-abstract",
		/**
		 * doc-acknowledgments
		 *
		 * @public
		 */
		"doc-acknowledgments": "doc-acknowledgments",
		/**
		 * doc-afterword
		 *
		 * @public
		 */
		"doc-afterword": "doc-afterword",
		/**
		 * doc-appendix
		 *
		 * @public
		 */
		"doc-appendix": "doc-appendix",
		/**
		 * doc-backlink
		 *
		 * @public
		 */
		"doc-backlink": "doc-backlink",
		/**
		 * doc-biblioentry
		 *
		 * @public
		 */
		"doc-biblioentry": "doc-biblioentry",
		/**
		 * doc-bibliography
		 *
		 * @public
		 */
		"doc-bibliography": "doc-bibliography",
		/**
		 * doc-biblioref
		 *
		 * @public
		 */
		"doc-biblioref": "doc-biblioref",
		/**
		 * doc-chapter
		 *
		 * @public
		 */
		"doc-chapter": "doc-chapter",
		/**
		 * doc-colophon
		 *
		 * @public
		 */
		"doc-colophon": "doc-colophon",
		/**
		 * doc-conclusion
		 *
		 * @public
		 */
		"doc-conclusion": "doc-conclusion",
		/**
		 * doc-cover
		 *
		 * @public
		 */
		"doc-cover": "doc-cover",
		/**
		 * doc-credit
		 *
		 * @public
		 */
		"doc-credit": "doc-credit",
		/**
		 * doc-credits
		 *
		 * @public
		 */
		"doc-credits": "doc-credits",
		/**
		 * doc-dedication
		 *
		 * @public
		 */
		"doc-dedication": "doc-dedication",
		/**
		 * doc-endnote
		 *
		 * @public
		 */
		"doc-endnote": "doc-endnote",
		/**
		 * doc-endnotes
		 *
		 * @public
		 */
		"doc-endnotes": "doc-endnotes",
		/**
		 * doc-epigraph
		 *
		 * @public
		 */
		"doc-epigraph": "doc-epigraph",
		/**
		 * doc-epilogue
		 *
		 * @public
		 */
		"doc-epilogue": "doc-epilogue",
		/**
		 * doc-errata
		 *
		 * @public
		 */
		"doc-errata": "doc-errata",
		/**
		 * doc-example
		 *
		 * @public
		 */
		"doc-example": "doc-example",
		/**
		 * doc-footnote
		 *
		 * @public
		 */
		"doc-footnote": "doc-footnote",
		/**
		 * doc-foreword
		 *
		 * @public
		 */
		"doc-foreword": "doc-foreword",
		/**
		 * doc-glossary
		 *
		 * @public
		 */
		"doc-glossary": "doc-glossary",
		/**
		 * doc-glossref
		 *
		 * @public
		 */
		"doc-glossref": "doc-glossref",
		/**
		 * doc-index
		 *
		 * @public
		 */
		"doc-index": "doc-index",
		/**
		 * doc-introduction
		 *
		 * @public
		 */
		"doc-introduction": "doc-introduction",
		/**
		 * doc-noteref
		 *
		 * @public
		 */
		"doc-noteref": "doc-noteref",
		/**
		 * doc-notice
		 *
		 * @public
		 */
		"doc-notice": "doc-notice",
		/**
		 * doc-pagebreak
		 *
		 * @public
		 */
		"doc-pagebreak": "doc-pagebreak",
		/**
		 * doc-pagelist
		 *
		 * @public
		 */
		"doc-pagelist": "doc-pagelist",
		/**
		 * doc-part
		 *
		 * @public
		 */
		"doc-part": "doc-part",
		/**
		 * doc-preface
		 *
		 * @public
		 */
		"doc-preface": "doc-preface",
		/**
		 * doc-prologue
		 *
		 * @public
		 */
		"doc-prologue": "doc-prologue",
		/**
		 * doc-pullquote
		 *
		 * @public
		 */
		"doc-pullquote": "doc-pullquote",
		/**
		 * doc-qna
		 *
		 * @public
		 */
		"doc-qna": "doc-qna",
		/**
		 * doc-subtitle
		 *
		 * @public
		 */
		"doc-subtitle": "doc-subtitle",
		/**
		 * doc-tip
		 *
		 * @public
		 */
		"doc-tip": "doc-tip",
		/**
		 * doc-toc
		 *
		 * @public
		 */
		"doc-toc": "doc-toc",
		/**
		 * document
		 *
		 * @public
		 */
		"document": "document",
		/**
		 * emphasis
		 *
		 * @public
		 */
		"emphasis": "emphasis",
		/**
		 * feed
		 *
		 * @public
		 */
		"feed": "feed",
		/**
		 * figure
		 *
		 * @public
		 */
		"figure": "figure",
		/**
		 * form
		 *
		 * @public
		 */
		"form": "form",
		/**
		 * generic
		 *
		 * @public
		 */
		"generic": "generic",
		/**
		 * grid
		 *
		 * @public
		 */
		"grid": "grid",
		/**
		 * gridcell
		 *
		 * @public
		 */
		"gridcell": "gridcell",
		/**
		 * group
		 *
		 * @public
		 */
		"group": "group",
		/**
		 * heading
		 *
		 * @public
		 */
		"heading": "heading",
		/**
		 * img
		 *
		 * @public
		 */
		"img": "img",
		/**
		 * insertion
		 *
		 * @public
		 */
		"insertion": "insertion",
		/**
		 * link
		 *
		 * @public
		 */
		"link": "link",
		/**
		 * list
		 *
		 * @public
		 */
		"list": "list",
		/**
		 * listbox
		 *
		 * @public
		 */
		"listbox": "listbox",
		/**
		 * listitem
		 *
		 * @public
		 */
		"listitem": "listitem",
		/**
		 * log
		 *
		 * @public
		 */
		"log": "log",
		/**
		 * main
		 *
		 * @public
		 */
		"main": "main",
		/**
		 * marquee
		 *
		 * @public
		 */
		"marquee": "marquee",
		/**
		 * math
		 *
		 * @public
		 */
		"math": "math",
		/**
		 * menu
		 *
		 * @public
		 */
		"menu": "menu",
		/**
		 * menubar
		 *
		 * @public
		 */
		"menubar": "menubar",
		/**
		 * menuitem
		 *
		 * @public
		 */
		"menuitem": "menuitem",
		/**
		 * menuitemcheckbox
		 *
		 * @public
		 */
		"menuitemcheckbox": "menuitemcheckbox",
		/**
		 * menuitemradio
		 *
		 * @public
		 */
		"menuitemradio": "menuitemradio",
		/**
		 * navigation
		 *
		 * @public
		 */
		"navigation": "navigation",
		/**
		 * none
		 *
		 * @public
		 */
		"none": "none",
		/**
		 * note
		 *
		 * @public
		 */
		"note": "note",
		/**
		 * option
		 *
		 * @public
		 */
		"option": "option",
		/**
		 * paragraph
		 *
		 * @public
		 */
		"paragraph": "paragraph",
		/**
		 * presentation
		 *
		 * @public
		 */
		"presentation": "presentation",
		/**
		 * progressbar
		 *
		 * @public
		 */
		"progressbar": "progressbar",
		/**
		 * radio
		 *
		 * @public
		 */
		"radio": "radio",
		/**
		 * radiogroup
		 *
		 * @public
		 */
		"radiogroup": "radiogroup",
		/**
		 * region
		 *
		 * @public
		 */
		"region": "region",
		/**
		 * row
		 *
		 * @public
		 */
		"row": "row",
		/**
		 * rowgroup
		 *
		 * @public
		 */
		"rowgroup": "rowgroup",
		/**
		 * rowheader
		 *
		 * @public
		 */
		"rowheader": "rowheader",
		/**
		 * scrollbar
		 *
		 * @public
		 */
		"scrollbar": "scrollbar",
		/**
		 * search
		 *
		 * @public
		 */
		"search": "search",
		/**
		 * searchbox
		 *
		 * @public
		 */
		"searchbox": "searchbox",
		/**
		 * separator
		 *
		 * @public
		 */
		"separator": "separator",
		/**
		 * slider
		 *
		 * @public
		 */
		"slider": "slider",
		/**
		 * spinbutton
		 *
		 * @public
		 */
		"spinbutton": "spinbutton",
		/**
		 * status
		 *
		 * @public
		 */
		"status": "status",
		/**
		 * strong
		 *
		 * @public
		 */
		"strong": "strong",
		/**
		 * subscript
		 *
		 * @public
		 */
		"subscript": "subscript",
		/**
		 * superscript
		 *
		 * @public
		 */
		"superscript": "superscript",
		/**
		 * switch
		 *
		 * @public
		 */
		"switch": "switch",
		/**
		 * tab
		 *
		 * @public
		 */
		"tab": "tab",
		/**
		 * table
		 *
		 * @public
		 */
		"table": "table",
		/**
		 * tablist
		 *
		 * @public
		 */
		"tablist": "tablist",
		/**
		 * tabpanel
		 *
		 * @public
		 */
		"tabpanel": "tabpanel",
		/**
		 * term
		 *
		 * @public
		 */
		"term": "term",
		/**
		 * text
		 *
		 * @public
		 */
		"text": "text",
		/**
		 * textbox
		 *
		 * @public
		 */
		"textbox": "textbox",
		/**
		 * time
		 *
		 * @public
		 */
		"time": "time",
		/**
		 * timer
		 *
		 * @public
		 */
		"timer": "timer",
		/**
		 * toolbar
		 *
		 * @public
		 */
		"toolbar": "toolbar",
		/**
		 * tooltip
		 *
		 * @public
		 */
		"tooltip": "tooltip",
		/**
		 * tree
		 *
		 * @public
		 */
		"tree": "tree",
		/**
		 * treegrid
		 *
		 * @public
		 */
		"treegrid": "treegrid",
		/**
		 * treeitem
		 *
		 * @public
		 */
		"treeitem": "treeitem"
	};
	registerEnum("sap.html.enums.AriaRole", thisLib.enums.AriaRole);
	/**
	 * Enum for Autocomplete
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Autocomplete = {
		/**
		 * both
		 *
		 * @public
		 */
		"both": "both",
		/**
		 * inline
		 *
		 * @public
		 */
		"inline": "inline",
		/**
		 * list
		 *
		 * @public
		 */
		"list": "list",
		/**
		 * none
		 *
		 * @public
		 */
		"none": "none"
	};
	registerEnum("sap.html.enums.Autocomplete", thisLib.enums.Autocomplete);
	/**
	 * Enum for Boolean
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Boolean = {
		/**
		 * false
		 *
		 * @public
		 */
		"false": "false",
		/**
		 * true
		 *
		 * @public
		 */
		"true": "true"
	};
	registerEnum("sap.html.enums.Boolean", thisLib.enums.Boolean);
	/**
	 * Enum for ButtonType
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.ButtonType = {
		/**
		 * button
		 *
		 * @public
		 */
		"button": "button",
		/**
		 * reset
		 *
		 * @public
		 */
		"reset": "reset",
		/**
		 * submit
		 *
		 * @public
		 */
		"submit": "submit"
	};
	registerEnum("sap.html.enums.ButtonType", thisLib.enums.ButtonType);
	/**
	 * Enum for CrossOrigin
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.CrossOrigin = {
		/**
		 * anonymous
		 *
		 * @public
		 */
		"anonymous": "anonymous",
		/**
		 * use-credentials
		 *
		 * @public
		 */
		"use-credentials": "use-credentials"
	};
	registerEnum("sap.html.enums.CrossOrigin", thisLib.enums.CrossOrigin);
	/**
	 * Enum for Current
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Current = {
		/**
		 * date
		 *
		 * @public
		 */
		"date": "date",
		/**
		 * false
		 *
		 * @public
		 */
		"false": "false",
		/**
		 * location
		 *
		 * @public
		 */
		"location": "location",
		/**
		 * page
		 *
		 * @public
		 */
		"page": "page",
		/**
		 * step
		 *
		 * @public
		 */
		"step": "step",
		/**
		 * time
		 *
		 * @public
		 */
		"time": "time",
		/**
		 * true
		 *
		 * @public
		 */
		"true": "true"
	};
	registerEnum("sap.html.enums.Current", thisLib.enums.Current);
	/**
	 * Enum for Decision
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Decision = {
		/**
		 * no
		 *
		 * @public
		 */
		"no": "no",
		/**
		 * yes
		 *
		 * @public
		 */
		"yes": "yes"
	};
	registerEnum("sap.html.enums.Decision", thisLib.enums.Decision);
	/**
	 * Enum for Decoding
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Decoding = {
		/**
		 * async
		 *
		 * @public
		 */
		"async": "async",
		/**
		 * auto
		 *
		 * @public
		 */
		"auto": "auto",
		/**
		 * sync
		 *
		 * @public
		 */
		"sync": "sync"
	};
	registerEnum("sap.html.enums.Decoding", thisLib.enums.Decoding);
	/**
	 * Enum for Direction
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Direction = {
		/**
		 * auto
		 *
		 * @public
		 */
		"auto": "auto",
		/**
		 * ltr
		 *
		 * @public
		 */
		"ltr": "ltr",
		/**
		 * rtl
		 *
		 * @public
		 */
		"rtl": "rtl"
	};
	registerEnum("sap.html.enums.Direction", thisLib.enums.Direction);
	/**
	 * Enum for EncodingType
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.EncodingType = {
		/**
		 * application/x-www-form-urlencoded
		 *
		 * @public
		 */
		"application/x-www-form-urlencoded": "application/x-www-form-urlencoded",
		/**
		 * multipart/form-data
		 *
		 * @public
		 */
		"multipart/form-data": "multipart/form-data",
		/**
		 * text/plain
		 *
		 * @public
		 */
		"text/plain": "text/plain"
	};
	registerEnum("sap.html.enums.EncodingType", thisLib.enums.EncodingType);
	/**
	 * Enum for EnterKeyHint
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.EnterKeyHint = {
		/**
		 * done
		 *
		 * @public
		 */
		"done": "done",
		/**
		 * enter
		 *
		 * @public
		 */
		"enter": "enter",
		/**
		 * go
		 *
		 * @public
		 */
		"go": "go",
		/**
		 * next
		 *
		 * @public
		 */
		"next": "next",
		/**
		 * previous
		 *
		 * @public
		 */
		"previous": "previous",
		/**
		 * search
		 *
		 * @public
		 */
		"search": "search",
		/**
		 * send
		 *
		 * @public
		 */
		"send": "send"
	};
	registerEnum("sap.html.enums.EnterKeyHint", thisLib.enums.EnterKeyHint);
	/**
	 * Enum for FetchPriority
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.FetchPriority = {
		/**
		 * auto
		 *
		 * @public
		 */
		"auto": "auto",
		/**
		 * high
		 *
		 * @public
		 */
		"high": "high",
		/**
		 * low
		 *
		 * @public
		 */
		"low": "low"
	};
	registerEnum("sap.html.enums.FetchPriority", thisLib.enums.FetchPriority);
	/**
	 * Enum for HasPopup
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.HasPopup = {
		/**
		 * Indicates the popup is a dialog.
		 *
		 * @public
		 */
		"dialog": "dialog",
		/**
		 * (default) Indicates the element does not have a popup.
		 *
		 * @public
		 */
		"false": "false",
		/**
		 * Indicates the popup is a grid.
		 *
		 * @public
		 */
		"grid": "grid",
		/**
		 * Indicates the popup is a listbox.
		 *
		 * @public
		 */
		"listbox": "listbox",
		/**
		 * Indicates the popup is a menu.
		 *
		 * @public
		 */
		"menu": "menu",
		/**
		 * Indicates the popup is a tree.
		 *
		 * @public
		 */
		"tree": "tree",
		/**
		 * Indicates the popup is a menu.
		 *
		 * @public
		 */
		"true": "true"
	};
	registerEnum("sap.html.enums.HasPopup", thisLib.enums.HasPopup);
	/**
	 * Enum for InputAutocomplete
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.InputAutocomplete = {
		/**
		 * additional-name
		 *
		 * @public
		 */
		"additional-name": "additional-name",
		/**
		 * address-level1
		 *
		 * @public
		 */
		"address-level1": "address-level1",
		/**
		 * address-level2
		 *
		 * @public
		 */
		"address-level2": "address-level2",
		/**
		 * address-level3
		 *
		 * @public
		 */
		"address-level3": "address-level3",
		/**
		 * address-level4
		 *
		 * @public
		 */
		"address-level4": "address-level4",
		/**
		 * address-line1
		 *
		 * @public
		 */
		"address-line1": "address-line1",
		/**
		 * address-line2
		 *
		 * @public
		 */
		"address-line2": "address-line2",
		/**
		 * address-line3
		 *
		 * @public
		 */
		"address-line3": "address-line3",
		/**
		 * bday
		 *
		 * @public
		 */
		"bday": "bday",
		/**
		 * bday-day
		 *
		 * @public
		 */
		"bday-day": "bday-day",
		/**
		 * bday-month
		 *
		 * @public
		 */
		"bday-month": "bday-month",
		/**
		 * bday-year
		 *
		 * @public
		 */
		"bday-year": "bday-year",
		/**
		 * billing
		 *
		 * @public
		 */
		"billing": "billing",
		/**
		 * cc-additional-name
		 *
		 * @public
		 */
		"cc-additional-name": "cc-additional-name",
		/**
		 * cc-csc
		 *
		 * @public
		 */
		"cc-csc": "cc-csc",
		/**
		 * cc-exp
		 *
		 * @public
		 */
		"cc-exp": "cc-exp",
		/**
		 * cc-exp-month
		 *
		 * @public
		 */
		"cc-exp-month": "cc-exp-month",
		/**
		 * cc-exp-year
		 *
		 * @public
		 */
		"cc-exp-year": "cc-exp-year",
		/**
		 * cc-family-name
		 *
		 * @public
		 */
		"cc-family-name": "cc-family-name",
		/**
		 * cc-given-name
		 *
		 * @public
		 */
		"cc-given-name": "cc-given-name",
		/**
		 * cc-name
		 *
		 * @public
		 */
		"cc-name": "cc-name",
		/**
		 * cc-number
		 *
		 * @public
		 */
		"cc-number": "cc-number",
		/**
		 * cc-type
		 *
		 * @public
		 */
		"cc-type": "cc-type",
		/**
		 * country
		 *
		 * @public
		 */
		"country": "country",
		/**
		 * country-name
		 *
		 * @public
		 */
		"country-name": "country-name",
		/**
		 * current-password
		 *
		 * @public
		 */
		"current-password": "current-password",
		/**
		 * email
		 *
		 * @public
		 */
		"email": "email",
		/**
		 * family-name
		 *
		 * @public
		 */
		"family-name": "family-name",
		/**
		 * fax
		 *
		 * @public
		 */
		"fax": "fax",
		/**
		 * given-name
		 *
		 * @public
		 */
		"given-name": "given-name",
		/**
		 * home
		 *
		 * @public
		 */
		"home": "home",
		/**
		 * honorific-prefix
		 *
		 * @public
		 */
		"honorific-prefix": "honorific-prefix",
		/**
		 * honorific-suffix
		 *
		 * @public
		 */
		"honorific-suffix": "honorific-suffix",
		/**
		 * impp
		 *
		 * @public
		 */
		"impp": "impp",
		/**
		 * language
		 *
		 * @public
		 */
		"language": "language",
		/**
		 * mobile
		 *
		 * @public
		 */
		"mobile": "mobile",
		/**
		 * name
		 *
		 * @public
		 */
		"name": "name",
		/**
		 * new-password
		 *
		 * @public
		 */
		"new-password": "new-password",
		/**
		 * nickname
		 *
		 * @public
		 */
		"nickname": "nickname",
		/**
		 * off
		 *
		 * @public
		 */
		"off": "off",
		/**
		 * on
		 *
		 * @public
		 */
		"on": "on",
		/**
		 * one-time-code
		 *
		 * @public
		 */
		"one-time-code": "one-time-code",
		/**
		 * organization
		 *
		 * @public
		 */
		"organization": "organization",
		/**
		 * organization-title
		 *
		 * @public
		 */
		"organization-title": "organization-title",
		/**
		 * pager
		 *
		 * @public
		 */
		"pager": "pager",
		/**
		 * photo
		 *
		 * @public
		 */
		"photo": "photo",
		/**
		 * postal-code
		 *
		 * @public
		 */
		"postal-code": "postal-code",
		/**
		 * sex
		 *
		 * @public
		 */
		"sex": "sex",
		/**
		 * shipping
		 *
		 * @public
		 */
		"shipping": "shipping",
		/**
		 * street-address
		 *
		 * @public
		 */
		"street-address": "street-address",
		/**
		 * tel
		 *
		 * @public
		 */
		"tel": "tel",
		/**
		 * tel-area-code
		 *
		 * @public
		 */
		"tel-area-code": "tel-area-code",
		/**
		 * tel-country-code
		 *
		 * @public
		 */
		"tel-country-code": "tel-country-code",
		/**
		 * tel-extension
		 *
		 * @public
		 */
		"tel-extension": "tel-extension",
		/**
		 * tel-local
		 *
		 * @public
		 */
		"tel-local": "tel-local",
		/**
		 * tel-local-prefix
		 *
		 * @public
		 */
		"tel-local-prefix": "tel-local-prefix",
		/**
		 * tel-local-suffix
		 *
		 * @public
		 */
		"tel-local-suffix": "tel-local-suffix",
		/**
		 * tel-national
		 *
		 * @public
		 */
		"tel-national": "tel-national",
		/**
		 * transaction-amount
		 *
		 * @public
		 */
		"transaction-amount": "transaction-amount",
		/**
		 * transaction-currency
		 *
		 * @public
		 */
		"transaction-currency": "transaction-currency",
		/**
		 * url
		 *
		 * @public
		 */
		"url": "url",
		/**
		 * username
		 *
		 * @public
		 */
		"username": "username",
		/**
		 * webauthn
		 *
		 * @public
		 */
		"webauthn": "webauthn",
		/**
		 * work
		 *
		 * @public
		 */
		"work": "work"
	};
	registerEnum("sap.html.enums.InputAutocomplete", thisLib.enums.InputAutocomplete);
	/**
	 * Enum for InputMode
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.InputMode = {
		/**
		 * decimal
		 *
		 * @public
		 */
		"decimal": "decimal",
		/**
		 * email
		 *
		 * @public
		 */
		"email": "email",
		/**
		 * none
		 *
		 * @public
		 */
		"none": "none",
		/**
		 * numeric
		 *
		 * @public
		 */
		"numeric": "numeric",
		/**
		 * search
		 *
		 * @public
		 */
		"search": "search",
		/**
		 * tel
		 *
		 * @public
		 */
		"tel": "tel",
		/**
		 * text
		 *
		 * @public
		 */
		"text": "text",
		/**
		 * url
		 *
		 * @public
		 */
		"url": "url"
	};
	registerEnum("sap.html.enums.InputMode", thisLib.enums.InputMode);
	/**
	 * Enum for InputType
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.InputType = {
		/**
		 * button
		 *
		 * @public
		 */
		"button": "button",
		/**
		 * checkbox
		 *
		 * @public
		 */
		"checkbox": "checkbox",
		/**
		 * color
		 *
		 * @public
		 */
		"color": "color",
		/**
		 * date
		 *
		 * @public
		 */
		"date": "date",
		/**
		 * datetime-local
		 *
		 * @public
		 */
		"datetime-local": "datetime-local",
		/**
		 * email
		 *
		 * @public
		 */
		"email": "email",
		/**
		 * file
		 *
		 * @public
		 */
		"file": "file",
		/**
		 * hidden
		 *
		 * @public
		 */
		"hidden": "hidden",
		/**
		 * image
		 *
		 * @public
		 */
		"image": "image",
		/**
		 * month
		 *
		 * @public
		 */
		"month": "month",
		/**
		 * number
		 *
		 * @public
		 */
		"number": "number",
		/**
		 * password
		 *
		 * @public
		 */
		"password": "password",
		/**
		 * radio
		 *
		 * @public
		 */
		"radio": "radio",
		/**
		 * range
		 *
		 * @public
		 */
		"range": "range",
		/**
		 * reset
		 *
		 * @public
		 */
		"reset": "reset",
		/**
		 * search
		 *
		 * @public
		 */
		"search": "search",
		/**
		 * submit
		 *
		 * @public
		 */
		"submit": "submit",
		/**
		 * tel
		 *
		 * @public
		 */
		"tel": "tel",
		/**
		 * text
		 *
		 * @public
		 */
		"text": "text",
		/**
		 * time
		 *
		 * @public
		 */
		"time": "time",
		/**
		 * url
		 *
		 * @public
		 */
		"url": "url",
		/**
		 * week
		 *
		 * @public
		 */
		"week": "week"
	};
	registerEnum("sap.html.enums.InputType", thisLib.enums.InputType);
	/**
	 * Enum for Invalid
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Invalid = {
		/**
		 * false
		 *
		 * @public
		 */
		"false": "false",
		/**
		 * grammar
		 *
		 * @public
		 */
		"grammar": "grammar",
		/**
		 * spelling
		 *
		 * @public
		 */
		"spelling": "spelling",
		/**
		 * true
		 *
		 * @public
		 */
		"true": "true"
	};
	registerEnum("sap.html.enums.Invalid", thisLib.enums.Invalid);
	/**
	 * Enum for ListType
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.ListType = {
		/**
		 * a
		 *
		 * @public
		 */
		"a": "a",
		/**
		 * A
		 *
		 * @public
		 */
		"A": "A",
		/**
		 * i
		 *
		 * @public
		 */
		"i": "i",
		/**
		 * I
		 *
		 * @public
		 */
		"I": "I"
	};
	thisLib.enums.ListType["1"] = "1";
	registerEnum("sap.html.enums.ListType", thisLib.enums.ListType);
	/**
	 * Enum for Live
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Live = {
		/**
		 * assertive
		 *
		 * @public
		 */
		"assertive": "assertive",
		/**
		 * off
		 *
		 * @public
		 */
		"off": "off",
		/**
		 * polite
		 *
		 * @public
		 */
		"polite": "polite"
	};
	registerEnum("sap.html.enums.Live", thisLib.enums.Live);
	/**
	 * Enum for Loading
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Loading = {
		/**
		 * Loads the image immediately, regardless of whether or not the image is currently within the visible viewport (this is the default value).
		 *
		 * @public
		 */
		"eager": "eager",
		/**
		 * Defers loading the image until it reaches a calculated distance from the viewport, as defined by the browser. The intent is to avoid the network and storage bandwidth needed to handle the image until it&#x27;s reasonably certain that it will be needed. This generally improves the performance of the content in most typical use cases.
		 *
		 * @public
		 */
		"lazy": "lazy"
	};
	registerEnum("sap.html.enums.Loading", thisLib.enums.Loading);
	/**
	 * Enum for Method
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Method = {
		/**
		 * Use when the form is inside a [&#x60;&lt;dialog&gt;&#x60;](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) element to close the dialog when submitted.
		 *
		 * @public
		 */
		"dialog": "dialog",
		/**
		 * Corresponds to the HTTP [GET method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.3); form data are appended to the &#x60;action&#x60; attribute URI with a &#x27;?&#x27; as separator, and the resulting URI is sent to the server. Use this method when the form has no side-effects and contains only ASCII characters.
		 *
		 * @public
		 */
		"get": "get",
		/**
		 * Corresponds to the HTTP [POST method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5); form data are included in the body of the form and sent to the server.
		 *
		 * @public
		 */
		"post": "post"
	};
	registerEnum("sap.html.enums.Method", thisLib.enums.Method);
	/**
	 * Enum for OptionalBoolean
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.OptionalBoolean = {
		/**
		 * false
		 *
		 * @public
		 */
		"false": "false",
		/**
		 * true
		 *
		 * @public
		 */
		"true": "true"
	};
	registerEnum("sap.html.enums.OptionalBoolean", thisLib.enums.OptionalBoolean);
	/**
	 * Enum for Orientation
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Orientation = {
		/**
		 * horizontal
		 *
		 * @public
		 */
		"horizontal": "horizontal",
		/**
		 * vertical
		 *
		 * @public
		 */
		"vertical": "vertical"
	};
	registerEnum("sap.html.enums.Orientation", thisLib.enums.Orientation);
	/**
	 * Enum for Popover
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Popover = {
		/**
		 * auto
		 *
		 * @public
		 */
		"auto": "auto",
		/**
		 * hint
		 *
		 * @public
		 */
		"hint": "hint",
		/**
		 * manual
		 *
		 * @public
		 */
		"manual": "manual"
	};
	registerEnum("sap.html.enums.Popover", thisLib.enums.Popover);
	/**
	 * Enum for ReferrerPolicy
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.ReferrerPolicy = {
		/**
		 * no-referrer
		 *
		 * @public
		 */
		"no-referrer": "no-referrer",
		/**
		 * no-referrer-when-downgrade
		 *
		 * @public
		 */
		"no-referrer-when-downgrade": "no-referrer-when-downgrade",
		/**
		 * origin
		 *
		 * @public
		 */
		"origin": "origin",
		/**
		 * origin-when-cross-origin
		 *
		 * @public
		 */
		"origin-when-cross-origin": "origin-when-cross-origin",
		/**
		 * same-origin
		 *
		 * @public
		 */
		"same-origin": "same-origin",
		/**
		 * strict-origin
		 *
		 * @public
		 */
		"strict-origin": "strict-origin",
		/**
		 * strict-origin-when-cross-origin
		 *
		 * @public
		 */
		"strict-origin-when-cross-origin": "strict-origin-when-cross-origin",
		/**
		 * unsafe-url
		 *
		 * @public
		 */
		"unsafe-url": "unsafe-url"
	};
	registerEnum("sap.html.enums.ReferrerPolicy", thisLib.enums.ReferrerPolicy);
	/**
	 * Enum for Shape
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Shape = {
		/**
		 * circle
		 *
		 * @public
		 */
		"circle": "circle",
		/**
		 * default
		 *
		 * @public
		 */
		"default": "default",
		/**
		 * poly
		 *
		 * @public
		 */
		"poly": "poly",
		/**
		 * rect
		 *
		 * @public
		 */
		"rect": "rect"
	};
	registerEnum("sap.html.enums.Shape", thisLib.enums.Shape);
	/**
	 * Enum for Sort
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Sort = {
		/**
		 * ascending
		 *
		 * @public
		 */
		"ascending": "ascending",
		/**
		 * descending
		 *
		 * @public
		 */
		"descending": "descending",
		/**
		 * none
		 *
		 * @public
		 */
		"none": "none",
		/**
		 * other
		 *
		 * @public
		 */
		"other": "other"
	};
	registerEnum("sap.html.enums.Sort", thisLib.enums.Sort);
	/**
	 * Enum for TableSection
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.TableSection = {
		/**
		 * auto
		 *
		 * @public
		 */
		"auto": "auto",
		/**
		 * col
		 *
		 * @public
		 */
		"col": "col",
		/**
		 * colgroup
		 *
		 * @public
		 */
		"colgroup": "colgroup",
		/**
		 * row
		 *
		 * @public
		 */
		"row": "row",
		/**
		 * rowgroup
		 *
		 * @public
		 */
		"rowgroup": "rowgroup"
	};
	registerEnum("sap.html.enums.TableSection", thisLib.enums.TableSection);
	/**
	 * Enum for Toggle
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Toggle = {
		/**
		 * off
		 *
		 * @public
		 */
		"off": "off",
		/**
		 * on
		 *
		 * @public
		 */
		"on": "on"
	};
	registerEnum("sap.html.enums.Toggle", thisLib.enums.Toggle);
	/**
	 * Enum for Tristate
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Tristate = {
		/**
		 * false
		 *
		 * @public
		 */
		"false": "false",
		/**
		 * mixed
		 *
		 * @public
		 */
		"mixed": "mixed",
		/**
		 * true
		 *
		 * @public
		 */
		"true": "true"
	};
	registerEnum("sap.html.enums.Tristate", thisLib.enums.Tristate);
	/**
	 * Enum for Wrapping
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.enums.Wrapping = {
		/**
		 * hard
		 *
		 * @public
		 */
		"hard": "hard",
		/**
		 * soft
		 *
		 * @public
		 */
		"soft": "soft"
	};
	registerEnum("sap.html.enums.Wrapping", thisLib.enums.Wrapping);

	return thisLib;
});
