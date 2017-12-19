sap.ui.define(["sap/suite/ui/commons/library","jquery.sap.global","sap/ui/core/Control","./SvgBase","./Node","./Line","./Group","./layout/LayeredLayout","./Tooltip","sap/ui/core/Popup","sap/ui/model/json/JSONModel","sap/m/SuggestionItem","./Utils","sap/m/ButtonType","sap/m/Label","sap/m/OverflowToolbar","sap/m/OverflowToolbarButton","sap/m/SearchField","sap/m/ToolbarSpacer","sap/ui/core/CustomData","sap/ui/model/Filter","./KeyboardNavigator"],function(l,q,C,S,N,L,G,c,T,P,J,d,U,B,e,O,f,g,h,j,F,K){var k=l.networkgraph.Orientation;var A="nodes",m="lines",n="groups";var Z=[0.05,0.1,0.25,0.33,0.50,0.67,0.75,0.80,0.90,1,1.1,1.25,1.5,1.75,2,2.5,3,4,5],D=9,o=0.4,p=100000;var r={Group:"group",Node:"node",Line:"line",IsLastKey:"islast",TypeKey:"type"};var s=Object.freeze({Node:"Node",Line:"Line"});var R=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");var t=0,M=100;var u=d.extend("sap.suite.ui.commons.networkgraph.LimitedSuggestionItem",{render:function(a,i,b,w){if(t++<M){d.prototype.render.call(this,a,i,b,w);}}});var v=S.extend("sap.suite.ui.commons.networkgraph.Graph",{metadata:{library:"sap.suite.ui.commons",properties:{height:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:"100%"},width:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:"100%"},orientation:{type:"sap.suite.ui.commons.networkgraph.Orientation",group:"Behavior",defaultValue:k.LeftRight},backgroundImage:{type:"sap.ui.core.URI",group:"Appearance",defaultValue:null}},aggregations:{lines:{type:"sap.suite.ui.commons.networkgraph.Line",multiple:true,singularName:"line"},nodes:{type:"sap.suite.ui.commons.networkgraph.Node",multiple:true,singularName:"node"},groups:{type:"sap.suite.ui.commons.networkgraph.Group",multiple:true,singularName:"group"},legend:{type:"sap.ui.core.Control",multiple:false},layoutAlgorithm:{type:"sap.suite.ui.commons.networkgraph.layout.LayoutAlgorithm",multiple:false}},associations:{ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},events:{graphReady:{},afterLayouting:{},beforeLayouting:{},zoomChanged:{},failure:{parameters:{type:"String",message:"String"}},selectionChange:{parameters:{items:{type:"sap.suite.ui.commons.networkgraph.ElementBase[]"}}}}}});v.FAILURE_TYPE={INCONSISTENT_MODEL:"Inconsistent model",LAYOUT_FAILURE:"Layout failure"};v.prototype.ZOOM_100_INDEX=D;v.prototype.init=function(){this._fZoomRatio=1;this._fZoomRatioIndex=D;this._mSelectedNodes={};this._mSelectedLines={};this._bIsLayedOut=false;this._bIsFullScreen=false;this._mNodes={};this._bNeedNodeProcessing=true;this._oFullScreenContainer=null;this._bRequiresDataProcessing=true;this._oPanning={};this._oLegendLabels={};this._iRunningLayouts=0;this._oLastLayout=null;this._bIsRtl=sap.ui.getCore().getConfiguration().getRTL();this._oFocus=null;this._tooltip=this._createTooltip();this._createToolbar();};v.prototype.onBeforeRendering=function(){this._bIsRtl=sap.ui.getCore().getConfiguration().getRTL();this.setBusy(false);this.setBusyIndicatorDelay(0);this._loadData();};v.prototype.onAfterRendering=function(){var H="",a=this._bIsRtl?"direction="+"\"rtl\"":"",b="<rect class=\"sapSuiteFlickerFreeRect\" x=\"0\" y=\"0\" height=\"500\" width=\"500\"></rect>";this.$scroller=this.$("scroller");this.$legend=this.$("legend");if(this.getNodes().length>0){this.setBusy(true);}else{this.fireGraphReady();}if(this._isDelayedLayouting()){this.getNodes().forEach(function(i){i._setupWidthAndHeight();i.setX(0);i.setY(0);H+=i._render({sizeDetermination:i._useAutomaticSize()});});this.$scroller.html("<svg "+a+" class=\"sapSuiteUiCommonsNetworkGraphSvg\">"+H+b+"</svg>");setTimeout(function(){this.getNodes().forEach(function(i){i._applyMaxWidth();i._createMultilineTitle();});this._preprocessData();}.bind(this),0);}};v.prototype._beforeRender=function(){this.fireEvent("afterLayouting");};v.prototype._fireFailure=function(a,b){this.fireFailure([a.toString(),b]);q.sap.log.warning("Graph failure: "+a+": "+b);};v.prototype.destroyAllElements=function(){this.destroyAggregation(A,false);this.destroyAggregation(n,false);this.destroyAggregation(m,false);};v.prototype.deselect=function(b){var i=[],$=this.$(),a=function(E){Object.keys(E).forEach(function(w){i.push(E[w]);E[w].setSelected(false);},this);}.bind(this);$.find("."+this.HIGHLIGHT_CLASS).removeClass(this.HIGHLIGHT_CLASS);$.find("."+this.SELECT_CLASS).removeClass(this.SELECT_CLASS);$.find("."+this.VISIBLE_ACTIONS_BUTTONS_CLASS).removeClass(this.VISIBLE_ACTIONS_BUTTONS_CLASS);a(this._mSelectedNodes);a(this._mSelectedLines);if(!b&&i.length){this.fireSelectionChange({items:i});}return i;};v.prototype.getFocus=function(){return this._oFocus;};v.prototype.getToolbar=function(){return this._toolbar;};v.prototype.getNodeByKey=function(a){if(this._bRequiresDataProcessing){this._processData();}return this._mNodes[a];};v.prototype.setCustomLegendLabel=function(a){var b=a.isNode!==false?s.Node:s.Line;if(a.status){this._oLegendLabels[b+a.status]=a.label;this._createLegend();}};v.prototype.getCorrectMousePosition=function(a){var b=this.$svg.offset(),i=1,w=1;if(this._iWidth!==this.$svg.width()||this._iHeight!==this.$svg.height()){i=this._iWidth/this.$svg.width();w=this._iHeight/this.$svg.height();}return{x:parseInt((a.x-b.left)*i,10),y:parseInt((a.y-b.top)*w,10)};};v.prototype._createTooltip=function(){var a=new T(this.getId()+"-tooltip");this.addDependent(a);a.create(this);a.attachEvent("afterClose",function(){this.setFocus(this.getFocus());}.bind(this));return a;};v.prototype.defocus=function(){this.$().find("."+this.FOCUS_CLASS).removeClass(this.FOCUS_CLASS);};v.prototype.setFocus=function(a){var i;this.defocus();if(a&&a.item instanceof L){a.button=null;}if(a){if(a.button){if(a.item instanceof N){i=a.item._aActionButtons.indexOf(a.button);if(i>-1){a.item._setActionButtonFocus(a.button,true);}}else if(a.item instanceof G){if(a.button===G.BUTTONS.MENU){a.item._setMenuButtonFocus(true);}else if(a.button===G.BUTTONS.COLLAPSE){a.item._setCollapseButtonFocus(true);}}}else if(a.item){a.item._setFocus(true);}}this._oFocus=a;this._updateAccessibility(a);};v.prototype._updateAccessibility=function(a){var i,b=function(){this._setAccessibilityTitle(R.getText("NETWORK_GRAPH_ACCESSIBILITY_CONTENT"));}.bind(this),w=function(x){return R.getText("NETWORK_GRAPH_ACCESSIBILITY_ACTION_BUTTON")+" "+x;};if(a){if(a.button){if(a.item instanceof N){i=a.item._aActionButtons.indexOf(a.button);if(i>-1){this._setAccessibilityTitle(a.item._getActionButtonTitle(a.button));}else{b();}}else if(a.item instanceof G){if(a.button===G.BUTTONS.MENU){this._setAccessibilityTitle(w(R.getText("NETWORK_GRAPH_GROUP_DETAIL")));}else if(a.button===G.BUTTONS.COLLAPSE){this._setAccessibilityTitle(w(R.getText("NETWORK_GRAPH_EXPAND_COLLAPSE")));}else{b();}}else{b();}}else if(a.item){this._setAccessibilityTitle(a.item._getAccessibilityLabel());}}else{b();}};v.prototype._processProperties=function(){if(this._bNeedNodeProcessing){this._mSelectedNodes={};this._mSelectedLines={};this.getNodes().forEach(function(a){if(a.getSelected()){this._mSelectedNodes[a.getKey()]=a;}if(a.getCollapsed()){a.setCollapsed(true);}},this);this.getLines().forEach(function(a){if(a.getSelected()){this._mSelectedLines[a._getLineId()]=a;}},this);this._bNeedNodeProcessing=false;}};v.prototype._loadData=function(){if(this.getNodes().length>0){if(!this._isDelayedLayouting()){q.sap.delayedCall(0,this,this._preprocessData);}}};v.prototype._preprocessData=function(){this._bIsLayedOut=false;this._bImageLoaded=false;this.fireBeforeLayouting();if(!this._processData()){return;}this._applyLayout().then(this._render.bind(this)).catch(function(a){q.sap.log.error("Error when processing data.",a);});};v.prototype._getAllElements=function(){return this.getNodes().concat(this.getGroups());};v.prototype._render=function(){this._beforeRender();this._iRunningLayouts--;if(this._iRunningLayouts>0){return;}this._oLastLayout=null;this._createSearchSuggestItems();this._innerRender();this._createLegend();this._processProperties();if(this._fZoomRatio!==1){this.$svg[0].setAttribute("viewBox","0 0 "+this.$svg.width()+" "+this.$svg.height());this.$svg.width(this.$svg.width()*this._fZoomRatio);this.$svg.height(this.$svg.height()*this._fZoomRatio);}if(this._selectElementAfterScroll){this._scrollToElement(this._selectElementAfterScroll);this._selectElementAfterScroll=null;}this._bIsLayedOut=true;this._setupEvents();this._setupKeyboardNavigation();if(!this.getBackgroundImage()||this._bImageLoaded){this.setBusy(false);this.fireGraphReady();}};v.prototype._innerRender=function(a){var b=function(I){var Q="";I.forEach(function(V){Q+=V._render();V.bOutput=true;});return Q;};var i=function(){this.$svg.find(".sapSuiteFlickerFreeRect").remove();this._bImageLoaded=true;if(this._bIsLayedOut){this.setBusy(false);this.fireGraphReady();}}.bind(this);var w=120,x=function(){var I=0,Q=0;this._iWidth=0;this._iHeight=0;this._getAllElements().forEach(function(W){if(Q<W._iHeight+W.getY()){Q=W._iHeight+W.getY();}if(I<W._iWidth+W.getX()){I=W._iWidth+W.getX();}},this);if(this.getBackgroundImage()){var V=new Image();V.onload=function(){this._iWidth=Math.max(this._iWidth,V.width);this._iHeight=Math.max(this._iHeight,V.height);this.$svg.width(this._iWidth);this.$svg.height(this._iHeight);this.$svg.css("background-image","url("+this.getBackgroundImage()+")");this.$svg.css("background-size","cover");i();}.bind(this);V.onerror=function(){q.sap.log.warning("Unable to load background image.");i();};V.src=this.getBackgroundImage();}this._iWidth=I+w;this._iHeight=Q+w;this.$svg.width(this._iWidth);this.$svg.height(this._iHeight);}.bind(this);var y=function(I){I.forEach(function(Q){Q.forEach(function(V){V._afterRendering();});});};var z=this.getNodes(),E=this.getLines(),H=this.getGroups();q.sap.measure.start(this.getId(),"Rendering of a network graph");this.$scroller.html(this._renderSvg(b(z),b(E),b(H)));this.$svg=this.$("networkGraphSvg");x();y([z,E,H]);q.sap.measure.end(this.getId());};v.prototype._renderSvg=function(a,b,i){var H="",w="sapSuiteUiCommonsNetworkGraphSvg sapSuiteUiCommonsNetworkGraphNoSelect "+(this._fZoomRatio<o?" sapSuiteUiCommonsNetworkGraphZoomedOut ":"");H+="<svg id=\""+this.getId()+"-networkGraphSvg\"";if(this._bIsRtl){H+="direction="+"\"rtl\"";}H+=" class=\""+w+"\" preserveAspectRatio=\"none\" ";H+=">";H+="<g id=\""+this.getId()+"-eventwrapper\"><rect class=\"sapSuiteUiCommonsNetworkGraphEventWrapper\" width=\"100%\" height=\"100%\"/></g>";H+="<g id=\""+this.getId()+"-svgbody\">";H+="<g class=\"sapSuiteUiCommonsNetworkGroupEventWrapper\"></g>";H+="<g id=\""+this._getDomId("groups")+"\">";H+=i?i:"";H+="</g>";H+="<g id=\""+this._getDomId("lines")+"\" class=\"sapSuiteUiCommonsNetworkLines\">";H+=b?b:"";H+="</g>";H+="<g id=\""+this._getDomId("nodes")+"\" class=\"sapSuiteUiCommonsNetworkNodes\">";H+=a?a:"";H+="</g>";H+="</g>";if(this.getBackgroundImage()){H+="<rect class=\"sapSuiteFlickerFreeRect\" x=\"0\" y=\"0\" height=\"100%\" width=\"100%\"></rect>";}H+="</svg>";return H;};v.prototype._isProperKey=function(a){return a||(a==="0");};v.prototype._processData=function(){var a=function(){var I=0;this.mGroups={};return this.getGroups().some(function(w){var x=w.getKey();if(!this._isProperKey(x)){this._fireFailure(v.FAILURE_TYPE.INCONSISTENT_MODEL,"Group without a proper key [index: "+I+"] found.");return true;}w._resetSize();w._clearChildren();if(this.mGroups[x]){this._fireFailure(v.FAILURE_TYPE.INCONSISTENT_MODEL,"Group with a duplicit key "+x+" found.");return true;}this.mGroups[x]=w;I++;return false;},this);}.bind(this);var b=function(){var I=0;this._mNodes={};return this.getNodes().some(function(w){if(!this._isProperKey(w.getKey())){this._fireFailure(v.FAILURE_TYPE.INCONSISTENT_MODEL,"Node without a proper ID [index: "+I+"] found.");return true;}var x=w.getGroup(),y;w._oGroup=null;if(x){y=this.mGroups[x];if(y){w._oGroup=y;y.aNodes.push(w);}else{this._fireFailure(v.FAILURE_TYPE.INCONSISTENT_MODEL,"Node belonging to a nonexistent group with key "+x+" found.");return true;}}w._setupWidthAndHeight();w._clearChildren();w._rendered=false;if(this._mNodes[w.getKey()]){this._fireFailure(v.FAILURE_TYPE.INCONSISTENT_MODEL,"Node with a duplicit key "+w.getKey()+" found.");return true;}this._mNodes[w.getKey()]=w;I++;return false;},this);}.bind(this);var i=function(){return this.getLines().some(function(w,I){var x=this.getNodeByKey(w.getFrom()),y=this.getNodeByKey(w.getTo());if(!x){this._fireFailure(v.FAILURE_TYPE.INCONSISTENT_MODEL,"Line going from a nonexistent node with key "+w.getFrom()+" found.");return true;}if(!y){this._fireFailure(v.FAILURE_TYPE.INCONSISTENT_MODEL,"Line going to a nonexistent node with key "+w.getTo()+" found.");return true;}w._rendered=false;w._initialized=false;if(x&&y){x.aChildren.push(y);x.aLines.push(w);y.aParents.push(x);y.aParentLines.push(w);w._oFrom=x;w._oTo=y;w._sKey="line_"+x.getKey()+"-"+y.getKey()+"["+I+"]";}if(x._oGroup){x._oGroup.aLines.push(w);x._oGroup.aChildren.push(y);}if(y._oGroup){y._oGroup.aParentLines.push(w);y._oGroup.aParents.push(x);}return false;},this);}.bind(this);this._bRequiresDataProcessing=false;if(a()||b()||i()){return false;}return true;};v.prototype._validateLayout=function(){var w,W,b;w=this.getNodes().some(function(a){return!((a._oGroup&&a._oGroup.getCollapsed())||(isFinite(a.getX())&&isFinite(a.getY())));});if(w){this._fireFailure(v.FAILURE_TYPE.LAYOUT_FAILURE,"Some nodes are missing coordinates.");return false;}if(this._isLayered()){W=this.getGroups().some(function(a){return!a._isEmpty()&&(!isFinite(a.getX())||!isFinite(a.getY()));});if(W){this._fireFailure(v.FAILURE_TYPE.LAYOUT_FAILURE,"Some groups are missing coordinates.");return false;}}b=this.getLines().some(function(a){if(a._isIgnored()){return false;}return!a._validateLayout();});if(b){this._fireFailure(v.FAILURE_TYPE.LAYOUT_FAILURE,"Some lines are missing coordinates.");return false;}return true;};v.prototype._suggest=function(a){var b=function(i){i.addCustomData(new j({key:r.IsLastKey,value:"true",writeToDom:true}));};var w=function(i){var E=U.find(i.getCustomData(),function(H){return H.getKey()===r.IsLastKey;});if(E){i.removeCustomData(E);}};var x=function(i){var E=U.find(i.getCustomData(),function(H){return H.getKey()===r.TypeKey;});return E&&E.getValue();};var y=function(){var I=this._searchField.getSuggestionItems(),E,H,Q;for(var i=0;i<I.length;i++){E=I[i];w(E);if(i<I.length-1){H=x(E);Q=x(I[i+1]);if(H&&Q){if((H===r.Node&&Q===r.Line)||(H===r.Line&&Q===r.Group)){b(E);}}}}}.bind(this);var z=[];t=0;if(a){z=[new F([new F("text",function(i){return(i.toLowerCase()||"").indexOf(a.toLowerCase())>-1;}),new F("description",function(i){return(i.toLowerCase()||"").indexOf(a.toLowerCase())>-1;})],false)];}this._searchField.getBinding("suggestionItems").filter(z);y();this._searchField.suggest();};v.prototype._search=function(a,b){var i="_selectNode",I;if(a){I=U.find(this.getNodes(),function(I){return b?I.getKey()===b:I.getTitle()===a;});if(!I){I=U.find(this.getLines(),function(w){if(w._isLoop()){return false;}return b?w._getLineId()===b:w._createSuggestionHelpText()===a;});i="_selectLine";}if(!I){I=U.find(this.getGroups(),function(w){return w.aNodes.length>0&&(b?w.getKey()===b:w.getTitle()===a);});i="_selectGroup";}if(I){if(i){this[i]({element:I,scroll:true,alwaysSelect:true});}}}else{this.deselect(false);this.setFocus(null);}};v.prototype._createToolbar=function(){var a=this;this._toolbar=new O(this.getId()+"-toolbar",{content:[new h()]}).addStyleClass("sapSuiteUiCommonsNetworkGraphToolbar");this.addDependent(this._toolbar);this._searchField=new g({width:"220px",enableSuggestions:true,suggest:function(E){a._suggest(E.getParameter("suggestValue"));},search:function(E){var b=E.getParameter("query"),i=E.getParameter("suggestionItem"),w;if(i){w=i.getProperty("key");}a._search(b,w);}});this._toolbar.addContent(this._searchField);this._toolbar.addContent(new f({type:B.Transparent,icon:"sap-icon://legend",press:function(E){if(a.$legend.is(":visible")){a.$legend.hide();}else{a.$legend.show();}}}).setTooltip(R.getText("NETWORK_GRAPH_LEGEND")));this._toolbar.addContent(new f({type:B.Transparent,icon:"sap-icon://zoom-in",press:function(E){a._zoom({deltaY:1});}}));this._zoomLabel=new e({text:"100%"});this._toolbar.addContent(this._zoomLabel);this._toolbar.addContent(new f({type:B.Transparent,icon:"sap-icon://zoom-out",press:function(E){a._zoom({deltaY:-1});}}));this._toolbar.addContent(new f({type:B.Transparent,icon:"sap-icon://sys-monitor",press:this._fitToScreen.bind(this)}).setTooltip(R.getText("NETWORK_GRAPH_ZOOMTOFIT")));this._toolbar.addContent(new f({type:B.Transparent,icon:"sap-icon://full-screen",press:this._toggleFullScreen.bind(this)}));this._oPopup=new P({modal:true,shadow:false,autoClose:false});};v.prototype._fitToScreen=function(){var H=this.$scroller.height()/this._iHeight,w=this.$scroller.width()/this._iWidth,a=Math.min(H,w),z=Z.length-1;for(var i=1;i<Z.length;i++){if(a<Z[i]){z=i-1;break;}}this._zoom({newIndex:z});};v.prototype._getZoomText=function(){return Math.floor((this._fZoomRatio*100))+"%";};v.prototype._toggleFullScreen=function(){var a=function(){this._oFullScreenContainer={};this._oFullScreenContainer.$content=this.$();if(this._oFullScreenContainer.$content){this._oFullScreenContainer.$tempNode=q("<div></div>");this._oFullScreenContainer.$content.before(this._oFullScreenContainer.$tempNode);this._oFullScreenContainer.$overlay=q("<div id='"+q.sap.uid()+"'></div>");this._oFullScreenContainer.$overlay.addClass("sapSuiteUiCommonsNetworkGraphContainerOverlay");this._oFullScreenContainer.$overlay.append(this._oFullScreenContainer.$content);this._oPopup.setContent(this._oFullScreenContainer.$overlay);}this._oPopup.open(200,P.Dock.BeginTop,P.Dock.BeginTop,q("body"));}.bind(this),b=function(){this._oFullScreenContainer.$tempNode.replaceWith(this._oFullScreenContainer.$content);this._oPopup.close();this._oFullScreenContainer.$overlay.remove();}.bind(this);if(this._bIsFullScreen){b();}else{a();}this._bIsFullScreen=!this._bIsFullScreen;};v.prototype._setupKeyboardNavigation=function(){if(!this._isLayedOut()){return;}var I=[],w=[[]],x,y;if(!this._oKeyboardNavigator){this._oKeyboardNavigator=new K(this);this.addDelegate(this._oKeyboardNavigator);}this.getNodes().forEach(function(a){if(a.isHidden()||a._isIgnored()){return;}I.push({item:a,x:a.getX(),y:a.getY()});});this.getLines().forEach(function(a){if(a.isHidden()||a._isIgnored()){return;}var b=a.getCoordinates()[0],X=b.getX(),Y=b.getY();a.getCoordinates().forEach(function(b){if(X>b.getX()){X=b.getX();}if(Y>b.getY()){Y=b.getY();}});I.push({item:a,x:X,y:Y});});this.getGroups().forEach(function(a){if(a.isHidden()){return;}I.push({item:a,x:a.getX(),y:a.getY()});});I.sort(function(a,b){if(a.y<b.y){return-1;}else if(a.y>b.y){return 1;}else if(a.x<b.x){return-1;}else if(a.x>b.x){return 1;}else{return 0;}});if(I.length>0){y=[I[0]];w=[y];x=I[0];I.forEach(function(a,i){if(i===0){return;}if(a.y===x.y){y.push(a);}else{y=[a];w.push(y);}x=a;});}w=this._normalizeGrid(w,I);this._oKeyboardNavigator.setItems(w);this._oKeyboardNavigator.setWrapperDom(this.getFocusDomRef());};v.prototype._normalizeGrid=function(a,I){if(I.length===0){return a;}var b=I[0],w=b.x,x=b.x,y=1,z,E,H=[],i;I.forEach(function(Q){if(Q.x<w){w=Q.x;}if(Q.x>x){x=Q.x;}});a.forEach(function(Q){if(Q.length>y){y=Q.length;}});z=Math.abs(x-w)/y;E=w;for(i=0;i<y;i++){E+=z;H.push(E);}return a.map(function(Q){var V,W;if(Q.length===y){V=Q;}else{V=[];W=0;while(W<(y-Q.length)&&H[W]<Q[0].x){W++;V.push(null);}Q.forEach(function(X){V.push(X);W++;});while(W<y){V.push(null);W++;}}return V.map(function(X){return X?X.item:null;});});};v.prototype.getFocusDomRef=function(){return this.getDomRef("wrapper");};v.prototype._setupEvents=function(){var a=5;var i=0,b={},$=this.$("eventwrapper"),w=this.$scroller;var x=function(E,H){return Math.sqrt(Math.pow(E.clientX-H.clientX,2)+Math.pow(E.clientY-H.clientY,2));};var y=function(E){if(E.touches&&E.touches.length===2){b={t1:E.touches[0],t2:E.touches[1],diff:x(E.touches[0],E.touches[1])};}};var z=function(E){if(E.touches&&E.touches.length===2){if(++i===a){var H=E.touches[0],I=E.touches[1],Q=x(H,I);this._zoom({point:{x:(H.clientX+I.clientX)/2,y:(H.clientY+I.clientY)/2},deltaY:Q-b.diff});i=0;b={t1:H,t2:I,diff:Q};}}}.bind(this);w.mousemove(function(E){this._mouseMove(E.clientX,E.clientY);}.bind(this));$.mousedown(function(E){this._mouseDown(E.clientX,E.clientY);E.preventDefault();}.bind(this));w.mouseleave(this._endDragging.bind(this));w.mouseup(this._mouseUp.bind(this));w.bind("wheel",function(E){this._wheel({x:E.originalEvent.clientX,y:E.originalEvent.clientY,deltaY:E.originalEvent.deltaY});E.preventDefault();}.bind(this));w.bind("touchstart",function(E){y(E);});w.bind("touchmove",function(E){z(E);});};v.prototype._wheel=function(a){this._zoom({point:{x:a.x,y:a.y},deltaY:-a.deltaY});this._zoomLabel.setText(this._getZoomText());};v.prototype._endDragging=function(){this._oPanning.dragging=false;this.$scroller.removeClass("sapSuiteUiCommonsNetworkGraphPanning");};v.prototype._mouseMove=function(x,y){var a=this.$scroller[0];if(this._oPanning.dragging){if(!this.$scroller.hasClass("sapSuiteUiCommonsNetworkGraphPanning")){this.$scroller.addClass("sapSuiteUiCommonsNetworkGraphPanning");}a.scrollTop=a.scrollTop-(y-this._oPanning.lastY);a.scrollLeft=a.scrollLeft-(x-this._oPanning.lastX);this._oPanning.lastX=x;this._oPanning.lastY=y;}};v.prototype._mouseDown=function(x,y){this.deselect(false);this.setFocus(null);this._oPanning.lastX=x;this._oPanning.lastY=y;this._oPanning.dragging=true;this._tooltip.instantClose();};v.prototype._mouseUp=function(){this._endDragging();};v.prototype._zoom=function(a){var b=this.$svg[0].getAttribute("viewBox"),i=a.deltaY<0?-1:1,w,x,y,z;if(!a.point){a.point={x:this.$scroller.width()/2,y:this.$scroller.height()/2};}w=this.getCorrectMousePosition({x:a.point.x,y:a.point.y});y=a.newIndex||a.newIndex===0?a.newIndex:this._fZoomRatioIndex+i;if((y<0)||(y>Z.length-1)){return;}this._fZoomRatioIndex=y;this._fZoomRatio=Z[this._fZoomRatioIndex];if(!b){z="0 0 "+this.$svg.width()+" "+this.$svg.height();this.$svg[0].setAttribute("viewBox",z);}this.$svg.width(this._iWidth*this._fZoomRatio);this.$svg.height(this._iHeight*this._fZoomRatio);x=this.getCorrectMousePosition({x:a.point.x,y:a.point.y});this.$scroller[0].scrollLeft+=(w.x-x.x)*this._fZoomRatio;this.$scroller[0].scrollTop+=(w.y-x.y)*this._fZoomRatio;this._zoomLabel.setText(this._getZoomText());if(this._fZoomRatio<o){this.$svg.addClass("sapSuiteUiCommonsNetworkGraphZoomedOut");}else{this.$svg.removeClass("sapSuiteUiCommonsNetworkGraphZoomedOut");}this.fireEvent("zoomChanged");};v.prototype._createSearchSuggestItems=function(){var a=50;var b={items:[]},i=this.getNodes().sort(function(z,E){return z.getTitle().localeCompare(E.getTitle());}),w=this.getLines().sort(function(z,E){var H=z.getTitle(),I=E.getTitle();if(H===I){return z.getFromNode().getTitle().localeCompare(E.getFromNode().getTitle());}return H.localeCompare(I);}),x=this.getGroups().sort(function(z,E){return z.getTitle().localeCompare(E.getTitle());});var y=new J();y.setSizeLimit(p);i.forEach(function(z){var E=U.trimText(z.getTitle(),a);b.items.push({text:E?E:z.getKey(),type:r.Node,icon:z.getIcon(),key:z.getKey(),description:"("+R.getText("NETWORK_GRAPH_NODE")+")"});});w.forEach(function(z){if(z._isLoop()){return;}if(z.getTitle()||z.getFromNode().getTitle()||z.getToNode().getTitle()){b.items.push({text:z._createSuggestionHelpText(),type:r.Line,key:z._getLineId(),description:"("+R.getText("NETWORK_GRAPH_LINE")+")"});}});x.forEach(function(z){var E=U.trimText(z.getTitle(),a);if(z.aNodes.length>0){b.items.push({text:E?E:z.getKey(),key:z.getKey(),type:r.Group,description:"("+R.getText("NETWORK_GRAPH_GROUP")+")"});}});y.setData(b);this._searchField.setModel(y);this._searchField.bindAggregation("suggestionItems",{path:"/items",template:new u({text:"{text}",icon:"{icon}",key:"{key}",description:"{description}",customData:new j({key:"type",value:"{type}"})})});};v.prototype._scrollToElement=function(i){var I=i._oGroup&&i._oGroup.getCollapsed(),a=i instanceof L?i.getSource():i;if(I){a=i._oGroup;}this.$scroller.get(0).scrollLeft=((a.getX()+(a._iWidth?a._iWidth:0)/2)*this._fZoomRatio)-(this.$scroller.width()/2);this.$scroller.get(0).scrollTop=((a.getY()+(a._iHeight?a._iHeight:0)/2)*this._fZoomRatio)-(this.$scroller.height()/2);};v.prototype._createLegend=function(){var $=this.$("legend"),H="",a=this,b={},i={};var w=function(E,I){var z=E.getStatus();if(z){if(I[z]){I[z].push(E);}else{I[z]=[E];}}};var x=function(I){return Object.keys(I).length>0;};var y=function(z,E){H+=this._renderControl("div",{status:z,elementtype:E,"class":"sapSuiteUiCommonsNetworkGraphLegendLine"},false);H+=this._renderControl("div",{"class":"sapSuiteUiCommonsNetworkGraphLegendColorLine "+this._getStatusClass(z)});H+=this._renderControl("label",{"class":"sapSuiteUiCommonsNetworkGraphLegendLineLabel"},false);H+=this._oLegendLabels[E+z]?this._oLegendLabels[E+z]:z;H+="</label>";H+="</div>";}.bind(this);if(this.getLegend()){return;}if(!$[0]){return;}this.getNodes().forEach(function(z){w(z,b);});if(x(b)){H+="<div class=\"sapSuiteUiCommonsNetworkGraphLegendTitleNode\"><label class=\"sapSuiteUiCommonsNetworkGraphLegendTitle\">"+q.sap.encodeHTML(R.getText("NETWORK_GRAPH_NODES"))+"</label></div>";Object.keys(b).forEach(function(z){y(z,s.Node);});}this.getLines().forEach(function(z){w(z,i);});if(x(i)){H+="<div class=\"sapSuiteUiCommonsNetworkGraphLegendTitleLine\"><label class=\"sapSuiteUiCommonsNetworkGraphLegendTitle\">"+q.sap.encodeHTML(R.getText("NETWORK_GRAPH_LINES"))+"</label></div>";Object.keys(i).forEach(function(z){y(z,s.Line);});}$.html(H);this.$().find(".sapSuiteUiCommonsNetworkGraphLegendLine").click(function(E){var z=q(this).attr("status"),I=q(this).attr("elementtype"),Q=I===s.Node?b:i;if(!E.ctrlKey){a.deselect(false);a.setFocus(null);}if(Q[z]){Q[z].forEach(function(V){V.$().addClass(a.SELECT_CLASS);});}});};v.prototype._selectElement=function(a){var i=a.element&&!a.element.getSelected(),I=[];var b=function(V){a.element.setSelected(V);if(a.setFocus!==false){this.setFocus({item:a.element});}}.bind(this);this.$().find("."+this.VISIBLE_ACTIONS_BUTTONS_CLASS).removeClass(this.VISIBLE_ACTIONS_BUTTONS_CLASS);if(!a.preventDeselect){I=this.deselect(true);if(a.setFocus){this.setFocus(null);}if(i||a.alwaysSelect){b(true);}}else{b(i);}if(!I.some(function(w){return w===a.element;})){I.push(a.element);}this.fireSelectionChange({items:I});};v.prototype._selectLine=function(a){var b=a.element.getFromNode(),i=a.element.getToNode(),w=(b._isInCollapsedGroup()&&(b._oGroup===i._oGroup))?i._oGroup:null;if(a.scroll){this._scrollToElement(w||a.element);}if(!w){this._selectElement(a);}};v.prototype._selectNode=function(a){var b=a.element._isInCollapsedGroup()?a.element._oGroup:null;if(a.scroll){this._scrollToElement(b||a.element);}if(!b){this._selectElement(a);if(a.renderActionButtons!==false){a.element.showActionButtons(true);}}};v.prototype._selectGroup=function(a){if(a.scroll){this._scrollToElement(a.element);}this.setFocus({item:a.element});};v.prototype._applyLayout=function(){var a;this._iRunningLayouts++;a=this._getLayoutAlgorithm().layout().catch(function(E){q.sap.log.error("Error in layouting algorithm.",E);}).then(function(){return new Promise(function(b,i){if(a.isTerminated()){b();return;}if(this._validateLayout()){b();}else{i();}}.bind(this),function(E){this._fireFailure(v.FAILURE_TYPE.LAYOUT_FAILURE,E.type+": "+E.text);return Promise.reject();}.bind(this));}.bind(this));if(this._oLastLayout&&this._iRunningLayouts>1){this._oLastLayout.terminate();}this._oLastLayout=a;return a;};v.prototype._setAccessibilityTitle=function(i){var a,w=this.$("accessibility");if(i===null){a=R.getText("NETWORK_GRAPH_ACCESSIBILITY_CONTENT");}else if(typeof i==="string"){a=i;}else{a=i._getAccessibilityLabel();}if(w){w.html(q.sap.encodeHTML(a));}};v.prototype._getLayoutAlgorithm=function(){return this.getLayoutAlgorithm()||this._getDefalutLayout();};v.prototype._getDefalutLayout=function(){if(!this._oDefalutLayout){this._oDefaultLayout=new c();this._oDefaultLayout.setParent(this,null,true);}return this._oDefaultLayout;};v.prototype._isLayered=function(){return this._getLayoutAlgorithm().isLayered();};v.prototype._isDelayedLayouting=function(){return this.getNodes().some(function(a){return a._useAutomaticSize()||a.getTitleLineSize()!==1;});};v.prototype._isLayedOut=function(){return this._bIsLayedOut;};v.prototype.destroyAggregation=function(a,b){this._bRequiresDataProcessing=true;C.prototype.destroyAggregation.call(this,a,b);};v.prototype.insertAggregation=function(a,b,i,w){this._bRequiresDataProcessing=true;C.prototype.insertAggregation.call(this,a,b,i,w);};v.prototype.removeAggregation=function(a,b,i){this._bRequiresDataProcessing=true;C.prototype.removeAggregation.call(this,a,b,i);};v.prototype.addAggregation=function(a,b,i){this._bRequiresDataProcessing=true;C.prototype.addAggregation.call(this,a,b,i);};v.prototype.removeAllAggregation=function(a,b){this._bRequiresDataProcessing=true;C.prototype.removeAllAggregation.call(this,a,b);};v.prototype.updateAggregation=function(a){this._bNeedNodeProcessing=true;C.prototype.updateAggregation.call(this,a);};return v;});
