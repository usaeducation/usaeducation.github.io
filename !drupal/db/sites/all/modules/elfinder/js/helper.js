// $Id: helper.js 100 2011-02-20 19:14:25Z ph0enix $

Drupal.elfinder = {
  editor: {
  
  }

}


/**
 * @class  elFinder command "search"
 * Find files
 *
 * @author Dmitry (dio) Levashov
 **/
elFinder.prototype.commands.search = function() {
	this.title          = 'Find files';
	this.options        = {ui : 'searchbutton'}
	this.alwaysEnabled  = true;
	this.updateOnSelect = false;
	
	/**
	 * Return command status.
	 * Search does not support old api.
	 *
	 * @return Number
	 **/
	this.getstate = function() {
		return 0;
	}
	
	/**
	 * Send search request to backend.
	 *
	 * @param  String  search string
	 * @return $.Deferred
	 **/
	this.exec = function(q) {
		var fm = this.fm;
		
		if (typeof(q) == 'string' && q) {
			return fm.request({
				data   : {cmd : 'search', elfinder_search_q : q},
				notify : {type : 'search', cnt : 1, hideCnt : true}
			});
		}
		fm.getUI('toolbar').find('.'+fm.res('class', 'searchbtn')+' :text').focus();
		return $.Deferred().reject();
	}

}

elFinder.prototype.commands.test134 = function() {
	this.title          = 'Test Command';
	//this.options        = {ui : 'uploadbutton'}
	this.alwaysEnabled  = true;
	this.updateOnSelect = false;
	this.state = 0;
	
	this.getstate = function() {
		return 0;
	}
	
	/**
	 * Send search request to backend.
	 *
	 * @param  String  search string
	 * @return $.Deferred
	 **/
	this.exec = function(q) {
		var fm = this.fm;
    
    alert('test command. arg='+q);
		
		return $.Deferred().reject();
	}

}

/* elFinder.prototype._options used in latest dev */

//elFinder.prototype._options.contextmenu.files.push('|');
//elFinder.prototype._options.contextmenu.files.push('|');

$().ready(function() {
  var uiopts = elFinder.prototype._options.uiOptions.toolbar;

  var newOpts = new Array();

  var disabledCommands = Drupal.settings.elfinder.disabledCommands;
  
  /*var uiopts1 = elFinder.prototype._options.commands;

  var newCommands = Array();
  
  for (var i in uiopts1) {
    var found = false;
    for (var k in disabledCommands) {
      if (disabledCommands[k] == uiopts1[i]) {
       found = true;
      }
    }
    
    if (found == false) {
      newCommands.push(uiopts1[i]);
    }
  }
  
  elFinder.prototype._options.commands = newCommands;
  elFinder.prototype._options.contextmenu.files.push('|');
  elFinder.prototype._options.contextmenu.files.push('rename');*/
  
  for (var i in uiopts) {
    var optsGroup = uiopts[i];
    var newOptsGroup = Array();
    for (var j in optsGroup) {
      var found = false;
      for (var k in disabledCommands) {
        if (disabledCommands[k] == optsGroup[j]) {
          found = true;
        }
      }
    
      if (found == false) {
        newOptsGroup.push(optsGroup[j]);
      }
  
    }
    if (newOptsGroup.length >= 1) {
      newOpts.push(newOptsGroup);
    }
  }
  
 // elFinder.prototype._options.contextmenu.files.push('|');
 // elFinder.prototype._options.contextmenu.files.push('rename');  

  
  var contextMenuCwd = elFinder.prototype._options.contextmenu.cwd;
  var contextMenuFiles = elFinder.prototype._options.contextmenu.files;
  var contextMenuNavbar = elFinder.prototype._options.contextmenu.navbar;
  
  var newContextMenuCwd = Array();
  var newContextMenuFiles = Array();
  var newContextMenuNavbar = Array();
  
  for (var i in contextMenuCwd) {
    var found = false;
    for (var k in disabledCommands) {
      if (disabledCommands[k] == contextMenuCwd[i]) {
       found = true;
      }
    }
    
    if (found == false && contextMenuCwd[i] != '|') {
      newContextMenuCwd.push(contextMenuCwd[i]);
    }
  }
  
  for (var i in contextMenuFiles) {
    var found = false;
    for (var k in disabledCommands) {
      if (disabledCommands[k] == contextMenuFiles[i]) {
       found = true;
      }
    }
    
    if (found == false && contextMenuFiles[i] != '|') {
      newContextMenuFiles.push(contextMenuFiles[i]);
    }
  }
  
  for (var i in contextMenuNavbar) {
    var found = false;
    for (var k in disabledCommands) {
      if (disabledCommands[k] == contextMenuNavbar[i]) {
       found = true;
      }
    }
    
    if (found == false && contextMenuNavbar[i] != '|') {
      newContextMenuNavbar.push(contextMenuNavbar[i]);
    }
  }
  elFinder.prototype._options.uiOptions.toolbar = newOpts;
  elFinder.prototype._options.contextmenu.cwd = newContextMenuCwd;
  elFinder.prototype._options.contextmenu.files = newContextMenuFiles;
  elFinder.prototype._options.contextmenu.navbar = newContextMenuNavbar;
  
  
  var mwidth = Drupal.settings.elfinder.width;
  var mheight = Drupal.settings.elfinder.height;
  
  /* setting custom manager window width */
  if (mwidth) {
    elFinder.prototype._options.uiOptions.width = mwidth;
  }
  
  /* setting custom manager window height */
  if (mheight) {
    elFinder.prototype._options.uiOptions.height = mheight;
  }

});

//elFinder.prototype._options.contextmenu.files.push('info');
//elFinder.prototype._options.contextmenu.files.push('|');

/* registering command */
//elFinder.prototype._options.commands.push('test134');
//elFinder.prototype._options.commands.push('test134');

//elFinder.prototype._options.contextmenu.cwd.push('rename');

/* adding command to context menu */
//elFinder.prototype._options.contextmenu.files.push('test134');
//elFinder.prototype._options.contextmenu.files.push('test134');