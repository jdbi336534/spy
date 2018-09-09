//JSON解析包
// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.
var JSON;
if (!JSON) {
	JSON = {};
}

(function() {
	"use strict";

	function f(n) {
		// Format integers to have at least two digits.
		return n < 10 ? '0' + n : n;
	}
	if (typeof Date.prototype.toJSON !== 'function') {
		Date.prototype.toJSON = function(key) {
			return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z' : null;
		};
		String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
			return this.valueOf();
		};
	}
	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
		escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
		gap, indent, meta = { // table of character substitutions
			'\b': '\\b',
			'\t': '\\t',
			'\n': '\\n',
			'\f': '\\f',
			'\r': '\\r',
			'"': '\\"',
			'\\': '\\\\'
		},
		rep;

	function quote(string) {
		escapable.lastIndex = 0;
		return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
			var c = meta[a];
			return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
		}) + '"' : '"' + string + '"';
	}

	function str(key, holder) {
		// Produce a string from holder[key].
		var i, // The loop counter.
		k, // The member key.
		v, // The member value.
		length, mind = gap,
			partial, value = holder[key];
		// If the value has a toJSON method, call it to obtain a replacement value.
		if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
			value = value.toJSON(key);
		}
		// If we were called with a replacer function, then call the replacer to
		// obtain a replacement value.
		if (typeof rep === 'function') {
			value = rep.call(holder, key, value);
		}
		// What happens next depends on the value's type.
		switch (typeof value) {
		case 'string':
			return quote(value);
		case 'number':
			// JSON numbers must be finite. Encode non-finite numbers as null.
			return isFinite(value) ? String(value) : 'null';
		case 'boolean':
		case 'null':
			return String(value);
			// If the type is 'object', we might be dealing with an object or an array or
			// null.
		case 'object':
			// Due to a specification blunder in ECMAScript, typeof null is 'object',
			// so watch out for that case.
			if (!value) {
				return 'null';
			}
			// Make an array to hold the partial results of stringifying this object value.
			gap += indent;
			partial = [];
			// Is the value an array?
			if (Object.prototype.toString.apply(value) === '[object Array]') {
				// The value is an array. Stringify every element. Use null as a placeholder
				// for non-JSON values.
				length = value.length;
				for (i = 0; i < length; i += 1) {
					partial[i] = str(i, value) || 'null';
				}
				// Join all of the elements together, separated with commas, and wrap them in
				// brackets.
				v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
				gap = mind;
				return v;
			}
			// If the replacer is an array, use it to select the members to be stringified.
			if (rep && typeof rep === 'object') {
				length = rep.length;
				for (i = 0; i < length; i += 1) {
					if (typeof rep[i] === 'string') {
						k = rep[i];
						v = str(k, value);
						if (v) {
							partial.push(quote(k) + (gap ? ': ' : ':') + v);
						}
					}
				}
			} else {
				// Otherwise, iterate through all of the keys in the object.
				for (k in value) {
					if (Object.prototype.hasOwnProperty.call(value, k)) {
						v = str(k, value);
						if (v) {
							partial.push(quote(k) + (gap ? ': ' : ':') + v);
						}
					}
				}
			}
			// Join all of the member texts together, separated with commas,
			// and wrap them in braces.
			v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
			gap = mind;
			return v;
		}
	}
	// If the JSON object does not yet have a stringify method, give it one.
	if (typeof JSON.stringify !== 'function') {
		JSON.stringify = function(value, replacer, space) {
			var i;
			gap = '';
			indent = '';
			// If the space parameter is a number, make an indent string containing that
			// many spaces.
			if (typeof space === 'number') {
				for (i = 0; i < space; i += 1) {
					indent += ' ';
				}
			} else if (typeof space === 'string') {
				indent = space;
			}
			rep = replacer;
			if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
				throw new Error('JSON.stringify');
			}
			return str('', {
				'': value
			});
		};
	}
	if (typeof JSON.parse !== 'function') {
		JSON.parse = function(text, reviver) {
			var j;

			function walk(holder, key) {
				var k, v, value = holder[key];
				if (value && typeof value === 'object') {
					for (k in value) {
						if (Object.prototype.hasOwnProperty.call(value, k)) {
							v = walk(value, k);
							if (v !== undefined) {
								value[k] = v;
							} else {
								delete value[k];
							}
						}
					}
				}
				return reviver.call(holder, key, value);
			}
			text = String(text);
			cx.lastIndex = 0;
			if (cx.test(text)) {
				text = text.replace(cx, function(a) {
					return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				});
			}
			if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				j = eval('(' + text + ')');
				return typeof reviver === 'function' ? walk({
					'': j
				}, '') : j;
			}
			throw new SyntaxError('JSON.parse');
		};
	}
}());


(function(w){
	w.DL={
		isIE:navigator.userAgent.indexOf("MSIE") > 0,
		echar:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
		dchar:[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,-1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1],
		kkDapCtrl:null,
		SXL:0,
		SXF:null,
		SXFAPI:-1,
		copyTxt:"",
		copyDid:"mj_copyDivId",
		copySwf:"/css/img/ZeroClipboard.swf",
		copyWid:"ZeroClipboardMovie_1",
		e64:function(str){
			str=this.utf16to8(str);
			var out="", i=0, len=str.length,c1, c2, c3;
			len = str.length;
			while(i < len) {
			    c1 = str.charCodeAt(i++) & 0xff;
			    if(i == len){
			        out += this.echar.charAt(c1 >> 2);
			        out += this.echar.charAt((c1 & 0x3) << 4);
			        out += "==";
			        break;
			    }
			    c2 = str.charCodeAt(i++);
			    if(i == len){
			        out += this.echar.charAt(c1 >> 2);
			        out += this.echar.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
			        out += this.echar.charAt((c2 & 0xF) << 2);
			        out += "=";
			        break;
			    }
			    c3 = str.charCodeAt(i++);
			    out += this.echar.charAt(c1 >> 2);
			    out += this.echar.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
			    out += this.echar.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
			    out += this.echar.charAt(c3 & 0x3F);
		    }
		    return out;
		},
		d64:function(str){
			var i=0, len=str.length, out="",c1, c2, c3, c4;
			while (i < len) {
				do {
					c1 = this.dchar[str.charCodeAt(i++) & 0xff];
				} while (i < len && c1 == -1);
				if (c1 == -1) break;
				do {
					c2 = this.dchar[str.charCodeAt(i++) & 0xff];
				} while (i < len && c2 == -1);
				if (c2 == -1) break;
				out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
				do {
					c3 = str.charCodeAt(i++) & 0xff;
					if (c3 == 61) return out;
					c3 = this.dchar[c3];
				} while (i < len && c3 == -1);
				if (c3 == -1) break;
				out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
				do {
					c4 = str.charCodeAt(i++) & 0xff;
					if (c4 == 61) return out;
					c4 = this.dchar[c4];
				} while (i < len && c4 == -1);
				if (c4 == -1) break;
				out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
			}
			return this.utf8to16(out);
		},
		utf16to8:function(str){
			var out, i, len, c;
			out = "";
			len = str.length;
			for (i = 0; i < len; i++) {
				c = str.charCodeAt(i);
				if ((c >= 0x0001) && (c <= 0x007F)) {
					out += str.charAt(i);
				} else if (c > 0x07FF) {
					out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
					out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
					out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
				} else {
					out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
					out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
				}
			}
			return out;
		},
		utf8to16:function(str) {
			var out, i, len, c;
			var char2, char3;
			out = "";
			len = str.length;
			i = 0;
			while (i < len) {
				c = str.charCodeAt(i++);
				switch (c >> 4) {
				case 0:
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
					out += str.charAt(i - 1);
					break;
				case 12:
				case 13:
					char2 = str.charCodeAt(i++);
					out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
					break;
				case 14:
					char2 = str.charCodeAt(i++);
					char3 = str.charCodeAt(i++);
					out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
					break;
				}
			}
			return out;
		},
		xfObj:function(){
			if(this.SXFAPI > -1){
				return true;
			}
			
			if (this.isIE) {
				try {
					this.SXF = new ActiveXObject("QQIEHelper.QQRightClick.2");
					var xf_info = this.SXF.GetInfo().replace(/(^\s*)|(\s*$)/g, "");
					var version = JSON.parse(xf_info);
					this.SXFAPI=version.support_npapi;
				} catch (e) {
					this.SXFAPI=0;
				}
			} else {
				var get_xf_npapi = navigator.mimeTypes["application/npxf-qqdownload"];
				if (get_xf_npapi) {
					this.SXF = document.createElement("embed");
					this.SXF.style.visibility = "hidden";
					this.SXF.type = "application/npxf-qqdownload";
					this.SXF.width = 0;
					this.SXF.height = 0;
					document.body.appendChild(this.SXF);
					var version = JSON.parse(this.SXF.GetInfo());
					this.SXFAPI=version.support_npapi;
				} else {
					this.SXFAPI=0;
				}
			}
		},
		xfDown:function(url,online){
			this.xfObj();
			if(!this.SXFAPI){
				return true;
			}
			
			function _xf(ui,online){//0正常 1离线
				var batch_task_config = {
					"addto_offline": online,
					"silence_create": 0,
					"url_list": []
				};
				var task_count = ui.length;
				for (var i = 0; i < task_count; i++) {
					var items_obj = {
						"url": ui[i],
						"file_name": "",
						"custom_id": "8888",
						"cookie": "",
						"file_size": "",
						"ref": window.location + "#xfsid=8888",
						"remark": "",
						"hash": "",
						"p2p_rate": 0
					};
					batch_task_config.url_list.push(items_obj);
				}
				//开始调用
				DL.SXF.StartTask(JSON.stringify(batch_task_config));
			}
			var dMore= "object" == typeof url ? true : false;
			var u=[];
		    if(dMore){
		    	for(var i in url){
		    		u.push(this.urlTh(url[i]));
		    	}
		    }else{ 
			    u.push(url);
			}
			var ol=online ? online : 0;
			_xf(u,online);
		    return false;
		},
		xlIeObj:function(){
			var c=null;
			try{
				c = new ActiveXObject("ThunderAgent.Agent") 
			}catch(e){
				try{
					c=new ActiveXObject("ThunderServer.webThunder.1");
				}catch(e){
					try{
						c = new ActiveXObject("ThunderAgent.Agent.1");
					}catch(e){
						c = null;
					}     
				}   
			}
			return c;
		},
		xlCheck:function(){
			if(this.isIE){
				var c=this.xlIeObj();
				this.SXL = c == null ? 0 : 1;
			}else{
				if(navigator.mimeTypes["application/np_xunlei_plugin"]){
					this.SXL = 2;
				}else if(navigator.mimeTypes["application/np_xunlei_plugin.2"]){
					this.SXL = 3;
				}
				
			}
		},
		xlDown:function(url){
			function _xl(a){
				var d = document.getElementById("mj_xunlei_plugin_id");
				if (d == undefined || d == null){
					d = document.createElement("embed");
					d.id = "mj_xunlei_plugin_id";
					d.style.visibility = "hidden";
					d.type = "application/np_xunlei_plugin";
					d.width = 0;
					d.height = 0;
					document.body.appendChild(d);
				}
				d.DownLoadByThunderPlugin(a)
			}
			function _xl2(k){
				var j = document.createElement("embed");
				j.style.visibility = "hidden", 
				j.type = "application/np_xunlei_plugin.2", 
				j.width = 0, 
				j.height = 0, 
				document.body.appendChild(j);
				var m = "#@$@#",
					n = document.location.href;
				n = n.concat(m), n = n.concat(k.length, m);
				for (var o = 0; o < k.length; o++){
					n = n.concat(k[o], m), 
					n = n.concat(k[o], m), 
					n = n.concat("kc", m), 
					n = n.concat("", m), 
					n = n.concat("", m), 
					n = n.concat("0000", m);
				}
				j.DownLoadListByThunderPlugin(n);
			}
			function _xlIe(k){
			    var Thunder=DL.xlIeObj();
			    var d=false;
			    for (var o = 0; o < k.length; o++){
			    	
			    	try{
			    		Thunder.AddTask(k[o],"","","","",1,1,10);
			    	}catch(e){
			    		try{
			    			Thunder.AddTask(k[o],"","","","",1,"","");
			    		}catch(e){
			    			d=true;
			    		}
			    	}
			    }
			    if(!d){
			    	Thunder.CommitTasks();
			    }
				return d;
			}
			
			var dMore= "object" == typeof url ? true : false;
			switch(this.SXL){
				case 1 ://msie
					var u=[];
				    if(dMore){
				    	for(var i in url){
				    		u.push(this.urlTh(url[i]));
				    	}
				    }else{ 
					    u.push(url);
					}
				    return _xlIe(u);
				break;
				case 2 ://xunlei
				    if(dMore){
				    	for(var i in url){
				    		_xl(this.urlTh(url[i]));
				    	}
				    }else{ 
					    _xl(url);
					}
				break;
				case 3 ://xunlei2
				    var u=[];
				    if(dMore){
				    	for(var i in url){
				    		u.push(this.urlTh(url[i]));
				    	}
				    }else{ 
					    u.push(url);
					}
					_xl2(u);
				break;
				default :
				    return true;
			}
			return false;
		},
		urlTh:function(url){
			if(url.substring(0,10) == 'thunder://'){
				return url;
			}else{
				return 'thunder://'+this.e64('AA'+url+'ZZ');
			}
		},
		urlQQ:function(url){
			if(url.substring(0,10) == 'thunder://'){
				url=url.replace('thunder://','');
				url=this.d64(url);
				url=url.replace(/^AA(.+)ZZ$/i,'$1',url);
			}
			
			return 'qqdl://'+this.e64(url);
		},
		urlXM:function(url){
			var out=this.e64(url);
			return out.replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' }).replace(/[^A-Za-z0-9\+\/]/g, '');
		},
		urlLX:function(url){
			return encodeURIComponent(this.urlTh(url));
		},
		dItem:function(obj){
			switch(obj.innerText){
				case '迅雷' :
				    var url=$(obj).attr('href');
				    return this.xlDown(url);
				break;
				case '看看' :
				    if(this.kkDapCtrl == null){
				        try {
				            if (window.ActiveXObject) {
				                this.kkDapCtrl = new ActiveXObject("DapCtrl.DapCtrl");
				            } else {
				                var browserPlugins = navigator.plugins;
				                for (var bpi = 0; bpi < browserPlugins.length; bpi++) {
				                    try {
				                        if (browserPlugins[bpi].name.indexOf('Thunder DapCtrl') != -1) {
				                            var e = document.createElement("object");
				                            e.id = "dapctrl_history";
				                            e.type = "application/x-thunder-dapctrl";
				                            e.width = 0;
				                            e.height = 0;
				                            document.body.appendChild(e);
				                            break;
				                        }
				                    } catch(e) {}
				                }
				                this.kkDapCtrl = document.getElementById('dapctrl_history');
				            }
				        } catch(e) {}
			        }
			        var d=true;
			        if(this.kkDapCtrl != null){
			        	try {
			        		var ver = this.kkDapCtrl.GetThunderVer("KANKAN", "INSTALL");
			        		var type = this.kkDapCtrl.Get("IXMPPACKAGETYPE");
			        		if (ver && type && ver >= 672 && type >= 2401) {
			        			this.kkDapCtrl.Put("SXMP4ARG", '"' + $(obj).attr('url') + '" /title "' + $(obj).attr('title') + '" /startfrom "_web_xunbo" /openfrom "_web_xunbo"');
			        			d=false;
			        		}
			        	}catch(e){}
			        }
			        if(d){
			        	if(confirm("请先下载安装迅雷看看，点确定进入迅雷看看官网下载!")){
			        		window.open('http://www.kankan.com/app/xmp.html','','');
			        	}
			        }
				break;
				case '旋风' :
				    var url=$(obj).attr('href');
				    return this.xfDown(url);
				break;
			}
			return true;
		},
		selectALL:function(srcObj){
		    var bol = $(srcObj).attr("checked");
		    $(srcObj).parent().parent().find('[name="down_ck"]').each(function(){
		    	$(this).attr("checked",bol);
		    	});
		},
		downLoadSel:function(srcObj){
		    var selObj=$(srcObj).parent().parent().find('[name="down_ck"]:checked');
		    if( selObj.length < 1 ){
		    	return true;
		    }
		    
		    var urls=[];
		    $(selObj).each(function(){
		    	if($(this).parent().parent().css("display") == "none"){
		    		return true;
		    	}
		    	urls.push($(this).val());
		    	});
		    	
		    switch(srcObj.innerText){
		    	case '迅雷下载选中' :
		    		this.xlDown(urls);
		    	break;
		    	case '旋风下载' :
		    		this.xfDown(urls);
		    	break;
		    	case '旋风离线下载' :
		    		this.xfDown(urls,1);
		    	break;
		    }
		},
		copySel:function(obj){
			var w=obj.width ? obj.width : obj.offsetWidth;
			var h=obj.height ? obj.height : obj.offsetHeight;
			var dTop=$(obj).offset().top;
			var dLeft=$(obj).offset().left;
			var dObj=document.getElementById(this.copyDid);
			var mObj=document.getElementById(this.copyWid);
			$(dObj).css({top:dTop,left:dLeft,width:w,height:h});
			mObj.setText(this.copyTxt);
			mObj.setHandCursor(true);
		},
		iniCopySwf:function(){
			$("body").append('<div id="'+this.copyDid+'" style="position:absolute;width:1px;height:1px;top:-1000px;left:-1000px;z-index:9999;">'+this.copyHTML(1,1)+'</div>');
			$("#"+this.copyDid).bind("mouseout",function(){
				$(this).css({top:-1000,left:-1000});
				});
			$("#"+this.copyDid).bind("mouseup",function(){
				alert("复制成功");
				});
		},
		copyHTML: function(width, height) {
			var html = '';
			var flashvars = 'id=1' + 
				'&width=' + width + 
				'&height=' + height;
				
			if (this.isIE) {
				var protocol = location.href.match(/^https/i) ? 'https://' : 'http://';
				html += '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="'+protocol+'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="100%" height="100%" id="'+this.copyWid+'" align="middle"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="'+this.copySwf+'" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="'+flashvars+'"/><param name="wmode" value="transparent"/></object>';
			}
			else {
				// all other browsers get an EMBED tag
				html += '<embed id="'+this.copyWid+'" src="'+this.copySwf+'" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="100%" height="100%" name="'+this.copyWid+'" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="'+flashvars+'" wmode="transparent" />';
			}
			return html;
		},
		paxDownH5:function(obj){
			$(obj).find(".down-item").each(function(){
				var oTit=$(this).find(".down-title a").eq(0);
				var url=oTit.attr('source-url');
				var tit=oTit.html();
				var xurl=DL.urlTh(url);
				var kktit=tit;
				var ltit=tit.match();
				if(ltit){
					tit='<i>'+ltit[0]+'</i>'+tit;
					kktit=ltit[0];
				}
				oTit.attr('href',xurl);
				oTit.html(tit);
			});
			var otnum=parseInt($(obj).attr('otnum'));
			if(otnum > 0){
				$(obj).append('<div class="down-item dim-more"><span class="dim-show" onclick="DL.dimshow(this)">更多下载('+otnum+')条</span></div>');
			}
			$(obj).parent().find(".dim-btn").each(function(){
				$(this).bind(US.ev.click,function(){
					if('展开' == $(this).html()){
						$(this).parent().parent().find(".down-list").show();
						$(this).html('关闭');
					}else{
						$(this).parent().parent().find(".down-list").hide();
						$(this).html('展开');
					}
					});
				});
		},
		fsize:function(size){
			//kb
			var kb = (size/1024).toFixed(2);
			if ( kb < 1024 ){
				return ""+kb+"KB";
			}
			
			//mb
			var mb = (kb/1024).toFixed(2);
			if(mb < 1024){
				return ""+mb+"MB";
			}
			
			//gb
			var gb = (mb/1024).toFixed(2);
			return ""+gb+"GB";
		},
		dimshow:function(obj){
			if($(obj).attr('st') == 1){
				$(obj).parent().parent().find(".down-item[dt='dim-hide']").hide();
				$(obj).attr('st',0);
			}else{
				$(obj).parent().parent().find(".down-item[dt='dim-hide']").show();
				$(obj).attr('st',1);
			}
		},
		paxDown:function(obj){
			$(obj).find(".down-item").each(function(){
				var oTit=$(this).find(".down-title a").eq(0);
				var url=oTit.attr('source-url');
				var tit=oTit.html();
				var xurl=DL.urlTh(url);
				$(this).prepend('<span class="down-sel"><input name="down_ck" type="checkbox" value="'+url+'" /></span>');
				var kktit=tit;
				var ltit=tit.match();
				if(ltit){
					tit='<i>'+ltit[0]+'</i>'+tit;
					kktit=ltit[0];
				}
				var filesize=0;
				if(url.indexOf('ed2k://') > -1){
					filesize=url.split('|')[3];
				}
				oTit.attr('href',xurl);
				oTit.html(tit+(filesize > 0 ? '<span style="font-size:12px;color:#aaa;">('+DL.fsize(filesize)+')</span>' : ''));
				var dstr='<div class="down-memu">';
				var zms=$(this).attr('zms');
				var dw=0;
				if(zms){
					zms=zms.split(':');
					for(var i=0,e;i<zms.length;i++){
						e=zms[i].split(',');
						dstr+='<span class="down-zm" style="background:'+e[3]+';"><a href="down.php?id='+e[1]+'&ty=zm">'+e[2]+'</a></span>';
					}
				}
				dstr+='<span class="xl"><a href="'+xurl+'" onclick="return DL.dItem(this);">迅雷</a></span>';
				dstr+='<span class="kk"><a href="javascript:void(0)" url="'+xurl+'" title="'+kktit+'" onclick="return DL.dItem(this);">看看</a></span>';
				dstr+='<span class="xf"><a href="'+DL.urlQQ(url)+'" onclick="return DL.dItem(this);">旋风</a></span>';
				dstr+='<span class="lx"><a href="http://lixian.vip.xunlei.com/lixian_login.html?furl='+DL.urlLX(url)+'" onclick="return downLoad(this);" target="_blank">离线</a></span>';
				dstr+='<span class="xm"><a href="https://d.miwifi.com/d2r/?url='+DL.urlXM(url)+'" target="_blank">小米</a></span></div>';
				$(this).append(dstr);
			});
			var otnum=parseInt($(obj).attr('otnum'));
			if(otnum > 0){
				$(obj).append('<div class="down-item dim-more"><input type="checkbox" value="" onclick="DL.selectALL(this)" />全选<a class="down-all" href="javascript:void()" onclick="DL.downLoadSel(this)">迅雷下载选中</a><a class="down-all" href="javascript:void()" onclick="DL.downLoadSel(this)">旋风下载</a><a class="down-all" href="javascript:void()" onclick="DL.downLoadSel(this)">旋风离线下载</a></div>');
			}else{
				$(obj).append('<div class="down-item"><input type="checkbox" value="" onclick="DL.selectALL(this)" />全选<a class="down-all" href="javascript:void()" onclick="DL.downLoadSel(this)">迅雷下载选中</a><a class="down-all" href="javascript:void()" onclick="DL.downLoadSel(this)">旋风下载</a><a class="down-all" href="javascript:void()" onclick="DL.downLoadSel(this)">旋风离线下载</a></div>');
			}
		},
		paxDownOneBoxd:function(fr){
			var url=$('.box-down-main').find(".dsn").eq(1).html();
			var dt=$('.box-down-main').attr("st");
			var zms=$('.box-down-main').attr("zms");
			if(dt == 1){
				url=decodeURIComponent(this.d64(url)).replace(/\+/g,' ');
				$('.box-down-main').find(".dsn").eq(1).html('<input type="text" value="'+url+'" />');
				url=url.match(/http:\/\/[^\s\u4e00-\u9fa5]+/i);
				$('.box-down-main').find(".dsn").eq(3).html('<a href="'+url+'" target="_blank">网盘下载</a>');
			}else if(dt == 3){
				$('.box-down-main').find(".dsn").eq(1).html('<input type="text" value="'+url+'" />');
				$('.box-down-main').find(".dsn").eq(3).html('<a href="'+url+'" target="_blank">下载种子</a>');
			}else{
				var xurl=this.urlTh(url),dstr,kktit;
				$('.box-down-main').find(".dsn").eq(1).html('<input type="text" value="'+xurl+'" />');
				if(fr == 1){
					dstr ='<a class="xl dosna" href="'+xurl+'">迅雷</a>';
				    dstr+='<a class="lx dosna" href="http://lixian.vip.xunlei.com/lixian_login.html?furl='+this.urlLX(url)+'" target="_blank">离线</a>';
				    dstr+='<a class="xm dosna" href="https://d.miwifi.com/d2r/?url='+this.urlXM(url)+'" target="_blank">小米</a>';
				}else{
					kktit=$('.box-down-main').find(".dsn").eq(2).html();
					dstr ='<a class="xl dosna" href="'+xurl+'" onclick="return DL.dItem(this);">迅雷</a>';
				    dstr+='<a class="kk dosna" href="javascript:void(0)" url="'+xurl+'" title="'+kktit+'" onclick="return DL.dItem(this);">看看</a>';
				    dstr+='<a class="xf dosna" href="'+this.urlQQ(url)+'" onclick="return DL.dItem(this);">旋风</a>';
				    dstr+='<a class="lx dosna" href="http://lixian.vip.xunlei.com/lixian_login.html?furl='+this.urlLX(url)+'" onclick="return downLoad(this);" target="_blank">离线</a>';
				    dstr+='<a class="xm dosna" href="https://d.miwifi.com/d2r/?url='+this.urlXM(url)+'" target="_blank">小米</a>';
				}
				$('.box-down-main').find(".dsn").eq(3).html(dstr);
			}
			
			if(fr != 1 && zms){
				zms=zms.split(':');
				var zmstr='';
				for(var i=0,e;i<zms.length;i++){
					e=zms[i].split(',');
					zmstr+='<a class="dosna" style="background:'+e[3]+';color:#fff;" href="down.php?id='+e[1]+'&ty=zm">'+e[2]+'</a>';
				}
				if($('.box-down-main').find('.box-info-item').length > 0){
					$('.box-down-main').append('<div class="box-info-item"><span class="dtn">相关字幕</span><span class="dsn">'+zmstr+'</span></div>');
				}else{
					$('.box-down-main').find("div").before('<span class="dtn">相关字幕</span><span class="dsn">'+zmstr+'</span>');
				}
			}
		},
		init:function(fr){
			if($(".down-list").length > 0){
				this.xlCheck();
				this.iniCopySwf();
				$(".down-list").each(function(){
					if(!fr) {
						DL.paxDown(this);
					}else{
						DL.paxDownH5(this);
					}
				});
			}
			
			if($("#one-down-source").length > 0){
				this.paxDownOneBoxd(fr);
			}
		},
	};
	})(window);
