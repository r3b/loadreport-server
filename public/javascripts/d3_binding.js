ko.bindingHandlers.sparkline = {
    update:function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var options = allBindingsAccessor().sparklineOptions || {};
        //jQuery(element).sparkline(value, options);
        jQuery(element).empty();
        var x = d3.scale.linear()
		    .domain([0, d3.max(value)])
		    .range(["0px", "800px"]);
        var chart=d3
        	.select(element)
        	.attr("class", "chart");
        chart.selectAll("div")
        	.data(value)
  			.enter().append("div")
    		.style("width", x)
    		.text(function(d) { return d; });

    }
};
ko.bindingHandlers.d3 = {
    update:function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        //var options = allBindingsAccessor().sparklineOptions || {};
        //jQuery(element).sparkline(value, options);
        //console.dir(value.data())
        function propertyMap(x){
            var val, props=value.property;
            if('array'=== typeof props){
                val=[];
                props.forEach(function(p){
                    val.push(x[props[p]]());
                })
            }else{
                val=x[props]();
            }
            return val;
        }
        var data=value.data().map(propertyMap);
        var w=800,h=450,pad=1,barH=h/data.length - pad;
        console.log(d3.max(data));
        if(barH<3){
            barH=3;
        }
        jQuery(element).empty();
        var x = d3.scale.linear()
            .domain([0, d3.max(data)])
            .range([0, w]);
        var y = d3.scale.linear()
            .domain([0, data.length])
            .rangeRound([1, h]);
        var chart=d3
            .select(element)
            .select('svg')
        console.log('chart', chart.empty());
        if(chart.empty()){
            chart=d3
            .select(element)
            .append('svg')
            .attr("class", "chart")
            .attr("width", w)
            .attr("height", h);
        }
        chart.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", function(d, i) { return i*(barH+pad); })
            .attr("width", function(d, i) { return x(d); })
            .attr("height", barH);
    }
};
