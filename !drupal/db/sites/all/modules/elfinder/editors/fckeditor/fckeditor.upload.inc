<?php

function elfinder_editor_upload_fckeditor() {
    
  $p = elfinder_get_user_profile();

  $dest = isset($p->settings['ckeditor_upload_directory']) ? elfinder_parse_path_tokens($p->settings['ckeditor_upload_directory']) : file_directory_path();
  
  $tmf = $_FILES;
 
  foreach (array_keys($_FILES['NewFile']) as $key) {
    $tmpf['files'][$key]['NewFile'] = $_FILES['NewFile'][$key];
  }
 
  $_FILES = $tmpf;

  $file = file_save_upload('NewFile', array(), $dest);
  file_set_status($file, FILE_STATUS_PERMANENT);
  

  header('Content-Type: text/html');

  print '<script type="text/javascript">';
  
  if ($file) {
    print "window.parent.OnUploadCompleted(0, '" . file_create_url($file->filepath) . "', '" . $file->filename . "', '') ;";
  } else {
    print 'window.parent.OnUploadCompleted(1,"","", "' . t('Error uploading file!') . '") ;';
  }
  
  print '</script>';

  exit();
}