var matrix_list = new Array();
var matrix_cont = 0;

var xml_string = '<math id="root"></math>';
//var xml_string = '<math id="root" size="150"><mn id="mn_1">1</mn><mo id="mo_1">+</mo><mn id="mn_2">2</mn></math>';
var parser = new DOMParser();
var expr_xml = parser.parseFromString(xml_string, "text/xml");
var expr_xml_old;
var xml_Serial = new XMLSerializer();
var text_screen = "";

var StoredNode = null;


//var currId = null;
var currId = "root";
var CursorPos = 0;
var NumDigitLeft = 0;
var NumDigitRight = 0;
var isDecimalPoint = 0;

var mn_cont = 0;        //mn_1, mn_2, mn_3...
var mo_cont = 0;        //mo_1, mo_2, mo_3...
var mi_cont = 0;        //mi_1, mi_2, mi_3...
var mfrac_cont = 0;     //mfrac_1, mfrac_2, mfrac_3...
var msqrt_cont = 0;     //msqrt_1, msqrt_2, msqrt_3...
var msup_cont = 0;      //msup_1, msup_2, msup_3...
var mfenced_cont = 0;   //mfenced_1, mfenced_2, mfenced_3...
var mtable_cont = 0;    //mtable_1, mtable_2, mtable_3...
var mtr_cont = 0;       //mtr_1, mtr_2, mtr_3...
var mtd_cont = 0;       //mtd_1, mtd_2, mtd_3...
var mroot_cont = 0;     //msqrt_1, msqrt_2, msqrt_3...

var Matrix_cont = 0;
var function_cont = 0;
var parenthesis_cont = 0;

var linsolve_cont = 0;
var eigv_cont = 0;
var normalize_cont = 0;
var UDF_cont = 0;

var Shift_state = 0; //It has two state 0 or 1
var State_ini = 0;
var State_changed = 1;

var num_format_type = "automatic"; //There are three options "decimals_fixed", "exponential", "automatic"
var num_decimals = 4;
var exp_min = -1;
var exp_max = 5;

var numericalZero = 1.0e-12;

var angles_units = "radians"; //There are two options "radians" and "degrees". The default values is "radians"

var body_list = ["#bodyCalculator", "#bodyMatrix", "#bodyConfig", "#bodyAbout", "#bodyInputFunName", "#bodyInputVarName"];

var MenuList = ["#ConfigListMenu", "#LibFunListMenu", "#MenuShowParams", "#UserDefFunMenu", "#UserCreateVarsMenu"];
var SubMenuList = [[], [], [], ["#subMenuInsertUserDefFun", "#subMenuEditUserDefFun", "#subMenuDeleteUserDefFun"], ["#subMenuInsertVar", "#subMenuEditVar", "#subMenuDeleteVar"]];
var buttonMenu_list = ["#btnConfig", "#btnLibFun", "#btnShowParamsMenu", "#btnUserDefFun", "#btnVars"];
var buttonSubMenu_list = [[], [], [], ["#btnInsertUserDefFun", "#btnEditUserDefFun", "#btnDeleteUserDefFun"], ["#btnInsertVar", "#btnEditVar", "#btnDeleteVar"]];
var typeMenu_list = ["drop-down", "drop-up", "drop-up-right", "drop-up-right", "drop-up"];
var typeSubMeny_list = [[], [], [], ["move-right", "move-right", "move-right"], ["move-left", "move-left", "move-left"]];

var varNode_list = [];
var varLabel_list = [];
var varType_list = [];
var isInputVarActivated = false;
var isEditModeInputVar = false;
var currIvar = -1;

var userDefFunNode_list = [];
var userDefFunLabel_list = [];
var userDefFunParamType_list = [];
var userDefFunParamNames = [];
var userDefFunExpr_list = [];
var isParamListCreated = false;
var isInputUSFActivated = false;
var isEditModeInputUserDefFun = false;
var curr_UDF = -1;

var OrderIndexVarAndFun = [];

var prodSymbol_list = ["∧", "⊗", ":"]
var prodFunction_list = ["cross", "TensorProduct", "DoubleContraction"];

var storage = null;

Greek_Letter_list = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "iota", "kappa", "lambda",
                   "mu", "nu", "xi", "omicron", "pi", "rho", "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega",
                   "Alpha", "Beta", "Ggamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa", "Lambda",
                   "Mu", "Nu", "Xi", "Omicron", "Pi", "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega"];

function ActiveBody(body_curr) {
  for (ibody = 0; ibody < body_list.length; ibody++) {
    if (body_list[ibody] == body_curr) $(body_list[ibody]).show();
    else $(body_list[ibody]).hide();
  }
}


function load() {

  $(document).ready(function () {

    if (typeof (window.localStorage) !== "undefined") {
      ns = Storages.initNamespaceStorage('ScientificMatrixCal');
      storage = ns.localStorage;
    } else {
      storage = null;
    }

    if (storage) {
      if (storage.isSet("original_size")) {
        original_size = storage.get("original_size");
        expr_xml.documentElement.setAttribute("size", original_size);
        MathJax.Hub.Config({
          SVG: {
            scale: original_size
          }
        });
        num_format_type = storage.get("num_format_type");
        num_decimals = parseInt(storage.get("num_decimals"));
        exp_min = parseInt(storage.get("exp_min"));
        exp_max = parseInt(storage.get("exp_max"));
        angles_units = storage.get("angles_units");
      }

      if (storage.isSet("varNode_list")) {
        var varNode_list_aux = storage.get('varNode_list');
        varNode_list_aux = JSON.parse(varNode_list_aux);
        var parser_aux = new DOMParser();
        for (var ivar = 0; ivar < varNode_list_aux.length; ivar++) {
          var xml_dom = parser_aux.parseFromString(varNode_list_aux[ivar], "text/xml");
          varNode_list[ivar] = xml_dom.firstChild;
        }
        var varLabel_list_aux = storage.get('varLabel_list');
        varLabel_list = JSON.parse(varLabel_list_aux);

        var varType_list_aux = storage.get('varType_list');
        varType_list = JSON.parse(varType_list_aux);

        var OrderIndexVarAndFun_aux = storage.get('OrderIndexVarAndFun');
        OrderIndexVarAndFun = JSON.parse(OrderIndexVarAndFun_aux);
      }

      if (storage.isSet("userDefFunLabel_list")) {
        userDefFunNode_list = [];
        userDefFunLabel_list = [];
        userDefFunParamType_list = [];
        userDefFunParamNames = [];

        var userDefFunNode_list_aux = storage.get('userDefFunNode_list');
        userDefFunNode_list_aux = JSON.parse(userDefFunNode_list_aux);
        var parser_aux = new DOMParser();
        for (var ifun = 0; ifun < userDefFunNode_list_aux.length; ifun++) {
          var xml_dom = parser_aux.parseFromString(userDefFunNode_list_aux[ifun], "text/xml");
          userDefFunNode_list[ifun] = xml_dom.firstChild;
        }

        var userDefFunLabel_list_aux = storage.get('userDefFunLabel_list');
        userDefFunLabel_list = JSON.parse(userDefFunLabel_list_aux);

        var userDefFunParamType_list_aux = storage.get('userDefFunParamType_list');
        userDefFunParamType_list = JSON.parse(userDefFunParamType_list_aux);

        var userDefFunParamNames_aux = storage.get('userDefFunParamNames');
        userDefFunParamNames = JSON.parse(userDefFunParamNames_aux);

        var OrderIndexVarAndFun_aux = storage.get('OrderIndexVarAndFun');
        OrderIndexVarAndFun = JSON.parse(OrderIndexVarAndFun_aux);
      }
    }
    ActiveBody("#bodyCalculator");
    var btnShift = window.document.getElementById("btnShift");
    btnShift.onclick = function () {
      Shift_state = (Shift_state == State_ini ? State_changed : State_ini);
      var btnPow = window.document.getElementById("btnPow");
      var btnRoot = window.document.getElementById("btnRoot");
      var btnSin = window.document.getElementById("btnSin");
      var btnCos = window.document.getElementById("btnCos");
      var btnTan = window.document.getElementById("btnTan");
      var btnFun = window.document.getElementById("btnFun");
      if (Shift_state == 0) {
        $(btnPow).html("<strong>x</strong><sup>2</sup>");
        $(btnRoot).html("<strong>&Sqrt;<span style='text-decoration:overline;  font-size:1.05em;'>&nbsp;x&nbsp;</span></strong>");
        $(btnSin).html("<strong>sin</strong>");
        $(btnSin).css("font-size", "0.85em");
        $(btnCos).html("<strong>cos</strong>");
        $(btnCos).css("font-size", "0.85em");
        $(btnTan).html("<strong>tan</strong>");
        $(btnTan).css("font-size", "0.85em");
        $(btnFun).html("<strong>π</strong>");
        $(btnFun).css("font-size", "0.85em");
      } else if (Shift_state == 1) {
        $(btnPow).html("<strong>x</strong><sup>y</sup>");
        $(btnRoot).html("<sup>y</sup><strong>&Sqrt;<span style='text-decoration:overline;  font-size:1.05em;'>&nbsp;x&nbsp;</span></strong>");
        $(btnSin).html("<strong>asin</strong>");
        $(btnSin).css("font-size", "0.80em");
        $(btnCos).html("<strong>acos</strong>");
        $(btnCos).css("font-size", "0.80em");
        $(btnTan).html("<strong>atan</strong>");
        $(btnTan).css("font-size", "0.80em");
        $(btnFun).html("<strong><i style='font-family:Times New Roman;'>i</i></strong>");
        $(btnFun).css("font-size", "0.80em");
      }
    }

    var screen_line_div = document.getElementById('screenLine');
    screen_line_div.addEventListener("touchstart", TouchStartHandler, false);
    screen_line_div.addEventListener("touchmove", TouchMoveHandler, false);
    screen_line_div.addEventListener("touchend", TouchEndHandler, false);

    Preview.Init();
    text_screen = xml_Serial.serializeToString(expr_xml);
    Preview.callback = MathJax.Callback(["CreatePreview", Preview]);
    Preview.callback.autoReset = true;  // make sure it can run more than once
    Preview.Update();

    if (angles_units == "radians") {
      $('#angleLine_div strong').html("Angles(rad)");
    } else if (angles_units == "degrees") {
      $('#angleLine_div strong').html("Angles(deg)");
    }

    math.import({
      Gen_UDF: Gen_UDF,
      TensorProduct: TensorProduct,
      DoubleContraction: DoubleContraction
    });

  });
}


function PreferencesMenu() {
  ActiveBody("#bodyConfig");

  var DefSize = original_size / 1.5 + "%";
  var mySelectDefSize = document.getElementById('defSize');
  for (var i, j = 0; i = mySelectDefSize.options[j]; j++) {
    if (i.value == DefSize) {
      mySelectDefSize.selectedIndex = j;
      break;
    }
  }

  var mySelectNumberFormat = document.getElementById('NumberFormat');
  for (var i, j = 0; i = mySelectNumberFormat.options[j]; j++) {
    if (i.value == num_format_type) {
      mySelectNumberFormat.selectedIndex = j;
      break;
    }
  }

  var mySelectNumDecimals = document.getElementById('NumDecimals');
  for (var i, j = 0; i = mySelectNumDecimals.options[j]; j++) {
    if (i.value == num_decimals) {
      mySelectNumDecimals.selectedIndex = j;
      break;
    }
  }

  if (num_format_type == "automatic") {
    var mySelectLowerExp = document.getElementById('lowerExp');
    for (var i, j = 0; i = mySelectLowerExp.options[j]; j++) {
      if (i.value == exp_min) {
        mySelectLowerExp.selectedIndex = j;
        break;
      }
    }

    var mySelectUpperExp = document.getElementById('upperExp');
    for (var i, j = 0; i = mySelectUpperExp.options[j]; j++) {
      if (i.value == exp_max) {
        mySelectUpperExp.selectedIndex = j;
        break;
      }
    }
  }

  var mySelectAnglesUnits = document.getElementById('anglesUnits');
  for (var i, j = 0; i = mySelectAnglesUnits.options[j]; j++) {
    if (i.value == angles_units) {
      mySelectAnglesUnits.selectedIndex = j;
      break;
    }
  }

}

function ClosePreferences() {
  ActiveBody("#bodyCalculator");
  DefineRowsHeight();
  ZoomOriginal();
  if (storage) {
    storage.set("original_size", original_size);
    storage.set("num_format_type", num_format_type);
    storage.set("num_decimals", num_decimals);
    storage.set("exp_min", exp_min);
    storage.set("exp_max", exp_max);
    storage.set("angles_units", angles_units);
  }

  if (angles_units == "radians") {
    $('#angleLine_div strong').html("Angles(rad)");
  } else if (angles_units == "degrees") {
    $('#angleLine_div strong').html("Angles(deg)");
  }
}


function CancelPreferences() {
  ActiveBody("#bodyCalculator");
  DefineRowsHeight();
  ZoomOriginal();
}

function ResetDataConfirmation() {
  var message = "This command will delete all the stored data (configuration preferences, variables and functions). Do you want to continue?"
  var answer = confirm(message);
  if (answer == true) {
    ResetData();
  }
}

function ResetData() {
  if (interval_var != 0) CloseInterval();
  var btn_ResetData = document.getElementById("btnResetData");

  storage.removeAll();
  ClearAll();
  original_size = 150;
  num_format_type = "automatic";
  num_decimals = 4;
  exp_min = -1;
  exp_max = 5;
  numericalZero = 1.0e-12;
  angles_units = "radians";
  if (angles_units == "radians") {
    $('#angleLine_div strong').html("Angles(rad)");
  } else if (angles_units == "degrees") {
    $('#angleLine_div strong').html("Angles(deg)");
  }
  numericalZero = 1.0e-12;

  varNode_list = [];
  varLabel_list = [];
  varType_list = [];
  isInputVarActivated = false;
  isEditModeInputVar = false;
  currIvar = -1;

  userDefFunNode_list = [];
  userDefFunLabel_list = [];
  userDefFunParamType_list = [];
  userDefFunParamNames = [];
  userDefFunExpr_list = [];
  isParamListCreated = false;
  isInputUSFActivated = false;
  isEditModeInputUserDefFun = false;
  curr_UDF = -1;

  OrderIndexVarAndFun = [];
  ZoomOriginal();
}

function HideAndShowKeyboard() {
  if (interval_var != 0) CloseInterval();
  var btn_HideAndShowKeyboard = document.getElementById("btnHideAndShowKeyboard");
  if (isKeyboardShowed) {
    $("#keyboard_div").hide();
    $(btn_HideAndShowKeyboard).html("Show keyboard");
    isKeyboardShowed = false;
  } else {
    $("#keyboard_div").show();
    $(btn_HideAndShowKeyboard).html("Hide keyboard");
    isKeyboardShowed = true;
  }
  DefineRowsHeight();
  if (isScreenMode) {
    if (!isInputVarActivated) Preview.UpdateCursorPosition();
    //if (interval_var != 0) CloseInterval();
    //interval_var = setInterval(myInterval, 500);
  }
}

function DefaultTextSize(value) {
  var new_value = parseFloat(value.slice(0, (value.length - 1)));
  original_size = parseFloat(new_value) * 1.5;
}

function DefineNumberFormat(value) {
  num_format_type = value;
  if (num_format_type == "automatic") {
    $("#LowerExpP").show();
    $("#UpperExpP").show();
  } else {
    $("#LowerExpP").hide();
    $("#UpperExpP").hide();
  }
}

function DefineNumDecimals(value) {
  num_decimals = parseInt(value);
}

function DefineLowerExp(value) {
  exp_min = parseInt(value);
}

function DefineUpperExp(value) {
  exp_max = parseInt(value);
}

function DefaultAnglesUnit(value) {
  angles_units = value;
}

function LibraryFunctionsList() {
  var elem = document.getElementById("LibFunListMenu");
  $(elem).show();
  PositionateMenu("#btnLibFun", "#LibFunListMenu", "drop-up-right");
}

function UserCreateVars() {
  var elem = document.getElementById("UserCreateVarsMenu");
  $(elem).show();
  PositionateMenu("#btnVars", "#UserCreateVarsMenu", "drop-up");
}

function CloseSubMenus() {
  for (var i_menu = 0; i_menu < SubMenuList.length; i_menu++) {
    for (var i_submenu = 0; i_submenu < SubMenuList[i_menu].length; i_submenu++) {
      if ($(SubMenuList[i_menu][i_submenu]).css("display") == "block") $(SubMenuList[i_menu][i_submenu]).css("display", "none");
    }
  }
}

function CreateVar() {
  if (eigv_cont != 0) {
    alert("Var storage is not allowed for eigenvalue analysis!!!");
    return;
  }
  if (IsUDF_DefinitionActive() || IsVar_DefinitionActive()) {
    return;
  }

  CloseSubMenus();
  ActiveBody("#bodyInputVarName");

  var var_name_text = document.getElementById("var_name_text");
  var_name_text.value = "";
  var_name_text.focus();
  document.getElementById("var_type").selectedIndex = 0;
  expr_xml_old = expr_xml.cloneNode(true);
  isScreenMode_old = isScreenMode;
  ClearAll();
}


function InputVarFocus() {
  isInputVarActivated = true;
  if (interval_var != 0) CloseInterval();
  //HideAndShowKeyboard();
}

function InputVarBlur(e) {
  isInputVarActivated = false;
  if (!isKeyboardShowed) HideAndShowKeyboard();
  else Preview.UpdateCursorPosition();
}

//This function show the "#bodyInputFunName" to define the name of the funcion
// and paramters name
function CreateUserDefFun() {
  if (eigv_cont != 0) {
    alert("Function storage is not allowed for eigenvalue analysis!!!");
    return;
  }
  if (IsUDF_DefinitionActive() || IsVar_DefinitionActive()) {
    return;
  }

  CloseSubMenus();
  ActiveBody("#bodyInputFunName");

  var fun_name_text = document.getElementById("fun_name_text");
  fun_name_text.value = "";
  fun_name_text.focus();
  document.getElementById("NumOfParams").selectedIndex = 0;
  $(".name_parameter").remove();
  $(".type_parameter").remove();
  $(".name_parameter_label").remove();
  $(".hr_line").remove();
  isInputUSFActivated = true;
  expr_xml_old = expr_xml.cloneNode(true);
  isScreenMode_old = isScreenMode;
  ClearAll();
}

function GetElementById(xml_dom, elemId) {
  var selector = "[id='" + elemId + "']";
  return xml_dom.querySelector(selector);
}

//This function is deprecreated
function CopyCurrNode() {
  var currNode, parentNode;
  if (isScreenMode) {
    if (currId != "root") {

      currNode = GetElementById(expr_xml, currId);
      if (!currNode) return;
      if (IsGreyColorNode(currNode)) return;
    } else {
      alert("There is no node to copy!!!");
      return;
    }
  } else {
    if (eigv_cont != 0) return;
    var parentNode = GetElementById(expr_xml, "root");
    currNode = parentNode.lastChild;
  }

  if (isEditModeInputVar) {
    var newNode = currNode.cloneNode(true);
    varNode_list[currIvar] = newNode;
    var typeNode = FindOutTypeOfNode(newNode);
    varType_list[currIvar] = typeNode;
    var var_name = document.getElementById("var_text").value;
    varLabel_list[currIvar] = var_name;
  } else {
    var newNode = currNode.cloneNode(true);
    varNode_list.push(newNode);
    var typeNode = FindOutTypeOfNode(newNode);
    varType_list.push(typeNode);
    var var_name = document.getElementById("var_text").value;
    varLabel_list.push(var_name);
  }

  $("#inputVar_div").css("display", "none");

  if (!isKeyboardShowed) {
    $("#keyboard_div").show();
    var btn_HideAndShowKeyboard = document.getElementById("btnHideAndShowKeyboard");
    $(btn_HideAndShowKeyboard).html("Hide keyboard");
    isKeyboardShowed = true;
  }
  DefineRowsHeight();
  Preview.UpdateCursorPosition();

  document.getElementById("var_text").value = "";
}

function CopyWholeExpresion() {
  var newNode, parentNode;
  var parentNode = GetElementById(expr_xml, "root");
  if (isScreenMode) {
    if (currId == "root") {
      alert("There is no expression to copy!!!");
      return;
    }
    newNode = parentNode.cloneNode(true);
  } else {
    if (eigv_cont != 0) return;

    lastChild = parentNode.lastChild.cloneNode(true);
    var newNode = parentNode.cloneNode(true);
    var node_list = newNode.childNodes;
    do {
      var node = node_list[node_list.length - 1];
      if (node) newNode.removeChild(node);
    }
    while (node_list.length != 0);

    newNode.appendChild(lastChild);
  }

  var var_name = document.getElementById("var_name_text").value;
  if (IsGreekLetter(var_name)) {
    newNode = CorrectGreekLetterVar(newNode);
  }
  varNode_list[currIvar] = newNode;

  $("#inputVar_div").css("display", "none");

  if (!isKeyboardShowed) {
    $("#keyboard_div").show();
    var btn_HideAndShowKeyboard = document.getElementById("btnHideAndShowKeyboard");
    $(btn_HideAndShowKeyboard).html("Hide keyboard");
    isKeyboardShowed = true;
  }

  $("#screenLine").css("padding", "15px 5px");

  DefineRowsHeight();
  Preview.UpdateCursorPosition();
  document.getElementById("var_name_text").value = "";
}

function CopyFunctionExpression() {
  var newNode, parentNode;
  var parentNode = GetElementById(expr_xml, "root");
  if (isScreenMode) {
    if (currId == "root") {
      alert("There is no expression to copy!!!");
      return;
    }
    newNode = parentNode.cloneNode(true);
  } else {
    if (eigv_cont != 0) return;

    lastChild = parentNode.lastChild.cloneNode(true);
    var newNode = parentNode.cloneNode(true);
    var node_list = newNode.childNodes;
    do {
      var node = node_list[node_list.length - 1];
      if (node) newNode.removeChild(node);
    }
    while (node_list.length != 0);

    newNode.appendChild(lastChild);
  }

  newNode = CorrectGreekLetterParam(newNode);
  userDefFunNode_list[curr_UDF] = newNode;

  $("#inputFun_div").css("display", "none");

  if (!isKeyboardShowed) {
    $("#keyboard_div").show();
    var btn_HideAndShowKeyboard = document.getElementById("btnHideAndShowKeyboard");
    $(btn_HideAndShowKeyboard).html("Hide keyboard");
    isKeyboardShowed = true;
  }

  $("#screenLine").css("padding", "15px 5px");

  DefineRowsHeight();
  Preview.UpdateCursorPosition();
}

function CorrectGreekLetterParam(node) {
  var param_list = node.querySelectorAll("mi[type='param']");
  for (var i = 0; i < param_list.length; i++) {
    var text = param_list[i].childNodes[0].nodeValue;
    if (text.substring(0, 1) == "&") {
      text = text.substring(1, text.length - 1);
      param_list[i].childNodes[0].nodeValue = text;
    }
  }
  return node;
}

function CorrectGreekLetterVar(node) {
  var param_list = node.querySelectorAll("mi[type='var']");
  for (var i = 0; i < param_list.length; i++) {
    var text = param_list[i].childNodes[0].nodeValue;
    if (text.substring(0, 1) == "&") {
      text = text.substring(1, text.length - 1);
      param_list[i].childNodes[0].nodeValue = text;
    }
  }
  return node;
}

function IsValidInputVarExpression(xml_expression) {
  var isValidInputVarExpression = true;
  NodeColor_list = xml_expression.querySelectorAll("[color]");
  for (var inode = 0; inode < NodeColor_list.length; inode++) {
    var node = NodeColor_list[inode];
    if (!(IsParamMiNode(node) || IsParamMnNode(node))) {
      isValidInputVarExpression = false;
      break;
    }
  }
  return isValidInputVarExpression;
}

function SaveInputVar(event) {
  var parentNode = expr_xml.documentElement;
  var childNodes = parentNode.childNodes;
  if (isScreenMode) {
    if (childNodes.length <= 1) {
      alert("There is no node to copy!!!");
      return;
    } else {
      if (!IsValidInputVarExpression(expr_xml)) {
        alert("Only numeric expressions can be storaged!!!");
        return;
      }
    }
  }

  parentNode.removeChild(childNodes[0]);

  CopyWholeExpresion();
  isEditModeInputVar = false;
  CopyVarInLocalStorage();
  RenderOldExpression();
  currIvar = -1;
}

function CopyVarInLocalStorage() {
  if (storage) {
    var XML_serial = new XMLSerializer();
    var string_array = [];
    for (var ivar = 0; ivar < varNode_list.length; ivar++) {
      string_array[ivar] = XML_serial.serializeToString(varNode_list[ivar]);
    }
    storage.set("varNode_list", JSON.stringify(string_array));
    storage.set("varLabel_list", JSON.stringify(varLabel_list));
    storage.set("varType_list", JSON.stringify(varType_list));
  }
  for (var ipos = 0; ipos < OrderIndexVarAndFun.length; ipos++) {
    storage.set("OrderIndexVarAndFun", JSON.stringify(OrderIndexVarAndFun));
  }
}

function SaveInputFun(event) {
  var parentNode = expr_xml.documentElement;
  var childNodes = parentNode.childNodes;
  if (isScreenMode) {
    if (childNodes.length <= 1) {
      alert("There is no node to copy!!!");
      return;
    } else {
      if (expr_xml.querySelectorAll("[color]").length != 0) {
        alert("Only numeric expressions can be storaged!!!");
        return;
      }
    }
  }

  parentNode.removeChild(childNodes[0]);

  CopyFunctionExpression();
  isParamListCreated = false;
  isEditModeInputUserDefFun = false;
  curr_UDF = -1;
  CopyUDFInLocalStorage();
  RenderOldExpression();
}

function IsUDF_DefinitionActive() {
  var is_UDF_DefinitionActive = false;
  if ($("#inputFun_div").css("display") == "inline-block") {
    is_UDF_DefinitionActive = true;
  }
  return is_UDF_DefinitionActive;
}

function IsVar_DefinitionActive() {
  var is_Var_DefinitionActive = false;
  if ($("#inputVar_div").css("display") == "inline-block") {
    is_Var_DefinitionActive = true;
  }
  return is_Var_DefinitionActive;
}

function CopyUDFInLocalStorage() {
  if (storage) {
    var XML_serial = new XMLSerializer();
    var string_array = [];
    for (var ifun = 0; ifun < userDefFunNode_list.length; ifun++) {
      string_array[ifun] = XML_serial.serializeToString(userDefFunNode_list[ifun]);
    }
    storage.set("userDefFunNode_list", JSON.stringify(string_array));
    storage.set("userDefFunLabel_list", JSON.stringify(userDefFunLabel_list));
    storage.set("userDefFunParamType_list", JSON.stringify(userDefFunParamType_list));
    storage.set("userDefFunParamNames", JSON.stringify(userDefFunParamNames));
    for (var ipos = 0; ipos < OrderIndexVarAndFun.length; ipos++) {
      storage.set("OrderIndexVarAndFun", JSON.stringify(OrderIndexVarAndFun));
    }
  }
}

function CancelInputVar() {
  $("#inputVar_div").css("display", "none");
  $("#screenLine").css("padding", "15px 5px");

  if (!isEditModeInputVar) {
    var var_label_order = varLabel_list[currIvar] + "_var";
    var index = OrderIndexVarAndFun.indexOf(var_label_order);
    OrderIndexVarAndFun.splice(index, 1);

    varNode_list.splice(currIvar, 1);
    varLabel_list.splice(currIvar, 1);
    varType_list.splice(currIvar, 1);
  }

  DefineRowsHeight();
  isEditModeInputVar = false;
  RenderOldExpression();
  currIvar = -1;
}

//Place: This function is in "#bodyInputFunName" div
//Function: Hide "#bodyInputFunName" and show "#bodyCalculator"
function CancelInputFunName() {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  $("#bodyCalculator").show();
  $("#bodyInputFunName").hide();
  DefineRowsHeight();
  Preview.UpdateCursorPosition();

  if (curr_UDF != -1) {
    userDefFunNode_list.splice(curr_UDF, 1);
    userDefFunLabel_list.splice(curr_UDF, 1);
    userDefFunParamType_list.splice(curr_UDF, 1);
    userDefFunParamNames.splice(curr_UDF, 1);
  }
  $("#inputFun_div").css("display", "none");
  $("#screenLine").css("padding", "15px 5px");
  DefineRowsHeight();
  RenderOldExpression();

  isParamListCreated = false;
  isInputUSFActivated = false;
  curr_UDF = -1;
}

//Place: This function is in "#bodyInputFunName" div
//Function: Check the names of the function
//          Hide "#bodyInputFunName" and show "#bodyCalculator" and show "#inputFun_div"
function AcceptInputFunName() {
  if (!isParamListCreated) {
    var fun_Name = document.getElementById("fun_name_text").value;
    if (fun_Name == "") {
      alert("The function must have a name!!!");
      return;
    }

    if (userDefFunLabel_list.indexOf(fun_Name) != -1) {
      alert("This name for the function already exists!!!");
      return;
    }

    if (fun_Name.indexOf(" ") != -1) {
      alert("White spaces in the name of the function is not allowed!!!");
      return;
    }

    if (!(fun_Name[0].match(/[a-z]/i))) {
      alert("The function name must begin with a letter!!!");
      return;
    }

    var numOfParams = parseFloat(document.getElementById("NumOfParams").value);
    for (var iparam = 0; iparam < numOfParams; iparam++) {
      var i_param = iparam + 1;
      var text_html = "<hr class='hr_line'/><div class='name_parameter_label'><p><strong>Name parameter " + i_param +
                      ": " + "</strong><input id='name_param_" + i_param +
                      "' type='text' class='name_parameter' name='name_param_" + i_param +
                      "' size='7'></p><div>";
      text_html += "<div class='type_parameter'><p><strong>Type:</strong><select name='ParamType' id='param_type_" + i_param +
                   "' class='input_class' size='1'><option value='number' selected>Number</option>"
                   + "<option value='vector'>Vector</option><option value='matrix'>Matrix</option></select></div>";
      $(btnCancelInputFunNameDiv).before(text_html);
    }

    userDefFunNode_list[userDefFunNode_list.length] = "";
    userDefFunLabel_list[userDefFunLabel_list.length] = fun_Name;
    userDefFunParamType_list[userDefFunParamType_list.length] = [];
    userDefFunParamNames[userDefFunParamNames.length] = [];
    var fun_label_order = fun_Name + "_udf";
    OrderIndexVarAndFun[OrderIndexVarAndFun.length] = fun_label_order;
    isParamListCreated = true;
  } else {
    var numOfParams = parseFloat(document.getElementById("NumOfParams").value);
    var paramName_list = [];
    var paramType_list = [];
    for (var iparam = 0; iparam < numOfParams; iparam++) {
      var i_param = iparam + 1;
      var selector_name = "name_param_" + i_param;
      var paramName = document.getElementById(selector_name).value;
      var selector_type = "param_type_" + i_param;
      var paramType = document.getElementById(selector_type).value;
      if (paramName == "") {
        alert("The parameters must have a name!!!");
        return;
      }

      if (paramName.indexOf(" ") != -1) {
        alert("White spaces in the name of the parameters is not allowed!!!");
        return;
      }

      if (!(paramName[0].match(/[a-z]/i)) && paramName[0] != "&") {
        alert("The name the parameters must begin with a letter!!!");
        return;
      }
      paramName_list[paramName_list.length] = paramName;
      paramType_list[paramType_list.length] = paramType;
    }
    for (var iparam = 0; iparam < numOfParams; iparam++) {
      var name = paramName_list[iparam];
      if (paramName_list.indexOf(name) != paramName_list.lastIndexOf(name)) {
        alert("The name of parameters can be repetead!!!");
        return;
      }
    }
    var i_Function = userDefFunLabel_list.length - 1;
    userDefFunParamNames[i_Function] = paramName_list;
    userDefFunParamType_list[i_Function] = paramType_list;
    curr_UDF = i_Function;
    $("#bodyInputFunName").hide();
    $("#inputFun_div").css("display", "inline-block");
    $("#bodyCalculator").show();
    DefineRowsHeight();
    InsertUDF_Label(i_Function);
    isInputUSFActivated = false;
  }
}

function InsertUDF_Label(ifun) {
  var currNode, currTag, parentNode;
  parentNode = expr_xml.documentElement;

  var newMfenced_ext = expr_xml.createElement("mfenced");
  mfenced_cont++;
  var newOpen_ext = expr_xml.createAttribute("open");
  newOpen_ext.nodeValue = "";
  newMfenced_ext.setAttributeNode(newOpen_ext);
  var newClose_ext = expr_xml.createAttribute("close");
  newClose_ext.nodeValue = "";
  newMfenced_ext.setAttributeNode(newClose_ext);
  var newIdMfenced_ext = expr_xml.createAttribute("id");
  var idMfenced_ext = "mfenced_" + mfenced_cont;
  currId = idMfenced_ext;
  newIdMfenced_ext.nodeValue = idMfenced_ext;
  newMfenced_ext.setAttributeNode(newIdMfenced_ext);
  var newSeparator_ext = expr_xml.createAttribute("separators");
  newSeparator_ext.nodeValue = "";
  newMfenced_ext.setAttributeNode(newSeparator_ext);
  var newType_ext = expr_xml.createAttribute("type");
  newType_ext.nodeValue = "non_erasable";
  newMfenced_ext.setAttributeNode(newType_ext);

  var node_fenced_ext = parentNode.appendChild(newMfenced_ext);

  var newElement = expr_xml.createElement("mi");
  var newLabel = expr_xml.createTextNode(userDefFunLabel_list[ifun]);
  newElement.appendChild(newLabel);

  var newType = expr_xml.createAttribute("type");
  newType.nodeValue = "non_searchable";
  newElement.setAttributeNode(newType);

  var newMathvariant = expr_xml.createAttribute("mathvariant");
  newMathvariant.nodeValue = "italic";
  newElement.setAttributeNode(newMathvariant);
  var newNode = node_fenced_ext.appendChild(newElement);

  var newMfenced_int = expr_xml.createElement("mfenced");
  var newOpen = expr_xml.createAttribute("open");
  newOpen.nodeValue = "(";
  newMfenced_int.setAttributeNode(newOpen);
  var newClose = expr_xml.createAttribute("close");
  newClose.nodeValue = ")";
  newMfenced_int.setAttributeNode(newClose);
  var newSeparator = expr_xml.createAttribute("separators");
  newSeparator.nodeValue = "";
  newMfenced_int.setAttributeNode(newSeparator);
  var newType_int = expr_xml.createAttribute("type");
  newType_int.nodeValue = "non_searchable";
  newMfenced_int.setAttributeNode(newType_int);

  var node_fenced_int = node_fenced_ext.appendChild(newMfenced_int);

  for (var iparam = 0; iparam < userDefFunParamNames[ifun].length; iparam++) {
    var newMn = expr_xml.createElement("mn");
    var newTypeMn = expr_xml.createAttribute("type");
    newTypeMn.nodeValue = "non_searchable";
    newMn.setAttributeNode(newTypeMn);
    var node_mn = node_fenced_int.appendChild(newMn);
    var param_name = userDefFunParamNames[ifun][iparam];
    if (IsGreekLetter(param_name)) {
      param_name = "&" + param_name + ";";
    }
    if (userDefFunParamType_list[ifun][iparam] == "vector" || userDefFunParamType_list[ifun][iparam] == "matrix") {
      var newMathvariant = expr_xml.createAttribute("mathvariant");
      newMathvariant.nodeValue = "bold";
      newMn.setAttributeNode(newMathvariant);
    } else {
      var newMathvariant = expr_xml.createAttribute("mathvariant");
      newMathvariant.nodeValue = "italic";
      newMn.setAttributeNode(newMathvariant);
    }
    var newText = expr_xml.createTextNode(param_name);
    var node_text = node_mn.appendChild(newText);

    if (iparam < (userDefFunParamNames[ifun].length - 1)) {
      var newComa = expr_xml.createElement("mi");
      var node_Coma = node_fenced_int.appendChild(newComa);
      var Coma_text = expr_xml.createTextNode(",");
      var node_text_Coma = node_Coma.appendChild(Coma_text);
      var newTypeComa = expr_xml.createAttribute("type");
      var MiType = "non_searchable";
      newTypeComa.nodeValue = MiType;
      newComa.setAttributeNode(newTypeComa);
      var node_Coma = node_fenced_int.appendChild(newComa);
    }
  }

  var EqualSign = expr_xml.createElement("mo");
  var newOper = expr_xml.createTextNode("=");
  EqualSign.appendChild(newOper);
  var newTypeEqualSign = expr_xml.createAttribute("type");
  newTypeEqualSign.nodeValue = "non_searchable";
  EqualSign.setAttributeNode(newTypeEqualSign);
  newMfenced_ext.appendChild(EqualSign);

  CursorPos = 1;
  text_screen = xml_Serial.serializeToString(expr_xml);
  isZoomFrameRequired = true;
  InputChanges();
}

function CancelInputVarName() {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  $("#bodyCalculator").show();
  $("#bodyInputVarName").hide();
  DefineRowsHeight();
  RenderOldExpression();
}

function RenderOldExpression() {
  ClearAll();
  expr_xml = expr_xml_old.cloneNode(true);
  text_screen = xml_Serial.serializeToString(expr_xml);
  isScreenMode = isScreenMode_old;
  if (isScreenMode) {
    var parentNode = GetElementById(expr_xml, "root");
    parentNode = UpdateIdOfNode(parentNode);
    if (parentNode.hasChildNodes()) {
      var lastChild = parentNode.lastChild;
      currId = lastChild.getAttribute("id");
    } else {
      currId = parentNode.getAttribute("id")
    }
    CursorPos = 1;
    InputChanges();
  } else {
    if (interval_var != 0) CloseInterval();
    Preview.Update();
  }

}

function AcceptInputVarName() {
  var var_Name = document.getElementById("var_name_text").value;
  var var_Type = document.getElementById("var_type").value;

  if (var_Name == "") {
    alert("The variable must have a name!!!");
    return;
  }

  if (varLabel_list.indexOf(var_Name) != -1) {
    alert("This name for the variable already exists!!!");
    return;
  }

  if (var_Name.indexOf(" ") != -1) {
    alert("White spaces in the name of the variable is not allowed!!!");
    return;
  }

  if (!(var_Name[0].match(/[a-z]/i))) {
    alert("The var name must begin with a letter!!!");
    return;
  }

  i_var = varNode_list.length;
  currIvar = i_var;

  var var_label_order = var_Name + "_var";
  OrderIndexVarAndFun[OrderIndexVarAndFun.length] = var_label_order;

  varNode_list[varNode_list.length] = "";
  varLabel_list[varLabel_list.length] = var_Name;
  varType_list[varType_list.length] = var_Type;

  $("#bodyInputVarName").hide();
  $("#inputVar_div").css("display", "inline-block");
  $("#bodyCalculator").show();
  DefineRowsHeight();
  InsertVar_Label(i_var);
}

function InsertVar_Label(i_var) {
  var currNode, currTag, parentNode;
  parentNode = expr_xml.documentElement;

  var newMfenced_ext = expr_xml.createElement("mfenced");
  mfenced_cont++;
  var newOpen_ext = expr_xml.createAttribute("open");
  newOpen_ext.nodeValue = "";
  newMfenced_ext.setAttributeNode(newOpen_ext);
  var newClose_ext = expr_xml.createAttribute("close");
  newClose_ext.nodeValue = "";
  newMfenced_ext.setAttributeNode(newClose_ext);
  var newIdMfenced_ext = expr_xml.createAttribute("id");
  var idMfenced_ext = "mfenced_" + mfenced_cont;
  currId = idMfenced_ext;
  newIdMfenced_ext.nodeValue = idMfenced_ext;
  newMfenced_ext.setAttributeNode(newIdMfenced_ext);
  var newSeparator_ext = expr_xml.createAttribute("separators");
  newSeparator_ext.nodeValue = "";
  newMfenced_ext.setAttributeNode(newSeparator_ext);
  var newType_ext = expr_xml.createAttribute("type");
  newType_ext.nodeValue = "non_erasable";
  newMfenced_ext.setAttributeNode(newType_ext);

  var node_fenced_ext = parentNode.appendChild(newMfenced_ext);

  var newElement = expr_xml.createElement("mi");
  var newLabel = expr_xml.createTextNode(varLabel_list[i_var]);
  newElement.appendChild(newLabel);

  var newType = expr_xml.createAttribute("type");
  newType.nodeValue = "non_searchable";
  newElement.setAttributeNode(newType);

  var newMathvariant = expr_xml.createAttribute("mathvariant");
  if (varType_list[i_var] == "matrix" || varType_list[i_var] == "vector") {
    newMathvariant.nodeValue = "bold";
  }
  else newMathvariant.nodeValue = "normal";
  newElement.setAttributeNode(newMathvariant);
  var newNode = node_fenced_ext.appendChild(newElement);

  var EqualSign = expr_xml.createElement("mo");
  var newOper = expr_xml.createTextNode("=");
  EqualSign.appendChild(newOper);
  var newTypeEqualSign = expr_xml.createAttribute("type");
  newTypeEqualSign.nodeValue = "non_searchable";
  EqualSign.setAttributeNode(newTypeEqualSign);
  newMfenced_ext.appendChild(EqualSign);

  CursorPos = 1;
  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
}

function IsGreekLetter(string) {
  var isGreekLetter = false;
  if (Greek_Letter_list.indexOf(string) != -1) {
    isGreekLetter = true;
  }
  return isGreekLetter;
}


function ShowParamsMenu() {
  CloseSubMenus();
  var MenuShowParams = document.getElementById("MenuShowParams");
  var paramName_list = userDefFunParamNames[curr_UDF];
  var paramType_list = userDefFunParamType_list[curr_UDF];
  MenuShowParams.innerHTML = "";
  for (var iparam = 0; iparam < paramName_list.length; iparam++) {
    var param_name = paramName_list[iparam];
    if (IsGreekLetter(param_name)) {
      param_name = "&" + param_name + ";";
    }
    var param_type = paramType_list[iparam];
    if (param_type == "vector" || param_type == "matrix") {
      MenuShowParams.innerHTML += "<li><div onclick='InsertParam(" + curr_UDF + "," + iparam + ")';><strong>" + param_name + "<strong></div></li>";
    } else {
      MenuShowParams.innerHTML += "<li><div onclick='InsertParam(" + curr_UDF + "," + iparam + ")';><i>" + param_name + "</i></div></li>";
    }
  }


  $(MenuShowParams).show();
  PositionateMenu("#btnShowParamsMenu", "#MenuShowParams", "drop-up-right");
}

function CancelInputFun() {
  $("#inputFun_div").css("display", "none");
  $("#screenLine").css("padding", "15px 5px");

  DefineRowsHeight();
  RenderOldExpression();

  if (!isEditModeInputUserDefFun) {
    var fun_label_order = userDefFunLabel_list[curr_UDF] + "_udf";
    var index = OrderIndexVarAndFun.indexOf(fun_label_order);
    OrderIndexVarAndFun.splice(index, 1);

    userDefFunNode_list.splice(curr_UDF, 1);
    userDefFunLabel_list.splice(curr_UDF, 1);
    userDefFunParamType_list.splice(curr_UDF, 1);
    userDefFunParamNames.splice(curr_UDF, 1);
  }

  isInputUSFActivated = false;
  isParamListCreated = false;
  isEditModeInputUserDefFun = false;
  curr_UDF = -1;
}

function BackInputFun() {
  $("#inputFun_div").css("display", "none");
  ClearAll();
  CloseSubMenus();
  ActiveBody("#bodyInputFunName");

  var fun_name_text = document.getElementById("fun_name_text");
  document.getElementById("NumOfParams").selectedIndex = 0;
  $(".name_parameter").remove();
  $(".type_parameter").remove();
  $(".name_parameter_label").remove();
  $(".hr_line").remove();
  isInputUSFActivated = true;
  isParamListCreated = false;

  var fun_label_order = userDefFunLabel_list[curr_UDF] + "_udf";
  var index = OrderIndexVarAndFun.indexOf(fun_label_order);
  OrderIndexVarAndFun.splice(index, 1);

  userDefFunNode_list.splice(curr_UDF, 1);
  userDefFunLabel_list.splice(curr_UDF, 1);
  userDefFunParamType_list.splice(curr_UDF, 1);
  userDefFunParamNames.splice(curr_UDF, 1);
  CopyUDFInLocalStorage();
  fun_name_text.focus();
}

function BackInputVar() {
  $("#inputVar_div").css("display", "none");
  ClearAll();
  CloseSubMenus();
  ActiveBody("#bodyInputVarName");

  var var_name_text = document.getElementById("var_name_text");
  document.getElementById("var_type").selectedIndex = 0;

  var var_label_order = varLabel_list[currIvar] + "_var";
  var index = OrderIndexVarAndFun.indexOf(var_label_order);
  OrderIndexVarAndFun.splice(index, 1);

  varNode_list.splice(currIvar, 1);
  varLabel_list.splice(currIvar, 1);
  varType_list.splice(currIvar, 1);
  CopyVarInLocalStorage();
  var_name_text.focus();

  isEditModeInputVar = false;
}

function InsertVarMenu() {
  CloseSubMenus();
  var subMenuInsertVar = document.getElementById("subMenuInsertVar");
  if (varLabel_list.length == 0) {
    subMenuInsertVar.innerHTML = "<li><div>No variable to insert</div></li>";
  } else {
    subMenuInsertVar.innerHTML = "";
    for (var ivar = 0; ivar < varLabel_list.length; ivar++) {
      var var_label = varLabel_list[ivar];
      if (IsGreekLetter(var_label)) {
        var_label = "&" + var_label + ";";
      }
      if (varType_list[ivar] == "matrix") {
        subMenuInsertVar.innerHTML += "<li><div onclick='InsertVar(" + ivar + ")';><strong>" + var_label + "<strong></div></li>";
      } else {
        subMenuInsertVar.innerHTML += "<li><div onclick='InsertVar(" + ivar + ")';>" + var_label + "</div></li>";
      }
    }
  }

  $(subMenuInsertVar).show();
  PositionateMenu("#btnInsertVar", "#subMenuInsertVar", "move-left");
}

function InsertUserDefFunMenu() {
  CloseSubMenus();
  var subMenuInsertUserDefFun = document.getElementById("subMenuInsertUserDefFun");
  if (userDefFunLabel_list.length == 0) {
    subMenuInsertUserDefFun.innerHTML = "<li><div>No func to insert</div></li>";
  } else {
    subMenuInsertUserDefFun.innerHTML = "";
    for (var ifun = 0; ifun < userDefFunLabel_list.length; ifun++) {
      var fun_label = userDefFunLabel_list[ifun];
      subMenuInsertUserDefFun.innerHTML += "<li><div onclick='InsertUserDefFun(" + ifun + ")';>" + fun_label + "</div></li>";
    }
  }

  $(subMenuInsertUserDefFun).show();
  PositionateMenu("#btnInsertUserDefFun", "#subMenuInsertUserDefFun", "move-right");
}

function InsertVar(ivar) {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  if (varLabel_list.length == 0 || varLabel_list[ivar] == "undefined") {
    alert("There is no variable stored!!!");
    return;
  } else {
    if (ivar == currIvar) {
      alert("During the definition of a variable can not be inserted the same variable!!!");
      return;
    }
    var insertVar_name = varLabel_list[ivar];
    if (isEditModeInputVar || isEditModeInputUserDefFun) {
      var labelOrder_currVar = insertVar_name + "_var";
      var index_insertVar = OrderIndexVarAndFun.indexOf(labelOrder_currVar);
      if (isEditModeInputVar) {
        if (ivar == currIvar) {
          alert("In the edit mode the variable that is being edited can not be inserted!!!");
          $("#subMenuInsertVar").css("display", "none");
          $("#UserCreateVarsMenu").css("display", "none");
          return;
        }
        var currVar_name = expr_xml.documentElement.firstChild.firstChild.firstChild.nodeValue;
        var labelOrder_currVar = currVar_name + "_var";
        var index_currVar = OrderIndexVarAndFun.indexOf(labelOrder_currVar);
        if (index_currVar <= index_insertVar) {
          alert("To avoid recursive definition, during the edition of a var defined earlier cannot be inserted vars defined later!!!");
          $("#subMenuInsertVar").css("display", "none");
          $("#UserCreateVarsMenu").css("display", "none");
          return;
        }
      }

      if (isEditModeInputUserDefFun) {
        var currFun_name = expr_xml.documentElement.firstChild.firstChild.firstChild.nodeValue;
        var labelOrder_currFun = currFun_name + "_udf";
        var index_currFun = OrderIndexVarAndFun.indexOf(labelOrder_currFun);
        if (index_currFun <= index_insertVar) {
          alert("To avoid recursive definition, during the edition of a function defined earlier cannot be inserted vars defined later!!!");
          $("#subMenuInsertVar").css("display", "none");
          $("#UserCreateVarsMenu").css("display", "none");
          return;
        }
      }
    }

    var currNode, currTag, parentNode;
    var IsExpOfPowORIdxOfRoot = false;
    if (currId != "root") {
      currNode = GetElementById(expr_xml, currId);
      if (!currNode) return;
      if (IsExponentOfPower(currNode) || IsIndexOfRoot(currNode)) {
        IsExpOfPowORIdxOfRoot = true;
      }
      parentNode = currNode.parentNode;
      currTag = currNode.tagName;
      if (IsGreyColorNode(currNode)) {
        currNode = FindFirstCorrectNode(currId);
        if (currNode) currTag = currNode.tagName;
        else currTag = "";
      }

    } else {
      currTag = "";
      parentNode = expr_xml.documentElement;
    }

    if (currTag == "mn") {
      var Num = parseFloat(currNode.childNodes[0].nodeValue);
      if (Num == 0) {
        parentNode.removeChild(currNode);
        currTag = "";
      }
    }

    var newElement = expr_xml.createElement("mi");
    var var_name = insertVar_name;
    if (IsGreekLetter(var_name)) {
      var_name = "&" + var_name + ";";
    }
    var newLabel = expr_xml.createTextNode(var_name);
    var newId = expr_xml.createAttribute("id");
    mi_cont++;
    newId.nodeValue = "mi_" + mi_cont;
    newElement.appendChild(newLabel);
    newElement.setAttributeNode(newId);

    var newTypeFun = expr_xml.createAttribute("type");
    var funType = "var";
    newTypeFun.nodeValue = funType;
    newElement.setAttributeNode(newTypeFun);

    var newMathvariant = expr_xml.createAttribute("mathvariant");
    if (varType_list[ivar] == "matrix") newMathvariant.nodeValue = "bold";
    else newMathvariant.nodeValue = "normal";
    //else newMathvariant.nodeValue = "italic";
    newElement.setAttributeNode(newMathvariant);

    var newNode = parentNode.appendChild(newElement);

    var node_Mi;
    if (currNode) {
      if (CursorPos == 0) {
        node_Mi = parentNode.insertBefore(newNode, currNode);
        CursorPos = 1;
      } else {
        if (CursorPos == 1) {
          var NextNode = currNode.nextSibling;
          if (NextNode) {
            node_Mi = parentNode.insertBefore(newNode, NextNode);
          }
          else {
            node_Mi = parentNode.appendChild(newNode);
          }
        } else if (CursorPos == 0.5) {
          if (currTag = "mn") {
            var textNum = currNode.childNodes[0].nodeValue;
            var firstPart = textNum.substring(0, NumDigitLeft);
            var secondPart = textNum.substring(NumDigitLeft, (NumDigitLeft + NumDigitRight));
            ChangeTextToMnNode(currNode, secondPart);
            var newMn_elem = CreateMnElement(firstPart);
            var newMnNode = parentNode.insertBefore(newMn_elem, currNode);
            node_Mi = parentNode.insertBefore(newNode, currNode);
          }
        }
      }
    } else {
      if (IsMsup(parentNode) || IsMroot((parentNode))) {
        if (IsExpOfPowORIdxOfRoot) node_Mi = parentNode.appendChild(newNode);
        else {
          var firstChild = parentNode.firstChild;
          node_Mi = parentNode.insertBefore(newNode, firstChild);
        }
      } else node_Mi = parentNode.appendChild(newNode);
    }


    currId = node_Mi.getAttribute("id");
    text_screen = xml_Serial.serializeToString(expr_xml);
    InputChanges();
    $("#subMenuInsertVar").css("display", "none");
    $("#UserCreateVarsMenu").css("display", "none");
  }
}


function InsertParam(ifun, iparam) {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  if (userDefFunParamNames[ifun].length == 0 || userDefFunParamNames[ifun][iparam] == "undefined") {
    alert("There is no parameter stored!!!");
    return;
  } else {
    var currNode = null;
    var parentNode;
    var nextNode = null;
    var IsExpOfPowORIdxOfRoot = false;
    if (currId != "root") {
      currNode = GetElementById(expr_xml, currId);
      if (!currNode) return;
      if (IsExponentOfPower(currNode) || IsIndexOfRoot(currNode)) {
        IsExpOfPowORIdxOfRoot = true;
      }
      parentNode = currNode.parentNode;
      currTag = currNode.tagName;
      if (IsGreyColorNode(currNode)) {
        currNode = FindFirstCorrectNode(currId);
        if (currNode) currTag = currNode.tagName;
        else currTag = "";
      }

    } else {
      currTag = "";
      parentNode = expr_xml.documentElement;
    }


    if (currTag == "mn") {
      var Num = parseFloat(currNode.childNodes[0].nodeValue);
      if (Num == 0) {
        parentNode.removeChild(currNode);
        currTag = "";
      }
    }

    var newElement = expr_xml.createElement("mi");
    var param_name = userDefFunParamNames[ifun][iparam];
    if (IsGreekLetter(param_name)) {
      param_name = "&" + param_name + ";";
    }
    var newLabel = expr_xml.createTextNode(param_name);
    var newId = expr_xml.createAttribute("id");
    mi_cont++;
    newId.nodeValue = "mi_" + mi_cont;
    newElement.appendChild(newLabel);
    newElement.setAttributeNode(newId);

    var newTypeFun = expr_xml.createAttribute("type");
    var funType = "param";
    newTypeFun.nodeValue = funType;
    newElement.setAttributeNode(newTypeFun);

    var newParamType = expr_xml.createAttribute("param_type");
    var ParamType = userDefFunParamType_list[ifun][iparam];
    newParamType.nodeValue = ParamType;
    newElement.setAttributeNode(newParamType);

    var newMathvariant = expr_xml.createAttribute("mathvariant");
    if (userDefFunParamType_list[ifun][iparam] == "vector" || userDefFunParamType_list[ifun][iparam] == "matrix") {
      newMathvariant.nodeValue = "bold";
    } else newMathvariant.nodeValue = "italic";
    newElement.setAttributeNode(newMathvariant);
    var node_Func = parentNode.appendChild(newElement);

    var node_Mi;
    if (currNode) {
      if (CursorPos == 0) {
        node_Mi = parentNode.insertBefore(node_Func, currNode);
      } else {
        if (CursorPos == 1) {
          var NextNode = currNode.nextSibling;
          if (NextNode) {
            node_Mi = parentNode.insertBefore(node_Func, NextNode);
          }
          else {
            node_Mi = parentNode.appendChild(node_Func);
          }
        } else if (CursorPos == 0.5) {
          if (currTag = "mn") {
            var textNum = currNode.childNodes[0].nodeValue;
            var firstPart = textNum.substring(0, NumDigitLeft);
            var secondPart = textNum.substring(NumDigitLeft, (NumDigitLeft + NumDigitRight));
            ChangeTextToMnNode(currNode, secondPart);
            var newMn_elem = CreateMnElement(firstPart);
            var newMnNode = parentNode.insertBefore(newMn_elem, currNode);
            node_Mi = parentNode.insertBefore(node_Func, currNode);
          }
        }
      }
    } else {
      if (IsMsup(parentNode) || IsMroot((parentNode))) {
        if (IsExpOfPowORIdxOfRoot) node_Mi = parentNode.appendChild(node_Func);
        else {
          var firstChild = parentNode.firstChild;
          node_Mi = parentNode.insertBefore(node_Func, firstChild);
        }
      } else node_Mi = parentNode.appendChild(node_Func);
    }

    currId = node_Mi.getAttribute("id");
    text_screen = xml_Serial.serializeToString(expr_xml);
    InputChanges();
  }
}

function InsertUserDefFun(ifun) {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  if (userDefFunLabel_list.length == 0 || userDefFunLabel_list[ifun] == "undefined") {
    alert("There is no function stored!!!");
    return;
  } else {
    if ((ifun == curr_UDF) && (curr_UDF != -1)) {
      alert("During the definition of a function can not be inserted the same function!!!");
      return;
    }
    var insertFun_name = userDefFunLabel_list[ifun];
    if (isEditModeInputVar || isEditModeInputUserDefFun) {
      var labelOrder_currFun = insertFun_name + "_udf";
      var index_insertFun = OrderIndexVarAndFun.indexOf(labelOrder_currFun);
      if (isEditModeInputVar) {
        var currVar_name = expr_xml.documentElement.firstChild.firstChild.firstChild.nodeValue;
        var labelOrder_currVar = currVar_name + "_var";
        var index_currVar = OrderIndexVarAndFun.indexOf(labelOrder_currVar);
        if (index_currVar <= index_insertFun) {
          alert("To avoid recursive definition, during the edition of a var defined earlier cannot be inserted functions defined later!!!");
          $("#subMenuInsertVar").css("display", "none");
          $("#UserCreateVarsMenu").css("display", "none");
          return;
        }
      }

      if (isEditModeInputUserDefFun) {
        if (ifun == curr_UDF) {
          alert("In the edit mode the function that is being edited can not be inserted!!!");
          $("#subMenuInsertVar").css("display", "none");
          $("#UserCreateVarsMenu").css("display", "none");
          return;
        }
        var currFun_name = expr_xml.documentElement.firstChild.firstChild.firstChild.nodeValue;
        var labelOrder_currFun = currFun_name + "_udf";
        var index_currFun = OrderIndexVarAndFun.indexOf(labelOrder_currFun);
        if (index_currFun <= index_insertFun) {
          alert("To avoid recursive definition, during the edition of a function defined earlier cannot be inserted functions defined later!!!");
          $("#subMenuInsertVar").css("display", "none");
          $("#UserCreateVarsMenu").css("display", "none");
          return;
        }
      }
    }
    var currNode, currTag, parentNode;
    var IsExpOfPowORIdxOfRoot = false;
    if (currId != "root") {
      currNode = GetElementById(expr_xml, currId);
      if (!currNode) return;
      if (IsExponentOfPower(currNode) || IsIndexOfRoot(currNode)) {
        IsExpOfPowORIdxOfRoot = true;
      }
      parentNode = currNode.parentNode;
      currTag = currNode.tagName;
      if (IsGreyColorNode(currNode)) {
        currNode = FindFirstCorrectNode(currId);
        if (currNode) currTag = currNode.tagName;
        else currTag = "";
      }

    } else {
      currTag = "";
      parentNode = expr_xml.documentElement;
    }

    if (currTag == "mn") {
      var Num = parseFloat(currNode.childNodes[0].nodeValue);
      if (Num == 0) {
        parentNode.removeChild(currNode);
        currTag = "";
      }
    }

    var newMfenced_ext = expr_xml.createElement("mfenced");
    mfenced_cont++;
    var newOpen_ext = expr_xml.createAttribute("open");
    newOpen_ext.nodeValue = "";
    newMfenced_ext.setAttributeNode(newOpen_ext);
    var newClose_ext = expr_xml.createAttribute("close");
    newClose_ext.nodeValue = "";
    newMfenced_ext.setAttributeNode(newClose_ext);
    var newIdMfenced_ext = expr_xml.createAttribute("id");
    var idMfenced_ext = "mfenced_" + mfenced_cont;
    newIdMfenced_ext.nodeValue = idMfenced_ext;
    newMfenced_ext.setAttributeNode(newIdMfenced_ext);
    var newSeparator_ext = expr_xml.createAttribute("separators");
    newSeparator_ext.nodeValue = "";
    newMfenced_ext.setAttributeNode(newSeparator_ext);

    var node_fenced_ext;
    if (currNode) {
      if (CursorPos == 0) {
        node_fenced_ext = parentNode.insertBefore(newMfenced_ext, currNode);
      } else {
        if (CursorPos == 1) {
          var NextNode = currNode.nextSibling;
          if (NextNode) {
            node_fenced_ext = parentNode.insertBefore(newMfenced_ext, NextNode);
          }
          else {
            node_fenced_ext = parentNode.appendChild(newMfenced_ext);
          }
        } else if (CursorPos == 0.5) {
          if (currTag = "mn") {
            var textNum = currNode.childNodes[0].nodeValue;
            var firstPart = textNum.substring(0, NumDigitLeft);
            var secondPart = textNum.substring(NumDigitLeft, (NumDigitLeft + NumDigitRight));
            ChangeTextToMnNode(currNode, secondPart);
            var newMn_elem = CreateMnElement(firstPart);
            var newMnNode = parentNode.insertBefore(newMn_elem, currNode);
            node_fenced_ext = parentNode.insertBefore(newMfenced_ext, currNode);
          }
        }
      }
    } else {
      if (IsMsup(parentNode) || IsMroot((parentNode))) {
        if (IsExpOfPowORIdxOfRoot) node_fenced_ext = parentNode.appendChild(newMfenced_ext);
        else {
          var lastChild = parentNode.lastChild;
          node_fenced_ext = parentNode.insertBefore(newMfenced_ext, lastChild);
        }
      } else node_fenced_ext = parentNode.appendChild(newMfenced_ext);
    }

    var newElement = expr_xml.createElement("mi");
    var newLabel = expr_xml.createTextNode(userDefFunLabel_list[ifun]);
    var newId = expr_xml.createAttribute("id");
    mi_cont++;
    newId.nodeValue = "mi_" + mi_cont;
    newElement.appendChild(newLabel);
    newElement.setAttributeNode(newId);

    var newType = expr_xml.createAttribute("type");
    newType.nodeValue = "udf";
    newElement.setAttributeNode(newType);

    var newMathvariant = expr_xml.createAttribute("mathvariant");
    newMathvariant.nodeValue = "italic";
    newElement.setAttributeNode(newMathvariant);
    var newNode = node_fenced_ext.appendChild(newElement);


    var newMfenced_int = expr_xml.createElement("mfenced");
    mfenced_cont++;
    var newOpen = expr_xml.createAttribute("open");
    newOpen.nodeValue = "(";
    newMfenced_int.setAttributeNode(newOpen);
    var newClose = expr_xml.createAttribute("close");
    newClose.nodeValue = ")";
    newMfenced_int.setAttributeNode(newClose);
    var newIdMfenced = expr_xml.createAttribute("id");
    var idMfenced = "mfenced_" + mfenced_cont;
    newIdMfenced.nodeValue = idMfenced;
    newMfenced_int.setAttributeNode(newIdMfenced);
    var newSeparator = expr_xml.createAttribute("separators");
    newSeparator.nodeValue = "";
    newMfenced_int.setAttributeNode(newSeparator);
    var node_fenced_int = node_fenced_ext.appendChild(newMfenced_int);

    for (var iparam = 0; iparam < userDefFunParamNames[ifun].length; iparam++) {
      var newMn = expr_xml.createElement("mn");
      var newIdMn = expr_xml.createAttribute("id");
      mn_cont++;
      var idMn = "mn_" + mn_cont;
      if (iparam == 0) currId = idMn;
      newIdMn.nodeValue = idMn;
      newMn.setAttributeNode(newIdMn);
      var newColor = expr_xml.createAttribute("color");
      newColor.nodeValue = "#A4A4A4";
      newMn.setAttributeNode(newColor);
      var newTypeMn = expr_xml.createAttribute("type");
      newTypeMn.nodeValue = "param";
      newMn.setAttributeNode(newTypeMn);
      var node_mn = node_fenced_int.appendChild(newMn);
      var param_name = userDefFunParamNames[ifun][iparam];
      if (IsGreekLetter(param_name)) {
        param_name = "&" + param_name + ";";
      }
      if (userDefFunParamType_list[ifun][iparam] == "vector" || userDefFunParamType_list[ifun][iparam] == "matrix") {
        var newMathvariant = expr_xml.createAttribute("mathvariant");
        newMathvariant.nodeValue = "bold";
        newMn.setAttributeNode(newMathvariant);
      } else {
        var newMathvariant = expr_xml.createAttribute("mathvariant");
        newMathvariant.nodeValue = "italic";
        newMn.setAttributeNode(newMathvariant);
      }
      var newText = expr_xml.createTextNode(param_name);
      var node_text = node_mn.appendChild(newText);

      if (iparam < (userDefFunParamNames[ifun].length - 1)) {
        var newComa = expr_xml.createElement("mi");
        var node_Coma = node_fenced_int.appendChild(newComa);
        var Coma_text = expr_xml.createTextNode(",");
        var node_text_Coma = node_Coma.appendChild(Coma_text);
        var newTypeComa = expr_xml.createAttribute("type");
        var MiType = "coma";
        newTypeComa.nodeValue = MiType;
        newComa.setAttributeNode(newTypeComa);
        var node_Coma = node_fenced_int.appendChild(newComa);
      }
    }

    UDF_cont++;

    CursorPos = 1;
    text_screen = xml_Serial.serializeToString(expr_xml);
    InputChanges();
    $("#subMenuInsertUserDefFun").css("display", "none");
    $("#UserDefFunMenu").css("display", "none");
  }
}

function ReplaceNode_from_VarNode_List(ivar, currNode, parentNode) {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  if (!varNode_list[ivar]) {
    alert("There is no variable stored!!!")
  } else {
    var newNode = varNode_list[ivar].cloneNode(true);
    newNodeId = newNode.getAttribute("id");
    if (newNodeId == "root") {
      //This case is when the node to be inserted is an expression enclosed by '<math id="root">...</math>'
      var newMfenced = expr_xml.createElement("mfenced");
      mfenced_cont++;
      var newOpen = expr_xml.createAttribute("open");
      newOpen.nodeValue = "(";
      newMfenced.setAttributeNode(newOpen);
      var newClose = expr_xml.createAttribute("close");
      newClose.nodeValue = ")";
      newMfenced.setAttributeNode(newClose);
      var newIdMfenced = expr_xml.createAttribute("id");
      var idMfenced = "mfenced_" + mfenced_cont;
      newIdMfenced.nodeValue = idMfenced;
      newMfenced.setAttributeNode(newIdMfenced);
      var newSeparator = expr_xml.createAttribute("separators");
      newSeparator.nodeValue = "";
      newMfenced.setAttributeNode(newSeparator);

      var node_fenced = parentNode.insertBefore(newMfenced, currNode);
      var childNodes = newNode.childNodes;
      for (var inode = 0; inode < childNodes.length; inode++) {
        if (IsVarMiNode(childNodes[inode])) {
          var var_name = childNodes[inode].childNodes[0].nodeValue;
          var jvar = varLabel_list.indexOf(var_name);
          var newElemMi = childNodes[inode].cloneNode(true);
          var newNode_aux = node_fenced.appendChild(newElemMi);
          ReplaceNode_from_VarNode_List(jvar, newNode_aux, node_fenced);
        } else {
          var newNode_aux = childNodes[inode].cloneNode(true);
          var function_list = newNode_aux.querySelectorAll("mi");
          for (var i = 0; i < function_list.length; i++) {
            var fun_name = function_list[i].childNodes[0].nodeValue;
            if (IsVarLabel(fun_name) && IsVarMiNode(function_list[i])) {
              var ivar = varLabel_list.indexOf(fun_name);
              var parentNode_i = function_list[i].parentNode;
              ReplaceNode_from_VarNode_List(ivar, function_list[i], parentNode_i);
            } else if (IsUDFLabel(fun_name)) {
              ReplaceUDFMiNode(function_list[i]);
            }
          }
          node_fenced.appendChild(newNode_aux);
        }
      }
      parentNode.removeChild(currNode);
    } else {
      //This case is when the node to be inserted is an isolated node
      parentNode.insertBefore(newNode, currNode);
      parentNode.removeChild(currNode);
    }
  }
}

function IsSecondaryVarNode(node) {
  is_SecondaryVarNode = false;
  var mi_ElemList = node.getElementsByTagName("mi")
  for (var i = 0; i < mi_ElemList.length; i++) {
    if (IsVarMiNode(mi_ElemList[i])) {
      is_SecondaryVarNode = true;
      break;
    }
  }
  return is_SecondaryVarNode;
}


function EditVarMenu() {
  CloseSubMenus();
  var subMenuEditVar = document.getElementById("subMenuEditVar");
  if (varLabel_list.length == 0) {
    subMenuEditVar.innerHTML = "<li><div>No variable to edit</div></li>";
  } else {
    subMenuEditVar.innerHTML = "";
    for (var ivar = 0; ivar < varLabel_list.length; ivar++) {
      var var_label = varLabel_list[ivar];
      if (IsGreekLetter(var_label)) {
        var_label = "&" + var_label + ";";
      }
      if (varType_list[ivar] == "matrix") {
        subMenuEditVar.innerHTML += "<li><div onclick='EditVar(" + ivar + ")';><strong>" + var_label + "<strong></div></li>";
      } else {
        subMenuEditVar.innerHTML += "<li><div onclick='EditVar(" + ivar + ")';>" + var_label + "</div></li>";
      }
    }
  }

  $(subMenuEditVar).show();
  PositionateMenu("#btnEditVar", "#subMenuEditVar", "move-left");
}

function EditVar(ivar) {
  if (isEditModeInputVar) {
    alert("It can not be edited a variable during the definition of another!!!");
    return;
  }
  if (IsVar_DefinitionActive() || IsUDF_DefinitionActive()) {
    $("#subMenuEditVar").css("display", "none");
    $("#UserCreateVarsMenu").css("display", "none");
    alert("During var or function definition cannot be edited any var!!!");
    return;
  }
  expr_xml_old = expr_xml.cloneNode(true);
  isScreenMode_old = isScreenMode;
  ClearAll();
  CloseSubMenus();

  $("#inputVar_div").css("display", "inline-block");
  DefineRowsHeight();
  document.getElementById("var_name_text").value = varLabel_list[ivar];

  InsertVar_Label(ivar);
  var parentNode = GetElementById(expr_xml, "root");
  var editedNode = varNode_list[ivar].cloneNode(true);
  var editedNodeChilds = editedNode.childNodes;
  for (var inode = 0; inode < editedNodeChilds.length; inode++) {
    var newNode_i = editedNodeChilds[inode].cloneNode(true);;
    newNode_i = UpdateIdOfNode(newNode_i);
    parentNode.appendChild(newNode_i);
  }

  var lastNode = parentNode.lastChild;
  currId = lastNode.getAttribute("id");

  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
  isEditModeInputVar = true;
  currIvar = ivar;
  $("#subMenuEditVar").css("display", "none");
  $("#UserCreateVarsMenu").css("display", "none");
}

function EditUserDefFunMenu() {
  CloseSubMenus();
  var subMenuEditUserDefFun = document.getElementById("subMenuEditUserDefFun");
  if (userDefFunLabel_list.length == 0) {
    subMenuEditUserDefFun.innerHTML = "<li><div>No func to edit</div></li>";
  } else {
    subMenuEditUserDefFun.innerHTML = "";
    for (var ifun = 0; ifun < userDefFunLabel_list.length; ifun++) {
      var fun_label = userDefFunLabel_list[ifun];
      subMenuEditUserDefFun.innerHTML += "<li><div onclick='EditUserDefFun(" + ifun + ")';>" + fun_label + "</div></li>";
    }
  }

  $(subMenuEditUserDefFun).show();
  PositionateMenu("#btnEditUserDefFun", "#subMenuEditUserDefFun", "move-right");
}

function EditUserDefFun(ifun) {
  if (IsVar_DefinitionActive() || IsUDF_DefinitionActive()) {
    $("#subMenuEditUserDefFun").css("display", "none");
    $("#UserDefFunMenu").css("display", "none");
    alert("During var or function definition cannot be edited any function!!!");
    return;
  }
  expr_xml_old = expr_xml.cloneNode(true);
  isScreenMode_old = isScreenMode;
  ClearAll();
  CloseSubMenus();
  if (IsVar_DefinitionActive()) {
    return;
  }
  $("#inputFun_div").css("display", "inline-block");
  DefineRowsHeight();

  InsertUDF_Label(ifun);
  var parentNode = GetElementById(expr_xml, "root");
  var editedNode = userDefFunNode_list[ifun].cloneNode(true);
  var editedNodeChilds = editedNode.childNodes;
  for (var inode = 0; inode < editedNodeChilds.length; inode++) {
    var newNode_i = editedNodeChilds[inode].cloneNode(true);
    newNode_i = UpdateIdOfNode(newNode_i);
    parentNode.appendChild(newNode_i);
  }
  var param_list = parentNode.querySelectorAll("mi[type='param']");
  for (var i = 0; i < param_list.length; i++) {
    var param_text = param_list[i].childNodes[0].nodeValue;
    if (IsGreekLetter(param_text)) {
      param_text = "&" + param_text + ";";
      param_list[i].childNodes[0].nodeValue = param_text;
    }
  }

  var lastNode = parentNode.lastChild;
  currId = lastNode.getAttribute("id");

  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
  isEditModeInputUserDefFun = true;
  curr_UDF = ifun;
  $("#subMenuEditUserDefFun").css("display", "none");
  $("#UserDefFunMenu").css("display", "none");
}

function DeleteVarMenu() {
  CloseSubMenus();
  var subMenuDeleteVar = document.getElementById("subMenuDeleteVar");
  if (varLabel_list.length == 0) {
    subMenuDeleteVar.innerHTML = "<li><div>No variable to delete</div></li>";
  } else {
    subMenuDeleteVar.innerHTML = "";
    for (var ivar = 0; ivar < varLabel_list.length; ivar++) {
      var var_label = varLabel_list[ivar];
      if (IsGreekLetter(var_label)) {
        var_label = "&" + var_label + ";";
      }
      if (varType_list[ivar] == "matrix") {
        subMenuDeleteVar.innerHTML += "<li><div onclick='DeleteVarConfirmation(" + ivar + ")';><strong>" + var_label + "<strong></div></li>";
      } else {
        subMenuDeleteVar.innerHTML += "<li><div onclick='DeleteVarConfirmation(" + ivar + ")';>" + var_label + "</div></li>";
      }
    }
  }

  $(subMenuDeleteVar).show();
  PositionateMenu("#btnDeleteVar", "#subMenuDeleteVar", "move-left");
}

function DeleteVarConfirmation(ivar) {
  if (IsVar_DefinitionActive() || IsUDF_DefinitionActive()) {
    $("#subMenuDeleteVar").css("display", "none");
    $("#UserCreateVarsMenu").css("display", "none");
    alert("During var or function definition cannot be deleted any var!!!");
    return;
  }
  var var_label = varLabel_list[ivar];
  var message = "Are you sure to delete var: " + var_label + " ?";
  var answer = confirm(message);
  if (answer == true) {
    DeleteVar(ivar);
  } else {
    $("#subMenuDeleteVar").css("display", "none");
    $("#UserCreateVarsMenu").css("display", "none");
  }
}

function DeleteVar(ivar) {
  if (isEditModeInputVar) {
    alert("It can not be delete a variable during the definition of another!!!");
    return;
  }

  var var_label_order = varLabel_list[ivar] + "_var";
  var index = OrderIndexVarAndFun.indexOf(var_label_order);
  OrderIndexVarAndFun.splice(index, 1);

  varNode_list.splice(ivar, 1);
  varLabel_list.splice(ivar, 1);
  varType_list.splice(ivar, 1);

  $("#subMenuDeleteVar").css("display", "none");
  $("#UserCreateVarsMenu").css("display", "none");
  CopyVarInLocalStorage();
}

function DeleteAllVarConfirmation() {
  if (IsVar_DefinitionActive() || IsUDF_DefinitionActive()) {
    $("#subMenuDeleteVar").css("display", "none");
    $("#UserCreateVarsMenu").css("display", "none");
    alert("During var or function definition cannot be deleted any var!!!");
    return;
  }
  if (isEditModeInputVar) {
    alert("It can not be edited a variable during the definition of another!!!")
    return;
  }
  if (varNode_list.length != 0) {
    var message = "Are you sure to delete the all stored vars?"
    var answer = confirm(message);
    if (answer == true) {
      DeleteAllVar();
    }
  }

  for (var ivar = 0; ivar < varLabel_list.length; ivar++) {
    var var_label_order = varLabel_list[ivar] + "_var";
    var index = OrderIndexVarAndFun.indexOf(var_label_order);
    OrderIndexVarAndFun.splice(index, 1);
  }

  varNode_list = [];
  varLabel_list = [];
  varType_list = [];
  CopyVarInLocalStorage();

  $("#subMenuDeleteVar").css("display", "none");
  $("#UserCreateVarsMenu").css("display", "none");
}

function DeleteAllVar() {
  for (var ivar = 0; ivar < varLabel_list.length; ivar++) {
    var var_label_order = varLabel_list[ivar] + "_var";
    var index = OrderIndexVarAndFun.indexOf(var_label_order);
    OrderIndexVarAndFun.splice(index, 1);
  }
  varNode_list = [];
  varLabel_list = [];
  varType_list = [];
  CopyVarInLocalStorage();
  $("#subMenuDeleteVar").css("display", "none");
  $("#UserCreateVarsMenu").css("display", "none");
}



function DeleteUserDefFunMenu() {
  CloseSubMenus();
  var subMenuDeleteUserDefFun = document.getElementById("subMenuDeleteUserDefFun");
  if (userDefFunLabel_list.length == 0) {
    subMenuDeleteUserDefFun.innerHTML = "<li><div>No func to delete</div></li>";
  } else {
    subMenuDeleteUserDefFun.innerHTML = "";
    for (var ifun = 0; ifun < userDefFunLabel_list.length; ifun++) {
      var fun_label = userDefFunLabel_list[ifun];
      subMenuDeleteUserDefFun.innerHTML += "<li><div onclick='DeleteUserDefFunConfirmation(" + ifun + ")';>" + fun_label + "</div></li>";
    }
  }

  $(subMenuDeleteUserDefFun).show();
  PositionateMenu("#btnDeleteUserDefFun", "#subMenuDeleteUserDefFun", "move-right");
}

function DeleteUserDefFunConfirmation(ifun) {
  if (IsVar_DefinitionActive() || IsUDF_DefinitionActive()) {
    $("#subMenuDeleteUserDefFun").css("display", "none");
    $("#UserDefFunMenu").css("display", "none");
    alert("During var or function definition cannot be deleted any function!!!");
    return;
  }

  var fun_name = userDefFunLabel_list[ifun];
  var message = "Are you sure to delete function: " + fun_name + " ?";
  var answer = confirm(message);
  if (answer == true) {
    DeleteUserDefFun(ifun);
  } else {
    $("#inputFun_div").css("display", "none");
    $("#screenLine").css("padding", "15px 5px");
    DefineRowsHeight();
    Preview.UpdateCursorPosition();

    isParamListCreated = false;
    isInputUSFActivated = false;
    $("#subMenuDeleteUserDefFun").css("display", "none");
    $("#UserDefFunMenu").css("display", "none");
  }
}

function DeleteUserDefFun(ifun) {
  var fun_label_order = userDefFunLabel_list[curr_UDF] + "_udf";
  var index = OrderIndexVarAndFun.indexOf(fun_label_order);
  OrderIndexVarAndFun.splice(index, 1);

  userDefFunNode_list.splice(ifun, 1);
  userDefFunLabel_list.splice(ifun, 1);
  userDefFunParamType_list.splice(ifun, 1);
  userDefFunParamNames.splice(ifun, 1);
  $("#inputFun_div").css("display", "none");
  $("#screenLine").css("padding", "15px 5px");
  DefineRowsHeight();
  Preview.UpdateCursorPosition();

  isParamListCreated = false;
  isInputUSFActivated = false;
  $("#subMenuDeleteUserDefFun").css("display", "none");
  $("#UserDefFunMenu").css("display", "none");
  CopyUDFInLocalStorage();
}

function DeleteAllUserDefFun(ifun) {
  for (var ifun = 0; ifun < userDefFunLabel_list.length; ifun++) {
    var fun_label_order = userDefFunLabel_list[ifun] + "_udf";
    var index = OrderIndexVarAndFun.indexOf(fun_label_order);
    OrderIndexVarAndFun.splice(index, 1);
  }

  userDefFunNode_list = [];
  userDefFunLabel_list = [];
  userDefFunParamType_list = [];
  userDefFunParamNames = [];
  CopyUDFInLocalStorage();

  $("#inputFun_div").css("display", "none");
  $("#screenLine").css("padding", "15px 5px");
  DefineRowsHeight();
  Preview.UpdateCursorPosition();

  isParamListCreated = false;
  isInputUSFActivated = false;
  $("#subMenuDeleteUserDefFun").css("display", "none");
  $("#UserDefFunMenu").css("display", "none");
}

function DeleteAllUserDefFunConfirmation() {
  if (IsVar_DefinitionActive() || IsUDF_DefinitionActive()) {
    $("#subMenuDeleteUserDefFun").css("display", "none");
    $("#UserDefFunMenu").css("display", "none");
    alert("During var or function definition cannot be deleted any function!!!");
    return;
  }
  if (userDefFunNode_list.length != 0) {
    var message = "Are you sure to delete all the stored functions?"
    var answer = confirm(message);
    if (answer == true) {
      DeleteAllUserDefFun();
      return;
    }
  }

  userDefFunNode_list = [];
  userDefFunLabel_list = [];
  userDefFunParamType_list = [];
  userDefFunParamNames = [];
  CopyUDFInLocalStorage();

  $("#inputFun_div").css("display", "none");
  $("#screenLine").css("padding", "15px 5px");
  DefineRowsHeight();
  Preview.UpdateCursorPosition();

  isParamListCreated = false;
  isInputUSFActivated = false;
  $("#subMenuDeleteUserDefFun").css("display", "none");
  $("#UserDefFunMenu").css("display", "none")
}

function ConfigList() {
  $("#ConfigListMenu").show();
  PositionateMenu("#btnConfig", "#ConfigListMenu", "drop-down");
}

function PositionateMenu(button_elem, menu_elem, menu_type) {
  if ($(menu_elem).css('display') === "block") {
    $(menu_elem).css("left", 0);
    $(menu_elem).css("top", 0);
    var width = $(menu_elem).outerWidth();
    var height = $(menu_elem).height();
    var coord = $(button_elem).offset();
    var button_width = $(button_elem).outerWidth();
    var button_heigth = $(button_elem).outerHeight();
    var left, top;
    if (menu_type == "drop-down") {
      left = coord.left + button_width - width;
      top = coord.top + button_heigth + 2;
    } else if (menu_type == "drop-up") {
      left = coord.left + button_width - width;
      top = coord.top - height - 5;
      if (top < 10) {
        var new_height = coord.top - 15;
        $(menu_elem).css("max-height", new_height);
        top = 10;
      }
    } else if (menu_type == "drop-up-right") {
      left = coord.left;
      top = coord.top - height - 5;
      if (top < 10) {
        var new_height = coord.top - 15;
        $(menu_elem).css("max-height", new_height);
        top = 10;
      }
    } else if (menu_type == "move-left") {
      left = coord.left - width - 6;
      top = coord.top + button_heigth - height - 5;
      if (top < 10) {
        var new_height = coord.top + button_heigth - 15;
        $(menu_elem).css("max-height", new_height);
        top = 10;
      }
    } else if (menu_type == "move-right") {
      left = coord.left + button_width + 5;
      top = coord.top + button_heigth - height;
      if (top < 10) {
        var new_height = coord.top  + button_heigth - 10;
        $(menu_elem).css("max-height", new_height);
        top = 10;
      }
    }

    $(menu_elem).css("left", left);
    $(menu_elem).css("top", top);
  }
}

//Place: "#bodyCalculator"
//Function: Show "#UserDefFunMenu" menu for create a user def functions
function CreateUserDefFunMenu() {
  var elem = document.getElementById("UserDefFunMenu");
  $(elem).show();
  PositionateMenu("#btnUserDefFun", "#UserDefFunMenu", "drop-up-right");
}


function InsertFun(funName) {
  $("#LibFunListMenu").css("display", "none");
  GenericFunction(funName);
}

function IsImaginarySymbol(node) {
  if (!node) return false;
  var isImaginarySymbol = false;
  var label = node.firstChild.nodeValue;
  if (label == "i") {
    isImaginarySymbol = true;
  }
  return isImaginarySymbol;
}

function inputNumber(value) {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  var currNode = null;
  var currTag, parentNode;
  var IsExpOfPowORIdxOfRoot = false;
  var newNumNode;
  if (currId != "root") {
    currNode = GetElementById(expr_xml, currId);
    if (!currNode) return;
    if (IsExponentOfPower(currNode) || IsIndexOfRoot(currNode)) {
      IsExpOfPowORIdxOfRoot = true;
    }
    parentNode = currNode.parentNode;
    currTag = currNode.tagName;
    if (IsGreyColorNode(currNode)) {
      currNode = FindFirstCorrectNode(currId);
      if (currNode) currTag = currNode.tagName;
      else currTag = "";
    }

  } else {
    currTag = "";
    parentNode = expr_xml.documentElement;
  }

  if (currTag != "mn" || value == "i") {
    var newElement = expr_xml.createElement("mn");
    if (value == ".") {
      value = "0.";
    }
    var newNum = expr_xml.createTextNode(value);
    var newId = expr_xml.createAttribute("id");
    mn_cont++;
    newId.nodeValue = "mn_" + mn_cont;
    newElement.appendChild(newNum);
    newElement.setAttributeNode(newId);
    if(value=="i") {
      var newMathvariant = expr_xml.createAttribute("mathvariant");
      newMathvariant.nodeValue = "italic";
      newElement.setAttributeNode(newMathvariant);
    }
    if (currNode) {
      if (CursorPos == 0) {
        newNumNode = parentNode.insertBefore(newElement, currNode);
      } else {
        var NextNode = currNode.nextSibling;
        if (NextNode) {
          newNumNode = parentNode.insertBefore(newElement, NextNode);
        }
        else {
          newNumNode = parentNode.appendChild(newElement);
        }
      }
    } else {
      if (IsMsup(parentNode) || IsMroot((parentNode))) {
        if (IsExpOfPowORIdxOfRoot) newNumNode = parentNode.appendChild(newElement);
        else {
          var lastChild = parentNode.lastChild;
          newNumNode = parentNode.insertBefore(newElement, lastChild);
        }
      } else newNumNode = parentNode.appendChild(newElement);
    }
    if (newNumNode.previousSibling && !IsExpOfPowORIdxOfRoot) {
      var prevNode = newNumNode.previousSibling;
      if (prevNode.tagName == "mn" && !IsImaginarySymbol(newNumNode)) {
        newNumNode = JointMnNodes(prevNode, newNumNode);
      }
    }
    currId = newNumNode.getAttribute("id");
    CursorPos = 1;
  } else {
    var oldNum = currNode.childNodes[0].nodeValue;
    if (searchCharacter(oldNum, ".") != 0 && value == ".") return;
    if (CursorPos != 0) {
      if (oldNum == "0" && value != ".") oldNum = "";
    }
    var newNum;
    if (CursorPos < 1) {
      if (CursorPos == 0) {
        NumDigitLeft = 0;
        NumDigitRight = oldNum.length;
      }
      var firstPart = oldNum.substring(0, NumDigitLeft);
      var secondPart = oldNum.substring(NumDigitLeft, (NumDigitLeft + NumDigitRight));
      newNum = firstPart + value + secondPart;
      NumDigitLeft += value.length;
      if (NumDigitLeft == 0) CursorPos = 0;
      else CursorPos = 0.5;
    } else {
      newNum = oldNum + value;
      CursorPos = 1;
    }
    currNode.childNodes[0].nodeValue = newNum;
  }
  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
}

function JointMnNodes(prevNode, nextNode) {
  var parentNode = prevNode.parentNode;
  var numPrev = prevNode.childNodes[0].nodeValue;
  var numNext = nextNode.childNodes[0].nodeValue;
  var numNew = numPrev + numNext;
  prevNode.childNodes[0].nodeValue = numNew;
  parentNode.removeChild(nextNode);
  NumDigitLeft = numPrev.length;
  NumDigitRight = numNext.length;
  CursorPos = 0.5;
  return prevNode;
}

function CreateMnElement(value) {
  var newElement = expr_xml.createElement("mn");
  var newNum = expr_xml.createTextNode(value);
  var newId = expr_xml.createAttribute("id");
  mn_cont++;
  var IdMn = "mn_" + mn_cont;
  newId.nodeValue = IdMn;
  newElement.appendChild(newNum);
  newElement.setAttributeNode(newId);
  return newElement;
}

function CreateMnNode(value, parentNode, nextNode) {
  var newMnelem = CreateMnElement(value);
  var nodeMn;
  if (nextNode) nodeMn = parentNode.insertBefore(newMnelem, nextNode);
  else nodeMn = parentNode.appendChild(newMnelem);
}

function CreateMfracNode(NumNode, DenNode, parentNode, nextNode) {
  var newMfrac = expr_xml.createElement("mfrac");
  var newIdMfrac = expr_xml.createAttribute("id");
  mfrac_cont++;
  var idMfrac = "mfrac_" + mfrac_cont;
  newIdMfrac.nodeValue = idMfrac;
  newMfrac.setAttributeNode(newIdMfrac);
  var nodeMfrac;
  if (nextNode) nodeMfrac = parentNode.insertBefore(newMfrac, nextNode);
  else nodeMfrac = parentNode.appendChild(newMfrac);
  nodeMfrac.appendChild(NumNode);
  nodeMfrac.appendChild(DenNode);
  return nodeMfrac;
}

function CreateOperatorNode(Oper_text, parentNode, nextNode) {
  var newElement = expr_xml.createElement("mo");
  var newOper = expr_xml.createTextNode(Oper_text);
  var newId = expr_xml.createAttribute("id");
  mo_cont++;
  var idMo = "mo_" + mo_cont;
  newId.nodeValue = idMo;
  newElement.appendChild(newOper);
  newElement.setAttributeNode(newId);
  var nodeMo;
  if (nextNode) nodeMo = parentNode.insertBefore(newElement, nextNode);
  else nodeMo = parentNode.appendChild(newElement);
  return nodeMo;
}

function CreateExternalParenthesisNode(node) {
  var newMfenced = expr_xml.createElement("mfenced");
  mfenced_cont++;
  var newOpen = expr_xml.createAttribute("open");
  newOpen.nodeValue = "(";
  newMfenced.setAttributeNode(newOpen);
  var newClose = expr_xml.createAttribute("close");
  newClose.nodeValue = ")";
  newMfenced.setAttributeNode(newClose);
  var newIdMfenced = expr_xml.createAttribute("id");
  var idMfenced = "mfenced_" + mfenced_cont;
  newIdMfenced.nodeValue = idMfenced;
  newMfenced.setAttributeNode(newIdMfenced);
  var newSeparator = expr_xml.createAttribute("separators");
  newSeparator.nodeValue = "";
  newMfenced.setAttributeNode(newSeparator);

  var parentNode = node.parentNode;
  var internalNode = node.cloneNode(true);
  var node_fenced = parentNode.insertBefore(newMfenced, node);
  node_fenced.appendChild(internalNode);
  parentNode.removeChild(node);
  return newMfenced;
}

function ChangeTextToMnNode(mn_node, newText) {
  mn_node.childNodes[0].nodeValue = newText;
}

function inputOperator(Oper_text) {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  var currNode = null;
  var currTag, parentNode;
  var isMsupOrMrootSon_and_GreyColor_CurrNode = false;
  if (currId != "root") {
    currNode = GetElementById(expr_xml, currId);
    if (!currNode) return;
    parentNode = currNode.parentNode;
    if (IsGreyColorNode(currNode) && IsMsupOrMrootSonNode(currNode)) {
      isMsupOrMrootSon_and_GreyColor_CurrNode = true;
      if (Oper_text == "⋅" || Oper_text == "∧" || Oper_text == "⊗" || Oper_text == ":") {
        parentNode = CreateExternalParenthesisNode(currNode);
      }
    }
    if (!IsThereAnyCorrectNode(parentNode) || isMsupOrMrootSon_and_GreyColor_CurrNode || IsNonErasebleNode(currNode)) {
      if (Oper_text == "+" || Oper_text == "-" || Oper_text == "×") {
        alert("The expression can not start with an operator!!!")
        return;
      }
    }
    currTag = currNode.tagName;
    if (IsGreyColorNode(currNode)) {
      currNode = FindFirstCorrectNode(currId);
      if (currNode) currTag = currNode.tagName;
      else currTag = "";
    }
  } else {
    if (!(Oper_text == "⋅" || Oper_text == "∧" || Oper_text == "⊗" || Oper_text == ":")) {
      alert("The expression can not start with an operator!!!")
      return;
    }
    parentNode = expr_xml.documentElement;
  }

  if (currId == "root" || !IsThereAnyCorrectNode(parentNode) || isMsupOrMrootSon_and_GreyColor_CurrNode || IsNonErasebleNode(currNode)) {
    var argument_a;
    var argument_b;
    switch (Oper_text) {
      case "⋅":
      case "∧":
      case "⊗":
        argument_a = "a";
        argument_b = "b";
        break;
      case ":":
        argument_a = "A";
        argument_b = "B";
        break;
    }

    var newMn1 = expr_xml.createElement("mn");
    var newIdMn1 = expr_xml.createAttribute("id");
    mn_cont++;
    var idMn1 = "mn_" + mn_cont;
    currId = idMn1;
    newIdMn1.nodeValue = idMn1;
    newMn1.setAttributeNode(newIdMn1);
    var newColor = expr_xml.createAttribute("color");
    newColor.nodeValue = "#A4A4A4";
    newMn1.setAttributeNode(newColor);
    var node_mn1 = parentNode.appendChild(newMn1);
    var newMathvariant1 = expr_xml.createAttribute("mathvariant");
    newMathvariant1.nodeValue = "bold";
    newMn1.setAttributeNode(newMathvariant1);
    var newText1 = expr_xml.createTextNode(argument_a);
    var node_text1 = node_mn1.appendChild(newText1);

    var newElement = expr_xml.createElement("mo");
    var newOper = expr_xml.createTextNode(Oper_text);
    var newId = expr_xml.createAttribute("id");
    mo_cont++;
    var MoId = "mo_" + mo_cont;
    newId.nodeValue = MoId;
    newElement.appendChild(newOper);
    newElement.setAttributeNode(newId);
    parentNode.appendChild(newElement);

    var newMn2 = expr_xml.createElement("mn");
    var newIdMn2 = expr_xml.createAttribute("id");
    mn_cont++;
    var idMn2 = "mn_" + mn_cont;
    newIdMn2.nodeValue = idMn2;
    newMn2.setAttributeNode(newIdMn2);
    var newColor = expr_xml.createAttribute("color");
    newColor.nodeValue = "#A4A4A4";
    newMn2.setAttributeNode(newColor);
    var node_mn2 = parentNode.appendChild(newMn2);
    var newMathvariant2 = expr_xml.createAttribute("mathvariant");
    newMathvariant2.nodeValue = "bold";
    newMn2.setAttributeNode(newMathvariant2);
    var newText2 = expr_xml.createTextNode(argument_b);
    var node_text2 = node_mn2.appendChild(newText2);

    CursorPos = 1;
    text_screen = xml_Serial.serializeToString(expr_xml);
    InputChanges();

  } else {
    if (currTag != "mo") {
      var newElement = expr_xml.createElement("mo");
      var newOper = expr_xml.createTextNode(Oper_text);
      var newId = expr_xml.createAttribute("id");
      mo_cont++;
      currId = "mo_" + mo_cont;
      newId.nodeValue = currId;
      newElement.appendChild(newOper);
      newElement.setAttributeNode(newId);
      if (currNode) {
        if (CursorPos == 0) {
          parentNode.insertBefore(newElement, currNode);
        } else {
          if (CursorPos == 1) {
            if (IsMsupOrMrootSonNode(currNode)) {
              var newMfenced = CreateExternalParenthesisNode(currNode);
              newMfenced.appendChild(newElement);
            } else {
              var NextNode = currNode.nextSibling;
              if (NextNode) {
                parentNode.insertBefore(newElement, NextNode);
              }
              else {
                parentNode.appendChild(newElement);
              }
            }

          } else if (CursorPos == 0.5) {
            if (currTag = "mn") {
              var textNum = currNode.childNodes[0].nodeValue;
              var firstPart = textNum.substring(0, NumDigitLeft);
              var secondPart = textNum.substring(NumDigitLeft, (NumDigitLeft + NumDigitRight));
              ChangeTextToMnNode(currNode, secondPart);
              var newMn_elem = CreateMnElement(firstPart);
              var newMnNode = parentNode.insertBefore(newMn_elem, currNode);
              parentNode.insertBefore(newElement, currNode);
            }
          }
        }
      } else parentNode.appendChild(newElement);
      CursorPos = 1;
      text_screen = xml_Serial.serializeToString(expr_xml);
      InputChanges();
    } else {
      alert("Two followed operators are not allowed!!!")
    }
  }
}

function CreateSymbolicArgumentNode(node, argument) {
  var parentNode = node.parentNode;
  var isExponentOrIndex = false;
  if (IsExponentOfPower(node) || IsIndexOfRoot(node)) {
    isExponentOrIndex = true;
  }

  var IsBoldArgument = false;
  if (IsDetArgument(node) || IsEigvArgument(node)) {
    argument = "A";
  } else if (IsParamOfUDF(node)) {
    var param = GiveParamName(node);
    argument = param.Name;
    if (param.Type != "number") IsBoldArgument = true;
  }

  var newMn = expr_xml.createElement("mn");
  var newIdMn = expr_xml.createAttribute("id");
  mn_cont++;
  var idMn = "mn_" + mn_cont;
  newIdMn.nodeValue = idMn;
  newMn.setAttributeNode(newIdMn);
  var newColor = expr_xml.createAttribute("color");
  newColor.nodeValue = "#A4A4A4";
  newMn.setAttributeNode(newColor);
  var newMathvariant = expr_xml.createAttribute("mathvariant");
  if (IsLinSolveArgument(node)) {
    if (parentNode.firstChild == node) {
      argument = "A";
    } else if (parentNode.lastChild == node) {
      argument = "b";
    }
    newMathvariant.nodeValue = "bold";
  } else {
    if (argument == "A" || IsBoldArgument) newMathvariant.nodeValue = "bold";
    else newMathvariant.nodeValue = "italic";
  }
  newMn.setAttributeNode(newMathvariant);
  var node_mn;
  if (parentNode.tagName == "msup" || parentNode.tagName == "mroot") {
    if (isExponentOrIndex) {
      node_mn = parentNode.appendChild(newMn);
    } else {
      lastChild = parentNode.lastChild;
      node_mn = parentNode.insertBefore(newMn, lastChild);
    }
  } else if (IsLinSolveArgument(node)) {
    if (parentNode.firstChild == node) {
      var commaNode = node.nextSibling;
      node_mn = parentNode.insertBefore(newMn, commaNode);
    } else if (parentNode.lastChild == node) {
      node_mn = parentNode.appendChild(newMn);
    }
  } else if (IsParamOfUDF(node)) {
    if (parentNode.lastChild == node) {
      node_mn = parentNode.appendChild(newMn);
    } else {
      var commaNode = node.nextSibling;
      node_mn = parentNode.insertBefore(newMn, commaNode);
    }
  } else {
    node_mn = parentNode.appendChild(newMn);
  }
  var newText = expr_xml.createTextNode(argument);
  if (isExponentOrIndex) newText.nodeValue = "y";
  var node_text = node_mn.appendChild(newText);
  currId = idMn;
}

function Backspace() {
  if (!currId || currId == "root") return;
  var currNode = GetElementById(expr_xml, currId);

  var currTag = "";
  var parentNode;
  if (currNode) {
    currTag = currNode.tagName;
    parentNode = currNode.parentNode;
  } else return;

  if (IsNonErasebleNode(currNode)) {
    return;
  }

  if (currTag != "mn") {
    var colorNode = currNode.getAttribute("color");
    if (colorNode == "#A4A4A4") {
      currId = parentNode.getAttribute("id");
      CursorPos = 1;
    } else {
      if (IsInverseOrTransposeGrandSonNode(currNode)) {
        CreateSymbolicArgumentNode(currNode, "A")
        parentNode.removeChild(currNode);
        CursorPos = 1;
      } else {
        var prevNode = currNode.previousSibling;
        if (prevNode && !IsMsupOrMrootSonNode(currNode)) {
          var prevNodeTag = prevNode.tagName;
          var nextNode = currNode.nextSibling;
          var nextNodeTag = "";
          if (nextNode) nextNodeTag = nextNode.tagName;
          if (prevNodeTag == "mn" && nextNodeTag == "mn" && !IsImaginarySymbol(nextNode)) {
            prevNode = JointMnNodes(prevNode, nextNode); //This function set CursorPos = 0.5
            currId = prevNode.getAttribute("id");
          } else {
            if (IsNecesaryCreateSymbolicArgument(currNode)) {
              CreateSymbolicArgumentNode(currNode, "x");
            } else {
              currId = prevNode.getAttribute("id");
              CursorPos = 1;
            }
          }
          parentNode.removeChild(currNode);
        } else {
          var parentNodeId = parentNode.getAttribute("id");
          if (parentNodeId != "root") {
            var nextNode = currNode.nextSibling;
            if (nextNode && !IsCommaNode(nextNode)) {
              currId = nextNode.getAttribute("id");
              CursorPos = 0;
            } else {
              if (IsNecesaryCreateSymbolicArgument(currNode)) {
                CreateSymbolicArgumentNode(currNode, "x");
              } else {
                currId = parentNode.getAttribute("id");
              }
              CursorPos = 1;
            }
            parentNode.removeChild(currNode);
          } else {
            if (CursorPos == 1) {
              parentNode.removeChild(currNode);
              currId = parentNode.getAttribute("id");
            }
          }
        }
      }
    }
  } else {
    if (IsGreyColorNode(currNode)) {
      if (parentNode.tagName == "mtd" && !IsEexPreviousNode(currNode)) return;
      if (!IsEexPreviousNode(currNode)) {
        if (IsFunctionArgumentNode(currNode) || IsInverseOrTransposeGrandSonNode(currNode)) {
          parentNode = parentNode.parentNode;
          currId = parentNode.getAttribute("id");
        } else {
          var ParentId = parentNode.getAttribute("id");
          if (ParentId != "root") currId = ParentId;
        }
        CursorPos = 1;
        text_screen = xml_Serial.serializeToString(expr_xml);
        InputChanges();
        return;
      }
    }
    var text = currNode.childNodes[0].nodeValue;

    if (CursorPos == 0) {
      if (currNode.previousSibling) {
        var prevNode = currNode.previousSibling;
        currId = prevNode.getAttribute("id");
        CursorPos = 1.0;
        Backspace();
      } else {
        currId = parentNode.getAttribute("id");
        CursorPos = 1.0;
      }
    } else if (CursorPos == 0.5) {
      var rightPart = text.substring(NumDigitLeft, (NumDigitLeft + NumDigitRight));
      NumDigitLeft--;
      var leftPart = text.substring(0, NumDigitLeft);
      text = leftPart + rightPart;
      if (NumDigitLeft == 0) {
        if (currNode.previousSibling) {
          var prevNode = currNode.previousSibling;
          currId = prevNode.getAttribute("id");
          CursorPos = 1.0;
        } else {
          CursorPos = 0;
        }
      } else CursorPos = 0.5;
    } else if (CursorPos == 1) {
      text = text.substr(0, text.length - 1);
      if (searchCharacter(text, "e") != 0) {
        var lastChar = text.substr(text.length - 1, text.length - 1);
        if (lastChar == "e") text = text.substr(0, text.length - 1);
        var TwolastChars = text.substr(text.length - 2, text.length - 1);
        if (TwolastChars == "e-") text = text.substr(0, text.length - 2);
      }
      CursorPos = 1;
    }

    if (text.length == 0) {
      var prevNode = currNode.previousSibling;
      if (IsExponentOfPower(currNode) || IsIndexOfRoot(currNode)) {
        prevNode = null;
      }
      var parentTag = parentNode.tagName;
      if (parentTag == "mtd" && !IsEexPreviousNode(currNode)) {
        currNode.childNodes[0].nodeValue = "0";
      } else {
        if (prevNode && !IsCommaNode(prevNode)) {
          currId = prevNode.getAttribute("id");
        } else {
          var parentNodeId = parentNode.getAttribute("id");
          if (IsNecesaryCreateSymbolicArgument(currNode)) {
            CreateSymbolicArgumentNode(currNode, "x");
          }
          else {
            var nextNode = currNode.nextSibling;
            if (nextNode) {
              currId = nextNode.getAttribute("id");
              CursorPos = 0;

            } else currId = parentNodeId;
          }
        }
        if (IsGreyColorNode(currNode) && IsEexPreviousNode(currNode)) {
          var prevNodeText = prevNode.childNodes[0].nodeValue;
          prevNode.childNodes[0].nodeValue = prevNodeText.substr(0, (prevNodeText.length - 1));
        }
        parentNode.removeChild(currNode);
      }
    } else {
      currNode.childNodes[0].nodeValue = text;
    }
  }
  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
}

function Supr() {
  if (!currId || currId == "root") return;
  var currNode = GetElementById(expr_xml, currId);
  if (!currNode) return;
  if (CursorPos == 1) {
    currNode = currNode.nextSibling;
    if (currNode) CursorPos = 0;
  }
  var currTag = "";
  if (currNode) {
    if (IsCommaNode(currNode)) {
      currNode = currNode.previousSibling;
    }
    currTag = currNode.tagName;
  } else return;
  var parentNode = currNode.parentNode;


  var prevNode = null;

  if (currTag != "mn") {
    var colorNode = currNode.getAttribute("color");
    if (colorNode == "#A4A4A4") {
      currId = parentNode.getAttribute("id");
      CursorPos = 0;
    } else {
      var nextNode = currNode.nextSibling;
      if (nextNode && !IsMsupOrMrootSonNode(currNode) && !IsCommaNode(nextNode)) {
        var nextNodeTag = nextNode.tagName;
        prevNode = currNode.previousSibling;
        var prevNodeTag = "";
        if (prevNode) prevNodeTag = prevNode.tagName;
        if (prevNodeTag == "mn" && nextNodeTag == "mn" && !IsImaginarySymbol(nextNode)) {
          prevNode = JointMnNodes(prevNode, nextNode); //This function set CursorPos = 0.5
          currId = prevNode.getAttribute("id");
        } else {
          CursorPos = 0;
          currId = nextNode.getAttribute("id");
        }

      } else {
        var parentNodeId = parentNode.getAttribute("id");
        if (IsNecesaryCreateSymbolicArgument(currNode)) {
          CreateSymbolicArgumentNode(currNode, "x");
          CursorPos = 0;
        } else {
          prevNode = currNode.previousSibling;
          if (prevNode) {
            CursorPos = 1;
            currId = prevNode.getAttribute("id");
          } else {
            CursorPos = 0;
            currId = parentNodeId;
          }
        }
      }
      parentNode.removeChild(currNode);
    }
  } else {
    if (IsGreyColorNode(currNode)) {
      if (IsFunctionArgumentNode(currNode)) {
        parentNode = parentNode.parentNode;
      }
      currId = parentNode.getAttribute("id");
      CursorPos = 0;
    } else {
      var text = currNode.childNodes[0].nodeValue;
      if (CursorPos == 0) {
        text = text.substr(1, text.length);
        if (currNode.previousSibling) CursorPos = 1;
        else CursorPos = 0;
      } else if (CursorPos == 0.5) {
        var leftPart = text.substring(0, NumDigitLeft);
        var rightPart = text.substring((NumDigitLeft + 1), (NumDigitLeft + NumDigitRight));
        NumDigitRight--;
        if (text.substring(NumDigitLeft, (NumDigitLeft + 1)) == "e") {
          rightPart = "";
          NumDigitRight = 0;
        }
        text = leftPart + rightPart;
        if (NumDigitRight == 0) {
          if (currNode.nextSibling) {
            var nextNode = currNode.nextSibling;
            currId = nextNode.getAttribute("id");
            CursorPos = 0;
          } else {
            CursorPos = 1;
          }
        } else CursorPos = 0.5;
      }

      if (text.length == 0) {
        var nextNode = currNode.nextSibling;
        var parentTag = parentNode.tagName;
        if (parentTag == "mtd") {
          currNode.childNodes[0].nodeValue = "0";
          CursorPos = 0;
        } else {
          if (nextNode && !IsCommaNode(nextNode)) {
            currId = nextNode.getAttribute("id");
            CursorPos = 0;
          } else {
            var parentNodeId = parentNode.getAttribute("id");
            if (IsNecesaryCreateSymbolicArgument(currNode)) {
              CreateSymbolicArgumentNode(currNode, "x");
              CursorPos = 0;
            } else {
              prevNode = currNode.previousSibling;
              CursorPos = 1;
              currId = prevNode.getAttribute("id");
            }
          }
          parentNode.removeChild(currNode);
        }
      } else {
        currNode.childNodes[0].nodeValue = text;
      }
    }
  }
  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
}

function Matrix() {
  if (currId != "root") {
    var currNode = GetElementById(expr_xml, currId);
    if (!currNode) return;
    var parentNode = currNode.parentNode;
    var parentNode_Tag = parentNode.tagName;
    if (parentNode_Tag == "mtd") {
      alert("A matrix into other other matrix is not allowed!!!");
      return;
    }
  }

  ActiveBody("#bodyMatrix");
}


function MatrixTypeFun(value) {
  var NumRowsOpt = document.getElementById("NumRows");
  var NumColsOpt = document.getElementById("NumCols");
  if (value == "Rectangular") {
    $("#NumRowsP").show();
    $("#NumColsP").show();
    $("#AutoFillingP").show();
  } else if (value == "Square") {
    $("#NumRowsP").show();
    var NumRows = NumRowsOpt.value;
    $("#NumColsP").hide();
    NumColsOpt.value = NumRows;
    $("#AutoFillingP").show();
  } else if (value == "Vector") {
    $("#NumRowsP").show();
    $("#NumColsP").hide();
    NumColsOpt.value = 1;
    $("#AutoFillingP").show();
  } else if (value == "Row vector") {
    $("#NumRowsP").hide();
    NumRowsOpt.value = 1;
    $("#NumColsP").show();
    $("#AutoFillingP").show();
  } else if (value == "Identity matrix") {
    $("#NumRowsP").show();
    var NumRows = NumRowsOpt.value;
    $("#NumColsP").hide();
    NumColsOpt.value = NumRows;
    $("#AutoFillingP").hide();
  }
}

function RowsChangeFun(value) {
  var MatrixType = document.getElementById("matrix_type").value;
  if (MatrixType == "Identity matrix" || MatrixType == "Square") {
    var NumColsOpt = document.getElementById("NumCols");
    NumColsOpt.value = value;
  }
}

function AcceptMatrix() {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  var Mat_rows = window.document.getElementById("NumRows").value;
  var Mat_cols = window.document.getElementById("NumCols").value;
  var MatrixType = window.document.getElementById("matrix_type").value;
  var AutoFilling = window.document.getElementById("AutoFilling").value;

  var Mat_name = "A";
  if (Mat_rows == 1 || Mat_cols == 1) Mat_name = Mat_name.toLowerCase();
  matrix_cont++;
  matrix_list[matrix_cont - 1] = new Array(3);
  matrix_list[matrix_cont - 1][0] = Mat_rows;
  matrix_list[matrix_cont - 1][1] = Mat_cols;
  matrix_list[matrix_cont - 1][2] = Mat_name;

  var IsExpOfPowORIdxOfRoot = false;

  $("#bodyCalculator").show();
  $("#bodyMatrix").hide();

  var currNode = null;
  var parentNode;
  var currTag = "";
  if (currId != "root") {
    currNode = GetElementById(expr_xml, currId);
    parentNode = currNode.parentNode;
    if (IsExponentOfPower(currNode) || IsIndexOfRoot(currNode)) {
      IsExpOfPowORIdxOfRoot = true;
    }
    currNode = FindFirstCorrectNode(currId);
  } else {
    parentNode = expr_xml.documentElement;
  }

  var newMfenced = expr_xml.createElement("mfenced");
  var newOpen = expr_xml.createAttribute("open");
  newOpen.nodeValue = "[";
  newMfenced.setAttributeNode(newOpen);
  var newClose = expr_xml.createAttribute("close");
  newClose.nodeValue = "]";
  newMfenced.setAttributeNode(newClose);
  var newIdMfenced = expr_xml.createAttribute("id");
  mfenced_cont++;
  var idMfenced = "mfenced_" + mfenced_cont;
  newIdMfenced.nodeValue = idMfenced;
  newMfenced.setAttributeNode(newIdMfenced);
  matrix_list[matrix_cont - 1][3] = idMfenced;

  var node_fenced;
  if (currNode) {
    if (CursorPos == 0) {
      node_fenced = parentNode.insertBefore(newMfenced, currNode);
    } else {
      if (CursorPos == 1) {
        var NextNode = currNode.nextSibling;
        if (NextNode) {
          node_fenced = parentNode.insertBefore(newMfenced, NextNode);
        }
        else {
          node_fenced = parentNode.appendChild(newMfenced);
        }
      } else if (CursorPos == 0.5) {
        if (currTag = "mn") {
          var textNum = currNode.childNodes[0].nodeValue;
          var firstPart = textNum.substring(0, NumDigitLeft);
          var secondPart = textNum.substring(NumDigitLeft, (NumDigitLeft + NumDigitRight));
          ChangeTextToMnNode(currNode, secondPart);
          var newMn_elem = CreateMnElement(firstPart);
          var newMnNode = parentNode.insertBefore(newMn_elem, currNode);
          node_fenced = parentNode.insertBefore(newMfenced, currNode);
        }
      }
    }
  } else {
    if (IsMsup(parentNode) || IsMroot((parentNode))) {
      if (IsExpOfPowORIdxOfRoot) node_fenced = parentNode.appendChild(newMfenced);
      else {
        var lastChild = parentNode.lastChild;
        node_fenced = parentNode.insertBefore(newMfenced, lastChild);
      }
    } else node_fenced = parentNode.appendChild(newMfenced);
  }

  if (currTag == "mn") {
    var Num = parseFloat(currNode.childNodes[0].nodeValue);
    if (Num == 0) {
      parentNode.removeChild(currNode);
      currTag = "";
    }
  }

  var newTable = expr_xml.createElement("mtable");
  var newIdMtable = expr_xml.createAttribute("id");
  mtable_cont++;
  var idMtable = "mtable_" + mtable_cont;
  newIdMtable.nodeValue = idMtable;
  newTable.setAttributeNode(newIdMtable);
  var node_table = node_fenced.appendChild(newTable);

  for (var irow = 1; irow <= Mat_rows; irow++) {
    var newMtr = expr_xml.createElement("mtr");
    var newIdMtr = expr_xml.createAttribute("id");
    var node_mtr = node_table.appendChild(newMtr);
    for (var icol = 1; icol <= Mat_cols; icol++) {
      var newMtd = expr_xml.createElement("mtd");
      var newColumnAlign = expr_xml.createAttribute("columnalign");
      newColumnAlign.nodeValue = "right";
      newMtd.setAttributeNode(newColumnAlign);
      var node_mtd = node_mtr.appendChild(newMtd);

      var newMn1 = expr_xml.createElement("mn");
      var newIdMn_1 = expr_xml.createAttribute("id");
      mn_cont++;
      var idMn_1 = "mn_" + mn_cont;
      newIdMn_1.nodeValue = idMn_1;
      newMn1.setAttributeNode(newIdMn_1);

      if (AutoFilling == "None" && MatrixType != "Identity matrix") {
        var newColor_1 = expr_xml.createAttribute("color");
        newColor_1.nodeValue = "#A4A4A4";
        newMn1.setAttributeNode(newColor_1);
        var node_mn1 = node_mtd.appendChild(newMn1);
        var newText1 = expr_xml.createTextNode(Mat_name);
        var node_text1 = node_mn1.appendChild(newText1);

        var newMn2 = expr_xml.createElement("mn");
        var newIdMn_2 = expr_xml.createAttribute("id");
        mn_cont++;
        var idMn_2 = "mn_" + mn_cont;
        newIdMn_2.nodeValue = idMn_2;
        newMn2.setAttributeNode(newIdMn_2);
        var newColor_2 = expr_xml.createAttribute("color");
        newColor_2.nodeValue = "#A4A4A4";
        newMn2.setAttributeNode(newColor_2);
        var newMathsize = expr_xml.createAttribute("mathsize");
        newMathsize.nodeValue = "0.7";
        newMn2.setAttributeNode(newMathsize);
        var node_mn2 = node_mtd.appendChild(newMn2);
        var text2;
        if (Mat_cols == 1 && Mat_rows > 1) {
          text2 = irow;
        } else if (Mat_cols > 1 && Mat_rows == 1) {
          text2 = icol;
        } else {
          text2 = irow + "," + icol;
        }
        var newText2 = expr_xml.createTextNode(text2);
        var node_text2 = node_mn2.appendChild(newText2);

        if (irow == 1 && icol == 1) {
          currId = idMn_2;
          CursorPos = 1;
        }
      } else {
        var node_mn1 = node_mtd.appendChild(newMn1);
        var value_text;
        if (MatrixType == "Identity matrix") {
          if (irow == icol) value_text = "1";
          else value_text = "0";
        } else {
          if (AutoFilling == "Zero filling") value_text = "0";
          else if (AutoFilling == "Ones filling") value_text = "1";
          else if (AutoFilling == "Consecutive filling") {
            value_text = ((irow - 1) * Mat_cols + icol).toString();
          }
        }
        var newText1 = expr_xml.createTextNode(value_text);
        var node_text1 = node_mn1.appendChild(newText1);
        if (irow == 1 && icol == 1) {
          currId = idMn_1;
          CursorPos = 1;
        }
      }
    }
  }

  Matrix_cont++;
  text_screen = xml_Serial.serializeToString(expr_xml);
  DefineRowsHeight();
  InputChanges();
}

function CancelMatrix() {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  $("#bodyCalculator").show();
  $("#bodyMatrix").hide();
  DefineRowsHeight();
  Preview.UpdateCursorPosition();
}


function IsVisibleNode(node) {
  if (!node) return false;
  var is_visible = true;
  var tag = node.tagName;
  if (tag == "mfrac" || tag == "msup" || tag == "msqrt" || tag == "mroot") is_visible = false;
  if (tag == "mfenced") {
    if (node.getAttribute("open") == "" && node.getAttribute("close") == "") {
      is_visible = false;
    }
  }
  return is_visible;
}

function IsMfrac(node) {
  if (!node) return false;
  var is_mfrac = false;
  var tag = node.tagName;
  if (tag == "mfrac") is_mfrac = true;
  return is_mfrac;
}

function IsNumeratorOfMfrac(node) {
  if (!node) return false;
  var is_NumeratorOfMfrac = false;
  var grandfatherNode = node.parentNode.parentNode;
  if (IsMfrac(grandfatherNode)) {
    var firstGrandChild = grandfatherNode.firstChild.firstChild;
    if (node == firstGrandChild) is_NumeratorOfMfrac = true;
  }
  return is_NumeratorOfMfrac;
}

function IsNumOrDenOfMfrac(node) {
  if (!node) return false;
  var is_NumOrDenOfMfrac = false;
  var parentNode = node.parentNode;
  if (IsMfrac(parentNode)) {
    is_NumOrDenOfMfrac = true;
  }
  return is_NumOrDenOfMfrac;
}

function IsMsqrt(node) {
  if (!node) return false;
  var is_msqrt = false;
  var tag = node.tagName;
  if (tag == "msqrt") is_msqrt = true;
  return is_msqrt;
}

function IsMroot(node) {
  if (!node) return false;
  var is_mroot = false;
  var tag = node.tagName;
  if (tag == "mroot") is_mroot = true;
  return is_mroot;
}

function IsMsup(node) {
  if (!node) return false;
  var is_msup = false;
  var tag = node.tagName;
  if (tag == "msup") is_msup = true;
  return is_msup;
}

function IsMsupOrMrootSonNode(node) {
  if (!node) return false;
  is_MsupOrMrootSonNode = false;
  var parentNode = node.parentNode;
  if (IsMroot(parentNode) || IsMsup(parentNode)) is_MsupOrMrootSonNode = true;
  return is_MsupOrMrootSonNode;
}

function IsMsupOrMrootOrMsqrtSonNode(node) {
  if (!node) return false;
  is_MsupOrMrootOrMsqrtSonNode = false;
  var parentNode = node.parentNode;
  if (IsMroot(parentNode) || IsMsup(parentNode) || IsMsqrt(parentNode)) is_MsupOrMrootOrMsqrtSonNode = true;
  return is_MsupOrMrootOrMsqrtSonNode;
}

function IsEditableNode(node) {
  if (!node) return false;
  var tagName = node.tagName;
  is_editable = true;
  if (tagName == "mi") is_editable = false;
  return is_editable;
}

function IsMiLibFunNode(node) {
  if (!node) return false;
  var is_MiLibFunNode = false;
  var tagName = node.tagName;
  if (tagName != "mi") is_MiLibFunNode = false;
  else {
    MiType = node.getAttribute("type");
    if (MiType == "lib") is_MiLibFunNode = true;
  }
  return is_MiLibFunNode;
}


function IsGreyColorNode(node) {
  if (!node) return false;
  var is_grey_color = false;
  var colorNode = node.getAttribute("color");
  if (colorNode == "#A4A4A4") {
    is_grey_color = true;
  }
  return is_grey_color;
}

function IsThereGreyColorNodes(parentNode) {
  var is_ThereGreyColorNodes =false;
  var node_list = parentNode.childNodes;
  for (var inode = 0; inode < node_list.length; inode++) {
    if (node_list[inode].getAttribute("color") == "#A4A4A4") {
      is_ThereGreyColorNodes=true;
      break;
    }
  }
  return is_ThereGreyColorNodes;
}

function IsEexPreviousNode(node) {
  if (!node) return false;
  var is_EexPreviousNode = false;
  var prevNode = node.previousSibling;
  if (prevNode) {
    if (prevNode.tagName == "mn") {
      var prevNodeText = prevNode.childNodes[0].nodeValue;
      var PosEex = searchCharacter(prevNodeText, "e");
      if (PosEex != 0) is_EexPreviousNode = true;
    }
  }
  return is_EexPreviousNode;
}

function IsTextNodeChild(node) {
  if (!node) return false;
  var isTextNode = false;
  var nodeName = node.lastChild.nodeName;
  if (nodeName == "#text") isTextNode = true;
  return isTextNode;
}

function IsVisibleParenthesisNode(node) {
  if (!node) return false;
  var is_ParenthesisNode = false;
  var tag = node.tagName;
  if (tag == "mfenced") {
    if (node.getAttribute("open") != "" && node.getAttribute("close") != "") {
      is_ParenthesisNode = true;
    }
  }
  return is_ParenthesisNode;
}

function IsNonVisibleParenthesisNode(node) {
  if (!node) return false;
  var is_ParenthesisNode = false;
  var tag = node.tagName;
  if (tag == "mfenced") {
    if (node.getAttribute("open") == "" && node.getAttribute("close") == "") {
      is_ParenthesisNode = true;
    }
  }
  return is_ParenthesisNode;
}

function IsNonErasebleNode(node) {
  if (!node) return false;
  var is_NonErasebleNode = false;
  var type = node.getAttribute("type");
  if (type == "non_erasable") {
    is_NonErasebleNode = true;
  }
  return is_NonErasebleNode;
}

function IsNodeWithId(node) {
  if (!node) return false;
  node_id = node.getAttribute("id");
  var is_NodeWithId = true;
  if (!node_id) is_NodeWithId = false;
  return is_NodeWithId;
}


function IsParenthesisNode(node) {
  if (!node) return false;
  var is_ParenthesisNode = false;
  var tag = node.tagName;
  if (tag == "mfenced") {
    var nodeChild = node.firstChild;
    is_ParenthesisNode = true;
  }
  return is_ParenthesisNode;
}

function IsTableNode(node) {
  if (!node) return false;
  var is_TableNode = false;
  var tag = node.tagName;
  if (tag == "mtr" || tag == "mtd" || tag == "mtable") {
    is_TableNode = true;
  }
  return is_TableNode;
}

function InteriorNodeTagName(node) {
  if (!node) return false;
  var tagNameChild = "";
  if (!IsTextNodeChild(node)) {
    if (IsNonVisibleParenthesisNode(node)) {
      var childNode = node.lastChild;
      tagNameChild = childNode.tagName;
    }
  }
  return tagNameChild;
}


function IsMsupGrandSonNode(node) {
  if (!node) return false;
  var isMsupGrandSon = false;
  var grandfatherNode = node.parentNode.parentNode;
  if (grandfatherNode.tagName == "msup") isMsupGrandSon = true;
  return isMsupGrandSon;
}


//This function is used in the case of A^(-1) or A^(t)
function IsInverseOrTransposeGrandSonNode(node) {
  if (!node) return false;
  var is_InverseOrTransposeGrandSonNode = false;
  var grandfatherNode = node.parentNode.parentNode;
  if (grandfatherNode.tagName == "msup") {
    var Exponent = grandfatherNode.lastChild;
    var value = Exponent.childNodes[0].nodeValue;
    if (value == "T" || value == "-1") is_InverseOrTransposeGrandSonNode = true;
  }
  return is_InverseOrTransposeGrandSonNode;
}


function IsTwoArgumentsFunction(node) {
  if (!node) return false;
  var prevNode = node.previousSibling
  var isTwoArguments = false;
  if (prevNode) {
    if (prevNode.tagName == "mi" && prevNode.childNodes[0].nodeValue == ",") {
      isTwoArguments = true;
    }
  }
  return isTwoArguments;
}

function IsFunctionArgumentNode(node) {
  if (!node) return false;
  var is_FunctionArgumentNode = false;
  var grandFather = node.parentNode.parentNode;
  var firstChild = grandFather.firstChild;
  //if (firstChild.tagName == "mi") is_FunctionArgumentNode = true;
  if (IsMiLibFunNode(firstChild) || IsUDFMiNode(firstChild)) is_FunctionArgumentNode = true;
  return is_FunctionArgumentNode;
}

function IsFunctionParenthesisNode(node) {
  if (!node) return false;
  var is_FunctionParenthesisNode = false;
  var nodeTag = node.tagName;
  if (nodeTag == "mfenced") {
    var prevNode = node.previousSibling;
    if (prevNode) {
      if (prevNode.tagName == "mi" && IsMiLibFunNode(prevNode)) is_FunctionParenthesisNode = true;
    }
  }
  return is_FunctionParenthesisNode;
}

function IsCommaNode(node) {
  if (!node) return false;
  var isCommaNode = false;
  if (node) {
    if (node.tagName == "mi" && node.childNodes[0].nodeValue == ",") {
      isCommaNode = true;
    }
  }
  return isCommaNode;
}

function IsExponentOfPower(node) {
  if (!node) return false;
  var is_ExponentOfPower = false;
  var parentNode = node.parentNode;
  var tag = parentNode.tagName;
  if (tag == "msup") {
    var lastChild = parentNode.lastChild;
    if (lastChild.getAttribute("id")) {
      if (node == lastChild) is_ExponentOfPower = true;
    }
  }
  return is_ExponentOfPower;
}

function IsIndexOfRoot(node) {
  if (!node) return false;
  var is_IndexOfRoot = false;
  var parentNode = node.parentNode;
  var tag = parentNode.tagName;
  if (tag == "mroot") {
    var lastChild = parentNode.lastChild;
    if (lastChild.getAttribute("id")) {
      if (node == lastChild) is_IndexOfRoot = true;
    }
  }
  return is_IndexOfRoot;
}

function IsLinSolveArgument(node) {
  if (!node) return false;
  var is_LinSolveArgument = false;
  var grandFather = node.parentNode.parentNode;
  var firstChild = grandFather.firstChild;
  if (firstChild.tagName == "mi" && firstChild.childNodes[0].nodeValue == "LinSolve") {
    is_LinSolveArgument = true;
  }
  return is_LinSolveArgument;
}

function IsArgumentOfFunction(node) {
  if (!node) return false;
  var is_ArgumentOfFunction = false;
  var grandFather = node.parentNode.parentNode;
  var firstChild = grandFather.firstChild;
  if (firstChild.tagName == "mi") {
    is_ArgumentOfFunction = true;
  }
  return is_ArgumentOfFunction;
}

function IsDetArgument(node) {
  if (!node) return false;
  var is_DetArgument = false;
  var grandFather = node.parentNode.parentNode;
  var firstChild = grandFather.firstChild;
  if (firstChild.tagName == "mi" && firstChild.childNodes[0].nodeValue == "det") {
    is_DetArgument = true;
  }
  return is_DetArgument;
}

function IsEigvArgument(node) {
  if (!node) return false;
  var is_EigvArgument = false;
  var grandFather = node.parentNode.parentNode;
  var firstChild = grandFather.firstChild;
  if (firstChild.tagName == "mi" && firstChild.childNodes[0].nodeValue == "Eigv") {
    is_EigvArgument = true;
  }
  return is_EigvArgument;
}

function IsNecesaryCreateSymbolicArgument(node) {
  if (!node) return false;
  var isNecesaryCreateSymbolicArgument = false;
  var parentNode = node.parentNode;
  var parentNodeId = parentNode.getAttribute("id");
  if (parentNodeId != "root") {
    if (parentNode.childNodes.length == 1) isNecesaryCreateSymbolicArgument = true;
    if (parentNode.tagName == "msup") isNecesaryCreateSymbolicArgument = true;
    if (parentNode.tagName == "mroot") isNecesaryCreateSymbolicArgument = true;
    if (IsLinSolveArgument(node)) isNecesaryCreateSymbolicArgument = true;
    if (IsParamOfUDF(node)) isNecesaryCreateSymbolicArgument = true;
  }
  return isNecesaryCreateSymbolicArgument;
}

function IsParamOfUDF(node) {
  if (!node) return false;
  var isParamOfUDF = false;
  var parentNode = node.parentNode;
  var prevNode = parentNode.previousSibling;
  if (prevNode) {
    if (IsUDFMiNode(prevNode)) isParamOfUDF = true;
  }
  return isParamOfUDF;
}

function GiveParamName(node) {
  var param = {};
  param.Name = "x";
  param.Type = "number";
  var parentNode = node.parentNode;
  var prevNode = parentNode.previousSibling;
  if (IsUDFMiNode(prevNode)) {
    var fun_Name = prevNode.childNodes[0].nodeValue;
    var ifun = userDefFunLabel_list.indexOf(fun_Name);
    var childNodes = parentNode.childNodes;
    var iparam;
    for (var i = 0; i < childNodes.length; i++) {
      if (childNodes[i] === node) {
        iparam = i / 2;
        break;
      }
    }
    param.Name = userDefFunParamNames[ifun][iparam];
    param.Type = userDefFunParamType_list[ifun][iparam];
  }
  return param;
}

function FindPreviousNode(node, Cursor_Pos) {
  if (!node) return;
  var prevNode = node;
  var prevNode_old = node;

  if (Cursor_Pos == 0) {
    if (IsTableNode(prevNode.parentNode)) {
      prevNode = prevNode.parentNode; //Tag mtd
      if (prevNode.previousSibling) {
        prevNode = prevNode.previousSibling; //previous mtd
        prevNode = prevNode.lastChild;       //child of mtd
        CursorPos = 1;
      } else { //It is neccesarry to lift to mtr
        prevNode = prevNode.parentNode;      //Tag mtr
        if (prevNode.previousSibling) {
          prevNode = prevNode.previousSibling; //previous mtr
          prevNode = prevNode.lastChild;       //mtd= child of mtr
          prevNode = prevNode.lastChild;       //mn= child of mtd
          CursorPos = 1;
        } else { //last mtr
          prevNode = prevNode.parentNode; //Tag mtable
        }
      }
    }
    var isValidPreviousNode = false;
    if (IsVisibleParenthesisNode(prevNode.parentNode)) {
      if (IsTwoArgumentsFunction(prevNode)) {
        var comaNode = prevNode.previousSibling;
        prevNode = comaNode.previousSibling;
        CursorPos = 1;
      } else {
        prevNode = prevNode.parentNode;
        if (IsMsupGrandSonNode(prevNode)) {
          prevNode = prevNode.parentNode.parentNode;
        }

        if (prevNode.previousSibling) {
          prevNode = prevNode.previousSibling;
          if (!IsEditableNode(prevNode)) {
            if (IsNonVisibleParenthesisNode(prevNode.parentNode)) {
              prevNode = prevNode.parentNode;
            }
            if (prevNode.previousSibling && !IsNonErasebleNode(prevNode.previousSibling)) {
              prevNode = prevNode.previousSibling
              CursorPos = 1;
            } else CursorPos = 0;
          } else {
            if (IsNonVisibleParenthesisNode(prevNode)) {
              prevNode = prevNode.lastChild;
              while (IsNonVisibleParenthesisNode(prevNode) && !IsTextNodeChild(prevNode)) {
                prevNode = prevNode.lastChild;
              }
            }
            CursorPos = 1;
          }
        } else {
          CursorPos = 0;
          isValidPreviousNode = true;
        }
      }
    } else if (IsNonVisibleParenthesisNode(prevNode.parentNode)) {
      prevNode = prevNode.parentNode;
      if (IsNonVisibleParenthesisNode(prevNode)) {
        var continuar = true;
        while (continuar) {
          if (prevNode.previousSibling) {
            prevNode = prevNode.previousSibling
            if (!IsTextNodeChild(prevNode)) {
              prevNode = prevNode.lastChild;
            }
            continuar = false;
            CursorPos = 1;
          } else {
            if (prevNode.parentNode.getAttribute("id") != "root") {
              prevNode = prevNode.parentNode;
              if (!(IsNonVisibleParenthesisNode(prevNode) || IsMfrac(prevNode) || IsMsup(prevNode))) {
                isValidPreviousNode = true;
                continuar = false;
              }
            } else {
              continuar = false;
              CursorPos = 0;
            }

          }
        }
      }
    }
    if (!isValidPreviousNode && (IsMsqrt(prevNode.parentNode) || IsMsup(prevNode.parentNode) || IsMroot(prevNode.parentNode))) {
      if (IsExponentOfPower(prevNode) || IsIndexOfRoot(prevNode)) {
        prevNode = prevNode.previousSibling;
        if (!prevNode) { //This is the base
          prevNode = node.parentNode;
          prevNode = prevNode.previousSibling;
          if (!prevNode) {
            prevNode = node.parentNode.parentNode;
            CursorPos = 0;
          } else CursorPos = 1;
        } else CursorPos = 1;
      } else {
        prevNode = prevNode.parentNode;
        if (prevNode.previousSibling) {
          prevNode = prevNode.previousSibling;
          CursorPos = 1;
        } else {
          CursorPos = 0;
        }
      }
    }
  } else if (Cursor_Pos == 1) {
    var prevNodeHasChilds = prevNode.hasChildNodes();
    //if (!IsParenthesisNode(prevNode)) prevNodeHasChilds = false;
    if (prevNodeHasChilds && !IsTextNodeChild(prevNode) && !IsNonErasebleNode(prevNode)) {
      if (!IsVisibleNode(prevNode)) {
        if (IsMfrac(prevNode)) {
          while (!IsVisibleNode(prevNode) && !IsTextNodeChild(prevNode)) {
            prevNode = prevNode.lastChild;
          }
          CursorPos = 1;
        } else if (IsMsqrt(prevNode)) {
          prevNode = prevNode.lastChild;
          CursorPos = 1;
        } else if (IsMsup(prevNode) || IsMroot(prevNode)) {
          prevNode = prevNode.lastChild;
          if (prevNode.getAttribute("id")) {
            CursorPos = 1;
          } else {
            prevNode = prevNode.previousSibling;
            if (!IsTextNodeChild(prevNode)) prevNode = prevNode.lastChild;
            CursorPos = 1;
          }
        } else {
          while (IsNonVisibleParenthesisNode(prevNode) && !IsTextNodeChild(prevNode)) {
            prevNode = prevNode.lastChild;
          }
          if (IsVisibleParenthesisNode(prevNode)) {
            prevNode = prevNode.lastChild;
            CursorPos = 1;
          } else {
            if (!prevNode.previousSibling) {
              CursorPos = 0;
            }
          }
        }

      } else {
        if (IsParenthesisNode(prevNode)) {
          prevNode = prevNode.lastChild;
        }
        while (IsTableNode(prevNode)) {
          prevNode = prevNode.lastChild;
        }
        CursorPos = 1;
      }
    } else {
      prevNode = prevNode.previousSibling;
      if (!prevNode || IsNonErasebleNode(prevNode)) {
        prevNode = node;
        if (IsNonErasebleNode(prevNode)) CursorPos = 1;
        else CursorPos = 0;
      } else {
        var nextNode = prevNode.nextSibling;
        if (IsCommaNode(prevNode) || IsExponentOfPower(nextNode) || IsIndexOfRoot(nextNode)) {
          prevNode = node;
          CursorPos = 0;
        } else CursorPos = 1;
      }
    }
  }

  return prevNode;
}

function LeftArrow() {
  isScreenMode = true;
  if (!currId || currId == "root") return;
  var currNode = GetElementById(expr_xml, currId);
  var parentNode, prevNode;
  parentNode = currNode.parentNode;

  var currtag = currNode.tagName;
  if (currtag == "mn") {
    if (InteriorNodeTagName(currNode) == "mn") {
      currNode = currNode.lastChild;
    }
    NumText = currNode.childNodes[0].nodeValue;
    if (NumText.length > 1) {
      prevNode = currNode;
      isDecimalPoint = searchCharacter(NumText, ".");
      if (CursorPos == 1) {
        NumDigitLeft = NumText.length - 1;
        NumDigitRight = 1;
        CursorPos = 0.5;
        var colorNode = currNode.getAttribute("color");
        var Cursor_Pos = CursorPos;
        if (colorNode == "#A4A4A4") {
          Cursor_Pos = 0;
          prevNode = FindPreviousNode(currNode, Cursor_Pos);
        }

      } else if (CursorPos == 0.5) {
        NumDigitLeft--;
        NumDigitRight++;
        if (NumDigitLeft == 0) {
          CursorPos = 1;
          prevNode = FindPreviousNode(currNode, CursorPos);
        }
      } else if (CursorPos == 0) {
        var Cursor_Pos = CursorPos;
        prevNode = FindPreviousNode(currNode, Cursor_Pos);
      }
    } else {
      var colorNode = currNode.getAttribute("color");
      var Cursor_Pos = CursorPos;
      if (colorNode == "#A4A4A4") Cursor_Pos = 0;
      else {
        NumDigitLeft = 0;
        NumDigitRight = 1;
      }
      prevNode = FindPreviousNode(currNode, Cursor_Pos);
    }
  } else {
    prevNode = FindPreviousNode(currNode, CursorPos);
  }

  currId = prevNode.getAttribute("id");
  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
}

function RightArrow() {
  isScreenMode = true;
  if (!currId || currId == "root") return;
  var currNode = GetElementById(expr_xml, currId);
  var parentNode, nextNode;
  var Cursor_Pos;
  parentNode = currNode.parentNode;

  var currtag = currNode.tagName;
  if (currtag == "mn") {
    NumText = currNode.childNodes[0].nodeValue;
    if (NumText.length > 1) {
      nextNode = currNode;
      isDecimalPoint = searchCharacter(NumText, ".");
      if (CursorPos == 1) {
        Cursor_Pos = CursorPos;
        nextNode = FindNextNode(currNode, Cursor_Pos);
      } else if (CursorPos == 0.5) {
        NumDigitLeft++;
        NumDigitRight--;
        if (NumDigitRight == 0) {
          nextNode = currNode;
          CursorPos = 1;
        }
      } else if (CursorPos == 0) {
        NumDigitLeft = 1;
        NumDigitRight = NumText.length - 1;
        CursorPos = 0.5;
        var colorNode = currNode.getAttribute("color");
        var Cursor_Pos = CursorPos;
        if (colorNode == "#A4A4A4") {
          Cursor_Pos = 0;
          nextNode = FindNextNode(currNode, Cursor_Pos);
        }
      }
    } else {
      var colorNode = currNode.getAttribute("color");
      var Cursor_Pos = CursorPos;
      if (colorNode == "#A4A4A4") {
        Cursor_Pos = 1;
        nextNode = FindNextNode(currNode, Cursor_Pos);
      } else {
        if (CursorPos == 0) {
          nextNode = currNode;
          CursorPos = 1;
        } else {
          Cursor_Pos = 1;
          nextNode = FindNextNode(currNode, Cursor_Pos);
        }
      }
    }
  } else {
    if (currtag == "mo") {
      nextNode = currNode.nextSibling;
      var nextNodeTag = "";
      if (nextNode) nextNodeTag = nextNode.tagName;
      if (nextNodeTag == "mn") {
        NumText = nextNode.childNodes[0].nodeValue;
        if (NumText.length > 1) {
          isDecimalPoint = searchCharacter(NumText, ".");
          NumDigitLeft = 1;
          NumDigitRight = NumText.length - 1;
          CursorPos = 0.5;
        } else {
          CursorPos = 1;
        }
      } else {
        if (CursorPos == 0) {
          nextNode = currNode;
          CursorPos = 1;
        } else {
          Cursor_Pos = 1;
          nextNode = FindNextNode(currNode, Cursor_Pos);
        }
      }
    } else {
      Cursor_Pos = CursorPos;
      nextNode = FindNextNode(currNode, Cursor_Pos);
      if (nextNode == currNode) {
        if (CursorPos == 0) CursorPos = 1;
        else {
          if (parentNode.getAttribute("id") != "root") nextNode = parentNode;
        }
      }
    }
  }

  currId = nextNode.getAttribute("id");
  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();

}

function FindNextNode(node, Cursor_Pos) {
  if (!node) return;
  var nextNode = node;

  if (Cursor_Pos == 0) {
    var nextNodeHasChilds = nextNode.hasChildNodes();
    //if (!IsParenthesisNode(nextNode)) nextNodeHasChilds = false;
    if (nextNodeHasChilds && !IsTextNodeChild(nextNode)) {
      if (!IsVisibleNode(nextNode)) {
        if (IsMfrac(nextNode)) {
          while (!IsVisibleNode(nextNode) && !IsTextNodeChild(nextNode)) {
            nextNode = nextNode.firstChild;
          }
          CursorPos = 0;
        } else if (IsMsqrt(nextNode)) {
          nextNode = nextNode.firstChild;
          if (IsGreyColorNode(nextNode)) CursorPos = 1;
          else CursorPos = 0;
        } else if (IsMsup(nextNode) || IsMroot(nextNode)) {
          nextNode = nextNode.firstChild;
          if (IsNonVisibleParenthesisNode(nextNode)) {
            nextNode = nextNode.firstChild;
          }
          if (nextNode.getAttribute("id")) {
            if (IsGreyColorNode(nextNode)) CursorPos = 1;
            else CursorPos = 0;
          } else {
            nextNode = nextNode.nextSibling;
            if (!IsTextNodeChild(nextNode)) nextNode = nextNode.firstChild;
            nextNode = 1;
          }
        } else {
          while (IsNonVisibleParenthesisNode(nextNode) && !IsTextNodeChild(nextNode)) {
            nextNode = nextNode.firstChild;
          }
          if (IsMiLibFunNode(nextNode) || IsUDFMiNode(nextNode)) {
            nextNode = nextNode.nextSibling;   //Visible parenthesis of the function
            nextNode = nextNode.firstChild;   //Argument of the funciont
            if (IsGreyColorNode(nextNode)) CursorPos = 1;
            else CursorPos = 0;
          } else CursorPos = 1;
        }

      } else {
        if (IsParenthesisNode(nextNode)) {
          nextNode = nextNode.firstChild;
        }
        while (IsTableNode(nextNode)) {
          nextNode = nextNode.firstChild;
        }
        if (IsGreyColorNode(nextNode)) {
          if (nextNode.nextSibling) {
            nextNode = nextNode.nextSibling;
          }
          CursorPos = 1;
        } else CursorPos = 0;
      }
    }
  } else if (Cursor_Pos == 1) {
    if (nextNode.nextSibling && (IsNodeWithId(nextNode.nextSibling) || IsCommaNode(nextNode.nextSibling))) {
      nextNode = nextNode.nextSibling;
      if (IsCommaNode(nextNode)) {
        nextNode = nextNode.nextSibling;
        //if (IsGreyColorNode(nextNode)) CursorPos = 1;
        //else CursorPos = 0;
        if (IsGreyColorNode(nextNode)) {
          if (nextNode.nextSibling && !IsCommaNode(nextNode.nextSibling)) {
            nextNode = nextNode.nextSibling;
          }
          CursorPos = 1;
        } else CursorPos = 1;  //CursorPos = 0;

      } else if (IsParenthesisNode(nextNode) || IsMfrac(nextNode)) {
        nextNode = nextNode.firstChild;
        //if (!IsEditableNode(nextNode)) {
        if (IsMiLibFunNode(nextNode) || IsUDFMiNode(nextNode)) {
          nextNode = nextNode.nextSibling;   //Visible parenthesis of the function
          nextNode = nextNode.firstChild;   //Argument of the funcion
        } else if (IsNonVisibleParenthesisNode(nextNode)) {
          nextNode = nextNode.firstChild;
        }
        if (IsGreyColorNode(nextNode)) CursorPos = 1;
        else CursorPos = 0;
      } else if (IsMsqrt(nextNode) || IsMsup(nextNode) || IsMroot(nextNode)) {
        nextNode = nextNode.firstChild;
        if (IsGreyColorNode(nextNode)) CursorPos = 1;
        else CursorPos = 0;
      } else {
        CursorPos = 1;
      }
    } else {
      if (IsTableNode(nextNode.parentNode)) {
        nextNode = nextNode.parentNode; //Tag mtd
        if (nextNode.nextSibling) {
          nextNode = nextNode.nextSibling; //previous mtd
          nextNode = nextNode.firstChild;       //child of mtd
          if (IsGreyColorNode(nextNode)) {
            if (nextNode.nextSibling) {
              nextNode = nextNode.nextSibling;
            }
            CursorPos = 1;
          } else CursorPos = 1;  //CursorPos = 0;
        } else { //It is neccesarry to lift to mtr
          nextNode = nextNode.parentNode;      //Tag mtr
          if (nextNode.nextSibling) {
            nextNode = nextNode.nextSibling; //previous mtr
            nextNode = nextNode.firstChild;       //mtd= child of mtr
            nextNode = nextNode.firstChild;       //mn= child of mtd
            if (IsGreyColorNode(nextNode)) {
              if (nextNode.nextSibling) {
                nextNode = nextNode.nextSibling;
              }
              CursorPos = 1;
            } else CursorPos = 1;  //CursorPos = 0;
          } else { //last mtr
            nextNode = nextNode.parentNode; //Tag mtable
          }
        }
        if (IsVisibleParenthesisNode(nextNode.parentNode)) {
          nextNode = nextNode.parentNode;
          CursorPos = 1;
        }
      } else if (IsArgumentOfFunction(nextNode)) {
        nextNode = nextNode.parentNode;
        if (IsNonVisibleParenthesisNode(nextNode.parentNode)) {
          nextNode = nextNode.parentNode;
        }
        CursorPos = 1;
      } else if (IsVisibleParenthesisNode(nextNode.parentNode)) {
        nextNode = nextNode.parentNode;
        CursorPos = 1;
      } else if (IsMsqrt(nextNode.parentNode) || IsMsup(nextNode.parentNode) || IsMroot(nextNode.parentNode)) {
        nextNode = nextNode.parentNode;
        CursorPos = 1;
      } else if (IsInverseOrTransposeGrandSonNode(nextNode)) {
        nextNode = nextNode.parentNode.parentNode;
        CursorPos = 1;
      } else if (IsMfrac(nextNode.parentNode.parentNode)) {
        if (IsNumeratorOfMfrac(nextNode)) {
          nextNode = nextNode.parentNode;
          nextNode = nextNode.nextSibling;
          nextNode = nextNode.firstChild;
          if (IsGreyColorNode(nextNode)) CursorPos = 1;
          else CursorPos = 0;
        } else {
          nextNode = nextNode.parentNode.parentNode;
          CursorPos = 1;
        }
      }
    }
  }

  return nextNode;
}

function Pow() {
  if (Shift_state == 0) SquarePow();
  else GenericPow();
}

function IsMnZeroValueNode(node) {
  isMnZeroValueNode = false;
  if (!node) return false;
  currTag = node.tagName;
  if (currTag == "mn") {
    var nodeValue = node.firstChild.nodeValue;
    if (nodeValue == "0") {
      isMnZeroValueNode = true;
    }
  }
  return isMnZeroValueNode;
}

function SquarePow() {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;

  var currNode = null;
  var currTag, parentNode, childNode;
  if (currId != "root") {
    currNode = GetElementById(expr_xml, currId);
    parentNode = currNode.parentNode;
    currTag = currNode.tagName;
    if ((currTag == "mn" && !IsGreyColorNode(currNode)) || IsParamMiNode(currNode) || IsVarMiNode(currNode)) {
      if (!IsMnZeroValueNode(currNode)) {
        inputOperator("×");
      }
    }
  } else {
    parentNode = expr_xml.documentElement;
  }

  var newSup = expr_xml.createElement("msup");
  var newIdMsup = expr_xml.createAttribute("id");
  msup_cont++;
  var idMsup = "msup_" + msup_cont;
  newIdMsup.nodeValue = idMsup;
  newSup.setAttributeNode(newIdMsup);

  var nodeSup, baseNum;
  if (currNode && IsGreyColorNode(currNode)) {
    nodeSup = parentNode.insertBefore(newSup, currNode);
    baseNum = InsertMnNode(nodeSup, "number", "x");
    if(IsLinSolveArgument(currNode) || IsArgumentOfFunction(currNode)) {
      parentNode.removeChild(currNode);
    } else {
      if(IsThereGreyColorNodes(parentNode)) RemoveGreyNodes(parentNode);
    }
  } else {
    nodeSup = parentNode.appendChild(newSup);
    baseNum = InsertMnNode(nodeSup, "number", "x");
    if (nodeSup.previousSibling) {
      var prevNode = nodeSup.previousSibling;
      var prevNodeTag = prevNode.tagName;
      if (prevNodeTag == "mn") {
        var mn_value = prevNode.firstChild.nodeValue;
        if (mn_value == "0") {
          parentNode.removeChild(prevNode);
        }
      }
    }
  }
  currId = baseNum.getAttribute("id");
  CursorPos = 1;

  var newMn = expr_xml.createElement("mn");
  var node_mn = nodeSup.appendChild(newMn);
  var newText2 = expr_xml.createTextNode("2");
  var node_text2 = node_mn.appendChild(newText2);

  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
}

function InsertMnNode(parentNode, NodeType, argument) {
  var newMn = expr_xml.createElement("mn");
  var newIdMn = expr_xml.createAttribute("id");
  mn_cont++;
  var idMn = "mn_" + mn_cont;
  currId = idMn;
  newIdMn.nodeValue = idMn;
  newMn.setAttributeNode(newIdMn);
  var newColor = expr_xml.createAttribute("color");
  newColor.nodeValue = "#A4A4A4";
  newMn.setAttributeNode(newColor);
  if (NodeType == "matrix") {
    var newMathvariant = expr_xml.createAttribute("mathvariant");
    newMathvariant.nodeValue = "bold";
    newMn.setAttributeNode(newMathvariant);
  } else if (NodeType == "number") {
    var newMathvariant = expr_xml.createAttribute("mathvariant");
    newMathvariant.nodeValue = "italic";
    newMn.setAttributeNode(newMathvariant);
  }

  var node_mn = parentNode.appendChild(newMn);
  var newText = expr_xml.createTextNode(argument);
  node_mn.appendChild(newText);
  return node_mn;
}

function InsertMnNode_alt(currNode, parentNode, NodeType, argument) {
  var newMn = expr_xml.createElement("mn");
  var newIdMn = expr_xml.createAttribute("id");
  mn_cont++;
  var idMn = "mn_" + mn_cont;
  currId = idMn;
  newIdMn.nodeValue = idMn;
  newMn.setAttributeNode(newIdMn);
  var newColor = expr_xml.createAttribute("color");
  newColor.nodeValue = "#A4A4A4";
  newMn.setAttributeNode(newColor);
  if (NodeType == "matrix") {
    var newMathvariant = expr_xml.createAttribute("mathvariant");
    newMathvariant.nodeValue = "bold";
    newMn.setAttributeNode(newMathvariant);
  } else if (NodeType == "number") {
    var newMathvariant = expr_xml.createAttribute("mathvariant");
    newMathvariant.nodeValue = "italic";
    newMn.setAttributeNode(newMathvariant);
  }

  var node_mn;
  if (CursorPos == 0) {
    node_mn = parentNode.insertBefore(newMn, currNode);
  } else {
    var nextNode = currNode.nextSibling;
    if (nextNode) {
      node_mn = parentNode.insertBefore(newMn, nextNode);
    } else {
      node_mn = parentNode.appendChild(newMn);
    }
  }
  var newText = expr_xml.createTextNode(argument);
  node_mn.appendChild(newText);
  return node_mn;
}

function GenericPow() {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;

  var currNode = null;
  var currTag, parentNode, childNode;
  if (currId != "root") {
    currNode = GetElementById(expr_xml, currId);
    parentNode = currNode.parentNode;
    currTag = currNode.tagName;
    if (currTag == "mn" && !IsGreyColorNode(currNode)) {
      if (!IsMnZeroValueNode(currNode)) {
        inputOperator("×");
      }
    }
  } else {
    parentNode = expr_xml.documentElement;
  }

  var newSup = expr_xml.createElement("msup");
  var newIdMsup = expr_xml.createAttribute("id");
  msup_cont++;
  var idMsup = "msup_" + msup_cont;
  newIdMsup.nodeValue = idMsup;
  newSup.setAttributeNode(newIdMsup);

  var nodeSup, baseNum;
  if (currNode && IsGreyColorNode(currNode)) {
    nodeSup = parentNode.insertBefore(newSup, currNode);
    baseNum = InsertMnNode(nodeSup, "number", "x");
    if(IsLinSolveArgument(currNode) || IsArgumentOfFunction(currNode)) {
      parentNode.removeChild(currNode);
    } else {
      if(IsThereGreyColorNodes(parentNode)) RemoveGreyNodes(parentNode);
    }
  } else {
    nodeSup = parentNode.appendChild(newSup);
    baseNum = InsertMnNode(nodeSup, "number", "x");
    if (nodeSup.previousSibling) {
      var prevNode = nodeSup.previousSibling;
      var prevNodeTag = prevNode.tagName;
      if (prevNodeTag == "mn") {
        var mn_value = prevNode.firstChild.nodeValue;
        if (mn_value == "0") {
          parentNode.removeChild(prevNode);
        }
      }
    }
  }

  currId = baseNum.getAttribute("id");
  CursorPos = 1;

  var newMn = expr_xml.createElement("mn");
  var newIdMn = expr_xml.createAttribute("id");
  mn_cont++;
  var idMn = "mn_" + mn_cont;
  newIdMn.nodeValue = idMn;
  newMn.setAttributeNode(newIdMn);
  var newColor = expr_xml.createAttribute("color");
  newColor.nodeValue = "#A4A4A4";
  newMn.setAttributeNode(newColor);
  var newMathvariant = expr_xml.createAttribute("mathvariant");
  newMathvariant.nodeValue = "italic";
  newMn.setAttributeNode(newMathvariant);

  var node_mn = nodeSup.appendChild(newMn);
  var newText2 = expr_xml.createTextNode("y");
  var node_text2 = node_mn.appendChild(newText2);

  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
}


function Root() {
  if (Shift_state == 0) SquareRoot();
  else GenericRoot();
}

function SquareRoot() {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;

  var currNode = null;
  var currTag, parentNode, childNode;
  if (currId != "root") {
    currNode = GetElementById(expr_xml, currId);
    parentNode = currNode.parentNode;

  } else {
    parentNode = expr_xml.documentElement;
  }

  var newMsqrt = expr_xml.createElement("msqrt");
  var newIdMsqrt = expr_xml.createAttribute("id");
  msqrt_cont++;
  var idMsqrt = "msqrt_" + msqrt_cont;
  newIdMsqrt.nodeValue = idMsqrt;
  newMsqrt.setAttributeNode(newIdMsqrt);

  var nodeMsqrt, radicandNum;
  if (currNode && IsGreyColorNode(currNode)) {
    nodeMsqrt = parentNode.insertBefore(newMsqrt, currNode);
    radicandNum = InsertMnNode(nodeMsqrt, "number", "x");
    if(IsLinSolveArgument(currNode) || IsArgumentOfFunction(currNode)) {
      parentNode.removeChild(currNode);
    } else {
      if(IsThereGreyColorNodes(parentNode)) RemoveGreyNodes(parentNode);
    }
  } else {
    nodeMsqrt = parentNode.appendChild(newMsqrt);
    radicandNum = InsertMnNode(nodeMsqrt, "number", "x");
    if (nodeMsqrt.previousSibling) {
      var prevNode = nodeMsqrt.previousSibling;
      var prevNodeTag = prevNode.tagName;
      if (prevNodeTag == "mn") {
        var mn_value = prevNode.firstChild.nodeValue;
        if (mn_value == "0") {
          parentNode.removeChild(prevNode);
        }
      }
    }
  }
  currId = radicandNum.getAttribute("id");
  CursorPos = 1;

  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
}

function GenericRoot() {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;

  var currNode = null;
  var currTag, parentNode, childNode;
  if (currId != "root") {
    currNode = GetElementById(expr_xml, currId);
    parentNode = currNode.parentNode;

  } else {
    parentNode = expr_xml.documentElement;
  }

  var newMroot = expr_xml.createElement("mroot");
  var newIdMroot = expr_xml.createAttribute("id");
  mroot_cont++;
  var idMroot = "mroot_" + mroot_cont;
  newIdMroot.nodeValue = idMroot;
  newMroot.setAttributeNode(newIdMroot);

  var nodeMroot, radicandNum;
  if (currNode && IsGreyColorNode(currNode)) {
    nodeMroot = parentNode.insertBefore(newMroot, currNode);
    radicandNum = InsertMnNode(newMroot, "number", "x");
    if(IsLinSolveArgument(currNode) || IsArgumentOfFunction(currNode)) {
      parentNode.removeChild(currNode);
    } else {
      if(IsThereGreyColorNodes(parentNode)) RemoveGreyNodes(parentNode);
    }
  } else {
    nodeMroot = parentNode.appendChild(newMroot);
    radicandNum = InsertMnNode(nodeMroot, "number", "x");
    if (nodeMroot.previousSibling) {
      var prevNode = nodeMroot.previousSibling;
      var prevNodeTag = prevNode.tagName;
      if (prevNodeTag == "mn") {
        var mn_value = prevNode.firstChild.nodeValue;
        if (mn_value == "0") {
          parentNode.removeChild(prevNode);
        }
      }
    }
  }
  currId = radicandNum.getAttribute("id");
  CursorPos = 1;

  var newMn = expr_xml.createElement("mn");
  var newIdMn = expr_xml.createAttribute("id");
  mn_cont++;
  var idMn = "mn_" + mn_cont;
  newIdMn.nodeValue = idMn;
  newMn.setAttributeNode(newIdMn);
  var newColor = expr_xml.createAttribute("color");
  newColor.nodeValue = "#A4A4A4";
  newMn.setAttributeNode(newColor);
  var newMathvariant = expr_xml.createAttribute("mathvariant");
  newMathvariant.nodeValue = "italic";
  newMn.setAttributeNode(newMathvariant);

  var node_mn = nodeMroot.appendChild(newMn);
  var newText = expr_xml.createTextNode("y");
  var node_text2 = node_mn.appendChild(newText)

  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
}

function Parenthesis() {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  var currNode = null;
  var currTag, parentNode;
  var IsExpOfPowORIdxOfRoot = false;
  if (currId != "root") {
    currNode = GetElementById(expr_xml, currId);
    if (!currNode) return;
    if (IsExponentOfPower(currNode) || IsIndexOfRoot(currNode)) {
      IsExpOfPowORIdxOfRoot = true;
    }
    parentNode = currNode.parentNode;
    currTag = currNode.tagName;
    if (IsGreyColorNode(currNode)) {
      currNode = FindFirstCorrectNode(currId);
      if (currNode) currTag = currNode.tagName;
      else currTag = "";
    }

  } else {
    currTag = "";
    parentNode = expr_xml.documentElement;
  }

  if (currTag == "mn") {
    var Num = parseFloat(currNode.childNodes[0].nodeValue);
    if (Num == 0) {
      parentNode.removeChild(currNode);
      currTag = "";
    }
  }

  var newMfenced = expr_xml.createElement("mfenced");
  mfenced_cont++;
  var newOpen = expr_xml.createAttribute("open");
  newOpen.nodeValue = "(";
  newMfenced.setAttributeNode(newOpen);
  var newClose = expr_xml.createAttribute("close");
  newClose.nodeValue = ")";
  newMfenced.setAttributeNode(newClose);
  var newIdMfenced = expr_xml.createAttribute("id");
  var idMfenced = "mfenced_" + mfenced_cont;
  newIdMfenced.nodeValue = idMfenced;
  newMfenced.setAttributeNode(newIdMfenced);
  var newSeparator = expr_xml.createAttribute("separators");
  newSeparator.nodeValue = "";
  newMfenced.setAttributeNode(newSeparator);

  var node_fenced;
  if (currNode) {
    if (CursorPos == 0) {
      node_fenced = parentNode.insertBefore(newMfenced, currNode);
    } else {
      var NextNode = currNode.nextSibling;
      if (NextNode) {
        node_fenced = parentNode.insertBefore(newMfenced, NextNode);
      }
      else {
        node_fenced = parentNode.appendChild(newMfenced);
      }
    }
  } else {
    if (IsMsup(parentNode) || IsMroot((parentNode))) {
      if (IsExpOfPowORIdxOfRoot) node_fenced = parentNode.appendChild(newMfenced);
      else {
        var lastChild = parentNode.lastChild;
        node_fenced = parentNode.insertBefore(newMfenced, lastChild);
      }
    } else node_fenced = parentNode.appendChild(newMfenced);
  }

  var newMn = expr_xml.createElement("mn");
  var newIdMn = expr_xml.createAttribute("id");
  mn_cont++;
  var idMn = "mn_" + mn_cont;
  currId = idMn;
  newIdMn.nodeValue = idMn;
  newMn.setAttributeNode(newIdMn);
  var newColor = expr_xml.createAttribute("color");
  newColor.nodeValue = "#A4A4A4";
  newMn.setAttributeNode(newColor);
  var newMathvariant = expr_xml.createAttribute("mathvariant");
  newMathvariant.nodeValue = "italic";
  newMn.setAttributeNode(newMathvariant);

  var node_mn = node_fenced.appendChild(newMn);
  var newText = expr_xml.createTextNode("x");
  var node_text = node_mn.appendChild(newText);
  CursorPos = 1;

  parenthesis_cont++;
  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
}

function Transpose_and_Inverse(fun_type) {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;

  var currNode = null;
  var currTag, parentNode, childNode;
  if (currId != "root") {
    currNode = GetElementById(expr_xml, currId);
    parentNode = currNode.parentNode;
    currTag = currNode.tagName;
  } else {
    parentNode = expr_xml.documentElement;
    currTag = "";
  }

  var newSup = expr_xml.createElement("msup");
  var newIdMsup = expr_xml.createAttribute("id");
  msup_cont++;
  var idMsup = "msup_" + msup_cont;
  newIdMsup.nodeValue = idMsup;
  newSup.setAttributeNode(newIdMsup);

  var nodeSup, baseNum;
  var existBaseNum = false;
  if ((currNode && currTag != "mo" && !IsNonErasebleNode(currNode)) || IsGreyColorNode(currNode)) {
    nodeSup = parentNode.insertBefore(newSup, currNode);
    baseNum = nodeSup.appendChild(currNode);
    existBaseNum = true;
  } else {
    nodeSup = parentNode.appendChild(newSup);
    baseNum = InsertMnNode(nodeSup, "matrix", "A");
  }

  var newMfenced = expr_xml.createElement("mfenced");
  mfenced_cont++;
  var newOpen = expr_xml.createAttribute("open");
  newOpen.nodeValue = "";
  newMfenced.setAttributeNode(newOpen);
  var newClose = expr_xml.createAttribute("close");
  newClose.nodeValue = "";
  newMfenced.setAttributeNode(newClose);
  var newIdMfenced = expr_xml.createAttribute("id");
  mfenced_cont++;
  var idMfenced = "mfenced_" + mfenced_cont;
  newIdMfenced.nodeValue = idMfenced;
  newMfenced.setAttributeNode(newIdMfenced);
  var newSeparator = expr_xml.createAttribute("separators");
  newSeparator.nodeValue = "";
  newMfenced.setAttributeNode(newSeparator);
  var node_fenced = nodeSup.appendChild(newMfenced);

  var node_Matrix = node_fenced.appendChild(baseNum);


  var newMi = expr_xml.createElement("mi");
  var node_mi = nodeSup.appendChild(newMi);
  var newText2;
  if (fun_type == "Transpose") {
    newText2 = expr_xml.createTextNode("T");
  } else if (fun_type == "Inverse") {
    var newText2 = expr_xml.createTextNode("-1");
  }
  var node_text2 = node_mi.appendChild(newText2);

  var newTypeFun = expr_xml.createAttribute("type");
  var funType = "lib";
  newTypeFun.nodeValue = funType;
  newMi.setAttributeNode(newTypeFun);


  if (existBaseNum) {
    currId = idMsup;
  } else {
    currId = baseNum.getAttribute("id");
  }
  CursorPos = 1;

  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
}

function TrigFunctions(fun_name) {
  if (Shift_state == 0) {
    switch (fun_name) {
      case "sin":
        GenericFunction("sin");
        break;
      case "cos":
        GenericFunction("cos");
        break;
      case "tan":
        GenericFunction("tan");
        break;
    }
  } else if (Shift_state == 1) {
    switch (fun_name) {
      case "sin":
        GenericFunction("asin");
        break;
      case "cos":
        GenericFunction("acos");
        break;
      case "tan":
        GenericFunction("atan");
        break;
    }
  }

}

function Pi_and_I() {
  if (Shift_state == 0) {
    inputNumber('π');
  } else if (Shift_state == 1) {
    inputNumber("i");
  }
}

function GenericFunction(fun_name) {
  if (eigv_cont == 1) {
    alert("Only one eigenvalues analysis by expression is allowed!!!")
  }
  if (fun_name == "Eigv" && (IsVar_DefinitionActive() || IsUDF_DefinitionActive())) {
    return;
  }
  if (!isScreenMode || fun_name == "Eigv") ClearAll();
  isScreenMode = true;
  var currNode, currTag, parentNode;
  var IsExpOfPowORIdxOfRoot = false;
  if (currId != "root") {
    currNode = GetElementById(expr_xml, currId);
    if (!currNode) return;
    if (IsExponentOfPower(currNode) || IsIndexOfRoot(currNode)) {
      IsExpOfPowORIdxOfRoot = true;
    }
    parentNode = currNode.parentNode;
    currTag = currNode.tagName;
    if (IsGreyColorNode(currNode)) {
      currNode = FindFirstCorrectNode(currId);
      if (currNode) currTag = currNode.tagName;
      else currTag = "";
    }

  } else {
    currTag = "";
    parentNode = expr_xml.documentElement;
  }

  if (currTag == "mn") {
    var Num = parseFloat(currNode.childNodes[0].nodeValue);
    if (Num == 0) {
      parentNode.removeChild(currNode);
      currTag = "";
    }
  }

  if (fun_name == "normalize") normalize_cont++;

  var newMfenced_ext = expr_xml.createElement("mfenced");
  mfenced_cont++;
  var newOpen_ext = expr_xml.createAttribute("open");
  newOpen_ext.nodeValue = "";
  newMfenced_ext.setAttributeNode(newOpen_ext);
  var newClose_ext = expr_xml.createAttribute("close");
  newClose_ext.nodeValue = "";
  newMfenced_ext.setAttributeNode(newClose_ext);
  var newIdMfenced_ext = expr_xml.createAttribute("id");
  var idMfenced_ext = "mfenced_" + mfenced_cont;
  newIdMfenced_ext.nodeValue = idMfenced_ext;
  newMfenced_ext.setAttributeNode(newIdMfenced_ext);
  var newSeparator_ext = expr_xml.createAttribute("separators");
  newSeparator_ext.nodeValue = "";
  newMfenced_ext.setAttributeNode(newSeparator_ext);

  var node_fenced_ext;
  if (currNode) {
    if (CursorPos == 0) {
      node_fenced_ext = parentNode.insertBefore(newMfenced_ext, currNode);
    } else {
      if (CursorPos == 1) {
        var NextNode = currNode.nextSibling;
        if (NextNode) {
          node_fenced_ext = parentNode.insertBefore(newMfenced_ext, NextNode);
        }
        else {
          node_fenced_ext = parentNode.appendChild(newMfenced_ext);
        }
      } else if (CursorPos == 0.5) {
        if (currTag = "mn") {
          var textNum = currNode.childNodes[0].nodeValue;
          var firstPart = textNum.substring(0, NumDigitLeft);
          var secondPart = textNum.substring(NumDigitLeft, (NumDigitLeft + NumDigitRight));
          ChangeTextToMnNode(currNode, secondPart);
          var newMn_elem = CreateMnElement(firstPart);
          var newMnNode = parentNode.insertBefore(newMn_elem, currNode);
          node_fenced_ext = parentNode.insertBefore(newMfenced_ext, currNode);
        }
      }
    }
  } else {
    if (IsMsup(parentNode) || IsMroot((parentNode))) {
      if (IsExpOfPowORIdxOfRoot) node_fenced_ext = parentNode.appendChild(newMfenced_ext);
      else {
        var lastChild = parentNode.lastChild;
        node_fenced_ext = parentNode.insertBefore(newMfenced_ext, lastChild);
      }
    } else node_fenced_ext = parentNode.appendChild(newMfenced_ext);
  }

  var newFunction = expr_xml.createElement("mi");
  var newIdFun = expr_xml.createAttribute("id");
  mi_cont++;
  var idFunc = "mi_" + mi_cont;
  newIdFun.nodeValue = idFunc;
  newFunction.setAttributeNode(newIdFun);

  var newTypeFun = expr_xml.createAttribute("type");
  var funType = "lib";
  newTypeFun.nodeValue = funType;
  newFunction.setAttributeNode(newTypeFun);

  var node_Func = node_fenced_ext.appendChild(newFunction);


  var funName_text = expr_xml.createTextNode(fun_name);
  var node_text = node_Func.appendChild(funName_text);

  var newMfenced = expr_xml.createElement("mfenced");
  mfenced_cont++;
  var newOpen = expr_xml.createAttribute("open");
  newOpen.nodeValue = "(";
  newMfenced.setAttributeNode(newOpen);
  var newClose = expr_xml.createAttribute("close");
  newClose.nodeValue = ")";
  newMfenced.setAttributeNode(newClose);
  var newIdMfenced = expr_xml.createAttribute("id");
  var idMfenced = "mfenced_" + mfenced_cont;
  newIdMfenced.nodeValue = idMfenced;
  newMfenced.setAttributeNode(newIdMfenced);
  var newSeparator = expr_xml.createAttribute("separators");
  newSeparator.nodeValue = "";
  newMfenced.setAttributeNode(newSeparator);
  var node_fenced_int = node_fenced_ext.appendChild(newMfenced);

  var newMn = expr_xml.createElement("mn");
  var newIdMn = expr_xml.createAttribute("id");
  mn_cont++;
  var idMn = "mn_" + mn_cont;
  currId = idMn;
  newIdMn.nodeValue = idMn;
  newMn.setAttributeNode(newIdMn);
  var newColor = expr_xml.createAttribute("color");
  newColor.nodeValue = "#A4A4A4";
  newMn.setAttributeNode(newColor);
  var node_mn = node_fenced_int.appendChild(newMn);
  var argument = "x";
  if (fun_name == "det" || fun_name == "trace" || fun_name == "Eigv") {
    argument = "A";
    var newMathvariant = expr_xml.createAttribute("mathvariant");
    newMathvariant.nodeValue = "bold";
    newMn.setAttributeNode(newMathvariant);
    if (fun_name == "Eigv") eigv_cont++;
  } else {
    var newMathvariant = expr_xml.createAttribute("mathvariant");
    newMathvariant.nodeValue = "italic";
    newMn.setAttributeNode(newMathvariant);
  }
  var newText = expr_xml.createTextNode(argument);
  var node_text = node_mn.appendChild(newText);
  CursorPos = 1;

  function_cont++;
  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
}


function LinSolver() {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  var currNode, currTag, parentNode;
  if (currId != "root") {
    currNode = GetElementById(expr_xml, currId);
    if (!currNode) return;
    parentNode = currNode.parentNode;
    currTag = currNode.tagName;
    if (IsGreyColorNode(currNode)) {
      currNode = FindFirstCorrectNode(currId);
      if (currNode) currTag = currNode.tagName;
      else currTag = "";
    }

  } else {
    currTag = "";
    parentNode = expr_xml.documentElement;
  }

  if (currTag == "mn") {
    var Num = parseFloat(currNode.childNodes[0].nodeValue);
    if (Num == 0) {
      parentNode.removeChild(currNode);
      currTag = "";
    }
  }

  var newMfenced_ext = expr_xml.createElement("mfenced");
  mfenced_cont++;
  var newOpen_ext = expr_xml.createAttribute("open");
  newOpen_ext.nodeValue = "";
  newMfenced_ext.setAttributeNode(newOpen_ext);
  var newClose_ext = expr_xml.createAttribute("close");
  newClose_ext.nodeValue = "";
  newMfenced_ext.setAttributeNode(newClose_ext);
  var newIdMfenced_ext = expr_xml.createAttribute("id");
  var idMfenced_ext = "mfenced_" + mfenced_cont;
  newIdMfenced_ext.nodeValue = idMfenced_ext;
  newMfenced_ext.setAttributeNode(newIdMfenced_ext);
  var newSeparator_ext = expr_xml.createAttribute("separators");
  newSeparator_ext.nodeValue = "";
  newMfenced_ext.setAttributeNode(newSeparator_ext);

  var node_fenced_ext;
  if (currNode) {
    if (CursorPos == 0) {
      node_fenced_ext = parentNode.insertBefore(newMfenced_ext, currNode);
    } else {
      var NextNode = currNode.nextSibling;
      if (NextNode) {
        node_fenced_ext = parentNode.insertBefore(newMfenced_ext, NextNode);
      }
      else {
        node_fenced_ext = parentNode.appendChild(newMfenced_ext);
      }
    }
  } else {
    node_fenced_ext = parentNode.appendChild(newMfenced_ext);
  }

  var newFunction = expr_xml.createElement("mi");
  var newIdFun = expr_xml.createAttribute("id");
  mi_cont++;
  var idFunc = "mi_" + mi_cont;
  newIdFun.nodeValue = idFunc;
  newFunction.setAttributeNode(newIdFun);

  var newTypeFun = expr_xml.createAttribute("type");
  var funType = "lib";
  newTypeFun.nodeValue = funType;
  newFunction.setAttributeNode(newTypeFun);

  var node_Func = node_fenced_ext.appendChild(newFunction);

  var funName = "LinSolve";
  var funName_text = expr_xml.createTextNode(funName);
  var node_text = node_Func.appendChild(funName_text);

  var newMfenced = expr_xml.createElement("mfenced");
  mfenced_cont++;
  var newOpen = expr_xml.createAttribute("open");
  newOpen.nodeValue = "(";
  newMfenced.setAttributeNode(newOpen);
  var newClose = expr_xml.createAttribute("close");
  newClose.nodeValue = ")";
  newMfenced.setAttributeNode(newClose);
  var newIdMfenced = expr_xml.createAttribute("id");
  var idMfenced = "mfenced_" + mfenced_cont;
  newIdMfenced.nodeValue = idMfenced;
  newMfenced.setAttributeNode(newIdMfenced);
  var newSeparator = expr_xml.createAttribute("separators");
  newSeparator.nodeValue = "";
  newMfenced.setAttributeNode(newSeparator);
  var node_fenced_int = node_fenced_ext.appendChild(newMfenced);

  var newMn1 = expr_xml.createElement("mn");
  var newIdMn1 = expr_xml.createAttribute("id");
  mn_cont++;
  var idMn1 = "mn_" + mn_cont;
  currId = idMn1;
  newIdMn1.nodeValue = idMn1;
  newMn1.setAttributeNode(newIdMn1);
  var newColor = expr_xml.createAttribute("color");
  newColor.nodeValue = "#A4A4A4";
  newMn1.setAttributeNode(newColor);
  var node_mn1 = node_fenced_int.appendChild(newMn1);
  var argument = "A";
  var newMathvariant1 = expr_xml.createAttribute("mathvariant");
  newMathvariant1.nodeValue = "bold";
  newMn1.setAttributeNode(newMathvariant1);
  var newText1 = expr_xml.createTextNode(argument);
  var node_text1 = node_mn1.appendChild(newText1);


  var newComa = expr_xml.createElement("mi");
  var node_Coma = node_fenced_int.appendChild(newComa);
  var Coma_text = expr_xml.createTextNode(",");
  var node_text_Coma = node_Coma.appendChild(Coma_text);
  var newTypeComa = expr_xml.createAttribute("type");
  var MiType = "coma";
  newTypeComa.nodeValue = MiType;
  newComa.setAttributeNode(newTypeComa);
  var node_Coma = node_fenced_int.appendChild(newComa);

  var newMn2 = expr_xml.createElement("mn");
  var newIdMn2 = expr_xml.createAttribute("id");
  mn_cont++;
  var idMn2 = "mn_" + mn_cont;
  newIdMn2.nodeValue = idMn2;
  newMn2.setAttributeNode(newIdMn2);
  var newColor = expr_xml.createAttribute("color");
  newColor.nodeValue = "#A4A4A4";
  newMn2.setAttributeNode(newColor);
  var node_mn2 = node_fenced_int.appendChild(newMn2);
  var argument = "b";
  var newMathvariant2 = expr_xml.createAttribute("mathvariant");
  newMathvariant2.nodeValue = "bold";
  newMn2.setAttributeNode(newMathvariant2);
  var newText2 = expr_xml.createTextNode(argument);
  var node_text2 = node_mn2.appendChild(newText2);

  linsolve_cont++;
  CursorPos = 1;
  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
}

function Fraction() {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  var currNode, currTag, parentNode, childNode, childNodTag;
  var den_text = "x";
  var numerator_Id = "";
  if (currId != "root") {
    currNode = GetElementById(expr_xml, currId);
    if (!currNode) return;
    currTag = currNode.tagName;
    parentNode = currNode.parentNode;
    if (currTag == "mo" || IsNonErasebleNode(currNode)) {
      currNode = InsertMnNode_alt(currNode, parentNode, "number", "x");
      numerator_Id = currNode.getAttribute("id");
      den_text = "y";
    } else {
      if (IsGreyColorNode(currNode)) {
        numerator_Id = currNode.getAttribute("id");
        den_text = "y";
      }
    }
  } else {
    parentNode = expr_xml.documentElement;
    currNode = InsertMnNode(parentNode, "number", "x");
    numerator_Id = currNode.getAttribute("id");
    den_text = "y";
  }

  var newMfrac = expr_xml.createElement("mfrac");
  var newIdMfrac = expr_xml.createAttribute("id");
  mfrac_cont++;
  var idMfrac = "mfrac_" + mfrac_cont;
  newIdMfrac.nodeValue = idMfrac;
  newMfrac.setAttributeNode(newIdMfrac);

  var NextNode = currNode.nextSibling;
  if (NextNode) nodeMfrac = parentNode.insertBefore(newMfrac, NextNode);
  else nodeMfrac = parentNode.appendChild(newMfrac);
  parentNode.removeChild(currNode);

  var newMfenced_num = expr_xml.createElement("mfenced");
  mfenced_cont++;
  var newOpen = expr_xml.createAttribute("open");
  newOpen.nodeValue = "";
  newMfenced_num.setAttributeNode(newOpen);
  var newClose_num = expr_xml.createAttribute("close");
  newClose_num.nodeValue = "";
  newMfenced_num.setAttributeNode(newClose_num);
  var newIdMfenced_num = expr_xml.createAttribute("id");
  mfenced_cont++;
  var idMfenced_num = "mfenced_" + mfenced_cont;
  newIdMfenced_num.nodeValue = idMfenced_num;
  newMfenced_num.setAttributeNode(newIdMfenced_num);
  var newSeparator_num = expr_xml.createAttribute("separators");
  newSeparator_num.nodeValue = "";
  newMfenced_num.setAttributeNode(newSeparator_num);
  var node_fenced_num = nodeMfrac.appendChild(newMfenced_num);
  var node_numerator = node_fenced_num.appendChild(currNode);


  var newMfenced_den = expr_xml.createElement("mfenced");
  mfenced_cont++;
  var newOpen = expr_xml.createAttribute("open");
  newOpen.nodeValue = "";
  newMfenced_den.setAttributeNode(newOpen);
  var newClose_den = expr_xml.createAttribute("close");
  newClose_den.nodeValue = "";
  newMfenced_den.setAttributeNode(newClose_den);
  var newIdMfenced_den = expr_xml.createAttribute("id");
  mfenced_cont++;
  var idMfenced_den = "mfenced_" + mfenced_cont;
  newIdMfenced_den.nodeValue = idMfenced_den;
  newMfenced_den.setAttributeNode(newIdMfenced_den);
  var newSeparator_den = expr_xml.createAttribute("separators");
  newSeparator_den.nodeValue = "";
  newMfenced_den.setAttributeNode(newSeparator_den);
  var node_fenced_den = nodeMfrac.appendChild(newMfenced_den);

  var newMn = expr_xml.createElement("mn");
  var newIdMn = expr_xml.createAttribute("id");
  mn_cont++;
  var idMn = "mn_" + mn_cont;
  newIdMn.nodeValue = idMn;
  newMn.setAttributeNode(newIdMn);
  var newColor = expr_xml.createAttribute("color");
  newColor.nodeValue = "#A4A4A4";
  newMn.setAttributeNode(newColor);
  var newMathvariant = expr_xml.createAttribute("mathvariant");
  newMathvariant.nodeValue = "italic";
  newMn.setAttributeNode(newMathvariant);
  var node_mn = node_fenced_den.appendChild(newMn);
  var newText = expr_xml.createTextNode(den_text);
  var node_text = node_mn.appendChild(newText);

  if (numerator_Id != "") currId = numerator_Id;
  else currId = idMn;
  CursorPos = 1;

  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges();
}


function ChangeSign() {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  var currNode, currTag, parentNode;
  if (currId != "root") {
    currNode = GetElementById(expr_xml, currId);
    if (!currNode) return;
    if (IsGreyColorNode(currNode)) return;
    parentNode = currNode.parentNode;
    currTag = currNode.tagName;
    parentNodeId = parentNode.getAttribute("id");
    if (IsNonErasebleNode(currNode)) return;
  } else {
    return;
  }

  if (currTag != "mn") {
    var prevNode = currNode.previousSibling;
    var prevNodeTag = "";
    if (prevNode) prevNodeTag = prevNode.tagName;
    if (prevNodeTag == "mo") {
      var operator = prevNode.childNodes[0].nodeValue;
      if (operator == "+") {
        prevNode.childNodes[0].nodeValue = "-";
      } else if (operator == "-") {
        prevNode.childNodes[0].nodeValue = "+";
      } else if (operator == "×") {
        var externalParenthesisNode = CreateExternalParenthesisNode(currNode);
        var newElement = expr_xml.createElement("mo");
        var Oper_text = "-";
        var newOper = expr_xml.createTextNode(Oper_text);
        var newId = expr_xml.createAttribute("id");
        mo_cont++;
        var IdOper = "mo_" + mo_cont;
        newId.nodeValue = IdOper;
        newElement.appendChild(newOper);
        newElement.setAttributeNode(newId);
        currNode = externalParenthesisNode.lastChild;
        externalParenthesisNode.insertBefore(newElement, currNode);
        currId = externalParenthesisNode.getAttribute("id");
        CursorPos = 1;
      } else return;
    } else {
      var newElement = expr_xml.createElement("mo");
      var Oper_text = "-";
      var newOper = expr_xml.createTextNode(Oper_text);
      var newId = expr_xml.createAttribute("id");
      mo_cont++;
      var IdOper = "mo_" + mo_cont;
      newId.nodeValue = IdOper;
      newElement.appendChild(newOper);
      newElement.setAttributeNode(newId);
      parentNode.insertBefore(newElement, currNode);
    }
  } else {
    var currText = currNode.childNodes[0].nodeValue;
    var numVal = parseFloat(currText);
    if (numVal == 0) return;
    if (currText == ".") currText = "0";
    var PosEex = searchCharacter(currText, "e");
    var IsEexChangeSign = false;
    if (PosEex != 0) {
      if (CursorPos == 1) IsEexChangeSign = true;
      if (CursorPos <= 0.5 && NumDigitLeft >= PosEex) IsEexChangeSign = true;
    }

    if (IsEexChangeSign) {
      var textEex = currText.substr(PosEex, currText.length);
      var IsNegative = false;
      if (searchCharacter(textEex, "-") != 0) {
        IsNegative = true;
        textEex = textEex.substr(1, textEex.length);
      }
      if (IsNegative) {
        var NewText = currText.substr(0, PosEex) + textEex;
        currNode.childNodes[0].nodeValue = NewText;
      } else {
        var NewText = currText.substr(0, PosEex) + "-" + textEex;
        currNode.childNodes[0].nodeValue = NewText;
      }
    } else {
      var IsNegative = false;
      var posMinusSign = searchCharacter(currText, "-");
      if (posMinusSign != 0) {
        if (PosEex == 0 || (PosEex != 0 && (posMinusSign < PosEex))) {
          IsNegative = true;
          currText = currText.substr(1, currText.length);
        }
      }
      if (IsNegative) {
        currNode.childNodes[0].nodeValue = currText;
      } else {
        currNode.childNodes[0].nodeValue = "-" + currText;
      }
      var prevNode = currNode.previousSibling;
      if (prevNode) {
        var prevNodeTag = prevNode.tagName;
        if (prevNodeTag == "mo") {
          var operator = prevNode.childNodes[0].nodeValue;
          if (operator == "×" && !IsNegative) {
            var externalParenthesisNode = CreateExternalParenthesisNode(currNode);
            currId = externalParenthesisNode.getAttribute("id");
          }
        }
      }
      CursorPos = 1;
    }
  }
  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges()
}

function Eex() {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  var currNode, currTag, parentNode;
  if (currId != "root") {
    currNode = GetElementById(expr_xml, currId);
    if (!currNode) return;
    if (IsGreyColorNode(currNode)) return;
    parentNode = currNode.parentNode;
    currTag = currNode.tagName;
  } else {
    currTag = "";
    parentNode = expr_xml.documentElement;
  }

  if (currTag != "mn") {
    return;
  } else {
    var currText = currNode.childNodes[0].nodeValue;
    if (searchCharacter(currText, "e") != 0) return;

    if (currText == ".") currText = "0";
    var DecimalPointPos = searchCharacter(currText, ".");
    if (searchCharacter(currText, ".") == 0) currText += ".0e";
    else {
      if (DecimalPointPos == currText.length) currText += "0e";
      else currText += "e";
    }
    currNode.childNodes[0].nodeValue = currText;

    var newMn = expr_xml.createElement("mn");
    var newIdMn = expr_xml.createAttribute("id");
    mn_cont++;
    var idMn = "mn_" + mn_cont;
    currId = idMn;
    newIdMn.nodeValue = idMn;
    newMn.setAttributeNode(newIdMn);
    var newColor = expr_xml.createAttribute("color");
    newColor.nodeValue = "#A4A4A4";
    newMn.setAttributeNode(newColor);
    var node_mn;
    if (IsMsupOrMrootSonNode(currNode)) {
      var externalParenthesis = CreateExternalParenthesisNode(currNode);
      node_mn = externalParenthesis.appendChild(newMn);
    } else {
      var NextNode = currNode.nextSibling;
      if (NextNode) {
        node_mn = parentNode.insertBefore(newMn, NextNode);
      }
      else {
        node_mn = parentNode.appendChild(newMn);
      }
    }
    var newText = expr_xml.createTextNode("0");
    var node_text = node_mn.appendChild(newText);
    CursorPos = 1;
  }
  text_screen = xml_Serial.serializeToString(expr_xml);
  InputChanges()
}

function insertText(my_string, ins_string, pos) {
  if (typeof (pos) == "undefined") {
    pos = 0;
  }
  if (typeof (ins_string) == "undefined") {
    ins_string = '';
  }
  return my_string.slice(0, pos) + ins_string + my_string.slice(pos);
}

function RemoveGreyNodes(parentNode) {
  var color_list = new Array();
  var icont = 0;
  var node_list = parentNode.childNodes;
  for (var inode = 0; inode < node_list.length; inode++) {
    if (node_list[inode].getAttribute("color") == "#A4A4A4") {
      color_list[icont] = node_list[inode];
      icont++;
    }
  }
  if (icont != 0) {
    for (var inode = 0; inode < color_list.length; inode++) {
      var node = color_list[inode];
      parentNode.removeChild(node);
    }
  }
}

function IsCorrectId(Id) {
  var node = GetElementById(expr_xml, Id);
  var parentNode = node.parentNode;
  var is_correct_Id = true;

  var color_list = new Array();
  var icont = 0;
  var node_list = parentNode.childNodes;
  for (var inode = 0; inode < node_list.length; inode++) {
    if (node_list[inode].getAttribute("color") == "#A4A4A4") {
      color_list[icont] = node_list[inode];
      icont++;
    }
  }
  if (icont != 0) {
    for (var inode = 0; inode < color_list.length; inode++) {
      var node = color_list[inode];
      parentNode.removeChild(node);
    }
    is_correct_Id = false;
  }
  return is_correct_Id;
}

function IsThereAnyCorrectNode(parentNode) {
  if (!parentNode) return false;
  var node_list = parentNode.childNodes;
  var color_node_cont = 0;
  for (var inode = 0; inode < node_list.length; inode++) {
    if (node_list[inode].getAttribute("color") == "#A4A4A4") {
      color_node_cont++;
    }
  }
  var are_there_correct_node = true;
  if (color_node_cont == node_list.length) are_there_correct_node = false;
  return are_there_correct_node;
}

function IsGreyColorNode(node) {
  if (!node) return false;
  var is_GreyColorNode = false;
  if (node.getAttribute("color") == "#A4A4A4") {
    is_GreyColorNode = true;
  }
  return is_GreyColorNode;
}

function FindFirstCorrectNode(Id) {
  var node = GetElementById(expr_xml, Id);
  var IsExpOfPowORIdxOfRoot = false;
  if (IsExponentOfPower(node) || IsIndexOfRoot(node)) {
    IsExpOfPowORIdxOfRoot = true;
  }
  var parentNode = node.parentNode;
  var correct_node = node;
  if (node.getAttribute("color") == "#A4A4A4") {
    var nextNode = node.nextSibling;
    if (nextNode && !IsMsupOrMrootSonNode(node)) {
      //It is supossed two color nodes at maximum
      if (nextNode.getAttribute("color") == "#A4A4A4") {
        parentNode.removeChild(nextNode);
        correct_node = null;
      } else {
        var nextNodeTag = nextNode.tagName;
        if (nextNodeTag == "mi") {
          var mi_Text = nextNode.childNodes[0].nodeValue;
          if (mi_Text == ",") {
            correct_node = nextNode;
            CursorPos = 0;
          }
        } else if (nextNodeTag == "mo") {
          correct_node = nextNode;
          CursorPos = 0;
        }
      }

    } else {
      correct_node = null;
    }
    var prevNode = node.previousSibling;
    if (prevNode && !IsExpOfPowORIdxOfRoot ) {
      if (prevNode.getAttribute("color") == "#A4A4A4") {
        parentNode.removeChild(prevNode);
      }
    }
    parentNode.removeChild(node);
  }
  return correct_node;
}


function Solve() {
  if (IsVar_DefinitionActive() || IsUDF_DefinitionActive()) return;

  if (isScreenMode) {
    if (currId == "root") return;
    if (expr_xml.querySelectorAll("[color]").length != 0) {
      alert("Only numeric expressions are allowed!!!");
      return "";
    }

    expr_xml_old = expr_xml.cloneNode(true);

    if (UDF_cont != 0) StringfyUserDefinedFunctions();

    if (linsolve_cont != 0 || normalize_cont != 0 || varLabel_list.length != 0 || userDefFunLabel_list.length != 0) {
      if (varLabel_list.length != 0) {
        expr_xml.documentElement = CorrectGreekLetterVar(expr_xml.documentElement);
      }
      ChangeSomeFunctionNames(expr_xml.documentElement);
    }

    if (mtable_cont != 0) InsertMultiplicationOperator(expr_xml.documentElement);

    if (eigv_cont == 0) {
      var result = SolveNode(expr_xml.documentElement);
      if (result.toString() != "") {
        text_screen = InsertResultToXML(result);
        isZoomFrameRequired = true;
      } else {
        expr_xml = expr_xml_old.cloneNode(true);
        return;
      }
    } else {
      var result = EigenSolveNode(expr_xml.documentElement);
      if (result != "") {
        text_screen = EigenValues_MathML_format(result);
      } else {
        return;
      }
    }

    currId = null;
    isScreenMode = false;

    var btnSolve = window.document.getElementById("btnSolve");
    $(btnSolve).html("<strong>EDIT</strong>");

    if (interval_var != 0) CloseInterval();
    Preview.Update();
  } else {
    isScreenMode = true;
    var btnSolve = window.document.getElementById("btnSolve");
    $(btnSolve).html("<strong>SOLVE</strong>");
    var prev_size = expr_xml.documentElement.getAttribute("size");
    expr_xml = expr_xml_old.cloneNode(true);
    expr_xml.documentElement.setAttribute("size", prev_size);
    var parentNode = GetElementById(expr_xml, "root");
    var lastChild = parentNode.lastChild;
    currId = lastChild.getAttribute("id");
    CursorPos = 1;
    text_screen = xml_Serial.serializeToString(expr_xml);
    //InputChanges();

    Preview.SwapBuffers();
    Preview.UpdateCursorPosition();
    Preview.oldtext = text_screen;
    if (interval_var != 0) CloseInterval();
    interval_var = setInterval(myInterval, 500);
  }
}


function ChangeSomeFunctionNames(node) {
  var function_list = node.querySelectorAll("mi");
  for (var i = 0; i < function_list.length; i++) {
    var fun_name = function_list[i].childNodes[0].nodeValue;
    if (IsVarMiNode(function_list[i])) {
      var ivar = varLabel_list.indexOf(fun_name);
      var parentNode = function_list[i].parentNode;
      ReplaceNode_from_VarNode_List(ivar, function_list[i], parentNode);
    } else if (IsUDFMiNode(function_list[i])) {
      ReplaceUDFMiNode(function_list[i]);
    } else {
      if (fun_name == "LinSolve") {
        function_list[i].childNodes[0].nodeValue = "lusolve";
      } else if (fun_name == "normalize") {
        function_list[i].childNodes[0].nodeValue = "norm";
        var NormFunNode = function_list[i];
        var mfencedNode = NormFunNode.parentNode;
        var parentNode = mfencedNode.parentNode;
        var VectorNode = function_list[i].nextSibling.cloneNode(true);
        parentNode.insertBefore(VectorNode, mfencedNode);
        var externalParenthesis = CreateExternalParenthesisNode(VectorNode);
        VectorNode = externalParenthesis.lastChild;
        var OperNode = CreateOperatorNode("×", externalParenthesis, VectorNode);
        var mfencedNode = function_list[i].parentNode;
        var DenNode = mfencedNode.cloneNode(true);
        var NumElem = CreateMnElement("1");
        var MfracNode = CreateMfracNode(NumElem, DenNode, externalParenthesis, OperNode);
        parentNode.removeChild(mfencedNode);
      }
    }
  }
}

function ReplaceUDFMiNode(node) {
  var fun_name = node.childNodes[0].nodeValue;
  var ifun = userDefFunLabel_list.indexOf(fun_name);
  node.childNodes[0].nodeValue = "Gen_UDF";
  parenthesisNode = node.nextSibling;
  paramNodes = parenthesisNode.childNodes;

  firstParamNode = parenthesisNode.firstChild;

  var newNumNode = expr_xml.createElement("mn");
  var fun_name_str = '"' + fun_name + '"';
  var newNum = expr_xml.createTextNode(fun_name_str);
  newNumNode.appendChild(newNum);
  parenthesisNode.insertBefore(newNumNode, firstParamNode);

  var newMiNode = expr_xml.createElement("mi");
  var newComma = expr_xml.createTextNode(",");
  newMiNode.appendChild(newComma);
  parenthesisNode.insertBefore(newMiNode, firstParamNode);
}

function InsertMultiplicationOperator(node) {
  var node_list = node.querySelectorAll("mtable");
  for (var inod = 0; inod < node_list.length; inod++) {
    var node_i = node_list[inod].parentNode;
    var parentNode = node_i.parentNode;
    var prevNode = node_i.previousSibling;
    if (prevNode && !IsComaSeparatorNode(prevNode)) {
      if (prevNode.tagName != "mo") {
        var newElement = expr_xml.createElement("mo");
        var newOper = expr_xml.createTextNode("×");
        newElement.appendChild(newOper);
        parentNode.insertBefore(newElement, node_i);
      }
    }
  }
}

function IsComaSeparatorNode(node) {
  if (!node) return false;
  is_ComaSeparatorNode = false;
  var NodeTag = node.tagName;
  if (NodeTag == "mi") {
    var mi_Text = node.childNodes[0].nodeValue;
    if (mi_Text == ",") {
      is_ComaSeparatorNode = true;
    }
  }
  return is_ComaSeparatorNode;
}

function IsMatrixVarMiLabel(node_mi) {
  if (!node_mi) return false;
  var is_MatrixVarMiLabel = false;
  var fun_name = node_mi.childNodes[0].nodeValue;
  if (IsVarLabel(fun_name)) {
    var ivar = varLabel_list.indexOf(fun_name);
    var typeVar = varType_list[ivar];
    if (typeVar == "matrix") is_MatrixVarMiLabel = true;
  }
  return is_MatrixVarMiLabel;
}

function IsMatrixResultNode(node) {
  if (!node) return false;
  var is_MatrixResultNode = false;
  if (IsMatrixVarMiLabel(node)) {
    is_MatrixResultNode = true;
  }
  else {
    var newNode = node.cloneNode(true);
    var typeNode = FindOutTypeOfNode(newNode);
    if (typeNode == "matrix") is_MatrixResultNode = true;
  }
  return is_MatrixResultNode;
}

function IsVarMiNode(node) {
  if (!node) return false;
  var is_VarMiNode = false;
  var nodeTag = node.tagName;
  if (nodeTag == "mi") {
    funType = node.getAttribute("type");
    if (funType == "var") is_VarMiNode = true;
  }
  return is_VarMiNode;
}

function IsVarOrParamMiNode(node) {
  if (!node) return false;
  is_VarOrParamMiNode = false;
  if (IsVarMiNode(node) || IsParamMiNode(node)) is_VarOrParamMiNode = true;
  return is_VarOrParamMiNode;
}

function IsVarLabel(fun_name) {
  if (varLabel_list.indexOf(fun_name) != -1) return true;
  else return false;
}

function IsUDFMiNode(node) {
  if (!node) return false;
  var is_UDFMiNode = false;
  var nodeTag = node.tagName;
  if (nodeTag == "mi") {
    funType = node.getAttribute("type");
    if (funType == "udf") is_UDFMiNode = true;
  }
  return is_UDFMiNode;
}

function IsThereUDFMiNode(node) {
  if (!node) return false;
  var isThereUDFMiNod = false;
  var UDFMiNode_list = node.querySelectorAll("mi[type=udf]");
  if (UDFMiNode_list.length != 0) {
    isThereUDFMiNod = true;
  }
  return isThereUDFMiNod;
}

function IsUDFLabel(fun_name) {
  if (userDefFunLabel_list.indexOf(fun_name) != -1) return true;
  else return false;
}

function IsParamMiNode(node) {
  if (!node) return false;
  var is_ParamMiNode = false;
  var nodeTag = node.tagName;
  if (nodeTag == "mi") {
    MiType = node.getAttribute("type");
    if (MiType == "param") is_ParamMiNode = true;
  }
  return is_ParamMiNode;
}

function IsParamMnNode(node) {
  if (!node) return false;
  var is_ParamMnNode = false;
  var nodeTag = node.tagName;
  if (nodeTag == "mn") {
    MiType = node.getAttribute("type");
    if (MiType == "param") is_ParamMnNode = true;
  }
  return is_ParamMnNode;
}

function IsParamLabel(param_name) {
  if (curr_UDF != -1) {
    if (userDefFunParamNames[curr_UDF].indexOf(param_name) != -1) return true;
    else return false;
  }
  else return false;
}

function lastChar(str) {
  var last_pos = str.length - 1;
  var last_char = str.substring(last_pos);
  return last_char;
}

function InputChanges() {
  Preview.Update();
  if (interval_var != 0) CloseInterval();
  interval_var = setInterval(myInterval, 500);
}

function ClearAll() {
  isScreenMode = true;

  //Clear xml
  var continuar = true;
  var node_list = expr_xml.documentElement.childNodes;
  var VarOrFunLabelNode;
  if (IsVar_DefinitionActive() || IsUDF_DefinitionActive()) {
    VarOrFunLabelNode = node_list[0];
  }

  do {
    var node = node_list[node_list.length - 1];
    if (node) {
      expr_xml.documentElement.removeChild(node);
    }
  }
  while (node_list.length != 0);

  if (IsVar_DefinitionActive() || IsUDF_DefinitionActive()) {
    expr_xml.documentElement.appendChild(VarOrFunLabelNode);
  }

  mn_cont = 0;
  mo_cont = 0;
  mi_cont = 0;
  mfrac_cont = 0;
  msqrt_cont = 0;
  msup_cont = 0;
  mfenced_cont = 0;
  mtable_cont = 0;
  mtr_cont = 0;
  mtd_cont = 0;
  mroot_cont = 0;
  linsolve_cont = 0;
  eigv_cont = 0;
  normalize_cont = 0;
  parenthesis_cont = 0;
  UDF_cont = 0;
  currId = "root";

  var btnSolve = window.document.getElementById("btnSolve");
  $(btnSolve).html("<strong>SOLVE</strong>");
  if (IsVar_DefinitionActive() || IsUDF_DefinitionActive()) {
    text_screen = xml_Serial.serializeToString(expr_xml);
    currId = node_list[0].getAttribute("id");
    InputChanges();
  } else {
    text_screen = Preview.ClearAll_screen;
    Preview.buffer.innerHTML = Preview.ClearAll_screen;
    Preview.oldtext = Preview.ClearAll_text;
    ScrollLeft_value = 0;
    ScrollTop_value = 0;
    Preview.SwapBuffers();
    ZoomOriginal();
    if (interval_var != 0) CloseInterval();
    interval_var = setInterval(myInterval, 500);
  }
}

function searchCharacter(string, char) {
  var pos = 0;
  for (var ipos = 0; ipos < string.length; ipos++) {
    if (string[ipos] == char) {
      pos = ipos + 1;
      break;
    }
  }
  return pos;
}


function CopyNode() {
  var currNode, parentNode;
  if (isScreenMode) {
    if (currId != "root") {
      currNode = GetElementById(expr_xml, currId);
      if (!currNode) return;
      if (IsGreyColorNode(currNode)) return;
    } else return;
  } else {
    if (eigv_cont != 0) return;
    var parentNode = GetElementById(expr_xml, "root");
    currNode = parentNode.lastChild;
  }

  StoredNode = currNode.cloneNode(true);
}

function InsertNode() {
  if (!isScreenMode) ClearAll();
  isScreenMode = true;
  if (!StoredNode) {
    alert("There is no node stored!!!")
  } else {
    var currNode, parentNode;
    var nextNode = null;
    var IsExpOfPowORIdxOfRoot = false;
    if (currId != "root") {
      currNode = GetElementById(expr_xml, currId);
      parentNode = currNode.parentNode;
      if (IsExponentOfPower(currNode) || IsIndexOfRoot(currNode)) {
        IsExpOfPowORIdxOfRoot = true;
      }
    } else {
      parentNode = expr_xml.documentElement;
    }

    var newNode = StoredNode.cloneNode(true);
    tagName = newNode.tagName;
    if (tagName == "mn") {
      var value = newNode.childNodes[0].nodeValue;
      inputNumber(value);
    } else if (tagName == "mo") {
      var value = newNode.childNodes[0].nodeValue;
      inputOperator(value);
    } else {
      currNode = FindFirstCorrectNode(currId);
      newNode = UpdateIdOfNode(newNode);
      currId = newNode.getAttribute("id");
      if (currNode) {
        if (CursorPos == 0) {
          parentNode.insertBefore(newNode, currNode);
          CursorPos = 1;
        } else {
          if (CursorPos == 1) {
            var NextNode = currNode.nextSibling;
            if (NextNode) {
              parentNode.insertBefore(newNode, NextNode);
            }
            else {
              parentNode.appendChild(newNode);
            }
          } else if (CursorPos == 0.5) {
            if (currNode.tagName = "mn") {
              var textNum = currNode.childNodes[0].nodeValue;
              var firstPart = textNum.substring(0, NumDigitLeft);
              var secondPart = textNum.substring(NumDigitLeft, (NumDigitLeft + NumDigitRight));
              ChangeTextToMnNode(currNode, secondPart);
              var newMn_elem = CreateMnElement(firstPart);
              var newMnNode = parentNode.insertBefore(newMn_elem, currNode);
              parentNode.insertBefore(newNode, currNode);
            }
          }
        }
      } else {
        if (IsMsup(parentNode) || IsMroot((parentNode))) {
          if (IsExpOfPowORIdxOfRoot) parentNode.appendChild(newNode);
          else {
            var lastChild = parentNode.lastChild;
            parentNode.insertBefore(newNode, lastChild);
          }
        } else parentNode.appendChild(newNode);
      }
      text_screen = xml_Serial.serializeToString(expr_xml);
      InputChanges();
    }
  }
}

function UpdateIdOfNode(node) {
  var nodeTag = node.tagName;
  var Selector = "[id^='mn_']";
  var listElements = node.querySelectorAll(Selector);
  for (var i = 0; i < listElements.length; i++) {
    mn_cont++;
    var newId = "mn_" + mn_cont;
    listElements[i].setAttribute("id", newId);
  }

  if (nodeTag == "mo") {
    mo_cont++;
    var newId = "mo_" + mo_cont;
    node.setAttribute("id", newId);
  }
  Selector = "[id^='mo_']";
  listElements = node.querySelectorAll(Selector);
  for (var i = 0; i < listElements.length; i++) {
    mo_cont++;
    var newId = "mo_" + mo_cont;
    listElements[i].setAttribute("id", newId);
  }

  if (nodeTag == "mi") {
    mi_cont++;
    var newId = "mi_" + mi_cont;
    node.setAttribute("id", newId);
  }
  Selector = "[id^='mi_']";
  listElements = node.querySelectorAll(Selector);
  for (var i = 0; i < listElements.length; i++) {
    mi_cont++;
    var newId = "mi_" + mi_cont;
    listElements[i].setAttribute("id", newId);
  }

  if (nodeTag == "mfenced") {
    mfenced_cont++;
    var newId = "mfenced_" + mfenced_cont;
    node.setAttribute("id", newId);
  }
  Selector = "[id^='mfenced_']";
  listElements = node.querySelectorAll(Selector);
  for (var i = 0; i < listElements.length; i++) {
    mfenced_cont++;
    var newId = "mfenced_" + mfenced_cont;
    listElements[i].setAttribute("id", newId);
  }

  if (nodeTag == "msup") {
    msup_cont++;
    var newId = "msup_" + msup_cont;
    node.setAttribute("id", newId);
  }
  Selector = "[id^='msup_']";
  listElements = node.querySelectorAll(Selector);
  for (var i = 0; i < listElements.length; i++) {
    msup_cont++;
    var newId = "msup_" + msup_cont;
    listElements[i].setAttribute("id", newId);
  }

  if (nodeTag == "msqrt") {
    msqrt_cont++;
    var newId = "msqrt_" + msqrt_cont;
    node.setAttribute("id", newId);
  }
  Selector = "[id^='msqrt_']";
  listElements = node.querySelectorAll(Selector);
  for (var i = 0; i < listElements.length; i++) {
    msqrt_cont++;
    var newId = "msqrt_" + msqrt_cont;
    listElements[i].setAttribute("id", newId);
  }

  if (nodeTag == "mroot") {
    mroot_cont++;
    var newId = "mroot_" + mroot_cont;
    node.setAttribute("id", newId);
  }
  Selector = "[id^='mroot_']";
  listElements = node.querySelectorAll(Selector);
  for (var i = 0; i < listElements.length; i++) {
    mroot_cont++;
    var newId = "mroot_" + mroot_cont;
    listElements[i].setAttribute("id", newId);
  }

  Selector = "[id^='mtable_']";
  listElements = node.querySelectorAll(Selector);
  for (var i = 0; i < listElements.length; i++) {
    mtable_cont++;
    var newId = "mtable_" + mtable_cont;
    listElements[i].setAttribute("id", newId);
  }

  return node;
}


function KeyPressFun(event) {
  if (isInputVarActivated || isInputUSFActivated) return;

  var key = event.which || event.keyCode;

  if (key == 42) {
    inputOperator("×");
  } else if (key == 43) {
    var valueText = event.key;
    inputOperator("+");
  } else if (key == 45) {
    inputOperator("-");
  } else if (key == 47) {
    Fraction();
  } else if (key == 46) {
    inputNumber(".");
  }
  else if (key >= 48 && key <= 57) {
    var key_ini = 48;
    var valueNum = key - key_ini;
    var valueText = valueNum.toString();
    inputNumber(valueText);
  }

}

function KeyDownFun(event) {
  if (isInputVarActivated || isInputUSFActivated) return;
  var key = event.which || event.keyCode;

  if (key == 8) {
    Backspace();
  } else if (key == 9) {
    if (event.shiftKey) LeftArrow();
    else RightArrow();
  } else if (key == 13) {
    Solve();
  } else if (key == 37 || key == 38) {
    LeftArrow();
  } else if (key == 39 || key == 40) {
    RightArrow();
  } else if (key == 46) {
    Supr();
  }
  else if (key >= 65 && key <= 90) {
    //Letters chars
    var valueText = event.key;
    inputNumber(valueText);
  }
}


