// script for generating chart1

var totwidth = (window.innerWidth)*0.6,
    totheight = totwidth/1.618 // Golden ratio for visual pleasingness!
    margin = {topbot: (0.05*totheight) , leftright: (0.05*totwidth)},
    width = totwidth - 2*margin.leftright,
    height = totheight - 2*margin.topbot;

        
var svg1 = d3.select("#chart1").append("svg")
            .attr("width", totwidth)
            .attr("height",totheight)
                .append("g")
                .attr("transform", "translate(" + margin.leftright + "," + margin.topbot + ")");

// Set range of x and y (pixels)
var xVal = d3.scaleLinear().range([0,width]);    
var yVal = d3.scaleLinear().range([height,0]);
      
d3.csv("data/chart1.csv",function(data) {
  data.forEach(function(d) {
    // casting numerical values from string to number
    d.TotalDischarges = +d.TotalDischarges;
    d.AverageTotalPayments = +d.AverageTotalPayments;
    d.totalcost = (d.TotalDischarges)*(d.AverageTotalPayments);
  });

  // Set domain of x and y (dollar/discharge values)
  xVal.domain(d3.extent(data, function(d) { return d.AverageTotalPayments;} ));
  yVal.domain(d3.extent(data, function(d) { return d.TotalDischarges;} ));


  // Add a circle for each procedure
  var circle = svg1.selectAll("circle")
                  .data(data);
  
  circle.enter().append("circle")
        .attr("data-procedureID", function(d) { return d.procedureID ;})
        .attr("cx", function(d) { return xVal(d.AverageTotalPayments);})
        .attr("cy", function(d) { return yVal(d.TotalDischarges);})
        .attr("r",  function(d) { return d.totalcost/50000000;})
        .on("mouseover", function(d) {
            showToolTip(d.procedureID);
            })
        .on("mousemove", moveToolTip)
        .on("mouseout", hideToolTip);    
  
   
  // Add the coordinate axes
  // x axis
  svg1.append("g")
    .attr("transform", "translate(0," + height/2 + ")")   
       .call(d3.axisBottom(xVal));
  svg1.append("text")
    .attr("transform", "translate(" + (width - 200) + "," + (height/2 - 10) + ")") 
    .style("text-anchor", "center")
    .text("Average Cost of Procedure ($)");

  // y axis
  svg1.append("g")
    .attr("transform", "translate(" + width/2 + ", 0)")
    .call(d3.axisLeft(yVal));
  svg1.append("text")
    .attr("transform", "translate(" + (10+ width)/2 + ", 0)") 
    .style("text-anchor", "center")
    .text("Number of Procedures");


  //tooltip functions
  function showToolTip(text_to_show) {
    $("#tooltip").show().html(text_to_show);
  }

  function moveToolTip(){
    $("#tooltip").css({ left: d3.event.pageX + 10,
                        top: d3.event.pageY - 50 });
  }

  function hideToolTip(){
    $("#tooltip").hide();
  }

  // jQuery stuff (mouseover tooltip
  $("circle").mouseenter(function(){
    $(this).attr("style", "fill: blue");
  });

  $("circle").mouseleave(function(){
    $(this).attr("style", "fill: red"); 
  });

}); // exit function of d3.csv

