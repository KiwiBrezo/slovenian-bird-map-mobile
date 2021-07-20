import { Component, OnInit } from '@angular/core';
import { from, Observable } from 'rxjs';
import * as $ from 'jquery';

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
    var params = "userID=1&mobileToken=ac0a603a-8d55-4687-bae3-55199e216b6c";
    this.getUserObservationsRequest = new Promise(resolve => {
      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          resolve(JSON.parse(this.responseText));
        }
      };
      request.open("GET", "http://164.8.9.88:8080/slovenian-bird-map/api/mobile/getObservationForUser?" + params, true);
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
