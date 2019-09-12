/////////////////////////////////////////////////////////
// MultiLine
// by zde, May 2019
//
/////////////////////////////////////////////////////////
import React from 'react'
import './MultiLine.scss'
import d3 from 'd3'

class MultiLine extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    this.draw(this.props.data, this.props.baseline, this.props.label)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  shouldComponentUpdate (nextProps) {

    if (nextProps.dataGuid !== this.props.dataGuid) {

      return true
    }

    return false
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidUpdate () {

    $(this.container).empty()

    this.draw(this.props.data, this.props.baseline, this.props.label)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  draw (dbData, baseline, label) {

    if (!baseline)
      return;

    var baselineVal = +baseline[0].properties[0].displayValue;
    var max_error = 0.02;


    var nodata = [{'date': '00', 'value': '1.69154527478'}, {'date': '01', 'value': '1.67848177301'}, {'date': '02', 'value': '1.68832613284'}, {'date': '03', 'value': '1.6653073922'}, {'date': '04', 'value': '1.69634457284'}, {'date': '05', 'value': '1.66469892089'}, {'date': '06', 'value': '1.68396528406'}, {'date': '07', 'value': '1.6832938553'}, {'date': '08', 'value': '1.69528504917'}, {'date': '09', 'value': '1.66583458976'}, {'date': '10', 'value': '1.68939008022'}, {'date': '11', 'value': '1.67731772578'}, {'date': '12', 'value': '1.684441512'}, {'date': '13', 'value': '1.68348119859'}, {'date': '14', 'value': '1.66415407073'}, {'date': '15', 'value': '1.65963579806'}, {'date': '16', 'value': '1.68038943837'}, {'date': '17', 'value': '1.68749086198'}, {'date': '18', 'value': '1.67860755893'}, {'date': '19', 'value': '1.69021896589'}, {'date': '20', 'value': '1.67340046376'}, {'date': '21', 'value': '1.68158700692'}, {'date': '22', 'value': '1.67511647824'}, {'date': '23', 'value': '1.66297975233'}]

    dbData = nodata.map(data => {
      const r = (Math.random()-0.5)*2;
      const error = max_error*r*baselineVal;
      const value = baselineVal+error;
      return {
        "date": data.date,
        "value": value
      }
    })

    console.log(dbData);

    

    console.log("drawing", dbData, baseline);

    const container = this.container

    var parent_width = $(container).parent().width();

    var parent_height = $(container).parent().height();

    var margin = {
        top: 15,
        right: 80,
        bottom: 60,
        left: 80
      },
      width = parent_width - margin.left - margin.right,
      height = parent_height - margin.top - margin.bottom;

    var parseDate = d3.time.format("%H").parse;

    var x = d3.time.scale()
      .range([0, width]);

    var y = d3.scale.linear()
      .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      //.ticks(5)
      .tickSize(6, 0)
      .tickFormat(d3.time.format("%H:%M"));

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) {
        return x(d.date);
      })
      .y(function(d) {
        return y(d.value);
      });

    var d3Container = d3.select(container);

    var svg = d3Container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    ////////////////
    ////////////////
    ////////////////

    color.domain(["Sensor", "Baseline"]);

    if (dbData) {
      var sensorDataArr = dbData.map( data => {
          return {
            date: parseDate(data.date),
            value: +data.value
          }
        }
      )
    } else {
      sensorDataArr = null
    }
    

    var baselineDataArr = nodata.map( data => {
        return {
          date: parseDate(data.date),
          value: +baseline[0].properties[0].displayValue
        }
      }
    )

    if (sensorDataArr) {
      var sources = [
        {
          "name": "Sensor",
          "values": sensorDataArr
        },
        {
          "name": "Baseline",
          "values": baselineDataArr
        }
      ]
    } else {
      var sources = [
        {
          "name": "Baseline",
          "values": baselineDataArr
        }
      ]
    }

    console.log(sources);

    x.domain(d3.extent(baselineDataArr, function(d) {
      return d.date;
    }));

    y.domain([
      d3.min(sources, function(c) {
        return d3.min(c.values, function(v) {
          return v.value;
        });
      }),
      d3.max(sources, function(c) {
        return d3.max(c.values, function(v) {
          return v.value;
        });
      })
    ]);

    y.domain([
      baselineVal - (max_error*2.5*baselineVal), 
      baselineVal + (max_error*2.5*baselineVal)
    ]);

    var legend = svg.selectAll('g')
      .data(sources)
      .enter()
      .append('g')
      .attr('class', 'legend');

    legend.append('rect')
      .attr('x', width - 20)
      .attr('y', function(d, i) {
        return i * 20;
      })
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', function(d) {
        return color(d.name);
      });

    legend.append('text')
      .attr('x', width - 8)
      .attr('y', function(d, i) {
        return (i * 20) + 9;
      })
      .text(function(d) {
        return d.name;
      });

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-60)");

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(label);

    var source = svg.selectAll(".source")
      .data(sources)
      .enter().append("g")
      .attr("class", "source");

    source.append("path")
      .attr("class", "line")
      .attr("d", function(d) {
        return line(d.values);
      })
      .style("stroke", function(d) {
        return color(d.name);
      });

    source.append("text")
      .datum(function(d) {
        return {
          name: d.name,
          value: d.values[d.values.length - 1]
        };
      })
      .attr("transform", function(d) {
        return "translate(" + x(d.value.date) + "," + y(d.value.value) + ")";
      })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) {
        return d.name;
      });

    //////////////////
    //////////////////
    //////////////////
    var mouseG = svg.append("g")
      .attr("class", "mouse-over-effects");

    mouseG.append("path") // this is the black vertical line to follow mouse
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");
      
    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(sources)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
      .attr("r", 7)
      .style("stroke", function(d) {
        return color(d.name);
      })
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text")
      .attr("transform", "translate(10,3)");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', width) // can't catch mouse events on a g element
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function() { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
      })
      .on('mouseover', function() { // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function() { // mouse moving over canvas
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + height;
            d += " " + mouse[0] + "," + 0;
            return d;
          });

        d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {
            //console.log(width/mouse[0])
            var xDate = x.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d.date; }).right;
            var idx = bisect(d.values, xDate);
            
            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;

            var pos = null;
            while (true){
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }
            
            d3.select(this).select('text')
              .text(y.invert(pos.y).toFixed(3));
              
            return "translate(" + mouse[0] + "," + pos.y +")";
          });
      });
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <div className="multiline" ref={ (div) => {
          this.container = div
        }}
      />
    )
  }
}

export default MultiLine