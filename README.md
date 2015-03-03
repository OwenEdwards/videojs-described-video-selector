Video.js Described Video Selector
=================================

Add a button to Video.js to allow switching between different versions of a video,
typically the original and one with '[audio descripton](http://www.wikipedia.org/wiki/Audio_description)' (additional narration added 
into the soundtrack to assist understanding of the video).


Basic Usage
-----------

You must be running Video.js 4.11 or higher for this plugin to function. You can download the latest source at the [main Video.js repo](https://github.com/videojs/video.js) or you can get production files from [videojs.com](http://videojs.com) or you can use the CDN files.

Add extra `<source />` elements, with the `data-described-video` attribute:

````html
<video id="my-video-example" class="video-js vjs-default-skin" controls width="640" height="360" >
    <source src="my-video.mp4"                   type="video/mp4" />
    <source src="my-video.webm"                  type="video/webm" />
    <source src="my-video-with-description.mp4"  type="video/mp4" data-described-video />
    <source src="my-video-with-description.webm" type="video/webm" data-described-video />
</video>
````

Enable the plugin as described in the [video.js docs](https://github.com/videojs/video.js/blob/master/docs/guides/plugins.md#step-3-using-a-plugin). You can also checkout the `example.html` file in this repo to see how the plugin is setup. Optionally, you can pass a setting to the plugin:

````javascript
videojs( '#my-video-example',
    { plugins : 
        { describedVideoSelector :
            {
                defaultDescribedVideo : false
            }
        }
    });
````

`defaultDescribedVideo` can be `false`, `true`, or a string, and defaults to `false`. False selects the undescribed (no `data-described-video` attribute) video, true selects the described video.


Advanced Usage
--------------

It is also possible to have more than one described video, in which case the `data-described-video` attribute should specify a string describing the type of description, and `defaultDescribedVideo` can match one of those strings:

````html
<video id="my-video-example" class="video-js vjs-default-skin" controls width="640" height="360" >
    <source src="my-video.mp4"                   type="video/mp4" />
    <source src="my-video.webm"                  type="video/webm" />
    <source src="my-video-with-description.mp4"  type="video/mp4"  data-described-video="English" />
    <source src="my-video-with-description.webm" type="video/webm" data-described-video="English" />
    <source src="my-video-with-description.mp4"  type="video/mp4"  data-described-video="Spanish" />
    <source src="my-video-with-description.webm" type="video/webm" data-described-video="Spanish" />
</video>
````

The plugin also triggers a `changeDescription` event on the player instance anytime the selected described video is changed (inluding at setup), so your code can listen for that and take any desired action on description changes:

````javascript
    videojs( '#my-video-example',
    	{ plugins : 
    		{ describedVideoSelector :
    			{
    				defaultDescribedVideo : false
    			}
    		}
    	}, function() {
		
		var player = this;
		
		player.on( 'changeDescription', function() {
			
				console.log( 'Described video is: ' + player.getCurrentDescription() );
		});
	});
````

The plugin provides a `changeDescription` method on the `player` object. You can call it (after your player is ready) to set the description: `player.changeDescription( true )`.


Known issues
------------

The plugin attempts to maintain the current time of the video and whether the video is playing or paused. An issue with the YouTube plugin mean that after a switch the YouTube player is always paused at the beginning of the video.


Mobile devices
--------------
If you want this plugin to work on mobile devices, you need to enable the video.js controls because the native controls are default on iOS and Android.

````html
<video data-setup='{"customControlsOnMobile": true}'>
    ...
</video>
````
