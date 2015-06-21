/* The MIT License (MIT)
 *
 *  Copyright (c) 2014 Andrew MacKenzie
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
*/

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, Mustache, window */

define(function (require, exports, module) {
    'use strict';

    // Load Brackets modules
    var InlineWidget        = brackets.getModule("editor/InlineWidget").InlineWidget,
        ExtensionUtils          = brackets.getModule("utils/ExtensionUtils");

    // Load tempalte
    var inlinePackageTemplate = require("text!templates/packageBrowserTemplate.html");
    var currentPackage = "";
    var currentVersion = "";

    function InlinePackageViewer(packageMap, theVersion) {
        this.packageMap = packageMap;
        this.theVersion = theVersion;
        InlineWidget.call(this);
    }
    InlinePackageViewer.prototype = Object.create(InlineWidget.prototype);
    InlinePackageViewer.prototype.constructor = InlinePackageViewer;
    InlinePackageViewer.prototype.parentClass = InlineWidget.prototype;

    InlinePackageViewer.prototype.currentPackage = null;
    InlinePackageViewer.prototype.currentVersion = null;
    InlinePackageViewer.prototype.$wrapperDiv = null;

    InlinePackageViewer.prototype.load = function (hostEditor) {
        InlinePackageViewer.prototype.parentClass.load.apply(this, arguments);
        ExtensionUtils.loadStyleSheet(module, "styles/styles.css");
        console.log(this.packageDescription);
        this.$htmlContent.append(Mustache.render(inlinePackageTemplate, {packageTitle: this.packageMap.package.description,
                                                                         packageDescription: this.packageMap.package.name,
                                                                        versionFilter: this.theVersion}));
    };

    InlinePackageViewer.prototype.onAdded = function () {
        InlinePackageViewer.prototype.parentClass.onAdded.apply(this, arguments);
        window.setTimeout(this._sizeEditorToContent.bind(this));
    };

    InlinePackageViewer.prototype._sizeEditorToContent = function () {
        this.hostEditor.setInlineWidgetHeight(this, 200, true);
    };

    module.exports = InlinePackageViewer;
});
