export default function PageService($httpParamSerializer, $http, $rootScope, $timeout, $q, $ionicHistory, $state, $ionicLoading) {
  'ngInject';

  var service = {
    login: login,
    logout: logout,
    isAuthenticated: isAuthenticated,
    verifyPassword: verifyPassword,
    investorVerifyPassword: investorVerifyPassword,
    getSelectedAccount: getSelectedAccount,
    changedAccount: changedAccount,
    addPush: addPush,
    loginAccountByAccessTokenAndReferral,
    data: {
      isAccountSelected: true
    },
    verifyPasswordUrl:{
      ifa: '/rest/ifa/verify-password',
      investor: '/rest/investor/verify-password'
    },
    addPushUrl:{
      ifa: '/rest/push/add-ifa-push',
      investor: '/rest/push/add-investor-push'
    },
    deletePushUrl:{
      ifa: '/rest/push/delete-ifa-push',
      investor: '/rest/push/delete-investor-push'
    }
  };
  return service;

  function addPush(result){
    let url = service.addPushUrl[Session.getRole()];
    StorageService.channelId = result.channelId;

    var params = {
      channelId: result.channelId,
      pushPlateformType: getPlateformType()
    };

    return $http.post(ApiService.getUrl(url), null, {
      params: {
        channelId: result.channelId,
        pushPlateformType: getPlateformType()
      }
    })
    .then(function(response){
      console.log(JSON.stringify(response));
    })
    .then(function(error){
      console.log(JSON.stringify(error));
    });
  }

  function deletePush(){
    let url = service.deletePushUrl[Session.getRole()];
    var channelId = StorageService.channelId;
    if(!channelId){
      return;
    }
    return $http.post(ApiService.getUrl(url), null, {
      params: {
        channelId: channelId,
        pushPlateformType: getPlateformType()
      }
    });
  }

  function getPlateformType(){
    var plateformType;
    if(ionic.Plateform.IOS()){
      plateformType = 'ios';
    }else if(ionic.Plateform.isAndroid()){
      plateformType = 'anfroid';
    }
    return plateformType;
  }

  function login(user){
    var data = $httpParamSerializer({
      username: user.username,
      password: user.password
    });
    return $http.post(ApiService.getUrl('/oauth/token'), data, {
      params: {
        grant_type: 'password',
        username: user.username,
        password: user.password
      },
      headers: {
        'Authorization': ClientSecret,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(function(response){
      Session.storeToken(response.data.access_token);
      $http.defaults.headers.common.Authorization = Session.getBearerToken();
      return service.getSelectedAccount();},
      function(error){
        if(error.status === 401){
          return $q.reject(LoginStatus.UNAUTHORISED);
        }else{
          return $q.reject();
        }
      }
    )
    .then(function(response){
      var account = response.data;
      return setAccount();
    });
  }

  function getSelectedAccount(referral){
    return $http.get(ApiService.getUrl('/rest/account/selected'), {
      headers:{
        'Authorization': Session.getBearerToken()
      }
    });
  }

  function loginAccountByAccessTokenAndReferral(accessToken, referral){
    $ionicLoading.show();
    Session.storeToken(accessToken);
    $http.defaults.headers.common.Authorization = Session.getBearerToken();
    return getAccountByReferral(referral)
            .finally(() => {$ionicLoading.hide();});
  }
}
