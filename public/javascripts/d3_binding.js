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
        console.dir(value.data())
        var data=value.data().map(function(x){return x[value.property]();});
        jQuery(element).empty();
        var x = d3.scale.linear()
		    .domain([0, d3.max(data)])
		    .range(["0px", "800px"]);
        var chart=d3
        	.select(element)
        	.attr("class", "chart");
        chart.selectAll("div")
        	.data(data)
  			.enter().append("div")
    		.style("width", x)
    		.text(function(d) { return d; });

    }
};
