Video.js Described Video Selector
=================================

Add a button to Video.js to allow the user to select between different versions 
of a video, typically one with 'open descripton' (audio descripton added into the
soundtrack), and one without.

Usage
-----
You must be running Video.js 4.11 or higher for this plugin to function. You can download the latest source at the [main Video.js repo](https://github.com/videojs/video.js) or you can get production files from [videojs.com](http://videojs.com) or you can use the CDN files.

Add extra `<source />` elements, with the `data-described-video` attribute:

	<video id="my-video-example" class="video-js vjs-default-skin" controls width="640" height="360" >
		<source src="my-video.mp4"                   type="video/mp4" />
		<source src="my-video.webm"                  type="video/webm" />
		<source src="my-video-with-description.mp4"  type="video/mp4" data-described-video />
		<source src="my-video-with-description.webm" type="video/webm" data-described-video />
	</video>

Enable the plugin as described in the [video.js docs](https://github.com/videojs/video.js/blob/v4.5.2/docs/guides/plugins.md#step-3-using-a-plugin). You can also checkout the `example.html` file in this repo to see how the plugin is setup. Optionally, you can pass some settings to the plugin:

    videojs( '#my-video-example', { plugins : { describedVideoSelector : {
    } } } );

`defaultDescribedVideo` can be false, true, or a string. False selects the undescribed (no `data-described-video` attribute) video, true selects the described video, and a string selects a video if e.g. `data-described-video='English'` is specified

The plugin also triggers a `changeDescription` event on the player instance anytime the selected described video is changed, so your code can listen for that and take any desired action on description changes:

	videojs( '#my-video', { plugins : resolutionSelector : {} }, function() {
		
		var player = this;
		
		player.on( 'changeDescription', function() {
			
				console.log( 'Described video is: ' + player.getCurrentDescription() );
		});
	});

The plugin provides a `changeDescription` method on the `player` object. You can call it like so (after your player is ready): `player.changeDescription( true )`.
	
Mobile devices
--------------
If you want this plugin to work on mobile devices, you need to enable the video.js controls because the native controls are default on iOS and Android.

	<video data-setup='{"customControlsOnMobile": true}'>
		...
	</video>
