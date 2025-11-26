/*!
 * ${copyright}
 */
sap.ui.define(
  ["sap/f/thirdparty/webcomponents", "sap/ui/base/DataType", "sap/f/gen/ui5/webcomponents_base"],
  function (WebCPackage, DataType) {
    "use strict";
    const { registerEnum } = DataType;

    // re-export package object
    const pkg = Object.assign({}, WebCPackage);

    // export the UI5 metadata along with the package
    pkg["_ui5metadata"] = {
      name: "sap/f/gen/ui5/webcomponents",
      version: "2.15.0",
      dependencies: ["sap.ui.core"],
      types: [
        "sap.f.gen.ui5.webcomponents.AvatarColorScheme",
        "sap.f.gen.ui5.webcomponents.AvatarGroupType",
        "sap.f.gen.ui5.webcomponents.AvatarShape",
        "sap.f.gen.ui5.webcomponents.AvatarSize",
        "sap.f.gen.ui5.webcomponents.BackgroundDesign",
        "sap.f.gen.ui5.webcomponents.BarAccessibleRole",
        "sap.f.gen.ui5.webcomponents.BarDesign",
        "sap.f.gen.ui5.webcomponents.BorderDesign",
        "sap.f.gen.ui5.webcomponents.BreadcrumbsDesign",
        "sap.f.gen.ui5.webcomponents.BreadcrumbsSeparator",
        "sap.f.gen.ui5.webcomponents.BusyIndicatorSize",
        "sap.f.gen.ui5.webcomponents.BusyIndicatorTextPlacement",
        "sap.f.gen.ui5.webcomponents.ButtonAccessibleRole",
        "sap.f.gen.ui5.webcomponents.ButtonBadgeDesign",
        "sap.f.gen.ui5.webcomponents.ButtonDesign",
        "sap.f.gen.ui5.webcomponents.ButtonType",
        "sap.f.gen.ui5.webcomponents.CalendarLegendItemType",
        "sap.f.gen.ui5.webcomponents.CalendarSelectionMode",
        "sap.f.gen.ui5.webcomponents.CalendarWeekNumbering",
        "sap.f.gen.ui5.webcomponents.CarouselArrowsPlacement",
        "sap.f.gen.ui5.webcomponents.CarouselPageIndicatorType",
        "sap.f.gen.ui5.webcomponents.ComboBoxFilter",
        "sap.f.gen.ui5.webcomponents.ExpandableTextOverflowMode",
        "sap.f.gen.ui5.webcomponents.FormItemSpacing",
        "sap.f.gen.ui5.webcomponents.Highlight",
        "sap.f.gen.ui5.webcomponents.IconDesign",
        "sap.f.gen.ui5.webcomponents.IconMode",
        "sap.f.gen.ui5.webcomponents.InputType",
        "sap.f.gen.ui5.webcomponents.InteractiveAreaSize",
        "sap.f.gen.ui5.webcomponents.LinkAccessibleRole",
        "sap.f.gen.ui5.webcomponents.LinkDesign",
        "sap.f.gen.ui5.webcomponents.ListAccessibleRole",
        "sap.f.gen.ui5.webcomponents.ListGrowingMode",
        "sap.f.gen.ui5.webcomponents.ListItemAccessibleRole",
        "sap.f.gen.ui5.webcomponents.ListItemType",
        "sap.f.gen.ui5.webcomponents.ListSelectionMode",
        "sap.f.gen.ui5.webcomponents.ListSeparator",
        "sap.f.gen.ui5.webcomponents.MenuItemGroupCheckMode",
        "sap.f.gen.ui5.webcomponents.MessageStripDesign",
        "sap.f.gen.ui5.webcomponents.NotificationListGrowingMode",
        "sap.f.gen.ui5.webcomponents.OverflowMode",
        "sap.f.gen.ui5.webcomponents.PanelAccessibleRole",
        "sap.f.gen.ui5.webcomponents.PopoverHorizontalAlign",
        "sap.f.gen.ui5.webcomponents.PopoverPlacement",
        "sap.f.gen.ui5.webcomponents.PopoverVerticalAlign",
        "sap.f.gen.ui5.webcomponents.PopupAccessibleRole",
        "sap.f.gen.ui5.webcomponents.Priority",
        "sap.f.gen.ui5.webcomponents.RatingIndicatorSize",
        "sap.f.gen.ui5.webcomponents.SegmentedButtonSelectionMode",
        "sap.f.gen.ui5.webcomponents.SemanticColor",
        "sap.f.gen.ui5.webcomponents.SwitchDesign",
        "sap.f.gen.ui5.webcomponents.TabLayout",
        "sap.f.gen.ui5.webcomponents.TableCellHorizontalAlign",
        "sap.f.gen.ui5.webcomponents.TableGrowingMode",
        "sap.f.gen.ui5.webcomponents.TableOverflowMode",
        "sap.f.gen.ui5.webcomponents.TableSelectionBehavior",
        "sap.f.gen.ui5.webcomponents.TableSelectionMode",
        "sap.f.gen.ui5.webcomponents.TableSelectionMultiHeaderSelector",
        "sap.f.gen.ui5.webcomponents.TagDesign",
        "sap.f.gen.ui5.webcomponents.TagSize",
        "sap.f.gen.ui5.webcomponents.TextEmptyIndicatorMode",
        "sap.f.gen.ui5.webcomponents.TitleLevel",
        "sap.f.gen.ui5.webcomponents.ToastPlacement",
        "sap.f.gen.ui5.webcomponents.ToolbarAlign",
        "sap.f.gen.ui5.webcomponents.ToolbarDesign",
        "sap.f.gen.ui5.webcomponents.ToolbarItemOverflowBehavior",
        "sap.f.gen.ui5.webcomponents.WrappingType"
      ],
      interfaces: [
        "sap.f.gen.ui5.webcomponents.IAvatarGroupItem",
        "sap.f.gen.ui5.webcomponents.IButton",
        "sap.f.gen.ui5.webcomponents.ICalendarSelectedDates",
        "sap.f.gen.ui5.webcomponents.IColorPaletteItem",
        "sap.f.gen.ui5.webcomponents.IComboBoxItem",
        "sap.f.gen.ui5.webcomponents.IDynamicDateRangeOption",
        "sap.f.gen.ui5.webcomponents.IFormItem",
        "sap.f.gen.ui5.webcomponents.IIcon",
        "sap.f.gen.ui5.webcomponents.IInputSuggestionItem",
        "sap.f.gen.ui5.webcomponents.IMenuItem",
        "sap.f.gen.ui5.webcomponents.IMultiComboBoxItem",
        "sap.f.gen.ui5.webcomponents.ISegmentedButtonItem",
        "sap.f.gen.ui5.webcomponents.IOption",
        "sap.f.gen.ui5.webcomponents.ITab",
        "sap.f.gen.ui5.webcomponents.ITableFeature",
        "sap.f.gen.ui5.webcomponents.ITableGrowing"
      ],
      controls: [
        "sap.f.gen.ui5.webcomponents.dist.Avatar",
        "sap.f.gen.ui5.webcomponents.dist.AvatarGroup",
        "sap.f.gen.ui5.webcomponents.dist.Bar",
        "sap.f.gen.ui5.webcomponents.dist.Breadcrumbs",
        "sap.f.gen.ui5.webcomponents.dist.BreadcrumbsItem",
        "sap.f.gen.ui5.webcomponents.dist.BusyIndicator",
        "sap.f.gen.ui5.webcomponents.dist.Button",
        "sap.f.gen.ui5.webcomponents.dist.ButtonBadge",
        "sap.f.gen.ui5.webcomponents.dist.Calendar",
        "sap.f.gen.ui5.webcomponents.dist.CalendarDate",
        "sap.f.gen.ui5.webcomponents.dist.CalendarDateRange",
        "sap.f.gen.ui5.webcomponents.dist.CalendarLegend",
        "sap.f.gen.ui5.webcomponents.dist.CalendarLegendItem",
        "sap.f.gen.ui5.webcomponents.dist.Card",
        "sap.f.gen.ui5.webcomponents.dist.CardHeader",
        "sap.f.gen.ui5.webcomponents.dist.Carousel",
        "sap.f.gen.ui5.webcomponents.dist.CheckBox",
        "sap.f.gen.ui5.webcomponents.dist.ColorPalette",
        "sap.f.gen.ui5.webcomponents.dist.ColorPaletteItem",
        "sap.f.gen.ui5.webcomponents.dist.ColorPalettePopover",
        "sap.f.gen.ui5.webcomponents.dist.ColorPicker",
        "sap.f.gen.ui5.webcomponents.dist.ComboBox",
        "sap.f.gen.ui5.webcomponents.dist.ComboBoxItem",
        "sap.f.gen.ui5.webcomponents.dist.ComboBoxItemGroup",
        "sap.f.gen.ui5.webcomponents.dist.DatePicker",
        "sap.f.gen.ui5.webcomponents.dist.DateRangePicker",
        "sap.f.gen.ui5.webcomponents.dist.DateTimePicker",
        "sap.f.gen.ui5.webcomponents.dist.Dialog",
        "sap.f.gen.ui5.webcomponents.dist.DynamicDateRange",
        "sap.f.gen.ui5.webcomponents.dist.ExpandableText",
        "sap.f.gen.ui5.webcomponents.dist.FileUploader",
        "sap.f.gen.ui5.webcomponents.dist.Form",
        "sap.f.gen.ui5.webcomponents.dist.FormGroup",
        "sap.f.gen.ui5.webcomponents.dist.FormItem",
        "sap.f.gen.ui5.webcomponents.dist.Icon",
        "sap.f.gen.ui5.webcomponents.dist.Input",
        "sap.f.gen.ui5.webcomponents.dist.Label",
        "sap.f.gen.ui5.webcomponents.dist.Link",
        "sap.f.gen.ui5.webcomponents.dist.List",
        "sap.f.gen.ui5.webcomponents.dist.ListItemCustom",
        "sap.f.gen.ui5.webcomponents.dist.ListItemGroup",
        "sap.f.gen.ui5.webcomponents.dist.ListItemStandard",
        "sap.f.gen.ui5.webcomponents.dist.Menu",
        "sap.f.gen.ui5.webcomponents.dist.MenuItem",
        "sap.f.gen.ui5.webcomponents.dist.MenuItemGroup",
        "sap.f.gen.ui5.webcomponents.dist.MenuSeparator",
        "sap.f.gen.ui5.webcomponents.dist.MessageStrip",
        "sap.f.gen.ui5.webcomponents.dist.MultiComboBox",
        "sap.f.gen.ui5.webcomponents.dist.MultiComboBoxItem",
        "sap.f.gen.ui5.webcomponents.dist.MultiComboBoxItemGroup",
        "sap.f.gen.ui5.webcomponents.dist.MultiInput",
        "sap.f.gen.ui5.webcomponents.dist.Option",
        "sap.f.gen.ui5.webcomponents.dist.OptionCustom",
        "sap.f.gen.ui5.webcomponents.dist.Panel",
        "sap.f.gen.ui5.webcomponents.dist.Popover",
        "sap.f.gen.ui5.webcomponents.dist.ProgressIndicator",
        "sap.f.gen.ui5.webcomponents.dist.RadioButton",
        "sap.f.gen.ui5.webcomponents.dist.RangeSlider",
        "sap.f.gen.ui5.webcomponents.dist.RatingIndicator",
        "sap.f.gen.ui5.webcomponents.dist.ResponsivePopover",
        "sap.f.gen.ui5.webcomponents.dist.SegmentedButton",
        "sap.f.gen.ui5.webcomponents.dist.SegmentedButtonItem",
        "sap.f.gen.ui5.webcomponents.dist.Select",
        "sap.f.gen.ui5.webcomponents.dist.Slider",
        "sap.f.gen.ui5.webcomponents.dist.SpecialCalendarDate",
        "sap.f.gen.ui5.webcomponents.dist.SplitButton",
        "sap.f.gen.ui5.webcomponents.dist.StepInput",
        "sap.f.gen.ui5.webcomponents.dist.SuggestionItem",
        "sap.f.gen.ui5.webcomponents.dist.SuggestionItemCustom",
        "sap.f.gen.ui5.webcomponents.dist.SuggestionItemGroup",
        "sap.f.gen.ui5.webcomponents.dist.Switch",
        "sap.f.gen.ui5.webcomponents.dist.Tab",
        "sap.f.gen.ui5.webcomponents.dist.TabContainer",
        "sap.f.gen.ui5.webcomponents.dist.TabSeparator",
        "sap.f.gen.ui5.webcomponents.dist.Table",
        "sap.f.gen.ui5.webcomponents.dist.TableCell",
        "sap.f.gen.ui5.webcomponents.dist.TableGrowing",
        "sap.f.gen.ui5.webcomponents.dist.TableHeaderCell",
        "sap.f.gen.ui5.webcomponents.dist.TableHeaderCellActionAI",
        "sap.f.gen.ui5.webcomponents.dist.TableHeaderRow",
        "sap.f.gen.ui5.webcomponents.dist.TableRow",
        "sap.f.gen.ui5.webcomponents.dist.TableRowAction",
        "sap.f.gen.ui5.webcomponents.dist.TableRowActionNavigation",
        "sap.f.gen.ui5.webcomponents.dist.TableSelection",
        "sap.f.gen.ui5.webcomponents.dist.TableSelectionMulti",
        "sap.f.gen.ui5.webcomponents.dist.TableSelectionSingle",
        "sap.f.gen.ui5.webcomponents.dist.TableVirtualizer",
        "sap.f.gen.ui5.webcomponents.dist.Tag",
        "sap.f.gen.ui5.webcomponents.dist.Text",
        "sap.f.gen.ui5.webcomponents.dist.TextArea",
        "sap.f.gen.ui5.webcomponents.dist.TimePicker",
        "sap.f.gen.ui5.webcomponents.dist.Title",
        "sap.f.gen.ui5.webcomponents.dist.Toast",
        "sap.f.gen.ui5.webcomponents.dist.ToggleButton",
        "sap.f.gen.ui5.webcomponents.dist.Token",
        "sap.f.gen.ui5.webcomponents.dist.Tokenizer",
        "sap.f.gen.ui5.webcomponents.dist.Toolbar",
        "sap.f.gen.ui5.webcomponents.dist.ToolbarButton",
        "sap.f.gen.ui5.webcomponents.dist.ToolbarSelect",
        "sap.f.gen.ui5.webcomponents.dist.ToolbarSelectOption",
        "sap.f.gen.ui5.webcomponents.dist.ToolbarSeparator",
        "sap.f.gen.ui5.webcomponents.dist.ToolbarSpacer",
        "sap.f.gen.ui5.webcomponents.dist.Tree",
        "sap.f.gen.ui5.webcomponents.dist.TreeItem",
        "sap.f.gen.ui5.webcomponents.dist.TreeItemCustom"
      ],
      elements: [],
      rootPath: "../"
    };

    // Enums
    /**
     * Different types of AvatarColorScheme.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.AvatarColorScheme
     * @ui5-module-override sap/f/gen/ui5/webcomponents AvatarColorScheme
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["AvatarColorScheme"] = {
      /**
       * Auto
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Auto: "Auto",
      /**
       * Accent1
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Accent1: "Accent1",
      /**
       * Accent2
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Accent2: "Accent2",
      /**
       * Accent3
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Accent3: "Accent3",
      /**
       * Accent4
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Accent4: "Accent4",
      /**
       * Accent5
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Accent5: "Accent5",
      /**
       * Accent6
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Accent6: "Accent6",
      /**
       * Accent7
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Accent7: "Accent7",
      /**
       * Accent8
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Accent8: "Accent8",
      /**
       * Accent9
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Accent9: "Accent9",
      /**
       * Accent10
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Accent10: "Accent10",
      /**
       * Placeholder
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Placeholder: "Placeholder",
      /**
       * Transparent
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Transparent: "Transparent"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.AvatarColorScheme",
      pkg["AvatarColorScheme"]
    );
    /**
     * Different types of AvatarGroupType.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.AvatarGroupType
     * @ui5-module-override sap/f/gen/ui5/webcomponents AvatarGroupType
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["AvatarGroupType"] = {
      /**
       * The avatars are displayed as partially overlapped on top of each other and the entire group has one click or tap area.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Group: "Group",
      /**
       * The avatars are displayed side-by-side and each avatar has its own click or tap area.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Individual: "Individual"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.AvatarGroupType", pkg["AvatarGroupType"]);
    /**
     * Different types of AvatarShape.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.AvatarShape
     * @ui5-module-override sap/f/gen/ui5/webcomponents AvatarShape
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["AvatarShape"] = {
      /**
       * Circular shape.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Circle: "Circle",
      /**
       * Square shape.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Square: "Square"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.AvatarShape", pkg["AvatarShape"]);
    /**
     * Different types of AvatarSize.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.AvatarSize
     * @ui5-module-override sap/f/gen/ui5/webcomponents AvatarSize
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["AvatarSize"] = {
      /**
       * component size - 2rem
       * font size - 1rem
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      XS: "XS",
      /**
       * component size - 3rem
       * font size - 1.5rem
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      S: "S",
      /**
       * component size - 4rem
       * font size - 2rem
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      M: "M",
      /**
       * component size - 5rem
       * font size - 2.5rem
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      L: "L",
      /**
       * component size - 7rem
       * font size - 3rem
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      XL: "XL"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.AvatarSize", pkg["AvatarSize"]);
    /**
     * Defines background designs.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.BackgroundDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents BackgroundDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["BackgroundDesign"] = {
      /**
       * A solid background color dependent on the theme.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Solid: "Solid",
      /**
       * Transparent background.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Transparent: "Transparent",
      /**
       * A translucent background depending on the opacity value of the theme.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Translucent: "Translucent"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.BackgroundDesign",
      pkg["BackgroundDesign"]
    );
    /**
     * ListItem accessible roles.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.BarAccessibleRole
     * @ui5-module-override sap/f/gen/ui5/webcomponents BarAccessibleRole
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["BarAccessibleRole"] = {
      /**
       * Represents the ARIA role &quot;toolbar&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Toolbar: "Toolbar",
      /**
       * Represents the ARIA role &quot;none&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.BarAccessibleRole",
      pkg["BarAccessibleRole"]
    );
    /**
     * Different types of Bar design
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.BarDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents BarDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["BarDesign"] = {
      /**
       * Default type
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Header: "Header",
      /**
       * Subheader type
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Subheader: "Subheader",
      /**
       * Footer type
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Footer: "Footer",
      /**
       * Floating Footer type - there is visible border on all sides
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      FloatingFooter: "FloatingFooter"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.BarDesign", pkg["BarDesign"]);
    /**
     * Defines border designs.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.BorderDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents BorderDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["BorderDesign"] = {
      /**
       * A solid border color dependent on the theme.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Solid: "Solid",
      /**
       * Specifies no border.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.BorderDesign", pkg["BorderDesign"]);
    /**
     * Different  Breadcrumbs designs.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.BreadcrumbsDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents BreadcrumbsDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["BreadcrumbsDesign"] = {
      /**
       * Shows the current page as the last item in the trail.
       * The last item contains only plain text and is not a link.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Standard: "Standard",
      /**
       * All items are displayed as links.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoCurrentPage: "NoCurrentPage"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.BreadcrumbsDesign",
      pkg["BreadcrumbsDesign"]
    );
    /**
     * Different Breadcrumbs separators.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.BreadcrumbsSeparator
     * @ui5-module-override sap/f/gen/ui5/webcomponents BreadcrumbsSeparator
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["BreadcrumbsSeparator"] = {
      /**
       * The separator appears as &quot;/&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Slash: "Slash",
      /**
       * The separator appears as &quot;\&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      BackSlash: "BackSlash",
      /**
       * The separator appears as &quot;\\&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      DoubleBackSlash: "DoubleBackSlash",
      /**
       * The separator appears as &quot;&gt;&gt;&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      DoubleGreaterThan: "DoubleGreaterThan",
      /**
       * The separator appears as &quot;//&quot; .
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      DoubleSlash: "DoubleSlash",
      /**
       * The separator appears as &quot;&gt;&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      GreaterThan: "GreaterThan"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.BreadcrumbsSeparator",
      pkg["BreadcrumbsSeparator"]
    );
    /**
     * Different BusyIndicator sizes.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.BusyIndicatorSize
     * @ui5-module-override sap/f/gen/ui5/webcomponents BusyIndicatorSize
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["BusyIndicatorSize"] = {
      /**
       * small size
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      S: "S",
      /**
       * medium size
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      M: "M",
      /**
       * large size
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      L: "L"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.BusyIndicatorSize",
      pkg["BusyIndicatorSize"]
    );
    /**
     * Different BusyIndicator text placements.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.BusyIndicatorTextPlacement
     * @ui5-module-override sap/f/gen/ui5/webcomponents BusyIndicatorTextPlacement
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["BusyIndicatorTextPlacement"] = {
      /**
       * The text will be displayed on top of the busy indicator.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Top: "Top",
      /**
       * The text will be displayed at the bottom of the busy indicator.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Bottom: "Bottom"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.BusyIndicatorTextPlacement",
      pkg["BusyIndicatorTextPlacement"]
    );
    /**
     * Button accessible roles.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ButtonAccessibleRole
     * @ui5-module-override sap/f/gen/ui5/webcomponents ButtonAccessibleRole
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ButtonAccessibleRole"] = {
      /**
       * Represents Default (button) ARIA role.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Button: "Button",
      /**
       * Represents the ARIA role &quot;link&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Link: "Link"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.ButtonAccessibleRole",
      pkg["ButtonAccessibleRole"]
    );
    /**
     * Determines where the badge will be placed and how it will be styled.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ButtonBadgeDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents ButtonBadgeDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ButtonBadgeDesign"] = {
      /**
       * The badge is displayed after the text, inside the button.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      InlineText: "InlineText",
      /**
       * The badge is displayed at the top-end corner of the button.
       *
       * **Note:** According to design guidance, the OverlayText design mode is best used in cozy density to avoid potential visual issues in compact.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      OverlayText: "OverlayText",
      /**
       * The badge is displayed as an attention dot.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      AttentionDot: "AttentionDot"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.ButtonBadgeDesign",
      pkg["ButtonBadgeDesign"]
    );
    /**
     * Different Button designs.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ButtonDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents ButtonDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ButtonDesign"] = {
      /**
       * default type (no special styling)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Default: "Default",
      /**
       * accept type (green button)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Positive: "Positive",
      /**
       * reject style (red button)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Negative: "Negative",
      /**
       * transparent type
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Transparent: "Transparent",
      /**
       * emphasized type
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Emphasized: "Emphasized",
      /**
       * attention type
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Attention: "Attention"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.ButtonDesign", pkg["ButtonDesign"]);
    /**
     * Determines if the button has special form-related functionality.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ButtonType
     * @ui5-module-override sap/f/gen/ui5/webcomponents ButtonType
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ButtonType"] = {
      /**
       * The button does not do anything special when inside a form
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Button: "Button",
      /**
       * The button acts as a submit button (submits a form)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Submit: "Submit",
      /**
       * The button acts as a reset button (resets a form)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Reset: "Reset"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.ButtonType", pkg["ButtonType"]);
    /**
     * Enum for calendar legend items' types.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.CalendarLegendItemType
     * @ui5-module-override sap/f/gen/ui5/webcomponents CalendarLegendItemType
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["CalendarLegendItemType"] = {
      /**
       * Set when no type is set.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None",
      /**
       * Represents the &quot;Working&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Working: "Working",
      /**
       * Represents the &quot;NonWorking&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NonWorking: "NonWorking",
      /**
       * Represents the &quot;Type01&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type01: "Type01",
      /**
       * Represents the &quot;Type02&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type02: "Type02",
      /**
       * Represents the &quot;Type03&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type03: "Type03",
      /**
       * Represents the &quot;Type04&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type04: "Type04",
      /**
       * Represents the &quot;Type05&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type05: "Type05",
      /**
       * Represents the &quot;Type06&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type06: "Type06",
      /**
       * Represents the &quot;Type07&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type07: "Type07",
      /**
       * Represents the &quot;Type08&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type08: "Type08",
      /**
       * Represents the &quot;Type09&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type09: "Type09",
      /**
       * Represents the &quot;Type10&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type10: "Type10",
      /**
       * Represents the &quot;Type11&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type11: "Type11",
      /**
       * Represents the &quot;Type12&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type12: "Type12",
      /**
       * Represents the &quot;Type13&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type13: "Type13",
      /**
       * Represents the &quot;Type14&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type14: "Type14",
      /**
       * Represents the &quot;Type15&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type15: "Type15",
      /**
       * Represents the &quot;Type16&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type16: "Type16",
      /**
       * Represents the &quot;Type17&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type17: "Type17",
      /**
       * Represents the &quot;Type18&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type18: "Type18",
      /**
       * Represents the &quot;Type19&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type19: "Type19",
      /**
       * Represents the &quot;Type20&quot; item in the calendar legend.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Type20: "Type20"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.CalendarLegendItemType",
      pkg["CalendarLegendItemType"]
    );
    /**
     * Different Calendar selection mode.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.CalendarSelectionMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents CalendarSelectionMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["CalendarSelectionMode"] = {
      /**
       * Only one date can be selected at a time
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Single: "Single",
      /**
       * Several dates can be selected
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Multiple: "Multiple",
      /**
       * A range defined by a start date and an end date can be selected
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Range: "Range"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.CalendarSelectionMode",
      pkg["CalendarSelectionMode"]
    );
    /**
     * The <code>CalendarWeekNumbering</code> enum defines how to calculate calendar weeks. Each
     * value defines:
     * - The first day of the week,
     * - The first week of the year.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.CalendarWeekNumbering
     * @ui5-module-override sap/f/gen/ui5/webcomponents CalendarWeekNumbering
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["CalendarWeekNumbering"] = {
      /**
       * The default calendar week numbering:
       *
       * The framework determines the week numbering scheme; currently it is derived from the
       * active format locale. Future versions of ui5-webcomponents might select a different week numbering
       * scheme.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Default: "Default",
      /**
       * Official calendar week numbering in most of Europe (ISO 8601 standard):
       * Monday is first day of the week, the week containing January 4th is first week of the year.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ISO_8601: "ISO_8601",
      /**
       * Official calendar week numbering in much of the Middle East (Middle Eastern calendar):
       * Saturday is first day of the week, the week containing January 1st is first week of the year.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      MiddleEastern: "MiddleEastern",
      /**
       * Official calendar week numbering in the United States, Canada, Brazil, Israel, Japan, and
       * other countries (Western traditional calendar):
       * Sunday is first day of the week, the week containing January 1st is first week of the year.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      WesternTraditional: "WesternTraditional"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.CalendarWeekNumbering",
      pkg["CalendarWeekNumbering"]
    );
    /**
     * Different Carousel arrows placement.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.CarouselArrowsPlacement
     * @ui5-module-override sap/f/gen/ui5/webcomponents CarouselArrowsPlacement
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["CarouselArrowsPlacement"] = {
      /**
       * Carousel arrows are placed on the sides of the current Carousel page.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Content: "Content",
      /**
       * Carousel arrows are placed on the sides of the page indicator of the Carousel.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Navigation: "Navigation"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.CarouselArrowsPlacement",
      pkg["CarouselArrowsPlacement"]
    );
    /**
     * Different Carousel page indicator types.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.CarouselPageIndicatorType
     * @ui5-module-override sap/f/gen/ui5/webcomponents CarouselPageIndicatorType
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["CarouselPageIndicatorType"] = {
      /**
       * The page indicator will be visualized as dots if there are fewer than 9 pages.
       * If there are more pages, the page indicator will switch to displaying the current page and the total number of pages. (e.g. X of Y)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Default: "Default",
      /**
       * The page indicator will display the current page and the total number of pages. (e.g. X of Y)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Numeric: "Numeric"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.CarouselPageIndicatorType",
      pkg["CarouselPageIndicatorType"]
    );
    /**
     * Different filtering types of the ComboBox.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ComboBoxFilter
     * @ui5-module-override sap/f/gen/ui5/webcomponents ComboBoxFilter
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ComboBoxFilter"] = {
      /**
       * Defines filtering by first symbol of each word of item&#x27;s text.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      StartsWithPerTerm: "StartsWithPerTerm",
      /**
       * Defines filtering by starting symbol of item&#x27;s text.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      StartsWith: "StartsWith",
      /**
       * Defines contains filtering.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Contains: "Contains",
      /**
       * Removes any filtering applied while typing
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.ComboBoxFilter", pkg["ComboBoxFilter"]);
    /**
     * Overflow Mode.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ExpandableTextOverflowMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents ExpandableTextOverflowMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ExpandableTextOverflowMode"] = {
      /**
       * Overflowing text is appended in-place.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      InPlace: "InPlace",
      /**
       * Full text is displayed in a popover.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Popover: "Popover"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.ExpandableTextOverflowMode",
      pkg["ExpandableTextOverflowMode"]
    );
    /**
     * Different Button designs.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.FormItemSpacing
     * @ui5-module-override sap/f/gen/ui5/webcomponents FormItemSpacing
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["FormItemSpacing"] = {
      /**
       * Normal spacing (smaller vertical space between form items).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Normal: "Normal",
      /**
       * Large spacing (larger vertical space between form items).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Large: "Large"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.FormItemSpacing", pkg["FormItemSpacing"]);
    /**
     * Different types of Highlight .
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.Highlight
     * @ui5-module-override sap/f/gen/ui5/webcomponents Highlight
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["Highlight"] = {
      /**
       * None
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None",
      /**
       * Positive
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Positive: "Positive",
      /**
       * Critical
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Critical: "Critical",
      /**
       * Negative
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Negative: "Negative",
      /**
       * Information
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Information: "Information"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.Highlight", pkg["Highlight"]);
    /**
     * Different Icon semantic designs.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.IconDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents IconDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["IconDesign"] = {
      /**
       * Contrast design
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Contrast: "Contrast",
      /**
       * Critical design
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Critical: "Critical",
      /**
       * Default design (brand design)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Default: "Default",
      /**
       * info type
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Information: "Information",
      /**
       * Negative design
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Negative: "Negative",
      /**
       * Neutral design
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Neutral: "Neutral",
      /**
       * Design that indicates an icon which isn&#x27;t interactive
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NonInteractive: "NonInteractive",
      /**
       * Positive design
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Positive: "Positive"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.IconDesign", pkg["IconDesign"]);
    /**
     * Different Icon modes.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.IconMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents IconMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["IconMode"] = {
      /**
       * Image mode (by default).
       * Configures the component to internally render role&#x3D;&quot;img&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Image: "Image",
      /**
       * Decorative mode.
       * Configures the component to internally render role&#x3D;&quot;presentation&quot; and aria-hidden&#x3D;&quot;true&quot;,
       * making it purely decorative without semantic content or interactivity.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Decorative: "Decorative",
      /**
       * Interactive mode.
       * Configures the component to internally render role&#x3D;&quot;button&quot;.
       * This mode also supports focus and press handling to enhance interactivity.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Interactive: "Interactive"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.IconMode", pkg["IconMode"]);
    /**
     * Different input types.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.InputType
     * @ui5-module-override sap/f/gen/ui5/webcomponents InputType
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["InputType"] = {
      /**
       * Defines a one-line text input field:
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Text: "Text",
      /**
       * Used for input fields that must contain an e-mail address.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Email: "Email",
      /**
       * Defines a numeric input field.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Number: "Number",
      /**
       * Defines a password field.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Password: "Password",
      /**
       * Used for input fields that should contain a telephone number.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Tel: "Tel",
      /**
       * Used for input fields that should contain a URL address.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      URL: "URL",
      /**
       * Used for input fields that should contain a search term.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Search: "Search"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.InputType", pkg["InputType"]);
    /**
     * Defines the area size around the component that the user can select.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.InteractiveAreaSize
     * @ui5-module-override sap/f/gen/ui5/webcomponents InteractiveAreaSize
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["InteractiveAreaSize"] = {
      /**
       * The default target area size (the area taken by the component itself without any extra invisible touch area).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Normal: "Normal",
      /**
       * Enlarged target area size (up to 24px in height) provides users with an enhanced dedicated space to interact with the component.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Large: "Large"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.InteractiveAreaSize",
      pkg["InteractiveAreaSize"]
    );
    /**
     * Link accessible roles.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.LinkAccessibleRole
     * @ui5-module-override sap/f/gen/ui5/webcomponents LinkAccessibleRole
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["LinkAccessibleRole"] = {
      /**
       * Represents Default (link) ARIA role.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Link: "Link",
      /**
       * Represents the ARIA role &quot;button&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Button: "Button"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.LinkAccessibleRole",
      pkg["LinkAccessibleRole"]
    );
    /**
     * Different link designs.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.LinkDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents LinkDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["LinkDesign"] = {
      /**
       * default type (no special styling)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Default: "Default",
      /**
       * subtle type (appears as regular text, rather than a link)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Subtle: "Subtle",
      /**
       * emphasized type
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Emphasized: "Emphasized"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.LinkDesign", pkg["LinkDesign"]);
    /**
     * List accessible roles.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ListAccessibleRole
     * @ui5-module-override sap/f/gen/ui5/webcomponents ListAccessibleRole
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ListAccessibleRole"] = {
      /**
       * Represents the ARIA role &quot;list&quot;. (by default)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      List: "List",
      /**
       * Represents the ARIA role &quot;menu&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Menu: "Menu",
      /**
       * Represents the ARIA role &quot;tree&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Tree: "Tree",
      /**
       * Represents the ARIA role &quot;listbox&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ListBox: "ListBox"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.ListAccessibleRole",
      pkg["ListAccessibleRole"]
    );
    /**
     * Different list growing modes.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ListGrowingMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents ListGrowingMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ListGrowingMode"] = {
      /**
       * Component&#x27;s &quot;load-more&quot; is fired upon pressing a &quot;More&quot; button.
       * at the bottom.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Button: "Button",
      /**
       * Component&#x27;s &quot;load-more&quot; is fired upon scroll.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Scroll: "Scroll",
      /**
       * Component&#x27;s growing is not enabled.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.ListGrowingMode", pkg["ListGrowingMode"]);
    /**
     * ListItem accessible roles.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ListItemAccessibleRole
     * @ui5-module-override sap/f/gen/ui5/webcomponents ListItemAccessibleRole
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ListItemAccessibleRole"] = {
      /**
       * Represents the ARIA role &quot;listitem&quot;. (by default)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ListItem: "ListItem",
      /**
       * Represents the ARIA role &quot;menuitem&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      MenuItem: "MenuItem",
      /**
       * Represents the ARIA role &quot;treeitem&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TreeItem: "TreeItem",
      /**
       * Represents the ARIA role &quot;option&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Option: "Option",
      /**
       * Represents the ARIA role &quot;none&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.ListItemAccessibleRole",
      pkg["ListItemAccessibleRole"]
    );
    /**
     * Different list item types.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ListItemType
     * @ui5-module-override sap/f/gen/ui5/webcomponents ListItemType
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ListItemType"] = {
      /**
       * Indicates the list item does not have any active feedback when item is pressed.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Inactive: "Inactive",
      /**
       * Indicates that the item is clickable via active feedback when item is pressed.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Active: "Active",
      /**
       * Enables detail button of the list item that fires detail-click event.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Detail: "Detail",
      /**
       * Enables the type of navigation, which is specified to add an arrow at the end of the items and fires navigate-click event.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Navigation: "Navigation"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.ListItemType", pkg["ListItemType"]);
    /**
     * Different list selection modes.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ListSelectionMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents ListSelectionMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ListSelectionMode"] = {
      /**
       * Default mode (no selection).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None",
      /**
       * Right-positioned single selection mode (only one list item can be selected).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Single: "Single",
      /**
       * Left-positioned single selection mode (only one list item can be selected).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SingleStart: "SingleStart",
      /**
       * Selected item is highlighted but no selection element is visible
       * (only one list item can be selected).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SingleEnd: "SingleEnd",
      /**
       * Selected item is highlighted and selection is changed upon arrow navigation
       * (only one list item can be selected - this is always the focused item).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SingleAuto: "SingleAuto",
      /**
       * Multi selection mode (more than one list item can be selected).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Multiple: "Multiple",
      /**
       * Delete mode (only one list item can be deleted via provided delete button)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Delete: "Delete"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.ListSelectionMode",
      pkg["ListSelectionMode"]
    );
    /**
     * Different types of list items separators.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ListSeparator
     * @ui5-module-override sap/f/gen/ui5/webcomponents ListSeparator
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ListSeparator"] = {
      /**
       * Separators between the items including the last and the first one.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      All: "All",
      /**
       * Separators between the items.
       * Note: This enumeration depends on the theme.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Inner: "Inner",
      /**
       * No item separators.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.ListSeparator", pkg["ListSeparator"]);
    /**
     * Menu item group check modes.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.MenuItemGroupCheckMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents MenuItemGroupCheckMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["MenuItemGroupCheckMode"] = {
      /**
       * default type (items in a group cannot be checked)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None",
      /**
       * Single item check mode (only one item in a group can be checked at a time)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Single: "Single",
      /**
       * Multiple items check mode (multiple items in a group can be checked at a time)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Multiple: "Multiple"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.MenuItemGroupCheckMode",
      pkg["MenuItemGroupCheckMode"]
    );
    /**
     * MessageStrip designs.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.MessageStripDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents MessageStripDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["MessageStripDesign"] = {
      /**
       * Message should be just an information
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Information: "Information",
      /**
       * Message is a success message
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Positive: "Positive",
      /**
       * Message is an error
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Negative: "Negative",
      /**
       * Message is a warning
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Critical: "Critical",
      /**
       * Message uses custom color set 1
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ColorSet1: "ColorSet1",
      /**
       * Message uses custom color set 2
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ColorSet2: "ColorSet2"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.MessageStripDesign",
      pkg["MessageStripDesign"]
    );
    /**
     * Different notification list growing modes.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.NotificationListGrowingMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents NotificationListGrowingMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["NotificationListGrowingMode"] = {
      /**
       * Component&#x27;s &quot;load-more&quot; is fired upon pressing a &quot;More&quot; button.
       * at the bottom.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Button: "Button",
      /**
       * Component&#x27;s growing is not enabled.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.NotificationListGrowingMode",
      pkg["NotificationListGrowingMode"]
    );
    /**
     * Tabs overflow mode in TabContainer.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.OverflowMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents OverflowMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["OverflowMode"] = {
      /**
       * End type is used if there should be only one overflow with hidden the tabs at the end of the tab container.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      End: "End",
      /**
       * StartAndEnd type is used if there should be two overflows on both ends of the tab container.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      StartAndEnd: "StartAndEnd"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.OverflowMode", pkg["OverflowMode"]);
    /**
     * Panel accessible roles.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.PanelAccessibleRole
     * @ui5-module-override sap/f/gen/ui5/webcomponents PanelAccessibleRole
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["PanelAccessibleRole"] = {
      /**
       * Represents the ARIA role &quot;complementary&quot;.
       * A section of the page, designed to be complementary to the main content at a similar level in the DOM hierarchy.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Complementary: "Complementary",
      /**
       * Represents the ARIA role &quot;Form&quot;.
       * A landmark region that contains a collection of items and objects that, as a whole, create a form.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Form: "Form",
      /**
       * Represents the ARIA role &quot;Region&quot;.
       * A section of a page, that is important enough to be included in a page summary or table of contents.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Region: "Region"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.PanelAccessibleRole",
      pkg["PanelAccessibleRole"]
    );
    /**
     * Popover horizontal align types.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.PopoverHorizontalAlign
     * @ui5-module-override sap/f/gen/ui5/webcomponents PopoverHorizontalAlign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["PopoverHorizontalAlign"] = {
      /**
       * Popover is centered.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Center: "Center",
      /**
       * Popover is aligned with the start of the target.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Start: "Start",
      /**
       * Popover is aligned with the end of the target.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      End: "End",
      /**
       * Popover is stretched.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Stretch: "Stretch"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.PopoverHorizontalAlign",
      pkg["PopoverHorizontalAlign"]
    );
    /**
     * Popover placements.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.PopoverPlacement
     * @ui5-module-override sap/f/gen/ui5/webcomponents PopoverPlacement
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["PopoverPlacement"] = {
      /**
       * Popover will be placed at the start of the reference element.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Start: "Start",
      /**
       * Popover will be placed at the end of the reference element.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      End: "End",
      /**
       * Popover will be placed at the top of the reference element.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Top: "Top",
      /**
       * Popover will be placed at the bottom of the reference element.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Bottom: "Bottom"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.PopoverPlacement",
      pkg["PopoverPlacement"]
    );
    /**
     * Popover vertical align types.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.PopoverVerticalAlign
     * @ui5-module-override sap/f/gen/ui5/webcomponents PopoverVerticalAlign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["PopoverVerticalAlign"] = {
      /**
       * Center
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Center: "Center",
      /**
       * Popover will be placed at the top of the reference control.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Top: "Top",
      /**
       * Popover will be placed at the bottom of the reference control.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Bottom: "Bottom",
      /**
       * Popover will be streched
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Stretch: "Stretch"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.PopoverVerticalAlign",
      pkg["PopoverVerticalAlign"]
    );
    /**
     * Popup accessible roles.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.PopupAccessibleRole
     * @ui5-module-override sap/f/gen/ui5/webcomponents PopupAccessibleRole
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["PopupAccessibleRole"] = {
      /**
       * Represents no ARIA role.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None",
      /**
       * Represents the ARIA role &quot;dialog&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Dialog: "Dialog",
      /**
       * Represents the ARIA role &quot;alertdialog&quot;.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      AlertDialog: "AlertDialog"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.PopupAccessibleRole",
      pkg["PopupAccessibleRole"]
    );
    /**
     * Different types of Priority.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.Priority
     * @ui5-module-override sap/f/gen/ui5/webcomponents Priority
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["Priority"] = {
      /**
       * High priority.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      High: "High",
      /**
       * Medium priority.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Medium: "Medium",
      /**
       * Low priority.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Low: "Low",
      /**
       * Default, none priority.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.Priority", pkg["Priority"]);
    /**
     * Types of icon sizes used in the RatingIndicator.
     * Provides predefined size categories to ensure consistent scaling and spacing of icons.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.RatingIndicatorSize
     * @ui5-module-override sap/f/gen/ui5/webcomponents RatingIndicatorSize
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["RatingIndicatorSize"] = {
      /**
       * Small size for compact layouts.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      S: "S",
      /**
       * Medium size, used as the default option.
       * Offers a balanced appearance for most scenarios.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      M: "M",
      /**
       * Large size for prominent or spacious layouts.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      L: "L"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.RatingIndicatorSize",
      pkg["RatingIndicatorSize"]
    );
    /**
     * Different SegmentedButton selection modes.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.SegmentedButtonSelectionMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents SegmentedButtonSelectionMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["SegmentedButtonSelectionMode"] = {
      /**
       * There is always one selected. Selecting one deselects the previous one.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Single: "Single",
      /**
       * Multiple items can be selected at a time. All items can be deselected.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Multiple: "Multiple"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.SegmentedButtonSelectionMode",
      pkg["SegmentedButtonSelectionMode"]
    );
    /**
     * Different types of SemanticColor.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.SemanticColor
     * @ui5-module-override sap/f/gen/ui5/webcomponents SemanticColor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["SemanticColor"] = {
      /**
       * Default color (brand color)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Default: "Default",
      /**
       * Positive color
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Positive: "Positive",
      /**
       * Negative color
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Negative: "Negative",
      /**
       * Critical color
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Critical: "Critical",
      /**
       * Neutral color.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Neutral: "Neutral"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.SemanticColor", pkg["SemanticColor"]);
    /**
     * Different types of Switch designs.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.SwitchDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents SwitchDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["SwitchDesign"] = {
      /**
       * Defines the Switch as Textual
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Textual: "Textual",
      /**
       * Defines the Switch as Graphical
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Graphical: "Graphical"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.SwitchDesign", pkg["SwitchDesign"]);
    /**
     * Tab layout of TabContainer.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.TabLayout
     * @ui5-module-override sap/f/gen/ui5/webcomponents TabLayout
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["TabLayout"] = {
      /**
       * Inline type, the tab &quot;main text&quot; and &quot;additionalText&quot; are displayed horizotally.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Inline: "Inline",
      /**
       * Standard type, the tab &quot;main text&quot; and &quot;additionalText&quot; are displayed vertically.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Standard: "Standard"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.TabLayout", pkg["TabLayout"]);
    /**
     * Alignment of the &lt;ui5-table-cell&gt; component.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.TableCellHorizontalAlign
     * @ui5-module-override sap/f/gen/ui5/webcomponents TableCellHorizontalAlign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["TableCellHorizontalAlign"] = {
      /**
       * Left
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Left: "Left",
      /**
       * Start
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Start: "Start",
      /**
       * Right
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Right: "Right",
      /**
       * End
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      End: "End",
      /**
       * Center
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Center: "Center"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.TableCellHorizontalAlign",
      pkg["TableCellHorizontalAlign"]
    );
    /**
     * Growing mode of the &lt;ui5-table&gt; component.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.TableGrowingMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents TableGrowingMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["TableGrowingMode"] = {
      /**
       * Renders a growing button, which can be pressed to load more data.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Button: "Button",
      /**
       * Scroll to load more data.
       *
       * **Note:** If the table is not scrollable, a growing button will be rendered instead to ensure growing functionality.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Scroll: "Scroll"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.TableGrowingMode",
      pkg["TableGrowingMode"]
    );
    /**
     * Overflow mode of the &lt;ui5-table&gt; component.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.TableOverflowMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents TableOverflowMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["TableOverflowMode"] = {
      /**
       * Shows a scrollbar, when the table cannot fit all columns.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Scroll: "Scroll",
      /**
       * Pops in columns, that do not fit into the table anymore.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Popin: "Popin"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.TableOverflowMode",
      pkg["TableOverflowMode"]
    );
    /**
     * Selection behavior of the `ui5-table` selection components.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.TableSelectionBehavior
     * @ui5-module-override sap/f/gen/ui5/webcomponents TableSelectionBehavior
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["TableSelectionBehavior"] = {
      /**
       * Rows can only be selected by using the row selector column.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      RowSelector: "RowSelector",
      /**
       * Rows can only be selected by clicking directly on the row, as the row selector column is hidden.
       *
       * **Note:** In this mode, the &#x60;row-click&#x60; event of the &#x60;ui5-table&#x60; component is not fired.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      RowOnly: "RowOnly"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.TableSelectionBehavior",
      pkg["TableSelectionBehavior"]
    );
    /**
     * Selection modes of the &lt;ui5-table&gt; component.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.TableSelectionMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents TableSelectionMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["TableSelectionMode"] = {
      /**
       * Default mode (no selection).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None",
      /**
       * Single selection mode (only one table row can be selected).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Single: "Single",
      /**
       * Multi selection mode (more than one table row can be selected).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Multiple: "Multiple"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.TableSelectionMode",
      pkg["TableSelectionMode"]
    );
    /**
     * Selectors of the table header row in multi-selection scenarios.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.TableSelectionMultiHeaderSelector
     * @ui5-module-override sap/f/gen/ui5/webcomponents TableSelectionMultiHeaderSelector
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["TableSelectionMultiHeaderSelector"] = {
      /**
       * Renders a checkbox in the table header row that toggles the selection of all rows.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SelectAll: "SelectAll",
      /**
       * Renders an icon in the table header row that removes the selection of all rows.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ClearAll: "ClearAll"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.TableSelectionMultiHeaderSelector",
      pkg["TableSelectionMultiHeaderSelector"]
    );
    /**
     * Defines tag design types.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.TagDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents TagDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["TagDesign"] = {
      /**
       * Set1 of generic indication colors that are intended for industry-specific use cases
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Set1: "Set1",
      /**
       * Set2 of generic indication colors that are intended for industry-specific use cases
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Set2: "Set2",
      /**
       * Neutral design
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Neutral: "Neutral",
      /**
       * Information design
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Information: "Information",
      /**
       * Positive design
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Positive: "Positive",
      /**
       * Negative design
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Negative: "Negative",
      /**
       * Critical design
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Critical: "Critical"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.TagDesign", pkg["TagDesign"]);
    /**
     * Predefined sizes for the tag.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.TagSize
     * @ui5-module-override sap/f/gen/ui5/webcomponents TagSize
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["TagSize"] = {
      /**
       * Small size of the tag
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      S: "S",
      /**
       * Large size of the tag
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      L: "L"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.TagSize", pkg["TagSize"]);
    /**
     * Empty Indicator Mode.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.TextEmptyIndicatorMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents TextEmptyIndicatorMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["TextEmptyIndicatorMode"] = {
      /**
       * Empty indicator is never rendered.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Off: "Off",
      /**
       * Empty indicator is rendered always when the component&#x27;s content is empty.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      On: "On"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.TextEmptyIndicatorMode",
      pkg["TextEmptyIndicatorMode"]
    );
    /**
     * Different types of Title level.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.TitleLevel
     * @ui5-module-override sap/f/gen/ui5/webcomponents TitleLevel
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["TitleLevel"] = {
      /**
       * Renders &#x60;h1&#x60; tag.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      H1: "H1",
      /**
       * Renders &#x60;h2&#x60; tag.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      H2: "H2",
      /**
       * Renders &#x60;h3&#x60; tag.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      H3: "H3",
      /**
       * Renders &#x60;h4&#x60; tag.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      H4: "H4",
      /**
       * Renders &#x60;h5&#x60; tag.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      H5: "H5",
      /**
       * Renders &#x60;h6&#x60; tag.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      H6: "H6"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.TitleLevel", pkg["TitleLevel"]);
    /**
     * Toast placement.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ToastPlacement
     * @ui5-module-override sap/f/gen/ui5/webcomponents ToastPlacement
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ToastPlacement"] = {
      /**
       * Toast is placed at the &#x60;TopStart&#x60; position of its container.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TopStart: "TopStart",
      /**
       * Toast is placed at the &#x60;TopCenter&#x60; position of its container.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TopCenter: "TopCenter",
      /**
       * Toast is placed at the &#x60;TopEnd&#x60; position of its container.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TopEnd: "TopEnd",
      /**
       * Toast is placed at the &#x60;MiddleStart&#x60; position of its container.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      MiddleStart: "MiddleStart",
      /**
       * Toast is placed at the &#x60;MiddleCenter&#x60; position of its container.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      MiddleCenter: "MiddleCenter",
      /**
       * Toast is placed at the &#x60;MiddleEnd&#x60; position of its container.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      MiddleEnd: "MiddleEnd",
      /**
       * Toast is placed at the &#x60;BottomStart&#x60; position of its container.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      BottomStart: "BottomStart",
      /**
       * Toast is placed at the &#x60;BottomCenter&#x60; position of its container.
       * Default placement (no selection)
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      BottomCenter: "BottomCenter",
      /**
       * Toast is placed at the &#x60;BottomEnd&#x60; position of its container.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      BottomEnd: "BottomEnd"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.ToastPlacement", pkg["ToastPlacement"]);
    /**
     * Defines which direction the items of ui5-toolbar will be aligned.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ToolbarAlign
     * @ui5-module-override sap/f/gen/ui5/webcomponents ToolbarAlign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ToolbarAlign"] = {
      /**
       * Toolbar items are situated at the &#x60;start&#x60; of the Toolbar
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Start: "Start",
      /**
       * Toolbar items are situated at the &#x60;end&#x60; of the Toolbar
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      End: "End"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.ToolbarAlign", pkg["ToolbarAlign"]);
    /**
     * Defines the available toolbar designs.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ToolbarDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents ToolbarDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ToolbarDesign"] = {
      /**
       * The toolbar and its content will be displayed with solid background.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Solid: "Solid",
      /**
       * The toolbar and its content will be displayed with transparent background.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Transparent: "Transparent"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.ToolbarDesign", pkg["ToolbarDesign"]);
    /**
     * Defines the priority of the toolbar item to go inside overflow popover.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.ToolbarItemOverflowBehavior
     * @ui5-module-override sap/f/gen/ui5/webcomponents ToolbarItemOverflowBehavior
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ToolbarItemOverflowBehavior"] = {
      /**
       * The item is presented inside the toolbar and goes in the popover, when there is not enough space.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Default: "Default",
      /**
       * When set, the item will never go to the overflow popover.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NeverOverflow: "NeverOverflow",
      /**
       * When set, the item will be always part of the overflow part of ui5-toolbar.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      AlwaysOverflow: "AlwaysOverflow"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents.ToolbarItemOverflowBehavior",
      pkg["ToolbarItemOverflowBehavior"]
    );
    /**
     * Different types of wrapping.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents.WrappingType
     * @ui5-module-override sap/f/gen/ui5/webcomponents WrappingType
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["WrappingType"] = {
      /**
       * The text will be truncated with an ellipsis.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None",
      /**
       * The text will wrap. The words will not be broken based on hyphenation.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Normal: "Normal"
    };
    registerEnum("sap.f.gen.ui5.webcomponents.WrappingType", pkg["WrappingType"]);

    // Interfaces
    /**
     * Interface for components that represent an avatar and may be slotted in numerous higher-order components such as `ui5-avatar-group`
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.IAvatarGroupItem
     * @ui5-module-override sap/f/gen/ui5/webcomponents IAvatarGroupItem
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that may be used as a button inside numerous higher-order components
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.IButton
     * @ui5-module-override sap/f/gen/ui5/webcomponents IButton
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that may be slotted inside a `ui5-calendar`.
     *
     * **Note:** Use with `ui5-date` or `ui5-date-range` as calendar date selection types.
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.ICalendarSelectedDates
     * @ui5-module-override sap/f/gen/ui5/webcomponents ICalendarSelectedDates
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that may be used inside a `ui5-color-palette` or `ui5-color-palette-popover`
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.IColorPaletteItem
     * @ui5-module-override sap/f/gen/ui5/webcomponents IColorPaletteItem
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that may be slotted inside a `ui5-combobox`
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.IComboBoxItem
     * @ui5-module-override sap/f/gen/ui5/webcomponents IComboBoxItem
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Represents a dynamic date range option used by the `ui5-dynamic-date-range` component.
     *
     * Represents a dynamic date range option used for handling dynamic date ranges.
     * This interface defines the structure and behavior required for implementing
     * dynamic date range options, including formatting, parsing, validation, and
     * conversion of date range values.
     *
     *  * Properties:
     * - `icon`: The icon associated with the dynamic date range option, typically used for UI representation.
     * - `operator`: A unique operator identifying the dynamic date range option.
     * - `text`: The display text for the dynamic date range option.
     * - `template` (optional): A JSX template for rendering the dynamic date range option.
     *
     * Methods:
     * - `format(value: DynamicDateRangeValue): string`: Formats the given dynamic date range value into a string representation.
     * - `parse(value: string): DynamicDateRangeValue | undefined`: Parses a string into a dynamic date range value.
     * - `toDates(value: DynamicDateRangeValue): Array<Date>`: Converts a dynamic date range value into an array of `Date` objects.
     * - `handleSelectionChange?(event: CustomEvent): DynamicDateRangeValue | undefined`: (Optional) Handles selection changes in the UI of the dynamic date range option.
     * - `isValidString(value: string): boolean`: Validates whether a given string is a valid representation of the dynamic date range value.
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.IDynamicDateRangeOption
     * @ui5-module-override sap/f/gen/ui5/webcomponents IDynamicDateRangeOption
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that can be slotted inside `ui5-form` as items.
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.IFormItem
     * @ui5-module-override sap/f/gen/ui5/webcomponents IFormItem
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that represent an icon, usable in numerous higher-order components
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.IIcon
     * @ui5-module-override sap/f/gen/ui5/webcomponents IIcon
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that represent a suggestion item, usable in `ui5-input`
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.IInputSuggestionItem
     * @ui5-module-override sap/f/gen/ui5/webcomponents IInputSuggestionItem
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that may be slotted inside a `ui5-menu`.
     *
     * **Note:** Use with `ui5-menu-item` or `ui5-menu-separator`. Implementing the interface does not guarantee that any other classes can work with the `ui5-menu`.
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.IMenuItem
     * @ui5-module-override sap/f/gen/ui5/webcomponents IMenuItem
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that may be slotted inside a `ui5-multi-combobox` as items
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.IMultiComboBoxItem
     * @ui5-module-override sap/f/gen/ui5/webcomponents IMultiComboBoxItem
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that may be slotted inside `ui5-segmented-button` as items
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.ISegmentedButtonItem
     * @ui5-module-override sap/f/gen/ui5/webcomponents ISegmentedButtonItem
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that may be slotted inside `ui5-select` as options
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.IOption
     * @ui5-module-override sap/f/gen/ui5/webcomponents IOption
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that may be slotted inside `ui5-tabcontainer` as items
     *
     * **Note:** Use directly `ui5-tab` or `ui5-tab-seprator`. Implementing the interface does not guarantee that the class can work as a tab.
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.ITab
     * @ui5-module-override sap/f/gen/ui5/webcomponents ITab
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that can be slotted inside the `features` slot of the `ui5-table`.
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.ITableFeature
     * @ui5-module-override sap/f/gen/ui5/webcomponents ITableFeature
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that can be slotted inside the `features` slot of the `ui5-table`
     * and provide growing/data loading functionality.
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents.ITableGrowing
     * @ui5-module-override sap/f/gen/ui5/webcomponents ITableGrowing
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */

    // marker to threat this as an ES module to support named exports
    pkg.__esModule = true;

    return pkg;
  }
);
