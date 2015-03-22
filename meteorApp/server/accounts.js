Accounts.onCreateUser(function(options, user) {
  options.profile.actions = 0;
  if (user.services.github && options.profile)
  {
    var result = Meteor.http.get('https://api.github.com/user', 
    {   headers: {"User-Agent": "filmgrid.io"},
        params: { access_token: user.services.github.accessToken }
    });

    if (result.error) throw result.error;

    options.profile.picture = result.data.avatar_url;
    user.profile = options.profile;
  }
  else if (user.services.facebook && options.profile)
  {
    options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=large";
    user.profile = options.profile;
  }
  else if (user.services.twitter && options.profile)
  {
    options.profile.picture = user.services.twitter.profile_image_url.replace("_normal","_bigger" );
    user.profile = options.profile;
  }
  return user;
});
