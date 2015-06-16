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
        ExtensionUtils          = brackets.getModule("utils/ExtensionUtils"),
        TokenUtils              = brackets.getModule("utils/TokenUtils");

    var packageBrowserTemplate  = require("text!templates/packageBrowserTemplate.html");

    var currentSection = "";

    function ComposerInlineEditor() {
        InlineWidget.call(this);

        //this.$htmlContent.addClass("package-browser-editor");
        //this.$htmlContent.append(Mustache.render(packageBrowserTemplate, {packagistData: "composer.json: " + currentSection}));
    }

    ComposerInlineEditor.prototype = Object.create(InlineWidget.prototype);
    ComposerInlineEditor.prototype.constructor = ComposerInlineEditor;
    ComposerInlineEditor.prototype.parentClass = InlineWidget.prototype;

    ComposerInlineEditor.prototype.onAdded = function () {
        this.hostEditor.setInlineWidgetHeight(this, 100);
    };

    function composerEditorProvider(hostEditor, pos) {
        var composerInlineEditor = new ComposerInlineEditor(hostEditor, pos),
            currentToken = TokenUtils.getInitialContext(hostEditor._codeMirror, pos).token,
            sections = ['"require":', '"require-dev":', '"suggest":', '"conflict":', '"replace":', '"provide":'];
        var validSection = sections.indexOf(currentToken.string + ":");

        if (hostEditor.document.file._name === "composer.json" && validSection !== -1) {
            currentSection = sections[validSection];
            composerInlineEditor.$htmlContent.addClass("package-browser-editor");
            composerInlineEditor.$htmlContent.append(Mustache.render(packageBrowserTemplate, {packagistData: currentSection}));
            composerInlineEditor.load(hostEditor);
            return new $.Deferred().resolve(composerInlineEditor);
        } else {
            return null;
        }

    }

    ExtensionUtils.loadStyleSheet(module, "styles/styles.css");

    EditorManager.registerInlineEditProvider(composerEditorProvider);
});
