/**
 * Video.js Described Video Selector
 *
 * This plugin for Video.js adds a button to select a different video
 * with 'open description' (audio description added to the video)
 * on the toolbar.
 * 
 * Typical usage:
 *
 * <video>
 * 	<source  src="..." />
 * 	<source data-described-video src="..." />
 * </video>
 *
 * Or (for more than one different description):
 *
 * <video>
 * 	<source  src="..." />
 * 	<source data-described-video="Simple" src="..." />
 * 	<source data-described-video="Expanded" src="..." />
 * </video>
 */

(function( _V_ ) {

	var descriptionButtonLabel = 'Described Video';

	/***********************************************************************************
	 * Define some helper functions
	 ***********************************************************************************/
	var methods = {

		/**
		 * @param	(string)	desc	The description to make a label for
		 *
		 * @returns	(string)	The label text string
		 */
		description_label : function( desc ) {

			if ( desc === "true" ) return "On";
			if ( desc === "false" ) return "Off";
			return desc;
		}
	};

	/***********************************************************************************
	 * Setup our description menu items
	 ***********************************************************************************/
	_V_.DescriptionMenuItem = _V_.MenuItem.extend({

		// Call variable to prevent the description change from being called twice
		call_count : 0,

		/** @constructor */
		init : function( player, options ){

			var touchstart = false;

			// Modify options for parent MenuItem class's init.
			options.label = methods.description_label( options.desc );
			options.selected = ( options.desc.toString() === player.getCurrentDescription().toString() );

			// Call the parent constructor
			_V_.MenuItem.call( this, player, options );

			// Store the description as a property
			this.dscrption = options.desc;

			// Register our click and tap handlers
			this.on( ['click', 'tap'], this.onClick );

			// Toggle the selected class whenever the description changes
			player.on( 'changeDescription', _V_.bind( this, function() {

				if ( this.dscrption == player.getCurrentDescription() ) {

					this.selected( true );

				} else {

					this.selected( false );
				}

				// Reset the call count
				this.call_count = 0;
			}));
		}
	});

	// Handle clicks on the menu items
	_V_.DescriptionMenuItem.prototype.onClick = function() {

		// Check if this has already been called
		if ( this.call_count > 0 ) { return; }

		// Call the player.changeDescription method
		this.player().changeDescription( this.dscrption );

		// Increment the call counter
		this.call_count++;
	};

	/***********************************************************************************
	 * Setup our description menu title item
	 ***********************************************************************************/
	_V_.DescriptionTitleMenuItem = _V_.MenuItem.extend({

		init : function( player, options ) {

			// Call the parent constructor
			_V_.MenuItem.call( this, player, options );

		}
	});



	/***********************************************************************************
	 * Define our description selector button for on/off
	 ***********************************************************************************/
	/**
	 * Button to toggle between described and non-described videos
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @class
	 * @constructor
	 */
	_V_.DescriptionSelectorToggle = _V_.Button.extend({
	  /** @constructor */
	  init: function(player, options){
		this.buttonText = options.buttonText;

	    _V_.Button.call(this, player, options);

		// Add our list of available descriptions to the player object
		player.availableRes = options.available_desc;

	    this.on(player, 'changeDescription', this.onChangeDescription);
	    //this.on(player, 'pause', this.onPause);
	  }
	});

	_V_.DescriptionSelectorToggle.prototype.buildCSSClass = function(){
	  return 'vjs-description-button ' + _V_.Button.prototype.buildCSSClass.call(this);
	};

	// OnClick - Toggle between described and not described
	_V_.DescriptionSelectorToggle.prototype.onClick = function(){
		// Call the player.changeDescription method
		this.player().changeDescription();
	};

	// onChangeDescription - Change classes of the element so it can change appearance
	_V_.DescriptionSelectorToggle.prototype.onChangeDescription = function(){
		var curr_desc = this.player_.getCurrentDescription();
		if ( curr_desc === "true" || curr_desc === true ){
			this.removeClass('vjs-not-described');
			this.addClass('vjs-described');
			this.el_.children[0].children[0].innerHTML = this.localize(descriptionButtonLabel + ', Described');
		} else {
			this.addClass('vjs-not-described');
			this.removeClass('vjs-described');
			this.el_.children[0].children[0].innerHTML = this.localize(descriptionButtonLabel + ', Not Described');
		}
	};

	/***********************************************************************************
	 * Define our description selector button
	 ***********************************************************************************/
	_V_.DescriptionSelector = _V_.MenuButton.extend({

		/** @constructor */
		init : function( player, options ) {

			// Add our list of available descriptions to the player object
			player.availableRes = options.available_desc;

			// Call the parent constructor
			_V_.MenuButton.call( this, player, options );

			// Set the button text based on the option provided
			this.el().firstChild.firstChild.innerHTML = options.buttonText;
		}
	});

	// Set class for description selector button
	_V_.DescriptionSelector.prototype.className = 'vjs-description-button';

	// Create a menu item for each available description
	_V_.DescriptionSelector.prototype.createItems = function() {

		var player = this.player(),
			items = [],
			current_desc;

		if ( player.availableRes.length <= 2 ) { return; }

		// Add the menu title item
		items.push( new _V_.DescriptionTitleMenuItem( player, {

			el : _V_.Component.prototype.createEl( 'li', {

				className	: 'vjs-menu-title vjs-description-menu-title',
				innerHTML	: descriptionButtonLabel
			})
		}));

		// Add an item for each available description
		for ( current_desc in player.availableRes ) {

			// Don't add an item for the length attribute
			if ( 'length' == current_desc ) { continue; }

			items.push( new _V_.DescriptionMenuItem( player, {
				desc : current_desc
			}));
		}

		// Sort the available descriptions in descending order
		items.sort(function( a, b ) {

			if ( typeof a.dscrption == 'undefined' ) {

				return -1;

			} else {

				return parseInt( b.dscrption ) - parseInt( a.dscrption );
			}
		});

		return items;
	};

	/***********************************************************************************
	 * Register the plugin with videojs, main plugin function
	 ***********************************************************************************/
	_V_.plugin( 'describedVideoSelector', function( options ) {

		// Only enable the plugin on HTML5 videos
		//if ( ! this.el().firstChild.canPlayType  ) { return; }

		/*******************************************************************
		 * Setup variables, parse settings
		 *******************************************************************/
		var player = this,
			sources	= player.options().sources,
			i = sources.length,
			j,
			found_types,

			// Override default options with those provided
			settings = _V_.util.mergeOptions({

				defaultDescribedVideo	: false,	// (string)	The description that should be selected by default ( false, true, or a string )
				force_types	: false					// (array)	List of media types. If passed, we need to have source for each type in each description or that description will not be an option


			}, options || {} ),

			available_desc = { length : 0 },
			current_desc,
			describedVideoSelector,

			// Split default descriptions if set and valid, otherwise default to an empty array
			default_dscrptions = ( settings.defaultDescribedVideo && typeof settings.defaultDescribedVideo == 'string' ) ? settings.defaultDescribedVideo.split( ',' ) : [];

		// Get all of the available descriptions
		while ( i > 0 ) {

			i--;

			if ( sources[i]['data-described-video']  === undefined ) { sources[i]['data-described-video'] = false }
			else if ( ! sources[i]['data-described-video'] ) { sources[i]['data-described-video'] = true }

			current_desc = sources[i]['data-described-video'];

			if ( typeof available_desc[current_desc] !== 'object' ) {

				available_desc[current_desc] = [];
				available_desc.length++;
			}

			available_desc[current_desc].push( sources[i] );
		}

		// Check for forced types
		if ( settings.force_types ) {

			// Loop through all available descriptions
			for ( current_desc in available_desc ) {

				// Don't count the length property as a description
				if ( 'length' == current_desc ) { continue; }

				i = settings.force_types.length;
				found_types = 0;

				// Loop through all required types
				while ( i > 0 ) {

					i--;

					j = available_desc[current_desc].length;

					// Loop through all available sources in current description
					while ( j > 0 ) {

						j--;

						// Check if the current source matches the current type we're checking
						if ( settings.force_types[i] === available_desc[current_desc][j].type ) {

							found_types++;
							break;
						}
					}
				}

				// If we didn't find sources for all of the required types in the current_desc, remove it
				if ( found_types < settings.force_types.length ) {

					delete available_desc[current_desc];
					available_desc.length--;
				}
			}
		}

		// Make sure we have at least 2 available descriptions before we add the button
		if ( available_desc.length < 2 ) { return; }

		// Loop through the choosen default descriptions if there were any
		for ( i = 0; i < default_dscrptions.length; i++ ) {

			// Set the video to start out with the first available default desc
			if ( available_desc[default_dscrptions[i]] ) {

				player.src( available_desc[default_dscrptions[i]] );
				player.currentDescription = default_dscrptions[i];
				break;
			}
		}

		/*******************************************************************
		 * Add methods to player object
		 *******************************************************************/

		// Helper function to get the current description
		player.getCurrentDescription = function() {

			if ( typeof player.currentDescription !== 'undefined' ) {

				return player.currentDescription;

			} else {

				try {

					return desc = player.options().sources[0]['data-described-video'];

				} catch(e) {

					return '';
				}
			}
		};

		// Define the change desc method
		player.changeDescription = function( target_dscrption ) {

			var video_el = player.el().firstChild,
				is_paused = player.paused(),
				current_time = player.currentTime(),
				button_nodes,
				button_node_count;

			// Toggle the currentDescription if no target_dscrption sepcified, and only two options
			if ( ( target_dscrption === undefined ) && ( player.availableRes.length === 2 ) ) {
				var curRes = player.getCurrentDescription();
				for ( one_desc in available_desc ) {
					// Don't count the length property as a description
					if ( 'length' == one_desc ) { continue; }

					if ( curRes != one_desc ) {
						target_dscrption = one_desc;
						break;
					}
				}
			}

			// Do nothing if we aren't changing descriptions or if the description isn't defined
			if ( player.getCurrentDescription() == target_dscrption
				|| ! player.availableRes
				|| ! player.availableRes[target_dscrption] ) { return; }

			// Make sure the loadedmetadata event will fire
			if ( 'none' == video_el.preload ) { video_el.preload = 'metadata'; }

			// Change the source and make sure we don't start the video over
			player.src( player.availableRes[target_dscrption] ).one( 'loadedmetadata', function() {

				player.currentTime( current_time );

				// If the video was paused, don't show the poster image again
				player.addClass( 'vjs-has-started' );

				if ( ! is_paused ) { player.play(); }
			});

			// Save the newly selected description in our player options property
			player.currentDescription = target_dscrption;

			// Make sure the button has been added to the control bar
			if ( player.controlBar.describedVideoSelector ) {

				button_nodes = player.controlBar.describedVideoSelector.el().firstChild.children;
				button_node_count = button_nodes.length;

				// Only update the button text if it's a menu button
				if ( button_node_count > 1 ) {
					// Update the button text
					while ( button_node_count > 0 ) {

						button_node_count--;

						if ( 'vjs-control-text' == button_nodes[button_node_count].className ) {

							button_nodes[button_node_count].innerHTML = methods.description_label( target_dscrption );
							break;
						}
					}
				}
			}

			// Update the classes to reflect the currently selected description
			player.trigger( 'changeDescription' );
		};

		/*******************************************************************
		 * Add the description selector button
		 *******************************************************************/

		// Get the starting description
		current_desc = player.getCurrentDescription();

		if ( current_desc ) { current_desc = methods.description_label( current_desc ); }

		// Add the description selector button
		if ( available_desc.length <= 2 ) {
			describedVideoSelector = new _V_.DescriptionSelectorToggle( player, {
				buttonText		: descriptionButtonLabel,
				available_desc	: available_desc
			});

		} else {
			describedVideoSelector = new _V_.DescriptionSelector( player, {
				buttonText		: (current_desc || descriptionButtonLabel),
				available_desc	: available_desc
			});
		}

		// Add the button to the control bar object and the DOM
		player.controlBar.describedVideoSelector = player.controlBar.addChild( describedVideoSelector );

		// Update the classes to reflect the currently selected description
		player.trigger( 'changeDescription' );
	});

})( videojs );