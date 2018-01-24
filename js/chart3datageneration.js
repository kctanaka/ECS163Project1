// Code used to produce chart3p.csv (p for processed)

var stateMap = new Map();

d3.csv("data/chart3.csv",function(data) {
  stateMap.set("US", {totDischarges: 0, avgCoveredCharges: 0, avgMedicarePayments: 0, avgPatientPayment: 0});
      
    data.forEach(function(d) {
      // casting numerical values from string to number
      d.TotalDischarges = +d.TotalDischarges;
      d.AverageCoveredCharges = +d.AverageCoveredCharges;
      d.AverageTotalPayments = +d.AverageTotalPayments;
      d.AverageMedicarePayments = +d.AverageMedicarePayments
      d.AvgPatientPayment = (d.AverageTotalPayments)-(d.AverageMedicarePayments);

      // Calculating per-state average values and overall average values.
      var wholeUS = stateMap.get("US");
      wholeUS.totDischarges = wholeUS.totDischarges + d.TotalDischarges;
      wholeUS.avgCoveredCharges = wholeUS.avgCoveredCharges + (d.AverageCoveredCharges*d.TotalDischarges);
      wholeUS.avgMedicarePayments = wholeUS.avgMedicarePayments + (d.AverageMedicarePayments*d.TotalDischarges);
      wholeUS.avgPatientPayment = wholeUS.avgPatientPayment + (d.AvgPatientPayment*d.TotalDischarges);
      stateMap.set("US", wholeUS);       
         
      if (stateMap.has(d.State))
      {
        var stateInfo = stateMap.get(d.State);
        stateInfo.totDischarges = stateInfo.totDischarges + d.TotalDischarges;
        stateInfo.avgCoveredCharges = stateInfo.avgCoveredCharges + (d.AverageCoveredCharges*d.TotalDischarges);
        stateInfo.avgMedicarePayments = stateInfo.avgMedicarePayments + (d.AverageMedicarePayments*d.TotalDischarges);
        stateInfo.avgPatientPayment = stateInfo.avgPatientPayment + (d.AvgPatientPayment*d.TotalDischarges);
        stateMap.set(d.State, stateInfo);       
      }
      else
      {
        var newStateInfo = {
          totDischarges: d.TotalDischarges,
          avgCoveredCharges: d.AverageCoveredCharges*d.TotalDischarges,
          avgMedicarePayments: d.AverageMedicarePayments*d.TotalDischarges,
          avgPatientPayment: d.AvgPatientPayment*d.TotalDischarges
        };
        stateMap.set(d.State,newStateInfo);
      } //end if-else
          
  }); // end for each d in csv



  //calculate Averages and differences and output
var firststring = "state,avgCoveredCharges,avgMedicarePayments,avgPatientPayment,chargeDiff,medDiff,patDiff";

     var addMoreP = d3.select("#csv").append("p")
                  .text(firststring);
  
  stateMap.forEach(function(value,key) {
    value.avgCoveredCharges = value.avgCoveredCharges/value.totDischarges;
    value.avgMedicarePayments = value.avgMedicarePayments/value.totDischarges;
    value.avgPatientPayment = value.avgPatientPayment/value.totDischarges;

    // note: "US" (i.e. whole US average) should be calculated first
    var chargeDiff = value.avgCoveredCharges - stateMap.get("US").avgCoveredCharges,
        medDiff = value.avgMedicarePayments - stateMap.get("US").avgMedicarePayments,
        patDiff = value.avgPatientPayment - stateMap.get("US").avgPatientPayment;

    var n0 = key;
    var n1 = value.avgCoveredCharges.toString();
    var n2 = value.avgMedicarePayments.toString();
    var n3 = value.avgPatientPayment.toString();
    var n4 = chargeDiff.toString();
    var n5 = medDiff.toString();
    var n6 = patDiff.toString();
    var comma = ",";

    var str = n0.concat(comma, n1, comma,n2,comma,n3,comma,n4,comma,n5,comma,n6);
    console.log(str);

     var addMoreP = d3.select("#csv").append("p")
                  .text(str);


  }); // for each element in stateMap



}); // end processing chart3.csv

