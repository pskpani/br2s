let projectPivotData = new WebDataRocks({
    container: "#wdr-project-data",
    toolbar: false,
    "height": 400,
    report: {
        "dataSource": {
            "dataSourceType": "json",
            "data": getProjectJSONData()
        },
        "slice": {
            "reportFilters": [{
                "uniqueName": "release",
                "filter": {
                    "members": [
                        "release.R1"
                    ]
                }
            },{
                "uniqueName": "lastCDStatus",
                "filter": {
                    "members": [
                        "lastCDStatus.NA"
                    ],
                    "negation": true
                }
            }],
            "rows": [{"uniqueName": "lastCDStatus"}],
            "columns": [{"uniqueName": "Measures"}],
            "measures": [{"uniqueName": "projectId","aggregation": "count"}]

        },
    },
    reportcomplete: function() {
        projectPivotData.off("reportcomplete");
        createOverallCDChart();
        createCategoryCDChart();
        createEnvCDChart('Development', 'devCDStatus','devEnvCDStatus');
        createEnvCDChart('UAT', 'uatCDStatus','uatEnvCDStatus');
        createEnvCDChart('QAT', 'stgCDStatus','qatEnvCDStatus');
        createEnvCDChart('Prod', 'prodCDStatus','prodEnvCDStatus');
    }
});

let projectPivotReport = new WebDataRocks({
    container: "#wdr-project-report",
    toolbar: false,
    "height": 400,
    report: {
        "dataSource": {
            "dataSourceType": "json",
            "data": getProjectJSONData()
        },
        options: {
            grid: {
                type: "flat",
                showGrandTotals: "off"
            }
        },
        "slice": {
            "reportFilters": [{
                "uniqueName": "release",
                "filter": {
                    "members": [
                        "release.R1"
                    ]
                }
            },{
                "uniqueName": "lastCDStatus",
                "filter": {
                    "members": [
                        "lastCDStatus.NA"
                    ],
                    "negation": true
                }
            }],
            "rows": [{"uniqueName": "projectName"}, {"uniqueName": "release"}, {"uniqueName": "category"}, {"uniqueName": "lastCDStatus"}, {"uniqueName": "lastCDVersion"}, {"uniqueName": "lastCDPipelineDT"}, 
                        {"uniqueName": "devCDStatus"}, {"uniqueName": "devCDVersion"}, {"uniqueName": "devCDDT"},
                        {"uniqueName": "uatCDStatus"}, {"uniqueName": "uatCDVersion"}, {"uniqueName": "uatCDDT"},
                        {"uniqueName": "stgCDStatus"}, {"uniqueName": "stgCDVersion"}, {"uniqueName": "stgCDDT"},
                        {"uniqueName": "prodCDStatus"}, {"uniqueName": "prodCDVersion"}, {"uniqueName": "prodCDDT"}]
        },
    },
    reportcomplete: function() {
        projectPivotReport.off("reportcomplete");
    }
});


//-------------------------------------------------------------------------------------------------------
//Overall CD Chart
let overallCDChart;

function createOverallCDChart() {
    console.log("createOverallCDChart..");
    projectPivotData.getData({
        "slice": {
            "rows": [{"uniqueName": "lastCDStatus"}],
            "measures": [{"uniqueName": "projectId","aggregation": "count"}]
        },
    }, drawOveralCDChart, updateOverallCDChart)
}

function drawOveralCDChart(rawData) {
    //console.log("rawData", rawData);
    let data_for_charts = preparePieDataFunction(rawData);
    let ctx = document.getElementById("overallCDStatus").getContext("2d");
    overallCIChart = new Chart(ctx, {
        type: 'pie',
        data: data_for_charts,
        plugins: [ChartDataLabels],
        options: {
            indexAxis: 'x',
            responsive: true,
            plugins: {
                legend: {
                  position: 'bottom',
                },
                title: {
                  display: true,
                  font: {size: 20, weight: 'bold'},
                  text: 'Overall CD Chart',
                  padding: 10
                }
              },
              datalabels: {
                    align: 'end',
                    anchor: 'end', 
                    display: function(context) {
                        //console.log("context111", context);
                        let index = context.dataIndex;
                        let value = context.dataset.data[index];
                        if (value !== 0) 
                            return true;
                        else
                            return false;
                    }, 
                    formatter: (value, ctx) => {
                        //console.log("formatter");
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        let percentage = (value*100 / sum).toFixed(2)+"%";
                        return percentage;
                    },
              }
        }
    });
}

function updateOverallCDChart(rawData) {
    //overallCIChart.dispose();
    //drawOveralCIChart(rawData);
}

//--------------------------------------------------------------------------------------------------------------
//Category CI Chart
let categoryCDChart;

function createCategoryCDChart() {
    projectPivotData.getData({
        "slice": {
            "reportFilters": [{
                "uniqueName": "release",
                "filter": {
                    "members": [
                        "release.R1"
                    ]
                }
            },{
                "uniqueName": "lastCDStatus",
                "filter": {
                    "members": [
                        "lastCDStatus.NA"
                    ],
                    "negation": true
                }
            }],
            "rows": [{"uniqueName": "category"}],
            "columns": [{"uniqueName": "lastCDStatus"}, {"uniqueName": "Measures"}],
            "measures": [{"uniqueName": "projectId","aggregation": "percentofrow"},{"uniqueName": "projectName","aggregation": "count"}]
        },
    }, drawCategoryCDChart)
}

function drawCategoryCDChart(rawData) {
    let data_for_charts = prepareClusterBarDataFunction(rawData);
    //console.log("data_for_charts", data_for_charts)
    let ctx = document.getElementById("categoryCDStatusChart").getContext("2d");
    chart = new Chart(ctx, {
        type: 'bar',
        data: data_for_charts,
        plugins: [ChartDataLabels],
        options: {
            indexAxis: 'x',
            responsive: true,
            scales: {
                x: {
                  stacked: true
                },
                y: {
                  stacked: true,
                    max: 100,
                    min: 0, 
                }
              },
            plugins: {
                legend: {
                  position: 'bottom',
                },
                title: {
                  display: true,
                  font: {size: 20, weight: 'bold'},
                  text: 'Category CD Chart',
                  padding: 10
                }
              }
        }
    });
}

function updateCategoryCDChart(rawData) {
    categoryCChart.dispose();
    drawCategoryCIChart(rawData);
}

//---------------------------------------------------------
function createEnvCDChart(name, colName, divName) {
    projectPivotData.getData({
        "slice": {
            "reportFilters": [{
                "uniqueName": "release",
                "filter": {
                    "members": [
                        "release.R1"
                    ]
                }
            },{
                "uniqueName": colName,
                "filter": {
                    "members": [
                        colName + ".NA"
                    ],
                    "negation": true
                }
            }],
            "rows": [{"uniqueName": "category"}],
            "columns": [{"uniqueName": colName}, {"uniqueName": "Measures"}],
            "measures": [{"uniqueName": "projectId","aggregation": "percentofrow"},{"uniqueName": "projectName","aggregation": "count"}]
        },
    }, function(rawData) {
        drawEnvCDChart(rawData, name, divName);
    })
}

function drawEnvCDChart(rawData, name, divName) {
    let data_for_charts = prepareClusterBarDataFunction(rawData);
    //console.log("data_for_charts", data_for_charts)
    let ctx = document.getElementById(divName).getContext("2d");
    chart = new Chart(ctx, {
        type: 'bar',
        data: data_for_charts,
        plugins: [ChartDataLabels],
        options: {
            indexAxis: 'x',
            responsive: true,
            scales: {
                x: {
                  stacked: true
                },
                y: {
                  stacked: true,
                    max: 100,
                    min: 0, 
                }
              },
            plugins: {
                legend: {
                  position: 'bottom',
                },
                title: {
                  display: true,
                  font: {size: 20, weight: 'bold'},
                  text: name + ' CD Chart',
                  padding: 10
                }
              }
        }
    });
}