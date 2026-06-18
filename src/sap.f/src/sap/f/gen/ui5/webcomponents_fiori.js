/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/thirdparty/webcomponents-fiori",
    "sap/ui/base/DataType",
    "sap/f/gen/ui5/webcomponents",
    "sap/f/gen/ui5/webcomponents_base"
  ],
  function (WebCPackage, DataType) {
    "use strict";
    const { registerEnum } = DataType;

    // re-export package object
    const pkg = Object.assign({}, WebCPackage);

    // export the UI5 metadata along with the package
    pkg["_ui5metadata"] = {
      name: "sap/f/gen/ui5/webcomponents_fiori",
      version: "2.23.1",
      dependencies: ["sap.ui.core"],
      types: [
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.FCLLayout",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.HeroBannerActionsPlacement",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.HeroBannerColumnsRatio",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.HeroBannerHeaderBlockPlacement",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.IllustrationMessageDesign",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.IllustrationMessageType",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.MediaGalleryItemLayout",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.MediaGalleryLayout",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.MediaGalleryMenuHorizontalAlign",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.MediaGalleryMenuVerticalAlign",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.NavigationLayoutMode",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.NotificationListItemImportance",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.PageBackgroundDesign",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.SearchMode",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.SideContentFallDown",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.SideContentPosition",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.SideContentVisibility",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.SideNavigationItemDesign",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.TimelineGrowingMode",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.TimelineLayout",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.UploadCollectionSelectionMode",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.UploadState",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.ViewSettingsDialogMode",
        "sap.f.gen.ui5.webcomponents_fiori.dist.types.WizardContentLayout"
      ],
      interfaces: [
        "sap.f.gen.ui5.webcomponents_fiori.dist.MediaGallery.IMediaGalleryItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.ProductSwitch.IProductSwitchItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.SearchField.ISearchScope",
        "sap.f.gen.ui5.webcomponents_fiori.dist.Timeline.ITimelineItem"
      ],
      controls: [
        "sap.f.gen.ui5.webcomponents_fiori.dist.BarcodeScannerDialog",
        "sap.f.gen.ui5.webcomponents_fiori.dist.DynamicPage",
        "sap.f.gen.ui5.webcomponents_fiori.dist.DynamicPageHeader",
        "sap.f.gen.ui5.webcomponents_fiori.dist.DynamicPageHeaderActions",
        "sap.f.gen.ui5.webcomponents_fiori.dist.DynamicPageTitle",
        "sap.f.gen.ui5.webcomponents_fiori.dist.DynamicSideContent",
        "sap.f.gen.ui5.webcomponents_fiori.dist.FilterItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.FilterItemOption",
        "sap.f.gen.ui5.webcomponents_fiori.dist.FlexibleColumnLayout",
        "sap.f.gen.ui5.webcomponents_fiori.dist.GroupItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.HeroBanner",
        "sap.f.gen.ui5.webcomponents_fiori.dist.IllustratedMessage",
        "sap.f.gen.ui5.webcomponents_fiori.dist.MediaGallery",
        "sap.f.gen.ui5.webcomponents_fiori.dist.MediaGalleryItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.NavigationLayout",
        "sap.f.gen.ui5.webcomponents_fiori.dist.NavigationMenu",
        "sap.f.gen.ui5.webcomponents_fiori.dist.NavigationMenuItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationList",
        "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationListGroupItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationListGroupList",
        "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationListInternal",
        "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationListItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.Page",
        "sap.f.gen.ui5.webcomponents_fiori.dist.ProductSwitch",
        "sap.f.gen.ui5.webcomponents_fiori.dist.ProductSwitchItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.Search",
        "sap.f.gen.ui5.webcomponents_fiori.dist.SearchField",
        "sap.f.gen.ui5.webcomponents_fiori.dist.SearchItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.SearchItemGroup",
        "sap.f.gen.ui5.webcomponents_fiori.dist.SearchItemShowMore",
        "sap.f.gen.ui5.webcomponents_fiori.dist.SearchMessageArea",
        "sap.f.gen.ui5.webcomponents_fiori.dist.SearchScope",
        "sap.f.gen.ui5.webcomponents_fiori.dist.ShellBar",
        "sap.f.gen.ui5.webcomponents_fiori.dist.ShellBarBranding",
        "sap.f.gen.ui5.webcomponents_fiori.dist.ShellBarItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.ShellBarSearch",
        "sap.f.gen.ui5.webcomponents_fiori.dist.ShellBarSpacer",
        "sap.f.gen.ui5.webcomponents_fiori.dist.SideNavigation",
        "sap.f.gen.ui5.webcomponents_fiori.dist.SideNavigationGroup",
        "sap.f.gen.ui5.webcomponents_fiori.dist.SideNavigationItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.SideNavigationSubItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.SortItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.Timeline",
        "sap.f.gen.ui5.webcomponents_fiori.dist.TimelineGroupItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.TimelineItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.UploadCollection",
        "sap.f.gen.ui5.webcomponents_fiori.dist.UploadCollectionItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenu",
        "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuAccount",
        "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuItemGroup",
        "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsAccountView",
        "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsAppearanceView",
        "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsAppearanceViewGroup",
        "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsAppearanceViewItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsDialog",
        "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsItem",
        "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsView",
        "sap.f.gen.ui5.webcomponents_fiori.dist.ViewSettingsDialog",
        "sap.f.gen.ui5.webcomponents_fiori.dist.ViewSettingsDialogCustomTab",
        "sap.f.gen.ui5.webcomponents_fiori.dist.Wizard",
        "sap.f.gen.ui5.webcomponents_fiori.dist.WizardStep",
        "sap.f.gen.ui5.webcomponents_fiori.dist.WizardTab"
      ],
      elements: [],
      rootPath: "../"
    };

    // Enums
    /**
     * Different types of FCLLayout.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/FCLLayout
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori FCLLayout
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["FCLLayout"] = {
      /**
       * Desktop: Fixed -- -- 100 percent widths of columns, only the End column is displayed
       * Tablet:  Fixed -- -- 100 percent widths of columns, only the End column is displayed
       * Phone:   Fixed -- -- 100 percent widths of columns, only the End column is displayed
       *
       * Use to display a detail-detail page only, when the user should focus entirely on it.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      EndColumnFullScreen: "EndColumnFullScreen",
      /**
       * Desktop: Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       * Tablet:  Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       * Phone:   Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       *
       * Use to display a detail page only, when the user should focus entirely on it.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      MidColumnFullScreen: "MidColumnFullScreen",
      /**
       * The layout will display 1 column.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      OneColumn: "OneColumn",
      /**
       * Desktop: Defaults to 25 - 25 - 50 percent widths of columns. Start, Mid and End (expanded) columns are displayed
       * Tablet:  Defaults to 0 - 33 - 67 percent widths of columns. Mid and End (expanded) columns are displayed, Start is accessible by dragging the columns-separator
       * Phone:   Fixed -- -- 100 percent widths of columns (only the End column is displayed)
       *
       * Use to display all three pages (list, detail, detail-detail) when the user should focus on the detail-detail.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ThreeColumnsEndExpanded: "ThreeColumnsEndExpanded",
      /**
       * Desktop: Defaults to 25 - 50 - 25 percent widths of columns. Start, Mid (expanded) and End columns are displayed
       * Tablet:  Defaults to 0 - 67 - 33 percent widths of columns. Mid (expanded) and End columns are displayed, Start is accessible by dragging the columns-separator
       * Phone:   Fixed -- -- 100 percent widths of columns, only the End column is displayed
       *
       * Use to display all three pages (list, detail, detail-detail) when the user should focus on the detail.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ThreeColumnsMidExpanded: "ThreeColumnsMidExpanded",
      /**
       * Desktop: Defaults to 33 - 67 - 0 percent widths of columns. Start and Mid (expanded) columns are displayed, End is accessible by dragging the columns-separator
       * Tablet:  Defaults to 33 - 67 - 0 percent widths of columns. Start and Mid (expanded) columns are displayed, End is accessible by dragging the columns-separator
       * Phone:   Fixed -- -- 100 percent widths of columns, only the End column is displayed
       *
       * Use to display the list and detail pages when the user should focus on the detail.
       * The detail-detail is still loaded and easily accessible by dragging the columns-separator
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ThreeColumnsMidExpandedEndHidden: "ThreeColumnsMidExpandedEndHidden",
      /**
       * Desktop: Defaults to 67 - 33 - 0 percent widths of columns. Start (expanded) and Mid columns are displayed, End is accessible by dragging the columns-separator
       * Tablet:  Defaults to 67 - 33 - 0 percent widths of columns. Start (expanded) and Mid columns are displayed, End is accessible by dragging the columns-separator
       * Phone:   Fixed -- -- 100 percent widths of columns, only the End column is displayed
       *
       * Use to display the list and detail pages when the user should focus on the list.
       * The detail-detail is still loaded and easily accessible by dragging the columns-separator
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ThreeColumnsStartExpandedEndHidden: "ThreeColumnsStartExpandedEndHidden",
      /**
       * Desktop: Defaults to 0 - 33 - 67 percent widths of columns. Start is hidden, Mid and End (expanded) columns are displayed.
       * Tablet:  Defaults to 0 - 33 - 67 percent widths of columns. Start is hidden, Mid and End (expanded) columns are displayed.
       * Phone:   Fixed -- 100 percent width of the End column, only the End column is displayed.
       *
       * Use to display the Mid column and expanded End column while the grip of the separator is not visible.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ThreeColumnsStartHiddenEndExpanded: "ThreeColumnsStartHiddenEndExpanded",
      /**
       * Desktop: Defaults to 0 - 67 - 33 percent widths of columns. Start is hidden, Mid (expanded) and End columns are displayed.
       * Tablet:  Defaults to 0 - 67 - 33 percent widths of columns. Start is hidden, Mid (expanded) and End columns are displayed.
       * Phone:   Fixed -- 100 percent width of the Mid column, only the Mid column is displayed.
       *
       * Use to display the Mid and End columns while the Start column is hidden.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ThreeColumnsStartHiddenMidExpanded: "ThreeColumnsStartHiddenMidExpanded",
      /**
       * Desktop: Defaults to 33 - 67 - -- percent widths of columns. Start and Mid (expanded) columns are displayed
       * Tablet:  Defaults to 33 - 67 - -- percent widths of columns. Start and Mid (expanded) columns are displayed
       * Phone:   Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       *
       * Use to display both a list and a detail page when the user should focus on the detail page.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TwoColumnsMidExpanded: "TwoColumnsMidExpanded",
      /**
       *
       * Desktop: Defaults to 67 - 33 - -- percent widths of columns. Start (expanded) and Mid columns are displayed.
       * Tablet:  Defaults to 67 - 33 - -- percent widths of columns. Start (expanded) and Mid columns are displayed.
       * Phone:   Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       *
       * Use to display both a list and a detail page when the user should focus on the list page.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TwoColumnsStartExpanded: "TwoColumnsStartExpanded"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.FCLLayout",
      pkg["FCLLayout"]
    );
    /**
     * Available HeroBanner actions placement options.
     *
     * Defines where the actions slot is rendered within the hero banner header area.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/HeroBannerActionsPlacement
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori HeroBannerActionsPlacement
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["HeroBannerActionsPlacement"] = {
      /**
       * Places the actions below the header text, aligned to the start.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      BottomStart: "BottomStart",
      /**
       * Places the actions to the right of the header text, aligned to the top of the header row.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TopEnd: "TopEnd"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.HeroBannerActionsPlacement",
      pkg["HeroBannerActionsPlacement"]
    );
    /**
     * Available HeroBanner columns ratio options.
     *
     * Defines how the two content blocks are sized relative to each other within the hero banner.
     * When no value is set, the content renders in a single column.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/HeroBannerColumnsRatio
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori HeroBannerColumnsRatio
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["HeroBannerColumnsRatio"] = {
      /**
       * Two equal columns. Both content blocks share the available width equally.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Equal: "Equal",
      /**
       * Two unequal columns. The first content block takes two-thirds of the width, the second takes one-third.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      FirstWider: "FirstWider"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.HeroBannerColumnsRatio",
      pkg["HeroBannerColumnsRatio"]
    );
    /**
     * Available HeroBanner header text block placement options.
     *
     * Defines the vertical placement of the header text block within the banner header area.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/HeroBannerHeaderBlockPlacement
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori HeroBannerHeaderBlockPlacement
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["HeroBannerHeaderBlockPlacement"] = {
      /**
       * Places the header text block at the bottom of the header area.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Bottom: "Bottom",
      /**
       * Places the header text block at the top of the header area.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Top: "Top"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.HeroBannerHeaderBlockPlacement",
      pkg["HeroBannerHeaderBlockPlacement"]
    );
    /**
     * Different types of IllustrationMessageDesign.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/IllustrationMessageDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori IllustrationMessageDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["IllustrationMessageDesign"] = {
      /**
       * Automatically decides the &lt;code&gt;Illustration&lt;/code&gt; size (&lt;code&gt;Base&lt;/code&gt;, &lt;code&gt;Dot&lt;/code&gt;, &lt;code&gt;Spot&lt;/code&gt;,
       * &lt;code&gt;Dialog&lt;/code&gt;, or &lt;code&gt;Scene&lt;/code&gt;) depending on the &lt;code&gt;IllustratedMessage&lt;/code&gt; container width.
       *
       * **Note:** &#x60;Auto&#x60; is the only option where the illustration size is changed according to
       * the available container width. If any other &#x60;IllustratedMessageSize&#x60; is chosen, it remains
       * until changed by the app developer.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Auto: "Auto",
      /**
       * Base &#x60;Illustration&#x60; size (XS breakpoint). Suitable for cards (two columns).
       *
       * **Note:** When &#x60;Base&#x60; is in use, no illustration is displayed.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Base: "Base",
      /**
       * Dialog &#x60;Illustration&#x60; size (M breakpoint). Suitable for dialogs.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Dialog: "Dialog",
      /**
       * Dot &lt;code&gt;Illustration&lt;/code&gt; size (XS breakpoint). Suitable for table rows.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Dot: "Dot",
      /**
       * ExtraSmall &lt;code&gt;Illustration&lt;/code&gt; size (XS breakpoint). Suitable for table rows.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ExtraSmall: "ExtraSmall",
      /**
       * Large &#x60;Illustration&#x60; size (L breakpoint). Suitable for a &#x60;Page&#x60; or a table.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Large: "Large",
      /**
       * Medium &#x60;Illustration&#x60; size (M breakpoint). Suitable for dialogs.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Medium: "Medium",
      /**
       * Scene &#x60;Illustration&#x60; size (L breakpoint). Suitable for a &#x60;Page&#x60; or a table.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Scene: "Scene",
      /**
       * Small &lt;code&gt;Illustration&lt;/code&gt; size (S breakpoint). Suitable for cards (four columns).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Small: "Small",
      /**
       * Spot &lt;code&gt;Illustration&lt;/code&gt; size (S breakpoint). Suitable for cards (four columns).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Spot: "Spot"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.IllustrationMessageDesign",
      pkg["IllustrationMessageDesign"]
    );
    /**
     * Different illustration types of Illustrated Message.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/IllustrationMessageType
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori IllustrationMessageType
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["IllustrationMessageType"] = {
      /**
       * &quot;Achievement&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Achievement: "Achievement",
      /**
       * &quot;Add Column&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      AddColumn: "AddColumn",
      /**
       * &quot;Add Dimensions&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      AddDimensions: "AddDimensions",
      /**
       * &quot;Adding Columns&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      AddingColumns: "AddingColumns",
      /**
       * &quot;Add People&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      AddPeople: "AddPeople",
      /**
       * &quot;Add People To Calendar&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      AddPeopleToCalendar: "AddPeopleToCalendar",
      /**
       * &quot;Balloon Sky&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      BalloonSky: "BalloonSky",
      /**
       * &quot;Before Search&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      BeforeSearch: "BeforeSearch",
      /**
       * &quot;Connection&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Connection: "Connection",
      /**
       * &quot;Drag Files To Upload&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      DragFilesToUpload: "DragFilesToUpload",
      /**
       * &quot;Empty Calendar&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      EmptyCalendar: "EmptyCalendar",
      /**
       * &quot;Empty List&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      EmptyList: "EmptyList",
      /**
       * &quot;Empty Planning Calendar&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      EmptyPlanningCalendar: "EmptyPlanningCalendar",
      /**
       * &quot;Error Screen&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ErrorScreen: "ErrorScreen",
      /**
       * &quot;Filtering Columns&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      FilteringColumns: "FilteringColumns",
      /**
       * &quot;Filter Table&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      FilterTable: "FilterTable",
      /**
       * &quot;Grouping Columns&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      GroupingColumns: "GroupingColumns",
      /**
       * &quot;Group Table&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      GroupTable: "GroupTable",
      /**
       * &quot;Key Task&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      KeyTask: "KeyTask",
      /**
       * &quot;New Mail&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NewMail: "NewMail",
      /**
       * &quot;No Activities&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoActivities: "NoActivities",
      /**
       * &quot;No Chart Data&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoChartData: "NoChartData",
      /**
       * &quot;No Columns Set&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoColumnsSet: "NoColumnsSet",
      /**
       * &quot;No Data&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoData: "NoData",
      /**
       * &quot;No Dimensions Set&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoDimensionsSet: "NoDimensionsSet",
      /**
       * &quot;No Entries&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoEntries: "NoEntries",
      /**
       * &quot;No Filter Results&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoFilterResults: "NoFilterResults",
      /**
       * &quot;No Email&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoMail: "NoMail",
      /**
       * &quot;No Email v1&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoMail_v1: "NoMail_v1",
      /**
       * &quot;No Notifications&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoNotifications: "NoNotifications",
      /**
       * &quot;No Saved Items&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoSavedItems: "NoSavedItems",
      /**
       * &quot;No Saved Items v1&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoSavedItems_v1: "NoSavedItems_v1",
      /**
       * &quot;No Search Results&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoSearchResults: "NoSearchResults",
      /**
       * &quot;No Tasks&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoTasks: "NoTasks",
      /**
       * &quot;No Tasks v1&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NoTasks_v1: "NoTasks_v1",
      /**
       * &quot;Page Not Found&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      PageNotFound: "PageNotFound",
      /**
       * &quot;Receive Appreciation&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ReceiveAppreciation: "ReceiveAppreciation",
      /**
       * &quot;Reload Screen&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ReloadScreen: "ReloadScreen",
      /**
       * &quot;Resize Column&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ResizeColumn: "ResizeColumn",
      /**
       * &quot;Resizing Columns&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ResizingColumns: "ResizingColumns",
      /**
       * &quot;Search Earth&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SearchEarth: "SearchEarth",
      /**
       * &quot;Search Folder&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SearchFolder: "SearchFolder",
      /**
       * &quot;Sign Out&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SignOut: "SignOut",
      /**
       * &quot;Simple Balloon&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SimpleBalloon: "SimpleBalloon",
      /**
       * &quot;Simple Bell&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SimpleBell: "SimpleBell",
      /**
       * &quot;Simple Calendar&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SimpleCalendar: "SimpleCalendar",
      /**
       * &quot;Simple CheckMark&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SimpleCheckMark: "SimpleCheckMark",
      /**
       * &quot;Simple Connection&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SimpleConnection: "SimpleConnection",
      /**
       * &quot;Simple Empty Doc&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SimpleEmptyDoc: "SimpleEmptyDoc",
      /**
       * &quot;Simple Empty List&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SimpleEmptyList: "SimpleEmptyList",
      /**
       * &quot;Simple Error&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SimpleError: "SimpleError",
      /**
       * &quot;Simple Magnifier&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SimpleMagnifier: "SimpleMagnifier",
      /**
       * &quot;Simple Mail&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SimpleMail: "SimpleMail",
      /**
       * &quot;Simple No Saved Items&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SimpleNoSavedItems: "SimpleNoSavedItems",
      /**
       * &quot;Simple Not Found Magnifier&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SimpleNotFoundMagnifier: "SimpleNotFoundMagnifier",
      /**
       * &quot;Simple Reload&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SimpleReload: "SimpleReload",
      /**
       * &quot;Simple Task&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SimpleTask: "SimpleTask",
      /**
       * &quot;Sleeping Bell&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SleepingBell: "SleepingBell",
      /**
       * &quot;Sort Column&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SortColumn: "SortColumn",
      /**
       * &quot;Sorting Columns&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SortingColumns: "SortingColumns",
      /**
       * &quot;Success Balloon&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SuccessBalloon: "SuccessBalloon",
      /**
       * &quot;Success CheckMark&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SuccessCheckMark: "SuccessCheckMark",
      /**
       * &quot;Success HighFive&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SuccessHighFive: "SuccessHighFive",
      /**
       * &quot;Success Screen&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SuccessScreen: "SuccessScreen",
      /**
       * &quot;Survey&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Survey: "Survey",
      /**
       * &quot;Tent&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Tent: "Tent",
      /**
       * &quot;TntAvatar&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntAvatar: "TntAvatar",
      /**
       * &quot;TntCalculator&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntCalculator: "TntCalculator",
      /**
       * &quot;TntChartArea&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntChartArea: "TntChartArea",
      /**
       * &quot;TntChartArea2&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntChartArea2: "TntChartArea2",
      /**
       * &quot;TntChartBar&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntChartBar: "TntChartBar",
      /**
       * &quot;TntChartBPMNFlow&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntChartBPMNFlow: "TntChartBPMNFlow",
      /**
       * &quot;TntChartBullet&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntChartBullet: "TntChartBullet",
      /**
       * &quot;TntChartDoughnut&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntChartDoughnut: "TntChartDoughnut",
      /**
       * &quot;TntChartFlow&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntChartFlow: "TntChartFlow",
      /**
       * &quot;TntChartGantt&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntChartGantt: "TntChartGantt",
      /**
       * &quot;TntChartOrg&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntChartOrg: "TntChartOrg",
      /**
       * &quot;TntChartPie&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntChartPie: "TntChartPie",
      /**
       * &quot;TntCodePlaceholder&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntCodePlaceholder: "TntCodePlaceholder",
      /**
       * &quot;TntCompany&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntCompany: "TntCompany",
      /**
       * &quot;TntCompass&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntCompass: "TntCompass",
      /**
       * &quot;TntComponents&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntComponents: "TntComponents",
      /**
       * &quot;TntDialog&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntDialog: "TntDialog",
      /**
       * &quot;TntEmptyContentPane&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntEmptyContentPane: "TntEmptyContentPane",
      /**
       * &quot;TntExternalLink&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntExternalLink: "TntExternalLink",
      /**
       * &quot;TntFaceID&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntFaceID: "TntFaceID",
      /**
       * &quot;TntFingerprint&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntFingerprint: "TntFingerprint",
      /**
       * &quot;TntHandshake&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntHandshake: "TntHandshake",
      /**
       * &quot;TntHelp&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntHelp: "TntHelp",
      /**
       * &quot;TntLock&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntLock: "TntLock",
      /**
       * &quot;TntMission&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntMission: "TntMission",
      /**
       * &quot;TntMissionFailed&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntMissionFailed: "TntMissionFailed",
      /**
       * &quot;TntNoApplications&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntNoApplications: "TntNoApplications",
      /**
       * &quot;TntNoFlows&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntNoFlows: "TntNoFlows",
      /**
       * &quot;TntNoUsers&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntNoUsers: "TntNoUsers",
      /**
       * &quot;TntRadar&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntRadar: "TntRadar",
      /**
       * &quot;TntRoadMap&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntRoadMap: "TntRoadMap",
      /**
       * &quot;TntSecrets&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntSecrets: "TntSecrets",
      /**
       * &quot;TntServices&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntServices: "TntServices",
      /**
       * &quot;TntSessionExpired&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntSessionExpired: "TntSessionExpired",
      /**
       * &quot;TntSessionExpiring&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntSessionExpiring: "TntSessionExpiring",
      /**
       * &quot;TntSettings&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntSettings: "TntSettings",
      /**
       * &quot;TntSuccess&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntSuccess: "TntSuccess",
      /**
       * &quot;TntSuccessfulAuth&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntSuccessfulAuth: "TntSuccessfulAuth",
      /**
       * &quot;TntSystems&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntSystems: "TntSystems",
      /**
       * &quot;TntTeams&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntTeams: "TntTeams",
      /**
       * &quot;TntTools&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntTools: "TntTools",
      /**
       * &quot;TntTutorials&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntTutorials: "TntTutorials",
      /**
       * &quot;TntUnableToLoad&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntUnableToLoad: "TntUnableToLoad",
      /**
       * &quot;TntUnlock&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntUnlock: "TntUnlock",
      /**
       * &quot;TntUnsuccessfulAuth&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntUnsuccessfulAuth: "TntUnsuccessfulAuth",
      /**
       * &quot;TntUser2&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      TntUser2: "TntUser2",
      /**
       * &quot;Unable To Load&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      UnableToLoad: "UnableToLoad",
      /**
       * &quot;Unable To Load Image&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      UnableToLoadImage: "UnableToLoadImage",
      /**
       * &quot;Unable To Upload&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      UnableToUpload: "UnableToUpload",
      /**
       * &quot;Upload Collection&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      UploadCollection: "UploadCollection",
      /**
       * &quot;Upload To Cloud&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      UploadToCloud: "UploadToCloud",
      /**
       * &quot;User Has Signed Up&quot; illustration type.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      UserHasSignedUp: "UserHasSignedUp"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.IllustrationMessageType",
      pkg["IllustrationMessageType"]
    );
    /**
     * Defines the layout of the content displayed in the `ui5-media-gallery-item`.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/MediaGalleryItemLayout
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori MediaGalleryItemLayout
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["MediaGalleryItemLayout"] = {
      /**
       * Recommended to use when the item contains an image.
       *
       * When a thumbnail is selected, it makes the corresponding enlarged content appear in a square display area.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Square: "Square",
      /**
       * Recommended to use when the item contains video content.
       *
       * When a thumbnail is selected, it makes the corresponding enlarged content appear in a wide display area
       * (stretched to fill all of the available width) for optimal user experiance.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Wide: "Wide"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.MediaGalleryItemLayout",
      pkg["MediaGalleryItemLayout"]
    );
    /**
     * Defines the layout type of the thumbnails list of the `ui5-media-gallery` component.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/MediaGalleryLayout
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori MediaGalleryLayout
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["MediaGalleryLayout"] = {
      /**
       * The layout is determined automatically.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Auto: "Auto",
      /**
       * Displays the layout as a horizontal split between the thumbnails list and the selected image.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Horizontal: "Horizontal",
      /**
       * Displays the layout as a vertical split between the thumbnails list and the selected image.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Vertical: "Vertical"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.MediaGalleryLayout",
      pkg["MediaGalleryLayout"]
    );
    /**
     * Defines the horizontal alignment of the thumbnails menu of the `ui5-media-gallery` component.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/MediaGalleryMenuHorizontalAlign
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori MediaGalleryMenuHorizontalAlign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["MediaGalleryMenuHorizontalAlign"] = {
      /**
       * Displays the menu on the left side of the target.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Left: "Left",
      /**
       * Displays the menu on the right side of the target.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Right: "Right"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.MediaGalleryMenuHorizontalAlign",
      pkg["MediaGalleryMenuHorizontalAlign"]
    );
    /**
     * Types for the vertical alignment of the thumbnails menu of the `ui5-media-gallery` component.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/MediaGalleryMenuVerticalAlign
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori MediaGalleryMenuVerticalAlign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["MediaGalleryMenuVerticalAlign"] = {
      /**
       * Displays the menu at the bottom of the reference control.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Bottom: "Bottom",
      /**
       * Displays the menu at the top of the reference control.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Top: "Top"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.MediaGalleryMenuVerticalAlign",
      pkg["MediaGalleryMenuVerticalAlign"]
    );
    /**
     * Specifies the navigation layout mode.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/NavigationLayoutMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori NavigationLayoutMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["NavigationLayoutMode"] = {
      /**
       * Automatically calculates the navigation layout mode based on the screen width.
       * &#x60;Collapsed&#x60; on small screens (screen width of 599px or less) and &#x60;Expanded&#x60; on larger screens (screen width of 600px or more).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Auto: "Auto",
      /**
       * Collapsed side navigation.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Collapsed: "Collapsed",
      /**
       * Expanded side navigation.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Expanded: "Expanded"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.NavigationLayoutMode",
      pkg["NavigationLayoutMode"]
    );
    /**
     * Different types of NotificationListItemImportance.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/NotificationListItemImportance
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori NotificationListItemImportance
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["NotificationListItemImportance"] = {
      /**
       * Important
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Important: "Important",
      /**
       * Standard
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Standard: "Standard"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.NotificationListItemImportance",
      pkg["NotificationListItemImportance"]
    );
    /**
     * Available Page Background Design.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/PageBackgroundDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori PageBackgroundDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["PageBackgroundDesign"] = {
      /**
       * Page background color when a List is set as the Page content.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      List: "List",
      /**
       * A solid background color dependent on the theme.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Solid: "Solid",
      /**
       * Transparent background for the page.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Transparent: "Transparent"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.PageBackgroundDesign",
      pkg["PageBackgroundDesign"]
    );
    /**
     * Search mode options.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/SearchMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori SearchMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["SearchMode"] = {
      /**
       * Search field with default appearance.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Default: "Default",
      /**
       * Search field with additional scope select.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Scoped: "Scoped"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.SearchMode",
      pkg["SearchMode"]
    );
    /**
     * SideContent FallDown options.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/SideContentFallDown
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori SideContentFallDown
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["SideContentFallDown"] = {
      /**
       * Side content falls down on breakpoints below L
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      BelowL: "BelowL",
      /**
       * Side content falls down on breakpoints below M
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      BelowM: "BelowM",
      /**
       * Side content falls down on breakpoints below XL
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      BelowXL: "BelowXL",
      /**
       * Side content falls down on breakpoint M and the minimum width for the side content
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      OnMinimumWidth: "OnMinimumWidth"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.SideContentFallDown",
      pkg["SideContentFallDown"]
    );
    /**
     * Side Content position options.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/SideContentPosition
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori SideContentPosition
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["SideContentPosition"] = {
      /**
       * The side content is on the right side of the main container
       * in left-to-right mode and on the left side in right-to-left mode.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      End: "End",
      /**
       * The side content is on the left side of the main container
       * in left-to-right mode and on the right side in right-to-left mode.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Start: "Start"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.SideContentPosition",
      pkg["SideContentPosition"]
    );
    /**
     * Side Content visibility options.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/SideContentVisibility
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori SideContentVisibility
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["SideContentVisibility"] = {
      /**
       * Show the side content on any breakpoint
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      AlwaysShow: "AlwaysShow",
      /**
       * Don&#x27;t show the side content on any breakpoints
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      NeverShow: "NeverShow",
      /**
       * Show the side content on XL breakpoint
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ShowAboveL: "ShowAboveL",
      /**
       * Show the side content on L and XL breakpoints
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ShowAboveM: "ShowAboveM",
      /**
       * Show the side content on M, L and XL breakpoints
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      ShowAboveS: "ShowAboveS"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.SideContentVisibility",
      pkg["SideContentVisibility"]
    );
    /**
     * SideNavigationItem designs.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/SideNavigationItemDesign
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori SideNavigationItemDesign
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["SideNavigationItemDesign"] = {
      /**
       * Design for items that trigger an action, such as opening a dialog.
       *
       * **Note:** Items with this design must not have sub-items.
       *
       * **Note:** Items that open a dialog must set &#x60;hasPopup&#x3D;&quot;dialog&quot;&#x60; via &#x60;accessibilityAttributes&#x60; property.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Action: "Action",
      /**
       * Design for items that perform navigation, contain navigation child items, or both.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Default: "Default"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.SideNavigationItemDesign",
      pkg["SideNavigationItemDesign"]
    );
    /**
     * Timeline growing modes.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/TimelineGrowingMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori TimelineGrowingMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["TimelineGrowingMode"] = {
      /**
       * Event &#x60;load-more&#x60; is fired
       * upon pressing a &quot;More&quot; button at the end.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Button: "Button",
      /**
       * The growing feature is not enabled.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None",
      /**
       * Event &#x60;load-more&#x60; is fired upon scroll.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Scroll: "Scroll"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.TimelineGrowingMode",
      pkg["TimelineGrowingMode"]
    );
    /**
     * Available Timeline layout orientation
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/TimelineLayout
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori TimelineLayout
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["TimelineLayout"] = {
      /**
       * Horizontal layout
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Horizontal: "Horizontal",
      /**
       * Vertical layout
       * Default type
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Vertical: "Vertical"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.TimelineLayout",
      pkg["TimelineLayout"]
    );
    /**
     * Different UploadCollection selection modes.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/UploadCollectionSelectionMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori UploadCollectionSelectionMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["UploadCollectionSelectionMode"] = {
      /**
       * Multi selection mode (more than one list item can be selected).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Multiple: "Multiple",
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
       * Selected item is highlighted and selection is changed upon arrow navigation
       * (only one list item can be selected - this is always the focused item).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SingleAuto: "SingleAuto",
      /**
       * Selected item is highlighted but no selection element is visible
       * (only one list item can be selected).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SingleEnd: "SingleEnd",
      /**
       * Left-positioned single selection mode (only one list item can be selected).
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SingleStart: "SingleStart"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.UploadCollectionSelectionMode",
      pkg["UploadCollectionSelectionMode"]
    );
    /**
     * Different types of UploadState.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/UploadState
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori UploadState
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["UploadState"] = {
      /**
       * The file has been uploaded successfully.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Complete: "Complete",
      /**
       * The file cannot be uploaded due to an error.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Error: "Error",
      /**
       * The file is awaiting an explicit command to start being uploaded.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Ready: "Ready",
      /**
       * The file is currently being uploaded.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Uploading: "Uploading"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.UploadState",
      pkg["UploadState"]
    );
    /**
     * Different types of ViewSettings.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/ViewSettingsDialogMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori ViewSettingsDialogMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ViewSettingsDialogMode"] = {
      /**
       * Filter type
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Filter: "Filter",
      /**
       * Group type
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Group: "Group",
      /**
       * Default type
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Sort: "Sort"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.ViewSettingsDialogMode",
      pkg["ViewSettingsDialogMode"]
    );
    /**
     * Enumeration for different content layouts of the `ui5-wizard`.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/types/WizardContentLayout
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori WizardContentLayout
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["WizardContentLayout"] = {
      /**
       * Display the content of the &#x60;ui5-wizard&#x60; as multiple steps in a scroll section.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      MultipleSteps: "MultipleSteps",
      /**
       * Display the content of the &#x60;ui5-wizard&#x60; as single step.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      SingleStep: "SingleStep"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.dist.types.WizardContentLayout",
      pkg["WizardContentLayout"]
    );

    // Interfaces
    /**
     * Interface for components that can be slotted inside `ui5-media-gallery` as items.
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents_fiori/dist/MediaGallery.IMediaGalleryItem
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori IMediaGalleryItem
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that may be slotted inside `ui5-product-switch` as items
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents_fiori/dist/ProductSwitch.IProductSwitchItem
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori IProductSwitchItem
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that may be slotted inside a `ui5-search`
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents_fiori/dist/SearchField.ISearchScope
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori ISearchScope
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    /**
     * Interface for components that may be slotted inside `ui5-timeline` as items
     *
     * @interface
     * @name module:sap/f/gen/ui5/webcomponents_fiori/dist/Timeline.ITimelineItem
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori ITimelineItem
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */

    // marker to threat this as an ES module to support named exports
    pkg.__esModule = true;

    return pkg;
  }
);
