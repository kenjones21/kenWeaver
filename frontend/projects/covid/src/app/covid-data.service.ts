import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DailyDatum } from './daily-datum';
import { DataQuery } from './dataQuery';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CovidDataService {

  constructor(private http:HttpClient) { }

  constructUrl(dataQuery: DataQuery) {
    const base_url = "http://localhost:8000/covid/data/?"
    var params = new HttpParams();
    params = params.set("start", dataQuery.start);
    params = params.set("end", dataQuery.end);
    params = params.set("county", dataQuery.county);
    params = params.set("state", dataQuery.state);
    return base_url.concat(params.toString());
  }

  getData(dataQuery: DataQuery): Observable<DailyDatum[]> {
    var url = this.constructUrl(dataQuery);
    return this.http.get<DailyDatum[]>(url)
  }
}
