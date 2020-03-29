import * as d3 from "d3";
import "d3-selection-multi";
import "d3-transition";


const statusColors = {
    pending: "rgb(230,230,230)",
    running: "#aec7e8",
    success: "#16b91e",
};

const createTextArea = (id, obj, lineHeight, main) => {
    const offset = lineHeight*(Object.keys(obj).length/2-1);

    let line = main.append("line")
        .attrs({
            x1: -25,
            x2: 0,
            y1: 0,
            y2: 0,
            stroke: "black",
            "stroke-width": 2,
            "transform": "translate(223,0)",
        });

    let textBlock = main.append("g")
        .attrs({
            "transform": "translate(250," + (-offset) + ")",
        })
        .styles({
            cursor: "pointer",
            "user-select": "none",
            opacity: 0
        });

    textBlock.transition()
        .duration(150)
        .ease(d3.easeLinear)
        .style("opacity", 1);

    let hiddenHover = textBlock.append("rect")
        .attrs({
            "transform": "translate(" + (-lineHeight) + "," + (-lineHeight-2) + ")",
            height: lineHeight*(Object.keys(obj).length+1) + "px",
            width: "600px",
            fill: "white",
            "fill-opacity": "0",
            stroke: "black",
        })
        .styles({
            cursor: "pointer",
        });

    let j = 0;
    for (const key in obj) {
        let tooltip = document.getElementById(id);
        if (key === "config") {
            hiddenHover.attrs({
                height: lineHeight*(Object.keys(obj).length) + "px",
            })
            .on("mousemove", () => {
                tooltip.style.top = d3.event.pageY+10 + "px";
                tooltip.style.left = d3.event.pageX+10 + "px";
                tooltip.style.display = "flex";
                if (!tooltip.innerHTML) {
                    tooltip.innerHTML = key + ": " + JSON.stringify(obj[key]);
                }
            })
            .on("mouseout", () => {
                tooltip.style.display = "none";
            })
            .on("click", () => {
                // to be added
            });
            textBlock.on("mousemove", () => {
                tooltip.style.top = d3.event.pageY+10 + "px";
                tooltip.style.left = d3.event.pageX+10 + "px";
                tooltip.style.display = "flex";
                if (!tooltip.innerHTML) {
                    tooltip.innerHTML = key + ": " + JSON.stringify(obj[key]);
                }
            })
            .on("mouseout", ()=> {
                tooltip.style.display = "none";
            })
            .on("click", () => {
                // to be added
            });
            continue
        }
        textBlock.append("text")
            .attrs({
                "class": "text",
                "text-anchor": "start",
                "transform": "translate(0," + (j*lineHeight) + ")",
            })
            .text(
                () => key + ": " + JSON.stringify(obj[key])
            );
        j += 1;
    }

};


const createConnectedNodes = (baseId, data) => {
    if (!data.length) {
        return;
    }

    var svg = d3.select("#"+ baseId)
        .append("svg");

    let start_y = 100;
    let new_y = 100;
    let const_x = 150;
    let radius = 25;
    let lineLength = 200;
    let lineHeight = 27;
    const tooltipId = "tt";

    // create tooltip
    let tooltip = document.createElement("div");
    tooltip.setAttribute("id", tooltipId);
    tooltip.style.position = "absolute";
    tooltip.style.display = "none";
    tooltip.style.padding = "10px";
    tooltip.style.backgroundColor = "white";
    tooltip.style.border = "1px solid black";
    tooltip.style.borderRadius = "5px";
    document.getElementsByTagName("body")[0].appendChild(tooltip);

    let start_node = svg.append("g");
    start_node.attr("transform", "translate(" + const_x + "," + start_y + ")")
        .attr("class", "first")
        .append("circle")
            .attrs({
                r: radius,
            })
            .styles({
                "fill": statusColors[data[0].status],
            });

    createTextArea(tooltipId, data[0], lineHeight, start_node, start_y);

    for (let i = 1; i < data.length; i++) {
        (() => {
            window.setTimeout(() => {
                // make line
                let line = svg.append("line")
                    .attrs({"stroke": statusColors[data[i-1].status], "stroke-width": 8})
                    .attr("x1", const_x)
                    .attr("y1", new_y += radius)
                    .attr("x2", const_x)
                    .attr("y2", new_y)
                    .transition()
                    .duration(800)
                    .ease(d3.easeQuadOut)
                    .attrs({
                        "x2": const_x,
                        "y2": new_y += lineLength
                    });
                // make circle
                new_y += radius;
                line.on("end", ((y) => {
                    return () => {
                        let g = svg.append("g");
                        g.attr("transform", "translate(" + const_x + "," + y + ")")
                            .attr("class", "first")
                            .append("circle")
                                .attrs({
                                    r: radius,
                                })
                                .styles({
                                    "fill": statusColors[data[i].status],
                                    "opacity": 0
                                })
                                .transition()
                                .duration(150)
                                .ease(d3.easeLinear)
                                .style("opacity", 1);
                        createTextArea(tooltipId, data[i], lineHeight, g);
                    }
                })(new_y));
            }, (i-1)*950)
        })();
    }

    svg.attrs({
        "height": data.length * 2 * radius + (data.length - 1) * lineLength + 2 * start_y,
        "width": "1000px"
    });
};

export default createConnectedNodes;
