(function () {
  'use strict';

  angular.module('populationioApp')
    .directive('rankGraph', function (ProfileService) {
      return {
        restrict: 'E',
        scope: {
          data: '='
        },
        link: function ($scope, element, attr) {
          var width = 300,
            height = 150;

          var root = d3.select(element[0])
            .append('svg')
            .attr({
              width: width,
              height: height
            })
            .append('g')
            .attr({
              transform: 'translate(' + [ 10, -10 ] + ')'
            });

          $scope.$watch('data', function(data) {
            if (data) {
              _updateGraph(data);
            }
          });

          var _initGraph = function() {
            var frame = root.append('g')
              .attr({
                class: 'frame'
              });

            frame.append('line')
              .attr({
                class: 'coord',
                x1: 0,
                x2: width - 50,
                y1: height,
                y2: height
              });
            frame.append('line')
              .attr({
                class: 'coord',
                x1: 0,
                x2: 0,
                y1: 70,
                y2: height
              });
            frame.append('text')
              .text('People')
              .attr({
                class: 'people',
                transform: function () {
                  return 'translate(' + [ 3, 50 ] + ') rotate(-90)';
                }
              });
            frame.append('text')
              .text('Age')
              .attr({
                class: 'age',
                transform: function () {
                  return 'translate(' + [ width - 10, height + 3 ] + ')';
                }
              });
          };

          var _updateGraph = function(data) {
            var age = ProfileService.getAge();

            var percentPeopleScale = d3.scale.linear()
               .domain([
                0,
                d3.sum(data, function (d) { return d.total; })
              ])
              .range([0,1]);

            var xScale = d3.scale.linear()
              .domain([
                d3.min(data, function (d) { return d.age; }),
                d3.max(data, function (d) { return d.age; })
              ])
              .range([0, width - 90]);

            var yScale = d3.scale.linear()
              .domain([
                0, d3.max(data, function (d) { return d.total; })
              ])
              .range([height, 90]);

            var area = d3.svg.area()
              .x(function (d) { return xScale(d.age); })
              .y0(function () { return height; })
              .y1(function (d) { return yScale(d.total); })
              .interpolate('basis');

            var chart = root.append('g')
              .attr('class', 'chart');

            var graph = chart.append('path')
              .attr({
                d: area(data),
                opacity: 0
              })
              .transition()
              .duration(500)
              .attr({
                opacity: 1
              });

            var bisect = d3.bisector(function(d) { return d.age; }).right;
            var item = data[bisect(data, age)];

            if (item) {
              var pointer = chart.append('g')
                .attr({
                  'class': 'pointer',
                  opacity: 0,
                  transform: function () {
                    return 'translate(' + [
                      xScale(age),
                      height - (height - yScale(item.total))/1.5
                    ] + ')';
                  }
                })

              pointer.transition()
                .duration(500)
                .attr({
                  opacity: 1
                });

              pointer.append('line')
                .attr({
                  x1: 0,
                  y1: 0,
                  x2: width - xScale(age),
                  y2: 0
                });
              pointer.append('circle')
                .attr({
                  r: 3
                });
              pointer.append('text')
                .text(function() {
                  return (Math.round(percentPeopleScale(item.total) * 1000) / 10) + '%';
                })
                .attr({
                  transform: function () {
                    return 'translate(' + [width - xScale(age) - 10, -10] + ')';
                  }
                });
            }
          };

          _initGraph();
        }
      };
    });

}());