/*!
 * Zepto HTML5 Drag and Drop Sortable
 * Author: James Doyle(@james2doyle) http://ohdoylerules.com
 * Repository: https://github.com/james2doyle/zepto-dragswap
 * Licensed under the MIT license
 */

    $.fn.dragswap = function (options) {
        var dragSrcEl;
        function getPrefix() {
            var el = document.createElement('p'),
            getPre, transforms = {
                'webkitAnimation': '-webkit-animation',
                'OAnimation': '-o-animation',
                'msAnimation': '-ms-animation',
                'MozAnimation': '-moz-animation',
                'animation': 'animation'
            };
            document.body.insertBefore(el, null);
            for (var t in transforms) {
                if (el.style[t] !== undefined) {
                    el.style[t] = "translate3d(1px,1px,1px)";
                    getPre = window.getComputedStyle(el).getPropertyValue(transforms[t]);
                    // return the successful prefix
                    return t;
                }
            }
            document.body.removeChild(el);
        }
        this.defaultOptions = {
            element: 'li',
            overClass: 'over',
            moveClass: 'moving',
            dropClass: 'drop',
            dropAnimation: false,
            exclude: '.disabled',
            prefix: getPrefix(),
            dropComplete: function (dragSrcEl, originalParent) {
                return;
            }
        };

        function excludePattern(elem) {
            return elem.is(settings.excludePatt);
        }

        function onAnimEnd(elem) {
            var $elem = $(elem);
            $elem.addClass(settings.dropClass);
            // add an event for when the animation has finished
            $elem.on(settings.prefix + 'End', function () {
                // remove the class now that the animation is done
                $elem.removeClass(settings.dropClass);
                // $elem.removeClass(settings.moveClass);
            }, false);

            window.setTimeout(function() {
                $elem.removeClass(settings.dropClass);
            }, 1000);
        }

        function handleDragStart(e) {
            if (!excludePattern($(this))) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            $(this).parent().addClass(settings.moveClass);
            // get the dragging element
            dragSrcEl = $(this).parent();
            // it is moving
            //console.log(e);
            if (e.originalEvent.dataTransfer) {
              var dt = e.originalEvent.dataTransfer;
              dt.effectAllowed = 'move';        
              dt.setData('text', $(this).parent().html());
                
            }
            else if(e.dataTransfer){
              var dt = e.dataTransfer;
              dt.effectAllowed = 'move';        
              dt.setData('text', $(this).parent().html());
            }
        }

        var count = 1;

        function handleDragEnter(e) {
            // this / e.target is the current hover target.
            $(this).addClass(settings.overClass);
        }

        function handleDragLeave(e) {
            $(this).removeClass(settings.overClass); // this / e.target is previous target element.
        }

        function handleDragOver(e) {
            if (e.preventDefault) {
                e.preventDefault(); // Necessary. Allows us to drop.
            }
           if (e.originalEvent.dataTransfer) {
                e.originalEvent.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object.
            }
            else if(e.dataTransfer){
                e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object.
            }
            return false;
        }

        function handleDrop(e) {
            var originalParent = $(this);
            originalParent = originalParent.attr("draggable") === "true" ? originalParent.parent() : originalParent;

            // this / e.target is current target element.
            if (e.stopPropagation) {
                e.stopPropagation(); // Stops some browsers from redirecting.
            }
            if (!excludePattern($(this))) {
                console.log('prevent drop');
                return false;
            }

            // Don't do anything if dropping the same column we're draggi.
            if (dragSrcEl.attr("id") != originalParent.parent().attr("id")) {
                // Set the source column's HTML to the HTML of the column dropped on.
                // var content = originalParent.attr("draggable") === "true" ? originalParent.parent().html() : originalParent.html();
                var oldEl = {
                    html: originalParent.html(),
                    id: originalParent.attr("id"),
                    mode: originalParent.attr("data-mode")
                };
                var newEl = {
                    html: dragSrcEl.html(),
                    id: dragSrcEl.attr("id"),
                    mode: dragSrcEl.attr("data-mode")
                };
                // swap all the data

                // console.log("old--", oldEl);
                // console.log("new--", newEl);
                // console.log("dragged--", dragSrcEl[0]);

                $(dragSrcEl).html(oldEl.html);
                dragSrcEl.attr("id", oldEl.id);
                dragSrcEl.attr("data-mode", oldEl.mode);
                

                if (settings.dropAnimation) {
                    onAnimEnd(originalParent);
                    onAnimEnd(dragSrcEl);
                }
                originalParent.removeAttr('draggable');
                // originalParent.siblings().filter(settings.excludePatt).attr('draggable', true);
                
                originalParent.html(newEl.html);
                originalParent.attr("id", newEl.id);
                originalParent.attr("data-mode", newEl.mode);

                dragSrcEl.removeClass(settings.moveClass);
                originalParent.removeClass(settings.moveClass);
                originalParent.removeClass(settings.overClass);
                // this/e.target is the source node.
                //console.log('handleDragEnd');
                $elem = originalParent.parent().find(settings.element);
                // console.log($elem);
                $elem.each(function (index, item) {
                    // console.log(item);
                    $(item).removeClass(settings.overClass);
                    $(item).removeClass(settings.moveClass);
                });

                settings.dropComplete(dragSrcEl, originalParent);
            }
            return false;
        }

        var settings = $.extend({}, this.defaultOptions, options);
        if (settings.exclude) {
            if (typeof settings.exclude != 'string') {
                var excludePatt = '';
                for (var i = 0; i < settings.exclude.length; i++) {
                    excludePatt += ':not(' + settings.exclude[i] + ')';
                }
                settings.excludePatt = excludePatt;
            }
            else {
                settings.excludePatt = ':not(' + settings.exclude + ')';
            }
        }

        var method = String(options);
        var items = [];
        // check for the methods
        if (/^(toArray|toJSON)$/.test(method)) {
            if (method == 'toArray') {
                $(this).find(settings.element).each(function (index, elem) {
                    items.push(this.id);
                });
                return items;
            } else if (method == 'toJSON') {
                $(this).find(settings.element).each(function (index, elem) {
                    items[index] = {
                        id: this.id
                    };
                });
                return JSON.stringify(items);
            }
            return;
        }



        return this.each(function (index, item) {
            var $this = $(this);
            // select all but the disabled things
            var $elem = $this.find(settings.element);

            var target = this;
            var config = { childList: true };
            // var observer = new MutationObserver(function (mutations) {
            //     console.log(mutations);
            //     for(var i=0; i<mutations.length; i++){
            //       if(mutations[i].addedNodes.length != 0){
            //         for(var j=0; j<mutations[i].addedNodes.length; j++){
            //           $(mutations[i].addedNodes[j]).siblings().removeAttr('draggable');
            //           $(mutations[i].addedNodes[j]).siblings().filter(settings.excludePatt).attr('draggable', true);
            //         }
            //       }
            //     }
             
            // });

            // observer.observe(target, config);

            function handleDragEnd(e) {
                // $this.removeClass(settings.moveClass);

                $(this).parent().removeClass(settings.moveClass);
                // this/e.target is the source node.
                //console.log('handleDragEnd');
                $elem = $(this).parent().parent().find(settings.element);
                // console.log($elem);
                $elem.each(function (index, item) {
                    // console.log(item);
                    $(item).parent().removeClass(settings.overClass);
                    $(item).parent().removeClass(settings.moveClass);
                });
            }
            // set the items to draggable
            $elem.filter(settings.excludePatt).attr('draggable', true);

            $this.off('dragstart');
            $this.off('dragenter');
            $this.off('dragover');
            $this.off('dragleave');
            $this.off('drop');
            $this.off('dragend');

            $this.on('dragstart', settings.element, handleDragStart);
            //$this.on('dragenter', settings.element, handleDragEnter);
            //$this.on('dragover', settings.element, handleDragOver);
            $this.on('dragleave', settings.element, handleDragLeave);
            $this.on('drop', settings.element, handleDrop);
            //$this.on('dragend', settings.element, handleDragEnd);


            //$this.on('dragstart', ".item", handleDragStart);
            $this.on('dragenter', settings.dropzone, handleDragEnter);
            $this.on('dragover', settings.dropzone, handleDragOver);
            $this.on('dragleave', settings.dropzone, handleDragLeave);
            $this.on('drop', settings.dropzone, handleDrop);
            // $this.on('dragend', settings.dropzone, handleDragEnd);
        });


        function handleDrop1(e) {
            // this / e.target is current target element.
            if (e.stopPropagation) {
                e.stopPropagation(); // Stops some browsers from redirecting.
            }
            if (!excludePattern($(this))) {
                console.log('prevent drop');
                return false;
            }

            // Don't do anything if dropping the same column we're draggi.
            if (dragSrcEl != this) {
                // Set the source column's HTML to the HTML of the column dropped on.
                // var oldEl = {
                //     html: $(this).html(),
                //     id: this.id
                // };
                // var newEl = {
                //     html: $(dragSrcEl).html(),
                //     id: $(dragSrcEl).attr("id")
                // };

                var oldEl = {
                    html: $(this).html(),
                    id: $(this).attr("id"),
                    mode: $(this).attr("data-mode")
                };
                var newEl = {
                    html: dragSrcEl.html(),
                    id: dragSrcEl.attr("id"),
                    mode: dragSrcEl.attr("data-mode")
                };

                console.log("old--", oldEl);
                console.log("new--", newEl);
                console.log("dragged--", dragSrcEl);

                // swap all the data
                $(dragSrcEl).html(oldEl.html);
                dragSrcEl.id = oldEl.id;
                this.innerHTML = newEl.html;
                this.id = newEl.id;

                // if (settings.dropAnimation) {
                //     onAnimEnd(this);
                //     onAnimEnd(dragSrcEl);
                // }
                // $(this).siblings().removeAttr('draggable');
                // $(this).siblings().filter(settings.excludePatt).attr('draggable', true);
                // console.log('dropped');

                // settings.dropComplete();
            }
            return false;
        }
    };
