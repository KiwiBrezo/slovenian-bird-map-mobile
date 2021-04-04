import { Component, OnInit } from '@angular/core';
import { from, Observable } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  observations = [];
  userObservations: Observable<any>;
  getUserObservationsRequest: Promise<any>; 

  constructor() {
    var params = "userID=12&mobileToken=ab18a281-bb97-4e2d-87b5-2c3bceb08349";
    this.getUserObservationsRequest = new Promise(resolve => {
      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          resolve(JSON.parse(this.responseText));
        }
      };
      request.open("GET", "http://83.212.82.14:8080/api/mobile/getObservationForUser?" + params, true);
      request.send();
    });
  }

  ngOnInit() {
    this.userObservations = from(this.getUserObservationsRequest);
    this.userObservations.subscribe(data => {
      data.forEach(element => {
        element.date = new Date(element.date).toLocaleDateString().replace("/", ".").replace("/", ".");
        this.observations.push(element);
      });
    });
  }

}
