/**
 * WebMedia plugin for showtime by andreus sebes
 *
 *  Copyright (C) 2011 andreus sebes
 *
 * 	ChangeLog:
 *	0.1:
 *	- Test version
 * 
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function(plugin)
{
    var PREFIX = 'webmedia';
    var _TITLE = 'webMedia';
    var _SUBTITLE = 'free internet source media reader';
    var _LOGO = plugin.path+"logo.png";
    var _AUTHOR = 'andreus sebes (andreus.sebes@gmail.com)';
	var _TOS1 = _TITLE+' (referred hereafter as "software"), its author, partners, and associates do not condone piracy.\n\n'+
		_TITLE+' is a hobby project, distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY, without even '+
		'the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\nThe software is intended solely for educational '+
		'and testing purposes, and while it may allow the user to read/listen/watch free online resources from the internet, '+
		'it is required that such user actions must comply with local, federal and country legislation.\n\n'+
		_TITLE+' uses images that are licensed under Creative Commons.\n'+
		'All rights go to the authors.';
	var _TOS2 = 'Furthermore, the author of this software, its partners and associates shall assume NO responsibility, legal or otherwise implied, \n'+
		'for any misuse of, or for any loss that may occur while using '+_TITLE+'.\nYou are solely responsible for complying with the applicable laws '+
		'in your country and you must cease using this software should your actions during '+_TITLE+' operation lead to or may lead to infringement or '+
		'violation of the rights of the respective content copyright holders.\n\n'+
		_TITLE+' is not licensed, approved or endorsed by any online resource proprietary.\n\n'+
		'Do you accept this agreement?';
	var _IMG_UNKNOWN=plugin.path+'resources/others/notidentified_256x256_24.png';
	var _IMG_FAVORITE=plugin.path+'resources/others/favorites_256x256_24.png';
	var _IMG_OFFLINE=plugin.path+'resources/others/offline_256x256_24.png';
	var _IMG_OFFLINE2=plugin.path+'resources/others/offline_256x512_24.png';
	var media	= new Namespace("http://search.yahoo.com/mrss/");
	var lang	= "en-US";
	var osources=null;
	var feed_contents=null;

	// Create startup service
    var service = plugin.createService(_TITLE, PREFIX+":start", "video", true, _LOGO);
	// Create settings
    var settings = plugin.createSettings(_TITLE, _LOGO, _TITLE);
	settings.createInfo("info", _LOGO, _TITLE+" - "+_SUBTITLE+"\n\nPlugin developed by "+_AUTHOR);

	settings.createDivider("Layout settings");
	settings.createBool("bycountry", "Group by country?", true, function(v) { service.bycountry = v; });
	settings.createBool("bytheme", "Group by theme?", true, function(v) { service.bytheme = v; });
	settings.createBool("bypublisher", "Group by publisher?", true, function(v) { service.bypublisher = v; });
	settings.createBool("bytype", "Group by type?", true, function(v) { service.bytype = v; });
	settings.createBool("byfavorites", "Show favorites?", true, function(v) { service.byfavorites = v; });
	//settings.createBool("adult", "Show 'Adult' theme?", false, function(v) { service.adult = v; });
	settings.createDivider("Source settings");
	//For Showtime versions v3.3.328+
	//settings.createMultiOpt("usexmllocalization", "Xml file path option to use:", [['0', 'Merge all'], ['1', 'Option 1', true], ['2', 'Option 2'], ['3', 'Option 3'], ['4', 'Option 4']], function(v) { service.usexmllocalization = v; });
	//For Showtime versions v3.3.327-
	settings.createInt("usexmllocalization", "Xml file path option to use (0=merge):", 1, 0, 4, 1, "", function(v) { service.usexmllocalization = v; });
	settings.createString("xmllocalization1", "1) HTTP/SMB URL for sources xml file:", "", function(v) { service.xmllocalization1 = v; });
	settings.createString("xmllocalization2", "2) HTTP/SMB URL for sources xml file:", "", function(v) { service.xmllocalization2 = v; });
	settings.createString("xmllocalization3", "3) HTTP/SMB URL for sources xml file:", "", function(v) { service.xmllocalization3 = v; });
	settings.createString("xmllocalization4", "4) HTTP/SMB URL for sources xml file:", "", function(v) { service.xmllocalization4 = v; });
	settings.createDivider("Legal settings");
	settings.createBool("tos", "Terms of service accepted?", false, function(v) { service.tos = v; });
	settings.createDivider("Parental control");
	settings.createInt("parentalcontrol", "Block content above level:", 9, 1, 9, 1, "", function(v) { service.parentalcontrol = v; });
	settings.createDivider("Advanced settings");
	settings.createInt("timeout", "RTMP timeout: ", 10, 0, 120, 1, "s", function(v) { service.timeout = v; });
	settings.createInt("probetimeout", "Probe timeout (experimental): ", 0, 0, 120, 1, "s", function(v) { service.probetimeout = v; });
	settings.createBool("debug", "Debug?", false, function(v) { service.debug = v; });
    
	//workaround for "Syntax Error: xml is a reserved identifier"
	function valid_xml(xmltext)
	{
		xmltext=xmltext.toString();
		xmltext=xmltext.replace(/^[\s\S]*?(<[^\?!])/, "$1");

		return xmltext;
	}

	function color_text(o,text)
	{
		if (osources.types!=null)
		{
			for each (var typ in osources.types.item)
				if (typ.title.toString() == o.type.toString())
				{
					if (typ.textcolor.toString()!=null && typ.textcolor.toString()!='') text=text+'<br><font size="1" color="'+typ.textcolor.toString()+'">['+typ.title.toString()+']</font>';
				}
		}
		
		return new showtime.RichText(text);
	}

	function get_settings_file(errortext)
	{
		if (service.usexmllocalization==null) var usexml='1';
		else var usexml=service.usexmllocalization;
		if (usexml!='0')
		{
			if (usexml=='1')  var xmlpath=service.xmllocalization1;
			else if (usexml=='2')  var xmlpath=service.xmllocalization2;
			else if (usexml=='3')  var xmlpath=service.xmllocalization3;
			else if (usexml=='4')  var xmlpath=service.xmllocalization4;
			try
			{
				if (xmlpath=="") var url=plugin.path+'sources.xml';
				else if (xmlpath.toString().match(/http:\/\/|https:\/\/|smb:\/\//i)==null) throw "Security Error: You can only use http/smb path";
				else var url=xmlpath; 
				if (service.debug=='1') showtime.trace("XML files path: "+url);
				if (url.match(/smb:\/\/|http:\/\/|https:\/\//i)!=null) var file_readed=valid_xml(showtime.httpGet(url));
				else var file_readed=valid_xml(showtime.readFile(url));
				osources=new XML(file_readed);
				return true;
			}
			catch (err) { if (service.debug=='1') showtime.trace(err+'\n'+url+'\n'+errortext); return false; }
		}
		else
		{
			try
			{
				var def_readed=false;
				for (var i=1;i<=4;i++)
				{
					if (i==1) var xmlpath=service.xmllocalization1;
					else if (i==2) var xmlpath=service.xmllocalization2;
					else if (i==3) var xmlpath=service.xmllocalization3;
					else if (i==4) var xmlpath=service.xmllocalization4;
					var url='';
					if (xmlpath=="" && def_readed==false) { url=plugin.path+'sources.xml'; def_readed=true; }
					else if (xmlpath=="" && def_readed==true) { url=''; }
					else if (xmlpath.toString().match(/http:\/\/|https:\/\/|smb:\/\//i)==null) throw "Security Error: You can only use http/smb path";
					else url=xmlpath;
					if (url!='')
					{
						if (service.debug=='1') showtime.trace("XML files path ("+i+"): "+url);
						if (url.match(/smb:\/\/|http:\/\/|https:\/\//i)!=null) var file_readed=valid_xml(showtime.httpGet(url));
						else var file_readed=valid_xml(showtime.readFile(url));
						if (i==1) osources=new XML(file_readed);
						else
						{
							var otsources=new XML(file_readed);
							var exist=false;
							for each (var titem in otsources.sources.item)
							{
								exist=false;
								for each (var fitem in osources.sources.item)
									if (fitem.link.toString()==titem.link.toString()) exist=true;
								if (!exist) osources.sources.appendChild(titem);
							}
							for each (var titem in otsources.publishers.item)
							{
								exist=false;
								for each (var fitem in osources.publishers.item)
									if (fitem.link.toString()==titem.link.toString()) exist=true;
								if (!exist) osources.publishers.appendChild(titem);
							}
							for each (var titem in otsources.themes.item)
							{
								exist=false;
								for each (var fitem in osources.themes.item)
									if (fitem.link.toString()==titem.link.toString()) exist=true;
								if (!exist) osources.themes.appendChild(titem);
							}
							for each (var titem in otsources.countries.item)
							{
								exist=false;
								for each (var fitem in osources.countries.item)
									if (fitem.link.toString()==titem.link.toString()) exist=true;
								if (!exist) osources.countries.appendChild(titem);
							}
							for each (var titem in otsources.types.item)
							{
								exist=false;
								for each (var fitem in osources.types.item)
									if (fitem.link.toString()==titem.link.toString()) exist=true;
								if (!exist) osources.types.appendChild(titem);
							}
						}
					}
				}
				return true;
			}
			catch (err) { if (service.debug=='1') showtime.trace(err+'\n'+url+'\n'+errortext); return false; }

		}
	}

	function show_adult(o)
	{
		var show=true;
		if (o.parentalcontrol.toString()!=null)
			if (parseInt(o.parentalcontrol.toString())>parseInt(service.parentalcontrol)) show=false;
		
		return show;
	}

	function searcharr(a,o)
	{
		for(var i = 0; i < a.length; i++)
			if(a[i] == o) return true;
		return false;
	}

	function tp(o)
	{
		return o.replace(/:/gi,' ');
	}

	function is_streaming_media(o)
	{
		if (o.link.toString().match(/rtmp|rstp|mms|pnm|pna|thestreamdb\.com/i)==null) return false;
		else return true;
	}

	function is_web_media(o)
	{
		if (o.type.toString()=="Web Resource") return true;
		else return false;
	}

	function is_web_folder(o)
	{
		if (o.type.toString()=="Web Folder") return true;
		else return false;
	}

	function is_media_available(o,lik)
	{
		try
		{
			if (o==null) var lk=lik;
			else var lk=strip_timeout(o.link.toString());
			if (showtime.canHandle(lk)==true)
			{
				if (service.probetimeout.toString()!="0")
				{
					var ret = showtime.probe(lk+" timeout="+service.probetimeout.toString());
					if (!ret.result) return true;
					else
					{
						if (service.debug=='1') showtime.trace(ret.errmsg+": ->"+lk);
						//Workaround for unprobable URLs with timeout (Unhandled HTTP response 400)
						if (is_streaming_media(lk)) return false;
						else
						{
							var ret2 = showtime.probe(lk);
							if (!ret2.result) return true;
							else
							{
								if (service.debug=='1') showtime.trace(ret2.errmsg+": ->"+lk);
								return false;
							}
						}
					}
				}
				else return true;
			}
			else
			{
				if (service.debug=='1') showtime.trace("Showtime can't handle URL: ->"+lk);
				return false;
			}
		}
		catch (err)
		{
			if (service.debug=='1') showtime.trace(ret.errmsg+" ->"+lk);
			return false;
		}
	}

	function strip_timeout(lk)
	{
		lk=lk.toString().replace(/ timeout=([0-9]*)/i,'');
		return lk.toString().replace(/\n/i,'');
	}

	function add_stream_option(page, o)
	{
		var streamingtype=(o.type.toString()=="Live TV")?"video":"audio";
		if (o.link.toString().match(/thestreamdb\.com/i)!=null)
		{
			try
			{
				var nlink=showtime.httpGet(o.link).toString();
				if (service.debug=='1')
				{
					var parts=nlink.toString().split(" ");
					showtime.trace("StreamDB:");
					for (var x in parts)
						showtime.trace("- "+parts[x]);
				}
			}
			catch (err) { var nlink=''; }
		}
		else var nlink=o.link;
		if (nlink!='' && is_media_available(null,strip_timeout(nlink))) page.appendItem(strip_timeout(nlink)+" timeout="+service.timeout.toString(), streamingtype, {title: color_text(o,o.title), icon: get_image(o, null,"publisher") });
		else page.appendItem(PREFIX+":offline", "image", {title: color_text(o,"[X] "+o.title), icon: get_image(o, null,"publisher") });
		if (service.debug=='1') showtime.trace("Live: "+o.title.toString()+" "+o.type.toString());
	}

	function get_image(o,s,w)
	{
		var img='';
		if (o!=null && o.thumbnail!=null && o.thumbnail.toString()!='') img=o.thumbnail.toString();
		else
		{
			if (w=="country" && osources.countries!=null)
			{
				var test=(s!=null)?s:o.country;
				for each (var coun in osources.countries.item.(title.indexOf(test)==0))
					if (coun.title.toString() == test) img=coun.image.toString();
			}
			else if (w=="theme" && osources.themes!=null)
			{
				var test=(s!=null)?s:o.theme;
				for each (var the in osources.themes.item.(title.indexOf(test)==0))
					if (the.title.toString() == test) img=the.image.toString();
			}
			else if (w=="publisher" && osources.publishers!=null)
			{
				var test=(s!=null)?s:o.publisher;
				for each (var pub in osources.publishers.item.(title.indexOf(test)==0))
					if (pub.title.toString() == test) img=pub.image.toString();
			}
			else if (w=="type" && osources.types!=null)
			{
				var test=(s!=null)?s:o.type;
				for each (var typ in osources.types.item.(title.indexOf(test)==0))
					if (typ.title.toString() == test) img=typ.image.toString();
			}
		}
		//if (service.debug=='1') showtime.trace("Image: |"+img+"|");
		if (img=='') return null;
		else return img.replace(/\[WEBMEDIA\]/gi,plugin.path);
	}

	// FEED ITEM functions
	function get_feeditem_media_type(feeditem)
	{
		if (feeditem.media::content.@type.toString()!='') return feeditem.media::content.@type.toString();
		else if (feeditem.enclosure.@type.toString()!='') return feeditem.enclosure.@type.toString();
		else return '';
	};

	function get_feeditem_thumbnail(feeditem)
	{
		var media_type=get_feeditem_media_type(feeditem);
		var item_icon='';
		if (media_type.indexOf("image")!=-1) item_icon=plugin.path+'resources/others/imagecast_200x400_24.png';
		else if (media_type.indexOf("audio")!=-1) item_icon=plugin.path+'resources/others/podcast_200x400_24.png';
		else if (media_type.indexOf("video")!=-1) item_icon=plugin.path+'resources/others/videocast_200x400_24.png';
		else item_icon=plugin.path+'resources/others/rssfeed_200x400_24.png';
		if (feed_contents.channel.image.url.toString()!='') item_icon=feed_contents.channel.image.url.toString();
		else if (feeditem.media::thumbnail.@url.toString()!='') item_icon=feeditem.media::thumbnail.@url.toString();
		else if (feeditem.media::content.@url.toString()!='' && media_type.indexOf("image")!=-1) item_icon=feeditem.media::content.@url.toString();
		else if (feeditem.enclosure.@url.toString()!='' && media_type.indexOf("image")!=-1) item_icon=feeditem.enclosure.@url.toString();
		else
		{
			var img_desc=feeditem.description.match(/src=\"([^"]+)\"/gi);
			if (img_desc!=null)
				for (var i=0; i<img_desc.length;i++)
					if (img_desc[i].toString().match(/doubleclick\.net|feedburner\.com|weborama\.fr/i)==null) item_icon=img_desc[i].replace(/src=\"([^"]+)\"/gi,'$1').replace(/&amp;/g,'&').replace(/&amp;/g,'&');
		}

		return item_icon;
	};
	function get_feeditem_content_type(feeditem)
	{
		var media_type=get_feeditem_media_type(feeditem);
		if (media_type.indexOf("image")!=-1) return "video";//"image";
		else if (media_type.indexOf("audio")!=-1) return "audio";//"audio";
		else if (media_type.indexOf("video")!=-1) return "video";
		else return "video";
	};
	function get_feeditem_title(feeditem,count)
	{
		return (feeditem.title.toString()=='')?'Item '+(count+1):feeditem.title.toString().replace(/(<([^>]+)>)/gi);
	};
	function get_feeditem_description(feeditem)
	{
		return new showtime.RichText(feeditem.description.toString());
	};

	function startPage(page)
	{
		if (service.tos!='1')
		{
			showtime.message(_TOS1, true, false);
			if (showtime.message(_TOS2, true, true)) service.tos = 1;
			else
			{
				page.error("Terms of service haven't been accepted.\nYou cannot use "+_TITLE+" without accepting the Terms of service.");
				return;
			}
		}

		//Load XML files
		if (get_settings_file('Sources list not loaded')==false) { showtime.message('Sources list not loaded!\nCheck your sources xml file URL/path.', true, false); return; }

		// Page properties
		page.metadata.title = _TITLE+" - "+_SUBTITLE;
		page.metadata.logo = _LOGO;
		page.type = "directory";
		page.contents = "items";

		// Page content
		if (service.bycountry!='1' && service.bytheme!='1' && service.bypublisher!='1' && service.bytype!='1' && service.byfavorites!='1')
		{
			var count=0;
			for each (var fee in osources.sources.item)
			{
				if (show_adult(fee))
				{
					if (is_web_media(fee)) page.appendItem(fee.link.toString(), "item", { title: color_text(fee,fee.title), icon: get_image(fee,null,"publisher") });
					else if (is_web_folder(fee)) page.appendItem(fee.link.toString(), "directory", { title: color_text(fee,fee.title), icon: get_image(fee,null,"publisher") });
					else if (is_streaming_media(fee)) add_stream_option(page, fee);
					else page.appendItem(PREFIX+":browse:None:All:All:All:All:All:"+count, "item", { title: color_text(fee,fee.title), icon: get_image(fee,null,"publisher") });
				}
				count++;
			}
		}
		else
		{
			page.appendItem(PREFIX+":browse:None:All:All:All:All:All", "directory", { title: 'All items' });
			if (service.bycountry=='1') page.appendItem(PREFIX+":group:bycountry", "directory", { title: 'By country' });
			if (service.bytheme=='1') page.appendItem(PREFIX+":group:bytheme", "directory", { title: 'By theme' });
			if (service.bypublisher=='1') page.appendItem(PREFIX+":group:bypublisher", "directory", { title: 'By publisher' });
			if (service.bytype=='1') page.appendItem(PREFIX+":group:bytype", "directory", { title: 'By type' });
			if (service.byfavorites=='1') page.appendItem(PREFIX+":browse:byfavorites:All:All:All:All:Yes", "directory", { title: 'Favorites', icon: _IMG_FAVORITE });
		}

		page.loading = false;
	}

	plugin.addURI(PREFIX+":group:(.*)", function(page, filter)
	{
		// Page properties
		page.metadata.title = _TITLE+' > By '+filter.replace(/by/,'');
		page.metadata.logo = _LOGO;
		page.type = "directory";
		page.contents = "items"

		// Page content
		var aitem=new Array();
		var notidentified=0;
		for each (var fee in osources.sources.item)
		{
			if (show_adult(fee))
			{
				if (filter=='bycountry') var fee_field=fee.country;
				else if (filter=='bytheme') var fee_field=fee.theme;
				else if (filter=='bypublisher') var fee_field=fee.publisher;
				else if (filter=='bytype') var fee_field=fee.type;
				if (fee_field.length()==0) notidentified=1;
				for each (var subit in fee_field)
				{
					//showtime.message(fee.publisher+'|'+subit+'|',true,false);
					if (subit=='') notidentified=1;
					else
					{
						if (searcharr(aitem,subit)==false) 
						{
							//showtime.message(subit,true,false);
							if (filter=='bycountry') page.appendItem(PREFIX+":browse:"+filter+":"+tp(subit)+":All:All:All:All", "directory", { title: subit, icon: get_image(null,subit,"country") });
							else if (filter=='bytheme') page.appendItem(PREFIX+":browse:"+filter+":All:"+tp(subit)+":All:All:All", "directory", { title: subit, icon: get_image(null,subit,"theme") });
							else if (filter=='bypublisher') page.appendItem(PREFIX+":browse:"+filter+":All:All:"+tp(subit)+":All:All", "directory", { title: subit, icon: get_image(null,subit,"publisher") });
							else if (filter=='bytype') page.appendItem(PREFIX+":browse:"+filter+":All:All:All:"+tp(subit)+":All", "directory", { title: subit, icon: get_image(null,subit,"type") });
							aitem.push(subit);
						}
					}
				}
			}
		}
		if (notidentified==1)
		{
			if (filter=='bycountry') page.appendItem(PREFIX+":browse:"+filter+":None:All:All:All:All", "directory", { title: "Not identified", icon: _IMG_UNKNOWN });
			else if (filter=='bytheme') page.appendItem(PREFIX+":browse:"+filter+":All:None:All:All:All", "directory", { title: "Not identified", icon: _IMG_UNKNOWN });
			else if (filter=='bypublisher') page.appendItem(PREFIX+":browse:"+filter+":All:All:None:All:All", "directory", { title: "Not identified", icon: _IMG_UNKNOWN });
			else if (filter=='bytype') page.appendItem(PREFIX+":browse:"+filter+":All:All:All:None:All", "directory", { title: "Not identified", icon: _IMG_UNKNOWN });
		}

		page.loading = false;
	});

	plugin.addURI(PREFIX+":browse:(.*):(.*):(.*):(.*):(.*):(.*)", function(page, filter, coun, the, pub, typ, fav)
	{
		// Page properties
		if (filter=='bycountry') page.metadata.title = _TITLE+' > By country ('+coun+') > Browse';
		else if (filter=='bytheme') page.metadata.title = _TITLE+' > By theme ('+the+') > Browse';
		else if (filter=='bypublisher') page.metadata.title = _TITLE+' > By publisher ('+pub+') > Browse';
		else if (filter=='bytype') page.metadata.title = _TITLE+' > By type ('+typ+') > Browse';
		else if (filter=='byfavorites') page.metadata.title = _TITLE+' > Favorites > Browse';
		else if (filter=='None') page.metadata.title = _TITLE+' > Browse';
		page.metadata.logo = _LOGO;
		page.type = "directory";
		page.contents = "items"
		page.loading = false;

		// Page content
		var count=0;
		for each (var fee in osources.sources.item)
		{
			if (show_adult(fee))
			{
				var notidentified=0;
				if (filter!="None")
				{
					if (filter=='bycountry') { var fee_field=fee.country; var field=coun; }
					else if (filter=='bytheme') { var fee_field=fee.theme; var field=the; }
					else if (filter=='bypublisher') { var fee_field=fee.publisher; var field=pub; }
					else if (filter=='bytype') { var fee_field=fee.type; var field=typ; }
					else if (filter=='byfavorites') { var fee_field=fee.favorite; var field=fav; }
					if (fee_field.length()==0 && field=="None" && notidentified==0) //All: Not Identified group
					{
						if (is_web_media(fee)) page.appendItem(fee.link.toString(), "item", { title: color_text(fee,fee.title), icon: get_image(fee,null,"publisher") });
						else if (is_web_folder(fee)) page.appendItem(fee.link.toString(), "directory", { title: color_text(fee,fee.title), icon: get_image(fee,null,"publisher") });
						else if (is_streaming_media(fee)) add_stream_option(page, fee);
						else page.appendItem(PREFIX+":browse:"+filter+":"+coun+":"+the+":"+pub+":"+typ+":"+fav+":"+count, "item", { title: color_text(fee,fee.title), icon: get_image(fee,null,"publisher") });
						notidentified=1;
					}
					for each (var subit in fee_field)
					{
						if ((tp(subit)==field) || (subit=='' && field=="None" && notidentified==0)) //Filter: Group || Not Identified group
						{
							if (is_web_media(fee)) page.appendItem(fee.link.toString(), "item", { title: color_text(fee,fee.title), icon: get_image(fee,null,"publisher") });
							else if (is_web_folder(fee)) page.appendItem(fee.link.toString(), "directory", { title: color_text(fee,fee.title), icon: get_image(fee,null,"publisher") });
							else if (is_streaming_media(fee)) add_stream_option(page, fee);
							else page.appendItem(PREFIX+":browse:"+filter+":"+coun+":"+the+":"+pub+":"+typ+":"+fav+":"+count, "item", { title: color_text(fee,fee.title), icon: get_image(fee,null,"publisher") });
						}
					}
				}
				else //No filter: All
				{
					if (is_web_media(fee)) page.appendItem(fee.link.toString(), "item", { title: color_text(fee,fee.title), icon: get_image(fee,null,"publisher") });
					else if (is_web_folder(fee)) page.appendItem(fee.link.toString(), "directory", { title: color_text(fee,fee.title), icon: get_image(fee,null,"publisher") });
					else if (is_streaming_media(fee)) add_stream_option(page, fee);
					else page.appendItem(PREFIX+":browse:"+filter+":"+coun+":"+the+":"+pub+":"+typ+":"+fav+":"+count, "item", { title: color_text(fee,fee.title), icon: get_image(fee,null,"publisher") });
				}
			}
			count++;
		}
		page.loading = false;
	});

	plugin.addURI(PREFIX+":browse:(.*):(.*):(.*):(.*):(.*):(.*):([0-9]+)", function(page, filter, coun, the, pub, typ, fav, feedid)
	{
		// Page properties
		if (filter=='None') page.metadata.title = _TITLE+' > Browse > '+osources.sources.item[feedid].title;
		else page.metadata.title = _TITLE+' > ... > Browse > '+osources.sources.item[feedid].title;
		page.metadata.logo = _LOGO;
		page.type = "directory";
		page.contents = "list";

		try
		{
			feed_contents = new XML(valid_xml(showtime.httpGet(osources.sources.item[feedid].link)));
			var count=0;
			for each (var feed_item_content in feed_contents.channel.item)
			{
				var media_type=get_feeditem_media_type(feed_item_content);
				var item_icon=get_feeditem_thumbnail(feed_item_content);
				var content_type=get_feeditem_content_type(feed_item_content);
				var item_title=get_feeditem_title(feed_item_content,count);
				var item_desc=get_feeditem_description(feed_item_content);
				if (osources.sources.item[feedid].type!="RSS feed")
				{
					var media_content=(feed_item_content.enclosure.@type.toString()!='')?feed_item_content.enclosure:feed_item_content.media::content;
					var media_type=media_content.@type;
					var media_length=media_content.@length;
					var media_url=media_content.@url;
					//var timeout=" timeout="+service.timeout.toString();
					if (is_media_available(null,media_url)) page.appendItem(media_url, content_type, { title: item_title, description: item_desc, year: feed_item_content.pubDate, icon: item_icon });
					else page.appendItem(PREFIX+":offline", content_type, { title: "[X] "+item_title, description: item_desc, year: feed_item_content.pubDate, icon: item_icon });
				}
				else page.appendItem(PREFIX+":browse:"+filter+":"+coun+":"+the+":"+pub+":"+typ+":"+fav+":"+feedid+"-"+count, content_type, { title: item_title, description: item_desc, year: feed_item_content.pubDate, icon: item_icon });
				count=count+1;
				if (service.debug=='1') showtime.trace(item_title+'\n->'+item_icon);
			}
		}
		catch (err) { showtime.message(err+'\n'+osources.sources.item[feedid].link+'\nFeed not loaded', true, false); }
		page.loading = false;
	});

	plugin.addURI(PREFIX+":browse:(.*):(.*):(.*):(.*):(.*):(.*):([0-9]+-[0-9]+)", function(page, filter, coun, the, pub, typ, fav, feedanditemid)
	{
		// Page properties
		var parts=feedanditemid.toString().split("-");
		var feedid=parts[0];
		var feeditemid=parts[1];
		page.metadata.title = _TITLE+' > ... > '+feed_contents.channel.item[feeditemid].title;
		page.metadata.logo = _LOGO;
		page.type = "item";
		page.metadata.icon=_IMG_UNKNOWN;
		
		// Page content
		var feed_item_content=feed_contents.channel.item[feeditemid];
		var item_icon=get_feeditem_thumbnail(feed_item_content);
		var item_title=get_feeditem_title(feed_item_content,feeditemid);
		var item_desc=get_feeditem_description(feed_item_content);
		page.metadata.icon= item_icon;
		if (feed_item_content.title!='') page.appendPassiveItem("label", item_title, { title: "Title"});
		if (feed_item_content.pubDate!='') page.appendPassiveItem("label", feed_item_content.pubDate, { title: "Data"});
		if (feed_item_content.link!='') page.appendPassiveItem("label", feed_item_content.link, { title: "Link"});
		page.appendPassiveItem("divider");
		page.appendPassiveItem("bodytext", item_desc);
		var prev=parseInt(feeditemid)-1;
		var next=parseInt(feeditemid)+1;
		page.appendAction("navopen",PREFIX+":browse:"+filter+":"+coun+":"+the+":"+pub+":"+typ+":"+fav+":"+feedid, true, { title: "Back to list" });
		if (prev>=0)
		{
			//var prev_title=(feed_contents.channel.item[prev].title.toString()=='')?'Item '+prev:feed_contents.channel.item[prev].title.toString();
			page.appendAction("navopen",PREFIX+":browse:"+filter+":"+coun+":"+the+":"+pub+":"+typ+":"+fav+":"+feedid+"-"+prev, true, { title: "<< Previous item" });
		}
		if (next<feed_contents.channel.item.length())
		{
			//var next_title=(feed_contents.channel.item[next].title.toString()=='')?'Item '+next:feed_contents.channel.item[next].title.toString();
			page.appendAction("navopen",PREFIX+":browse:"+filter+":"+coun+":"+the+":"+pub+":"+typ+":"+fav+":"+feedid+"-"+next, true, { title: "Next item >>" });
		}
		//page.appendAction("navopen", feed_item_content.link.toString(), true,{ title: "View in web browser (not working)" });
		page.loading = false;
	});

	plugin.addURI(PREFIX+":offline", function(page)
	{
		page.metadata.title = _TITLE+' > Offline';
		page.type = "item";
		page.metadata.icon=_IMG_OFFLINE;
		page.appendPassiveItem("label", "This content is offline", { title: "Title"});
		page.loading = false;
	});

	//Start plugin
	plugin.addURI(PREFIX+":start", startPage);

})(this);
