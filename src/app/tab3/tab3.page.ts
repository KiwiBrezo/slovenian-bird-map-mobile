import { Component } from '@angular/core';
import { from, Observable } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  userData = {};
  userDataObservable: Observable<any>;
  getUserDataRequest: Promise<any>; 

  constructor() {
    var params = "userID=1";
    this.getUserDataRequest = new Promise(resolve => {
      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          resolve(JSON.parse(this.responseText));
        }
      };
      request.open("GET", "http://164.8.9.88:8080/slovenian-bird-map/api/analysis/user/getNumberOfObservations?" + params, true);
      request.send();
    });
  }

  ngOnInit() {
    this.userDataObservable = from(this.getUserDataRequest);
    this.userDataObservable.subscribe(data => {
      this.userData = data;
    });
  }
}
