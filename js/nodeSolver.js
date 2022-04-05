function GiveNodeResult(node) {
  var node_aux = node.cloneNode(true);
  if (IsThereMiParamNodes(node_aux)) {
    node_aux = GiveFicticiousValuesToParamNodes(node_aux);
  }

  var plain_text = remove_tags(node_aux);
  var result;
  try {
    result = math.eval(plain_text);
  }
  catch (err) {
    result = null;
  }
  return result;
}

function GiveFicticiousValuesToParamNodes(node) {
  var root_string = '<math id="root"></math>';
  var parser_aux = new DOMParser();
  var xml_root = parser_aux.parseFromString(root_string, "text/xml");
  var NewNode = xml_root.documentElement;
  NewNode.appendChild(node);
  var nodeMi_list = NewNode.querySelectorAll("mi[type=param]");
  for (var inode = 0; inode < nodeMi_list.length; inode++) {
    var param_type = nodeMi_list[inode].getAttribute("param_type");
    switch (param_type) {
      case "number":
        nodeMi_list[inode].childNodes[0].nodeValue = Math.random();
        break;
      case "vector":
        var vector = new Array(3);
        for (var irow = 0; irow < 3; irow++) {
          vector[irow] = Math.random();
        }
        nodeMi_list[inode] = InsertMatrixNode(xml_root, nodeMi_list[inode], vector);
        break;
      case "matrix":
        var matrix = new Array(3);
        for (var irow = 0; irow < 3; irow++) {
          matrix[irow] = new Array(3);
          for (var icol = 0; icol < 3; icol++) {
            matrix[irow][icol] = 0.0;
          }
          matrix[irow][irow] = Math.random();
        }
        InsertMatrixNode(xml_root, nodeMi_list[inode], matrix);
    }
  }
  return NewNode;
}

function IsThereMiParamNodes(node) {
  var isThereMiParamNodes = false;
  if (IsParamMiNode(node)) {
    //Only one node
    isThereMiParamNodes = true;
  } else {
    if (node.querySelectorAll("mi[type=param]").length != 0) {
      isThereMiParamNodes = true;
    }
  }
  return isThereMiParamNodes;
}


function GiveNodeType(result) {
  if (result) {
    if (!isNaN(result)) {
      return "number";
    } else {
      if (result.im) {
        return "number";
      } else {
        var NumRows = result._data.length;
        for (var irow = 0; irow < NumRows; irow++) {
          if (irow == 0) {
            var NumCols = result._data[irow].length;
            if (NumCols) {
              if (NumCols == 1) {
                return "vector";
              }
              else {
                return "matrix";
              }
            } else return "vector";
          }
        }
      }
    }
  } else {
    return "undefined";
  }
}

function GiveNumRows(result) {
  return result._data.length;
}

function GiveNumCols(result) {
  return result._data[0].length;
}

function SolveNode(node) {
  var xml_corrected = Product_Corrections(node);
  if (xml_corrected == "") return "";

  if (AreThereTrigFunctions(node) && angles_units == "degrees") {
    xml_corrected = ModifyTrigArgument(xml_corrected);
  }
  var plain_text = remove_tags(xml_corrected);

  try {
    var node = math.parse(plain_text);
    var result = node.compile().eval();
  }
  catch (err) {
    //alert("Wrong expression!!!");
    var alert_text = "Wrong expression: " + err.message;
    alert(alert_text);
    return "";
  }
  return result;
}

function EigenSolveNode(parentNode) {
  var childnode_list = parentNode.childNodes;
  if (childnode_list.length > 1) {
    alert("With Eigenvalues analysis other operations are not allowed");
    return "";
  }

  var matrixNode = parentNode.lastChild.lastChild.lastChild;
  var matrixNode_corrected = Product_Corrections(matrixNode);
  if (matrixNode_corrected == "") return "";
  var result_matrix = GiveNodeResult(matrixNode_corrected);
  var result_type = GiveNodeType(result_matrix);
  if (result_type != "matrix") {
    alert("For eigenvalues analysis a matrix as argument is needed!!!")
  }

  var result = numeric.eig(Give_JS_Matrix(result_matrix));
  return result;
}

function MathML_format(result) {
  var salida;
  if (typeof result === 'number') {
    salida = "<math id='root'><mn>" + FormatNumber(result) + "</mn></math>";
  } else if (typeof result === 'object') {
    if (result.im != "0") {
      salida = "<math id='root'>";
      var real_part = result.re;
      var imaginary_part = result.im;
      if (Math.abs(real_part) <= 1.0e-15) real_part = 0.0;
      if (real_part != 0.0) {
        real_part = FormatNumber(real_part);
        salida += "<mn>" + real_part + "</mn>";
        if (imaginary_part >= 0.0) salida += "<mo>+</mo>";
        else {
          imaginary_part = Math.abs(imaginary_part);
          salida += "<mo>-</mo>";
        }
        imaginary_part = FormatNumber(imaginary_part);
        salida += "<mn>" + imaginary_part + "</mn>";
        salida += "<mi>i</mi>";
      } else {
        if (imaginary_part >= 0.0) {
          imaginary_part = FormatNumber(imaginary_part);
          salida += "<mn>" + imaginary_part + "</mn>";
          salida += "<mi>i</mi>";
        } else {
          imaginary_part = Math.abs(imaginary_part);
          imaginary_part = FormatNumber(imaginary_part);
          salida += "<mn>" + "-" + imaginary_part + "</mn>";
          salida += "<mi>i</mi>";
        }
      }
    } else {
      salida = "<math id='root'><mo>[</mo><mtable>";
      var num_rows = result._data.length;
      for (var irow = 0; irow < num_rows; irow++) {
        salida += "<mtr>";
        var num_col = result._data[irow].length;
        if (num_col) {
          for (var icol = 0; icol < num_col; icol++) {
            var value = FormatNumber(result._data[irow][icol]);
            salida += "<mtd columnalign='right'><mn>" + value + "</mn></mtd>";
          }
        } else {
          var value = FormatNumber(result._data[irow]);
          salida += "<mtd columnalign='right'><mn>" + value + "</mn></mtd>";
        }
        salida += "</mtr>";
      }
      salida += "</mtable><mo>]</mo></math>";
    }
  }
  return salida;
}

function InsertResultToXML(result) {
  expr_xml = expr_xml_old.cloneNode(true);
  var parentNode = GetElementById(expr_xml, "root");

  var EqualSign = expr_xml.createElement("mo");
  var newOper = expr_xml.createTextNode("=");
  EqualSign.appendChild(newOper);
  parentNode.appendChild(EqualSign);

  if (typeof result === 'number') {
    var newElement = expr_xml.createElement("mn");
    var value = FormatNumber(result);
    if (Math.abs(value) < numericalZero) value = 0.0;
    var newNum = expr_xml.createTextNode(value);
    newElement.appendChild(newNum);
    var newId = expr_xml.createAttribute("id");
    mn_cont++;
    newId.nodeValue = "mn_" + mn_cont;
    newElement.setAttributeNode(newId);
    parentNode.appendChild(newElement);
  } else if (typeof result === 'object') {
    if (result.im || result.re) {   //if (result.im != "undefined") {
      InsertComplexNumberToXML(result, parentNode);
    } else if (result.units || (result.n && result.d)) {
      var value = result.toString();
      var nextNode = null;
      CreateMnNode(value, parentNode, nextNode);
    }
    else if (result._size) {
      var num_rows = result._data.length;
      var matrix = new Array(num_rows);
      for (var irow = 0; irow < num_rows; irow++) {
        var num_col = result._data[irow].length;
        if (num_col) {
          matrix[irow] = new Array(num_col);
          for (var icol = 0; icol < num_col; icol++) {
            var value = FormatNumber(result._data[irow][icol]);
            if (Math.abs(value) < numericalZero) value = 0.0;
            matrix[irow][icol] = value;
          }
        } else {
          var value = FormatNumber(result._data[irow]);
          if (Math.abs(value) < numericalZero) value = 0.0;
          matrix[irow] = value;
        }
      }
      CreateMatrixNode(parentNode, matrix);
    }
  }
  var salida = xml_Serial.serializeToString(expr_xml);
  return salida;
}

function InsertComplexNumberToXML(result, parentNode) {
  var real_part = result.re;
  var imaginary_part = result.im;
  if (Math.abs(real_part) <= numericalZero) real_part = 0.0;
  if (real_part != 0.0) {
    real_part = FormatNumber(real_part);
    var newElementNumReal = expr_xml.createElement("mn");
    var newNumReal = expr_xml.createTextNode(real_part);
    newElementNumReal.appendChild(newNumReal);
    parentNode.appendChild(newElementNumReal);
    var newElementOper = expr_xml.createElement("mo");
    if (imaginary_part != 0) {
      if (imaginary_part > 0.0) {
        var newOper = expr_xml.createTextNode("+");
        newElementOper.appendChild(newOper);
        parentNode.appendChild(newElementOper);
      } else {
        imaginary_part = Math.abs(imaginary_part);
        var newOper = expr_xml.createTextNode("-");
        newElementOper.appendChild(newOper);
        parentNode.appendChild(newElementOper);
      }
    }
    if (Math.abs(imaginary_part) <= numericalZero) imaginary_part = 0.0;
    imaginary_part = FormatNumber(imaginary_part);
    if (!(imaginary_part == "1" || imaginary_part == "0")) {
      var newElementNumImag = expr_xml.createElement("mn");
      var newNumImag = expr_xml.createTextNode(imaginary_part);
      newElementNumImag.appendChild(newNumImag);
      parentNode.appendChild(newElementNumImag);
    }

    if (imaginary_part != "0") {
      var newMi = expr_xml.createElement("mi");
      var node_mi = parentNode.appendChild(newMi);
      var newText = expr_xml.createTextNode("i");
      var node_text = node_mi.appendChild(newText);
    }
  } else {
    if (Math.abs(imaginary_part) <= numericalZero) imaginary_part = 0.0;
    imaginary_part = FormatNumber(imaginary_part);
    if (!(imaginary_part == "1" || imaginary_part == "0")) {
      var newElementNumImag = expr_xml.createElement("mn");
      if (imaginary_part == "-1") imaginary_part = "-"
      var newNumImag = expr_xml.createTextNode(imaginary_part);
      newElementNumImag.appendChild(newNumImag);
      parentNode.appendChild(newElementNumImag);
    }

    if (imaginary_part != "0") {
      var newMi = expr_xml.createElement("mi");
      var node_mi = parentNode.appendChild(newMi);
      var newText = expr_xml.createTextNode("i");
      var node_text = node_mi.appendChild(newText);
    }
  }
}

function EigenValues_MathML_format(result) {
  var salida;
  salida = "<math id='root'>"
  salida += "<mn mathvariant='bold'>A·x</mn>";
  salida += "<mn>=&lambda;</mn>";
  salida += "<mn mathvariant='bold'>x</mn>";
  salida += "<mo>&nbsp;&rArr;&nbsp;</mo>";

  var num_rows = result.lambda.x.length;
  salida += "<mo>[</mo>"
  salida += "<mtable>";
  for (var irow = 0; irow < num_rows; irow++) {
    salida += "<mtr>";
    salida += "<mtd>";
    salida += "<msub><mn>&lambda;</mn><mn>" + (irow + 1) + "</mn></msub>";
    salida += "</mtd>";
    salida += "</mtr>";
  }
  salida += "</mtable>";
  salida += "<mo>]</mo>";

  salida += "<mn>=</mn>";

  salida += "<mo>[</mo>"
  salida += "<mtable>";
  for (var irow = 0; irow < num_rows; irow++) {
    salida += "<mtr>";
    salida += "<mtd columnalign='right'>";
    var real_part = result.lambda.x[irow];
    if (Math.abs(real_part) <= 1.0e-15) real_part = 0.0;
    real_part = FormatNumber(real_part);
    salida += "<mn>" + real_part + "</mn>";
    if (typeof result.lambda.y != "undefined") {
      var imaginary_part = result.lambda.y[irow];
      if (imaginary_part >= 0.0) salida += "<mo>+</mo>";
      else {
        imaginary_part = Math.abs(imaginary_part);
        salida += "<mo>-</mo>";
      }
      imaginary_part = FormatNumber(imaginary_part);
      salida += "<mn>" + imaginary_part + "</mn>";
      salida += "<mi>i</mi>";
    }
    salida += "</mtd>";
    salida += "</mtr>";
  }
  salida += "</mtable>";
  salida += "<mo>]</mo>";

  salida += "<mo>, &nbsp; &nbsp;</mo>";

  salida += "<mo>[</mo>"
  salida += "<mtable>";
  salida += "<mtr>";
  salida += "<mtd><msub><mn mathvariant='bold'>x</mn><mn>1</mn></msub></mtd>";
  salida += "<mtd><msub><mn mathvariant='bold'>x</mn><mn>2</mn></msub></mtd>";
  salida += "<mtd><mn>&hellip;</mn></mtd>";
  salida += "<mtd><msub><mn mathvariant='bold'>x</mn><mn>n</mn></msub></mtd>";
  salida += "</mtr>";
  salida += "</mtable>";
  salida += "<mo>]</mo>";
  salida += "<mn>=</mn>";

  salida += "<mo>[</mo><mtable>";
  for (var irow = 0; irow < num_rows; irow++) {
    salida += "<mtr>";
    for (var icol = 0; icol < num_rows; icol++) {
      salida += "<mtd columnalign='right'>";
      var real_part = (result.E.x[irow][icol]).toFixed(4);
      salida += "<mn>" + real_part + "</mn>";
      if (typeof result.E.y != "undefined") {
        var imaginary_part = (result.E.y[irow][icol]).toFixed(4);
        if (imaginary_part >= 0.0) salida += "<mo>+</mo>";
        else {
          imaginary_part = Math.abs(imaginary_part);
          salida += "<mo>-</mo>";
        }
        salida += "<mn>" + imaginary_part + "</mn>";
        salida += "<mi>i</mi>";
      }
      salida += "</mtd>";
    }
    salida += "</mtr>";
  }
  salida += "</mtable><mo>]</mo>";

  salida += "</math>";
  return salida;
}

Math.trunc = Math.trunc || function (x) {
  if (isNaN(x)) {
    return NaN;
  }
  if (x > 0) {
    return Math.floor(x);
  }
  return Math.ceil(x);
};

function FormatNumber(num) {
  var num_formatted;
  if (num_format_type == "decimals_fixed") {
    num_formatted = num.toFixed(num_decimals);
  } else if (num_format_type == "exponential") {
    num_formatted = num.toExponential(num_decimals);
  } else if (num_format_type == "automatic") {
    var log_num = 0;
    if (num == 1 || num == 0) num_formatted = num;
    else {
      //log_num = Math.log10(Math.abs(num));
      log_num = math.log(Math.abs(num), 10);
      if (log_num < 0) {
        var potencia = Math.trunc(Math.abs(log_num));
        fact_digits = Math.pow(10.0, (potencia + num_decimals));
        num_formatted = Math.round(num * fact_digits) / fact_digits;
      } else num_formatted = num;
    }
    var precision;
    if (log_num < 0) precision = num_decimals + 1;
    else {
      var entire_part_length = Math.trunc(num).toString().length;
      if (num < 0) entire_part_length--;
      if (entire_part_length <= exp_max) precision = entire_part_length + num_decimals;
      else precision = num_decimals + 1;
    }
    num_formatted = math.format(num_formatted, { lowerExp: exp_min, upperExp: exp_max, precision: precision });
  }
  return num_formatted;
}


//Return the amount of time that operator apear
function IsThereThisOperator(node, operator) {
  var node_list_mo = node.querySelectorAll("mo");
  var is_there = false;
  for (var inode = 0; inode < node_list_mo.length; inode++) {
    currNode = node_list_mo[inode];
    var currOper = currNode.childNodes[0].nodeValue;
    if (currOper == operator) {
      is_there = true;
      return is_there;
    }
  }
  return is_there;
}


function NextNodeWithOperator(node, operator) {
  var node_list_mo = node.querySelectorAll("mo");
  var node_operator = null;
  for (var inode = 0; inode < node_list_mo.length; inode++) {
    currNode = node_list_mo[inode];
    var currOper = currNode.childNodes[0].nodeValue;
    if (currOper == operator) {
      node_operator = currNode;
      return node_operator;
    }
  }
  return node_operator;
}

function CreateProdFunction(prevNode, nextNode, operNode) {
  var parentNode = prevNode.parentNode;

  var newMfencedExt = expr_xml.createElement("mfenced");
  mfenced_cont++;
  var newOpenExt = expr_xml.createAttribute("open");
  newOpenExt.nodeValue = "(";
  newMfencedExt.setAttributeNode(newOpenExt);
  var newCloseExt = expr_xml.createAttribute("close");
  newCloseExt.nodeValue = ")";
  newMfencedExt.setAttributeNode(newCloseExt);
  var newIdMfencedExt = expr_xml.createAttribute("id");
  var idMfencedExt = "mfenced_" + mfenced_cont;
  newIdMfencedExt.nodeValue = idMfenced;
  newMfencedExt.setAttributeNode(newIdMfencedExt);
  var newSeparatorExt = expr_xml.createAttribute("separators");
  newSeparatorExt.nodeValue = "";
  newMfencedExt.setAttributeNode(newSeparatorExt);

  var node_fenced_ext = parentNode.insertBefore(newMfencedExt, prevNode);

  var prodSymbol = currNode.childNodes[0].nodeValue;
  var iprod = prodSymbol_list.indexOf(prodSymbol);
  if (iprod == -1) return;

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

  var funName = prodFunction_list[iprod];
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

  var firstNode = prevNode.cloneNode(true);
  var node_First = node_fenced_int.appendChild(firstNode);


  var newComa = expr_xml.createElement("mi");
  var node_Coma = node_fenced_int.appendChild(newComa);
  var Coma_text = expr_xml.createTextNode(",");
  var node_text_Coma = node_Coma.appendChild(Coma_text);
  var newTypeComa = expr_xml.createAttribute("type");
  var MiType = "coma";
  newTypeComa.nodeValue = MiType;
  newComa.setAttributeNode(newTypeComa);
  var node_Coma = node_fenced_int.appendChild(newComa);

  var secondNode = nextNode.cloneNode(true);
  var node_Second = node_fenced_int.appendChild(secondNode);

  return parentNode;
}

function Product_Corrections(parent_node) {

  //Cross Product
  while (IsThereThisOperator(parent_node, "∧")) {
    var node_operator = NextNodeWithOperator(parent_node, "∧");
    var node_prev = node_operator.previousSibling;
    var node_next = node_operator.nextSibling;

    var currParentNode = CreateProdFunction(node_prev, node_next, node_operator);
    currParentNode.removeChild(node_prev);
    currParentNode.removeChild(node_operator);
    currParentNode.removeChild(node_next);
  }

  //Tensor Product
  while (IsThereThisOperator(parent_node, "⊗")) {
    var node_operator = NextNodeWithOperator(parent_node, "⊗");
    var node_prev = node_operator.previousSibling;
    var node_next = node_operator.nextSibling;

    var currParentNode = CreateProdFunction(node_prev, node_next, node_operator);
    currParentNode.removeChild(node_prev);
    currParentNode.removeChild(node_operator);
    currParentNode.removeChild(node_next);
  }

  //Double Contraction or double scalar product
  while (IsThereThisOperator(parent_node, ":")) {
    var node_operator = NextNodeWithOperator(parent_node, ":");
    var node_prev = node_operator.previousSibling;
    var node_next = node_operator.nextSibling;

    var currParentNode = CreateProdFunction(node_prev, node_next, node_operator);
    currParentNode.removeChild(node_prev);
    currParentNode.removeChild(node_operator);
    currParentNode.removeChild(node_next);
  }

  //Scalar product
  while (IsThereThisOperator(parent_node, "⋅")) {
    var node_operator = NextNodeWithOperator(parent_node, "⋅");
    node_operator.childNodes[0].nodeValue = "*";
  }

  //Matrix Multiplication or scalar multiplication
  while (IsThereThisOperator(parent_node, "×")) {
    var node_operator = NextNodeWithOperator(parent_node, "×");
    node_operator.childNodes[0].nodeValue = "*";
  }

  return parent_node;
}


function CrossProduct(a, b) {
  var result = new Array(3);
  for (var i = 0; i < 3; i++) {
    result[i] = new Array(1);
  }
  result[0][0] = a._data[1] * b._data[2] - a._data[2] * b._data[1];
  result[1][0] = a._data[2] * b._data[0] - a._data[0] * b._data[2];
  result[2][0] = a._data[0] * b._data[1] - a._data[1] * b._data[0];
  return result;
}

function TensorProduct(a, b) {
  var NumRows = a._data.length;
  var NumCols = b._data.length;
  if (a._data[0].length != undefined || b._data[0].length != undefined) {
    throw new TypeError("Tensor product needs two vectors.");
  }
  var result_array = new Array(NumRows);
  for (var irow = 0; irow < NumRows; irow++) {
    result_array[irow] = new Array(NumCols);
    for (var icol = 0; icol < NumCols; icol++) {
      result_array[irow][icol] = a._data[irow] * b._data[icol];
    }
  }
  var result = math.matrix(result_array);
  return result;
}


function ScalarProduct(a, b) {
  var NumRows = a._data.length;
  var result = 0;
  for (var irow = 0; irow < NumRows; irow++) {
    result += a._data[irow] * b._data[irow];
  }
  return result;
}


function DoubleContraction(A, B) {
  var NumRows_A = A._data.length;
  var NumCols_A = A._data[0].length;
  var NumRows_B = B._data.length;
  var NumCols_B = B._data[0].length;
  if ((NumRows_A != NumRows_B) || (NumCols_A != NumCols_B) || (NumCols_A == undefined) || (NumCols_B == undefined)) {
    throw new TypeError("Double scalar product needs matrices of the same dimension.");
  }
  var result = 0;
  for (var irow = 0; irow < NumRows_A; irow++) {
    for (var icol = 0; icol < NumCols_A; icol++) {
      result += A._data[irow][icol] * B._data[irow][icol];
    }
  }
  return result;
}


//This function give a JS matrix from math.js result
function Give_JS_Matrix(matrix) {
  var NumRows = matrix._data.length;
  var JS_matrix = new Array(NumRows);
  var NumCols = matrix._data.length;
  var result = 0;
  for (var irow = 0; irow < NumRows; irow++) {
    JS_matrix[irow] = new Array(NumCols);
    for (var icol = 0; icol < NumCols; icol++) {
      JS_matrix[irow][icol] = matrix._data[irow][icol];
    }
  }
  return JS_matrix
}


function CreateMatrixNode(parentNode, matrix) {
  var newMfenced = expr_xml.createElement("mfenced");
  var newOpen = expr_xml.createAttribute("open");
  newOpen.nodeValue = "[";
  newMfenced.setAttributeNode(newOpen);
  var newClose = expr_xml.createAttribute("close");
  newClose.nodeValue = "]";
  newMfenced.setAttributeNode(newClose);

  var matrix_node = parentNode.appendChild(newMfenced);
  var newTable = expr_xml.createElement("mtable");
  var node_table = matrix_node.appendChild(newTable);

  for (var irow = 1; irow <= matrix.length; irow++) {
    var newMtr = expr_xml.createElement("mtr");
    var node_mtr = node_table.appendChild(newMtr);
    if (typeof (matrix[irow - 1]) == "object") {
      Mat_cols = matrix[irow - 1].length;
    } else Mat_cols = 1;
    for (var icol = 1; icol <= Mat_cols; icol++) {
      var newMtd = expr_xml.createElement("mtd");;
      var newColumnAlign = expr_xml.createAttribute("columnalign");
      newColumnAlign.nodeValue = "right";
      newMtd.setAttributeNode(newColumnAlign);
      var node_mtd = node_mtr.appendChild(newMtd);
      var value;
      if (typeof (matrix[irow - 1]) == "object") {
        value = matrix[irow - 1][icol - 1];
      } else {
        value = matrix[irow - 1];
      }
      if (typeof value == "number") value = value.toString();
      if (value.indexOf("i") == -1) {
        var newMn = expr_xml.createElement("mn");
        var node_mn = node_mtd.appendChild(newMn);
        var newText = expr_xml.createTextNode(value);
        var node_text = node_mn.appendChild(newText);
        var newId = expr_xml.createAttribute("id");
        mn_cont++;
        newId.nodeValue = "mn_" + mn_cont;
        node_mn.setAttributeNode(newId)
      } else {
        var complex_number = math.complex(value);
        InsertComplexNumberToXML(complex_number, node_mtd);
      }
    }
  }

  return matrix_node;
}

function InsertMatrixNode(xml_root, prevNode, matrix) {
  var parentNode = prevNode.parentNode;
  var newMfenced = xml_root.createElement("mfenced");
  var newOpen = xml_root.createAttribute("open");
  newOpen.nodeValue = "[";
  newMfenced.setAttributeNode(newOpen);
  var newClose = xml_root.createAttribute("close");
  newClose.nodeValue = "]";
  newMfenced.setAttributeNode(newClose);

  var matrix_node = parentNode.insertBefore(newMfenced, prevNode);
  parentNode.removeChild(prevNode);

  var newTable = xml_root.createElement("mtable");
  var node_table = matrix_node.appendChild(newTable);

  for (var irow = 1; irow <= matrix.length; irow++) {
    var newMtr = xml_root.createElement("mtr");
    var node_mtr = node_table.appendChild(newMtr);
    if (typeof (matrix[irow - 1]) == "object") {
      Mat_cols = matrix[irow - 1].length;
    } else Mat_cols = 1;
    for (var icol = 1; icol <= Mat_cols; icol++) {
      var newMtd = xml_root.createElement("mtd");;
      var node_mtd = node_mtr.appendChild(newMtd);
      var newMn = xml_root.createElement("mn");
      var node_mn = node_mtd.appendChild(newMn);
      var value;
      if (typeof (matrix[irow - 1]) == "object") {
        value = matrix[irow - 1][icol - 1];
      } else {
        value = matrix[irow - 1];
      }
      var newText = xml_root.createTextNode(value);
      var node_text = node_mn.appendChild(newText);
    }
  }
}


function CreateNumNode(parentNode, value) {
  var newMn = expr_xml.createElement("mn");
  var node_mn = parentNode.appendChild(newMn);
  var newText = expr_xml.createTextNode(value);
  var node_text = node_mn.appendChild(newText);
  return node_mn;
}

function AreThereTrigFunctions(node) {
  var areThereTrigFun = false;
  var function_list = node.querySelectorAll("mi");
  for (var i = 0; i < function_list.length; i++) {
    var fun_name = function_list[i].childNodes[0].nodeValue
    switch (fun_name) {
      case "sin":
      case "cos":
      case "tan":
      case "asin":
      case "acos":
      case "atan":
        areThereTrigFun = true;
        break;
    }
    if (areThereTrigFun) break;
  }
  return areThereTrigFun;
}

function ModifyTrigArgument(node) {
  var function_list = node.querySelectorAll("mi");
  var trig_list = new Array();
  for (var i = 0; i < function_list.length; i++) {
    var fun_name = function_list[i].childNodes[0].nodeValue
    switch (fun_name) {
      case "sin":
      case "cos":
      case "tan":
      case "asin":
      case "acos":
      case "atan":
        trig_list.push(function_list[i]);
        break;
    }
  }

  var FactDegrees = Math.PI / 180.0;
  for (var i = 0; i < trig_list.length; i++) {
    var fun_name = trig_list[i].childNodes[0].nodeValue;
    switch (fun_name) {
      case "sin":
      case "cos":
      case "tan":
        var nextNode = trig_list[i].nextSibling;
        var child = nextNode.lastChild;
        var newElement = expr_xml.createElement("mn");
        var value = FactDegrees + "*";
        var newNum = expr_xml.createTextNode(value);
        newElement.appendChild(newNum);
        nextNode.insertBefore(newElement, child);
        break;
      case "asin":
      case "acos":
      case "atan":
        var ParentNode = trig_list[i].parentNode;
        var newElement = expr_xml.createElement("mn");
        var value = (1.0 / FactDegrees) + "*";
        var newNum = expr_xml.createTextNode(value);
        newElement.appendChild(newNum);
        ParentNode.insertBefore(newElement, trig_list[i]);
        break;
    }
  }
  return node;
}


function remove_tags(node) {
  var result = "";
  var nodes = node.childNodes;
  var tagName = node.tagName;

  if (!nodes.length) {
    if (node.nodeValue.indexOf("π") != -1) {
      result = node.nodeValue.replace("π", "pi");
    } else if (node.nodeValue == " ") result = "";
    else result = node.nodeValue;
  } else if (tagName == "mfrac") {
    result = "(" + remove_tags(nodes[0]) + "/" + remove_tags(nodes[1]) + ")";
  } else if (tagName == "msup") {
    if (nodes[0].tagName == "mrow" || nodes[0].tagName == "mfenced") {
      if (nodes[1].childNodes[0].nodeValue == "T") {
        result = "transpose(" + remove_tags(nodes[0]) + ")";
      } else if (nodes[1].childNodes[0].nodeValue == "-1") {
        result = "inv(" + remove_tags(nodes[0]) + ")";
      } else {
        result = "(" + remove_tags(nodes[0]) + ")^(" + remove_tags(nodes[1]) + ")";
      }
    } else {
      result = "(" + remove_tags(nodes[0]) + ")^(" + remove_tags(nodes[1]) + ")";
    }
  } else if (tagName == "mroot") {
    result = "(" + remove_tags(nodes[0]) + ")^(1/" + remove_tags(nodes[1]) + ")";
  } else if (tagName == "mfenced") {
    var sepOpen = node.getAttribute("open");
    if (sepOpen == "") sepOpen = "("
    var sepClose = node.getAttribute("close");
    if (sepClose == "") sepClose = ")"
    result += sepOpen;
    for (var inode = 0; inode < nodes.length; inode++) {
      result += remove_tags(nodes[inode]);
    }
    result += sepClose;
  } else if (tagName == "mtable") {
    for (var i = 0; i < nodes.length; ++i) {
      result += remove_tags(nodes[i]);
      if (i < (nodes.length - 1)) result += ",";
    }
  } else if (tagName == "mtr") {
    //result = "["
    //for (var i = 0; i < nodes.length; ++i) {
    //    result += remove_tags(nodes[i]);
    //    if (i < (nodes.length - 1)) result += ",";
    //}
    //result += "]"

    if (nodes.length == 1) { //Vector case
      result = "";
      for (var i = 0; i < nodes.length; ++i) {
        result += remove_tags(nodes[i]);
      }
    } else {
      result = "["
      for (var i = 0; i < nodes.length; ++i) {
        result += remove_tags(nodes[i]);
        if (i < (nodes.length - 1)) result += ",";
      }
      result += "]"
    }
  } else for (var i = 0; i < nodes.length; ++i) {
    result += remove_tags(nodes[i]);
  }

  //if (tagName == "mfenced") result = "(" + result + ")";
  if (tagName == "msqrt") result = "(" + result + ")^(0.5)";

  return result;
}

function FindOutTypeOfNode(node) {
  var NodeType = "undefined";
  if (eigv_cont != 0) return NodeType;

  if (IsThereUDFMiNode(node)) {
    NodeType = "number";
  } else {
    var newNode = node.cloneNode(true);
    ChangeSomeFunctionNames(newNode);
    var result = SolveNode(newNode);
    if (typeof result === 'number') {
      NodeType = "number";
    } else if (typeof result === 'object') {
      if (result.im) NodeType = "number";
      else NodeType = "matrix";
    }
  }
  return NodeType;
}

function StringfyUserDefinedFunctions() {
  userDefFunExpr_list = [];
  for (var ifun = 0; ifun < userDefFunNode_list.length; ifun++) {
    var UserDefFun = userDefFunNode_list[ifun].cloneNode(true);
    ChangeSomeFunctionNames(UserDefFun);
    InsertMultiplicationOperator(UserDefFun);
    var xml_corrected = Product_Corrections(UserDefFun);
    if (xml_corrected == "") {
      alert("Error in Product Corrections")
    }

    if (AreThereTrigFunctions(UserDefFun) && angles_units == "degrees") {
      xml_corrected = ModifyTrigArgument(xml_corrected);
    }
    var plain_text = remove_tags(xml_corrected);
    userDefFunExpr_list[userDefFunExpr_list.length] = plain_text;
  }
}


function Gen_UDF(fun_Name) {
  var ifun = userDefFunLabel_list.indexOf(fun_Name);
  if (ifun == -1) {
    alert("Error: Function name unknown!!!");
  }
  var scope = {};
  for (var iparam = 1; iparam <= arguments.length; iparam++) {
    var ipos = iparam - 1;
    var key = userDefFunParamNames[ifun][ipos];
    scope[key] = arguments[iparam];
  }

  var node = math.parse(userDefFunExpr_list[ifun]);
  var result = node.compile().eval(scope);
  return result;
}
