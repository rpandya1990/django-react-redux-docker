function initializeButtons() {
    let versionButton = document.getElementById("version");
    let versionDropDown = document.getElementById("version-drop-down");
    let versionBlock = document.getElementById("version-block");
    let versionArrow = document.getElementById("version-arrow");
    let pipelineArrow = document.getElementById("pipeline-arrow");
    let pipelineButton = document.getElementById("pipeline");
    let pipelineDropDown = document.getElementById("pipeline-drop-down");
    let pipelineBlock = document.getElementById("pipeline-block");
    let topSelectBlock = document.getElementById("top-select-block");
    let topSelect = document.getElementById("top-select");
    let hideButton = document.getElementById("hide-button");
    let hideButtonTitle = document.getElementById("hide-button-title");
    let hideButtonArrow = document.getElementById("hide-button-arrow");
    let content = document.getElementById("content");

    let arrowLeft = '<i class="material-icons drop arrow">chevron_left</i>';
    let arrowRight = '<i class="material-icons drop arrow">chevron_right</i>';
    let versionTimeOut = null;
    versionBlock.onmouseenter = () => {
        window.clearTimeout(versionTimeOut);
        versionArrow.style.transform = "rotate(-90deg)";
        versionButton.style.color = "rgb(230,234,242)";
        versionButton.style.backgroundColor = "#2d3445";
        versionButton.style.border = "2px solid #2d3445;"
        versionDropDown.style.display = "block";
    };

    versionBlock.onmouseleave = () => {
        versionTimeOut = window.setTimeout(() => {
            versionArrow.style.transform = "rotate(90deg)";
            versionButton.style.removeProperty("color");
            versionButton.style.removeProperty("background-color");
            versionButton.style.removeProperty("border");
            versionButton.style.opacity = 1;
            versionDropDown.style.display = "none";
        }, 1000)
    };

    let pipelineTimeOut = null;
    pipelineBlock.onmouseenter = () => {
        window.clearTimeout(pipelineTimeOut);
        pipelineArrow.style.transform = "rotate(-90deg)";
        pipelineButton.style.color = "rgb(230,234,242)";
        pipelineButton.style.backgroundColor = "#2d3445";
        pipelineButton.style.border = "2px solid #2d3445;"
        pipelineDropDown.style.display = "block";
    };

    pipelineBlock.onmouseleave = () => {
        pipelineTimeOut = window.setTimeout(() => {
            pipelineArrow.style.transform = "rotate(90deg)";
            pipelineButton.style.removeProperty("color");
            pipelineButton.style.removeProperty("background-color");
            pipelineButton.style.removeProperty("border");
            pipelineButton.style.opacity = 1;
            pipelineDropDown.style.display = "none";
        }, 1000)
    };

    // product button functionality
//    var productButton = document.getElementById("product");
//
//    productButton.onclick = function() {
//        var tabs = document.getElementsByClassName("tab product");
//        var arrowLeft = 'Products <i class="material-icons drop arrow">arrow_left</i>';
//        var arrowRight = 'Products <i class="material-icons drop arrow">arrow_right</i>';
//        for (var i = 0; i < tabs.length; i++) {
//            if (tabs[i].style.display === "block") {
//                tabs[i].style.display = "none";
//            } else {
//                tabs[i].style.display = "block";
//            }
//        }
//        if (productButton.innerHTML == arrowLeft) {
//            productButton.innerHTML = arrowRight;
//        } else {
//            productButton.innerHTML = arrowLeft
//        }
//    };

    // time period button functionality
    var timeButton = document.getElementById("time");
    let startSec = document.getElementById("start");
    let startInput = document.getElementById("s_date");
    let endSec = document.getElementById("end");
    let endInput = document.getElementById("e_date");
    let timeSubmitButton = document.getElementById("submit-time");

//    timeButton.onclick = function() {
//        var arrowLeft = 'Time Period <i class="material-icons arrow">arrow_left</i>';
//        var arrowRight = 'Time Period <i class="material-icons arrow">arrow_right</i>';
//        if (timeButton.innerHTML == arrowLeft) {
//            startSec.style.display = "block";
//            endSec.style.display = "none";
//            timeSubmitButton.style.display = "block";
//            timeButton.innerHTML = arrowRight;
//        } else {
//            startSec.style.display = "none";
//            endSec.style.display = "none";
//            timeSubmitButton.style.display = "none";
//            timeButton.innerHTML = arrowLeft
//        }
//    }

    function submitTime() {
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
        window.open(url + "start-date=" + startInput.value, target="_blank");
    }
    startInput.addEventListener("keyup", (event) => {
        if (event.keyCode == 13) {
            submitTime();
        }
    });

    hideButton.onclick = () => {
        if (hideButtonTitle.textContent == "Hide") {
            topSelect.style.transform = "translateY(-50px)";
            hideButtonTitle.textContent = "Show";
            hideButtonArrow.style.transform = "rotate(90deg)";
            content.style.transform = "translateY(-40px)";
        } else {
            topSelect.style.transform = "translateY(0px)";
            hideButtonTitle.textContent = "Hide";
            hideButtonArrow.style.transform = "rotate(-90deg)";
            content.style.transform = "translateY(0px)"
        }
    }

}
