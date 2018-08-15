/**
 * Created by OXOYO on 2018/8/3.
 */

let Bookmark2Github = new OAuth2('github', {
  client_id: '004b7c9e59a81dfae785',
  client_secret: 'afc402eef1fb5a2788dffee8477d0964511a524b',
  api_scope: 'repo'
})

let pushCount = {
  total: 0,
  success: 0,
  error: 0
}

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
      getUserRepos(res)
    },
    error: function (jqXHR) {
      hideLoading()
      showNotice(jqXHR.responseJSON.message || jqXHR.responseText, 'error')
    }
  })
}

function getUserRepos (userInfo, page = 1) {
  let url = `${ userInfo.repos_url }?per_page=100&page=${ page }`
  showLoading('Loading user repos...')
  $.ajax({
    type: 'GET',
    url: url,
    headers: {
      Authorization: `token ${Bookmark2Github.access_token}`
    },
    success: function (res) {
      hideLoading()
      Bookmark2Github.userRepos = res
      let repoList = []
      res.map(item => {
        repoList.push(`<option value="${ item.name }">${ item.name }</option>`)
      })
      $('#repo-list').append(repoList.join(''))
      if (repoList.length) {
        getUserRepos(userInfo, page + 1)
      }
    },
    error: function (jqXHR) {
      hideLoading()
      showNotice(jqXHR.responseJSON.message || jqXHR.responseText, 'error')
    }
  })
}

function getRepoBranches(repo) {
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

function getContent (fileName, fileContent, callback) {
  let owner = Bookmark2Github.userInfo.login
  let repo = $('#repo-list').val()
  let path = fileName + '.md'
  let url = `https://api.github.com/repos/${ owner }/${ repo }/contents/${ path }`
  $.ajax({
    type: 'GET',
    url: url,
    contentType: 'application/json',
    headers: {
      Authorization: `token ${Bookmark2Github.access_token}`
    },
    dataType: 'json',
    success: function(res){
      callback(fileName, fileContent, res.sha || null)
    },
    error: function (jqXHR) {
      if (jqXHR.status === 404) {
        callback(fileName, fileContent, null)
      } else {
        hideLoading()
      }
      // showNotice(jqXHR.responseJSON.message || jqXHR.responseText, 'error')
    }
  })
}

function putContent (fileName, fileContent, sha) {
  let owner = Bookmark2Github.userInfo.login
  let repo = $('#repo-list').val()
  let branch = $('#branch-list').val() || 'master'
  let msg = $('#commitMessage').val()
  let path = fileName + '.md'
  let url = `https://api.github.com/repos/${ owner }/${ repo }/contents/${ path }`
  let data = {
    message: msg,
    committer: {
      name: Bookmark2Github.userInfo.name,
      email: Bookmark2Github.userInfo.email
    },
    branch: branch,
    content: Base64.encode(fileContent)
  }
  if (sha) {
    data['sha'] = sha
  }
  showLoading('push to github...')
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
      pushCount.success++
      hideLoading()
      // showNotice(`push ${ path } success`, 'success')
      showNotice(`push total ${ pushCount.total }, success: ${ pushCount.success }, fail: ${ pushCount.error }`, 'info')
    },
    error: function (jqXHR) {
      pushCount.error++
      hideLoading()
      // showNotice(jqXHR.responseJSON.message || jqXHR.responseText, 'error')
      showNotice(`push total ${ pushCount.total }, success: ${ pushCount.success }, fail: ${ pushCount.error }`, 'info')
    }
  })
}

function doPush () {
  showLoading('transfer bookmarks...')
  let exclusion = $('#exclusion').val().trim()
  let maxLevel = parseInt($('#maxLevel').val()) || 0
  pushCount = {
    total: 0,
    success: 0,
    error: 0
  }
  bookmark2md.transfer(exclusion, maxLevel, function (fileName, fileContent) {
    pushCount.total++
    getContent(fileName, fileContent, putContent)
  })
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
    getRepoBranches($(event.target).val() || '')
  });

  checkAuthorized()
}

$(function () {
  init()
})
