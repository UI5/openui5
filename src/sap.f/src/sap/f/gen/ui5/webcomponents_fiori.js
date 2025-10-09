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

    const pkg = {
      _ui5metadata: {
        name: "sap/f/gen/ui5/webcomponents_fiori",
        version: "2.15.0",
        dependencies: ["sap.ui.core"],
        types: [
          "sap.f.gen.ui5.webcomponents_fiori.FCLLayout",
          "sap.f.gen.ui5.webcomponents_fiori.IllustrationMessageDesign",
          "sap.f.gen.ui5.webcomponents_fiori.IllustrationMessageType",
          "sap.f.gen.ui5.webcomponents_fiori.MediaGalleryItemLayout",
          "sap.f.gen.ui5.webcomponents_fiori.MediaGalleryLayout",
          "sap.f.gen.ui5.webcomponents_fiori.MediaGalleryMenuHorizontalAlign",
          "sap.f.gen.ui5.webcomponents_fiori.MediaGalleryMenuVerticalAlign",
          "sap.f.gen.ui5.webcomponents_fiori.NavigationLayoutMode",
          "sap.f.gen.ui5.webcomponents_fiori.NotificationListItemImportance",
          "sap.f.gen.ui5.webcomponents_fiori.PageBackgroundDesign",
          "sap.f.gen.ui5.webcomponents_fiori.SearchMode",
          "sap.f.gen.ui5.webcomponents_fiori.SideContentFallDown",
          "sap.f.gen.ui5.webcomponents_fiori.SideContentPosition",
          "sap.f.gen.ui5.webcomponents_fiori.SideContentVisibility",
          "sap.f.gen.ui5.webcomponents_fiori.SideNavigationItemDesign",
          "sap.f.gen.ui5.webcomponents_fiori.TimelineGrowingMode",
          "sap.f.gen.ui5.webcomponents_fiori.TimelineLayout",
          "sap.f.gen.ui5.webcomponents_fiori.UploadCollectionSelectionMode",
          "sap.f.gen.ui5.webcomponents_fiori.UploadState",
          "sap.f.gen.ui5.webcomponents_fiori.ViewSettingsDialogMode",
          "sap.f.gen.ui5.webcomponents_fiori.WizardContentLayout"
        ],
        interfaces: [
          "sap.f.gen.ui5.webcomponents_fiori.IMediaGalleryItem",
          "sap.f.gen.ui5.webcomponents_fiori.IProductSwitchItem",
          "sap.f.gen.ui5.webcomponents_fiori.ISearchScope",
          "sap.f.gen.ui5.webcomponents_fiori.ITimelineItem"
        ],
        controls: [
          "sap.f.gen.ui5.webcomponents_fiori.dist.BarcodeScannerDialog",
          "sap.f.gen.ui5.webcomponents_fiori.dist.DynamicPage",
          "sap.f.gen.ui5.webcomponents_fiori.dist.DynamicPageHeader",
          "sap.f.gen.ui5.webcomponents_fiori.dist.DynamicPageTitle",
          "sap.f.gen.ui5.webcomponents_fiori.dist.DynamicSideContent",
          "sap.f.gen.ui5.webcomponents_fiori.dist.FilterItem",
          "sap.f.gen.ui5.webcomponents_fiori.dist.FilterItemOption",
          "sap.f.gen.ui5.webcomponents_fiori.dist.FlexibleColumnLayout",
          "sap.f.gen.ui5.webcomponents_fiori.dist.GroupItem",
          "sap.f.gen.ui5.webcomponents_fiori.dist.IllustratedMessage",
          "sap.f.gen.ui5.webcomponents_fiori.dist.MediaGallery",
          "sap.f.gen.ui5.webcomponents_fiori.dist.MediaGalleryItem",
          "sap.f.gen.ui5.webcomponents_fiori.dist.NavigationLayout",
          "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationList",
          "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationListGroupItem",
          "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationListItem",
          "sap.f.gen.ui5.webcomponents_fiori.dist.Page",
          "sap.f.gen.ui5.webcomponents_fiori.dist.ProductSwitch",
          "sap.f.gen.ui5.webcomponents_fiori.dist.ProductSwitchItem",
          "sap.f.gen.ui5.webcomponents_fiori.dist.Search",
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
          "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsDialog",
          "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsItem",
          "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsView",
          "sap.f.gen.ui5.webcomponents_fiori.dist.ViewSettingsDialog",
          "sap.f.gen.ui5.webcomponents_fiori.dist.Wizard",
          "sap.f.gen.ui5.webcomponents_fiori.dist.WizardStep"
        ],
        elements: [],
        rootPath: "../"
      }
    };

    if (WebCPackage) {
      Object.keys(WebCPackage).forEach((key) => {
        if (key !== "default") {
          pkg[key] = WebCPackage[key];
        } else {
          if (typeof WebCPackage[key] === "object") {
            Object.assign(pkg, WebCPackage[key]);
          }
        }
      });
    }

    /**
     * Different types of FCLLayout.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.FCLLayout
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori FCLLayout
     *
     * @private
     */
    pkg["FCLLayout"] = {
      /**
       * The layout will display 1 column.
       *
       * @private
       */
      OneColumn: "OneColumn",
      /**
       *
       * Desktop: Defaults to 67 - 33 - -- percent widths of columns. Start (expanded) and Mid columns are displayed.
       * Tablet:  Defaults to 67 - 33 - -- percent widths of columns. Start (expanded) and Mid columns are displayed.
       * Phone:   Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       *
       * Use to display both a list and a detail page when the user should focus on the list page.
       *
       * @private
       */
      TwoColumnsStartExpanded: "TwoColumnsStartExpanded",
      /**
       * Desktop: Defaults to 33 - 67 - -- percent widths of columns. Start and Mid (expanded) columns are displayed
       * Tablet:  Defaults to 33 - 67 - -- percent widths of columns. Start and Mid (expanded) columns are displayed
       * Phone:   Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       *
       * Use to display both a list and a detail page when the user should focus on the detail page.
       *
       * @private
       */
      TwoColumnsMidExpanded: "TwoColumnsMidExpanded",
      /**
       * Desktop: Defaults to 25 - 50 - 25 percent widths of columns. Start, Mid (expanded) and End columns are displayed
       * Tablet:  Defaults to 0 - 67 - 33 percent widths of columns. Mid (expanded) and End columns are displayed, Start is accessible by dragging the columns-separator
       * Phone:   Fixed -- -- 100 percent widths of columns, only the End column is displayed
       *
       * Use to display all three pages (list, detail, detail-detail) when the user should focus on the detail.
       *
       * @private
       */
      ThreeColumnsMidExpanded: "ThreeColumnsMidExpanded",
      /**
       * Desktop: Defaults to 25 - 25 - 50 percent widths of columns. Start, Mid and End (expanded) columns are displayed
       * Tablet:  Defaults to 0 - 33 - 67 percent widths of columns. Mid and End (expanded) columns are displayed, Start is accessible by dragging the columns-separator
       * Phone:   Fixed -- -- 100 percent widths of columns (only the End column is displayed)
       *
       * Use to display all three pages (list, detail, detail-detail) when the user should focus on the detail-detail.
       *
       * @private
       */
      ThreeColumnsEndExpanded: "ThreeColumnsEndExpanded",
      /**
       * Desktop: Defaults to 67 - 33 - 0 percent widths of columns. Start (expanded) and Mid columns are displayed, End is accessible by dragging the columns-separator
       * Tablet:  Defaults to 67 - 33 - 0 percent widths of columns. Start (expanded) and Mid columns are displayed, End is accessible by dragging the columns-separator
       * Phone:   Fixed -- -- 100 percent widths of columns, only the End column is displayed
       *
       * Use to display the list and detail pages when the user should focus on the list.
       * The detail-detail is still loaded and easily accessible by dragging the columns-separator
       *
       * @private
       */
      ThreeColumnsStartExpandedEndHidden: "ThreeColumnsStartExpandedEndHidden",
      /**
       * Desktop: Defaults to 33 - 67 - 0 percent widths of columns. Start and Mid (expanded) columns are displayed, End is accessible by dragging the columns-separator
       * Tablet:  Defaults to 33 - 67 - 0 percent widths of columns. Start and Mid (expanded) columns are displayed, End is accessible by dragging the columns-separator
       * Phone:   Fixed -- -- 100 percent widths of columns, only the End column is displayed
       *
       * Use to display the list and detail pages when the user should focus on the detail.
       * The detail-detail is still loaded and easily accessible by dragging the columns-separator
       *
       * @private
       */
      ThreeColumnsMidExpandedEndHidden: "ThreeColumnsMidExpandedEndHidden",
      /**
       * Desktop: Defaults to 0 - 67 - 33 percent widths of columns. Start is hidden, Mid (expanded) and End columns are displayed.
       * Tablet:  Defaults to 0 - 67 - 33 percent widths of columns. Start is hidden, Mid (expanded) and End columns are displayed.
       * Phone:   Fixed -- 100 percent width of the Mid column, only the Mid column is displayed.
       *
       * Use to display the Mid and End columns while the Start column is hidden.
       *
       * @private
       */
      ThreeColumnsStartHiddenMidExpanded: "ThreeColumnsStartHiddenMidExpanded",
      /**
       * Desktop: Defaults to 0 - 33 - 67 percent widths of columns. Start is hidden, Mid and End (expanded) columns are displayed.
       * Tablet:  Defaults to 0 - 33 - 67 percent widths of columns. Start is hidden, Mid and End (expanded) columns are displayed.
       * Phone:   Fixed -- 100 percent width of the End column, only the End column is displayed.
       *
       * Use to display the Mid column and expanded End column while the grip of the separator is not visible.
       *
       * @private
       */
      ThreeColumnsStartHiddenEndExpanded: "ThreeColumnsStartHiddenEndExpanded",
      /**
       * Desktop: Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       * Tablet:  Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       * Phone:   Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       *
       * Use to display a detail page only, when the user should focus entirely on it.
       *
       * @private
       */
      MidColumnFullScreen: "MidColumnFullScreen",
      /**
       * Desktop: Fixed -- -- 100 percent widths of columns, only the End column is displayed
       * Tablet:  Fixed -- -- 100 percent widths of columns, only the End column is displayed
       * Phone:   Fixed -- -- 100 percent widths of columns, only the End column is displayed
       *
       * Use to display a detail-detail page only, when the user should focus entirely on it.
       *
       * @private
       */
      EndColumnFullScreen: "EndColumnFullScreen"
    };
    registerEnum("sap.f.gen.ui5.webcomponents_fiori.FCLLayout", pkg["FCLLayout"]);
    /**
     * Different types of IllustrationMessageDesign.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.IllustrationMessageDesign
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori IllustrationMessageDesign
     *
     * @private
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
       */
      Auto: "Auto",
      /**
       * Base &#x60;Illustration&#x60; size (XS breakpoint). Suitable for cards (two columns).
       *
       * **Note:** When &#x60;Base&#x60; is in use, no illustration is displayed.
       *
       * @private
       */
      Base: "Base",
      /**
       * Dot &lt;code&gt;Illustration&lt;/code&gt; size (XS breakpoint). Suitable for table rows.
       *
       * @private
       */
      Dot: "Dot",
      /**
       * Spot &lt;code&gt;Illustration&lt;/code&gt; size (S breakpoint). Suitable for cards (four columns).
       *
       * @private
       */
      Spot: "Spot",
      /**
       * Dialog &#x60;Illustration&#x60; size (M breakpoint). Suitable for dialogs.
       *
       * @private
       */
      Dialog: "Dialog",
      /**
       * Scene &#x60;Illustration&#x60; size (L breakpoint). Suitable for a &#x60;Page&#x60; or a table.
       *
       * @private
       */
      Scene: "Scene",
      /**
       * ExtraSmall &lt;code&gt;Illustration&lt;/code&gt; size (XS breakpoint). Suitable for table rows.
       *
       * @private
       */
      ExtraSmall: "ExtraSmall",
      /**
       * Small &lt;code&gt;Illustration&lt;/code&gt; size (S breakpoint). Suitable for cards (four columns).
       *
       * @private
       */
      Small: "Small",
      /**
       * Medium &#x60;Illustration&#x60; size (M breakpoint). Suitable for dialogs.
       *
       * @private
       */
      Medium: "Medium",
      /**
       * Large &#x60;Illustration&#x60; size (L breakpoint). Suitable for a &#x60;Page&#x60; or a table.
       *
       * @private
       */
      Large: "Large"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.IllustrationMessageDesign",
      pkg["IllustrationMessageDesign"]
    );
    /**
     * Different illustration types of Illustrated Message.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.IllustrationMessageType
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori IllustrationMessageType
     *
     * @private
     */
    pkg["IllustrationMessageType"] = {
      /**
       * &quot;Achievement&quot; illustration type.
       *
       * @private
       */
      Achievement: "Achievement",
      /**
       * &quot;Adding Columns&quot; illustration type.
       *
       * @private
       */
      AddingColumns: "AddingColumns",
      /**
       * &quot;Add People To Calendar&quot; illustration type.
       *
       * @private
       */
      AddPeopleToCalendar: "AddPeopleToCalendar",
      /**
       * &quot;Before Search&quot; illustration type.
       *
       * @private
       */
      BeforeSearch: "BeforeSearch",
      /**
       * &quot;Drag Files To Upload&quot; illustration type.
       *
       * @private
       */
      DragFilesToUpload: "DragFilesToUpload",
      /**
       * &quot;Filtering Columns&quot; illustration type.
       *
       * @private
       */
      FilteringColumns: "FilteringColumns",
      /**
       * &quot;Grouping Columns&quot; illustration type.
       *
       * @private
       */
      GroupingColumns: "GroupingColumns",
      /**
       * &quot;New Mail&quot; illustration type.
       *
       * @private
       */
      NewMail: "NewMail",
      /**
       * &quot;No Activities&quot; illustration type.
       *
       * @private
       */
      NoActivities: "NoActivities",
      /**
       * &quot;No Columns Set&quot; illustration type.
       *
       * @private
       */
      NoColumnsSet: "NoColumnsSet",
      /**
       * &quot;No Data&quot; illustration type.
       *
       * @private
       */
      NoData: "NoData",
      /**
       * &quot;No Email&quot; illustration type.
       *
       * @private
       */
      NoMail: "NoMail",
      /**
       * &quot;No Email v1&quot; illustration type.
       *
       * @private
       */
      NoMail_v1: "NoMail_v1",
      /**
       * &quot;No Entries&quot; illustration type.
       *
       * @private
       */
      NoEntries: "NoEntries",
      /**
       * &quot;No Notifications&quot; illustration type.
       *
       * @private
       */
      NoNotifications: "NoNotifications",
      /**
       * &quot;No Saved Items&quot; illustration type.
       *
       * @private
       */
      NoSavedItems: "NoSavedItems",
      /**
       * &quot;No Saved Items v1&quot; illustration type.
       *
       * @private
       */
      NoSavedItems_v1: "NoSavedItems_v1",
      /**
       * &quot;No Search Results&quot; illustration type.
       *
       * @private
       */
      NoSearchResults: "NoSearchResults",
      /**
       * &quot;No Tasks&quot; illustration type.
       *
       * @private
       */
      NoTasks: "NoTasks",
      /**
       * &quot;No Tasks v1&quot; illustration type.
       *
       * @private
       */
      NoTasks_v1: "NoTasks_v1",
      /**
       * &quot;No Dimensions Set&quot; illustration type.
       *
       * @private
       */
      NoDimensionsSet: "NoDimensionsSet",
      /**
       * &quot;Unable To Load&quot; illustration type.
       *
       * @private
       */
      UnableToLoad: "UnableToLoad",
      /**
       * &quot;Unable To Load Image&quot; illustration type.
       *
       * @private
       */
      UnableToLoadImage: "UnableToLoadImage",
      /**
       * &quot;Unable To Upload&quot; illustration type.
       *
       * @private
       */
      UnableToUpload: "UnableToUpload",
      /**
       * &quot;Upload To Cloud&quot; illustration type.
       *
       * @private
       */
      UploadToCloud: "UploadToCloud",
      /**
       * &quot;Add Column&quot; illustration type.
       *
       * @private
       */
      AddColumn: "AddColumn",
      /**
       * &quot;Add People&quot; illustration type.
       *
       * @private
       */
      AddPeople: "AddPeople",
      /**
       * &quot;Add Dimensions&quot; illustration type.
       *
       * @private
       */
      AddDimensions: "AddDimensions",
      /**
       * &quot;Balloon Sky&quot; illustration type.
       *
       * @private
       */
      BalloonSky: "BalloonSky",
      /**
       * &quot;Connection&quot; illustration type.
       *
       * @private
       */
      Connection: "Connection",
      /**
       * &quot;Empty Calendar&quot; illustration type.
       *
       * @private
       */
      EmptyCalendar: "EmptyCalendar",
      /**
       * &quot;Empty List&quot; illustration type.
       *
       * @private
       */
      EmptyList: "EmptyList",
      /**
       * &quot;Empty Planning Calendar&quot; illustration type.
       *
       * @private
       */
      EmptyPlanningCalendar: "EmptyPlanningCalendar",
      /**
       * &quot;Error Screen&quot; illustration type.
       *
       * @private
       */
      ErrorScreen: "ErrorScreen",
      /**
       * &quot;Filter Table&quot; illustration type.
       *
       * @private
       */
      FilterTable: "FilterTable",
      /**
       * &quot;Group Table&quot; illustration type.
       *
       * @private
       */
      GroupTable: "GroupTable",
      /**
       * &quot;Key Task&quot; illustration type.
       *
       * @private
       */
      KeyTask: "KeyTask",
      /**
       * &quot;No Chart Data&quot; illustration type.
       *
       * @private
       */
      NoChartData: "NoChartData",
      /**
       * &quot;No Filter Results&quot; illustration type.
       *
       * @private
       */
      NoFilterResults: "NoFilterResults",
      /**
       * &quot;Page Not Found&quot; illustration type.
       *
       * @private
       */
      PageNotFound: "PageNotFound",
      /**
       * &quot;Reload Screen&quot; illustration type.
       *
       * @private
       */
      ReloadScreen: "ReloadScreen",
      /**
       * &quot;Resize Column&quot; illustration type.
       *
       * @private
       */
      ResizeColumn: "ResizeColumn",
      /**
       * &quot;Resizing Columns&quot; illustration type.
       *
       * @private
       */
      ResizingColumns: "ResizingColumns",
      /**
       * &quot;Receive Appreciation&quot; illustration type.
       *
       * @private
       */
      ReceiveAppreciation: "ReceiveAppreciation",
      /**
       * &quot;Search Earth&quot; illustration type.
       *
       * @private
       */
      SearchEarth: "SearchEarth",
      /**
       * &quot;Search Folder&quot; illustration type.
       *
       * @private
       */
      SearchFolder: "SearchFolder",
      /**
       * &quot;Sign Out&quot; illustration type.
       *
       * @private
       */
      SignOut: "SignOut",
      /**
       * &quot;Simple Balloon&quot; illustration type.
       *
       * @private
       */
      SimpleBalloon: "SimpleBalloon",
      /**
       * &quot;Simple Bell&quot; illustration type.
       *
       * @private
       */
      SimpleBell: "SimpleBell",
      /**
       * &quot;Simple Calendar&quot; illustration type.
       *
       * @private
       */
      SimpleCalendar: "SimpleCalendar",
      /**
       * &quot;Simple CheckMark&quot; illustration type.
       *
       * @private
       */
      SimpleCheckMark: "SimpleCheckMark",
      /**
       * &quot;Simple Connection&quot; illustration type.
       *
       * @private
       */
      SimpleConnection: "SimpleConnection",
      /**
       * &quot;Simple Empty Doc&quot; illustration type.
       *
       * @private
       */
      SimpleEmptyDoc: "SimpleEmptyDoc",
      /**
       * &quot;Simple Empty List&quot; illustration type.
       *
       * @private
       */
      SimpleEmptyList: "SimpleEmptyList",
      /**
       * &quot;Simple Error&quot; illustration type.
       *
       * @private
       */
      SimpleError: "SimpleError",
      /**
       * &quot;Simple Magnifier&quot; illustration type.
       *
       * @private
       */
      SimpleMagnifier: "SimpleMagnifier",
      /**
       * &quot;Simple Mail&quot; illustration type.
       *
       * @private
       */
      SimpleMail: "SimpleMail",
      /**
       * &quot;Simple No Saved Items&quot; illustration type.
       *
       * @private
       */
      SimpleNoSavedItems: "SimpleNoSavedItems",
      /**
       * &quot;Simple Not Found Magnifier&quot; illustration type.
       *
       * @private
       */
      SimpleNotFoundMagnifier: "SimpleNotFoundMagnifier",
      /**
       * &quot;Simple Reload&quot; illustration type.
       *
       * @private
       */
      SimpleReload: "SimpleReload",
      /**
       * &quot;Simple Task&quot; illustration type.
       *
       * @private
       */
      SimpleTask: "SimpleTask",
      /**
       * &quot;Sleeping Bell&quot; illustration type.
       *
       * @private
       */
      SleepingBell: "SleepingBell",
      /**
       * &quot;Sort Column&quot; illustration type.
       *
       * @private
       */
      SortColumn: "SortColumn",
      /**
       * &quot;Sorting Columns&quot; illustration type.
       *
       * @private
       */
      SortingColumns: "SortingColumns",
      /**
       * &quot;Success Balloon&quot; illustration type.
       *
       * @private
       */
      SuccessBalloon: "SuccessBalloon",
      /**
       * &quot;Success CheckMark&quot; illustration type.
       *
       * @private
       */
      SuccessCheckMark: "SuccessCheckMark",
      /**
       * &quot;Success HighFive&quot; illustration type.
       *
       * @private
       */
      SuccessHighFive: "SuccessHighFive",
      /**
       * &quot;Success Screen&quot; illustration type.
       *
       * @private
       */
      SuccessScreen: "SuccessScreen",
      /**
       * &quot;Survey&quot; illustration type.
       *
       * @private
       */
      Survey: "Survey",
      /**
       * &quot;Tent&quot; illustration type.
       *
       * @private
       */
      Tent: "Tent",
      /**
       * &quot;Upload Collection&quot; illustration type.
       *
       * @private
       */
      UploadCollection: "UploadCollection",
      /**
       * &quot;User Has Signed Up&quot; illustration type.
       *
       * @private
       */
      UserHasSignedUp: "UserHasSignedUp",
      /**
       * &quot;TntAvatar&quot; illustration type.
       *
       * @private
       */
      TntAvatar: "TntAvatar",
      /**
       * &quot;TntCalculator&quot; illustration type.
       *
       * @private
       */
      TntCalculator: "TntCalculator",
      /**
       * &quot;TntChartArea&quot; illustration type.
       *
       * @private
       */
      TntChartArea: "TntChartArea",
      /**
       * &quot;TntChartArea2&quot; illustration type.
       *
       * @private
       */
      TntChartArea2: "TntChartArea2",
      /**
       * &quot;TntChartBar&quot; illustration type.
       *
       * @private
       */
      TntChartBar: "TntChartBar",
      /**
       * &quot;TntChartBPMNFlow&quot; illustration type.
       *
       * @private
       */
      TntChartBPMNFlow: "TntChartBPMNFlow",
      /**
       * &quot;TntChartBullet&quot; illustration type.
       *
       * @private
       */
      TntChartBullet: "TntChartBullet",
      /**
       * &quot;TntChartDoughnut&quot; illustration type.
       *
       * @private
       */
      TntChartDoughnut: "TntChartDoughnut",
      /**
       * &quot;TntChartFlow&quot; illustration type.
       *
       * @private
       */
      TntChartFlow: "TntChartFlow",
      /**
       * &quot;TntChartGantt&quot; illustration type.
       *
       * @private
       */
      TntChartGantt: "TntChartGantt",
      /**
       * &quot;TntChartOrg&quot; illustration type.
       *
       * @private
       */
      TntChartOrg: "TntChartOrg",
      /**
       * &quot;TntChartPie&quot; illustration type.
       *
       * @private
       */
      TntChartPie: "TntChartPie",
      /**
       * &quot;TntCodePlaceholder&quot; illustration type.
       *
       * @private
       */
      TntCodePlaceholder: "TntCodePlaceholder",
      /**
       * &quot;TntCompany&quot; illustration type.
       *
       * @private
       */
      TntCompany: "TntCompany",
      /**
       * &quot;TntCompass&quot; illustration type.
       *
       * @private
       */
      TntCompass: "TntCompass",
      /**
       * &quot;TntComponents&quot; illustration type.
       *
       * @private
       */
      TntComponents: "TntComponents",
      /**
       * &quot;TntDialog&quot; illustration type.
       *
       * @private
       */
      TntDialog: "TntDialog",
      /**
       * &quot;TntEmptyContentPane&quot; illustration type.
       *
       * @private
       */
      TntEmptyContentPane: "TntEmptyContentPane",
      /**
       * &quot;TntExternalLink&quot; illustration type.
       *
       * @private
       */
      TntExternalLink: "TntExternalLink",
      /**
       * &quot;TntFaceID&quot; illustration type.
       *
       * @private
       */
      TntFaceID: "TntFaceID",
      /**
       * &quot;TntFingerprint&quot; illustration type.
       *
       * @private
       */
      TntFingerprint: "TntFingerprint",
      /**
       * &quot;TntHandshake&quot; illustration type.
       *
       * @private
       */
      TntHandshake: "TntHandshake",
      /**
       * &quot;TntHelp&quot; illustration type.
       *
       * @private
       */
      TntHelp: "TntHelp",
      /**
       * &quot;TntLock&quot; illustration type.
       *
       * @private
       */
      TntLock: "TntLock",
      /**
       * &quot;TntMission&quot; illustration type.
       *
       * @private
       */
      TntMission: "TntMission",
      /**
       * &quot;TntMissionFailed&quot; illustration type.
       *
       * @private
       */
      TntMissionFailed: "TntMissionFailed",
      /**
       * &quot;TntNoApplications&quot; illustration type.
       *
       * @private
       */
      TntNoApplications: "TntNoApplications",
      /**
       * &quot;TntNoFlows&quot; illustration type.
       *
       * @private
       */
      TntNoFlows: "TntNoFlows",
      /**
       * &quot;TntNoUsers&quot; illustration type.
       *
       * @private
       */
      TntNoUsers: "TntNoUsers",
      /**
       * &quot;TntRadar&quot; illustration type.
       *
       * @private
       */
      TntRadar: "TntRadar",
      /**
       * &quot;TntRoadMap&quot; illustration type.
       *
       * @private
       */
      TntRoadMap: "TntRoadMap",
      /**
       * &quot;TntSecrets&quot; illustration type.
       *
       * @private
       */
      TntSecrets: "TntSecrets",
      /**
       * &quot;TntServices&quot; illustration type.
       *
       * @private
       */
      TntServices: "TntServices",
      /**
       * &quot;TntSessionExpired&quot; illustration type.
       *
       * @private
       */
      TntSessionExpired: "TntSessionExpired",
      /**
       * &quot;TntSessionExpiring&quot; illustration type.
       *
       * @private
       */
      TntSessionExpiring: "TntSessionExpiring",
      /**
       * &quot;TntSettings&quot; illustration type.
       *
       * @private
       */
      TntSettings: "TntSettings",
      /**
       * &quot;TntSuccess&quot; illustration type.
       *
       * @private
       */
      TntSuccess: "TntSuccess",
      /**
       * &quot;TntSuccessfulAuth&quot; illustration type.
       *
       * @private
       */
      TntSuccessfulAuth: "TntSuccessfulAuth",
      /**
       * &quot;TntSystems&quot; illustration type.
       *
       * @private
       */
      TntSystems: "TntSystems",
      /**
       * &quot;TntTeams&quot; illustration type.
       *
       * @private
       */
      TntTeams: "TntTeams",
      /**
       * &quot;TntTools&quot; illustration type.
       *
       * @private
       */
      TntTools: "TntTools",
      /**
       * &quot;TntTutorials&quot; illustration type.
       *
       * @private
       */
      TntTutorials: "TntTutorials",
      /**
       * &quot;TntUnableToLoad&quot; illustration type.
       *
       * @private
       */
      TntUnableToLoad: "TntUnableToLoad",
      /**
       * &quot;TntUnlock&quot; illustration type.
       *
       * @private
       */
      TntUnlock: "TntUnlock",
      /**
       * &quot;TntUnsuccessfulAuth&quot; illustration type.
       *
       * @private
       */
      TntUnsuccessfulAuth: "TntUnsuccessfulAuth",
      /**
       * &quot;TntUser2&quot; illustration type.
       *
       * @private
       */
      TntUser2: "TntUser2"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.IllustrationMessageType",
      pkg["IllustrationMessageType"]
    );
    /**
     * Defines the layout of the content displayed in the `ui5-media-gallery-item`.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.MediaGalleryItemLayout
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori MediaGalleryItemLayout
     *
     * @private
     */
    pkg["MediaGalleryItemLayout"] = {
      /**
       * Recommended to use when the item contains an image.
       *
       * When a thumbnail is selected, it makes the corresponding enlarged content appear in a square display area.
       *
       * @private
       */
      Square: "Square",
      /**
       * Recommended to use when the item contains video content.
       *
       * When a thumbnail is selected, it makes the corresponding enlarged content appear in a wide display area
       * (stretched to fill all of the available width) for optimal user experiance.
       *
       * @private
       */
      Wide: "Wide"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.MediaGalleryItemLayout",
      pkg["MediaGalleryItemLayout"]
    );
    /**
     * Defines the layout type of the thumbnails list of the `ui5-media-gallery` component.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.MediaGalleryLayout
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori MediaGalleryLayout
     *
     * @private
     */
    pkg["MediaGalleryLayout"] = {
      /**
       * The layout is determined automatically.
       *
       * @private
       */
      Auto: "Auto",
      /**
       * Displays the layout as a vertical split between the thumbnails list and the selected image.
       *
       * @private
       */
      Vertical: "Vertical",
      /**
       * Displays the layout as a horizontal split between the thumbnails list and the selected image.
       *
       * @private
       */
      Horizontal: "Horizontal"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.MediaGalleryLayout",
      pkg["MediaGalleryLayout"]
    );
    /**
     * Defines the horizontal alignment of the thumbnails menu of the `ui5-media-gallery` component.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.MediaGalleryMenuHorizontalAlign
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori MediaGalleryMenuHorizontalAlign
     *
     * @private
     */
    pkg["MediaGalleryMenuHorizontalAlign"] = {
      /**
       * Displays the menu on the left side of the target.
       *
       * @private
       */
      Left: "Left",
      /**
       * Displays the menu on the right side of the target.
       *
       * @private
       */
      Right: "Right"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.MediaGalleryMenuHorizontalAlign",
      pkg["MediaGalleryMenuHorizontalAlign"]
    );
    /**
     * Types for the vertical alignment of the thumbnails menu of the `ui5-media-gallery` component.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.MediaGalleryMenuVerticalAlign
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori MediaGalleryMenuVerticalAlign
     *
     * @private
     */
    pkg["MediaGalleryMenuVerticalAlign"] = {
      /**
       * Displays the menu at the top of the reference control.
       *
       * @private
       */
      Top: "Top",
      /**
       * Displays the menu at the bottom of the reference control.
       *
       * @private
       */
      Bottom: "Bottom"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.MediaGalleryMenuVerticalAlign",
      pkg["MediaGalleryMenuVerticalAlign"]
    );
    /**
     * Specifies the navigation layout mode.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.NavigationLayoutMode
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori NavigationLayoutMode
     *
     * @private
     */
    pkg["NavigationLayoutMode"] = {
      /**
       * Automatically calculates the navigation layout mode based on the screen device type.
       * &#x60;Expanded&#x60; on desktop and &#x60;Collapsed&#x60; on tablet and phone.
       *
       * @private
       */
      Auto: "Auto",
      /**
       * Collapsed side navigation.
       *
       * @private
       */
      Collapsed: "Collapsed",
      /**
       * Expanded side navigation.
       *
       * @private
       */
      Expanded: "Expanded"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.NavigationLayoutMode",
      pkg["NavigationLayoutMode"]
    );
    /**
     * Different types of NotificationListItemImportance.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.NotificationListItemImportance
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori NotificationListItemImportance
     *
     * @private
     */
    pkg["NotificationListItemImportance"] = {
      /**
       * Standard
       *
       * @private
       */
      Standard: "Standard",
      /**
       * Important
       *
       * @private
       */
      Important: "Important"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.NotificationListItemImportance",
      pkg["NotificationListItemImportance"]
    );
    /**
     * Available Page Background Design.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.PageBackgroundDesign
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori PageBackgroundDesign
     *
     * @private
     */
    pkg["PageBackgroundDesign"] = {
      /**
       * Page background color when a List is set as the Page content.
       *
       * @private
       */
      List: "List",
      /**
       * A solid background color dependent on the theme.
       *
       * @private
       */
      Solid: "Solid",
      /**
       * Transparent background for the page.
       *
       * @private
       */
      Transparent: "Transparent"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.PageBackgroundDesign",
      pkg["PageBackgroundDesign"]
    );
    /**
     * Search mode options.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.SearchMode
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori SearchMode
     *
     * @private
     */
    pkg["SearchMode"] = {
      /**
       * Search field with default appearance.
       *
       * @private
       */
      Default: "Default",
      /**
       * Search field with additional scope select.
       *
       * @private
       */
      Scoped: "Scoped"
    };
    registerEnum("sap.f.gen.ui5.webcomponents_fiori.SearchMode", pkg["SearchMode"]);
    /**
     * SideContent FallDown options.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.SideContentFallDown
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori SideContentFallDown
     *
     * @private
     */
    pkg["SideContentFallDown"] = {
      /**
       * Side content falls down on breakpoints below XL
       *
       * @private
       */
      BelowXL: "BelowXL",
      /**
       * Side content falls down on breakpoints below L
       *
       * @private
       */
      BelowL: "BelowL",
      /**
       * Side content falls down on breakpoints below M
       *
       * @private
       */
      BelowM: "BelowM",
      /**
       * Side content falls down on breakpoint M and the minimum width for the side content
       *
       * @private
       */
      OnMinimumWidth: "OnMinimumWidth"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.SideContentFallDown",
      pkg["SideContentFallDown"]
    );
    /**
     * Side Content position options.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.SideContentPosition
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori SideContentPosition
     *
     * @private
     */
    pkg["SideContentPosition"] = {
      /**
       * The side content is on the right side of the main container
       * in left-to-right mode and on the left side in right-to-left mode.
       *
       * @private
       */
      End: "End",
      /**
       * The side content is on the left side of the main container
       * in left-to-right mode and on the right side in right-to-left mode.
       *
       * @private
       */
      Start: "Start"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.SideContentPosition",
      pkg["SideContentPosition"]
    );
    /**
     * Side Content visibility options.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.SideContentVisibility
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori SideContentVisibility
     *
     * @private
     */
    pkg["SideContentVisibility"] = {
      /**
       * Show the side content on any breakpoint
       *
       * @private
       */
      AlwaysShow: "AlwaysShow",
      /**
       * Show the side content on XL breakpoint
       *
       * @private
       */
      ShowAboveL: "ShowAboveL",
      /**
       * Show the side content on L and XL breakpoints
       *
       * @private
       */
      ShowAboveM: "ShowAboveM",
      /**
       * Show the side content on M, L and XL breakpoints
       *
       * @private
       */
      ShowAboveS: "ShowAboveS",
      /**
       * Don&#x27;t show the side content on any breakpoints
       *
       * @private
       */
      NeverShow: "NeverShow"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.SideContentVisibility",
      pkg["SideContentVisibility"]
    );
    /**
     * SideNavigationItem designs.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.SideNavigationItemDesign
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori SideNavigationItemDesign
     *
     * @private
     */
    pkg["SideNavigationItemDesign"] = {
      /**
       * Design for items that perform navigation, contain navigation child items, or both.
       *
       * @private
       */
      Default: "Default",
      /**
       * Design for items that trigger an action, such as opening a dialog.
       *
       * **Note:** Items with this design must not have sub-items.
       *
       * **Note:** Items that open a dialog must set &#x60;hasPopup&#x3D;&quot;dialog&quot;&#x60; via &#x60;accessibilityAttributes&#x60; property.
       *
       * @private
       */
      Action: "Action"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.SideNavigationItemDesign",
      pkg["SideNavigationItemDesign"]
    );
    /**
     * Timeline growing modes.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.TimelineGrowingMode
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori TimelineGrowingMode
     *
     * @private
     */
    pkg["TimelineGrowingMode"] = {
      /**
       * Event &#x60;load-more&#x60; is fired
       * upon pressing a &quot;More&quot; button at the end.
       *
       * @private
       */
      Button: "Button",
      /**
       * Event &#x60;load-more&#x60; is fired upon scroll.
       *
       * @private
       */
      Scroll: "Scroll",
      /**
       * The growing feature is not enabled.
       *
       * @private
       */
      None: "None"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.TimelineGrowingMode",
      pkg["TimelineGrowingMode"]
    );
    /**
     * Available Timeline layout orientation
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.TimelineLayout
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori TimelineLayout
     *
     * @private
     */
    pkg["TimelineLayout"] = {
      /**
       * Vertical layout
       * Default type
       *
       * @private
       */
      Vertical: "Vertical",
      /**
       * Horizontal layout
       *
       * @private
       */
      Horizontal: "Horizontal"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.TimelineLayout",
      pkg["TimelineLayout"]
    );
    /**
     * Different UploadCollection selection modes.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.UploadCollectionSelectionMode
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori UploadCollectionSelectionMode
     *
     * @private
     */
    pkg["UploadCollectionSelectionMode"] = {
      /**
       * Default mode (no selection).
       *
       * @private
       */
      None: "None",
      /**
       * Right-positioned single selection mode (only one list item can be selected).
       *
       * @private
       */
      Single: "Single",
      /**
       * Left-positioned single selection mode (only one list item can be selected).
       *
       * @private
       */
      SingleStart: "SingleStart",
      /**
       * Selected item is highlighted but no selection element is visible
       * (only one list item can be selected).
       *
       * @private
       */
      SingleEnd: "SingleEnd",
      /**
       * Selected item is highlighted and selection is changed upon arrow navigation
       * (only one list item can be selected - this is always the focused item).
       *
       * @private
       */
      SingleAuto: "SingleAuto",
      /**
       * Multi selection mode (more than one list item can be selected).
       *
       * @private
       */
      Multiple: "Multiple"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.UploadCollectionSelectionMode",
      pkg["UploadCollectionSelectionMode"]
    );
    /**
     * Different types of UploadState.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.UploadState
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori UploadState
     *
     * @private
     */
    pkg["UploadState"] = {
      /**
       * The file has been uploaded successfully.
       *
       * @private
       */
      Complete: "Complete",
      /**
       * The file cannot be uploaded due to an error.
       *
       * @private
       */
      Error: "Error",
      /**
       * The file is awaiting an explicit command to start being uploaded.
       *
       * @private
       */
      Ready: "Ready",
      /**
       * The file is currently being uploaded.
       *
       * @private
       */
      Uploading: "Uploading"
    };
    registerEnum("sap.f.gen.ui5.webcomponents_fiori.UploadState", pkg["UploadState"]);
    /**
     * Different types of ViewSettings.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.ViewSettingsDialogMode
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori ViewSettingsDialogMode
     *
     * @private
     */
    pkg["ViewSettingsDialogMode"] = {
      /**
       * Default type
       *
       * @private
       */
      Sort: "Sort",
      /**
       * Filter type
       *
       * @private
       */
      Filter: "Filter",
      /**
       * Group type
       *
       * @private
       */
      Group: "Group"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.ViewSettingsDialogMode",
      pkg["ViewSettingsDialogMode"]
    );
    /**
     * Enumeration for different content layouts of the `ui5-wizard`.
     *
     * @enum {string}
     *
     * @alias module:sap/f/gen/ui5/webcomponents_fiori.WizardContentLayout
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori WizardContentLayout
     *
     * @private
     */
    pkg["WizardContentLayout"] = {
      /**
       * Display the content of the &#x60;ui5-wizard&#x60; as multiple steps in a scroll section.
       *
       * @private
       */
      MultipleSteps: "MultipleSteps",
      /**
       * Display the content of the &#x60;ui5-wizard&#x60; as single step.
       *
       * @private
       */
      SingleStep: "SingleStep"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_fiori.WizardContentLayout",
      pkg["WizardContentLayout"]
    );

    // Interfaces
    /**
     * Interface for components that can be slotted inside `ui5-media-gallery` as items.
     *
     * @interface
     *
     * @name module:sap/f/gen/ui5/webcomponents_fiori.IMediaGalleryItem
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori IMediaGalleryItem
     *
     * @private
     */
    /**
     * Interface for components that may be slotted inside `ui5-product-switch` as items
     *
     * @interface
     *
     * @name module:sap/f/gen/ui5/webcomponents_fiori.IProductSwitchItem
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori IProductSwitchItem
     *
     * @private
     */
    /**
     * Interface for components that may be slotted inside a `ui5-search`
     *
     * @interface
     *
     * @name module:sap/f/gen/ui5/webcomponents_fiori.ISearchScope
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori ISearchScope
     *
     * @private
     */
    /**
     * Interface for components that may be slotted inside `ui5-timeline` as items
     *
     * @interface
     *
     * @name module:sap/f/gen/ui5/webcomponents_fiori.ITimelineItem
     *
     * @ui5-module-override sap/f/gen/ui5/webcomponents_fiori ITimelineItem
     *
     * @private
     */

    return pkg;
  }
);
