import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

import { DataQuery } from '../dataQuery';
import { DailyDatum } from '../daily-datum';
import { State } from '../state';
import { CovidDataService } from '../covid-data.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-data-query',
  templateUrl: './data-query.component.html',
  styleUrls: ['./data-query.component.sass']
})

export class DataQueryComponent {

  constructor(private http:HttpClient, private dataService: CovidDataService) { }

  data: DailyDatum[] = [];
  states: State[] = [];

  private svg: any;
  private margin = 50;
  private width = 750 - (this.margin * 2);
  private height = 400 - (this.margin * 2);

  ngOnInit() {
    console.log('Init!');
    console.log(this.state.county_set);
    this.getStates();
  }

  private createSvg(): void {
    this.svg = d3.select("figure#bar")
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2))
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawBars(data: any[]): void {
    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, this.width])
      .domain(data.map((d: DailyDatum) => d.date))
      .padding(0.2);

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, 200000])
      .range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append("g")
      .call(d3.axisLeft(y));

    // Create and fill the bars
    this.svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d: DailyDatum) => x(d.date))
      .attr("y", (d: DailyDatum) => y(d.case_count))
      .attr("width", x.bandwidth())
      .attr("height", (d: DailyDatum) => this.height - y(d.case_count))
      .attr("fill", "#d04a35");
  }

  county: string = ""
  state: State = new State("Pennsylvania", [this.county])
  start = '2020-11-01'
  end = '2020-11-10'

  model = new DataQuery(this.start, this.end, this.county, this.state)

  submitted = false;

  getStates(): void {
    this.dataService.getStates()
      .subscribe(states => this.states = states);
  }

  getData(): void {
    this.dataService.getData(this.model)
      .subscribe(data => this.data = data);
  }

  onSubmit() {
    this.getData();
  }

  // TODO: Remove this when we're done
  get diagnostic() { return JSON.stringify(this.model); }
}
