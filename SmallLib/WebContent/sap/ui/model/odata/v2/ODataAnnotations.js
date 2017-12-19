/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/model/odata/AnnotationParser','sap/ui/Device','sap/ui/base/EventProvider'],function(q,A,D,E){"use strict";function a(p){return p.catch(function(e){return e;});}function c(){return this;}var O=E.extend("sap.ui.model.odata.v2.ODataAnnotations",{constructor:function(m,o){E.apply(this,[o]);this._oMetadata=m;this._pReadyToParseNext=m.loaded();this._pLoaded=m.loaded();this._mCustomHeaders={};this._mAnnotations={};if(!o||!o.skipMetadata){if(!o){o={};}if(!o.source){o.source=[];}else if(Array.isArray(o.source)){o.source=o.source.slice(0);}else{o.source=[o.source];}o.source.unshift({type:"xml",data:m.loaded().then(function(p){return{xml:p["metadataString"],lastModified:p["lastModified"]};})});}if(o){this.setHeaders(o.headers);this.addSource(o.source);}},metadata:{publicMethods:["getData","addSource","getHeaders","setHeaders","attachSuccess","detachSuccess","attachError","detachError","attachLoaded","detachLoaded","attachFailed","detachFailed"]}});O.prototype.getData=function(){return this._mAnnotations;};O.prototype.getAnnotationsData=function(){return this._mAnnotations;};O.prototype.getHeaders=function(){return q.extend({},this._mCustomHeaders,{"Accept-Language":sap.ui.getCore().getConfiguration().getLanguageTag()});};O.prototype.setHeaders=function(h){this._mCustomHeaders=q.extend({},h);};O.prototype.loaded=function(){return this._pLoaded;};O.prototype.addSource=function(s){if(!s||Array.isArray(s)&&s.length===0){return this._pReadyToParseNext.then(function(){return[];});}if(!Array.isArray(s)){s=[s];}var S=s.map(function(v){return(typeof v==="string")?{type:"url",data:v}:v;});var b=S.map(this._loadSource.bind(this));var m=[];var p=this._pReadyToParseNext;for(var i=0;i<b.length;++i){var d=b[i];p=p.then(c.bind(d)).then(this._parseSourceXML.bind(this)).then(this._parseSource.bind(this)).then(this._mergeSource.bind(this));p.then(this._fireSuccess.bind(this));p.catch(this._fireError.bind(this));m.push(p);p=a(p);}var e=this._promiseFinally(m);var f=this._promiseFinally(m,true);e.then(this._fireLoaded.bind(this),this._fireFailed.bind(this));f.then(this._fireSomeLoaded.bind(this),this._fireAllFailed.bind(this));this._pLoaded=f;this._pReadyToParseNext=a(e);return e;};O.prototype.attachSuccess=function(d,f,l){return this.attachEvent("success",d,f,l);};O.prototype.detachSuccess=function(f,l){return this.detachEvent("success",f,l);};O.prototype.attachError=function(d,f,l){return this.attachEvent("error",d,f,l);};O.prototype.detachError=function(f,l){return this.detachEvent("error",f,l);};O.prototype.attachLoaded=function(d,f,l){return this.attachEvent("loaded",d,f,l);};O.prototype.detachLoaded=function(f,l){return this.detachEvent("loaded",f,l);};O.prototype.attachFailed=function(d,f,l){return this.attachEvent("failed",d,f,l);};O.prototype.detachFailed=function(f,l){return this.detachEvent("failed",f,l);};O.prototype.attachSomeLoaded=function(d,f,l){return this.attachEvent("someLoaded",d,f,l);};O.prototype.detachSomeLoaded=function(f,l){return this.detachEvent("someLoaded",f,l);};O.prototype.attachAllFailed=function(d,f,l){return this.attachEvent("allFailed",d,f,l);};O.prototype.detachAllFailed=function(f,l){return this.detachEvent("allFailed",f,l);};O.prototype._fireSuccess=function(r){return this.fireEvent("success",{result:r},false,false);};O.prototype._fireError=function(e){return this.fireEvent("error",{result:e},false,false);};O.prototype._fireLoaded=function(r){return this.fireEvent("loaded",{result:r},false,false);};O.prototype._fireFailed=function(e){return this.fireEvent("failed",{result:e},false,false);};O.prototype._fireSomeLoaded=function(r){return this.fireEvent("someLoaded",{result:r},false,false);};O.prototype._fireAllFailed=function(e){return this.fireEvent("allFailed",{result:e},false,false);};O.prototype._loadSource=function(s){if(s.data instanceof Promise){return s.data.then(function(d){delete s.data;s.type="xml";s.xml=d.xml;s.lastModified=d.lastModified;return this._loadSource(s);}.bind(this));}else if(s.type==="xml"){if(typeof s.data==="string"){s.xml=s.data;delete s.data;}return Promise.resolve(s);}else if(s.type==="url"){return this._loadUrl(s);}else{return Promise.reject({error:new Error("Unknown source type: \""+s.type+"\""),source:s});}};O.prototype._loadUrl=function(s){return new Promise(function(r,R){var m={url:s.data,async:true,headers:this.getHeaders(),beforeSend:function(x){x.overrideMimeType("text/plain");}};var S=function(d,b,x){s.xml=x.responseText;if(x.getResponseHeader("Last-Modified")){s.lastModified=new Date(x.getResponseHeader("Last-Modified"));}r(s);};var f=function(x,b){var e=new Error("Could not load annotation URL: \""+s.data+"\"");e.source=s;R(e);};q.ajax(m).done(S).fail(f);}.bind(this));};O.prototype._parseSourceXML=function(s){return new Promise(function(r,R){var x;if(D.browser.msie){x=new window.ActiveXObject("Microsoft.XMLDOM");x.preserveWhiteSpace=true;var X=s.xml;if(X.indexOf(" xmlns:xml=")>-1){X=X.replace(' xmlns:xml="http://www.w3.org/XML/1998/namespace"',"").replace(" xmlns:xml='http://www.w3.org/XML/1998/namespace'","");}x.loadXML(X);}else if(window.DOMParser){x=new DOMParser().parseFromString(s.xml,'application/xml');}var e;if(!x){e=new Error("The browser does not support XML parsing. Annotations are not available.");e.source=s;R(e);}else if(x.getElementsByTagName("parsererror").length>0||(x.parseError&&x.parseError.errorCode!==0)){e=new Error("There were errors parsing the XML.");e.source={type:s.type,data:s.data,xml:s.xml,document:x};R(e);}else{s.document=x;r(s);}});};O.prototype._parseSource=function(s){s.annotations=A.parse(this._oMetadata,s.document);return Promise.resolve(s);};O.prototype._mergeSource=function(s){A.merge(this._mAnnotations,s.annotations);return Promise.resolve(s);};O.prototype._promiseFinally=function(p,f){return new Promise(function(r,R){var b=true;var d=true;var P=p.length;var e=[];var C=function(){if(e.length===P){e.annotations=this.getData();if(b||(f&&!d)){r(e);}else{R(e);}}}.bind(this);function o(g,h){b=g?false:b;d=!g?false:d;e.push(h);C();}for(var i=0;i<P;++i){p[i].then(o.bind(this,false));p[i].catch(o.bind(this,true));}}.bind(this));};return O;});
