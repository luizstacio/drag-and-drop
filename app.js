'use strict';

DragAndDrop.value('DragAndDropConfig', {
  template: '<a ng-transclude href="#" class="item"></a>',
  //templateUrl: 'item.html',
  templateShadow: '<span></span>'
});
var App = angular.module('App', ['DragAndDrop']);