sap.ui.define(["exports"],function(x){"use strict";
/*!
       * OpenUI5
       * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
       * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
       */var t=function(x,t){var f=x.toString(16);return f};
/*!
   * OpenUI5
   * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
   * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
   */var f=/[\x00-\x2b\x2f\x3a-\x40\x5b-\x5e\x60\x7b-\xff\u2028\u2029]/g,r=/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/,e={"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"};var n=function(x){var f=e[x];if(!f){if(r.test(x)){f="&#xfffd;"}else{f="&#x"+t(x.charCodeAt(0))+";"}e[x]=f}return f};var u=function(x){return x.replace(f,n)};x.fnEncodeXML=u});
//# sourceMappingURL=encodeXML.js.map