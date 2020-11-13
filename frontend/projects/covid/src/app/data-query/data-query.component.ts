import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

    onSubmit() {
	console.log(this.diagnostic);
	this.http.get('http://localhost:8000/hello/', {responseType: 'text'})
	    .subscribe((data: String) => console.log(data))
    }

  // TODO: Remove this when we're done
  get diagnostic() { return JSON.stringify(this.model); }
}
