/////////////////////////////////////////////////////////
// BarCost
// by zde, Aug 2019
//
/////////////////////////////////////////////////////////
import React from 'react'
import './BarCost.scss'
import * as d3 from "d3";

class BarCost extends React.Component {

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

    this.draw(this.props.data)
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

    this.draw(this.props.data)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  draw (dbData) {

    console.log("drawing", dbData);

    const container = this.container

    var parent_width = $(container).parent().width();

    var parent_height = $(container).parent().height();

    var margin = {top: 20, right: 20, bottom: 30, left: 60},
      width = parent_width - margin.left - margin.right,
      height = parent_height - margin.top - margin.bottom;

    var d3Container = d3.select(container);

    // set the ranges
    var x = d3.scaleBand()
              .range([0, width])
              .paddingInner(0.1);
    var y = d3.scaleLinear()
              .range([height, 0]);
              
    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3Container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

    // get the data
    var data = [
      {"year": "2013", "cost": 4000},
      {"year": "2014", "cost": 250},
      {"year": "2015", "cost": 750},
      {"year": "2016", "cost": 750},
      {"year": "2017", "cost": 1000},
      {"year": "2018", "cost": 1500}
    ]


    // format the data
    data.forEach(function(d) {
      d.cost = +d.cost;
    });

    // Scale the range of the data in the domains
    x.domain(data.map(function(d) { return d.year; }));
    y.domain([0, d3.max(data, function(d) { return d.cost; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.year); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.cost); })
        .attr("height", function(d) { return height - y(d.cost); });

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Cost (USD)");   

    
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <div className="barcost" ref={ (div) => {
          this.container = div
        }}
      />
    )
  }
}

export default BarCost
