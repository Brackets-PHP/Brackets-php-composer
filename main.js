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
/*global define, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";

    // Brackets modules
    var InlineWidget            = brackets.getModule("editor/InlineWidget").InlineWidget,
        EditorManager           = brackets.getModule("editor/EditorManager"),
        TokenUtils              = brackets.getModule("utils/TokenUtils"),
        ExtensionUtils          = brackets.getModule("utils/ExtensionUtils");

    var packageBrowserTemplate  = require("text!templates/packageBrowserTemplate.html");
    var semVer = require("lib/semver.browser");

    var InlinePackageViewer = require("InlinePackageViewer"),
        pkgRegex = /"([A-Z0-9-_]*\/[A-Z0-9-_]*)":\s"([\,<>=-~*.@A-Z0-9 ]*)"/i;

    require("lib/jquery.jeditable.mini");

    function inlinePackageBrowserProvider(hostEditor, pos) {
        var thePackage = "",
            theVersion = "";
        var result = new $.Deferred();
        // Only provide image viewer if the selection is within a single line
        var sel = hostEditor.getSelection(false);
        if (sel.start.line !== sel.end.line) {
            return null;
        }
        var currentLine = hostEditor.document.getLine(pos.line);
        if (pkgRegex.test(currentLine)) {
            var packageMatch = pkgRegex.exec(currentLine);
            thePackage = packageMatch[1];
            theVersion = packageMatch[2];
        } else {
            return null;
        }

        if (hostEditor.document.file._name !== "composer.json") {
            return null;
        }
        $.ajax({
            url: "https://packagist.org/packages/" + thePackage + ".json",
            dataType: "json"
        })
            .done(function (data) {
                var versions = data.package.versions;
                var versionsArray = [];
                var versionNameOnlyArray = [];
                $.each(versions, function (key, val) {
                    versionsArray.push(val);
                    if (semVer.valid(val.version) != null) {
                        versionNameOnlyArray.push(val.version);
                    }
                });
                var maxSatisfying = semVer.maxSatisfying(versionNameOnlyArray, semVer.validRange(theVersion));
                data.package.maxSatisfying = maxSatisfying;
                data.package.versionFilter = theVersion;
                data.package.versionsArray = versionsArray;
                var packageViewer = new InlinePackageViewer(data);
                packageViewer.load(hostEditor);
                result.resolve(packageViewer);
            })
            .fail(function () {
                return "Error loading Package information from Packagist";
            });
        return result.promise();
    }

    ExtensionUtils.loadStyleSheet(module, "styles/styles.css");
    EditorManager.registerInlineEditProvider(inlinePackageBrowserProvider);
});
