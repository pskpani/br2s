var pivot = new WebDataRocks({
    container: "#wdr-component",
    toolbar: true,
    "height": 400,
    report: {
        "dataSource": {
            "dataSourceType": "json",
            "data": getJSONData()
        },
        "slice": {
             "rows": [{
                 "uniqueName": "projectName"
             },
             ],
            "measures": [{
                "uniqueName": "projectId",
                "aggregation": "count"
            }]
        }
    },
    reportcomplete: function() {
        pivot.off("reportcomplete");
        //createOverallCIChart();
        createCategoryCIChart();
    }
});

function getJSONData() {
    console.log(cicdData.projectData)
    return cicdData.projectData;
}

function createOverallCIChart() {
    pivot.amcharts.getData({
        "slice": {
            "rows": [{
                "uniqueName": "lastCIStatus",
                "sort": "asc"
            }],
            "measures": [{
                "uniqueName": "projectId",
                "aggregation": "count"
            }]
        }, }, drawOveralCIChart, updateOverallCIChart);
}

function drawOveralCIChart(chartData, rawData) {
    /* Apply amCharts theme */
    am4core.useTheme(am4themes_animated);
  
    /* Create chart instance */
    chart = am4core.create("overallCIStatus", am4charts.PieChart);
  
    /* Add data processed by WebDataRocks to the chart */
    chart.data = chartData.data;
    var numberFormat = pivot.amcharts.getNumberFormatPattern(rawData.meta.formats[0]);
  
    /* Apply number formatting to the chart */
    chart.numberFormatter.numberFormat = numberFormat;
  
    /* Create and configure series for a pie chart */
    var pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.category = pivot.amcharts.getCategoryName(rawData);
    pieSeries.dataFields.value = pivot.amcharts.getMeasureNameByIndex(rawData, 0);
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeWidth = 2;
    pieSeries.slices.template.strokeOpacity = 1;
  
    /* Create initial animation */
    pieSeries.hiddenState.properties.opacity = 1;
    pieSeries.hiddenState.properties.endAngle = -90;
    pieSeries.hiddenState.properties.startAngle = -90;
}

function updateOverallCIChart(chartData, rawData) {
    chart.dispose();
    drawOveralCIChart(chartData, rawData);
}


//Category CI Chart

var categoryCIChart;

function createCategoryCIChart() {
    pivot.getData({
        "slice": {
            "rows": [{"uniqueName": "category"}],
            "columns": [{"uniqueName": "lastCIStatus"}],
            "measures": [{"uniqueName": "projectId","aggregation": "count"},]
        },
    }, function(data) {console.log(data)})
    /*
    pivot.amcharts.getData({
        "slice": {
            "rows": [{"uniqueName": "lastCIStatus"},{"uniqueName": "category"}],
            "columns": [{"uniqueName": "category"},{"uniqueName": "Measures"}],
            "measures": [{"uniqueName": "projectId","aggregation": "count"}, {"uniqueName": "projectName","aggregation": "count"}]
        }, }, drawCategoryCIChart, updateCategoryCIChart);
        */
}

function prepareDataFunction(rawData) {
    var result = {};
    var labels = [];
    var data = [];
    for (var i = 0; i < rawData.data.length; i++) {
        var record = rawData.data[i];
        if (record.c0 == undefined && record.r0 !== undefined) {
            var _record = record.r0;
            labels.push(_record);
        }
        if (record.c0 == undefined & record.r0 == undefined) continue;
        if (record.v0 != undefined) {
            data.push(!isNaN(record.v0) ? record.v0 : null);
        }
    }
    result.labels = labels;
    result.data = data;
    return result;
}


function drawCategoryCIChart(chartData, rawData) {

    /* Apply amCharts theme */
    am4core.useTheme(am4themes_animated);
    /* Create chart instance */
    chart = am4core.create("categoryCIStatus", am4charts.XYChart);
    chart.hiddenState.properties.opacity = 0;

    /* Add data processed by WebDataRocks to the chart */
    chart.data = chartData.data;
    console.log(chartData.data)
    /* Create axes */

    /* Category axis */
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = pivot.amcharts.getCategoryName(rawData);
    categoryAxis.renderer.minGridDistance = 40;
    categoryAxis.fontSize = 11;
    categoryAxis.renderer.labels.template.dy = 5;
    /* Value axis */
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    /* Get number formatting from WebDataRocks prepared to a format required by amCharts */
    var numberFormat = pivot.amcharts.getNumberFormatPattern(rawData.meta.formats[0]);
    /* Apply number formatting to the chart */
    valueAxis.numberFormatter.numberFormat = numberFormat;
    valueAxis.min = 0;
    valueAxis.renderer.minGridDistance = 30;
    valueAxis.renderer.baseGrid.disabled = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.minWidth = 50;
    /* Create and configure series. There will be as many series in the stacked column chart as measures in the pivot table's slice: */
    for (s = 0; s < pivot.amcharts.getNumberOfMeasures(rawData); s++) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = pivot.amcharts.getCategoryName(rawData);
        series.dataFields.valueY = pivot.amcharts.getMeasureNameByIndex(rawData, s);
        series.name = pivot.amcharts.getMeasureNameByIndex(rawData, s);
        series.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('" + numberFormat + "')}%"; // use the pivot table's formatting for tooltip as well
        series.columns.template.tooltipY = 0;
        series.columns.template.strokeOpacity = 0;
        series.stacked = false;
        //series.dataFields.valueYShow = "totalPercent";
    }
}

function updateCategoryCIChart(chartData, rawData) {
    chart.dispose();
    drawCategoryCIChart(chartData, rawData);
}