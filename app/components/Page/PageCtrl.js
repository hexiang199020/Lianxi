export default class PageCtrl {
  constructor(PageService, $state, $scope, $ionicHistory, $location, $stateParams, $timeout) {
    'ngInject';

    var vm = this;
    vm.user = {
      username: '13145961201',
      password: 'ifast123'
    };

    vm.login = login;
    vm.passwordRecovery = passwordRecovery;
    vm.register = register;
    vm.redirectUrl = $stateParams.redirectUrl;

    vm.changedAccount = changedAccount;
    vm.showRegisterButton = window.cordova;

    let usernames = ['13145961201', '18611122312', '18503089025'];
    let selectedUsernameIndex = 0;

    function changedAccount(){
      selectedUsernameIndex++;
      vm.user.username = usernames[selectedUsernameIndex % usernames.length];
    }

    function register(){
      QrCodeService.scan('InvestorRegister');
    }

    vm.data = PageService.data;

    function setLoading(loading){
      vm.loading = loading;
    }

    function login(user){
      setLoading(true);
      document.activeElement.blur();
      PageService.login(user)
        .then(loginSuccess)
        .catch(loginFail)
        .finally(function(){setLoading(false);});
    }

    function loginSuccess(data){
      StateService.handleLoginRedirect(vm.redirectUrl);
    }

    function loginFail(error){
      console.error(error);
      switch (error) {
        case LoginStatus.UNAUTHORISED:
          Utils.showTranslateValue('errorAccountNumberPassword');
          break;
        case LoginStatus.ACCOUNT_NOT_SELECTED:
          StateService.go('SelectAccount', {redirectUrl: vm.redirectUrl});
          break;
        default:
      }
    }

    function passwordRecovery(){
      StateService.go('passwordRecovery');
    }
  }
}
