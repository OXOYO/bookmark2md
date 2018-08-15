/**
 * Created by OXOYO on 2017/10/13.
 */
let bookmark2md = {}

const lineBreak = '\n\n'

bookmark2md.getBookmarks = function (callback) {
  chrome.bookmarks.getTree(function (res) {
    callback(res)
  })
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

bookmark2md.transfer = function (exclusion, maxLevel, callback) {
  bookmark2md.getBookmarks(function (bookmarks) {
    let rootID = '-1'
    let rootTitle = 'README'
    let level = 1
    let dirMap = {
      [rootID]: {
        content: [],
        dateAdded: '',
        id: rootID,
        title: rootTitle,
        level: 0
      }
    }
    let getSize = function (count) {
      let arr = new Array(count > 6 ? 6 : count).fill('#')
      return arr.join('') + ' '
    }
    exclusion = exclusion.split(',').filter(item => !!item.trim())
    if (!bookmarks[0]['title']) {
      bookmarks[0]['title'] = rootTitle
    }
    let handler = function (children, parentIdArr, parentTile, level) {
      let fileLen = 0
      let childrenLen = children.length
      children.map(item => {
        let tmpParentIdArr = [...parentIdArr]
        if (item.hasOwnProperty('children')) {
          if (item.title && !exclusion.includes(item.title)) {
            if (!Object.keys(dirMap).includes(item.id)) {
              dirMap[item.id] = {
                ...item,
                content: [],
                level: level,
                parentIdArrLen: tmpParentIdArr.length
              }
              dirMap[item.id]['content'].push('# ' + item.title + lineBreak)
              delete dirMap[item.id]['children']
              tmpParentIdArr.push(item.id)
            }
            handler(item.children, [...tmpParentIdArr], item.title, level + 1)
          }
        } else {
          fileLen++
          // file
          let lastParentId
          let parentLength = tmpParentIdArr.length
          tmpParentIdArr.map((parentId, index) => {
            if (!dirMap[parentId]) {
              for (let i = 0, id; i< parentLength; i++) {
                id = tmpParentIdArr[i]
                if (dirMap[id]) {
                  lastParentId = id
                } else {
                  break
                }
              }
              parentId = lastParentId
            }

            if (parentId) {
              if(fileLen === 1 && tmpParentIdArr.indexOf(parentId) !== parentLength - 1) {
                dirMap[parentId]['content'].push(getSize(parentLength) + ' ' + parentTile + ' ' + lineBreak)
              }
              dirMap[parentId]['content'].push(
                bookmark2md.formatDate(item.dateAdded) +
                ' [' +
                bookmark2md.html2Escape(item.title) +
                '](' +
                item.url + ')' +
                lineBreak
              )
              if (fileLen === childrenLen) {
                dirMap[parentId]['content'].push(lineBreak)
              }
            }
          })
        }
        if (fileLen === childrenLen) {
          fileLen = 0
          level = 0
          parentIdArr = [rootID]
        }
      })
    }
    handler(bookmarks, [rootID], rootTitle, level)

    Object.keys(dirMap).map(dirId => {
      let item = dirMap[dirId]
      if (item.level <= maxLevel) {
        if (dirId === rootID || (dirId !== rootID && item.title)) {
          let file = ''
          if (item.content && item.content instanceof Array) {
            file = item.content.join('')
          }
          callback(item.title, file)
        }
      }
    })
  })
}
