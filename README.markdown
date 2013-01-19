WEBmedia plugin for Showtime
============================

WEBmedia plugin for Showtime is a free internet source media reader. 

Can read RSS feeds, Imagecast, Podcast, Videocast, Live TV/Radio (RTMP), Web Resources and Web Folders.

I build this plugin for my own use because i wanted more than current Showtime plugins can give. 

The purpose of this plugin is to have the possibility to read free media sources avaivable in the Internet.

I thanks Andreas Öman for this wonderfull application that is Showtime and for all the plugin documentation.
I also thanks facanferff and NP for their excelent plugins.

Git: https://github.com/andreus-sebes/showtime-plugin-webmedia

## Release notes

1.2 - working on Showtime 4.0:

-  Fixes to work on Showtime 4.0
-  Remove live event from xml builder an replace with on event

1.1 - New logo, new features, bug fixes and small improvements:

-  Two new types added:
   -  Web Resource: For direct links to media content
   -  Web Folder: For direct links to web folders (accepts HTTP/SMB folders)
-  Allows to use thestreamdb.com links as sources
-  Resolved several bugs in RSS feed reading
-  Sources example file with new images for themes
-  New logo (all credits go to Girish)
-  Several minor improvements

1.0 - Initial version:

-  Read RSS feeds (RSS, Imagecast, Podcast and Videocast)
-  Read Live TV and Live Radio (RTMP)
-  Settings for choose if want to aggregate sources
   -  By publisher
   -  By theme
   -  By country (242 countries by default)  
   -  By type (8 types by default)
-  Read up to four sources URL from HTTP or SMB (just one URL needed)
-  You can choose parental control level (1 to 9) for each source
-  You can choose if each source is your favorite
-  Extremely flexible, for each source, you can have a simple xml with title and link or a more complex xml with title, link, thumbnail, themes, publisher, country, type, parental control and if is your favorite 
-  Some debug settings

## Licence notes

(c) 2011 andreus sebes [andreus.sebes@gmail.com](mailto:andreus.sebes@gmail.com)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.

WEBmedia plugin uses images that are licensed under Creative Commons and some fetched from the internet. All rights go to the authors.

## Installing

WEBmedia, is available directly from Showtime plugin repository. Just install it from there (the puzzle peace in showtime homepage right top corner).

WEBmedia, works better with the most recent versions of Showtime:

- Official versions: https://www.lonelycoder.com/showtime/download

## Configuring

### The sources XML file

WEBmedia reads the sources XML file for adding the media sources. 

By default, and only for example purposes, the path of this file is inside the zip of the plugin localizated in Showtime directory.

But, you can, and should change the localization of this file file by putting HTTP or SMB paths in the plugin settings.

Examples:

-  SMB: [smb://192.168.1.10/webmedia/sources.xml](smb://192.168.1.10/webmedia/sources.xml)
-  HTTP: http://192.168.1.10/webmedia/sources.xml
-  HTTP: http://pastehtml.com/view/bfsgjamdn.html
-  HTTP: http://pastebin.com/raw.php?i=WDVC940d

### Creating sources XML URLs

Just use the [WEBmedia XML maker](http://pastehtml.com/view/cplz4osfs.html).

Get other user sources URL and share your sources URL [here](http://psx-scene.com/forums/f254/webmedia-plugin-showtime-rss-feed-imagecast-podcast-videocast-live-tv-radio-reader-share-your-xml-url-sources-file-99321/).

### Editing sources XML URLs

Just use the [WEBmedia XML maker](http://pastehtml.com/view/cplz4osfs.html) for creating a new sources xml URL and then add the new `<item>` tags to your old sources xml URL.

### Live TV/Radio RTMPs

WEBmedia, like watchTV plugin (by facanferff), can read rtmp links for Live TV/Radio.
If you want to see more about rtmp links read the [excellent tutorial made by facanferff](http://psx-scene.com/forums/content/tutorial-get-rtmp-links-tv-streams-others-1288/).

### Internal paths

You can use `[WEBMEDIA]` for indicating a local path inside the plugin file.
There is a folder "resources" inside the plugin zip file which contains a subfolder for each group. You can use it.

## Known issues/Questions/FAQ (with Showtime v3.3.344)

### Terms of service appear everytime i start WEBmedia!

The problem is that Showtime can't save to disk realtime setting change. There is an issue registed: [Save a setting in real time](https://www.lonelycoder.com/redmine/issues/780)

Workaround: You can force it in the plugin settings.

### Atom feeds not loading?

WEBmedia doesn't read Atom feeds, only RSS 2.0 feeds.

Workaround: Use a website to convert it in real time to RSS: [AtomToRSS](http://devtacular.com/utilities/atomtorss/) or [Atom2RSS](http://atom2rss.appspot.com/)

### Can't open RSS item in browser?

Showtime doesn't support this.

### Some video format are not loading?

Showtime only accepts some formats and some live emission protocols. When that happens WEBmedia will mark items with an italic and a grey color. See [Showtime foruns](https://www.lonelycoder.com/redmine/projects/showtime/boards) for more information

### I enabled probe timeout and now it takes very time to show the sources!

If you enable probe timeout, WEBmedia tests the availability of the sources before displaying it. 
Showtime can't process the timeout, so it his having any effect. There is an issue registed: [Timeout not working](https://www.lonelycoder.com/redmine/issues/778)

