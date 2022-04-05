var Preview={delay:10,preview:null,buffer:null,timeout:null,mjRunning:!1,mjPending:!1,oldText:null,heightCursor:0,ClearAll_screen:null,ClearAll_text:null,ScrollActivated:!1,OldId:"",Init:function(){this.preview=document.getElementById("screen"),this.buffer=document.getElementById("buffer"),text_screen=xml_Serial.serializeToString(expr_xml),InputChanges()},SwapBuffers:function(){var e=this.preview,t=this.buffer;this.buffer=e,this.preview=t,e.style.display="none",e.style.visibility="hidden",t.style.display="inline-block",t.style.visibility="visible",t.scrollLeft=ScrollLeft_value,t.scrollTop=ScrollTop_value},Update:function(){this.timeout&&clearTimeout(this.timeout),this.timeout=setTimeout(this.callback,this.delay)},CreatePreview:function(){if(Preview.timeout=null,!this.mjPending){var e=text_screen;e!==this.oldtext?this.mjRunning?(this.mjPending=!0,MathJax.Hub.Queue(["CreatePreview",this])):(this.buffer.innerHTML=this.oldtext=e,this.mjRunning=!0,MathJax.Hub.Queue(["Typeset",MathJax.Hub,this.buffer],["PreviewDone",this],["ZoomFrame",this],["UpdateCursorPosition",this])):this.UpdateCursorPosition()}},PreviewDone:function(){this.mjRunning=this.mjPending=!1,this.SwapBuffers()},ZoomFrame:function(){if(isZoomFrameRequired){var e=this.preview,t=e.querySelectorAll(".MathJax_SVG"),r=$(t).css("width"),i=parseFloat(r.slice(0,r.length-2)),l=$(t).css("height"),o=parseFloat(l.slice(0,l.length-2)),s=$(e).css("width"),n=Math.round(parseFloat(s.slice(0,s.length-2))),a=$(e).css("height"),u=Math.round(parseFloat(a.slice(0,a.length-2))),d=Math.min(n/i,u/o);if(d<=1){var c=$(t[0]).css("font-size"),h=parseFloat(c.slice(0,c.length-2)),f=$("#bodyCalculator").css("font-size"),g=h/parseFloat(f.slice(0,f.length-2))*d*.95*100+"%";$(t[0]).css("font-size",g)}isZoomFrameRequired=!1}},UpdateCursorPosition:function(){if(isScreenMode&&currId)if(currId&&"root"!=currId){0!=interval_var&&CloseInterval();var e=this.preview,t="g#"+currId;if(MJ_Node=e.querySelectorAll(t),0==MJ_Node.length)return;var r=MJ_Node[0].getBoundingClientRect(),i=r.left,l=r.top,o=document.getElementById("mathjax-cursor"),s=MJ_Node[0].getBoundingClientRect().width,n=GetElementById(expr_xml,currId);if(0==CursorPos){var a=$(MJ_Node).css("padding-left");s=parseFloat(a.slice(0,a.length-2))}if(.5==CursorPos){NumText=n.childNodes[0].nodeValue;var u=MJ_Node[0].childNodes,d=MJ_Node[0].getBoundingClientRect().x;s=.5*(u[NumDigitLeft-1].getBoundingClientRect().x+u[NumDigitLeft-1].getBoundingClientRect().width+u[NumDigitLeft].getBoundingClientRect().x)-d}var c=MJ_Node[0].getBoundingClientRect().height,h=UpdateCursorSize(),f=Math.round(i+s),g=n.tagName,v=0;0==CursorPos?(v=-2,"mfenced"==g&&"["==n.getAttribute("open")&&"]"==n.getAttribute("close")&&(v=-5)):1==CursorPos&&(v=2,"mfenced"==g&&"["==n.getAttribute("open")&&"]"==n.getAttribute("close")&&(v=5)),f+=v;var p=Math.round(l+.5*c-.5*h),m=Math.round(l+.5*c+.5*h),C=e.querySelectorAll("svg#root"),_=$(C).css("width"),M=parseFloat(_.slice(0,_.length-2));M+=$(C).offset().left;$(C).height();$(C).offset().top;var I=$(e).css("width"),N=Math.round(parseFloat(I.slice(0,I.length-2))),x=$(e).height(),y=$(e).offset().left,b=$(e).offset().top,A=y+N;0!=e.scrollTop&&(A-=10);var S,w,P=b+x;if(0!=e.scrollLeft&&(P-=10),IsFunctionArgumentNode(n)){parentNode=n.parentNode,parentNode=parentNode.parentNode;var B="g#"+parentNode.getAttribute("id");MJ_Node_ext=e.querySelectorAll(B);var J=MJ_Node[0].getBoundingClientRect(),R=J.left,F=(J.top,MJ_Node_ext[0].getBoundingClientRect().width);S=Math.round(R+F),w=Math.round(R)}else if(S=f,w=i,IsGreyColorNode(n)){var L=n.previousSibling;if(L&&IsGreyColorNode(L)){var T="g#"+L.getAttribute("id");e.querySelectorAll(T);w=MJ_Node[0].getBoundingClientRect().left}}if(M+15>=N&&(f+15>=A&&(currId!=this.OldId||currId.search("mn"),this.ScrollActivated||(e.scrollLeft+=Math.round(S-A+15))),w<0&&currId!=this.OldId&&(N<S-w||(e.scrollLeft+=Math.round(w-15),e.scrollLeft<=50&&(e.scrollLeft=0)))),y<=f&&f<=A&&b<=m&&p<=P){if(o.style.left=f+"px",p<b){var j=(h=m-(p=b))+"px";$(".mathjax-cursor").css("height",j)}if(P<=m){j=(h=(m=P)-p)+"px";$(".mathjax-cursor").css("height",j)}o.style.top=p+"px",interval_var=setInterval(myInterval,500)}this.OldId=currId}else"root"==currId&&(CursorPos=1,InitialCursor(),0!=interval_var&&CloseInterval(),interval_var=setInterval(myInterval,500),this.ClearAll_screen||(this.ClearAll_screen=buffer.innerHTML,this.ClearAll_text=text_screen))},ScrollControl:function(){if(isScreenMode&&currId){var e;e="visible"==$("#screen").css("visibility")?document.getElementById("screen"):document.getElementById("buffer");var t="g#"+currId;if(MJ_Node=e.querySelectorAll(t),0!=MJ_Node.length){0!=interval_var&&CloseInterval();var r=MJ_Node[0].getBoundingClientRect(),i=r.left,l=r.top,o=MJ_Node[0].getBoundingClientRect().width,s=$(MJ_Node).height(),n=UpdateCursorSize();0==CursorPos&&(o=0);var a=Math.round(i+o),u=GetElementById(expr_xml,currId),d=u.tagName,c=0;0==CursorPos?(c=-2,"mfenced"==d&&"["==u.getAttribute("open")&&"]"==u.getAttribute("close")&&(c=-5)):1==CursorPos&&(c=2,"mfenced"==d&&"["==u.getAttribute("open")&&"]"==u.getAttribute("close")&&(c=5)),a+=c;var h=Math.round(l+.5*s-.5*n),f=Math.round(l+.5*s+.5*n),g=$(e).css("width"),v=Math.round(parseFloat(g.slice(0,g.length-2))),p=$(e).height(),m=$(e).offset().left,C=$(e).offset().top,_=m+v;0!=e.scrollTop&&(_-=10);var M=C+p;0!=e.scrollLeft&&(M-=10),this.ScrollActivated=!0,m<=a&&a<=_&&C<=f&&h<=M&&Preview.UpdateCursorPosition(),ScrollLeft_value=e.scrollLeft,ScrollTop_value=e.scrollTop,this.ScrollActivated=!1}}}};