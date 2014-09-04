/**
	GifCreator
	creates gif from a set of layers
	note: uses actions to deal with the animation panel as there's no js support for it
	@author     Allandt Bik-Elliott
	@version    0.4b
**/

var GifCreator = function () {
	// private properties
	
	// file reference
	var docRef = app.activeDocument;
	preferences.rulerUnits = Units.PIXELS;
	
	// if there's a selection, assume that the document should be duplicated
	if (hasSelection(docRef)) {
		var chanRef = docRef.channels.add();
		chanRef.name = "bounds";
		chanRef.kind = ChannelType.SELECTEDAREA;
		docRef.selection.store( docRef.channels.getByName("bounds"), SelectionType.EXTEND );

		// duplicate document
		docRef = docRef.duplicate();
		
		// load selection
		docRef.selection.load (docRef.channels.getByName("bounds"), SelectionType.EXTEND);
		
		// attempt to crop doc
		try  {
			docRef.crop(docRef.selection.bounds);
		} catch (e) {}
	}
	
	
	// constants
	var DEFAULT_FRAME_TIME  = 3,
		END_FRAME_TIME = 5,
		ACTION_FOLDER = "BannerActions",
		DEFAULT_ACTION = "createAnimationFrame",
		DEFAULT_PATH = "~/Desktop/",
		DEFAULT_NAME = "output",
		DEFAULT_FILESIZE = 50,
		DEFAULT_LOOPS = 3,
		LOOP_ACTION = 'setLoops',
		FILE_SIZE = parseFloat(docRef.width) + "x" + parseFloat(docRef.height),
		END_ACTION = "createAnimationEndFrame",
		COLOUR_SIZES = [256, 128, 64, 56, 48, 40, 32, 28, 24, 20, 16, 14, 12, 10, 8, 6, 4],
		CACHE_FOLDER = Folder.myDocuments + '/photoshopScripts/',
		CACHE_PATH = CACHE_FOLDER + 'savedsettings.txt';
	
	// create folder if doesn't exist
	var cachefolder = new Folder(CACHE_FOLDER);
	if (!cachefolder.exists) cachefolder.create();

	// read in settings cache file
	var savedSettings = new File(CACHE_PATH);
	savedSettings.open ('r');
	var line = savedSettings.readln();

	// get values from csv
	var arSettings = line.split(',');
	savedSettings.close();

	// set names from defaults or cached values
	var startPath = '';
	var startName = '';
	var startSize = 0;
	var startLoops = 0;


	if (arSettings.length > 1) {
		startPath = arSettings[0];
		startName = arSettings[1];
		startSize = parseFloat(arSettings[2]);
		startLoops = parseFloat(arSettings[3]);
	} else {
		startPath = DEFAULT_PATH;
		startName = DEFAULT_NAME;
		startSize = DEFAULT_FILESIZE;
		startLoops = DEFAULT_LOOPS;
	}

	var numLayers = docRef.artLayers.length;
	var curLayer;

	// prompt user to set file path
	var targetPath = prompt ("save file path: ", startPath, "choose a save file path");
	if (!targetPath) return;
	if (targetPath.charAt(targetPath.length - 1) !== "/") targetPath += "/";

	// check to see if director exists. If not, create it
	var targetFolder = new Folder(targetPath);
	if (!targetFolder.exists) targetFolder.create();

	// prompt user to set filename and generate filename-widthxheight
	var targetName =  prompt("save file name: ", startName, "choose a save file name") ;
	if (!targetName) return;
	var targetFile = targetPath + targetName+ "-" + FILE_SIZE;
	if (!targetFile) targetFile = targetPath + startName + "-" + FILE_SIZE;

	// set loop num
	var loopAction = '';
	var numLoops = prompt('number of loops: 1, 2 or 3', startLoops, 'choose number of loops');
	if (numLoops == '1') loopAction = LOOP_ACTION + 1;
	else if (numLoops == '2') loopAction = LOOP_ACTION + 2;
	else loopAction = LOOP_ACTION + 3;

	// fix layers and create animation frames
	for (var i = numLayers - 1; i >= 0; --i) {
		
		curLayer = docRef.artLayers[i];
		//$.writeln(i + " : " +curLayer .name);
		
		if (i == (numLayers - 1) && curLayer.name == "Background") {
			curLayer.remove();
		} else  {
			for (var j = 0; j < docRef.artLayers.length; j++) {
				docRef.artLayers[j].visible = false;
			}
			
			curLayer.visible = true;
			
			// unable to script creating a frame of animation so use action
			if (i == 0) {
				app.doAction (END_ACTION, ACTION_FOLDER);
				app.doAction(loopAction, ACTION_FOLDER);
			}
			else {
				app.doAction(DEFAULT_ACTION, ACTION_FOLDER);
			}
		}
	}

	// save psd
	//$.writeln ("saving in " + targetFile);
	var saveOptions = new PhotoshopSaveOptions();
	saveOptions.layers = true;
	saveOptions.embedColorProfile = true;
	docRef.saveAs (new File(targetFile), saveOptions, false, Extension.LOWERCASE);

	// create gif
	// prompt user to set size
	var saveSize = prompt("target file size in kb: ", startSize, "target size for save");
	if (saveSize) {
		saveSize *= 1024;
	} else {
		return;
	}
	var options = new ExportOptionsSaveForWeb();
	options.format = SaveDocumentType.COMPUSERVEGIF;
	options.colorReduction = ColorReductionType.SELECTIVE;
	options.dither = Dither.NONE;
	options.quality = 0;

	//progress bar
	// thanks to http://www.ps-scripts.com/bb/viewtopic.php?t=786
	var value = 0; 
	var win = new Window("palette{text:'Please wait...',bounds:[100,100,550,140]," + 
				   "progress:Progressbar{bounds:[20,10,430,28] , minvalue:0,value:" + value + "}" +
				   "};"
			 );
	win.progress.maxvalue = COLOUR_SIZES.length;

	// loop through colour sizes array until filesize is under current size from array
	var sizeFound = false;
	var fileRef;
	for (var i = 0; i < COLOUR_SIZES.length; i++) {
		// update progress bar
		win.center(); 
		win.show();
		win.hide();
		win.show();
		win.progress.value++;
		
		// export doc as gif
		fileRef = new File(targetFile + ".gif");
		docRef.exportDocument (fileRef, ExportType.SAVEFORWEB, options);
		if (fileRef.length > saveSize) {
			// destroy old file
			fileRef.remove();
			
			// set colors in options
			options.colors = COLOUR_SIZES[i];
			
			//$.writeln("attempting save with " + COLOUR_SIZES[i] + " colours");
			
			// create file
			docRef.exportDocument (new File(targetFile + ".gif"), ExportType.SAVEFORWEB, options);
		} else {
			// file is already smaller than current value from COLOUR_SIZES so break the loop
			//$.writeln("filesize is " + fileRef.length);
			sizeFound = true;
			break;
		}

		//$.writeln(targetFile + " save with size of " + Math.floor(fileRef.length / 1024) + "kb");
	}

	// if the size isn't found - make the user smile because they have failed miserably
	if (!sizeFound) {
		alert("Couldn't get the gif small enough - maybe you should rethink this");
	} else {
		// cache settings
		savedSettings = new File(CACHE_PATH);
		savedSettings.open ('w');
		savedSettings.write ([targetPath, targetName, (saveSize / 1024), numLoops].toString());
		savedSettings.close();

		// save and close the psd
		docRef.save();
		
		docRef.close (SaveOptions.SAVECHANGES);
		
		if(app.activeDocument) {
			docRef = app.activeDocument;
			docRef.channels.getByName ("bounds").remove();
		}
	}

	// priviledged methods
	// boolean hasSelection
	function hasSelection(docRef) {
		try {
			var sb = docRef.selection.bounds;
			return true;
		} catch(e) { 
			return false;
		}
	}

	// public members
	return {
		toString : function () {
			return 'GifCreator';
		}
	};
};

var gc = new GifCreator();