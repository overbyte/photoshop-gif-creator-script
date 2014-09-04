Photoshop Gif Creator script
============================

Photoshop script to create an optimised gif from a series of layers in a psd. Uses a combination of JavaScript and Actions.

## How to install ##

* Put the GifCreator.jsx into `C:\Program Files\Adobe\Adobe Photoshop CS6 (64 Bit)\Presets\Scripts` (Note: you may have a different version of photoshop so put it in the version you use)
* Load the `BannerActions.atn` file using the Actions palette
* The path to the script may have to be updated by double-clicking on `BannerActions:useScript:Scripts` and setting the filepath for the script
![Update script path](/img/grab-5.png)

## Usage guide ##

This will guide you through a series of steps to create the gif:

* Select the area that the gif will be created from

* You should run the action from the actions palette by using the `useScript` action in the newly-added `BannerActions` folder. A shortcut of Ctrl-F12 has been added.

* Add the path to the directory you wish to save the files in

![Add filepath](/img/grab-0.png)

* Add the desired filename - this will have the size appended to it

![Add filename](/img/grab-1.png)

* Add the desired number of loops (default is 3)

![Add loops](/img/grab-2.png)
* Add the target filesize

![Add filesize](/img/grab-3.png)

This will store this information and will pre-populate the pop-up next time you use it which is useful for doing multiple gifs in the same folder as you can use the same path and filename and the script will automatically add the size as a differentiator. 

The script will then attempt to save a gif at the desired filesize by reducing the number of colours until the filesize is hit. If it can't do it (because the target filesize is not possible to hit at the dimensions / number of frames given), the user will be given a cheerful message to that effect.

## Suggested Workflow ##

* Create the Flash banners using a shared Actionscript file so that all of them run to the same timing
* Create an html page with all of the Flash banners on - a template is recommended
* Screengrab each frame and paste into a Photoshop file
* Delete any unwanted layers for the size being created (some sizes may include extra frames to fit copy in, for instance)
* Set the desired size of the marquee tool in the tool options and use to set the size / position of the selection
![Marquee Tool Options](/img/grab-4.png)
* Run the script using the steps above

## Useful Links ##
