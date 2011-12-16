webMedia plugin for Showtime
============================

webMedia plugin for Showtime is a free internet source media reader. 

Can read RSS feeds, Imagecast, Podcast, Videocast, Live TV/Radio (rtmp) and web media resources avaivable from url.

I build this plugin for my own use because i wanted more than current Showtime plugins can give. 

The purpose of this plugin is to have the possibility to read free media sources avaivable in the Internet.

I thanks Andreas Öman for this wonderfull application that is Showtime and for all the plugin documentation.
I also thanks facanferff and NP for their excelent plugins.

## Release notes

1.0 - Initial version:

-  Read RSS feeds (RSS, Imagecast, Podcast and Videocast)
-  Read Live TV and Live Radio (rtmp)
-  Read web media source from URL
-  Settings for choose if want to aggregate sources
   -  By publisher
   -  By theme
   -  By country (242 countries by default)  
   -  By type (7 types by default)
-  Read up to four XML data filesfrom HTTP or SMB
-  Just need one XML. Just need one URL. No need for a HTTP folder.
-  You can choose parental control level (1 to 9) for each source
-  You can choose if each source is your favorite
-  Extremely flexible, for each source, you can have a simple xml with title and link or a more complex xml with title, link, thumbnail, themes, publisher, country, type, parental control and if is your favorite 
-  Some debug settings

## Licence notes

(c) 2011 andreus sebes [andreus.sebes@gmail.com](mailto:andreus.sebes@gmail.com)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.

webMedia plugin uses images that are licensed under Creative Commons and some fetched from the internet. All rights go to the authors.

## Installing

webMedia, is available directly from Showtime plugin repository. Just install it from there (the puzzle peace in showtime homepage right top corner).

## Configuring

### The sources XML file

webMedia reads the sources XML file for adding the media sources. 

By default, and only for example purposes, the path of this file is inside the zip of the plugin localizated in Showtime directory.

But, you can, and should change the localization of this file file by putting HTTP or SMB paths in the plugin settings.

Examples:

-  SMB: smb://192.168.1.10/webmedia/sources.xml
-  HTTP: http://192.168.1.10/webmedia/sources.xml
-  HTTP: http://pastehtml.com/view/bfsgjamdn.html
-  HTTP: http://pastebin.com/raw.php?i=WDVC940d

### Creating sources XML URLs

Just use the [webMedia XML maker](http://pastehtml.com/view/bhb04q5or.html).

### Editing sources XML URLs

Just use the [webMedia XML maker](http://pastehtml.com/view/bhb04q5or.html) for creating a new sources xml URL and then add the new `<item>` tags to your old sources xml URL.

### Live TV/Radio RTMPs

webMedia, like watchTV plugin (by facanferff), can read rtmp links for Live TV/Radio.
If you want to see more about rtmp links read the [excellent tutorial made by facanferff](http://psx-scene.com/forums/content/tutorial-get-rtmp-links-tv-streams-others-1288/).

### Other

You can use `[WEBMEDIA]` for indicating a local path inside the plugin file.
There is a folder "resources" inside the plugin zip file which contains a subfolder for each group. You can use it.

## Known issues/Questions/FAQ (with Showtime v3.3.328)

### PROBLEM 1

In PS3, i want to change the localization of the xml file but showtime doesn't let me enter text.

The problem is that Showtime doesn't have a virtual keyboard.
This is a Showtime problem. There are several issues registed: https://www.lonelycoder.com/redmine/issues/2; https://www.lonelycoder.com/redmine/issues/680; https://www.lonelycoder.com/redmine/issues/687

Workaround: You have 2 options:

1.  Connect a USB keyboard to your PS3, then, in showtime, go to webMedia plugin settings and manualy add your HTTP/SMB URL
2.  Use a FTP filemanger and manualy change the configuration file of the plugin. This file is in:
    Showtime: `/dev_hdd0/game/HTSS00003/USRDIR/settings/settings/plugins/webmedia`
    Showtime (Multiman version): `/dev_hdd0/game/BLES80608/USRDIR/st_settings/settings/plugins/webmedia`
	
    Just add/change the line: `"xmllocalization1": "xxxxxxxxxxx",`

### PROBLEM 2

It takes very time to show the sources.

If you enable probe timeout, webMedia probes the sources before displaying it, there is a setting for configuring the probe timeout. But this is not having any effect.
This is a Showtime problem. There is an issue registed: [Timeout not working](https://www.lonelycoder.com/redmine/issues/778)

### PROBLEM 3

I accepted the ToS, but when i restart Showtime it appear again.

The problem is that Showtime can't save to disk realtime setting change.
This is a Showtime problem. There is an issue registed: [Save a setting in real time](https://www.lonelycoder.com/redmine/issues/780)

Workaround: You can force it in the plugin settings.

### PROBLEM 4

I want to use an ATOM feed that webMedia does not read.

webMedia doesn't read Atom feeds.

Workaround: Use a website to convert it in real time: [AtomToRSS](http://devtacular.com/utilities/atomtorss/) or [Atom2RSS](http://atom2rss.appspot.com/)

### PROBLEM 5

I want to open the RSS feed item link in the browser.

Showtime doesn't support this.