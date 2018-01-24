// script for generating chart3


var totwidth = (window.innerWidth)*0.6,
    totheight = totwidth/1.618 // Golden ratio for visual pleasingness!
    margin = {topbot: (0.1*totheight) , leftright: (0.05*totwidth)};



var stateMap = d3.map();
var colorDomainMap = d3.map();
var dollarScaleMap = d3.map();
d3.csv("data/chart3p.csv",function(data) {
  data.forEach(function(d) {
    // casting numerical values from string to number
    d.avgCoveredCharges = +d.avgCoveredCharges;
    d.avgMedicarePayments = +d.avgMedicarePayments;
    d.avgPatientPayment = +d.avgPatientPayment;
    d.chargeDiff = +d.chargeDiff;
    d.medDiff = +d.medDiff;
    d.patDiff = +d.patDiff;    

    var stateInfo = {
      avgCoveredCharges: d.avgCoveredCharges,
      avgMedicarePayments: d.avgMedicarePayments,
      avgPatientPayment: d.avgPatientPayment,
      chargeDiff: d.chargeDiff,
      medDiff: d.medDiff,
      patDiff: d.patDiff,    
    };
  stateMap.set(d.state, stateInfo);
  });
 
  
  var domainArray = [];
  domainArray = d3.extent(data, function(d){ return d.chargeDiff;});
  domainArray.push(0);
  domainArray.sort(function(a, b){return a - b});
  colorDomainMap.set("charge", domainArray);

  domainArray = d3.extent(data, function(d){ return d.medDiff;});
  domainArray.push(0);
  domainArray.sort(function(a, b){return a - b});
  colorDomainMap.set("med", domainArray);

  domainArray = d3.extent(data, function(d){ return d.patDiff;});
  domainArray.push(0);
  domainArray.sort(function(a, b){return a - b});
  colorDomainMap.set("pat", domainArray);

  var scaleArray = [];
  scaleArray = d3.extent(data, function(d){ return d.avgCoveredCharges;});
  scaleArray.push(stateMap.get("US").avgCoveredCharges);
  scaleArray.sort(function(a, b){return a - b});
  dollarScaleMap.set("charge", scaleArray);

  scaleArray = d3.extent(data, function(d){ return d.avgMedicarePayments;});
  scaleArray.push(stateMap.get("US").avgMedicarePayments);
  scaleArray.sort(function(a, b){return a - b});
  dollarScaleMap.set("med", scaleArray);

  scaleArray = d3.extent(data, function(d){ return d.avgPatientPayment;});
  scaleArray.push(stateMap.get("US").avgPatientPayment);
  scaleArray.sort(function(a, b){return a - b});
  dollarScaleMap.set("pat", scaleArray);
  
  
}); // end processing chart3.csv


// process state-abbreviation to state code conversion table
var stateCodes = d3.map();
d3.csv("data/StateToCode.csv",function(data) {
    data.forEach(function(d) {
      // casting numerical values from string to number
      d.StateNum = +d.StateNum;
      stateCodes.set(d.StateNum,d.Abbreviation);
    }); //end function
}); // end processing StateToCode.csv



var makeMap = function(comparisonType)
{
  
  var svg3 = d3.select("#chart3").append("svg")
                 .attr("width", totwidth)
                 .attr("height",totheight)
                 
  var projection = d3.geoAlbersUsa()
                    .scale(totwidth*1.25)
                    .translate([totwidth / 2, totheight / 2]);

  var path = d3.geoPath().projection(projection);
     
  d3.json("data/gz_2010_us_040_00_5m.json", function(usGeo) {
    
    color = d3.scaleLinear()
            .domain(colorDomainMap.get(comparisonType))
            .range(["blue", "white", "red"]);
            
    var xPos = d3.scaleLinear()
      .domain(colorDomainMap.get(comparisonType))
      .rangeRound([0.65*width, 0.8*width, 0.95*width]);
    var xVal = d3.scaleLinear()
      .domain(dollarScaleMap.get(comparisonType))
      .rangeRound([0.65*width, 0.8*width, 0.95*width]);
    
    var g = svg3.append("g")
      .attr("class", "key")
      .attr("transform", "translate(0,40)");

    var keyRange = [];
    var domainSpan = xPos.domain()[2] - xPos.domain()[0];
  
    for (i = 0; i <= 20; i++) {
      keyRange.push(xPos.domain()[0] + (i*0.05*domainSpan));
    }

    var description = new String();
    if (comparisonType == "charge") { description = "Average Hospital Charge"; }
    if (comparisonType == "med") { description = "Average Medicare Payment"; }
    if (comparisonType == "pat") { description = "Average Cost To Patient"; }
  
    g.selectAll("rect")
    .data(keyRange)
    .enter().append("rect")
      .attr("height", 8)
      .attr("x", function(d) { return xPos(d) - 5; })
      .attr("width", function(d) { return (xPos(d + 0.05*domainSpan) - xPos(d));})
      .attr("fill", function(d) { return color(d); });
    g.append("text")
      .attr("class", "caption")
      .attr("x", xPos.range()[0])
      .attr("y", -6)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text(description);
    g.append("text")
      .attr("x", xPos.range()[1])
      .attr("y", 40)
      .attr("fill", "#000")
      .attr("text-anchor", "middle")
      .attr("font-size","x-small")
      .text("National Average");

    g.append("g").attr("transform", "translate(0,8)")
      .call(d3.axisBottom(xVal)
      .tickSize(11)
      .tickValues(dollarScaleMap.get(comparisonType))
      .tickFormat(d3.format("$,.2r"))

    ); // end of call to axisBottom

  if (comparisonType == "charge") {
    svg3.selectAll("path")
      .data(usGeo.features)
      .enter().append("g")
      .attr("class","state")
      .append("path")
      .attr("d", path)
      .attr("fill", function(d){
          var stateCode = stateCodes.get(+d.properties.STATE);
          var val = stateMap.get(stateCode);
          return color(val.chargeDiff)})
;

  } //svg construction for charge comparison

  if (comparisonType == "med") {
    svg3.selectAll("path")
      .data(usGeo.features)
      .enter().append("g")
      .attr("class","state")
      .append("path")
      .attr("d", path)
      .attr("fill", function(d){
          var stateCode = stateCodes.get(+d.properties.STATE);
          var val = stateMap.get(stateCode);
          return color(val.medDiff)})
      .attr("data-value", function(d){
          var stateCode = stateCodes.get(+d.properties.STATE);
          var val = stateMap.get(stateCode);
          return val.avgMedicarePayments});  
  } //svg construction for medicare payments comparison

  if (comparisonType == "pat") {
    svg3.selectAll("path")
      .data(usGeo.features)
      .enter().append("g")
      .attr("class","state")
      .append("path")
      .attr("d", path)
      .attr("fill", function(d){
          var stateCode = stateCodes.get(+d.properties.STATE);
          var val = stateMap.get(stateCode);
          return color(val.patDiff)})
      .attr("data-value", function(d){
          var stateCode = stateCodes.get(+d.properties.STATE);
          var val = stateMap.get(stateCode);
          return val.avgPatientPayment});  
      ;  
        
  } //svg construction for comparisons of cost to patient
  
 }); //d3 json function
 
}; //makeMap function

makeMap("charge");

var unmakeMap = function() {
  d3.select("#chart3").selectAll("svg")
    .remove();
} //unmakeMap function

// jQuery stuff (buttons
  $("#chargeButton").click(function(){
    unmakeMap();
    makeMap("charge");
  });
  
  $("#medButton").click(function(){
    unmakeMap();
    makeMap("med");
  });

  $("#patButton").click(function(){
    unmakeMap();
    makeMap("pat");
  });

  


