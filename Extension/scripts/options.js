/**
 * Created by OXOYO on 2018/8/3.
 */

let Bookmark2Github = new OAuth2('github', {
  client_id: '004b7c9e59a81dfae785',
  client_secret: 'afc402eef1fb5a2788dffee8477d0964511a524b',
  api_scope: 'repo%20user'
})

let pushCount = {
  total: 0,
  success: 0,
  error: 0
}

let allRepoList = []

function authorize() {
  Bookmark2Github.authorize(checkAuthorized)
}

function clearAuthorized() {
  Bookmark2Github.clearAccessToken()
  checkAuthorized()
}

function checkAuthorized() {
  hideNotice()
  if (Bookmark2Github.hasAccessToken()) {
    $('#options').addClass('authorized')
    // 获取访问token
    Bookmark2Github.access_token = Bookmark2Github.getAccessToken()
    // 获取用户信息
    getUserInfo()
  } else {
    $('#options').removeClass('authorized')
  }
}

function getUserInfo () {
  let url = `https://api.github.com/user`
  showLoading('Loading user info...')
  $.ajax({
    type: 'GET',
    url: url,
    headers: {
      Authorization: `token ${Bookmark2Github.access_token}`
    },
    success: function (res) {
      hideLoading()
      Bookmark2Github.userInfo = res
      $('#user-avatar').attr('src', res.avatar_url)
      $('#user-name').html(res.login)
      $('#user-name').attr('href', res.html_url)
      allRepoList = []
      getUserRepos(res)
    },
    error: function (jqXHR) {
      hideLoading()
      showNotice(jqXHR.responseJSON.message || jqXHR.responseText, 'error')
    }
  })
}

function getUserRepos (userInfo, page = 1) {
  let url = `https://api.github.com/search/repositories?q=user:${ userInfo.login }&per_page=100&page=${ page }`
  showLoading('Loading user repos...')
  $.ajax({
    type: 'GET',
    url: url,
    headers: {
      Authorization: `token ${Bookmark2Github.access_token}`,
    },
    success: function (res) {
      hideLoading()
      Bookmark2Github.userRepos = res
      let repoList = []
      res.items.map(item => {
        allRepoList.push(item.name)
        repoList.push(`<option value="${ item.name }">${ item.name }</option>`)
      })
      if (repoList.length) {
        $('#repo-list').append(repoList.join(''))
        getUserRepos(userInfo, page + 1)
      } else {
        let repo = localStorage.getItem('repo')
        if (repo && allRepoList.includes(repo)) {
          $('#repo-list').val(repo)
        }
        getRepoBranches($('#repo-list').val())
      }
    },
    error: function (jqXHR) {
      hideLoading()
      showNotice(jqXHR.responseJSON.message || jqXHR.responseText, 'error')
    }
  })
}

function getRepoBranches(repo) {
  if (!repo) {
    return
  }
  let owner = Bookmark2Github.userInfo.login
  let url = `https://api.github.com/repos/${ owner }/${ repo }/branches`
  showLoading('Loading repo branches...')
  $.ajax({
    type: 'GET',
    url: url,
    headers: {
      Authorization: `token ${Bookmark2Github.access_token}`
    },
    success: function (res) {
      hideLoading()
      let branchList = []
      res.map(item => {
        branchList.push(`<option value="${ item.name }">${ item.name }</option>`)
      })
      $('#branch-list').html(branchList.join(''))
    },
    error: function (jqXHR) {
      hideLoading()
      showNotice(jqXHR.responseJSON.message || jqXHR.responseText, 'error')
    }
  })
}

function getContent (fileName) {
  let owner = Bookmark2Github.userInfo.login
  let repo = $('#repo-list').val()
  let path = fileName + '.md'
  let url = `https://api.github.com/repos/${ owner }/${ repo }/contents/${ path }`
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: 'GET',
      url: url,
      contentType: 'application/json',
      headers: {
        Authorization: `token ${Bookmark2Github.access_token}`
      },
      dataType: 'json',
      success: function(res){
        resolve(res.sha || null)
      },
      error: function (err) {
        resolve(null)
        if (err && err.status === 404) {
          let message = `Not Found ${ fileName }.md`
          showNotice(message, 'error')
        }
      }
    })
  })
}

function putContent (fileName, fileContent) {
  return getContent(fileName).then(function (sha) {
    let owner = Bookmark2Github.userInfo.login
    let repo = $('#repo-list').val()
    let branch = $('#branch-list').val() || 'master'
    let msg = $('#commitMessage').val()
    let path = fileName + '.md'
    let url = `https://api.github.com/repos/${ owner }/${ repo }/contents/${ path }`
    let data = {
      message: msg,
      branch: branch,
      content: Base64.encode(fileContent)
    }
    if (sha) {
      data['sha'] = sha
    }
    showLoading('push to github...')
    return new Promise(function (resolve, reject) {
      $.ajax({
        type: 'PUT',
        url: url,
        contentType: 'application/json',
        headers: {
          Authorization: `token ${Bookmark2Github.access_token}`
        },
        dataType: 'json',
        data: JSON.stringify(data),
        success: function(res){
          resolve(res)
        },
        error: function (err) {
          reject(err)
        }
      })
    })
  })
}

function doPush () {
  showLoading('transfer bookmarks...')
  setTimeout(function () {
    let exclusion = $('#exclusion').val().trim()
    let maxLevel = parseInt($('#maxLevel').val()) || 0
    pushCount = {
      total: 0,
      success: 0,
      error: 0
    }
    bookmark2md.transfer(exclusion, maxLevel, function (fileMap) {
      let fileNameArr = Object.keys(fileMap)
      console.log(fileMap)
      let i = 0
      pushCount.total = fileNameArr.length
      let handler = function () {
        putContent(fileNameArr[i], fileMap[fileNameArr[i]]).then(function () {
          pushCount.success++
          showNotice(`push total ${ pushCount.total }, success: ${ pushCount.success }, fail: ${ pushCount.error }`, 'info')
          next()
        }).catch(function (err) {
          pushCount.error++
          showNotice(`push total ${ pushCount.total }, success: ${ pushCount.success }, fail: ${ pushCount.error }`, 'info')
          next()
          console.log('push err', err)
        })
      }
      let next = function () {
        i = i + 1
        setTimeout(function () {
          if (pushCount.success + pushCount.error < pushCount.total) {
            handler()
          } else {
            hideLoading()
          }
        }, 1000)
      }
      handler()
    })
  }, 0)
}

function showLoading (msg) {
  $('#loading').show()
  if (msg) {
    $('#loadingMsg').html(msg)
  }
}
function hideLoading () {
  $('#loading').hide()
  $('#loadingMsg').empty()
}

function showNotice (content, type) {
  let defType = {
    success: 'notice-success',
    error: 'notice-error',
    info: 'notice-info',
  }
  content = content || type
  $('#notice').removeClass(Object.values(defType).join(' '))
  $('#notice').html(content).show()
  $('#notice').addClass(defType[type])
}
function hideNotice () {
  $('#notice').empty().hide()
}

function init () {
  // login
  $('#login').click(function () {
    authorize()
  })
  $('#logout').click(function () {
    clearAuthorized()
  })
  $('#push').click(function () {
    doPush()
  })
  $('#bookmarks').click(function () {
    bookmark2md.getBookmarks()
  })
  $('#refresh').click(checkAuthorized)
  $('#repo-list').change(function (event) {
    let val = $(event.target).val().trim()
    getRepoBranches(val)
    localStorage.setItem('repo', val)
  });
  $('#exclusion').change(function (event) {
    let val = $(event.target).val().trim()
    localStorage.setItem('exclusion', val)
  })
  $('#maxLevel').change(function (event) {
    let val = $(event.target).val()
    localStorage.setItem('maxLevel', val)
  })
  $('#commitMessage').change(function (event) {
    let val = $(event.target).val()
    localStorage.setItem('commitMessage', val)
  })

  if (localStorage.getItem('exclusion')) {
    $('#exclusion').val(localStorage.getItem('exclusion'))
  }
  if (localStorage.getItem('maxLevel')) {
    $('#maxLevel').val(localStorage.getItem('maxLevel'))
  }
  if (localStorage.getItem('commitMessage')) {
    $('#commitMessage').val(localStorage.getItem('commitMessage'))
  }

  checkAuthorized()

  utils.lang()
}

$(function () {
  init()
})
