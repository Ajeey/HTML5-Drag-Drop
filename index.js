$(function() {

    $("body").on("click", ".ajey", function() {
        alert("click works");
    });

    $('.sortable').dragswap({
        element : '.handle',
        // element : 'li',
        dropzone: '.item',
        dropAnimation: true,
        dropComplete: function(dragSrcEl, originalParent) {
            console.log("original", $(dragSrcEl));
            console.log("dragged", $(originalParent));

            var draggedElement = $(originalParent);
            var originalElement = $(dragSrcEl);

            var originalState = $(dragSrcEl).attr("data-mode");

            if(!(draggedElement.attr("data-mode") === "close" && originalElement.attr("data-mode") === "close")
                && 
                !(draggedElement.attr("data-mode") === "open" && originalElement.attr("data-mode") === "open")
            ) {

                if(originalState === "open") {
                    expand(draggedElement);
                    collpase(originalElement);
                } else {
                    expand(originalElement);
                    collpase(draggedElement);
                }
            }
        }
    });

    $("body").on("click", ".min", function() {
        var that = this;
        var element = $(this).closest(".item");
        var otherElement;

        if(element.attr("data-mode") === "open") {
            collpase(element);
        } else if(element.attr("data-mode") === "close") {
            expand(element);
        }

        element.closest(".column").find(".item").each(function(idx, item) {
            if(element.attr("id") !== $(item).attr("id")) {
                otherElement = $(item);
            }
        });

        if(otherElement) {
            console.log(otherElement);
            if(otherElement.attr("data-mode") === "open") {
                collpase(otherElement);
            } else if(otherElement.attr("data-mode") === "close") {
                expand(otherElement);    
            }
        }
    });

    function collpase(element) {
        element.find(".content").slideUp();
        element.attr("data-mode", "close");
        element.find(".min").css("background", "url('images/ic_plus_32px.png')");
    }

    function expand(element) {
        element.find(".content").slideDown();
        element.attr("data-mode", "open");
        element.find(".min").css("background", "url('images/ic_minus_32px.png')");
    }
});