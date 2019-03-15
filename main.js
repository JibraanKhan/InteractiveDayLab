var jsonData = d3.json('main.json');
var rowConverter = function(data) {
    return {
        day: data.day,
        grades: data.grades
    }
}

jsonData.then(function(data) {
        initialize(data, 0);
    },
    function(error) {
        console.log(error);
    })

var initialize = function(data, day) {
    var current_dataset = data[day]; // Day 0's dataset.
    var day = 0;

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
        .attr('height', scr.h)
        .style('float', 'left');
    var color = d3.scaleOrdinal(["#7D6A8A", '#D46E61', '#7B7AF5', '#66B327']);
    var student_plant = svg.append('g')
        .classed('StudentPlant', true)

    var names = [];

    current_dataset.grades.forEach(function(d) {
        names.push(d.name);
    })
    var names_output = [];
    current_dataset.grades.forEach(function(d, i) {
        names_output.push((w / current_dataset.grades.length) * (i + 1));
    })
    var students = student_plant.selectAll('g')
        .data(current_dataset.grades)
        .enter()
        .append('g')
        .classed('student', true)
        .attr('fill', function(d) {
            return color(d.name);
        })
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
    var special_ind = 0;
    var delay = 1000;
// Perhaps the mouse has a .move function that you can use to make the tooltip
// stick next to the mouse at all times?
    students.append('rect')
        .attr('x', function(d, i) {
            return xScale(i);
        })
        .attr('y', function(d) {
            return h - heightScale(d.grade) + margins.top;
        })
        .attr('height', function(d) {
            return heightScale(d.grade);
        })
        .attr('width', xScale.bandwidth())
        .on('mouseover', function(d, i) {
            var rect = d3.select(this);
            var rect_parent = d3.select(this.parentNode);
            var grade = d.grade;
            var tooltip_width = xScale.bandwidth() + 20
            var name = d.name;
            var mouse_pos = d3.mouse(this);
            var m_x = mouse_pos[0];
            var m_y = mouse_pos[1];
            var tooltip_height = heightScale(25)
            rect.attr('height', heightScale(grade + 1))
                .attr('y', h - rect.attr('height') + margins.top)

            var starting_y;

            if ((Math.abs(m_y - scr.h)) < (m_y)) {
                starting_y = scr.h + tooltip_height;
            } else {
                starting_y = -tooltip_height;
            }
            this.parentNode.parentNode.appendChild(this.parentNode)
            // this.parentNode.appendChild(this);
            var tooltip = rect_parent.append('g')
                .classed('tooltip', true)
            var base_tip = tooltip.append('rect')
                .attr('x', m_x) // rect.attr('x') - tooltip_width/2
                .attr('y', starting_y)
                .attr('width', tooltip_width)
                .attr('height', tooltip_height)
                .attr('fill', '#c17b30')
                .style('pointer-events', 'none')
                .classed('Tooltip', true)
                .attr('opacity', 0)
                .style('z-index', 10);

            var texts = ['Student: ' + name,
                'Grade: ' + grade
            ]
            var txt_tip = tooltip.selectAll('text')
                .data(texts)
                .enter()
                .append('text')
                .attr('x', m_x) //rect.attr('x') - tooltip_width/2
                .attr('stroke', 'black')
                .attr('y', starting_y) // m_y + (tooltip_height)/2
                .text(function(d) {
                    return d;
                })
                .style('pointer-events', 'none')
                .attr('opacity', 0)
                .classed('Info', true)
            base_tip.transition()
                .attr('y', Math.min(m_y, h - (tooltip_height / 2)))
                .attr('opacity', 1);

            txt_tip.transition()
                .attr('y', function(d, i) {
                    return Math.min((m_y + (tooltip_height) / texts.length * (i + 0.5)), (h - (tooltip_height / 2) + (tooltip_height) / texts.length * (i + 0.5)));
                })
                .attr('opacity', 1)

        })
        .on('mouseout', function(d, i) {
            var rect = d3.select(this);
            var rect_parent = d3.select(this.parentNode);
            var tooltip = rect_parent.selectAll('g');
            var mouse_pos = d3.mouse(this);
            var m_x = mouse_pos[0];
            var m_y = mouse_pos[1];

            rect.attr('height', heightScale(d.grade - 1))
                .attr('y', h - rect.attr('height') + margins.top)

            var ending_y;
            var base = tooltip.select('.Tooltip')
            var texts = tooltip.selectAll('.Info');
            var tooltip_height = heightScale(25)
            var tooltip_width = xScale.bandwidth() + 20

            if ((Math.abs(m_y - scr.h)) < (m_y)) {
                ending_y = scr.h + tooltip_height;
            } else {
                ending_y = -tooltip_height;
            }

            console.log("Got through")
            base.transition()
                .attr('y', ending_y)
                .attr('opacity', 0)
                .on('end', function() {
                    tooltip.remove();
                });

            texts.transition()
                .attr('y', ending_y)
                .attr('opacity', 0)
        })


    svg.append('g')
        .attr('transform', 'translate(' + -margins.left / 2 + ',' + (h + margins.bottom + margins.top - (margins.bottom * 0.01)) + ')')
        .classed('xAxis', true)
        .call(xAxis)

    svg.append('g')
        .attr('transform', 'translate(' + 0 + ',' + (margins.top - margins.bottom) + ')')
        .classed('yAxis', true)
        .call(yAxis)

    // Create Buttons
    var img_data = ['images/UpArrow.png', 'images/DownArrow.png'];
    var button_svg_dims = {
        width: 200,
        height: scr.h
    }
    var buttons_svg = d3.select('body').append('svg')
        .attr('width', button_svg_dims.width)
        .attr('height', button_svg_dims.height)
        .classed('ButtonHolder', true);
    var buttons = buttons_svg.selectAll('image')
        .data(img_data)
        .enter()
        .append('image')
        .attr('xlink:href', function(d) {
            return d;
        })
        .attr('class', function(d, i) {
            return 'button' + i;
        }, true)
        .attr('width', '100%')
        .attr('height', '50%')
        .attr('y', function(d, i) {
            return i * (button_svg_dims.height / 3);
        })
        .on('click', function() {
            if (this.getAttribute('class') == 'button0') {
                if (day < data.length - 1) {
                    day++;
                    centralText = update(data[day], students, heightScale, h, margins, buttons, centralText, day, buttons_svg, button_svg_dims, 'up');
                }
            } else {
                if (day > 1) {
                    day--;
                    centralText = update(data[day], students, heightScale, h, margins, buttons, centralText, day, buttons_svg, button_svg_dims, 'down');
                }
            }
        })

    var centralText = buttons_svg.append('text')
        .attr('y', button_svg_dims.height * 0.45)
        .text('Day: ' + day)
        .attr('x', button_svg_dims.width * 0.25)
        .attr('stroke', 'lightblue')
        .attr('font-size', 40)

}

// dda032
// atom://teletype/portal/024e2617-8494-4970-bd4a-765e95800c70
// 485c6f
//
// rgb(189, 63, 34)
// position:absolute;
// left: 40%;
// top: 27%;
var update = function(data, students, heightScale, h, margins, buttons, label, day, label_parent, svg_dims, dir) {
    students.data(data.grades).enter();
    students.select('rect')
        .transition()
        .attr('height', function(d) {
            return heightScale(d.grade);
        })
        .attr('y', function(d) {
            return h - heightScale(d.grade) + margins.top;
        })


    var starting_y;

    if (dir == 'up') {
        label.transition()
            .duration(1000)
            .attr('y', 0)
            .attr('opacity', 0)
            .on('end', function(d, i) {
                d3.select(this).remove();
            })
        starting_y = svg_dims.height * 2;
    } else {
        label.transition()
            .duration(1000)
            .attr('y', svg_dims.height)
            .attr('opacity', 0)
            .on('end', function(d, i) {
                d3.select(this).remove();
            })
        starting_y = -30;
    }


    var new_label = label_parent.append('text')
        .attr('y', starting_y)
        .text('Day: ' + day)
        .attr('x', svg_dims.width * 0.25)
        .attr('stroke', 'lightblue')
        .attr('font-size', 40)

    new_label.transition()
        .duration(1000)
        .attr('y', svg_dims.height * 0.45)
        .attr('opacity', 1)



    return new_label;
}
