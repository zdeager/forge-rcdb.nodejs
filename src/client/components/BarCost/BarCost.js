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

    var margin = {top: 20, right: 120, bottom: 40, left: 60},
      width = parent_width - margin.left - margin.right,
      height = parent_height - margin.top - margin.bottom;

    var d3Container = d3.select(container);

    var svg = d3Container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    /* Data in strings like it would be if imported from a csv */

    var data = [
      { year: "2014", labor: "100",  material: "400", projection: "0" },
      { year: "2015", labor: "200",  material: "200", projection: "0" },
      { year: "2016", labor: "200",  material: "300", projection: "0" },
      { year: "2017", labor: "400",  material: "100", projection: "0" },
      { year: "2018", labor: "600",  material: "400", projection: "0" },
      { year: "2019", labor: "1000", material: "500", projection: "0" },
      { year: "2020", labor: "0",    material: "0",   projection: "1600" },
      { year: "2021", labor: "0",    material: "0",   projection: "1700" },
    ];

    var parse = d3.time.format("%Y").parse;


    // Transpose the data into layers
    var dataset = d3.layout.stack()(["projection", "material", "labor"].map(function(category) {
      return data.map(function(d) {
        return {x: parse(d.year), y: +d[category]};
      });
    }));


    // Set x, y and colors
    var x = d3.scale.ordinal()
      .domain(dataset[0].map(function(d) { return d.x; }))
      .rangeRoundBands([10, width-10], 0.02);

    var y = d3.scale.linear()
      .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
      .range([height, 0]);

    var colors = [ "#4682b4", "#b33040", "#d9d574"];


    // Define and draw axes
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(5)
      .tickSize(-width, 0, 0)
      .tickFormat( function(d) { return d } );

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 3)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Cost (USD)");    

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(d3.time.format("%Y"));

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);


    // Create groups for each series, rects for each segment 
    var groups = svg.selectAll("g.cost")
      .data(dataset)
      .enter().append("g")
      .attr("class", "cost")
      .style("fill", function(d, i) { return colors[i]; });

    var rect = groups.selectAll("rect")
      .data(function(d) { return d; })
      .enter()
      .append("rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y0 + d.y); })
      .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
      .attr("width", x.rangeBand())
      .on("mouseover", function() { tooltip.style("display", null); })
      .on("mouseout", function() { tooltip.style("display", "none"); })
      .on("mousemove", function(d) {
        var xPosition = d3.mouse(this)[0] - 15;
        var yPosition = d3.mouse(this)[1] - 25;
        tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
        tooltip.select("text").text(d.y);
      });


    // Draw legend
    var legend = svg.selectAll(".legend")
      .data(colors)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });
     
    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d, i) {return colors.slice().reverse()[i];});
     
    legend.append("text")
      .attr("x", width + 5)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(function(d, i) { 
        switch (i) {
          case 0: return "Labor";
          case 1: return "Material";
          case 2: return "Projected"
        }
      });


    // Prep the tooltip bits, initial display is hidden
    var tooltip = svg.append("g")
      .attr("class", "tooltip")
      .style("display", "none")
      .style("opacity", 1.0);
        
    tooltip.append("rect")
      .attr("width", 30)
      .attr("height", 20)
      .attr("fill", "white")
      .style("opacity", 0.5);

    tooltip.append("text")
      .attr("x", 15)
      .attr("dy", "1.2em")
      .style("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold");

    
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
