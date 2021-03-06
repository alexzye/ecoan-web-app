var numSlices = 0;
function init_code_hierarchy_plot(element_id,data,count_function,color_function,title_function,legend_function)
{
    var plot = document.getElementById(element_id);

    while (plot.hasChildNodes())
    {
        plot.removeChild(plot.firstChild);
    }

    var width = plot.offsetWidth;
    var height = width;
    var x_margin = 0;
    var y_margin = 0;
    
    var max_depth=3;
    
    var data_slices = [];
    var max_level = 2;

    var svg = d3.select("#"+element_id).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("id", "slices")
        .attr("transform", "translate(" + width / 2 + "," + height * .52 + ")");
          
    function process_data(level,start_deg,stop_deg)
    {
        //var name = bigDataSet.EngName;
        var total = count_function(prodTotal);
        var children = bigDataSet;
        var current_deg = start_deg;
        if (level > max_level)
        {
            return;
        }
        if (start_deg == stop_deg)
        {
            return;
        }
        data_slices.push([start_deg,stop_deg, product[0].ProdEngName , level,prodTotal[0].sumpiececost]);
        var child_start_deg = current_deg;
        var child_stop_deg = current_deg;
        var inc_deg = 0;
        level+=1;
        for (var key in bigDataSet)
        {
            child = bigDataSet[key];

            inc_deg = (stop_deg-start_deg)/prodTotal[0].sumpiececost*(child.PieceCost-0.01);
            child_start_deg = current_deg;
            current_deg+=inc_deg;
            child_stop_deg = current_deg;
            var span_deg = child_stop_deg-child_start_deg;
            data_slices.push([child_start_deg,child_stop_deg,child.EngName, level,child.PieceCost]);
        }
        if(smallDataSet.length > 0) {
            var size = 0;
            for(var item in smallDataSet) {
                size+=smallDataSet[item].PieceCost;
            }
            inc_deg = (stop_deg-start_deg)/prodTotal[0].sumpiececost*size;
            child_start_deg = current_deg;
            var small_start_deg = child_start_deg;
            current_deg+=inc_deg;            child_stop_deg = stop_deg;
            var span_deg = child_stop_deg-child_start_deg;
            
                data_slices.push([child_start_deg,child_stop_deg, "Small Data", level,size]);
                level += 1;
                current_deg = small_start_deg;
                for(var item in smallDataSet) {
                    child = smallDataSet[item];

                    inc_deg = span_deg*child.PieceCost;
                    child_start_deg = current_deg;
                    current_deg+=inc_deg;
                    child_stop_deg = current_deg;
                    data_slices.push([child_start_deg,child_stop_deg,child.EngName, level,child.PieceCost]);
                }
            

        }

    }
    
    process_data(0,0,360./180.0*Math.PI);

    var ref = data_slices[0];
    var next_ref = ref;
    var last_refs = [];

    var thickness = width/2.0/(max_level+2)*1.1;
        
    var arc = d3.arc()
    .startAngle(function(d) { if(d[3]==0){return d[0];}return d[0]+0.01; })
    .endAngle(function(d) { if(d[3]==0){return d[1];}return d[1]-0.01; })
    .innerRadius(function(d) { return 1.1*d[3]*thickness; })
    .outerRadius(function(d) { return (1.1*d[3]+1)*thickness; });    

    var slices = svg.selectAll(".form")
        .data(function(d) { return data_slices; })
        .enter()
        .append("g")
        slices.append("path")
        .attr("d", arc)
        .attr("id",function(d,i){return element_id+i;})
        .style("fill", function(d) { return color_function(d);})
        .attr("class","form");
    slices.on("click",animate);

    if (title_function != undefined)
    {
        slices.append("svg:title")
              .text(title_function);        
    }
    if (legend_function != undefined)
    {
        slices.on("mouseover",update_legend)
              .on("mouseout",remove_legend);
        var legend = d3.select("#"+element_id+"_legend")
            
        function update_legend(d)
        {
            legend.html(legend_function(d));
            legend.transition().duration(200).style("opacity","1");
        }
        
        function remove_legend(d)
        {
            legend.transition().duration(1000).style("opacity","0");
        }
    }
    function get_start_angle(d,ref)
    {
        if (ref)
        {
            var ref_span = ref[1]-ref[0];
            return (d[0]-ref[0])/ref_span*Math.PI*2.0
        }
        else
        {
            return d[0];
        }
    }
    
    function get_stop_angle(d,ref)
    {
        if (ref)
        {
            var ref_span = ref[1]-ref[0];
            return (d[1]-ref[0])/ref_span*Math.PI*2.0
        }
        else
        {
            return d[0];
        }
    }
    
    function get_level(d,ref)
    {
        if (ref)
        {
            return d[3]-ref[3];
        }
        else
        {
            return d[3];
        }
    }
    
    function rebaseTween(new_ref)
    {
        return function(d)
        {
            var level = d3.interpolate(get_level(d,ref),get_level(d,new_ref));
            var start_deg = d3.interpolate(get_start_angle(d,ref),get_start_angle(d,new_ref));
            var stop_deg = d3.interpolate(get_stop_angle(d,ref),get_stop_angle(d,new_ref));
            var opacity = d3.interpolate(100,0);
            return function(t)
            {
                return arc([start_deg(t),stop_deg(t),d[2],level(t)]);
            }
        }
    }
    
    var animating = false;
    
    function animate(d) {
        if (animating)
        {
            return;
        }
        animating = true;
        var revert = false;
        var new_ref;
        if (d == ref && last_refs.length > 0)
        {
            revert = true;
            last_ref = last_refs.pop();
        }
        if (revert)
        {
            d = last_ref;
            new_ref = ref;
            svg.selectAll(".form")
            .filter(
                function (b)
                {
                    if (b[0] >= last_ref[0] && b[1] <= last_ref[1]  && b[3] >= last_ref[3])
                    {
                        return true;
                    }
                    return false;
                }
            )
            .transition().duration(1000).style("opacity","1").attr("pointer-events","all");
        }
        else
        {
            new_ref = d;
            svg.selectAll(".form")
            .filter(
                function (b)
                {
                    if (b[0] < d[0] || b[1] > d[1] || b[3] < d[3])
                    {
                        return true;
                    }
                    return false;
                }
            )
            .transition().duration(1000).style("opacity","0").attr("pointer-events","none");
        }
        svg.selectAll(".form")
        .filter(
            function (b)
            {
                if (b[0] >= new_ref[0] && b[1] <= new_ref[1] && b[3] >= new_ref[3])
                {
                    return true;
                }
                return false;
            }
        )
        .transition().duration(1000).attrTween("d",rebaseTween(d));
        setTimeout(function(){
            animating = false;
            if (! revert)
            {
                last_refs.push(ref);
                ref = d;
            }
            else
            {
                ref = d;
            }
            },1000);
    };    

}

document.getElementById('drop').onchange = function(){
    var value = document.getElementById('drop').options[document.getElementById('drop').selectedIndex].value;
    document.getElementById("slices").remove();
    getPieceCosts(value);
    console.log("change");

}

var listProds = '';
function getAllProds() {
  $.ajax({
    type: "GET",
    url: "/api/graph/graph/allProducts",
    contentType: "application/json",
    success: function(d){
      var data = JSON.parse(d);
      $.each(data, function(key, value){
      if(value.EngModel != null) {
        listProds += '<option value=' + value.ProdNo + '>' + value.ProdEngName + ' ' + value.EngModel + '</option>';
      }
      else {
        listProds += '<option value=' + value.ProdNo + '>' + value.ProdEngName + '</option>';
      }
      });
      $("#drop").append(listProds);
      $('#drop option[value=selectedProd]').prop('selected', true);
      var value = document.getElementById('drop').options[document.getElementById('drop').selectedIndex].value;
      getPieceCosts(value);
      
      

    }
  });
};
getAllProds();
var dataset;
var prodTotal;
var product;
function getPieceCosts(id) {
  var myId = {prodId : id};
  $.ajax({
    type: "GET",
    url: "/api/graph/graph/pieceCosts",
    contentType: "application/json",
    datatype: "json",
    data: JSON.stringify(myId),
    success: function(d){
      console.log(JSON.parse(d));
      dataset = JSON.parse(d);
      console.log(dataset.length);
      getSumPieceCost(id);

    }
  });
};
function getSumPieceCost(id) {
  var myId = {prodId : id};
  $.ajax({
    type: "GET",
    url: "/api/graph/graph/sumPieceCost",
    contentType: "application/json",
    datatype: "json",
    data: JSON.stringify(myId),
    success: function(d){
      prodTotal = JSON.parse(d);
      getProdName(id);
    }
  });
};

function getProdName(id) {
  var myId = {prodId : id};
  $.ajax({
    type: "GET",
    url: "/api/graph/graph/prodName",
    contentType: "application/json",
    datatype: "json",
    data: JSON.stringify(myId),
    success: function(d){
     // console.log(JSON.parse(d));
      product = JSON.parse(d);
      init_plots();
    }
  });
};
var bigDataSet = new Array();
    var smallDataSet = new Array();
    
function init_plots()
{
    for(i = 0; i < dataset.length; i++) {
     if(dataset[i].PieceCost < 0.09) {
        smallDataSet.push(dataset[i]);

      }
      else {
        bigDataSet.push(dataset[i]);
      }
    }
    
    
    function count_function(d)
    {
        return d.PieceCost;
    }
    function label_function(d)
    {
        return d.EngName+": "+d.PieceCost+" Baht, "+d.CostSuperType+" lines of code.";
    }
    
    function legend_function(d)
    {
           return "<h4>"+d[2]+"&nbsp;</h2><p>"+d[4]+" Baht</p>" 
    }

    color = d3.scaleOrdinal()
      .domain(["one", "two", "three", "four", "five", "six"])
      .range(["#FAFAD2","D5FBFF","#9FBCBF", "#647678", "#008080", "#59D8E5"]);
    function color_function(d)
    {
        return color(d[0]);

    }
    init_code_hierarchy_plot("code_hierarchy",dataset,count_function,color_function,label_function,legend_function);

}
