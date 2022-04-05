var apagado = 0;
var encendido = 1;
var estado = 1;
var interval_var = 0;

var isScreenMode = true;
var isScreenMode_old;

var ScrollLeft_value = 0;
var ScrollTop_value = 0;

var original_size = 150;

var MJ_Node = null;

var isZoomFrameRequired = false;

var isKeyboardShowed = true;

var touch_start_x = 0;
var touch_start_y = 0;
var distTP_ini = 0;
var distTP_curr = 0;
var FontSize_ini = 0;

var doubleClick_touch = false;

window.addEventListener("resize", function () {
  if (isInputVarActivated) {
    HideAndShowKeyboard();
  } else {
    DefineRowsHeight();
    if (isScreenMode) InputChanges();
    else Preview.Update();
  }
  RePosictionateMenuAndSubmenus();

});

function CallBacksLauncher() {
  for (var ifun = 0; ifun < arguments.length; ifun++) {
    eval(arguments[ifun]);
  }
}


//Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
  var event_target = event.target;
  var button = "#" + event_target.id;
  var index_SubMenu = -1;
  var index_Menu = buttonMenu_list.indexOf(button);
  if (index_Menu == -1) {
    for (var i_menu = 0; i_menu < MenuList.length; i_menu++) {
      for (var i_submenu = 0; i_submenu < buttonSubMenu_list[i_menu].length; i_submenu++) {
        var button_aux = buttonSubMenu_list[i_menu][i_submenu];
        if (button_aux == button) {
          index_Menu = i_menu;
          index_SubMenu = i_submenu;
          break;
        }
      }
    }
  }

  for (var i_menu = 0; i_menu < MenuList.length; i_menu++) {
    if (i_menu != index_Menu) $(MenuList[i_menu]).css("display", "none");
    for (var i_submenu = 0; i_submenu < buttonSubMenu_list[i_menu].length; i_submenu++) {
      if (!(i_menu == index_Menu && i_submenu == index_SubMenu)) $(SubMenuList[i_menu][i_submenu]).css("display", "none");
    }
  }
}

function RePosictionateMenuAndSubmenus() {
    for (var i_menu = 0; i_menu < MenuList.length; i_menu++) {
    var menu = MenuList[i_menu];
    if ($(menu).css("display") == "block") {
      var btn_menu = buttonMenu_list[i_menu];
      var typeMenu = typeMenu_list[i_menu];
      PositionateMenu(btn_menu, menu, typeMenu);
      for (var i_submenu = 0; i_submenu < SubMenuList[i_menu].length; i_submenu++) {
        var submenu = SubMenuList[i_menu][i_submenu];
        if ($(submenu).css("display") == "block") {
          var btn_submenu = buttonSubMenu_list[i_menu][i_submenu];
          var typeSubMenu = typeSubMeny_list[i_menu][i_submenu];
          PositionateMenu(btn_submenu, submenu, typeSubMenu);
        }
      }
    }
  }
}

function TouchStartHandler(e) {
  if (!doubleClick_touch) {
    doubleClick_touch = true;
    setTimeout(function () { doubleClick_touch = false; }, 300);
  } else {
    if (e.touches.length == 1) {
      ZoomOriginal();
      if (e.cancelable) e.preventDefault();
    }
  }

  var textarea;
  if ($("#screen").css("visibility") == "visible") {
    textarea = document.getElementById('screen');
  } else {
    textarea = document.getElementById('buffer');
  }

  var elm = document.getElementById('screenLine');
  var x1 = e.touches[0].pageX;
  var y1 = e.touches[0].pageY;
  if (e.touches.length == 1) {
    if (isPointInsideElementBoundary(x1, y1, elm)) {
      touch_start_x = x1;
      touch_start_y = y1;
    } else {
      if (e.cancelable) e.preventDefault();
    }
  } else if (e.touches.length >= 2) {
    var x2 = e.touches[1].pageX;
    var y2 = e.touches[1].pageY;
    if (isPointInsideElementBoundary(x1, y1, elm) && isPointInsideElementBoundary(x2, y2, elm)) {
      var expression = textarea.querySelectorAll(".MathJax_SVG");
      var FontSize_iniPx = $(expression[0]).css("font-size");
      FontSize_ini = parseFloat(FontSize_iniPx.slice(0, (FontSize_iniPx.length - 2)));
      distTP_ini = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
      distTP_curr = 0.0;
      if (e.cancelable) e.preventDefault();
    }
  }

}

function TouchMoveHandler(e) {
  var elm = document.getElementById('screenLine');
  var x1 = e.changedTouches[0].pageX;
  var y1 = e.changedTouches[0].pageY;
  var textarea;
  if ($("#screen").css("visibility") == "visible") {
    textarea = document.getElementById('screen');
  } else {
    textarea = document.getElementById('buffer');
  }

  if (e.changedTouches.length == 1) {
    if (isPointInsideElementBoundary(x1, y1, elm)) {
      var delta_x = touch_start_x - x1;
      var delta_y = touch_start_y - y1;
      var dist_x, dist_y;
      if (delta_x != 0.0) {
        if ((math.abs(delta_y) / math.abs(delta_x)) < 1) {
          dist_x = delta_x;
          dist_y = 0;
        } else {
          dist_x = 0;
          dist_y = delta_y
        }
      } else {
        dist_x = 0;
        dist_y = delta_y;
      }
      textarea.scrollLeft += dist_x;
      textarea.scrollTop += dist_y;
      ScrollLeft_value = textarea.scrollLeft;
      ScrollTop_value = textarea.scrollTop;
      touch_start_x = x1;
      touch_start_y = y1;
      if (e.cancelable) e.preventDefault();
    }
  } else if (e.changedTouches.length >= 2) {
    if (e.cancelable) e.preventDefault();
    var x2 = e.changedTouches[1].pageX;
    var y2 = e.changedTouches[1].pageY;
    if (isPointInsideElementBoundary(x1, y1, elm) && isPointInsideElementBoundary(x2, y2, elm)) {
      if (interval_var != 0) CloseInterval();
      distTP_curr = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
      var bodyFontSizePx = $("#bodyCalculator").css("font-size");
      var bodyFontSize = parseFloat(bodyFontSizePx.slice(0, (bodyFontSizePx.length - 2)));
      var fact = distTP_curr / distTP_ini;
      var newFontSize = Math.round(FontSize_ini / bodyFontSize * fact * 100);
      if (newFontSize > 500) newFontSize = 500;
      if (newFontSize < 10) newFontSize = 10;
      var newFontSizePtje = newFontSize + "%";
      var expression = textarea.querySelectorAll(".MathJax_SVG");
      $(expression[0]).css("font-size", newFontSizePtje);
    }
  }
}

function TouchEndHandler(e) {
  if (distTP_curr > 0) {
    if (e.cancelable) e.preventDefault();
    var bodyFontSizePx = $("#bodyCalculator").css("font-size");
    var bodyFontSize = parseFloat(bodyFontSizePx.slice(0, (bodyFontSizePx.length - 2)));
    var fact = distTP_curr / distTP_ini;
    var newFontSize = Math.round(FontSize_ini / bodyFontSize * fact * 100);
    if (newFontSize > 500) newFontSize = 500;
    if (newFontSize < 10) newFontSize = 10;
    var newFontSizePtje = newFontSize + "%";
    var textarea;
    if ($("#screen").css("visibility") == "visible") {
      textarea = document.getElementById('screen');
    } else {
      textarea = document.getElementById('buffer');
    }
    var expression = textarea.querySelectorAll(".MathJax_SVG");
    $(expression[0]).css("font-size", newFontSizePtje);
    Preview.UpdateCursorPosition();
    var new_size = newFontSize;
    MathJax.Hub.Config({
      SVG: {
        scale: new_size
      }
    });
    distTP_curr = 0.0
  }
}

function isPointInsideElementBoundary(x, y, elm) {
  var is_PointInElementBoundary = false;
  var elmWidth = $(elm).width();
  var elmHeight = $(elm).height();
  var elmPaddingLeftPx = $(elm).css("padding-left");
  var elmPaddingLeft = parseFloat(elmPaddingLeftPx.slice(0, (elmPaddingLeftPx.length - 2)));
  var elmPaddingTopPx = $(elm).css("padding-top");
  var elmPaddingTop = parseFloat(elmPaddingTopPx.slice(0, (elmPaddingTopPx.length - 2)));
  var elmpos = $(elm).offset();
  var x_ini = elmpos.left + elmPaddingLeft;
  var x_fin = x_ini + elmWidth;
  var y_ini = elmpos.top + elmPaddingTop - 10;
  var y_fin = y_ini + elmHeight;
  if ((x_ini <= x) && (x <= x_fin) && (y_ini <= y) && (y <= y_fin)) {
    is_PointInElementBoundary = true;
  }
  return is_PointInElementBoundary;
}


function DefineRowsHeight() {
  var bodyCalculatorPaddingPx = $("#bodyCalculator").css("padding-top");
  var bodyCalculatorPadding = bodyCalculatorPaddingPx.slice(0, (bodyCalculatorPaddingPx.length - 2));
  var diff = 2 * bodyCalculatorPadding;
  var WindowHeight = $(window).innerHeight() - diff;

  //This is the Keybord heigth proposed by the browser
  var keyboardLineHeight_browser = $("#keyboard").outerHeight();

  //This is the Title heigth proposed by the browser
  var margins_title = parseInt($('#titleLine_div').css('margin-top'))
    + parseInt($('#titleLine_div').css('margin-bottom'));
  var TitleTableHeight_browser = $("#titleLine_div").outerHeight() + margins_title;

  var InputVarDiv_browser = 0;
  var margins_inptuVar = parseInt($('#inputVar_div').css('margin-top'))
    + parseInt($('#inputVar_div').css('margin-bottom'));
  if ($("#inputVar_div").css("display") == "inline-block") {
    InputVarDiv_browser = $("#inputVar_div").outerHeight() + margins_inptuVar+ 7;
  }

  var InputFunDiv_browser = 0;
  var margins_inptuFun = parseInt($('#inputFun_div').css('margin-top'))
   + parseInt($('#inputFun_div').css('margin-bottom'));
  if ($("#inputFun_div").css("display") == "inline-block") {
    InputFunDiv_browser = $("#inputFun_div").outerHeight() + margins_inptuFun+ 7;
  }


  var AngleLineDive_browser = $("#angleLine").outerHeight();

  var screenLineHeight = WindowHeight - TitleTableHeight_browser
                       - keyboardLineHeight_browser - InputVarDiv_browser
                       - InputFunDiv_browser - AngleLineDive_browser;

  var screenLineHeightPx = screenLineHeight + "px";
  $("#screenLine").css("height", screenLineHeightPx);

  var screenLinePaddingTopPx = $("#screenLine").css("padding-top");
  var screenLinePaddingTop = screenLinePaddingTopPx.slice(0, (screenLinePaddingTopPx.length - 2));

  var screenLinePaddingBottomPx = $("#screenLine").css("padding-bottom");
  var screenLinePaddingBottom = screenLinePaddingBottomPx.slice(0, (screenLinePaddingBottomPx.length - 2));

  screenLineHeight = screenLineHeight - screenLinePaddingTop - screenLinePaddingBottom;
  screenLineHeightPx = screenLineHeight + "px";
  $("#screen").css("line-height", screenLineHeightPx);
  $("#buffer").css("line-height", screenLineHeightPx);


  if ($("#screen").css("visibility") == "visible") {
    selector = "#screen";
  } else {
    selector = "#buffer";
  }
  var realLineHeightPx = $(selector).css("line-height");
  var realLineHeight = realLineHeightPx.slice(0, (realLineHeightPx.length - 2));
  if (screenLineHeight != realLineHeight) {
    var diff_lineheigth = realLineHeight - screenLineHeight;
    screenLineHeightPx = (screenLineHeight - diff_lineheigth) + "px";
    $("#screen").css("line-height", screenLineHeightPx);
    $("#buffer").css("line-height", screenLineHeightPx);
  }
}

function myInterval() {
  estado = (estado == encendido ? apagado : encendido);
  var div = document.getElementById('mathjax-cursor');
  div.style.opacity = estado;
}

function CloseInterval() {
  estado = 0;
  var div = document.getElementById('mathjax-cursor');
  div.style.opacity = estado;
  clearInterval(interval_var);
  interval_var = 0;
}


function InitialCursor() {
  var textarea, selector;
  if ($("#screen").css("visibility") == "visible") {
    textarea = document.getElementById('screen');
    selector = "#screen";
  } else {
    textarea = document.getElementById('buffer');
    selector = "#buffer";
  }

  heightCursor = UpdateCursorSize();

  var heightScreen = $(selector).css("height");
  heightScreen = parseFloat(heightScreen.slice(0, (heightScreen.length - 2)));

  var bodyFontSizePx = $("#bodyCalculator").css("font-size");
  var bodyFontSize = parseFloat(bodyFontSizePx.slice(0, (bodyFontSizePx.length - 2)));
  var SizeText = bodyFontSize * original_size / 100.0;

  var div = document.getElementById('mathjax-cursor');
  var coord = $(textarea).offset();

  var x_coord = coord.left + 5;
  var y_coord = coord.top + 0.52 * heightScreen - 0.5 * SizeText - 0.50 * heightCursor;


  estado = 0;
  div.style.left = x_coord + "px";
  div.style.top = y_coord + "px";
}

function UpdateCursorSize() {
  var height_max = 0.0;
  var parentNode_Id;
  if (currId != "root") {
    var currNode = GetElementById(expr_xml, currId);
    //var selector = "mn[id=" + "'" + currId + "'" + "]";
    //var currNode = expr_xml.querySelector(selector);
    var ParentNode = currNode.parentNode;
    parentNode_Id = ParentNode.getAttribute("id");
    var childNodes = ParentNode.childNodes;
    var height_max = 0.0;
    for (var inode = 0; inode < childNodes.length; inode++) {
      var node_id = childNodes[inode].getAttribute("id");
      if (node_id) {
        var css_select = "g#" + node_id;
        var MJ_Node = Preview.preview.querySelectorAll(css_select);
        if (!MJ_Node[0]) {
          continue;
        }
        var height_node = MJ_Node[0].getBoundingClientRect().height;
        if (height_node > height_max) height_max = height_node;
      }
    }
  } else {
    currNode = GetElementById(expr_xml, currId);
    parentNode_Id = "root";
  }

  var css_select = "g#" + currId;
  var MJ_Node = Preview.preview.querySelectorAll(css_select);
  if (MJ_Node.length == 0) {
    css_select = "math#" + currId;
    MJ_Node = Preview.preview.querySelectorAll(css_select);
    if (MJ_Node.length == 0) return;
  }

  var SizeText;
  var fontSizePx = $(MJ_Node).css("fontSize");
  var fontSize = parseFloat(fontSizePx.slice(0, (fontSizePx.length - 2)));
  if (currId == "root") {
    var bodyFontSizePx = $("#bodyCalculator").css("font-size");
    var bodyFontSize = parseFloat(bodyFontSizePx.slice(0, (bodyFontSizePx.length - 2)));
    var SizeText = bodyFontSize * original_size / 100.0;

  } else {
    //SizeText = MJ_Node[0].getBoundingClientRect().height;
    //if (height_max > SizeText) SizeText = height_max;
    SizeText = height_max;
  }

  var selector;
  if ($("#screen").css("visibility") == "visible") {
    selector = "#screen";
  } else {
    selector = "#buffer";
  }
  var screen_heightPx = $(selector).css("height");
  var screen_height = parseFloat(screen_heightPx.slice(0, (screen_heightPx.length - 2)));

  var heightCursor = SizeText;

  if (parentNode_Id == "root") {
    if (heightCursor < fontSize * 1.5) heightCursor *= 1.5;
  } else {
    if (((currId.search("mn") != -1) || (currId.search("mo") != -1) || IsVarOrParamMiNode(currNode) || currId == "root") && !IsThereOtherNodeTypes(currNode)) {
      if (!IsMsupOrMrootOrMsqrtSonNode(currNode)) heightCursor *= 1.5;
    }
  }


  if (heightCursor > screen_height) heightCursor = 0.9 * screen_height;
  var heightCursorPx = heightCursor + "px";
  $(".mathjax-cursor").css("height", heightCursorPx);
  return heightCursor;
}

function IsThereOtherNodeTypes(node) {
  var isThereOtherNodeTypes = false;
  var parentNode = node.parentNode;
  var childNodes = parentNode.childNodes;
  for (var i = 0; i < childNodes.length; i++) {
    var node_i = childNodes[i];
    var tagName = node_i.tagName;
    if (childNodes[i] != node) {
      if (!(tagName == "mn" || tagName == "mo" || IsVarOrParamMiNode(childNodes[i]))) {
        isThereOtherNodeTypes = true;
        break;
      }
    }
  }
  return isThereOtherNodeTypes;
}



function EditableNodesList(selector) {
  var textarea = document.getElementById(selector);
  var Selectors = "g[id^='mn_'],";
  Selectors += "g[id^='mo_'],";
  Selectors += "g[id^='mfenced_'],";
  Selectors += "g[id^='msup_'],";
  Selectors += "g[id^='mfrac_'],";
  Selectors += "g[id^='msqrt_'],";
  Selectors += "g[id^='mroot_'],";
  Selectors += "g[id^='mi_']";

  return textarea.querySelectorAll(Selectors);
}

function GetPosition(selector, event) {
  if (!isScreenMode) return;
  var textarea = document.getElementById(selector);
  CursorPos = 1;

  var picked_coord_x = event.pageX;
  var picked_coord_y = event.pageY;
  var list_elements = EditableNodesList(selector);
  var selected = null;
  var selected_list = [];
  var dist_list = [];
  var dist_closest = 1.0e6; //Stupid huge number
  var i_min;
  if (list_elements.length != 0) {
    for (var i = 0; i < list_elements.length; i++) {
      //var min_x = $(list_elements[i]).offset().left;
      //var min_y = $(list_elements[i]).offset().top;
      var min_x = list_elements[i].getBoundingClientRect().left;
      var min_y = list_elements[i].getBoundingClientRect().top;
      var width = list_elements[i].getBoundingClientRect().width;
      var fontSize = $(list_elements[i]).css("fontSize");
      var SizeText = parseFloat(fontSize.slice(0, (fontSize.length - 2)));
      var max_x = min_x + width;
      var max_y = min_y + list_elements[i].getBoundingClientRect().height;
      var elem_id = list_elements[i].id;
      var under_line_pos = searchCharacter(elem_id, "_") - 1;
      var elem_tag = elem_id.substring(0, under_line_pos);

      var dist;
      var x_left = min_x;
      var y_left = (max_y + min_y) * 0.5;
      var x_rigth = max_x;
      var y_rigth = (max_y + min_y) * 0.5;
      var dist_left, dist_rigth;
      if (elem_tag == "mfenced") {
        var elem_node = GetElementById(expr_xml, elem_id);
        if (IsFunctionParenthesisNode(elem_node) || IsNumOrDenOfMfrac(elem_node)) continue;
        if (IsMroot(elem_node.parentNode)) {
          dist_left = Math.abs(x_left - picked_coord_x);
          dist_rigth = Math.abs(x_rigth - picked_coord_x);
        } else {
          dist_left = Math.sqrt(Math.pow((x_left - picked_coord_x), 2) + Math.pow((y_left - picked_coord_y), 2));
          dist_rigth = Math.sqrt(Math.pow((x_rigth - picked_coord_x), 2) + Math.pow((y_rigth - picked_coord_y), 2));
        }
        dist = Math.min(dist_left, dist_rigth);
      } else {
        if(elem_tag =="mi") {
          var elem_node = GetElementById(expr_xml, elem_id);
          if (!(IsVarMiNode(elem_node) || IsParamMiNode(elem_node))) continue;
        }
        dist_left = Math.sqrt(Math.pow((x_left - picked_coord_x), 2) + Math.pow((y_left - picked_coord_y), 2));
        dist_rigth = Math.sqrt(Math.pow((x_rigth - picked_coord_x), 2) + Math.pow((y_rigth - picked_coord_y), 2));
        dist = Math.min(dist_left, dist_rigth);
      }

      if (dist < dist_closest) {
        dist_closest = dist;
        i_min = i;
      }

      //elem_tag=="mi" is for var and param elem_node
      if (elem_tag == "mn" || elem_tag == "mo" || elem_tag == "mi") {
        if (((min_x <= picked_coord_x) && ((picked_coord_x <= max_x))) && ((min_y <= picked_coord_y) && ((picked_coord_y <= max_y)))) {
          selected = list_elements[i];
          break;
        }
      }
    }
  }

  if (!selected) {
    var elem_closest = list_elements[i_min];
    selected = elem_closest;
  }

  if (selected) {
    currId = selected.id;
    var Node = GetElementById(expr_xml, currId);
    if (IsNonErasebleNode(Node)) {
      if (Node.nextSibling) {
        Node = Node.nextSibling;
        currId = Node.getAttribute("id");
      }
    }
    if (IsGreyColorNode(Node)) {
      //Supongo que todos los elementos grises estan juntos
      while (Node.nextSibling) {
        if (IsCommaNode(Node.nextSibling)) break;
        Node = Node.nextSibling;
        currId = Node.getAttribute("id");
      }
    }
    if (IsFunctionParenthesisNode(Node)) {
      var parentNode = Node.parentNode;
      currId = parentNode.getAttribute("id");
    }
    //Preview.Update();
    Preview.UpdateCursorPosition();
    if (interval_var != 0) CloseInterval();
    interval_var = setInterval(myInterval, 500);
  }
  else {
    var rootNode = expr_xml.documentElement;
    var lastChild = rootNode.lastChild;
    if (lastChild) {
      currId = lastChild.id;
      //Preview.Update();
      Preview.UpdateCursorPosition();
      if (interval_var != 0) CloseInterval();
      interval_var = setInterval(myInterval, 500);
    } else {
      currId = "root";
    }
  }

}

function SearchMin(list) {
  var min_val = 1.0e6; //Stupid huge number
  var icomp_min;
  for (var icomp = 0; icomp < list.length; icomp++) {
    if (list[icomp] < min_val) {
      min_val = list[icomp];
      icomp_min = icomp;
    }
  }
  return icomp_min;
}

function Mousewheel(event) {
  if (event.wheelDelta > 0) ZoomIn();
  else ZoomOut();
}

function ZoomIn() {
  var textarea;
  if ($("#screen").css("visibility") == "visible") {
    textarea = document.getElementById('screen');
  } else {
    textarea = document.getElementById('buffer');
  }
  var expression = textarea.querySelectorAll(".MathJax_SVG");
  var currenFontSizePx = $(expression[0]).css("font-size");
  var currenFontSize = parseFloat(currenFontSizePx.slice(0, (currenFontSizePx.length - 2)));
  var bodyFontSizePx = $("#bodyCalculator").css("font-size");
  var bodyFontSize = parseFloat(bodyFontSizePx.slice(0, (bodyFontSizePx.length - 2)));
  var increment = 10;
  var newFontSize = Math.round(currenFontSize / bodyFontSize * 100) + increment;
  var newFontSizePtje = newFontSize + "%";
  $(expression[0]).css("font-size", newFontSizePtje);
  Preview.UpdateCursorPosition();
  var new_size = newFontSize;
  MathJax.Hub.Config({
    SVG: {
      scale: new_size
    }
  });
}

function ZoomOut() {
  var textarea;
  if ($("#screen").css("visibility") == "visible") {
    textarea = document.getElementById('screen');
  } else {
    textarea = document.getElementById('buffer');
  }
  var expression = textarea.querySelectorAll(".MathJax_SVG");
  var currenFontSizePx = $(expression[0]).css("font-size");
  var currenFontSize = parseFloat(currenFontSizePx.slice(0, (currenFontSizePx.length - 2)));
  var bodyFontSizePx = $("#bodyCalculator").css("font-size");
  var bodyFontSize = parseFloat(bodyFontSizePx.slice(0, (bodyFontSizePx.length - 2)));
  var decrement = 10;
  if (Math.round(currenFontSize / bodyFontSize * 100) <= 10) decrement = 1;
  var newFontSize = Math.round(currenFontSize / bodyFontSize * 100) - decrement;
  if (newFontSize < 25) newFontSize = 25;
  var newFontSizePtje = newFontSize + "%";
  $(expression[0]).css("font-size", newFontSizePtje);
  Preview.UpdateCursorPosition();
  var new_size = newFontSize;
  MathJax.Hub.Config({
    SVG: {
      scale: new_size
    }
  });
}


function ZoomOriginal() {
  var textarea;
  if ($("#screen").css("visibility") == "visible") {
    textarea = document.getElementById('screen');
  } else {
    textarea = document.getElementById('buffer');
  }
  var expression = textarea.querySelectorAll(".MathJax_SVG");
  var bodyFontSizePx = $("#bodyCalculator").css("font-size");
  var bodyFontSize = parseFloat(bodyFontSizePx.slice(0, (bodyFontSizePx.length - 2)));
  var newFontSize = original_size;
  var newFontSizePje = newFontSize + "%";
  $(expression[0]).css("font-size", newFontSizePje);
  Preview.UpdateCursorPosition();
  var new_size = original_size;
  MathJax.Hub.Config({
    SVG: {
      scale: new_size
    }
  });
}
