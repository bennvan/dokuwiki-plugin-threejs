# threejs plugin for DokuWiki

Syntax for embedding threejs components. Currently only mesh files supported. 

![Example output](example.png "Example output")


## Features

 - Support for displaying mesh file formats (3MF, STL)
 - Flags to set model colour and wireframe
 - Autoload scene if file size is small (default = 0.5mb), except when on a mobile device.
 - Integrated with dokuwiki move plugin to re-write links accordingly
 - Works with other plugins such as latexcaption

## Syntax
Syntax is identical to dokuwiki media.
 - Spaces either side of the curly braces represent alignment
 - Flags to set canvas width/height and other model specific settings (colour etc).
 
|Flag|Description  | Default
|--|--|--|
| ..x.. | Width and height in px. If only one value it is assumed width, and height is calculated to maintain 16:9 aspect ratio.  | 100% width, 600px |
| wireframe | Display mesh wireframe | Disabled | 
| color | W3C color name or hex value | #00398a |


### Examples:
A centered canvas with default size (100% width, 600px height), with the title "Some model".

     {{ .path_to_model.3mf|Some model }}

Right aligned with canvas size 600x400px, wireframe on, and set model colour green.

     {{ .path_to_model.3mf?600x400&wireframe&color=green}}

## Aditional Info

If you install this plugin manually, make sure it is installed in
lib/plugins/threejs/ - if the folder is called different it
will not work!

Please refer to http://www.dokuwiki.org/extensions for additional info
on how to install extensions in DokuWiki.

----
Copyright (C) Ben van Magill <ben.vanmagill16@gmail.com>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; version 2 of the License

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

See the LICENSING file for details
