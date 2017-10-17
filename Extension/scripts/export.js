/**
 * Created by OXOYO on 2017/10/17.
 */


$(function() {
    utils.lang()

    $('#submit').click(function (event) {
        event.preventDefault()
        var unless = $('#unless').val()
        // alert(unless)
        console.log('chrome.bookmarks', chrome, chrome.bookmarks.getTree)
        chrome.bookmarks.getTree(function(dataArr){
            bookmark2md(dataArr)
        })
    })
})