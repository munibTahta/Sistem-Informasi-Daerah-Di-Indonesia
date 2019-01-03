var app = angular.module('searchEngine',[]);
app.controller('searchCtrl', function($scope, $http) {
  //$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
  $scope.documents = [];
  $scope.searchQuery = "";

  $scope.sendQuery = function() {
    $http.post("/query", {query : $scope.searchQuery })
   .then(
       function(response){
         // success callback
         $scope.documents = response.data;
       }, 
       function(response){
         // failure callback
         alert("Error!");
       }
    );
  }
});