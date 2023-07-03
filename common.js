function getProjectJSONData() {
    //console.log(cicdData.projectData)
    console.log(document.getElementById("lastUpdated"));
    document.getElementById("lastUpdated").innerHTML = "Last Upd: " + cicdData.lastUpdated;

    return cicdData.projectData;
}

function getColorCode(status) {
    switch(status) {
        case "failed":
            return 'rgb(255, 99, 132)'; //Red
        case "failed, Allow to fail":
            return 'rgb(255, 80, 80)';
        case "success":
            return 'rgb(75, 192, 192)'; //Green
        case "success, Allow to fail":
            return 'rgb(75, 90, 90)';           
        case "success with warnings":
            return 'rgb(255, 159, 64)'; //Orance
        case "pending":
            return 'rgb(201, 203, 207)'; //Grey
        default:
            return 'rgb(0, 0, 0)'; //Black 
    }
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