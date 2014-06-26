# jQuery Circular Carousel

A library that creates dynamic circular carousels. **Requires jQuery**. Adjustable items, dimensions, angle, durations, offsets. By default, scales non-active items to 0.5. See the [demo](http://samuelgbrown.github.io/jquery.circular-carousel/demo/).

![What it looks like.](/demo/screenshot.png)

# Browser Support 

Uses CSS3 Transitions, CSS3 Transforms. Currently no polyfills or fallbacks implemented for IE9.

- IE10+
- Chrome
- FF
- Safari

# Usage

Use an unordered list like so, with at least 4 items (you can choose the class names and put whatever you want inside the items):

```html
<ul class="carousel">
	<li class="item active"></li>
	<li class="item"></li>
	<li class="item"></li>
	<li class="item"></li>
	<li class="item"></li>
	<li class="item"></li>
</ul>
```

Include jQuery, then download & include the library.
	
```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<script src="js/jquery.circular-carousel.js"></script>
```

Include (or integrate) the library styles.
	
```html
<link rel="stylesheet" href="css/jquery.circular-carousel.css">
```

Then, in your application.
	
```javascript
var options = {
	ovalWidth: 400,
	ovalHeight: 50,
	offsetX: 100,
	offsetY: 325,
	angle: 0,
	activeItem: 0,
	duration: 350,
	className: 'item'
}
var carousel = new CircularCarousel( options );
```

Methods:
	
```javascript
carousel.cycleActive('previous');
carousel.cycleActive('next');
carousel.cycleActiveTo(index);
```

Events:
	
```javascript
/* Fires when an item is about to start it's activate animation */
carousel.on('itemBeforeActive', function(e, item) {
	//do something with $(item)
});

/* Fires after an item finishes it's activate animation */
carousel.on('itemActive', function(e, item) {
	//do something with $(item)
});

/* Fires when an active item starts it's de-activate animation */
carousel.on('itemBeforeDeactivate', function(e, item) {
	//do something with $(item)
})

/* Fires after an active item has finished it's de-activate animation */
carousel.on('itemAfterDeactivate', function(e, item) {
	//do something with $(item)
})
```

# License

MIT

# Thanks

Addy Osmani for creating a useful method for mapping DOM elements to a shape.
Marcus Haslam (@marcusehaslam) for helping to create the findBestRoute utility.