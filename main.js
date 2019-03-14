var jsonData = d3.json('main.json');
var rowConverter = function(data){
  return {
    day: data.day,
    grades: data.grades
  }
}

jsonData.then(function(data){
  initialize(data, 0);
},
function(error){
  console.log(error);
})

var initialize = function(data, day){
  var current_dataset = data[day]; // Day 0's dataset.
  console.log(current_dataset)
  var scr = { // The width and height of the svg
    w: 500,
    h: 500
  }
  var margins = { // The margins for the svg
    left: scr.w * 0.1,
    right: scr.w * 0.1,
    top: scr.h * 0.1,
    bottom: scr.h * 0.1,
  }
  var w = scr.w - margins.left - margins.right; // The width that everything will be drawn in inside of the SVG.
  var h = scr.h - margins.top - margins.bottom; // The height that everything will be drawn in inside of the SVG.
  var svg = d3.select('body')
              .append('svg') // The svg that we created.
              .classed('SVG', true)
              .attr('width', scr.w)
              .attr('height', scr.h);
  var student_plant = svg.append('g')
                         .classed('StudentPlant', true)
   var names = [];

   current_dataset.grades.forEach(function(d){
     names.push(d.name);
   })
   var names_output = [];
   current_dataset.grades.forEach(function(d, i){
     names_output.push((w/current_dataset.grades.length) * (i + 1));
   })
  var students = student_plant.selectAll('g')
                              .data(current_dataset.grades)
                              .enter()
                              .append('g')
                              .classed('student', true)
  var xScale = d3.scaleBand()
                 .domain(d3.range(current_dataset.grades.length))
                 .rangeRound([margins.left, w])
                 .paddingInner(0.05);

  var heightScale = d3.scaleLinear()
                 .domain([0, 100])
                 .range([0, h]);

  var xAxisScale = d3.scaleOrdinal()
                     .domain(names)
                     .range(names_output);
  var yAxisScale = d3.scaleLinear() // The numbers that will show on the axis.
                 .domain([0, 100])
                 .range([h + margins.top, margins.top]);

  var xAxis = d3.axisTop(xAxisScale)
                .ticks(current_dataset.grades.length + 2);

  var yAxis = d3.axisRight(yAxisScale)
                .ticks(5);

  students.append('rect')
          .attr('x', function(d, i){
                return xScale(i);
          })
          .attr('y', function(d){
                return h - heightScale(d.grade) + margins.top;
          })
          .attr('height', function(d){
                return heightScale(d.grade);
          })
          .attr('width', xScale.bandwidth());

  svg.append('g')
     .attr('transform', 'translate(' + -margins.left/2 + ',' + (h + margins.bottom + margins.top - (margins.bottom * 0.01)) + ')')
     .classed('xAxis', true)
     .call(xAxis)

   svg.append('g')
      .attr('transform', 'translate(' + 0 + ',' + (margins.top - margins.bottom) + ')')
      .classed('yAxis', true)
      .call(yAxis)

}
