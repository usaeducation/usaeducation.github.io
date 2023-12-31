<?php
/*
 * @file
 * Class file used to create our video and thumbnail objects.
 */
class video_helper {
  public function video_object($element) {
    $field = content_fields($element['#field_name'], $element['#type_name']);
    // Setup our width x height
    $dimensions = explode("x", $element['#item']['data']['dimensions']);
    $player_dimensions = explode("x", $element['#item']['data']['player_dimensions']);
    if (!isset($dimensions[0]) || !isset($dimensions[1])) {
      $dimensions = explode("x", $field['widget']['default_dimensions']);
      if (!isset($dimensions[0]) || !isset($dimensions[1])) {
        drupal_set_message(t('Something is wrong with your dimensions.  Make sure you enter dimensions in the form of WxH.'), 'error');
      }
    }
    if (!isset($player_dimensions[0]) || !isset($player_dimensions[1])) {
      $player_dimensions = explode("x", $field['widget']['default_player_dimensions']);
      if (!isset($player_dimensions[0]) || !isset($player_dimensions[1])) {
        drupal_set_message(t('Something is wrong with your player dimensions.  Make sure you enter the player dimensions in the form of WxH.'), 'error');
      }
    }

    $extension = drupal_strtolower(pathinfo($element['#item']['filename'], PATHINFO_EXTENSION));
    if (empty($extension)) {
      drupal_set_message(
        t('Could not determine the extension of filename @filename for node @node-title, element @element-title, item @item',
          array('@filename' => $element['#item']['filename'], '@node-title' => $element['#node']->node_title, '@element-title' => $field['widget']['label'], '@item' => $element['#item']['#delta'])),
        'error');
      return NULL;
    }

    // Build our video object for all types.
    $video = new stdClass();
    $video->fid = $element['#item']['fid'];
    $video->original = $element['#item'];
    $video->files = new stdClass();
    $video->files->{$extension} = new stdClass();
    $video->files->{$extension}->filename = pathinfo($element['#item']['filepath'], PATHINFO_FILENAME) .'.'. $extension;
    $video->files->{$extension}->filepath = $element['#item']['filepath'];
    $video->files->{$extension}->url = file_create_url($element['#item']['filepath']);
    $video->files->{$extension}->filemime = $element['#item']['filemime'];
    $video->files->{$extension}->extension = $extension;
    $video->player = $extension;
    $video->width = trim($dimensions[0]);
    $video->height = trim($dimensions[1]);
    $video->player_width = trim($player_dimensions[0]);
    $video->player_height = trim($player_dimensions[1]);
    $video->thumbnail = $this->thumbnail_object($element);
    $video->formatter = $element['#formatter'];
    $video->autoplay = variable_get('video_autoplay', TRUE);
    $video->autobuffering = variable_get('video_autobuffering', TRUE);
    $video->theora_player = variable_get('video_ogg_player', 'http://theora.org/cortado.jar');
    // lets find out if we have transcoded this file and update our paths.
    if (isset($field['widget']['autoconversion']) && $field['widget']['autoconversion']
        && !$element['#item']['data']['bypass_autoconversion']) {
      // discard all existing file data
      $video->files = new stdClass();

      $transcoder = video_get_transcoder();
      $transcoder->load_completed_job($video);
    }

    $filesystem = video_get_filesystem();
    $filesystem->load_file($video);

    // Moved to last to recheck incase we changed our extension above.
    $video->flash_player = variable_get('video_extension_' . $video->player . '_flash_player', '');
    $video->html5_player = variable_get('video_extension_' . $video->player . '_html5_player', '');

    // Return our object
    return $video;
  }

  public function thumbnail_object($element) {
    $field = content_fields($element['#field_name'], $element['#type_name']);
    // Build our thumbnail object
    $thumbnail = new stdClass();
    $thumbnail->filepath = '';
    $thumbnail->url = '';
    // @todo future enhancements for our thumbnails
    $thumbnail->alt = '';
    $thumbnail->title = '';
    $thumbnail->description = '';

    // Setup our thumbnail path.
    $use_default_img = isset($element['#item']['data']['use_default_video_thumb']) ? $element['#item']['data']['use_default_video_thumb'] : FALSE;
    if ($use_default_img && !empty($field['widget']['default_video_thumb']['filepath'])) {
      $thumbnail->filepath = $field['widget']['default_video_thumb']['filepath'];
    }
    elseif (isset($element['#item']['data']['video_thumb']) ? $element['#item']['data']['video_thumb'] : FALSE) {
      $thumbnail->filepath = $element['#item']['data']['video_thumb'];
    }
    else {
      // Need some type of default if nothing is present
      // Drupal_set_message(t('No thumbnail has been configured for the video.'), 'error');
    }
    // Lets check for an imagecache preset
    if (isset($element['imagecache_preset'])) {
      $thumbnail->url = imagecache_create_url($element['imagecache_preset'], $thumbnail->filepath);
      $thumbnail->filepath = imagecache_create_path($element['imagecache_preset'], $thumbnail->filepath);
    }
    else {
      $thumbnail->url = file_create_url($thumbnail->filepath);
    }

    // Swftools appends sites/default/files to the front of our path...
    // @todo Is this a setting?  Need to figure this out.
    $thumbnail->swfthumb = $thumbnail->filepath;
    // filemime
    $thumbnail->filemime = file_get_mimetype($thumbnail->filepath);
    // Return our object
    return $thumbnail;
  }
}
