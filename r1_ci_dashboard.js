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
            }],
            "rows": [{"uniqueName": "lastCIStatus"}],
            "columns": [{"uniqueName": "Measures"}],
            "measures": [{"uniqueName": "projectId","aggregation": "count"}]

        },
    },
    reportcomplete: function() {
        projectPivotData.off("reportcomplete");
        createOverallCIChart();
        createCategoryCIChart();
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
            }],
            "rows": [{"uniqueName": "projectName"}, {"uniqueName": "release"}, {"uniqueName": "category"}, {"uniqueName": "lastCIStatus"}, {"uniqueName": "lastCIPipelineDT"}]
        },
    },
    reportcomplete: function() {
        projectPivotReport.off("reportcomplete");
    }
});

let qaulitygatePivotReport = new WebDataRocks({
    container: "#wdr-qualitygate-report",
    toolbar: false,
    "height": 400,
    report: {
        "dataSource": {
            "dataSourceType": "json",
            "data": getQualityGateJSONData()
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
            }],
            "rows": [{"uniqueName": "projectName"}, {"uniqueName": "release"}, {"uniqueName": "category"}, {"uniqueName": "qualityGateName"}, {"uniqueName": "qualityGateStatus"},{"uniqueName": "qualityGateDateTime"} ]
        },
    },
    reportcomplete: function() {
        qaulitygatePivotData.off("reportcomplete");
        createQualityGateCICharts();
    }
});

let qaulitygatePivotData = new WebDataRocks({
    container: "#wdr-qualitygate-data",
    toolbar: true,
    "height": 400,
    report: {
        "dataSource": {
            "dataSourceType": "json",
            "data": getQualityGateJSONData()
        },
        "slice": {
            "reportFilters": [{
                "uniqueName": "release",
                "filter": {
                    "members": [
                        "release.R1"
                    ]
                }
            }],
            "rows": [{"uniqueName": "category"}],
            "columns": [{"uniqueName": "qualityGateName"},{"uniqueName": "qualityGateStatus"}, {"uniqueName": "Measures"}],
            "measures": [{"uniqueName": "projectId","aggregation": "count"}]
        },
    },
    reportcomplete: function() {
        qaulitygatePivotData.off("reportcomplete");
        createQualityGateCICharts();
    }
});

function getProjectJSONData() {
    //console.log(cicdData.projectData)
    console.log(document.getElementById("lastUpdated"));
    document.getElementById("lastUpdated").innerHTML = "Last Upd: " + cicdData.lastUpdated;

    return cicdData.projectData;
}

function getQualityGateJSONData() {
    //console.log(cicdData.projectData)
    return cicdData.qualityGates;
}


//-----------------------------------------------------------------------------------------------------------
//Quality Gate CI Charts

function createQualityGateCICharts() {
    qaulitygatePivotData.getData({
        "slice": {
            "reportFilters": [{
                "uniqueName": "release",
                "filter": {
                    "members": [
                        "release.R1"
                    ]
                }
            },
            ],
            "rows": [{"uniqueName": "category"}, ],
            "columns": [{"uniqueName": "Measures"}],
            "measures": [{"uniqueName": "projectId","aggregation": "count"}]
        },
    }, function(rawData) {
        //console.log("rawData", rawData);
        let idNo = 1;
        for (let i = 0; i < rawData.data.length; i++) {
            let record = rawData.data[i];
            //console.log(record);
    
            //push row labels
            if (record.r0 !== undefined && record.v0 !== undefined) {
                createQualityGateCIChart(record.r0, idNo);
                idNo++;
            }
        }
    })
}

function createQualityGateCIChart(category, idNo) {
    qaulitygatePivotData.getData({
        "slice": {
            "reportFilters": [{
                "uniqueName": "release",
                "filter": {
                    "members": [
                        "release.R1"
                    ]
                }
            },
            {
                "uniqueName": "category",
                "filter": {
                    "members": [
                        "category." + category
                    ]
                }
            },
            ],
            "rows": [{"uniqueName": "qualityGateName"}, ],
            "columns": [{"uniqueName": "qualityGateStatus"}, {"uniqueName": "Measures"}],
            "measures": [{"uniqueName": "projectId","aggregation": "percentofrow"},{"uniqueName": "projectName","aggregation": "count"}]
        },
    }, function(rawData) {
        drawQualityGateCIChart(rawData, category, idNo) })
}

function drawQualityGateCIChart(rawData, category, idNo) {
    //console.log("quality gate rawData", rawData);
    //console.log("category ", category);
    //console.log("idNo", idNo)
    let data_for_charts = prepareClusterBarDataFunction(rawData);
    //console.log("data_for_charts", data_for_charts)
    let ctx = document.getElementById("categoryCIQualityGateStatusChart"+idNo).getContext("2d");
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
                  text: category + ' Quality Gate Chart ',
                  padding: 10
                }
              }
        }
    });
}


//-------------------------------------------------------------------------------------------------------
//Overall CI Chart
let overallCIChart;

function createOverallCIChart() {
    console.log("createOverallCIChart..");
    projectPivotData.getData({
        "slice": {
            "rows": [{"uniqueName": "lastCIStatus"}],
            "measures": [{"uniqueName": "projectId","aggregation": "count"}]
        },
    }, drawOveralCIChart, updateOverallCIChart)
}

function drawOveralCIChart(rawData) {
    console.log("rawData", rawData);
    let data_for_charts = preparePieDataFunction(rawData);
    let ctx = document.getElementById("overallCIStatus").getContext("2d");
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
                  text: 'Overall CI Chart',
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

function updateOverallCIChart(rawData) {
    //overallCIChart.dispose();
    //drawOveralCIChart(rawData);
}

function getColorCode(status) {
    switch(status) {
        case "failed":
            return 'rgb(255, 99, 132)'; //Red
        case "success":
            return 'rgb(75, 192, 192)'; //Green
        case "success with warnings":
            return 'rgb(255, 159, 64)'; //Orance
        case "pending":
            return 'rgb(201, 203, 207)'; //Grey
        default:
            return 'rgb(0, 0, 0)'; //Black 
    }
}

//--------------------------------------------------------------------------------------------------------------
//Category CI Chart
let categoryCIChart;

function createCategoryCIChart() {
    projectPivotData.getData({
        "slice": {
            "reportFilters": [{
                "uniqueName": "release",
                "filter": {
                    "members": [
                        "release.R1"
                    ]
                }
            }],
            "rows": [{"uniqueName": "category"}],
            "columns": [{"uniqueName": "lastCIStatus"}, {"uniqueName": "Measures"}],
            "measures": [{"uniqueName": "projectId","aggregation": "percentofrow"},{"uniqueName": "projectName","aggregation": "count"}]
        },
    }, drawCategoryCIChart)
}

function preparePieDataFunction(rawData) {
    let result = {};
    let labels = [];
    let datasets = [];

    //Extract the row and columns
    for (let i = 0; i < rawData.data.length; i++) {
        let record = rawData.data[i];
        //console.log(record);

        //push row labels
        if (record.c0 == undefined && record.r0 !== undefined) {
            let _record = record.r0;
            //console.log("row is " + _record);
            labels.push(_record);
        }
    }

    let dataset = {}
    let data1 = []
    let backgroundColors = []

    for (let j = 0; j < labels.length; j++) {
        let label = labels[j];
        //console.log("label", label);
        for (let k = 0; k < rawData.data.length; k++) {
            let record = rawData.data[k];
            if (record.c0 == undefined && record.r0 !==  undefined && record.r0 == label) {
                let _value = record.v0;
                    //console.log("_value", _value);
                    data1.push(_value);
                    break;
            }
        }
        backgroundColors.push(getColorCode(label))
    }

    dataset.label = "";
    dataset.data = data1;
    //dataset.borderColor= bgColor;
    dataset.backgroundColor=  backgroundColors;
    
        dataset.datalabels =  {
            display: function(context) {
                //console.log("context", context);
                let index = context.dataIndex;
                let value = context.dataset.data[index];
                if (value !== 0) 
                    return true;
                else
                    return false;
            },
            formatter: (value, context) => {
                let sum = 0;
                let dataArr = context.dataset.data;
                dataArr.map(data => {
                    sum += data;
                });
                let percentage = (value*100 / sum).toFixed(0)+"% (" + value + ")";
                return percentage;
            },
          }
        datasets.push(dataset);
    result.labels = labels;
    result.datasets = datasets;

    //console.log(result);
    return result;
}

function prepareClusterBarDataFunction(rawData) {
    //console.log("rawData", rawData);
    let result = {};
    let labels = [];
    let columns = [];
    let datasets = [];

    //Extract the row and columns
    for (let i = 0; i < rawData.data.length; i++) {
        let record = rawData.data[i];
        //console.log(record);

        //push row labels
        if (record.c0 == undefined && record.r0 !== undefined) {
            let _record = record.r0;
            //console.log("row is " + _record);
            labels.push(_record);
        }

        if (record.c0 !== undefined && record.r0 == undefined) {
            let _record = record.c0;
            //console.log("column is " + _record);
            columns.push(_record);
            //labels.push(_record);
        }
    }

    //console.log("labels", labels);
    //console.log("columns", columns);
    for (let i = 0; i < columns.length; i++) {
        let column = columns[i];
        let dataset = {}
        let data1 = [];
        let data2 = [];
        //console.log("column", column);

        for (let j = 0; j < labels.length; j++) {
            let label = labels[j];
            //console.log("label", label);
            for (let k = 0; k < rawData.data.length; k++) {
                let record = rawData.data[k];
                if (record.c0 !== undefined && record.r0 !==  undefined && record.r0 == label && record.c0 == column) {
                    //console.log("match found", record);
                    let _value1 = record.v0;
                    let _value2 = record.v1;
                    if (_value1 != NaN) {
                        //console.log("_value", _value);
                        data1.push(_value1.toFixed(0));
                    } else {
                        data1.push(0);
                    }
    
                    if (_value2 != NaN) {
                        //console.log("_value", _value);
                        data2.push(_value2);
                    } else {
                        data2.push(0);
                    }
                    break;
                }
            }
        }

        bgColor = getColorCode(column);

        dataset.label = column;
        dataset.data = data1;
        dataset.tempData = data2;
        //dataset.borderColor= bgColor;
        dataset.backgroundColor=  bgColor;
        
        dataset.datalabels =  {
            display: function(context) {
                //console.log("context", context);
                let index = context.dataIndex;
                let value = context.dataset.data[index];
                if (value == NaN)
                    return false;
                if (value !== 0) 
                    return true;
                else
                    return false;
            },
            formatter: (value, context) => {
                let sum = 0;
                //console.log("context", context);
                //console.log("context.dataset", context.dataset);
                let val = context.dataset.tempData[context.dataIndex];
                //let dataArr = context.dataset.data;
                //dataArr.map(data => {
                //    sum += data;
                //});
                //let percentage = (value*100 / sum).toFixed(0)+"% (" + value + ")";
                return value + "% (" + val + ")";
            },
          }
        datasets.push(dataset);
    }

    result.labels = labels;
    result.datasets = datasets;

    //console.log(result);
    return result;
}

function drawCategoryCIChart(rawData) {

    let data_for_charts = prepareClusterBarDataFunction(rawData);
    //console.log("data_for_charts", data_for_charts)
    let ctx = document.getElementById("categoryCIStatusChart").getContext("2d");
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
                  text: 'Category CI Chart',
                  padding: 10
                }
              }
        }
    });

}

function updateCategoryCIChart(rawData) {
    categoryCIChart.dispose();
    drawCategoryCIChart(rawData);
}