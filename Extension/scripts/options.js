/**
 * Created by OXOYO on 2018/8/3.
 */

var Bookmark2Github = new OAuth2('github', {
  client_id: '004b7c9e59a81dfae785',
  client_secret: 'afc402eef1fb5a2788dffee8477d0964511a524b',
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
  } else {
    $('#options').removeClass('authorized')
  }
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

  checkAuthorized()
})
