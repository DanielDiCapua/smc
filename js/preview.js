var Preview = {
    delay: 10,        // delay after keystroke before updating

    preview: null,     // filled in by Init below
    buffer: null,      // filled in by Init below

    timeout: null,     // store setTimout id
    mjRunning: false,  // true when MathJax is processing
    mjPending: false,  // true when a typeset has been queued
    oldText: null,     // used to check if an update is needed
    heightCursor: 0,

    ClearAll_screen: null,
    ClearAll_text:null,

    ScrollActivated: false, // used to storage the scroll required value
    OldId: "",

    //
    //  Get the preview and buffer DIV's
    //
    Init: function () {
        this.preview = document.getElementById("screen");
        this.buffer = document.getElementById("buffer");
        //DefineRowsHeight(); The rows heigth is defined in index.html
        text_screen = xml_Serial.serializeToString(expr_xml);
        InputChanges();
    },

    //
    //  Switch the buffer and preview, and display the right one.
    //  (We use visibility:hidden rather than display:none since
    //  the results of running MathJax are more accurate that way.)
    //
    SwapBuffers: function () {
        var buffer = this.preview, preview = this.buffer;
        this.buffer = buffer; this.preview = preview;
        buffer.style.display = "none"; buffer.style.visibility = "hidden";
        preview.style.display = "inline-block"; preview.style.visibility = "visible";
        preview.scrollLeft = ScrollLeft_value;
        preview.scrollTop = ScrollTop_value;
    },

    //
    //  This gets called when a key is pressed in the textarea.
    //  We check if there is already a pending update and clear it if so.
    //  Then set up an update to occur after a small delay (so if more keys
    //    are pressed, the update won't occur until after there has been 
    //    a pause in the typing).
    //  The callback function is set up below, after the Preview object is set up.
    //
    Update: function () {
        if (this.timeout) { clearTimeout(this.timeout) }
        this.timeout = setTimeout(this.callback, this.delay);
    },

    //
    //  Creates the preview and runs MathJax on it.
    //  If MathJax is already trying to render the code, return
    //  If the text hasn't changed, return
    //  Otherwise, indicate that MathJax is running, and start the
    //    typesetting.  After it is done, call PreviewDone.
    //  
    CreatePreview: function () {
        Preview.timeout = null;
        if (this.mjPending) return;
        var text = text_screen;
        if (text === this.oldtext) {
            this.UpdateCursorPosition();
            return;
        }
        if (this.mjRunning) {
            this.mjPending = true;
            MathJax.Hub.Queue(["CreatePreview", this]);
        } else {
            this.buffer.innerHTML = this.oldtext = text;
            this.mjRunning = true;
            MathJax.Hub.Queue(
                ["Typeset", MathJax.Hub, this.buffer],
                ["PreviewDone", this],
                ["ZoomFrame", this],
                ["UpdateCursorPosition", this]
            );
        }
    },

    //
    //  Indicate that MathJax is no longer running,
    //  and swap the buffers to show the results.
    //
    PreviewDone: function () {
        this.mjRunning = this.mjPending = false;
        this.SwapBuffers();
    },

    ZoomFrame: function () {
        if (!isZoomFrameRequired) return;
        var textarea = this.preview;

        var expression = textarea.querySelectorAll(".MathJax_SVG");
        var expression_widthPX = $(expression).css("width");
        var expression_width = parseFloat(expression_widthPX.slice(0, (expression_widthPX.length - 2)));
        var expression_heightPX = $(expression).css("height");
        var expression_height = parseFloat(expression_heightPX.slice(0, (expression_heightPX.length - 2)));

        var screen_widthPX = $(textarea).css("width");
        var screen_width = Math.round(parseFloat(screen_widthPX.slice(0, (screen_widthPX.length - 2))));
        var screen_heightPX = $(textarea).css("height");
        var screen_height = Math.round(parseFloat(screen_heightPX.slice(0, (screen_heightPX.length - 2))));

        var relation = Math.min(screen_width / expression_width, screen_height / expression_height);
        if (relation <= 1) {
            var currenFontSizePx = $(expression[0]).css("font-size");
            var currenFontSize = parseFloat(currenFontSizePx.slice(0, (currenFontSizePx.length - 2)));
            var bodyFontSizePx = $("#bodyCalculator").css("font-size");
            var bodyFontSize = parseFloat(bodyFontSizePx.slice(0, (bodyFontSizePx.length - 2)));
            var newFontSize = currenFontSize / bodyFontSize * relation * 0.95*100;
            var newFontSizePje = newFontSize + "%";
            $(expression[0]).css("font-size", newFontSizePje);
        }
        isZoomFrameRequired = false;
    },

    UpdateCursorPosition: function () {
        if (!isScreenMode) return;
        if (!currId) return;
        if (currId && currId != "root") {
            if (interval_var != 0) CloseInterval();
            var textarea = this.preview;
            var css_select = "g#" + currId;

            MJ_Node = textarea.querySelectorAll(css_select);
            if (MJ_Node.length == 0) return;
          //var coord = $(MJ_Node).offset();
            var coord = MJ_Node[0].getBoundingClientRect();
            var x_coord = coord.left;
            var y_coord = coord.top;
            var div = document.getElementById('mathjax-cursor');


            var width = MJ_Node[0].getBoundingClientRect().width;
            var currNode = GetElementById(expr_xml, currId);
            if (CursorPos == 0) {
                var widthPx = $(MJ_Node).css("padding-left");
                width = parseFloat(widthPx.slice(0, (widthPx.length - 2)));
            }
            if (CursorPos == 0.5) {
                NumText = currNode.childNodes[0].nodeValue;
                var childNodes = MJ_Node[0].childNodes;
                var x_ini = MJ_Node[0].getBoundingClientRect().x;
                var x_num_left = childNodes[NumDigitLeft-1].getBoundingClientRect().x+childNodes[NumDigitLeft-1].getBoundingClientRect().width;
                var x_num_rigth = childNodes[NumDigitLeft].getBoundingClientRect().x;
                var x_fin = 0.5 * (x_num_left + x_num_rigth);
                width = x_fin - x_ini;
            }
            var height = MJ_Node[0].getBoundingClientRect().height;
            var heightCursor = UpdateCursorSize();
            var x_cursor_pos = Math.round(x_coord + width);
            var currTag = currNode.tagName;
            var incr = 0;
            if (CursorPos == 0) {
                incr = -2;
                if (currTag == "mfenced") {
                    if (currNode.getAttribute("open") == "[" && currNode.getAttribute("close") == "]") {
                        incr = -5;
                    }
                }
            } else if (CursorPos == 1) {
                incr = 2;
                if (currTag == "mfenced") {
                    if (currNode.getAttribute("open") == "[" && currNode.getAttribute("close") == "]") {
                        incr = 5;
                    }
                }
            }
            x_cursor_pos += incr;

            var y_ini_cursor_pos = Math.round(y_coord + 0.50 * height - 0.5 * heightCursor);
            var y_end_cursor_pos = Math.round(y_coord + 0.50 * height + 0.5 * heightCursor);

            var expression = textarea.querySelectorAll("svg#root");
            var expression_widthPX = $(expression).css("width");
            var expression_width = parseFloat(expression_widthPX.slice(0, (expression_widthPX.length - 2)));
            expression_width += $(expression).offset().left;

            var expression_height = $(expression).height();
            expression_height += $(expression).offset().top;


            var screen_widthPX = $(textarea).css("width");
            var screen_width = Math.round(parseFloat(screen_widthPX.slice(0, (screen_widthPX.length - 2))));
            var screen_height = $(textarea).height();
            var screen_x_ini = $(textarea).offset().left;
            var screen_y_ini = $(textarea).offset().top;
            var screen_x_end = screen_x_ini + screen_width;
            if (textarea.scrollTop != 0) screen_x_end -= 10;
            var screen_y_end = screen_y_ini + screen_height;
            if (textarea.scrollLeft != 0) screen_y_end -= 10;

            var x_max_cursor_pos;
            var x_min_cursor_pos;
            if (IsFunctionArgumentNode(currNode)) {
                parentNode = currNode.parentNode;
                parentNode = parentNode.parentNode;
                var IdParent = parentNode.getAttribute("id");
                var css_select_ext = "g#" + IdParent;
                MJ_Node_ext = textarea.querySelectorAll(css_select_ext);
                //var coord_ext = $(MJ_Node_ext).offset();
                var coord_ext = MJ_Node[0].getBoundingClientRect();
                var x_coord_ext = coord_ext.left;
                var y_coord_ext = coord_ext.top;
                var width_ext = MJ_Node_ext[0].getBoundingClientRect().width;
                x_max_cursor_pos = Math.round(x_coord_ext + width_ext);
                x_min_cursor_pos = Math.round(x_coord_ext);
            } else {
                x_max_cursor_pos = x_cursor_pos;
                x_min_cursor_pos = x_coord;
                if (IsGreyColorNode(currNode)) {
                    var prevNode = currNode.previousSibling;
                    if (prevNode) {
                        if (IsGreyColorNode(prevNode)) {
                            var IdGrey = prevNode.getAttribute("id");
                            var css_select_grey = "g#" + IdGrey;
                            var MJ_Node_grey = textarea.querySelectorAll(css_select_grey);
                            //var coord_grey = $(MJ_Node_grey).offset();
                            var coord_grey = MJ_Node[0].getBoundingClientRect();
                            x_min_cursor_pos = coord_grey.left;
                        }
                    }
                }
            }

            if ((expression_width + 15) >= screen_width) {
                if ((x_cursor_pos + 15) >= screen_x_end) {
                    if ((currId != this.OldId) || (currId.search("mn") != -1)) {
                        //To take into account the padding and the scroll vertical bar
                        if (!this.ScrollActivated) {
                            textarea.scrollLeft += Math.round(x_max_cursor_pos - screen_x_end + 15);
                        }
                    } else {
                        if (!this.ScrollActivated) {
                            textarea.scrollLeft += Math.round(x_max_cursor_pos - screen_x_end + 15);
                        }
                    }
                }
                if (x_min_cursor_pos < 0.0 && currId != this.OldId) {
                    if (!(screen_width < (x_max_cursor_pos - x_min_cursor_pos))) {
                        textarea.scrollLeft += Math.round(x_min_cursor_pos - 15);
                        if (textarea.scrollLeft <= 50) textarea.scrollLeft = 0.0;
                    }
                }
            }

            if (((screen_x_ini <= x_cursor_pos) && (x_cursor_pos <= screen_x_end)) && ((screen_y_ini <= y_end_cursor_pos) && (y_ini_cursor_pos <= screen_y_end))) {
                div.style.left = x_cursor_pos + "px";
                //div.style.top = y_coord + 0.50 * height - 0.5 * heightCursor + "px";
                if (y_ini_cursor_pos < screen_y_ini) {
                    y_ini_cursor_pos = screen_y_ini;
                    heightCursor = y_end_cursor_pos - y_ini_cursor_pos;
                    var heightCursorPx = heightCursor + "px";
                    $(".mathjax-cursor").css("height", heightCursorPx);
                }
                if (screen_y_end <= y_end_cursor_pos) {
                    y_end_cursor_pos = screen_y_end;
                    heightCursor = y_end_cursor_pos - y_ini_cursor_pos;
                    var heightCursorPx = heightCursor + "px";
                    $(".mathjax-cursor").css("height", heightCursorPx);
                }
                div.style.top = y_ini_cursor_pos + "px";
                interval_var = setInterval(myInterval, 500);
            }
            this.OldId = currId;
        } else if (currId == "root") {
            CursorPos = 1.0;
            InitialCursor();
            if (interval_var != 0) CloseInterval();
            interval_var = setInterval(myInterval, 500);
            if (!this.ClearAll_screen) {
                this.ClearAll_screen = buffer.innerHTML;
                this.ClearAll_text = text_screen;
            }
        }
    },

    ScrollControl: function () {
        if (!isScreenMode) return;
        if (!currId) return;
        var textarea;
        if ($("#screen").css("visibility") == "visible") {
            textarea = document.getElementById('screen');
        } else {
            textarea = document.getElementById('buffer');
        }
        var css_select = "g#" + currId;
        MJ_Node = textarea.querySelectorAll(css_select);

        if (MJ_Node.length != 0) {
            if (interval_var != 0) CloseInterval();
            //var coord = $(MJ_Node).offset();
            var coord = MJ_Node[0].getBoundingClientRect();
            var x_coord = coord.left;
            var y_coord = coord.top;

            var width = MJ_Node[0].getBoundingClientRect().width;
            var height = $(MJ_Node).height();
            var heightCursor = UpdateCursorSize();

            if (CursorPos == 0) width = 0;
            var x_cursor_pos = Math.round(x_coord + width);
            var currNode = GetElementById(expr_xml, currId);
            var currTag = currNode.tagName;
            var incr = 0;
            if (CursorPos == 0) {
                incr = -2;
                if (currTag == "mfenced") {
                    if (currNode.getAttribute("open") == "[" && currNode.getAttribute("close") == "]") {
                        incr = -5;
                    }
                }
            } else if (CursorPos == 1) {
                incr = 2;
                if (currTag == "mfenced") {
                    if (currNode.getAttribute("open") == "[" && currNode.getAttribute("close") == "]") {
                        incr = 5;
                    }
                }
            }
            x_cursor_pos += incr;

            var y_ini_cursor_pos = Math.round(y_coord + 0.50 * height - 0.5 * heightCursor);
            var y_end_cursor_pos = Math.round(y_coord + 0.50 * height + 0.5 * heightCursor);

            var screen_widthPX = $(textarea).css("width");
            var screen_width = Math.round(parseFloat(screen_widthPX.slice(0, (screen_widthPX.length - 2))));
            var screen_height = $(textarea).height();
            var screen_x_ini = $(textarea).offset().left;
            var screen_y_ini = $(textarea).offset().top;
            var screen_x_end = screen_x_ini + screen_width;
            if (textarea.scrollTop != 0) screen_x_end -= 10;
            var screen_y_end = screen_y_ini + screen_height;
            if (textarea.scrollLeft != 0) screen_y_end -= 10;

            this.ScrollActivated = true;
            if (((screen_x_ini <= x_cursor_pos) && (x_cursor_pos <= screen_x_end)) && ((screen_y_ini <= y_end_cursor_pos) && (y_ini_cursor_pos <= screen_y_end))) {
                Preview.UpdateCursorPosition();            
            }
            ScrollLeft_value = textarea.scrollLeft;
            ScrollTop_value = textarea.scrollTop;
            this.ScrollActivated = false;
        }
    }
};

