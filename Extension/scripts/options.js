/**
 * Created by OXOYO on 2018/8/3.
 */

var Bookmark2Github = new OAuth2('github', {
  client_id: '004b7c9e59a81dfae785',
  client_secret: 'afc402eef1fb5a2788dffee8477d0964511a524b',
  api_scope: 'repo'
})

function authorize() {
  Bookmark2Github.authorize(checkAuthorized)
}

function clearAuthorized() {
  console.log('clear')
  Bookmark2Github.clearAccessToken()
  checkAuthorized()
}

function checkAuthorized() {
  hideNotice()
  console.log('checkAuthorized');
  console.log('provider.hasAccessToken()', Bookmark2Github, Bookmark2Github.hasAccessToken())
  if (Bookmark2Github.hasAccessToken()) {
    $('#options').addClass('authorized')
    // 获取访问token
    Bookmark2Github.access_token = Bookmark2Github.getAccessToken()
    $('#console').html(Bookmark2Github.access_token)
    // 获取用户信息
    getUserInfo()
  } else {
    $('#options').removeClass('authorized')
  }
}

function getUserInfo () {
  let url = `https://api.github.com/user`
  showLoading()
  $.ajax({
    type: 'GET',
    url: url,
    headers: {
      Authorization: `token ${Bookmark2Github.access_token}`
    },
    success: function (res) {
      hideLoading()
      Bookmark2Github.userInfo = res
      console.log('userInfo', res)
      $('#user-avatar').attr('src', res.avatar_url)
      $('#user-name').html(res.login)
      $('#user-name').attr('href', res.html_url)
      getUserRepos(res)
    },
    error: function (jqXHR) {
      console.log('getUserInfo jqXHR', jqXHR)
      hideLoading()
      showNotice(jqXHR.responseText, 'error')
    }
  })
}

function getUserRepos (userInfo, page = 1) {
  let url = `${ userInfo.repos_url }?per_page=100&page=${ page }`
  showLoading()
  $.ajax({
    type: 'GET',
    url: url,
    headers: {
      Authorization: `token ${Bookmark2Github.access_token}`
    },
    success: function (res) {
      hideLoading()
      Bookmark2Github.userRepos = res
      console.log('userRepos', res)
      let repoList = []
      res.map(item => {
        repoList.push(`<option value="${ item.name }">${ item.name }</option>`)
      })
      $('#repo-list').html(repoList.join(''))
    },
    error: function (jqXHR) {
      console.log('getUserRepos jqXHR', jqXHR)
      hideLoading()
      showNotice(jqXHR.responseText, 'error')
    }
  })
}

function putContent () {
  let owner = Bookmark2Github.userInfo.login
  let repo = $('#repo-list option:selected').val()
  let path = new Date().getTime() + '.txt'
  // let path = '001.txt'
  let url = `https://api.github.com/repos/${ owner }/${ repo }/contents/${ path }`
          // https://api.github.com/repos/oxoyo/bookmark-hub/contents/003.txt
  let data = {
    message: 'my commit message',
    committer: {
      name: Bookmark2Github.userInfo.name,
      email: Bookmark2Github.userInfo.email
    },
    branch: 'master',
    content: ''
  }
  showLoading()
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
      hideLoading()
      showNotice('push success', 'success')
    },
    error: function (jqXHR) {
      console.log('putContent jqXHR', jqXHR)
      hideLoading()
      showNotice(jqXHR.responseText, 'error')
    }
  })
}

function doPush () {
  bookmark2md.transfer()
}

function showLoading () {
  $('#loading').show()
}
function hideLoading () {
  $('#loading').hide()
}

function showNotice (content, type) {
  let defType = {
    success: 'notice-success',
    error: 'notice-error',
    info: 'notice-info',
  }
  content = content || type
  Object.values(val => {
    $('#notice').removeClass(val)
  })
  $('#notice').html(content).show()
  $('#notice').addClass(defType[type])
}
function hideNotice () {
  $('#notice').empty().show()
}

function init () {
  // login
  $('#login').click(function () {
    authorize()
  })
  $('#logout').click(function () {
    console.log('do logout')
    clearAuthorized()
  })
  $('#push').click(function () {
    console.log('do push')
    doPush()
  })
  $('#bookmarks').click(function () {
    bookmark2md.getBookmarks()
  })
  $('#refresh').click(checkAuthorized)

  checkAuthorized()
}

$(function () {
  init()
})
