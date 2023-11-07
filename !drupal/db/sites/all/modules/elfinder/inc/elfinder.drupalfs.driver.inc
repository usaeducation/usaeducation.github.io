<?php
/**
 * elFinder driver for Drupal 6 filesystem.
 *
 * @author Alexey Sukhotin
 **/
class elFinderVolumeDrupal extends elFinderVolumeLocalFileSystem {

  protected $DrupalFilesACL = NULL;

   /* search not working since elFinder uses 'q=' url parameter same as Drupal using for page location. */

  /**
	 * Create Drupal file object
	 *
	 * @param  string  $path  file path
	 * @return object
	 * @author Alexey Sukhotin
	 **/
  protected function _drupalfileobject($path) {
    global $user;
    
    $filepath = $this->_relpathdrupal($path);

    $result = db_query("SELECT * FROM {files} f WHERE f.filepath = '%s'", $filepath);
    $file = db_fetch_object($result);
	
    if (!isset($file->fid)) {
      $file = new StdClass;
      $file->uid = $user->uid;
      $file->filename = basename($filepath);
      $file->filepath = $filepath;
      $file->filemime = file_get_mimetype($path);
      $file->filesize = is_readable($path) ? (int)filesize($path) : 0;
      $file->timestamp = time();
      $file->status = FILE_STATUS_PERMANENT;
    }
    return $file;
  }
  
  
  protected function _relpathdrupal($path) {
  
    
    $thisroot = $this->_abspath('/');
    //$drupalfiles = elfinder_document_root() . DIRECTORY_SEPARATOR . file_directory_path();
    $drupalfiles  = file_directory_path();
    
    $drupalpprefix = substr($thisroot, strpos($thisroot, $drupalfiles));

    return $drupalpprefix . '/' . $this->_relpath($path);
  }
  

  
  /**
   * Check if file extension is allowed
   *
   * @param stdClass  $file  file object
   * @return array
   * @author Alexey Sukhotin
   **/
  protected function CheckExtension(stdClass $file) {

    $allowed_extensions = variable_get('elfinder_settings_filesystem_allowed_extensions', '');
    
    if (!empty($allowed_extensions)) {
      
      $errors =  file_validate_extensions($file, $allowed_extensions);
      
      if (!empty($errors)) {
        $this->setError(implode(' ', $errors));
        return FALSE;
      }
      
    }
    return TRUE;
  }

	/**
	 * Create dir
	 *
	 * @param  string  $path  parent dir path
	 * @param string  $name  new directory name
	 * @return bool
	 * @author Alexey Sukhotin
	 **/
  protected function _mkdir($path, $name) {
		$path = $path . DIRECTORY_SEPARATOR . $name;

		if (mkdir($path)) {
      return $path;
		}
		return FALSE;
	}

	/**
	 * Create file
	 *
	 * @param  string  $path  parent dir path
	 * @param string  $name  new file name
	 * @return bool
	 * @author Alexey Sukhotin   
	 **/
	protected function _mkfile($path, $name) {
    $abspath = $path . DIRECTORY_SEPARATOR . $name;
		
    $file = $this->_drupalfileobject($abspath);
		
    if (!$this->CheckExtension($file)) {
      return FALSE;
    }

    if (parent::_mkfile($path, $name)) {
      $this->DrupalDBAddFile($file);
      return $abspath;
    }
    
    return false;
	}

	/**
	 * Copy file into another file
	 *
	 * @param  string  $source     source file path
	 * @param  string  $targetDir  target directory path
	 * @param  string  $name       new file name
	 * @return bool
	 * @author Alexey Sukhotin   
	 **/
	protected function _copy($source, $targetDir, $name) {
    
    $sourceFile = $this->_drupalfileobject($source);
    $destFile = $sourceFile;
    $destFile->filepath = $this->_relpathdrupal($targetDir) . DIRECTORY_SEPARATOR . $destFile->filename;
    $destFile->timestamp = time();
    
    if (!$this->CheckExtension($destFile)) {
      return FALSE;
    }
    
    if (!$this->CheckUserQuota()) {
      return FALSE;
    }
    
    if (file_copy($sourceFile, $targetDir)) {

      if (drupal_write_record('files', $destFile) != 0) {
        return TRUE;
      }
    }

		return FALSE;
	}
  
	/**
	 * Move file into another parent dir
	 *
	 * @param  string  $source  source file path
	 * @param  string  $target  target dir path
	 * @param  string  $name    file name
	 * @return bool
	 * @author Alexey Sukhotin   
	 **/
	protected function _move($source, $targetDir, $name) {

    $target = $targetDir . DIRECTORY_SEPARATOR . (!empty($name) ? $name : basename($source));
    
    if (!$this->CheckExtension($this->_drupalfileobject($target))) {
      return FALSE;
    }
  
    if (is_dir($source)) {

      $sourceDir = dirname($source);
      $dstpath = $this->_relpathdrupal($target);
      $srcpath = $this->_relpathdrupal($source);
      
      $result = db_query("SELECT * FROM {files} f WHERE f.filepath LIKE '%s/%%'", $srcpath);

      $done = FALSE;
  
      $rows = array();
  
      while ($row = db_fetch_object($result)) {
        $rows[] = $row;
      }
	  
      foreach ($rows as $row) {
        $newpath = str_replace("$srcpath/", "$dstpath/", $row->filepath);
        $result = db_query("UPDATE {files} SET filepath = '%s' WHERE fid = '%d'", $newpath, $row->fid);
      }
  
      return @rename($source, $target);
      
    } else {
      $sourceDir = dirname($source);
      $sourceFile = $this->_drupalfileobject($source);
      $destFile = $sourceFile;

      if ($sourceFile->filename != $name && $name != '') {
        $destFile->filename = $name;
      }
 
      $destFile->filepath = $this->_relpathdrupal($targetDir) . DIRECTORY_SEPARATOR . $destFile->filename;
 
      if ($sourceDir == $targetDir) {
        
        if (!rename($source, $target)) {
          return FALSE;
        }
      } else {
        if (!file_move($source, $targetDir)) {
          return FALSE;
        }
      }
      
      if (drupal_write_record('files', $destFile, array('fid'))) {
        return TRUE;
      }      
      
    }

		return FALSE;
	}

	/**
	 * Remove file
	 *
	 * @param  string  $path  file path
	 * @return bool
	 * @author Alexey Sukhotin
	 **/
	protected function _unlink($path) {

    $success = file_delete($path);
    
    $filepath = $this->_relpathdrupal($path);
 
    if ($success){
      db_query('DELETE FROM {files} WHERE filepath = "%s"', $filepath);
      return TRUE;
    }
    
    return FALSE;
	}
 
	/**
	 * Create new file and write into it from file pointer.
	 * Return new file path or false on error.
	 *
	 * @param  resource  $fp   file pointer
	 * @param  string    $dir  target dir path
	 * @param  string    $name file name
	 * @return bool|string
	 * @author Dmitry (dio) Levashov, Alexey Sukhotin
	 **/
 	protected function _save($fp, $dir, $name, $stat) {

    $tmpname = $name;
		
		$bu_ret = module_invoke_all('elfinder_beforeupload', array('name' => $name, 'dir' => $dir, 'stat' => $stat ));
		
		if (isset($bu_ret)) {
			if (!is_array($bu_ret)) {
				$bu_ret = array($bu_ret);
			}

			$newname = end($bu_ret);
			
			if (!empty($newname)) {
				$tmpname = $newname;
			}
		}
	
    $path = $dir . DIRECTORY_SEPARATOR . $tmpname;
    
    if (!$this->CheckUserQuota()) {
      return false;
    }
    
    if (!$this->CheckFolderCount($dir)) {
      return FALSE;
    }

		if (!($target = @fopen($path, 'wb'))) {
			return false;
		}

		while (!feof($fp)) {
			fwrite($target, fread($fp, 8192));
		}

		fclose($target);
		@chmod($path, $this->options['fileMode']);
    
    $file = $this->_drupalfileobject($path);
    $this->DrupalDBAddFile($file);
    
		return $path;
	}
  
  protected function CheckUserQuota() {
    $space = $this->CalculateUserAllowedSpace();
    
   // drupal_set_message('space='.$space,'warning');
    
    if ($space == 0) {
      $this->setError(t('Quota exceeded'));
      return false;
    }
    
    return true;
  }
  
  /**
   * Check file count in the folder
   *
   * @param  string  $dir     check path
   * @return bool
   * @author Oliver Polden (oliverpolden)
   * */
  protected function CheckFolderCount($dir) {
    $max_allowed = variable_get('elfinder_settings_filesystem_maxfilecount', 0);
    if ($max_allowed > 0) {
      $options = array(
        'recurse' => FALSE,
      );
      // Match name.extension. This won't count files with no extension.
      $files = file_scan_directory($dir, '/.*\..*/', array(), 0, FALSE);

      if (count($files) >= $max_allowed) {
        $this->setError(t('Max directory file count of %count reached', array('%count' => $max_allowed)));
        return FALSE;
      }
    }
    return TRUE;
  }
  
	/**
	 * Return files list in directory.
	 *
	 * @param  string  $path  dir path
	 * @return array
	 * @author Dmitry (dio) Levashov
	 **/
	protected function _scandir($path) {
		$files = array();

		foreach (scandir($path) as $name) {
			if ($name != '.' && $name != '..') {
				$files[] = $path.DIRECTORY_SEPARATOR.$name;
			}
		}
		return $files;
	}
  
  
  public function owner($target) {
    $path = $this->decode($target);
   
    $file = $this->_drupalfileobject($path);
       
    if ($file->fid) {
      $owneraccount = user_load($file->uid);
    
      /* AS */
      $owner = $owneraccount->name;
    
      $ownerformat = variable_get('elfinder_settings_filesystem_owner_format', '');
    
      if ($ownerformat != '') {
        $owner = token_replace($ownerformat, array('user' => $owneraccount));
      }
      
      return $owner;
    } 
    return false;
      
  }
  
  public function desc($target, $newdesc = null) {
    $path = $this->decode($target);
   
      
    $file = $this->_drupalfileobject($path);
    
    if ($file->fid) {
  
	  $result = db_query("SELECT `fid`, `description` FROM {elfinder_file_extinfo} WHERE fid = '%d'", $file->fid);
	  
	  $finfo = db_fetch_object($result);

	  $descobj = new StdClass;
	  $descobj->fid = $file->fid;
      $descobj->description = $newdesc;	  

      if ($newdesc != null && user_access('edit file description')) {
		if (($rc = drupal_write_record('elfinder_file_extinfo', $descobj, isset($finfo->fid )? array('fid') : array())) == 0) {
			return -1;
		}
      } else {
        return $finfo->description;
      }
    }

    return $newdesc;
      
  }
  
  public function downloadcount($target) {
    $path = $this->decode($target);
   
    $file = $this->_drupalfileobject($path);
    
    if ($file->fid && module_exists('elfinder_stats')) {
	  $downloads = db_result(db_query("SELECT count(*) FROM {elfinder_stats} WHERE fid = '%d' AND `type` = '%s'", $file->fid, 'download'));
      return isset($downloads) ? $downloads : 0;
    } 
    return 0;
      
  }
  
  protected function _archive($dir, $files, $name, $arc) {
  
    if (!$this->CheckUserQuota()) {
      return false;
    }
  
    $ret = parent::_archive($dir, $files, $name, $arc);
    
    if ($ret != FALSE) {
      $file = $this->_drupalfileobject($ret);
      $this->DrupalDBAddFile($file);
    }
    
    return $ret;
  }
  
  public function extract($hash, $makedir = NULL) {
  
    if (!$this->CheckUserQuota()) {
      return false;
    }
  
    $fstat = parent::extract($hash);

    if ($fstat != FALSE) {
      $path = $this->decode($fstat['hash']);
      $this->DrupalDBAdd($path);
    }
    
    return $fstat;
  }
  
  
  protected function DrupalDBAdd($path) {
        
    if (is_dir($path)) {
      $files = $this->_scandir($path);
      foreach ($files as $file) {
        $this->DrupalDBAdd($file);
      }
    } else {
      $file = $this->_drupalfileobject($path);
      $this->DrupalDBAddFile($file);
    }
    return TRUE;
  }
  
  protected function DrupalDBAddFile($file) {
    return drupal_write_record('files', $file, $file->fid ? array('fid') : array());
  }
  
  protected function CalculateUserAllowedSpace($checkuser = NULL) {
    global $user;
    
    $realUser = isset($checkuser) ? $checkuser : $user;
    
    $currentSpace = $this->CalculateUserUsedSpace($realUser);
    

    $maxSpace = isset($this->options['userProfile']->settings['user_quota']) ? parse_size($this->options['userProfile']->settings['user_quota']) : NULL;
    
    $diff = $maxSpace - $currentSpace;
    
    //drupal_set_message('current space = '.$currentSpace.' max = ' . $maxSpace . ' diff = ' . $diff,'warning');
    
    
    if (isset($maxSpace) && $maxSpace > 0) {
    
      if ($diff > 0) {
        return $diff;
      } else {
        return 0;
      }
    }
    
    return -1;
    
  }

  protected function CalculateUserUsedSpace($checkuser = NULL) {
    global $user;
  
    $realUser = isset($checkuser) ? $checkuser : $user;
  
    $quota = db_result(db_query("SELECT sum(filesize) FROM {files} WHERE uid = '%d'", $realUser->uid));
  
    return isset($quota) ? $quota : 0;
  }
  
  protected function _checkArchivers() {
    $this->archivers = variable_get('elfinder_settings_misc_archivers', array());

    if (count($this->archivers) == 0) {
      parent::_checkArchivers();
      variable_set('elfinder_settings_misc_archivers', $this->archivers);
    }
  }
  
}

