/**
 * Created by OXOYO on 2017/10/13.
 */
var bookmark2md = {}

const lineBreak = '\n\n'

bookmark2md.getBookmarks = function () {
  let bookmarks = []
  chrome.bookmarks.getTree(function (res) {
    console.log('bookmarks', res)
    bookmarks = res
  })
  return bookmarks
}

bookmark2md.html2Escape = function (str) {
  return str.replace(/[<>&"]/g, function (c) {
    return {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;'
    }[c]
  })
}

bookmark2md.formatDate = (time, fmt = 'yyyy-MM-dd hh:mm') => {
  let timeStr = time + ''
  if (timeStr.length < 13) {
    time = time * (Math.pow(10, 13 - timeStr.length))
  }
  time = parseInt(time)
  if (isNaN(time)) {
    return ''
  }
  let date = new Date(time)
  let padLeftZero = (str) => {
    return ('00' + str).substr(str.length)
  }
  let doFormatDate = (date, fmt) => {
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    let obj = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds()
    }
    for (let k in obj) {
      if (new RegExp(`(${k})`).test(fmt)) {
        let str = obj[k] + ''
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str))
      }
    }
    return fmt
  }

  return doFormatDate(date, fmt)
}

bookmark2md.transfer = function (filter) {
  let bookmarks = bookmark2md.getBookmarks()
  let fileMap = {}
  let findDir = function (item) {
    return item.hasOwnProperty('children')
  }

  // let level = 0
  let handler = function (children, parentId) {
    let content = children.map(item => {
      // dir
      if (findDir(item)) {
        if (!Object.keys(fileMap).includes(item.id)) {
          fileMap[item.id] = {
            ...item
          }
        }
        // 处理 content
        fileMap[item.id]['content'] = handler(item.children, item.id)
        return item
      } else {
        // file
        return bookmark2md.formatDate(item.dateAdded) + ' [' + bookmark2md.html2Escape(item.title) + '](' + item.url + ')' + lineBreak
      }
    })
    // level++
  }
  handler(bookmarks, -1)
}

bookmark2md.filterBookmarks = function (bookmarks) {

  let handler = function (item) {

  }
  let level = 1
  bookmarks.map(item => {
    // dir
    if (findDir(item)) {

    } else {
      // file

    }
  })
}
