/**
 * Created by OXOYO on 2018/8/3.
 */

var Bookmark2Github = new OAuth2('github', {
  client_id: '004b7c9e59a81dfae785',
  client_secret: 'afc402eef1fb5a2788dffee8477d0964511a524b',
  api_scope: 'user:repo'
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
  console.log('checkAuthorized');
  console.log('provider.hasAccessToken()', Bookmark2Github, Bookmark2Github.hasAccessToken())
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
  let url = `https://api.github.com/user?access_token=${ Bookmark2Github.access_token }`
  $.get(url, function(res) {
    Bookmark2Github.userInfo = res
    console.log('userInfo', res)
    $('#user-avatar').attr('src', res.avatar_url)
    $('#user-name').html(res.login)
    $('#user-name').attr('href', res.html_url)
    getUserRepos(res)
  })
}

function getUserRepos (userInfo, page = 1) {
  let url = `${ userInfo.repos_url }?access_token=${ Bookmark2Github.access_token }&per_page=100&page=${ page }`
  $.get(url, function(res) {
    Bookmark2Github.userRepos = res
    console.log('userRepos', res)
    let repoList = []
    res.map(item => {
      repoList.push(`<option value="${ item.name }">${ item.name }</option>`)
    })
    $('#repo-list').html(repoList.join(''))
  })
}

function putContent () {
  let owner = Bookmark2Github.userInfo.login
  let repo = $('#repo-list option:selected').val()
  // let path = new Date().getTime() + '.txt'
  let path = '001.txt'
  let url = `https://api.github.com/repos/${ owner }/${ repo }/contents/${ path }?access_token=${ Bookmark2Github.access_token }`
  $.ajax({
    type: 'PUT',
    url: url,
    contentType: 'application/json',
    data: {
      message: 'my commit message',
      committer: {
        name: owner,
        email: Bookmark2Github.userInfo.email
      },
      branch: 'master',
      content: 'name=John&location=Boston',
      sha: "17d0ae0c9fd81f33d254538480a44c5042094fed"
    },
    success: function(msg){
      alert( "Data Saved: " + msg )
    }
  })
}

$(function () {
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
    putContent()
  })
  checkAuthorized()
})
