/**
 * Created by OXOYO on 2017/10/17.
 */

var utils = {
    lang: function () {
        var $node = $("[lang]")
        $node.each(function (i, el) {
            var $el = $(el)
            var langVal = $el.attr('lang')
            var langValArr = langVal.split('-')
            var langType = langValArr[0]
            var langKey = langValArr[1]
            console.log('langKey', $el, langKey)
            if (langKey) {
                var langText = chrome.i18n.getMessage(langKey)
                switch (langType) {
                    case 'html':
                        $el.html(langText)
                        break
                    case 'val':
                        $el.val(langText)
                        break
                    case 'placeholder':
                        $el.attr('placeholder', langText)
                        break
                }
            }
        })
    }
}