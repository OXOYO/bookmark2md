/**
 * Created by OXOYO on 2017/10/13.
 */
var bookmark2md = {}

const lineBreak = '\n\n'

bookmark2md.getBookmarks = function (callback) {
  chrome.bookmarks.getTree(function (res) {
    console.log('bookmarks', res)
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
  let rootID = '-1'
  let rootTitle = 'README'
  exclusion = exclusion.split(',').filter(item => !!item.trim())
  bookmark2md.getBookmarks(function (bookmarks) {
    let dirMap = {
      [rootID]: {
        content: [],
        dateAdded: '',
        id: rootID,
        title: rootTitle,
        level: 0
      }
    }
    let findDir = function (item) {
      return item.hasOwnProperty('children')
    }
    let getSize = function (count) {
      let arr = new Array(count > 6 ? 6 : count).fill('#')
      return arr.join('') + ' '
    }
    let handler = function (children, parentIdArr, parentTile, level) {
      for (let childIndex = 0, childrenLen = children.length, dirLen = 0; childIndex < childrenLen; childIndex++) {
        if (dirLen === childrenLen) {
          level = 0
          parentIdArr = [rootID]
        }
        let item = children[childIndex]
        // dir
        if (findDir(item)) {
          dirLen = dirLen + 1
          if (!item.title) {
            console.log('item.title', item)
          }
          if (item.title && !exclusion.includes(item.title)) {
            if (!Object.keys(dirMap).includes(item.id) && item.title) {
                dirMap[item.id] = {
                  ...item,
                  content: [],
                  level: level
                }
                dirMap[item.id]['content'].push('# ' + item.title + lineBreak)
                delete dirMap[item.id]['children']
                parentIdArr = [
                  ...parentIdArr,
                  item.id
                ]
                handler(item.children, parentIdArr, item.title, ++level)
            }
          }
        }
        /*
        else {
          // file
          let lastParentId
          let len = parentIdArr.length
          parentIdArr.map((parentId, index) => {
            let parentIndex = children.findIndex(child => child.parentId === item.parentId)
            if (!dirMap[parentId] && !lastParentId) {
              for (let i = 0, id; i< len; i++) {
                id = parentIdArr[i]
                if (dirMap[id]) {
                  lastParentId = id
                } else {
                  break
                }
              }
              parentId = lastParentId
            }
            if(parentIndex === 0 && parentIdArr.indexOf(parentId) !== parentIdArr.length - 1) {
              dirMap[parentId]['content'].push(getSize(parentIdArr.length) + ' ' + parentTile + lineBreak)
            }
            dirMap[parentId]['content'].push(
              bookmark2md.formatDate(item.dateAdded) +
              ' [' +
              bookmark2md.html2Escape(item.title) +
              '](' +
              item.url + ')' +
              lineBreak
            )
          })
        }
        */
      }
    }
    if (!bookmarks[0]['title']) {
      bookmarks[0]['title'] = rootTitle
    }
    handler(bookmarks, [rootID], rootTitle, 1)
    console.log('dirMap', Object.keys(dirMap).length, dirMap)
    let dirTitleArr = []
    Object.keys(dirMap).map(dirId => {
      let item = dirMap[dirId]
      dirTitleArr.push(item.title)
      console.log(item.level, item.title)
      if (dirId === rootID || (dirId !== rootID && item.title)) {
        let file = item.content.join('')
        callback(item.title, file)
      }
    })
    let firstLevelDir = []
    bookmarks[0]['children'][0]['children'].map(item => {
      firstLevelDir.push(item.title)
    })
    let dirTitleArrNotInclude = []
    firstLevelDir.map(dir => {
      if (!dirTitleArr.includes(dir)) {
        dirTitleArrNotInclude.push(dir)
      }
    })
    let firstLevelDirNotInclude = []
    dirTitleArr.map(dir => {
      if (!firstLevelDir.includes(dir)) {
        firstLevelDirNotInclude.push(dir)
      }
    })
    console.log('dirTitleArr', dirTitleArr.length, dirTitleArr.sort().join(','))
    console.log('firstLevelDir', firstLevelDir.length, firstLevelDir.sort().join(','))
    console.log('dirTitleArrNotInclude', dirTitleArrNotInclude.length, dirTitleArrNotInclude.sort().join(','))
    console.log('firstLevelDirNotInclude', firstLevelDirNotInclude.length, firstLevelDirNotInclude.sort().join(','))
  })
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
