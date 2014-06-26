/* jQuery Circular Carousel 0.1 */

/*
Author: @samuelgbrown
Thanks: Addy Osmani, Marcus Haslam
*/

(function ($) {

  /*
    Construct, do first draw.
  */

  $.fn.CircularCarousel = function (options) {

    var $ele = $(this),
        ovalWidth = options.ovalWidth,
        ovalHeight = options.ovalHeight,
        activeItem = options.activeItem,
        offsetX = options.offsetX,
        offsetY = options.offsetY,
        angle = options.angle,
        $items = $ele.find('.' + options.className),
        cycleMax = $items.length,
        itemHeights = [],
        cycleDuration = options.duration,
        previousActiveElement = activeItem;

    /*
       Original Source of this function: Addy Osmani's jquery.shapelib from 2010. Updated, tweaked by @samuelgbrown.
       Positions the items using margins, relative to an ellipse.
    
       @params
       x: the left offset of all points on the ellipse
       y: the top offset of all points on the ellipse
       angle: the angle of the ellipse
       activeItem: used to influence which element is considered active
       callback: a callback
    */
    function positionItems (x, y, angle) {

      var i = 0,
          n = 0,
          beta = -angle * (Math.PI / 180),    
          sinbeta = Math.sin(beta),
          cosbeta = Math.cos(beta),
          offsetElement = activeItem,
          offsetNextElement = activeItem + 1;

      itemHeights = [];

      $items.eq(activeItem).addClass('active');

      while (n < cycleMax) {
        i+= (360/cycleMax);
        var alpha = i * (Math.PI / 180);

        var sinalpha = Math.sin(alpha);
        var cosalpha = Math.cos(alpha);

        var X = x + (ovalHeight * cosalpha * cosbeta - ovalWidth * sinalpha * sinbeta);
        var Y = y + (ovalHeight * cosalpha * sinbeta + ovalWidth * sinalpha * cosbeta);

        X = Math.floor(X);
        Y = Math.floor(Y);

        // To update the positions, we just need to change the order and make it loop at either end.
        offsetElement++;
        if (offsetElement < 0) {
          offsetElement = cycleMax-1;
        } else if (offsetElement === cycleMax) {
          offsetElement = 0;
        }

        // used by layering hack
        offsetNextElement++;
        if (offsetNextElement < 0) {
          offsetNextElement = cycleMax-1;
        } else if (offsetNextElement >= cycleMax) {
          offsetNextElement = 0;
        }

        $items.eq(offsetElement).css('margin-top', X + 'px');
        $items.eq(offsetElement).css('margin-left', Y + 'px');

        var itemMeta = { 'top' : $items.eq(offsetNextElement).offset().top, 'index' : offsetNextElement };
        itemHeights.push(itemMeta);

        n++;
      }

      // Fire events
      var activeElement = $items.eq(activeItem),
        prevActiveElement = $items.eq(previousActiveElement);

      $ele.trigger('itemBeforeActive', activeElement);
      $ele.trigger('itemBeforeDeactivate', prevActiveElement);

      var afterTimeout = setTimeout(function() {
        $ele.trigger('itemActive', activeElement);
        $ele.trigger('itemAfterDeactivate', prevActiveElement);
      }, cycleDuration);

      // Run the layering hack (see method below)
      layerHack(activeItem);
    };

    /*
      Cycles through items 1 by 1, doing a redraw of positions each time.
      direction = 1 / 0 (1 = right, 0 = left)

      TODO: Improve quality/DRYness here
    */
    function doSteppedCycle (steps, direction, stepDuration) {

      var i = 0;

      if (direction === 1) {

        while (i < steps) {

          var timeout = setTimeout(function() {
            var activeElement = $items.eq(activeItem);
            activeElement.removeClass('active');
            previousActiveElement = activeItem;
            activeItem++;
            // activeItem changed, validate
            validateActiveItem();
            positionItems(offsetX, offsetY, angle, null);
          }, i * stepDuration);

          i++;
        }

      } else {

        i = steps;
        var k = 0;
        while (i > 0) {

          var timeout = setTimeout(function() {
            var activeElement = $items.eq(activeItem);
            activeElement.removeClass('active');
            previousActiveElement = activeItem;
            activeItem--;
            // activeItem changed, validate
            validateActiveItem();
            positionItems(offsetX, offsetY, angle, null);
          }, k * stepDuration);

          k++;
          i--;
        }

      }

    };

    /*
      Often we want to enumerate the activeItem. This utility ensures it doesn't go over the bounds when we're doing so.
    */
    function validateActiveItem () {
      if (activeItem < 0) {
        activeItem = cycleMax-1;
      } else if (activeItem >= cycleMax) {
        activeItem = 0;
      }
    };


    /*
      A custom hack that prevents layering issues at either side of carousel.
      This just numerates z-indexes from the further back items to the furthest front.
      To do this, we check the offset().top values of each item, therefore a flat carousel doesn't work here.
    */
    function layerHack (oldActiveItem) {


      // NOTE: heights recorded before the css transition took place.

      // Sort the items by offset().top values
      var sortedItems = itemHeights.sort(function(a, b) {
        return a.top - b.top;
      });

      // Loop through and set z-indexes by top-to-bottom offset().top's.
      var i = 0;
      while (i < sortedItems.length) {
        if (sortedItems[i].index === oldActiveItem) {
          $items.eq(sortedItems[i].index - 1).css({'z-index': sortedItems.length - 1});
          $items.eq(sortedItems[i].index).css({'z-index': sortedItems.length - 1});
        }
        $items.eq(sortedItems[i].index).css('z-index', i);

        i++;
      }

      // Small hack: the old active item when going back/left seems to get a low z-index. This works.
      var buggedItem = activeItem + 1;
      if (buggedItem < 0) {
        buggedItem = cycleMax-1;
      } else if (buggedItem >= cycleMax) {
        buggedItem = 0;
      }
      $items.eq(buggedItem).css('z-index', cycleMax);

      // Strongest z-index on the active item.
      $items.eq(activeItem).css('z-index', cycleMax + 1);

    };


    /*
      Calculates the shorted route through the items array (forwards OR backwards)
      
      @params
      array: array of carousel items
        start: route start position
        end: route end position

        @returns
        Object: { direction (int), steps (int) }

        Credit @marcusehaslam for help here!
     */
    function findBestRoute (array, start, end){

      var left = 0, right = 0;

      var index = start;
      while(index !== end){
        right++;
        index = (index === array.length-1) ? 0 : index + 1;
      }
     
      index = start;
      while(index !== end){
        left++;
        index = (index === 0) ? array.length-1 : index - 1;
      }
     
      return (left > right) ? { 'direction' : 1, 'steps' : right } : { 'direction' : 0, 'steps' : left };
    };

    /*
      Position items for first time
    */
    positionItems(offsetX, offsetY, angle);

    /*
      Apply transition class only after a brief delay (browser internals mean the transitions happen before we want otherwise)
      Also then set duration of transitions
    */
    var transitionsDelay = setTimeout(function() {
      $items.addClass('transition');
      var inSeconds = options.duration / 1000 + 's';
      $items.css('transition-duration', inSeconds);
    }, 10);
    

    var methods = {

      /*
        Cycles the carousel to the next or previous item. Relies on CSS transition support.

        @params
        direction (int) 1/0. 1 = right/forward, 0 = left/backward.
      */

      cycleActive: function (direction) {

        // Remove old active classes.
        var activeElement = $items.eq(activeItem);
        activeElement.removeClass('active');

        // Update activeItem & keep within the array limit.
        previousActiveElement = activeItem;
        activeItem = ((direction === 'previous') ? activeItem - 1 : activeItem + 1);
        validateActiveItem();

        // Add new active class, reposition items with positionItems.
        positionItems(offsetX, offsetY, angle, null);

      },

      /*
        Cycles the carousel to a specific item. Relies on CSS transition support.

        @params
        index = item you want to cycle to.
      */

      cycleActiveTo: function (index) {

        // Remove old active classes.
        var activeElement = $items.eq(activeItem);
        activeElement.removeClass('active');

        //If user clicks more than 2 items away, numerate (over time) the drawing to protect the animation from layering glitches.
        var difference = Math.abs(index - activeItem);

        // Do either an instant transition, or a stepped animation if user skips more than 2 items at once.
        if (difference >= 2) {

          var direction = 1;
          var route = findBestRoute($items, activeItem, index);
          doSteppedCycle(route.steps, route.direction, cycleDuration - 100);

        } else {

          previousActiveElement = activeItem;
          activeItem = index;

          // activeItem changed, validate
          validateActiveItem();

          // Add new active class, reposition items with positionItems.
          positionItems(offsetX, offsetY, angle, null);
          
        }

      },

      /* Proxy binding events */
      on: function(e, fn) {
        $ele.on(e, fn);
      }
    };

    return methods;

  };

}(jQuery));