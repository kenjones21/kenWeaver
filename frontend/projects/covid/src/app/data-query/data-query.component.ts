import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

import { DataQuery } from '../dataQuery';
import { DailyDatum } from '../daily-datum';
import { CovidDataService } from '../covid-data.service';

@Component({
  selector: 'app-data-query',
  templateUrl: './data-query.component.html',
  styleUrls: ['./data-query.component.sass']
})

export class DataQueryComponent {

  constructor(private http:HttpClient, private dataService: CovidDataService) { }

  data: DailyDatum[] = [];

  states = ['Pennsylvania', 'Texas', 'Ohio']
  counties = ['Montgomery', 'Philadelphia']
  start = '2020-11-01'
  end = '2020-11-10'

  model = new DataQuery(this.start, this.end, this.counties[0], this.states[0])

  submitted = false;

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
