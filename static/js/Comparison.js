const highlight = () => {
    for (const branch of window.data.config.branches.concat(window.data.config.pipelines)) {
        const checkBox = document.getElementById("check"+branch);
        let ele = document.getElementById(branch);
        ele.style.backgroundColor = "#2d3445";
        ele.style.color = "rgb(230,234,242)";
        checkBox.innerHTML = "check_box";
    }
};

const clearChildren = (node) => {
    while(node.firstChild) {
        node.removeChild(node.firstChild);
    }
};

const makeCategory = ({title}) => {
    const category = document.createElement("div");
    category.setAttribute("class", "category");
    category.id = title;
    const titleDiv = document.createElement("div");
    titleDiv.setAttribute("class", "title");
    titleDiv.textContent = title;
    category.appendChild(titleDiv);
    return category
};

const createBlock = ({category, props}) => {
    const div = document.createElement("div");
    div.id = category+"-table";
    div.setAttribute("class", "category-rows");
    div.setAttribute("class", "row-element");
    div.innerHTML = props["pretty"];
    return div
};

const createTables = (data) => {
    const content = document.getElementById("row-content");
    for (const category of Object.keys(data)) {
        let categoryEle = document.getElementById(category);
        if (!categoryEle) {
            categoryEle = makeCategory({title: category});
            content.appendChild(categoryEle);
        }
        let table = createBlock({category, props: data[category]});
        if (document.getElementById(category+"-table")) {
            categoryEle.removeChild(document.getElementById(category+"-table"));
        }
        categoryEle.appendChild(table);
    }
};

const nostraOnClick = (ele) => {
    const branch = ele.dataset.id;
    const loader = document.getElementById("loader");
    const modal = document.getElementById("modal");
    modal.style.display = "block";
    fetch("/get_nostradamus_data/?branch=" + branch).then(rsp => rsp.json()).then(
        msg => {
            loader.style.display = "none";
            createTables(msg);
        }
    )
}

const initializeSmallCards = (data, branch, categories) => {
    let cardHolder = document.getElementById(branch+"card-holder");
    for (const category of categories) {
        let categoryObj = data[category];
        let health = categoryObj["health"];
        let backgroundColor = "rgba(22,185,50, .72)";
        if (health < 60 || health == "fail") {
            backgroundColor = "rgba(237, 91, 74, .77)";
        } else if (health < 90) {
            backgroundColor = "rgba(255, 153, 20, .78)";
        }
        let healthIcon = health + "%";
        if (category == "performance" || category == "system") {
            healthIcon = `${categoryObj["failure_count"]} <i class="material-icons error-icon" >error_outline</i>`;
        }
        let date = `<span></span>`;
        if (categoryObj["period"]) {
            date = `<span>${categoryObj["period"]}</span>`;
        }
        let card = document.createElement("div");
        card.id = branch+category;
        card.setAttribute("class", "card");
        card.style.backgroundColor = backgroundColor;
        card.innerHTML += `
            <div class="title">${category.slice(0,1).toUpperCase()+category.slice(1)}</div>
            <div class="health">${healthIcon}</div>
            <div class="date">
                ${date}
            </div>
        `;
        cardHolder.replaceChild(card, document.getElementById(`${branch}${category}-loader`));
    }
    if (!document.getElementById(`${branch}nostra`)) {
        cardHolder.innerHTML += `
            <div style="display:flex;justify-content:center;margin-bottom: 15px">
                <a style="text-decoration: none;"  target="_blank" href="https://rubrik.atlassian.net/issues/?jql=project%20%3D%20CDM%20AND%20reporter%20%3D%20atlantis.bot%20ORDER%20BY%20created%20DESC" id="${branch}jira-breakdown" data-id="${branch}" class="nostradamus">
                    <div style="cursor: pointer" class="label">Jira Breakdown</div>
                </a>
                <div onclick="nostraOnClick(this)" id="${branch}nostra" data-id="${branch}" class="criteria nostradamus" style="margin-left: 10px;">
                    <div style="cursor: pointer" class="label">Release Criteria Report</div>
                </div>
            </div>
        `;
    }
};

const loadDashboard = (versionStartsWith=null, branches=window.data.config.branches) => {
    let versionStartsWithQuery = versionStartsWith ? "&version-starts-with=" + versionStartsWith : "";
    let pipelineQuery = window.data.config.pipelineQuery;
    let startDate = window.data.config.startDate;
    for (const branch of branches) {
        window.data.config[branch] = versionStartsWith;
        let targetVersion = versionStartsWith || branch;
        if (!window.data[targetVersion]) {
            window.data[targetVersion] = {}
        }
        let categories = Object.keys(window.data[targetVersion]);
        if (categories.length == 3) {
            initializeSmallCards(window.data[targetVersion], branch, categories);
            for (const category of categories) {
                initializeBigCards(window.data[targetVersion], branch, versionStartsWith, category);
            }
            continue
        }
        fetch("/get_performance_quality_info?branch="+branch+versionStartsWithQuery).then(
            rsp => rsp.json()
        ).then(data => {
            if (!document.getElementById(branch+"perf-block")) {
                document.getElementById(branch+"performancecontent-block").style.display = "flex";
            }
            Object.assign(window.data[targetVersion], data[branch]);
            if (window.data.config[branch] == versionStartsWith) {
                initializeSmallCards(window.data[targetVersion], branch, ["performance"]);
                initializeBigCards(window.data[targetVersion], branch, versionStartsWith, "performance");
            }
        })
        fetch("/get_pipeline_quality_info?branch="+branch+"&"+pipelineQuery+"&start-date="+startDate+versionStartsWithQuery).then(
            rsp => rsp.json()
        ).then(data => {
            Object.assign(window.data[targetVersion], data[branch]);
            if (window.data.config[branch] == versionStartsWith) {
                initializeSmallCards(window.data[targetVersion], branch, ["pipeline"]);
                initializeBigCards(window.data[targetVersion], branch, versionStartsWith, "pipeline");
            }
        })
        fetch("/get_system_quality_info?branch="+branch+versionStartsWithQuery).then(
            rsp => rsp.json()
        ).then(data => {
            if (!document.getElementById(branch+"system-table")) {
                document.getElementById(branch+"systemcontent-block").style.display = "flex";
            }
            Object.assign(window.data[targetVersion], data[branch]);
            if (window.data.config[branch] == versionStartsWith) {
                initializeSmallCards(window.data[targetVersion], branch, ["system"]);
                initializeBigCards(window.data[targetVersion], branch, versionStartsWith, "system");
            }
        })
    }
};

function initializeVersionComparison(startDate, pipelines) {
    var tabs = document.getElementsByClassName("tab version");
    let submitVersionsButton = document.getElementById("submit-versions");
    var compButton = document.getElementById("comp-version");
    for (let i = 0; i < tabs.length; i++) {
        let checkbox = document.getElementById("check"+tabs[i].id);
        tabs[i].onclick = function(event) {
            if (checkbox.innerHTML == "check_box") {
                checkbox.innerHTML = "check_box_outline_blank";
                tabs[i].style.removeProperty("background-color");
                tabs[i].style.removeProperty("color");
            } else {
                checkbox.innerHTML = "check_box";
                tabs[i].style.backgroundColor = "#2d3445";
                tabs[i].style.color = "white";
            }
        }
    }

    submitVersionsButton.onclick = () => {
        submitUrl(startDate);
    }

    let versionFilters = document.getElementsByClassName("specify-version-input");

    for (const versionFilter of versionFilters) {
        let version = versionFilter.dataset.id;
        let specifyVersion = document.getElementById(version+"specify-version");
        let specifyCancel = document.getElementById(version+"specify-cancel");
        versionFilter.onfocus = () => {
            versionFilter.value = versionFilter.value;
            let compStyles = window.getComputedStyle(specifyVersion);
            let fontSize = parseInt(compStyles.getPropertyValue("font-size"));
            if (!specifyVersion.style.top) {
                specifyVersion.style.top = "0px";
                specifyVersion.style.color = "#0cc2aa";
                specifyVersion.style.fontSize = (fontSize-fontSize/4)+"px";
            }
        }
        versionFilter.onkeyup = (e) => {
            if (e.target.value) {
                specifyCancel.style.display = "block";
            }
            if (e.key === "Enter") {
                let cardHolder = document.getElementById(version+"card-holder");
                let pipelineBigCard = document.getElementById(version+"pipelinebig-card");
                let runGraphButton = document.getElementById(version+"graph-button");
                clearChildren(cardHolder);
                if (runGraphButton) {
                    pipelineBigCard.removeChild(runGraphButton);
                }
                let loader = `<div class="loader" style="margin: 100px auto;"></div>`;
                for (const loaderId of ["pipeline-loader", "system-loader", "performance-loader"]) {
                    cardHolder.innerHTML += `<div class="small-loader" id=${version + loaderId} style="margin: 100px auto;"></div>`;
                }
                for (const contentBlock of document.getElementsByClassName(version + " content-block")) {
                    clearChildren(contentBlock);
                    contentBlock.innerHTML = loader;
                }
                loadDashboard(e.target.value, [version]);
            }
        }
        versionFilter.onblur = (e) => {
            if (!e.target.value) {
                specifyCancel.style.removeProperty("display");
                specifyVersion.style.removeProperty("top");
                specifyVersion.style.removeProperty("color");
                specifyVersion.style.removeProperty("font-size");
            }
        }
        specifyVersion.onclick = () => {
            versionFilter.focus();
            versionFilter.value = versionFilter.value;
        }
        specifyCancel.onclick = (e) => {
            versionFilter.value = "";
            versionFilter.focus();
            specifyCancel.style.removeProperty("display");
        }
    }

    highlight();
}

function initializePipelineComparison(startDate, branches) {
    var tabs = document.getElementsByClassName("tab pipeline");
    let submitPipelineButton = document.getElementById("submit-pipeline");
    var compButton = document.getElementById("comp-pipeline");
    let tabsHighlighted = new Set();
    for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].style.backgroundColor) {
            tabsHighlighted.add(tabs[i].id);
        }
    }
    for (let i = 0; i < tabs.length; i++) {
        let checkbox = document.getElementById("check"+tabs[i].id);
        tabs[i].onclick = function(event) {
            if (checkbox.innerHTML == "check_box") {
                checkbox.innerHTML = "check_box_outline_blank";
                tabs[i].style.removeProperty("background-color");
                tabs[i].style.removeProperty("color");
                tabsHighlighted.delete(tabs[i].id)
            } else {
                if (tabsHighlighted.size < 2) {
                    checkbox.innerHTML = "check_box";
                    tabs[i].style.backgroundColor = "#2d3445";
                    tabs[i].style.color = "white";
                    tabsHighlighted.add(tabs[i].id);
                }
            }
        }
    }
    submitPipelineButton.onclick = () => {
        submitUrl(startDate);
    }
    highlight();
}

const submitUrl = (startDate) => {
    let checkboxes = document.getElementsByClassName("check");
    let url = window.location.origin+"/QualityDashboard/"+"?";
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].innerHTML == "check_box") {
            if (checkboxes[i].dataset.id == "branch") {
                url += ("branch=" + checkboxes[i].getAttribute("data-value") + "&")
            } else if (checkboxes[i].dataset.id == "pipeline") {
                url += ("pipeline=" + checkboxes[i].getAttribute("data-value") + "&")
            }
        }
    }
    window.open(url + "start-date=" + startDate, target="_blank");
};

const getPipelines = () => {
    let url = "";
    let checkboxes = document.getElementsByClassName("check");
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].innerHTML == "check_box") {
            if (checkboxes[i].dataset.id == "pipeline") {
                url += ("pipeline=" + checkboxes[i].getAttribute("data-value") + "&")
            }
        }
    }
    return url
}
