const spaceRow = document.createElement("tr");
spaceRow.innerHTML = `<td colspan="100" style="padding: 8px;"></td>`;
const getCookie = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// functionality for plus symbols in cards
const getHealthColor = (health) => {
    if (health < 60) {
        return "rgb(247, 75, 95)";
    }
    if (health < 89) {
        return "rgb(218, 184, 44)";
    }
    return "rgb(50, 210, 100)";
};

const getBranchAndTitleFromId = (id) => {
    let branch = "";
    let title = "";
    for (let i = 0; i < id.length; i++) {
        let s = id[i];
        if ((s>='a' && s<='z')||(s<='Z' && s>='A')) {
            title += s;
        } else {
            branch += s;
        }
    }
    return [branch, title]
};

const getMainPerformanceColor = ({failures, diff}) => {
    return !failures ? "white" : "rgba(255, 155, 155, .4)";
};

const getPerformanceColor = ({failures, diff}) => {
    if (diff == "N/A") {
        return "black";
    }
    return !failures ? "rgba(50, 100, 255, .75); font-weight: 600;" : "rgba(255, 0, 40, .75); font-weight: 600;";
};

const getSystemDataEntry = (status) => {
    return status === "Success" ? "P" : "F";
};

const getSystemColor = (data) => {
    return data === "P" ? "white" : "rgba(255, 155, 155, .4)";
};

const getBaselineDiff = ({failure, diff}) => {
    if (diff === "N/A") {
        return "";
    }
    let arrow = diff > 0 ? "<i class='material-icons' style='margin-right: 1px;font-size: 17px'>arrow_upward</i>" : "<i class='material-icons' style='margin-right: 1px;font-size: 17px;'>arrow_downward</i>";
    return arrow + " " + Math.abs(diff);
};

const getGraphValues = ({vals, total}) => {
    let totalPerc = 100;
    let rtrn_array = [];
    for (let i = 0; i < vals.length; i++) {
        let perc = 100*(vals[i]/total);
        perc = Number(Math.round(perc+'e2')+"e-2");
        console.log(perc);
        rtrn_array.push(perc);
    }
    return rtrn_array;
};

const initializeBaselineButton = ({baseline, is_staff, id}) => {
    let baselineButton = document.getElementById("baseline-button");
    if (!is_staff) {
        baselineButton.style.display = "none";
    }
    if (baseline) {
        baselineButton.innerHTML = "Remove as Baseline";
        baselineButton.style.backgroundColor = "rgba(255, 155, 155, .4)";
    } else {
        baselineButton.innerHTML = "Add as Baseline";
        baselineButton.style.backgroundColor = "rgba(174, 199, 232, .6)";
    }
    baselineButton.onclick = () => {
        fetch("/api/destiny/performance_metric/" + id + "/", {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        }).then(rsp => rsp.json()).then(msg => {
            initializeBaselineButton({baseline: msg.baseline, is_staff, id})
        });
    };
};

const fetchContextAndBaselineFromId = (ele) => {
    const title = ele.getAttribute("data-id");
    fetch("/api/destiny/performance_metric/" + ele.id +"/", {
        credentials: "include"
    }).then(rsp => rsp.json()).then(msg => {
        displayContext(msg.context, title);
        initializeBaselineButton({baseline: msg.baseline, is_staff: msg.is_staff, id: ele.id});
    });
};

const displayContext = (msg, title, id) => {
        document.getElementById("clear-context-side-bar").onclick = () => {
            document.getElementById("context-side-bar").style.display = "none";
            document.getElementById("context-side-bar-title").style.display = "none";
        }

        document.getElementById("context-side-bar").style.display = "block";
        document.getElementById("context-side-bar-title").style.display = "block";
        document.getElementById("context-title").textContent = title;
        let resizeObserver = new MutationObserver((mutations) => {
            document.getElementById("context-side-bar-title").style.width = document.getElementById("context-side-bar").style.width;
        });
        const config = {attributes: true}
        resizeObserver.observe(document.getElementById("context-side-bar"), config);
        document.getElementById("context-side-bar-content").innerHTML = `<pre>${JSON.stringify(msg, null, 2)}</pre>`;
};

const fetchVersionData = (ele, contentDivId, branch, versionStartsWith) => {
    console.log(branch, versionStartsWith);
    let version = null;
    let time = "";
    if (ele.dataset.name == "Versions") {
        version = ele.dataset.id;
        time = "All";
    } else {
        time = ele.dataset.id;
        version = document.getElementById(branch+"perf-version").textContent;
    }
    let feature = ele.dataset.feature;
    let perfFilterBlock = document.getElementById(branch+"perf-filter-block");
    let perfTitleContent = document.getElementById(branch+"perf-title-content");
    let loader = `<div class="loader" style="margin: 100px auto;"></div>`;
    let contentDiv = document.getElementById(contentDivId);
    let perfBlock = document.getElementById(branch+"perf-block");

    perfFilterBlock.removeChild(document.getElementById(branch+"perf-time-filter"));
    perfBlock.innerHTML = loader;
    perfTitleContent.innerHTML = feature + ": " + `<span id='${branch+"perf-version"}' class="perf-version">${version}</span>` + ": " + `<span id='${branch+"perf-time"}' class="perf-time">${time}</span>`;
    console.log(versionStartsWith);
    if (version == "latest version") {
        if (versionStartsWith != "null") {
            window.data.config["perf-version"] = versionStartsWith
            startPerfTableTwo(perfBlock, window.data[versionStartsWith].performance.table_two[feature], contentDiv, version, branch, versionStartsWith);
        } else {
            window.data.config["perf-version"] = branch
            startPerfTableTwo(perfBlock, window.data[branch].performance.table_two[feature], contentDiv, version, branch, versionStartsWith);
        }
    } else {
        window.data.config["perf-version"] = version
        fetch("/api/destiny/performance_metric/?time=" + time + "&feature="+feature+"&version="+version).then(rsp => rsp.json()).then(
            feature_data => {
                let perfBlock = document.getElementById(branch+"perf-block");
                if (!perfBlock || window.data.config["perf-version"] != version) {
                    return;
                }
                startPerfTableTwo(perfBlock, feature_data, contentDiv, version, branch, versionStartsWith);
            });
    }
};

const compareFunction = (configAStr,configBStr) => {
    if (!configAStr) {
        return 1;
    }
    if (!configBStr) {
        return -1;
    }
    let configA = JSON.parse(configAStr);
    let configB = JSON.parse(configBStr);
    if (!configB || !configB.type) {
        return -1;
    }
    if (!configA || !configA.type) {
        return 1;
    }
    if (configA.type < configB.type) {
        return -1;
    } else if (configA.type > configB.type) {
        return 1;
    }
    return 0;
};

const metricMouseMove= (e) => {
    if (!e.currentTarget.dataset.time && !e.currentTarget.dataset.version) {
        return;
    }
    let perfToolBar = document.getElementById("perf-tool-bar");
    perfToolBar.style.top = e.pageY-30 + "px";
    perfToolBar.style.left = e.pageX+30 + "px";
    perfToolBar.style.display = "block";
    perfToolBar.innerHTML = `<div>${e.currentTarget.dataset.time}</div><div>${e.currentTarget.dataset.version}</div>`;
};


const metricMouseOut = (e) => {
    let perfToolBar = document.getElementById("perf-tool-bar");
    perfToolBar.style.display = "none";
};

const startPerfTableTwo = (perfBlock, feature_data, contentDiv, version="latest version", branch, versionStartsWith) => {
    clearChildren(perfBlock);
    contentDiv.style.display = "block";
    let timeFilter = createPerfFilter(
        "Times",
        branch,
        branch+"perf-time-filter",
        feature_data["time_set"],
        `fetchVersionData(this, '${contentDiv.id}', '${branch}', '${versionStartsWith}')`
    );
    document.getElementById(branch+"perf-filter-block").appendChild(timeFilter);
    for (const testcase of Object.keys(feature_data.data)) {
        let table = document.createElement("table");
        table.setAttribute("class", "performance-table");
        let caption = document.createElement("caption");
        caption.textContent = testcase.split(" ")[0] + ": " + version;
        table.appendChild(caption);
        let thead = document.createElement("thead");
        let row = document.createElement("tr");
        let labels = feature_data.labels;
        let units = feature_data.units;
        let spaceRow1 = spaceRow.cloneNode(true);
        thead.appendChild(row);
        thead.appendChild(spaceRow1);
        row.innerHTML = `<th></th>`;
        for (let j = 0; j < labels.length; j++) {
            let unit = units[j] ? "(" + units[j] + ")" : "";
            row.innerHTML += `<th>${labels[j]} <div style="font-size: 12px">${unit}</div></th>`;
        }
        table.appendChild(thead);

        let tbody = document.createElement("tbody");
        for (const config of Object.keys(feature_data.data[testcase]).sort(compareFunction)) {
            let row = document.createElement("tr");
            tbody.appendChild(row);
            const configJSON = JSON.stringify(JSON.parse(config), null, 1);
            row.innerHTML += `<th class="horizontal-tb-label" style="font-size: 14px"><pre>${configJSON}</pre></th>`;
            for (const ld of feature_data.data[testcase][config]) {
                let data = "";
                let baseline = "";
                if (ld) {
                    for (const d of ld["values"]) {
                        let diffContent = getBaselineDiff({failure: d["failure"], diff: d["diff"]});
                        data += `<div id=${d['id']} class="clickable" data-version="${ld['version_string']}" data-time="${d['time']}" data-id='${config} ${ld["label"]}' onmousemove="metricMouseMove(event)" onmouseout="metricMouseOut(event)" onclick="fetchContextAndBaselineFromId(this)" style="color: ${getPerformanceColor({'failures': d['failure'], 'diff': d['diff']})};"><span style="display:flex">${diffContent}</span> <span style="${diffContent && 'margin-left: 30px'}">${d["val"]}</span></div>`;
                    }
                    if (ld["baseline"] != "N/A") {
                        baseline = `<div style="margin-bottom: 10px;">Baseline: ${ld["baseline"]}</div>`;
                    }
                }
                row.innerHTML += `<td>${baseline} ${data}</td>`;
            }
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        perfBlock.appendChild(table);
    }
};

const htmlDashFilter = (version) => {
    return version.replace(/-/g, "&#8209;");
};

const createPerfFilter = (name, branch, id, data, onClick, contentFilter=null) => {
    let filter = document.createElement("div");
    filter.id = id;
    filter.setAttribute("class", "perf-filter");

    let title = document.getElementById(branch+"perf-title");
    let feature = title.dataset.feature;

    let filterTitle = document.createElement("div");
    filterTitle.innerHTML = name + " <i class='material-icons rotate-arrow'>arrow_right</i>";
    filterTitle.setAttribute("class", "perf-filter-title");
    filterTitle.setAttribute("data-name", name);
    filter.appendChild(filterTitle);
    let filterDropDown = document.createElement("div");
    filterDropDown.setAttribute("class", "perf-filter-dropdown");
    let prefixArray = [];
    if (name == "Versions") {
        prefixArray = ["latest version"]
    } else if (name == "Times") {
        prefixArray = ["All"]
    }
    for (let datum of prefixArray.concat(data)) {
        if (contentFilter) {
            datum = contentFilter(datum);
        }
        if (!datum) {
            continue;
        }
        filterDropDown.innerHTML += `<div data-name="${name}" data-feature="${feature}" data-id="${datum}" onclick="${onClick}" class="perf-filter-row">${datum}</div>`;
    }

    let filterTimeOut = null;
    filter.addEventListener("mouseenter", () => {
        for (const oFilterTitle of document.getElementsByClassName("perf-filter-title")) {
            if (oFilterTitle != filterTitle) {
                oFilterTitle.innerHTML=oFilterTitle.dataset.name+" <i class='material-icons rotate-arrow'>arrow_right</i>";
            }
        }
        for (const ofd of document.getElementsByClassName("perf-filter-dropdown")) {
            if (ofd != filterDropDown) {
                ofd.style.display="none";
            }
        }
        window.clearTimeout(filterTimeOut);
        filterDropDown.style.display = "block";
        filterTitle.innerHTML = name + " <i class='material-icons rotate-arrow'>arrow_left</i>";
    });

    filter.addEventListener("mouseleave", () => {
        filterTimeOut = window.setTimeout(() => {
            filterDropDown.style.display = "none";
            filterTitle.innerHTML = name + " <i class='material-icons rotate-arrow'>arrow_right</i>";
        }, 1000)
    });

    filter.appendChild(filterDropDown);
    return filter
};

const startTableOne = (table_one, table_two, contentDiv, bigCard, type, branch, versionStartsWith) => {
    clearChildren(contentDiv);
    for (let i = 0; i < table_one.length; i++) {
        let row1 = table_one[i]["header"];
        let failures = table_one[i]["failures"];
        let clickableRow = document.createElement("div");
        clickableRow.setAttribute("class", "table-row");
        let icon = "";
        if (failures) {
            icon = `<span style="margin-left: 10px;">${failures}</span>`;
        }
        clickableRow.innerHTML = `<div style="display: flex; padding: 5px;align-items: center;margin:1px 6px;"><span style="margin-right: auto">${row1}</span>${icon}</div>`;
        clickableRow.style.backgroundColor = getMainPerformanceColor({failures: failures});
        clickableRow.onclick = () => {
            clearChildren(contentDiv);
            let arrowBack = document.createElement("div");
            arrowBack.setAttribute("class", "arrow-back");
            arrowBack.innerHTML = '<i class="material-icons" style="font-size: 50px;">keyboard_backspace</i>';
            contentDiv.appendChild(arrowBack);

            if (type == "performance") {
                arrowBack.onclick = () => {
                    contentDiv.style.display = "flex";
                    startTableOne(table_one, table_two, contentDiv, bigCard, "performance", branch, versionStartsWith);
                };
                let title = document.createElement("div");
                title.setAttribute("class", "perf-title");
                title.id = branch+"perf-title";
                title.setAttribute("data-feature", row1);
                let titleContent = document.createElement("span");
                titleContent.id = branch+"perf-title-content";
                titleContent.innerHTML = row1 + ": " + `<span id='${branch+"perf-version"}' class="perf-version">latest version</span>` + ": " + `<span id='${branch+"perf-time"}' class="perf-time">All</span>`;
                title.appendChild(titleContent);
                contentDiv.appendChild(title);

                let filterBlock = document.createElement("div");
                filterBlock.id = branch+"perf-filter-block";

                let versionFilter = createPerfFilter(
                    "Versions",
                    branch,
                    branch+"perf-version-filter",
                    table_two[row1].versions,
                    `fetchVersionData(this, '${contentDiv.id}', '${branch}', '${versionStartsWith}')`,
                    htmlDashFilter
                );

                filterBlock.appendChild(versionFilter);
                title.appendChild(filterBlock);
                let perfBlock = document.createElement("div");
                perfBlock.style.overflowX = "auto";
                perfBlock.style.padding = "20px";
                perfBlock.id = branch+"perf-block";
                startPerfTableTwo(perfBlock, table_two[row1], contentDiv, "latest version", branch, versionStartsWith);
                contentDiv.appendChild(perfBlock);
            }
            else if (type == "system") {
                arrowBack.onclick = () => {
                    contentDiv.style.display = "flex";
                    startTableOne(table_one, table_two, contentDiv, bigCard, "system", branch, versionStartsWith);
                };
                contentDiv.style.display = "block";
                let table = document.createElement("table");
                table.setAttribute("class", "system-table");
                table.id = branch+"system-table";
                let caption = document.createElement("caption");
                caption.textContent = row1;
                table.appendChild(caption);
                let thead = document.createElement("thead");
                let typeHeadRow = document.createElement("tr");
                let spaceRow1 = spaceRow.cloneNode(true);
                let spaceRow2 = spaceRow.cloneNode(true);
                let cnHeadRow = document.createElement("tr");
                thead.appendChild(typeHeadRow);
                thead.appendChild(spaceRow1);
                thead.appendChild(cnHeadRow);
                thead.appendChild(spaceRow2);
                typeHeadRow.innerHTML = `<th class="horizontal-tb-label" style="font-weight: 200">Cluster Type:</th>`;
                cnHeadRow.innerHTML = `<th class="horizontal-tb-label" style="font-weight: 200"><div>Cluster Name:</div><div style="font-size: .98em">(Effective Version)</div></th>`;

                let tbody = document.createElement("tbody");
                let counter = 0;

                for (const tc of Object.keys(table_two[row1]["data"])) {
                    let row = document.createElement("tr");
                    tbody.appendChild(row);
                    row.innerHTML += `<th class="horizontal-tb-label">${tc}</th>`;
                    for (const typ of Object.keys(table_two[row1]["labels"])) {
                        let cluster_names = table_two[row1]["labels"][typ];
                        if (counter == 0) {
                            typeHeadRow.innerHTML += `<th colspan="${cluster_names.length}" style="border-left: 1px solid black">${typ}</th>`;
                        }
                        for (const cn of cluster_names) {
                            let cnHeadRowVal = `<th><div>${cn}</div><div></div></th>`;
                            if (table_two[row1]["data"][tc].hasOwnProperty(typ) && table_two[row1]["data"][tc][typ].hasOwnProperty(cn)) {
                                let status = getSystemDataEntry(table_two[row1]["data"][tc][typ][cn]["status"]);
                                let vers = table_two[row1]["data"][tc][typ][cn]["version"];
                                row.innerHTML += `<td style="background-color: ${getSystemColor(status)}">${status}</td>`;
                                cnHeadRowVal = `<th><div>${cn}</div><div style="font-size: .98em">( ${vers})</div></th>`;
                            } else {
                                row.innerHTML += `<td></td>`;
                            }
                            if (counter == 0) {
                                cnHeadRow.innerHTML += cnHeadRowVal;
                            }
                        }
                    }
                    counter += 1;
                }
                table.appendChild(thead);
                table.appendChild(tbody);
                contentDiv.appendChild(table);
            }
        };
        contentDiv.appendChild(clickableRow);
    }
};

const getPieData = (version, pipelineSet, data) => {
    let {status_counter, triage_counter, links, meta_data} = data["pipeline"];
    let target = "total";
    if (pipelineSet.size == 1) {
        target = Array.from(pipelineSet)[0]
    }
    let passed = 0;
    let notRun = 0;
    let failed = 0;
    let skipped = 0;
    if (status_counter[target]) {
        passed = status_counter[target].pass || 0;
        notRun = status_counter[target].notrun || 0;
        failed = status_counter[target].fail || 0;
        skipped = status_counter[target].skip || 0;
    }
    let prod = 0;
    let test = 0;
    let infr = 0;
    let undet = 0;
    let untri = 0;
    let link = links[target];
    if (meta_data && meta_data[target]) {
        for (const version of meta_data[target]["version"]) {
            link += "&version-starts-with=" + version;
        }
    }
    if (triage_counter[target]) {
        prod = triage_counter[target].product || 0;
        test = triage_counter[target].testcase || 0;
        infr = triage_counter[target].infra || 0;
        undet = triage_counter[target].undetermined || 0;
        untri = triage_counter[target].untriaged || 0;
    }

    let healthTotal = passed+notRun+failed+skipped;
    let passFailTotal = passed+failed;
    let triageTotal = prod + test + infr + undet + untri;

    const [success, fail, notrun, skip] = getGraphValues({vals: [passed, failed, notRun, skipped], total: healthTotal});
    const [successExec, failExec] = getGraphValues({vals: [passed, failed], total: passFailTotal});
    const [product, infra, testcase, undetermined, untriaged] = getGraphValues({vals: [prod, infr, test, undet, untri], total: triageTotal});
    return {
        healthTotal,
        passFailTotal,
        triageTotal,
        healthData: [
            {"label":"Success", "value": success, "num": passed},
            {"label":"Skip", "value": skip, "num": skipped},
            {"label":"Fail", "value": fail, "num": failed},
            {"label":"Not Run", "value": notrun, "num": notRun},
        ],
        healthDataPassFail: [
            {"label":"Success", "value": successExec, "num": passed},
            {"label":"Fail", "value": failExec, "num": failed},
        ],
        triageData: [
            {"label":"Product", "value": product, "num": prod},
            {"label":"Infra", "value": infra, "num": infr},
            {"label":"Test Case", "value": testcase, "num": test},
            {"label":"Undet", "value": undetermined, "num": undet},
            {"label":"Untriaged", "value": untriaged, "num": untri}
        ],
        link
    }
};

const getGraphBlock = ({branch, data, graphId, versionStartsWith, title, contentDiv, multi=true}) => {
    const pipelineSet = new Set(window.data.config.pipelines);
    let {healthData, healthDataPassFail, triageData, healthTotal, passFailTotal, triageTotal, link} = getPieData(
        branch, pipelineSet, data);
    let healthChartOneID = "health-chart-1" + graphId;
    let healthChartTwoID = "health-chart-2" + graphId;
    let triageID = "triage-chart" + graphId;

    let graphBlock = document.createElement('div');
    graphBlock.setAttribute("class", "data-card");
    console.log(multi);
    if (!multi) {
        graphBlock.style.display = "flex";
        graphBlock.style.paddingRight = "20px";
    }

    let halfTitle1 = document.createElement('div');
    halfTitle1.setAttribute("class", "big-card-title half-title");
    halfTitle1.innerHTML = title;

    let eHealthGraphContainer = document.createElement("div");
    eHealthGraphContainer.id = `${branch}-effective-health-graph`;
    eHealthGraphContainer.appendChild(halfTitle1);
    graphBlock.appendChild(eHealthGraphContainer);

    let halfTitle2 = document.createElement('div');
    halfTitle2.setAttribute("class", "big-card-title half-title");
    halfTitle2.textContent = "Failure Breakdown";

    let eTriageGraphContainer = document.createElement("div");
    eTriageGraphContainer.id = `${branch}-effective-triage-graph`;
    eTriageGraphContainer.appendChild(halfTitle2);
    graphBlock.appendChild(eTriageGraphContainer);

    let toggleExec = document.createElement("div");
    toggleExec.setAttribute("class","toggle-exec");
    toggleExec.setAttribute("id","toggle"+healthChartOneID);
    toggleExec.innerHTML = `<img src="/static/images/outline-check_box-24px.svg" class="filter" id="${graphId}-prune-check"/><span>Prune NotRun and Skip</span>`;
    toggleExec.onclick = () => {
        if (toggleExec.style.backgroundColor === "transparent") {
            document.getElementById(`${graphId}-prune-check`).setAttribute("src", "/static/images/outline-check_box-24px.svg");
            d3.select("#"+healthChartOneID).remove();
            d3.select("#tooltip" + healthChartOneID).remove();
            createPieChart(healthDataPassFail,eHealthGraphContainer,healthChartTwoID, passFailTotal, link, branch, versionStartsWith);
            toggleExec.style.removeProperty("background-color");
        } else {
            document.getElementById(`${graphId}-prune-check`).setAttribute("src", "/static/images/outline-check_box_outline_blank-24px.svg");
            d3.select("#" + healthChartTwoID).remove();
            d3.select("#tooltip" + healthChartTwoID).remove();
            createPieChart(healthData,eHealthGraphContainer,healthChartOneID, healthTotal, link, branch, versionStartsWith);
            toggleExec.style.backgroundColor = "transparent";
        }
    };

    let controlBar = document.createElement("div");
    controlBar.setAttribute("class", "control-bar");
    for (const pr of window.data.config.pipelines) {
        let button = document.createElement("div");
        button.setAttribute("class", "pipeline-button " + branch);
        button.innerHTML = `<img src="/static/images/outline-check_box-24px.svg" class="filter" id="${pr}-${graphId}-check"/><span>${pr}</span>`;
        button.onclick = () => {
            if (button.style.backgroundColor == "transparent") {
                button.style.removeProperty("background-color");
                document.getElementById(`${pr}-${graphId}-check`).setAttribute("src", "/static/images/outline-check_box-24px.svg");
                pipelineSet.add(pr);
            } else {
                pipelineSet.delete(pr);
                document.getElementById(`${pr}-${graphId}-check`).setAttribute("src", "/static/images/outline-check_box_outline_blank-24px.svg");
                button.style.backgroundColor = "transparent";
            }
            let healthChartOne = document.getElementById(healthChartOneID);
            let healthChartTwo = document.getElementById(healthChartTwoID);
            let triageChart = document.getElementById(triageID);
            if (pipelineSet.size === 0) {
                if (healthChartOne) {healthChartOne.style.opacity = 0}
                else {healthChartTwo.style.opacity = 0}
                triageChart.style.opacity = 0;
                toggleExec.style.display = "none";
                d3.select("#tooltip" + healthChartOneID).remove();
                d3.select("#tooltip" + healthChartTwoID).remove();
                d3.select("#tooltip" + triageID).remove();
            } else {
                if (healthChartOne) {healthChartOne.style.opacity = 1}
                else {healthChartTwo.style.opacity = 1}
                triageChart.style.opacity = 1;
                toggleExec.style.display = "flex";
                d3.select("#"+healthChartOneID).remove();
                d3.select("#tooltip" + healthChartOneID).remove();
                d3.select("#" + healthChartTwoID).remove();
                d3.select("#tooltip" + healthChartTwoID).remove();
                d3.select("#" + triageID).remove();
                d3.select("#tooltip" + triageID).remove();
                const {
                    healthData,
                    healthDataPassFail,
                    triageData,
                    healthTotal,
                    passFailTotal,
                    triageTotal,
                    link
                } = getPieData(branch, pipelineSet, data);
                if (toggleExec.style.backgroundColor !== "transparent") {
                    createPieChart(healthDataPassFail, eHealthGraphContainer, healthChartTwoID, passFailTotal, link, branch, versionStartsWith);
                } else {
                    createPieChart(healthData,eHealthGraphContainer,healthChartOneID, healthTotal, link, branch, versionStartsWith);
                }
                createPieChart(triageData, eTriageGraphContainer, triageID, triageTotal, link, branch, versionStartsWith);
                toggleExec.onclick = () => {
                    if (toggleExec.style.backgroundColor === "transparent") {
                        document.getElementById(`${graphId}-prune-check`).setAttribute("src", "/static/images/outline-check_box-24px.svg");
                        d3.select("#"+healthChartOneID).remove();
                        d3.select("#tooltip" + healthChartOneID).remove();
                        createPieChart(healthDataPassFail,eHealthGraphContainer,healthChartTwoID, passFailTotal, link, branch, versionStartsWith);
                        toggleExec.style.removeProperty("background-color");
                    } else {
                        document.getElementById(`${graphId}-prune-check`).setAttribute("src", "/static/images/outline-check_box_outline_blank-24px.svg");
                        d3.select("#" + healthChartTwoID).remove();
                        d3.select("#tooltip" + healthChartTwoID).remove();
                        createPieChart(healthData,eHealthGraphContainer,healthChartOneID, healthTotal, link, branch, versionStartsWith);
                        toggleExec.style.backgroundColor = "transparent";
                    }
                };
            }
        };
        controlBar.appendChild(button);
    }
    controlBar.appendChild(toggleExec);
    graphBlock.appendChild(controlBar);
    contentDiv.appendChild(graphBlock);
    createPieChart(healthDataPassFail,eHealthGraphContainer, healthChartTwoID, passFailTotal, link, branch, versionStartsWith);
    createPieChart(triageData,eTriageGraphContainer, triageID, triageTotal, link, branch, versionStartsWith);
    return graphBlock
}

const getRunByRunGraphBlock = ({graphId, branch, title, graphTitle, link, bigCard, versionStartsWith, contentDiv}) => {
    let graphBlock = document.createElement("div");
    let runGraphButton = document.createElement("div");
    runGraphButton.setAttribute("class", "graph-button");
    runGraphButton.textContent = title;
    runGraphButton.id = `${graphId}-button`;
    runGraphButton.onclick = () => {
        bigCard.removeChild(runGraphButton);
        contentDiv.appendChild(graphBlock);
        graphBlock.innerHTML = `<div class="small-loader" style="margin: 25px auto;"></div>`;
        graphBlock.setAttribute("class", "data-card run-graph");
        graphBlock.style.margin = "0 auto";
        graphBlock.style.padding = "100px 0px";
        graphBlock.style.width = "100%";
        let versionStartsWithQuery = "";
        if (versionStartsWith) {
            versionStartsWithQuery = "&version-starts-with=" + versionStartsWith;
        }
        fetch(`/${link}?start-date=`+window.data.config.startDate+"&branch="+branch+versionStartsWithQuery).then(
            rsp => rsp.json()
        ).then(
            data => {
                graphBlock.style.removeProperty("padding");
                graphBlock.style.removeProperty("margin");
                graphBlock.style.removeProperty("width");
                insertRunOverRunGraph(graphBlock, data.data, data.allversions, graphTitle);
            }
        )
    }
    return [graphBlock, runGraphButton]
}

function initializeBigCards(data, target_branch=null, versionStartsWith=null, target_category=null) {
    let cards = document.getElementsByClassName("card");
    for (let i = 0; i < cards.length; i++) {
        let id = cards[i].id;
        let [branch, title] = getBranchAndTitleFromId(id);
        if (target_branch && branch != target_branch.toString()) {
            continue;
        }
        if (target_category && title != target_category) {
            continue;
        }
        let bigCard = document.getElementById(id+"big-card");
        let plus = document.getElementById(id+"plus");
        let contentDiv = document.getElementById(id+"content-block");
        if (id.includes("pipeline")) {
            clearChildren(contentDiv);
            contentDiv.style.justifyContent = "space-around";

            let graphId = id.split(".").join("");
            let existingChild = document.getElementById(graphId+"-button");
            if (existingChild) {
                bigCard.removeChild(existingChild);
            }
            let title = "Effective Summary";

            let latestData = data["pipeline"]["latest_data"]
            let pieGraphBlock = getGraphBlock({branch, data, graphId, versionStartsWith, title, contentDiv, multi: Boolean(latestData)});

            let latestGraphId = graphId + "-latest";
            if (latestData) {
                let latestMetaData = latestData["meta_data"]
                let versionTitle = `<div style="position: absolute">`;
                for (const pr of Object.keys(latestMetaData)) {
                    versionTitle += `<div style="font-size: 14px">${pr}: <span style="margin-left: 4px; font-weight: 400">${latestMetaData[pr]["version"]}</span><span style="font-size: .92em; margin-left: 4px; color: rgb(50,130,150)">- ${latestMetaData[pr]["pipeline_completion_status"]}</span></div>`;
                }
                versionTitle += "</div>";
                existingChild = document.getElementById(latestGraphId+"-button");
                if (existingChild) {
                    bigCard.removeChild(existingChild);
                }
                let latestTitle = "Latest Run Summary" + versionTitle;
                let latestPieGraphBlock = getGraphBlock({branch, data: {pipeline: latestData}, graphId: latestGraphId, versionStartsWith, title: latestTitle, contentDiv});
            }
            const eGraphTitle = "See Effective Run by Run of CDM and CDM Basic";
            let [eGraphBlock, eRunGraphButton] = getRunByRunGraphBlock({graphId, contentDiv, branch, versionStartsWith, graphTitle: "Effective Run by Run", bigCard, title: eGraphTitle, link: "get_effective_pipeline_run_by_run"})
            let [lGraphBlock, lRunGraphButton] = getRunByRunGraphBlock({graphId: latestGraphId, contentDiv, branch, versionStartsWith, graphTitle: "Run by Run", bigCard, title: "See Run by Run of CDM and CDM Basic", link: "get_pipeline_run_by_run"})
            bigCard.appendChild(eRunGraphButton);
            bigCard.appendChild(lRunGraphButton);
        } else if (id.includes("performance")) {
            let targetVersion = versionStartsWith || branch;
            let table_one = data["performance"]["table_one"];
            let table_two = data["performance"]["table_two"];
            startTableOne(table_one, table_two, contentDiv, bigCard, "performance", branch, versionStartsWith);
        } else if (id.includes("system")) {
            let table_one = data["system"]["table_one"];
            let table_two = data["system"]["table_two"];
            let mainTable = document.getElementById(id+"content-block");
            startTableOne(table_one, table_two, contentDiv, bigCard, "system", branch, versionStartsWith);
        }
    }
    //logic to open big card if there is only one branch active
    if (cards.length == 3) {
        let event = new MouseEvent('click');
        cards[0].dispatchEvent(event);
    }
}

function createPieChart(data, element, id, total, link, branch, versionStartsWith) {
    var w = 420,
        h = 300,
        r = Math.min(w, h) / 2.5,
        labelr = r + 13, // radius for label anchor
        donut = d3.pie(),
        arc = d3.arc().innerRadius(r * .45).outerRadius(r);

    let versionStartsWithQuery = "";
    if (versionStartsWith && !link.includes("version-starts-with")) {
        versionStartsWithQuery="&version-starts-with="+versionStartsWith;
    }

    let tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip"+id);

    var vis = d3.select(element)
      .append("svg:svg")
        .data([data])
        .attr("width", w)
        .attr("height", h)
        .attr("class", "pie-adjust")
        .attr("id", id);

    var arcs = vis.selectAll("g.arc")
        .data(donut.value(function(d) {
            return d.value
         }).sort(null))
        .enter().append("svg:g")
        .attr("class", "arc")
        .attr("id", function(d) {
            return id+d.data.label
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', '3')
        .on("mousemove",function(d, i) {
            if (data[i].value == 0 || window.pieMiddleActivated) {
                return;
            }
            tooltip
            .html(`<div><span class="graph-tooltip-title">${data[i].label}:</span> ${data[i].value}%</div><div><span class="graph-tooltip-title">Count:</span> ${data[i].num}</div>`)
            .style("left", (d3.event.pageX+12) + "px")
            .style("top", (d3.event.pageY-10) + "px")
            .style("opacity", 1)
            .style("display","block");
            let parent = this;
            d3.selectAll(".arc").style("opacity", function () {
                return (this === parent) ? 1.0 : 0.4;
            });
        })
        .on("mouseout",function(){
            tooltip.html(" ").style("display","none");
            d3.selectAll(".arc").style("opacity", 1.0);
        })
        .on("click", (d,i) => {
            if (data[i].value == 0 || window.pieMiddleActivated) {
                return;
            }
            let s_date = document.getElementById("s_date");
            let time = s_date.value ? s_date.value : "4w";
            if (id.includes("health-chart")) {
                window.open(link + "&start-date=" +  time + "&focus=" + data[i].label + "&branch=" + branch + versionStartsWithQuery, "_blank");
            } else {
                window.open(link + "&start-date=" +  time + "&focus=Fail&triage=" + data[i].label + "&branch=" + branch + versionStartsWithQuery, "_blank");
            }
        })
        .attr("transform", "translate(" + (r + 90) + "," + (r+32) + ")");

    arcs.append("svg:path")
        .attr("fill", function(d, i) {
            if (data[i].label == "Success") {
                return "rgba(50,210,100, .72)";
            }
            if (data[i].label == "Not Run") {
                return "rgba(218,184,44, .78)";
            }
            if (data[i].label == "Fail") {
                return "rgba(247, 75, 95, .77)";
            }
            if (data[i].label == "Skip") {
                return "rgba(222, 222, 16, .77)";
            }
            return "rgba(230,230,230, .9)";
        })
        .attr("d", arc);

    arcs.append("svg:text")
        .attr("transform", function(d) {
            var c = arc.centroid(d),
                x = c[0],
                y = c[1],
                // pythagorean theorem for hypotenuse
                h = Math.sqrt(x*x + y*y);
            return "translate(" + (x/h * labelr) +  ',' +
               (y/h * labelr) +  ")";
        })
        .attr("class", "pie-text")
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) {
            // are we past the center?
            return (d.endAngle + d.startAngle)/2 > Math.PI ?
                "end" : "start";
        })
        .attr('stroke-width', '0')
        .html(function(d, i) {
            return d.value ? `<tspan style="margin-right: 4px">${data[i].label}: </tspan> ${d.value}%` : "";

        });

    d3.select("#" + id + data[0].label).append("svg:text")
        .attr("text-anchor","middle")
        .attr('class', 'middle-pie-text')
        .html(`<tspan style="margin-right: 4px">TC Count: </tspan> ${total}`)
        .on("mouseover", () => {
            window.pieMiddleActivated = true;
        })
        .on("mouseout", () => {
            window.pieMiddleActivated = false;
        })
        .on("click", () => {
            let s_date = document.getElementById("s_date");
            let time = s_date.value ? s_date.value : "4w";
            if (id.includes("health-chart-2")) {
                window.open(link + "&start-date=" + time + "&focus=Fail&focus=Success" + "&branch=" + branch + versionStartsWithQuery, "_blank");
            } else if (id.includes("health-chart")) {
                window.open(link + "&start-date=" + time + "&branch=" + branch + versionStartsWithQuery, "_blank");
            } else {
                window.open(link + "&start-date=" + time + "&focus=Fail" + "&branch=" + branch + versionStartsWithQuery, "_blank");
            }
        });
}

const insertRunOverRunGraph = (parent, data, domain, graphTitle) => {
    clearChildren(parent);
    parent.innerHTML = `<div class="big-card-title half-title">${graphTitle}</div>`;
    var width = 900;
    var height = 300;
    var margin = 50;
    var duration = 250;

    var lineOpacity = "0.25";
    var lineOpacityHover = "0.85";
    var otherLinesOpacityHover = "0.1";
    var lineStroke = "5px";
    var lineStrokeHover = "9px";

    var circleOpacity = '0.85';
    var circleOpacityOnLineHover = "0.25"
    var circleRadius = 6;
    var circleRadiusHover = 9;

    /* Scale */
    var xScale = d3.scalePoint()
      .domain(domain)
      .range([0, width-margin]);

    var yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height-margin, 0]);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    /* Add SVG */
    var svg = d3.select(parent).append("svg")
      .attr("width", (width+margin)+"px")
      .attr("height", (height+margin)+"px")
      .attr("viewBox", `0 0 ${width+margin} ${height+margin}`)
      .append('g')
      .attr("transform", `translate(${margin}, ${margin})`);

    let tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");


    /* Add line into SVG */
    var line = d3.line()
        .x(d => xScale(d.version))
        .y(d => yScale(d.value));

    let lines = svg.append('g')
      .attr('class', 'lines');

    lines.selectAll('.line-group')
      .data(data).enter()
      .append('g')
      .attr('class', 'line-group')
      .on("mouseover", function(d, i) {
          svg.append("text")
            .attr("class", "title-text")
            .style("fill", color(i))
            .text(d.name)
            .attr("text-anchor", "middle")
            .attr("x", (width-margin)/2)
            .attr("y", -20);
        })
      .on("mouseout", function(d) {
          svg.select(".title-text").remove();
        })
      .append('path')
      .attr('class', 'line')
      .attr('d', d => line(d.values))
      .style("stroke-width", lineStroke)
      .style('stroke', (d, i) => color(i))
      .style('opacity', lineOpacity)
      .style("fill", "none")
      .on("mouseover", function(d) {
          d3.selectAll('.line')
                        .style('opacity', otherLinesOpacityHover);
          d3.selectAll('.circle')
                        .style('opacity', circleOpacityOnLineHover);
          d3.select(this)
            .style('opacity', lineOpacityHover)
            .style("stroke-width", lineStrokeHover)
            .style("cursor", "pointer");
        })
      .on("mouseout", function(d) {
          d3.selectAll(".line")
                        .style('opacity', lineOpacity);
          d3.selectAll('.circle')
                        .style('opacity', circleOpacity);
          d3.select(this)
            .style("stroke-width", lineStroke)
            .style("cursor", "none");
        });


    /* Add circles in the line */
    lines.selectAll("circle-group")
        .data(data).enter()
        .append("g")
        .style("fill", (d, i) => color(i))
        .selectAll("circle")
        .data(d => d.values).enter()
        .append("g")
        .attr("class", "circle")
        .on("mouseover", function(d) {
            let topInfo = d.start_time ? `<span class="graph-tooltip-title">${d.value}%</span> on ${d.start_time} by ${d.title}` : `<span class="graph-tooltip-title">${d.value}%</span>`;
            let textContent = `<div>
                <div class="graph-text-format">${topInfo}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Total #:</span> ${d.total}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Pass #:</span> ${d.pass}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Fail #:</span> ${d.fail}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Skip #:</span> ${d.skip}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Notrun #:</span> ${d.notrun}</div>
            </div>`;
            tooltip
            .html(textContent)
            .style("left", (d3.event.pageX+12) + "px")
            .style("top", (d3.event.pageY-10) + "px")
            .style("opacity", 1)
            .style("display","block");
        })
        .on("mouseout", function(d) {
          tooltip.html(" ").style("display","none");
        })
        .append("circle")
        .attr("cx", d => xScale(d.version))
        .attr("cy", d => yScale(d.value))
        .attr("r", circleRadius)
        .style('opacity', circleOpacity)
        .on("mouseover", function(d) {
            d3.select(this)
              .transition()
              .duration(duration)
              .attr("r", circleRadiusHover);
          })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(duration)
                .attr("r", circleRadius);
        });


    /* Add Axis into SVG */
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale).ticks(10);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height-margin})`)
        .call(xAxis)
        .append("text")
        .attr("x", width-margin)
        .attr("y", 40)
        .attr("fill", "#000")
        .text("Versions");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append('text')
        .attr("y", -32)
        .attr("x", 15)
        .attr("transform", "rotate(-90)")
        .attr("fill", "#000")
        .text("Pass % including NotRun");
}
