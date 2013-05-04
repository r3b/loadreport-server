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
