function GiveNodeResult(e){var t=e.cloneNode(!0);IsThereMiParamNodes(t)&&(t=GiveFicticiousValuesToParamNodes(t));var r,a=remove_tags(t);try{r=math.eval(a)}catch(e){r=null}return r}function GiveFicticiousValuesToParamNodes(e){var t=(new DOMParser).parseFromString('<math id="root"></math>',"text/xml"),r=t.documentElement;r.appendChild(e);for(var a=r.querySelectorAll("mi[type=param]"),n=0;n<a.length;n++){switch(a[n].getAttribute("param_type")){case"number":a[n].childNodes[0].nodeValue=Math.random();break;case"vector":for(var o=new Array(3),m=0;m<3;m++)o[m]=Math.random();a[n]=InsertMatrixNode(t,a[n],o);break;case"matrix":var i=new Array(3);for(m=0;m<3;m++){i[m]=new Array(3);for(var l=0;l<3;l++)i[m][l]=0;i[m][m]=Math.random()}InsertMatrixNode(t,a[n],i)}}return r}function IsThereMiParamNodes(e){var t=!1;return IsParamMiNode(e)?t=!0:0!=e.querySelectorAll("mi[type=param]").length&&(t=!0),t}function GiveNodeType(e){if(!e)return"undefined";if(!isNaN(e))return"number";if(e.im)return"number";for(var t=e._data.length,r=0;r<t;r++)if(0==r){var a=e._data[r].length;return a?1==a?"vector":"matrix":"vector"}}function GiveNumRows(e){return e._data.length}function GiveNumCols(e){return e._data[0].length}function SolveNode(e){var t=Product_Corrections(e);if(""==t)return"";AreThereTrigFunctions(e)&&"degrees"==angles_units&&(t=ModifyTrigArgument(t));var r=remove_tags(t);try{var a=(e=math.parse(r)).compile().eval()}catch(e){var n="Wrong expression: "+e.message;return alert(n),""}return a}function EigenSolveNode(e){if(e.childNodes.length>1)return alert("With Eigenvalues analysis other operations are not allowed"),"";var t=Product_Corrections(e.lastChild.lastChild.lastChild);if(""==t)return"";var r=GiveNodeResult(t);return"matrix"!=GiveNodeType(r)&&alert("For eigenvalues analysis a matrix as argument is needed!!!"),numeric.eig(Give_JS_Matrix(r))}function MathML_format(e){var t;if("number"==typeof e)t="<math id='root'><mn>"+FormatNumber(e)+"</mn></math>";else if("object"==typeof e)if("0"!=e.im){t="<math id='root'>";var r=e.re,a=e.im;Math.abs(r)<=1e-15&&(r=0),0!=r?(t+="<mn>"+(r=FormatNumber(r))+"</mn>",a>=0?t+="<mo>+</mo>":(a=Math.abs(a),t+="<mo>-</mo>"),t+="<mn>"+(a=FormatNumber(a))+"</mn>",t+="<mi>i</mi>"):a>=0?(t+="<mn>"+(a=FormatNumber(a))+"</mn>",t+="<mi>i</mi>"):(t+="<mn>-"+(a=FormatNumber(a=Math.abs(a)))+"</mn>",t+="<mi>i</mi>")}else{t="<math id='root'><mo>[</mo><mtable>";for(var n=e._data.length,o=0;o<n;o++){t+="<mtr>";var m=e._data[o].length;if(m)for(var i=0;i<m;i++){t+="<mtd columnalign='right'><mn>"+FormatNumber(e._data[o][i])+"</mn></mtd>"}else t+="<mtd columnalign='right'><mn>"+FormatNumber(e._data[o])+"</mn></mtd>";t+="</mtr>"}t+="</mtable><mo>]</mo></math>"}return t}function InsertResultToXML(e){expr_xml=expr_xml_old.cloneNode(!0);var t=GetElementById(expr_xml,"root"),r=expr_xml.createElement("mo"),a=expr_xml.createTextNode("=");if(r.appendChild(a),t.appendChild(r),"number"==typeof e){var n=expr_xml.createElement("mn"),o=FormatNumber(e);Math.abs(o)<numericalZero&&(o=0);var m=expr_xml.createTextNode(o);n.appendChild(m);var i=expr_xml.createAttribute("id");mn_cont++,i.nodeValue="mn_"+mn_cont,n.setAttributeNode(i),t.appendChild(n)}else if("object"==typeof e)if(e.im||e.re)InsertComplexNumberToXML(e,t);else if(e.units||e.n&&e.d){o=e.toString();CreateMnNode(o,t,null)}else if(e._size){for(var l=e._data.length,d=new Array(l),u=0;u<l;u++){var s=e._data[u].length;if(s){d[u]=new Array(s);for(var c=0;c<s;c++){o=FormatNumber(e._data[u][c]);Math.abs(o)<numericalZero&&(o=0),d[u][c]=o}}else{o=FormatNumber(e._data[u]);Math.abs(o)<numericalZero&&(o=0),d[u]=o}}CreateMatrixNode(t,d)}return xml_Serial.serializeToString(expr_xml)}function InsertComplexNumberToXML(e,t){var r=e.re,a=e.im;if(Math.abs(r)<=numericalZero&&(r=0),0!=r){r=FormatNumber(r);var n=expr_xml.createElement("mn"),o=expr_xml.createTextNode(r);n.appendChild(o),t.appendChild(n);var m=expr_xml.createElement("mo");if(0!=a)if(a>0){var i=expr_xml.createTextNode("+");m.appendChild(i),t.appendChild(m)}else{a=Math.abs(a);i=expr_xml.createTextNode("-");m.appendChild(i),t.appendChild(m)}if(Math.abs(a)<=numericalZero&&(a=0),"1"!=(a=FormatNumber(a))&&"0"!=a){var l=expr_xml.createElement("mn"),d=expr_xml.createTextNode(a);l.appendChild(d),t.appendChild(l)}if("0"!=a){var u=expr_xml.createElement("mi"),s=t.appendChild(u),c=expr_xml.createTextNode("i");s.appendChild(c)}}else{if(Math.abs(a)<=numericalZero&&(a=0),"1"!=(a=FormatNumber(a))&&"0"!=a){l=expr_xml.createElement("mn");"-1"==a&&(a="-");d=expr_xml.createTextNode(a);l.appendChild(d),t.appendChild(l)}if("0"!=a)u=expr_xml.createElement("mi"),s=t.appendChild(u),c=expr_xml.createTextNode("i"),s.appendChild(c)}}function EigenValues_MathML_format(e){var t;t="<math id='root'>",t+="<mn mathvariant='bold'>A·x</mn>",t+="<mn>=&lambda;</mn>",t+="<mn mathvariant='bold'>x</mn>",t+="<mo>&nbsp;&rArr;&nbsp;</mo>";var r=e.lambda.x.length;t+="<mo>[</mo>",t+="<mtable>";for(var a=0;a<r;a++)t+="<mtr>",t+="<mtd>",t+="<msub><mn>&lambda;</mn><mn>"+(a+1)+"</mn></msub>",t+="</mtd>",t+="</mtr>";t+="</mtable>",t+="<mo>]</mo>",t+="<mn>=</mn>",t+="<mo>[</mo>",t+="<mtable>";for(a=0;a<r;a++){t+="<mtr>",t+="<mtd columnalign='right'>";var n=e.lambda.x[a];if(Math.abs(n)<=1e-15&&(n=0),t+="<mn>"+(n=FormatNumber(n))+"</mn>",void 0!==e.lambda.y)(m=e.lambda.y[a])>=0?t+="<mo>+</mo>":(m=Math.abs(m),t+="<mo>-</mo>"),t+="<mn>"+(m=FormatNumber(m))+"</mn>",t+="<mi>i</mi>";t+="</mtd>",t+="</mtr>"}t+="</mtable>",t+="<mo>]</mo>",t+="<mo>, &nbsp; &nbsp;</mo>",t+="<mo>[</mo>",t+="<mtable>",t+="<mtr>",t+="<mtd><msub><mn mathvariant='bold'>x</mn><mn>1</mn></msub></mtd>",t+="<mtd><msub><mn mathvariant='bold'>x</mn><mn>2</mn></msub></mtd>",t+="<mtd><mn>&hellip;</mn></mtd>",t+="<mtd><msub><mn mathvariant='bold'>x</mn><mn>n</mn></msub></mtd>",t+="</mtr>",t+="</mtable>",t+="<mo>]</mo>",t+="<mn>=</mn>",t+="<mo>[</mo><mtable>";for(a=0;a<r;a++){t+="<mtr>";for(var o=0;o<r;o++){var m;if(t+="<mtd columnalign='right'>",t+="<mn>"+(n=e.E.x[a][o].toFixed(4))+"</mn>",void 0!==e.E.y)(m=e.E.y[a][o].toFixed(4))>=0?t+="<mo>+</mo>":(m=Math.abs(m),t+="<mo>-</mo>"),t+="<mn>"+m+"</mn>",t+="<mi>i</mi>";t+="</mtd>"}t+="</mtr>"}return t+="</mtable><mo>]</mo>",t+="</math>"}function FormatNumber(e){var t;if("decimals_fixed"==num_format_type)t=e.toFixed(num_decimals);else if("exponential"==num_format_type)t=e.toExponential(num_decimals);else if("automatic"==num_format_type){var r,a=0;if(1==e||0==e)t=e;else if((a=math.log(Math.abs(e),10))<0){var n=Math.trunc(Math.abs(a));fact_digits=Math.pow(10,n+num_decimals),t=Math.round(e*fact_digits)/fact_digits}else t=e;if(a<0)r=num_decimals+1;else{var o=Math.trunc(e).toString().length;e<0&&o--,r=o<=exp_max?o+num_decimals:num_decimals+1}t=math.format(t,{lowerExp:exp_min,upperExp:exp_max,precision:r})}return t}function IsThereThisOperator(e,t){for(var r=e.querySelectorAll("mo"),a=!1,n=0;n<r.length;n++){if(currNode=r[n],currNode.childNodes[0].nodeValue==t)return a=!0}return a}function NextNodeWithOperator(e,t){for(var r=e.querySelectorAll("mo"),a=null,n=0;n<r.length;n++){if(currNode=r[n],currNode.childNodes[0].nodeValue==t)return a=currNode}return a}function CreateProdFunction(e,t,r){var a=e.parentNode,n=expr_xml.createElement("mfenced");mfenced_cont++;var o=expr_xml.createAttribute("open");o.nodeValue="(",n.setAttributeNode(o);var m=expr_xml.createAttribute("close");m.nodeValue=")",n.setAttributeNode(m);var i=expr_xml.createAttribute("id");mfenced_cont;i.nodeValue=A,n.setAttributeNode(i);var l=expr_xml.createAttribute("separators");l.nodeValue="",n.setAttributeNode(l);var d=a.insertBefore(n,e),u=currNode.childNodes[0].nodeValue,s=prodSymbol_list.indexOf(u);if(-1!=s){var c=expr_xml.createElement("mi"),p=expr_xml.createAttribute("id");mi_cont++;var h="mi_"+mi_cont;p.nodeValue=h,c.setAttributeNode(p);var x=expr_xml.createAttribute("type");x.nodeValue="lib",c.setAttributeNode(x);var _=d.appendChild(c),f=prodFunction_list[s],v=expr_xml.createTextNode(f),b=(_.appendChild(v),expr_xml.createElement("mfenced"));mfenced_cont++;var N=expr_xml.createAttribute("open");N.nodeValue="(",b.setAttributeNode(N);var g=expr_xml.createAttribute("close");g.nodeValue=")",b.setAttributeNode(g);var C=expr_xml.createAttribute("id"),A="mfenced_"+mfenced_cont;C.nodeValue=A,b.setAttributeNode(C);var M=expr_xml.createAttribute("separators");M.nodeValue="",b.setAttributeNode(M);var y=d.appendChild(b),T=e.cloneNode(!0),F=(y.appendChild(T),expr_xml.createElement("mi")),E=y.appendChild(F),V=expr_xml.createTextNode(","),S=(E.appendChild(V),expr_xml.createAttribute("type"));S.nodeValue="coma",F.setAttributeNode(S);E=y.appendChild(F);var w=t.cloneNode(!0);y.appendChild(w);return a}}function Product_Corrections(e){for(;IsThereThisOperator(e,"∧");){(a=CreateProdFunction(t=(n=NextNodeWithOperator(e,"∧")).previousSibling,r=n.nextSibling,n)).removeChild(t),a.removeChild(n),a.removeChild(r)}for(;IsThereThisOperator(e,"⊗");){(a=CreateProdFunction(t=(n=NextNodeWithOperator(e,"⊗")).previousSibling,r=n.nextSibling,n)).removeChild(t),a.removeChild(n),a.removeChild(r)}for(;IsThereThisOperator(e,":");){var t,r,a;(a=CreateProdFunction(t=(n=NextNodeWithOperator(e,":")).previousSibling,r=n.nextSibling,n)).removeChild(t),a.removeChild(n),a.removeChild(r)}for(;IsThereThisOperator(e,"⋅");){(n=NextNodeWithOperator(e,"⋅")).childNodes[0].nodeValue="*"}for(;IsThereThisOperator(e,"×");){var n;(n=NextNodeWithOperator(e,"×")).childNodes[0].nodeValue="*"}return e}function CrossProduct(e,t){for(var r=new Array(3),a=0;a<3;a++)r[a]=new Array(1);return r[0][0]=e._data[1]*t._data[2]-e._data[2]*t._data[1],r[1][0]=e._data[2]*t._data[0]-e._data[0]*t._data[2],r[2][0]=e._data[0]*t._data[1]-e._data[1]*t._data[0],r}function TensorProduct(e,t){var r=e._data.length,a=t._data.length;if(null!=e._data[0].length||null!=t._data[0].length)throw new TypeError("Tensor product needs two vectors.");for(var n=new Array(r),o=0;o<r;o++){n[o]=new Array(a);for(var m=0;m<a;m++)n[o][m]=e._data[o]*t._data[m]}return math.matrix(n)}function ScalarProduct(e,t){for(var r=e._data.length,a=0,n=0;n<r;n++)a+=e._data[n]*t._data[n];return a}function DoubleContraction(e,t){var r=e._data.length,a=e._data[0].length,n=t._data.length,o=t._data[0].length;if(r!=n||a!=o||null==a||null==o)throw new TypeError("Double scalar product needs matrices of the same dimension.");for(var m=0,i=0;i<r;i++)for(var l=0;l<a;l++)m+=e._data[i][l]*t._data[i][l];return m}function Give_JS_Matrix(e){for(var t=e._data.length,r=new Array(t),a=e._data.length,n=0;n<t;n++){r[n]=new Array(a);for(var o=0;o<a;o++)r[n][o]=e._data[n][o]}return r}function CreateMatrixNode(e,t){var r=expr_xml.createElement("mfenced"),a=expr_xml.createAttribute("open");a.nodeValue="[",r.setAttributeNode(a);var n=expr_xml.createAttribute("close");n.nodeValue="]",r.setAttributeNode(n);for(var o=e.appendChild(r),m=expr_xml.createElement("mtable"),i=o.appendChild(m),l=1;l<=t.length;l++){var d=expr_xml.createElement("mtr"),u=i.appendChild(d);"object"==typeof t[l-1]?Mat_cols=t[l-1].length:Mat_cols=1;for(var s=1;s<=Mat_cols;s++){var c=expr_xml.createElement("mtd"),p=expr_xml.createAttribute("columnalign");p.nodeValue="right",c.setAttributeNode(p);var h,x=u.appendChild(c);if("number"==typeof(h="object"==typeof t[l-1]?t[l-1][s-1]:t[l-1])&&(h=h.toString()),-1==h.indexOf("i")){var _=expr_xml.createElement("mn"),f=x.appendChild(_),v=expr_xml.createTextNode(h),b=(f.appendChild(v),expr_xml.createAttribute("id"));mn_cont++,b.nodeValue="mn_"+mn_cont,f.setAttributeNode(b)}else{InsertComplexNumberToXML(math.complex(h),x)}}}return o}function InsertMatrixNode(e,t,r){var a=t.parentNode,n=e.createElement("mfenced"),o=e.createAttribute("open");o.nodeValue="[",n.setAttributeNode(o);var m=e.createAttribute("close");m.nodeValue="]",n.setAttributeNode(m);var i=a.insertBefore(n,t);a.removeChild(t);for(var l=e.createElement("mtable"),d=i.appendChild(l),u=1;u<=r.length;u++){var s=e.createElement("mtr"),c=d.appendChild(s);"object"==typeof r[u-1]?Mat_cols=r[u-1].length:Mat_cols=1;for(var p=1;p<=Mat_cols;p++){var h,x=e.createElement("mtd"),_=c.appendChild(x),f=e.createElement("mn"),v=_.appendChild(f);h="object"==typeof r[u-1]?r[u-1][p-1]:r[u-1];var b=e.createTextNode(h);v.appendChild(b)}}}function CreateNumNode(e,t){var r=expr_xml.createElement("mn"),a=e.appendChild(r),n=expr_xml.createTextNode(t);a.appendChild(n);return a}function AreThereTrigFunctions(e){for(var t=!1,r=e.querySelectorAll("mi"),a=0;a<r.length;a++){switch(r[a].childNodes[0].nodeValue){case"sin":case"cos":case"tan":case"asin":case"acos":case"atan":t=!0}if(t)break}return t}function ModifyTrigArgument(e){for(var t=e.querySelectorAll("mi"),r=new Array,a=0;a<t.length;a++){switch(t[a].childNodes[0].nodeValue){case"sin":case"cos":case"tan":case"asin":case"acos":case"atan":r.push(t[a])}}var n=Math.PI/180;for(a=0;a<r.length;a++){switch(r[a].childNodes[0].nodeValue){case"sin":case"cos":case"tan":var o=r[a].nextSibling,m=o.lastChild,i=expr_xml.createElement("mn"),l=n+"*",d=expr_xml.createTextNode(l);i.appendChild(d),o.insertBefore(i,m);break;case"asin":case"acos":case"atan":var u=r[a].parentNode;i=expr_xml.createElement("mn"),l=1/n+"*",d=expr_xml.createTextNode(l);i.appendChild(d),u.insertBefore(i,r[a])}}return e}function remove_tags(e){var t="",r=e.childNodes,a=e.tagName;if(r.length)if("mfrac"==a)t="("+remove_tags(r[0])+"/"+remove_tags(r[1])+")";else if("msup"==a)t="mrow"==r[0].tagName||"mfenced"==r[0].tagName?"T"==r[1].childNodes[0].nodeValue?"transpose("+remove_tags(r[0])+")":"-1"==r[1].childNodes[0].nodeValue?"inv("+remove_tags(r[0])+")":"("+remove_tags(r[0])+")^("+remove_tags(r[1])+")":"("+remove_tags(r[0])+")^("+remove_tags(r[1])+")";else if("mroot"==a)t="("+remove_tags(r[0])+")^(1/"+remove_tags(r[1])+")";else if("mfenced"==a){var n=e.getAttribute("open");""==n&&(n="(");var o=e.getAttribute("close");""==o&&(o=")"),t+=n;for(var m=0;m<r.length;m++)t+=remove_tags(r[m]);t+=o}else if("mtable"==a)for(var i=0;i<r.length;++i)t+=remove_tags(r[i]),i<r.length-1&&(t+=",");else if("mtr"==a)if(1==r.length){t="";for(i=0;i<r.length;++i)t+=remove_tags(r[i])}else{t="[";for(i=0;i<r.length;++i)t+=remove_tags(r[i]),i<r.length-1&&(t+=",");t+="]"}else for(i=0;i<r.length;++i)t+=remove_tags(r[i]);else t=-1!=e.nodeValue.indexOf("π")?e.nodeValue.replace("π","pi"):" "==e.nodeValue?"":e.nodeValue;return"msqrt"==a&&(t="("+t+")^(0.5)"),t}function FindOutTypeOfNode(e){var t="undefined";if(0!=eigv_cont)return t;if(IsThereUDFMiNode(e))t="number";else{var r=e.cloneNode(!0);ChangeSomeFunctionNames(r);var a=SolveNode(r);"number"==typeof a?t="number":"object"==typeof a&&(t=a.im?"number":"matrix")}return t}function StringfyUserDefinedFunctions(){userDefFunExpr_list=[];for(var e=0;e<userDefFunNode_list.length;e++){var t=userDefFunNode_list[e].cloneNode(!0);ChangeSomeFunctionNames(t),InsertMultiplicationOperator(t);var r=Product_Corrections(t);""==r&&alert("Error in Product Corrections"),AreThereTrigFunctions(t)&&"degrees"==angles_units&&(r=ModifyTrigArgument(r));var a=remove_tags(r);userDefFunExpr_list[userDefFunExpr_list.length]=a}}function Gen_UDF(e){var t=userDefFunLabel_list.indexOf(e);-1==t&&alert("Error: Function name unknown!!!");for(var r={},a=1;a<=arguments.length;a++){var n=a-1;r[userDefFunParamNames[t][n]]=arguments[a]}return math.parse(userDefFunExpr_list[t]).compile().eval(r)}Math.trunc=Math.trunc||function(e){return isNaN(e)?NaN:e>0?Math.floor(e):Math.ceil(e)};