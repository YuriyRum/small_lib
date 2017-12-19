/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./BarInPageEnabler','./ToolbarLayoutData','./ToolbarSpacer','./library','sap/ui/core/Control','sap/ui/core/EnabledPropagator','sap/ui/core/ResizeHandler'],function(q,B,T,a,l,C,E,R){"use strict";var b=sap.m.ToolbarDesign;var c=C.extend("sap.m.Toolbar",{metadata:{interfaces:["sap.ui.core.Toolbar","sap.m.IBar"],library:"sap.m",properties:{width:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:null},active:{type:"boolean",group:"Behavior",defaultValue:false},enabled:{type:"boolean",group:"Behavior",defaultValue:true},height:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:''},design:{type:"sap.m.ToolbarDesign",group:"Appearance",defaultValue:b.Auto}},defaultAggregation:"content",aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content"}},associations:{ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},events:{press:{parameters:{srcControl:{type:"sap.ui.core.Control"}}}},designTime:true}});E.call(c.prototype);c.shrinkClass="sapMTBShrinkItem";c.isRelativeWidth=function(w){return/^([-+]?\d+%|auto|inherit|)$/i.test(w);};c.getOrigWidth=function(i){var o=sap.ui.getCore().byId(i);if(!o||!o.getWidth){return"";}return o.getWidth();};c.checkShrinkable=function(o,s){if(o instanceof a){return this.isRelativeWidth(o.getWidth());}s=s||this.shrinkClass;o.removeStyleClass(s);var w=this.getOrigWidth(o.getId());if(!this.isRelativeWidth(w)){return;}var L=o.getLayoutData();if(L instanceof T){return L.getShrinkable()&&o.addStyleClass(s);}if(w.indexOf("%")>0||o.getMetadata().isInstanceOf("sap.ui.core.IShrinkable")){return o.addStyleClass(s);}var d=o.getDomRef();if(d&&(d.firstChild||{}).nodeType==3){return o.addStyleClass(s);}};c.hasNewFlexBoxSupport=(function(){var s=document.documentElement.style;return(s.flex!==undefined||s.webkitFlexShrink!==undefined);}());c.prototype.init=function(){this.data("sap-ui-fastnavgroup","true",true);this._oContentDelegate={onAfterRendering:this._onAfterContentRendering};};c.prototype.onBeforeRendering=function(){this._cleanup();};c.prototype.onAfterRendering=function(){if(!this._checkContents()){return;}this._doLayout();};c.prototype.exit=function(){this._cleanup();};c.prototype.onLayoutDataChange=function(){this.rerender();};c.prototype.addContent=function(o){this.addAggregation("content",o);this._onContentInserted(o);return this;};c.prototype.insertContent=function(o,i){this.insertAggregation("content",o,i);this._onContentInserted(o);return this;};c.prototype.removeContent=function(v){v=this.removeAggregation("content",v);this._onContentRemoved(v);return v;};c.prototype.removeAllContent=function(){var d=this.removeAllAggregation("content")||[];d.forEach(this._onContentRemoved,this);return d;};c.prototype.ontap=function(e){if(this.getActive()&&!e.isMarked()){e.setMarked();this.firePress({srcControl:e.srcControl});}};c.prototype.onsapenter=function(e){if(this.getActive()&&e.srcControl===this&&!e.isMarked()){e.setMarked();this.firePress({srcControl:this});}};c.prototype.onsapspace=c.prototype.onsapenter;c.prototype.ontouchstart=function(e){this.getActive()&&e.setMarked();};c.prototype._checkContents=function(){var s=0;this.getContent().forEach(function(o){if(c.checkShrinkable(o)){s++;}});return s;};c.prototype._doLayout=function(){if(c.hasNewFlexBoxSupport){return;}this._resetOverflow();};c.prototype._resetOverflow=function(){this._deregisterResize();var t=this.$();var d=t[0]||{};t.removeClass("sapMTBOverflow");var o=d.scrollWidth>d.clientWidth;o&&t.addClass("sapMTBOverflow");this._iEndPoint=this._getEndPoint();this._registerResize();};c.prototype._onContentInserted=function(o){if(o){o.attachEvent("_change",this._onContentPropertyChanged,this);o.addEventDelegate(this._oContentDelegate,o);}};c.prototype._onContentRemoved=function(o){if(o){o.detachEvent("_change",this._onContentPropertyChanged,this);o.removeEventDelegate(this._oContentDelegate,o);}};c.prototype._onAfterContentRendering=function(){var L=this.getLayoutData();if(L instanceof T){L.applyProperties();}};c.prototype._onContentPropertyChanged=function(e){if(e.getParameter("name")!="width"){return;}var o=e.getSource();var p=o.getWidth().indexOf("%")>0;o.toggleStyleClass(c.shrinkClass,p);};c.prototype._registerContentResize=function(){sap.ui.getCore().attachIntervalTimer(this._handleContentResize,this);};c.prototype._deregisterContentResize=function(){sap.ui.getCore().detachIntervalTimer(this._handleContentResize,this);};c.prototype._registerToolbarResize=function(){if(c.isRelativeWidth(this.getWidth())){var r=q.proxy(this._handleToolbarResize,this);this._sResizeListenerId=R.register(this,r);}};c.prototype._deregisterToolbarResize=function(){sap.ui.getCore().detachIntervalTimer(this._handleContentResize,this);if(this._sResizeListenerId){R.deregister(this._sResizeListenerId);this._sResizeListenerId="";}};c.prototype._registerResize=function(){this._registerToolbarResize();this._registerContentResize();};c.prototype._deregisterResize=function(){this._deregisterToolbarResize();this._deregisterContentResize();};c.prototype._cleanup=function(){this._deregisterResize();};c.prototype._getEndPoint=function(){var L=(this.getDomRef()||{}).lastElementChild;if(L){var e=L.offsetLeft;if(!sap.ui.getCore().getConfiguration().getRTL()){e+=L.offsetWidth;}}return e||0;};c.prototype._handleToolbarResize=function(){this._handleResize(false);};c.prototype._handleContentResize=function(){this._handleResize(true);};c.prototype._handleResize=function(d){if(d&&this._iEndPoint==this._getEndPoint()){return;}this._doLayout();};c.prototype._getAccessibilityRole=function(){var d=this.getContent(),r=this._getRootAccessibilityRole();if(this.getActive()&&(!d||d.length===0)){r="button";}return r;};c.prototype.setDesign=function(d,s){if(!s){return this.setProperty("design",d);}this._sAutoDesign=this.validateProperty("design",d);return this;};c.prototype.getActiveDesign=function(){var d=this.getDesign();if(d!=b.Auto){return d;}return this._sAutoDesign||d;};c.prototype.getTitleControl=function(){if(!sap.m.Title){return;}var d=this.getContent();for(var i=0;i<d.length;i++){var o=d[i];if(o instanceof sap.m.Title&&o.getVisible()){return o;}}};c.prototype.getTitleId=function(){var t=this.getTitleControl();return t?t.getId():"";};c.prototype.isContextSensitive=B.prototype.isContextSensitive;c.prototype.setHTMLTag=B.prototype.setHTMLTag;c.prototype.getHTMLTag=B.prototype.getHTMLTag;c.prototype.applyTagAndContextClassFor=B.prototype.applyTagAndContextClassFor;c.prototype._applyContextClassFor=B.prototype._applyContextClassFor;c.prototype._applyTag=B.prototype._applyTag;c.prototype._getContextOptions=B.prototype._getContextOptions;c.prototype._setRootAccessibilityRole=B.prototype._setRootAccessibilityRole;c.prototype._getRootAccessibilityRole=B.prototype._getRootAccessibilityRole;return c;},true);
