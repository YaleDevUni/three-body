import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Circle class
class Circle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.mass = (Math.PI * radius * radius) / 50000; // calculate mass based on circle size
  }

  draw(svg, xScale, yScale) {
    const circle = svg
      .append("circle")
      .attr("cx", xScale(this.x))
      .attr("cy", yScale(this.y))
      .attr("r", this.radius)
      .style("fill", this.color);

    // add an arrow to represent the vector direction
    const arrow = svg
      .append("line")
      .attr("x1", xScale(this.x))
      .attr("y1", yScale(this.y))
      .attr("x2", xScale(this.x + this.velocity.x * 20))
      .attr("y2", yScale(this.y + this.velocity.y * 20))
      .style("stroke", "black")
      .style("stroke-width", 2);
  }

  update(circles) {
    for (let circle of circles) {
      if (circle !== this) {
        const dx = circle.x - this.x;
        const dy = circle.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy) + 1e-6; // add a small value to prevent division by zero
        const force = (this.mass * circle.mass) / (distance * distance);
        const angle = Math.atan2(dy, dx);
        const gravity = {
          x: force * Math.cos(angle),
          y: force * Math.sin(angle),
        };
        this.velocity.x += gravity.x / this.mass;
        this.velocity.y += gravity.y / this.mass;
        // update the velocity of the other circle as well
        circle.velocity.x -= gravity.x / circle.mass;
        circle.velocity.y -= gravity.y / circle.mass;
      }
    }
    // stabilize the simulation by ignoring small velocities
    if (Math.abs(this.velocity.x) < 1e-6) this.velocity.x = 0;
    if (Math.abs(this.velocity.y) < 1e-6) this.velocity.y = 0;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    console.log(this.x, this.y);
  }
}

// CoordinateGraph class
class CoordinateGraph {
  constructor(svg, xScale, yScale) {
    this.svg = svg;
    this.xScale = xScale;
    this.yScale = yScale;
    this.circles = [];
    this.running = false;
  }

  drawAxes() {
    this.svg
      .append("g")
      .attr("transform", `translate(0, ${this.yScale(0)})`)
      .call(d3.axisBottom(this.xScale));

    this.svg
      .append("g")
      .attr("transform", `translate(${this.xScale(0)}, 0)`)
      .call(d3.axisLeft(this.yScale));
  }

  addCircle(circle) {
    this.circles.push(circle);
    circle.draw(this.svg, this.xScale, this.yScale);
  }
  checkCollision() {
    for (let i = 0; i < this.circles.length; i++) {
      for (let j = i + 1; j < this.circles.length; j++) {
        const circle1 = this.circles[i];
        const circle2 = this.circles[j];
        const dx = circle2.x - circle1.x;
        const dy = circle2.y - circle1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < (circle1.radius + circle2.radius) * 0.045) {
          console.log(
            "distance",
            distance,
            (circle1.radius + circle2.radius) * 0.045
          );
          return true;
        }
      }
    }
    return false;
  }
  update() {
    if (this.running) {
      this.svg.selectAll("*").remove();
      this.drawAxes();
      for (let circle of this.circles) {
        circle.update(this.circles);
        circle.draw(this.svg, this.xScale, this.yScale);
      }
      if (this.checkCollision()) {
        this.running = false;
        console.log("Collision detected! Simulation stopped.");
      }
    }
  }

  start() {
    this.running = true;
    setInterval(() => {
      this.update();
    }, 1000 / 60);
  }

  getCircleData(id) {
    return {
      x: parseFloat(document.getElementById(`${id}-x`).value),
      y: parseFloat(document.getElementById(`${id}-y`).value),
      radius: parseFloat(document.getElementById(`${id}-radius`).value),
      velocity: {
        x: parseFloat(document.getElementById(`${id}-vector-x`).value),
        y: parseFloat(document.getElementById(`${id}-vector-y`).value),
      },
    };
  }

  // Function to update circle data
  updateCircle(circle, id) {
    const data = this.getCircleData(id);
    circle.x = data.x;
    circle.y = data.y;
    circle.radius = data.radius;
    circle.velocity = data.velocity;
  }

  // Function to draw circle
  drawCircle(circle, svg, xScale, yScale) {
    circle.draw(svg, xScale, yScale);
  }

  reset() {
    this.running = false;
    this.svg.selectAll("*").remove();
    this.drawAxes();

    const circles = [circle1, circle2, circle3];

    circles.forEach((circle, index) => {
      const id = `circle${index + 1}`;
      this.updateCircle(circle, id);
      this.drawCircle(circle, this.svg, this.xScale, this.yScale);
    });
  }
}

// Create the SVG
const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 500 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create the scales
const xScale = d3.scaleLinear().domain([-10, 10]).range([0, width]);

const yScale = d3.scaleLinear().domain([-10, 10]).range([height, 0]);

// Create the coordinate graph
const graph = new CoordinateGraph(svg, xScale, yScale);

// Draw the axes
graph.drawAxes();

// Create circles with default values
const circle1 = new Circle(
  parseFloat(document.getElementById("circle1-x").value),
  parseFloat(document.getElementById("circle1-y").value),
  parseFloat(document.getElementById("circle1-radius").value),
  "red",
  {
    x: parseFloat(document.getElementById("circle1-vector-x").value),
    y: parseFloat(document.getElementById("circle1-vector-y").value),
  }
);

const circle2 = new Circle(
  parseFloat(document.getElementById("circle2-x").value),
  parseFloat(document.getElementById("circle2-y").value),
  parseFloat(document.getElementById("circle2-radius").value),
  "green",
  {
    x: parseFloat(document.getElementById("circle2-vector-x").value),
    y: parseFloat(document.getElementById("circle2-vector-y").value),
  }
);

const circle3 = new Circle(
  parseFloat(document.getElementById("circle3-x").value),
  parseFloat(document.getElementById("circle3-y").value),
  parseFloat(document.getElementById("circle3-radius").value),
  "blue",
  {
    x: parseFloat(document.getElementById("circle3-vector-x").value),
    y: parseFloat(document.getElementById("circle3-vector-y").value),
  }
);

// Add circles to the graph
graph.addCircle(circle1);
graph.addCircle(circle2);
graph.addCircle(circle3);

// Create a run button to start the simulation
const runButton = d3
  .select("body")
  .append("button")
  .text("Run")
  .on("click", () => {
    graph.start();
  });

// Create a reset button to reset the simulation
const resetButton = d3
  .select("body")
  .append("button")
  .text("Set Initial Values")
  .on("click", () => {
    graph.reset();
  });
