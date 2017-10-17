/**
 * Created by OXOYO on 2017/10/17.
 */


$(function() {
    var config = {
        color: 'white'
    }
    chrome.storage.sync.get(config, function(items) {
        document.body.style.backgroundColor = items.color
    })

    utils.lang()

    $('.menu-item').click(function () {
        var name = $(this).data('name')
        switch (name) {
            case 'export':
                // alert('export')
                window.open(chrome.extension.getURL('../html/export.html'));
            break
        }
    })

})