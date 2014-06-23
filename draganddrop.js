'use strict';

var DragAndDrop = angular.module('DragAndDrop', []);

DragAndDrop.value('DragAndDropConfig', {
  template: '<span ng-transclude></span>',
  templateShadow: '<span></span>'
});

DragAndDrop.factory('facDropzone', function(){
  var registredElements = [];

  function set (element) {
    var startY = element[0].offsetTop,
        startX = element[0].offsetLeft,
        endY = startY + element[0].offsetHeight,
        endX = startX + element[0].offsetWidth;

    registredElements.push({
      element: element,
      startY: startY,
      startX: startX,
      endY: endY,
      endX: endX
    });
  }

  function get (){
    return registredElements;
  }

  function filterByXY (x, y) {
    var registredElementsLength = registredElements.length,
        i = 0,
        item;

    for (; i < registredElementsLength; ++i) {
      item = registredElements[i];
      if (( y >= item.startY && y <= item.endY ) && ( x >= item.startX && x <= item.endX )) {
        return item.element;
      }
    }
    return undefined;
  }

  return {
    get: get,
    set: set,
    filterByXY: filterByXY
  };
});

DragAndDrop.directive('ngDraggable', ['$document', 'facDropzone', 'DragAndDropConfig', function($document, facDropzone, DragAndDropConfig) {
  var directive;

  directive = {  
    restrict: 'A',
    replace: true,
    transclude: true,
    require: 'ngModel',
    link: function(scope, element, attr, ngModel) {
      var startX = 0,
          startY = 0,
          x = 0,
          y = 0,
          delayMouseOut, dropZoneActive,
          cloneElement = angular.element(directive.templateShadow);

      element.css({
        position: 'relative'
      });

      function mouseMove (event) {
        var elementY = element[0].offsetTop,
            elementX = element[0].offsetLeft;

        dropZoneActive = facDropzone.filterByXY(elementX, elementY);

        y = event.pageY - startY;
        x = event.pageX - startX;

        element.css({
          top: y + 'px',
          left:  x + 'px'
        });

        if ( dropZoneActive ) {
          dropZoneActive.append(cloneElement);
          cloneElement.css({
            height: element[0].offsetHeight,
            width: element[0].offsetWidth
          });
        }
      }

      function mouseUp (event) {
        y = 0;
        x = 0;

        element.css({
          top: y + 'px',
          left:  x + 'px'
        });

        if ( dropZoneActive ) {
          dropZoneActive.append(element);
          changeModel();
          cloneElement.remove();
        }

        $document.off('mousemove', mouseMove);
        $document.off('mouseup', mouseUp);
      }

      function mouseDown (event) {
        event.preventDefault();

        startX = event.pageX - x;
        startY = event.pageY - y;

        $document.on('mousemove', mouseMove);
        $document.on('mouseup', mouseUp);
      }

      function changeModel () {
        scope[element.parent().attr('ng-model')].push(ngModel.$modelValue[scope.$index]);
        ngModel.$modelValue.splice(scope.$index, 1);
        scope.$apply();
      }

      element.on('mousedown', mouseDown);
    }
  };
  angular.extend(directive, DragAndDropConfig);

  return directive;
}]);

DragAndDrop.directive('ngDropzone', ['$document', 'facDropzone', function($document, facDropzone) {
  return {  
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element) {
        facDropzone.set(element);
      }
  };
}]);