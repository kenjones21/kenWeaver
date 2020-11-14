import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

import { DataQuery } from '../dataQuery'

@Component({
  selector: 'app-data-query',
  templateUrl: './data-query.component.html',
  styleUrls: ['./data-query.component.sass']
})

export class DataQueryComponent {

  constructor(private http:HttpClient) { }

  states = ['Pennsylvania', 'Texas', 'Ohio']
  counties = ['Montgomery', 'Philadelphia']
  start = '2020-11-01'
  end = '2020-11-10'

  model = new DataQuery(this.start, this.end, this.counties[0], this.states[0])

  submitted = false;

  constructUrl() {
    const base_url = "http://localhost:8000/covid/data/?"
    var params = new HttpParams();
    params = params.set("start", this.model.start);
    params = params.set("end", this.model.end);
    params = params.set("county", this.model.county);
    params = params.set("state", this.model.state);
    return base_url.concat(params.toString());
  }

  onSubmit() {
    console.log(this.diagnostic);
    var url = this.constructUrl();
    console.log(url);
    this.http.get(url, {responseType: 'text'})
      .subscribe((data: String) => console.log(data))
    }

  // TODO: Remove this when we're done
  get diagnostic() { return JSON.stringify(this.model); }
}
