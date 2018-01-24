// script for generating chart2

var totwidth = (window.innerWidth)*0.6,
    totheight = totwidth/1.618 // Golden ratio for visual pleasingness!
    margin = {topbot: (0.05*totheight) , leftright: (0.05*totwidth)},
    width = totwidth - 2*margin.leftright,
    height = totheight - 2*margin.topbot;



var alignLeft = function()
{
  d3.selectAll(".barDiv").each(function(d,i)
  {   
      d3.select(this).selectAll(".medicarebar").attr("x", margin.leftright);
      d3.select(this).selectAll(".hospitalbar").attr("x",margin.leftright);
      var w = d3.select(this).selectAll(".hospitalbar").attr("width");
      d3.select(this).selectAll(".patientbar").each( function(d,i)
      {
        var w2 = d3.select(this).attr("width");
        d3.select(this).attr("x", margin.leftright + (w - w2));
      });
  }); // end each() function
} // end alignLeft function


var alignRight = function(d)
{
  d3.selectAll(".barDiv").each(function(d,i)
  {
      var w = d3.select(this).selectAll(".hospitalbar").attr("width");
      d3.select(this).selectAll(".medicarebar").attr("x", margin.leftright + (width - w));
      d3.select(this).selectAll(".hospitalbar").attr("x", margin.leftright +(width - w) );
      var w2 = d3.select(this).selectAll(".patientbar").attr("width");
      d3.select(this).selectAll(".patientbar").attr("x", (margin.leftright + width) - w2);
      
  }); // end each() function
} // end alignRight function

var alignCenter = function(d)
{
  d3.selectAll(".barDiv").each(function(d,i)
  {
      var w = d3.select(this).selectAll(".hospitalbar").attr("width")/2;
      d3.select(this).selectAll(".medicarebar").attr("x", (totwidth/2) - w);
      d3.select(this).selectAll(".hospitalbar").attr("x", (totwidth/2) - w);
      var w2 = d3.select(this).selectAll(".patientbar").attr("width");
      d3.select(this).selectAll(".patientbar").attr("x", ((totwidth/2) + w) - w2);
  
  });
} // end alignCenter function

        
d3.csv("data/chart2.csv",function(data) {
  data.forEach(function(d) {
    // casting numerical values from string to number
    d.TotalDischarges = +d.TotalDischarges;
    d.AverageCoveredCharges = +d.AverageCoveredCharges;
    d.AverageTotalPayments = +d.AverageTotalPayments;
    d.AverageMedicarePayments = +d.AverageMedicarePayments;
    d.AvgPatientPayment = (d.AverageTotalPayments)-(d.AverageMedicarePayments);
  });

  var widthScalingFactor = d3.max(data, function(d) { return d.AverageCoveredCharges;})/width;
  var heightScalingFactor = 7500;

  var xScale = d3.scaleLinear()
      .domain([0,50000])
      .rangeRound([margin.leftright, margin.leftright + (50000/widthScalingFactor)]);

  var yScale = d3.scaleLinear()
      .domain([0,200000])
      .rangeRound([margin.topbot+50, (margin.topbot+50) + (200000/heightScalingFactor)]);

  d3.select("#chart2").append("div").append("p").text("Legend: (a bar of this thickness represents 200,000 procedures)");

  
  var legend = d3.select("#chart2").append("div")
              .append("svg")
                .attr("width", totwidth)
                .attr("height", 200000/heightScalingFactor);
                
      legend.append("rect")
          .attr("class","hospitalbar")
          .attr("x", margin.leftright)
          .attr("width", totwidth)
          .attr("height", 200000/heightScalingFactor);
      legend.append("text")
          .attr("x", totwidth/2)
          .attr("y", margin.topbot*0.505)
          .attr("text-anchor","start")
          .text("Hospital Charges");
          
          
      legend.append("rect")
          .attr("class","medicarebar")
          .attr("x", margin.leftright)
          .attr("y", 200000*0.1/heightScalingFactor)
          .attr("width", totwidth/3)
          .attr("height", 200000*0.8/heightScalingFactor);
      legend.append("text")
          .attr("x", 3*margin.leftright)
          .attr("y", margin.topbot*0.505)
          .attr("text-anchor","middle")
          .text("Medicare Payment");
          
      legend.append("rect")
          .attr("class","patientbar")
          .attr("x", 3*margin.leftright + (totwidth*2/3))
          .attr("y", 200000*0.1/heightScalingFactor)
          .attr("width", totwidth/3)
          .attr("height", 200000*0.8/heightScalingFactor);
      legend.append("text")
          .attr("x", totwidth-margin.leftright/2)
          .attr("y", margin.topbot*0.505)
          .attr("text-anchor","end")
          .text("Cost to Patient");

  
  var axisPart = d3.select("#chart2").append("div")
              .append("svg")
                .attr("width", totwidth)
                .attr("height", 50);
                
       axisPart.append("text")
                .text("Scale: ")
                .attr("x", margin.leftright)
                .attr("y", margin.topbot-30)
                .attr("text-anchor","start");
       axisPart.append("g").attr("transform", "translate(0,"+ margin.topbot +")")
                .call(d3.axisTop(xScale)
                .tickSize(10)
                .tickValues([0,5000,10000,25000,50000])
                .tickFormat(d3.format("$,.2r")));
        
                
  
  var barDiv = d3.select("#chart2").selectAll(".barDiv")
               .data(data)
               .enter()
               .append("div").attr("class", "barDiv")
                
  var addBars =  barDiv.append("svg") 
                 .attr("width", totwidth)
                 .attr("height",function(d) {return d.TotalDischarges/heightScalingFactor ;});
                       
  //add rectangle for hopital charges
  addBars.append("rect")
          .attr("class","hospitalbar")
          .attr("width", function(d) {return d.AverageCoveredCharges/widthScalingFactor;})
          .attr("height", function(d) {return d.TotalDischarges/heightScalingFactor;})
          .on("mouseover", function(d) {
                showToolTip2(d.procedureID);
              })
          .on("mousemove", moveToolTip2)
          .on("mouseout", hideToolTip2);    
    
      

  //add bar for Medicare payment
  addBars.append("rect")
          .attr("class","medicarebar")
          .attr("y", function(d) {return d.TotalDischarges*0.1/heightScalingFactor; })
          .attr("width", function(d) {return d.AverageMedicarePayments/widthScalingFactor; })
          .attr("height", function(d) {return d.TotalDischarges*0.8/heightScalingFactor; });

  //add bar for Patient's portion
  addBars.append("rect")
          .attr("class","patientbar")
          .attr("y", function(d) {return d.TotalDischarges*0.1/heightScalingFactor;})
          .attr("width", function(d) {return d.AvgPatientPayment/widthScalingFactor;})
          .attr("height", function(d) {return d.TotalDischarges*0.8/heightScalingFactor;});

  // add name of treatment
  addBars.append("text")
         .attr("class","procedureCaption")
         .attr("transform","translate(0,5)")
         .attr("y",function(d) {return d.TotalDischarges/(2*heightScalingFactor);});

  alignLeft();

  function showToolTip2(text_to_show) {
    $("#tooltip2").show().html(text_to_show);
  }

  function moveToolTip2(){
    $("#tooltip2").css({ left: d3.event.pageX + 10,
                        top: d3.event.pageY - 50 });
  }

  function hideToolTip2(){
    $("#tooltip2").hide();
  }

  
        
}); //end d3.csv function



// jQuery stuff (buttons & tooltips
  $("#medicareButton").click(function(){
    alignLeft();  });
  
  $("#hospitalButton").click(function(){
    alignCenter();  });

  $("#patientButton").click(function(){
    alignRight();   });
    
