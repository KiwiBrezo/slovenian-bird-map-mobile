import { Component, OnDestroy, OnInit } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import * as Leaflet from 'leaflet';
import * as $ from 'jquery';
import { Observable } from 'rxjs';
import { from } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {
  map: Leaflet.Map;
  userMarker: Leaflet.Marker;
  locationSelectorMarker: Leaflet.CircleMarker;
  
  lastLat = 0.0;
  lastLon = 0.0;
  selectLocationEvent = false;
  selectedLocationLat = null;
  selectedLocationLon = null;
  
  birdData = [{
    id: -1,
    text: "Ni podatkov..."
  }];

  allBirdsObservable: Observable<any>;
  allBirdsRequest = new Promise(resolve => {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        resolve(JSON.parse(this.responseText));
      }
    };
    request.open("GET", "http://83.212.82.14:8080/api/mobile/getAllBirds", true);
    request.send();
  });

  constructor(private geolocation: Geolocation) { }

  ngOnInit() { 

    this.allBirdsObservable = from(this.allBirdsRequest);

    this.allBirdsObservable.subscribe(data => {
      var tmpList = [];
      data.forEach(elemt => {
        tmpList.push({
          id: elemt.birdID,
          text: elemt.name
        });
      });

      this.birdData = tmpList;
    }, err => {
      console.log(err);
    });

    if (this.map == null) {
      this.leafletMap();
      
      this.geolocation.getCurrentPosition().then((resp) => {
        this.map.flyTo(new Leaflet.LatLng(resp.coords.latitude, resp.coords.longitude), 16);

        var smallIcon = new Leaflet.Icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
          iconSize:    [25, 41],
          iconAnchor:  [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          shadowSize:  [41, 41]
        });

        this.userMarker = Leaflet.marker(new Leaflet.LatLng(resp.coords.latitude, resp.coords.longitude), { title: "User location", icon: smallIcon }).addTo(this.map);
        this.lastLat = resp.coords.latitude;
        this.lastLon = resp.coords.longitude;

        var watcher = this.geolocation.watchPosition();
        watcher.subscribe((data) => {
          if (this.lastLat != (data as Geoposition).coords.latitude || this.lastLon != (data as Geoposition).coords.longitude) {
            this.userMarker.setLatLng(new Leaflet.LatLng((data as Geoposition).coords.latitude, (data as Geoposition).coords.longitude));
            this.map.panTo(new Leaflet.LatLng((data as Geoposition).coords.latitude, (data as Geoposition).coords.longitude));
            this.lastLat = (data as Geoposition).coords.latitude;
            this.lastLon = (data as Geoposition).coords.longitude;
          }
        });
      }).catch((error) => {
        console.log('Error getting location', error);
      });
    }
  }

  leafletMap() {
    this.map = Leaflet.map('mapId').setView([46.119944, 15.005333], 7);
    this.map.invalidateSize();
    this.map.doubleClickZoom.disable(); 
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    this.map.on("click", <LeafletMouseEvent>(e) => {
      if (this.selectLocationEvent) {
        this.selectedLocationLat = e.latlng.lat;
        this.selectedLocationLon = e.latlng.lng;
        
        if (this.locationSelectorMarker != null) {
          this.map.removeLayer(this.locationSelectorMarker);
        }
        this.locationSelectorMarker = new Leaflet.CircleMarker(e.latlng, {radius: 10});
        this.map.addLayer(this.locationSelectorMarker);
      }
    });
  }

  showAddObservationDialog() {
    this.resetValues();
    $("#addObservationBtn").hide();
    $("#formDialog").show();
  }

  closeForm() {
    $("#addObservationBtn").show();
    $("#formDialog").hide();
    this.resetValues();
  }

  selectUsersLocation() {
    this.selectedLocationLat = this.lastLat;
    this.selectedLocationLon = this.lastLon;

    $("#customLocationBtn").removeClass("active");
    $("#userLocationBtn").addClass("active");
  }

  selectCustomLocation() {
    this.hideFormForLocationSelection();
    $("#customLocationBtn").addClass("active");
    $("#userLocationBtn").removeClass("active");
    this.selectLocationEvent = true;
  }

  addObservation() {
    var date = new Date();
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0');
    var yyyy = date.getFullYear();
    var todayDate = yyyy + "-" + mm + "-" + dd;

    var formData = new FormData();
    formData.append("birdID", <any>$("#birdSelector").find(":selected").val());
    formData.append("userID", <any>(12));
    formData.append("comment", <any>$("#observationComment").val());
    formData.append("col", <any>$("#observationNumber").val()); 
    formData.append("lon", <any>this.selectedLocationLon);
    formData.append("lat", <any>this.selectedLocationLat);
    formData.append("date", <any>todayDate); 

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText);
        Tab1Page.prototype.resetValues();
      }
    };
    request.open("POST", "http://83.212.82.14:8080/api/addObservation", true);
    request.send(formData);
  }

  completeCustomLocationSelection() {
    this.showFormAfterLocationSelction();
  }

  cancelCustomLocationSelection() {
    if (this.locationSelectorMarker != null) {
      this.map.removeLayer(this.locationSelectorMarker);
    }
    this.selectLocationEvent = false;
    this.selectedLocationLat = null;
    this.selectedLocationLon = null;
    $("#customLocationBtn").removeClass("active");
    this.showFormAfterLocationSelction();
  }

  hideFormForLocationSelection() {
    $("#formDialog").hide();
    $("#selectCustomLocationBtn").show();
    $("#cancelCustomLocationBtn").show();
  }

  showFormAfterLocationSelction() {
    $("#selectCustomLocationBtn").hide();
    $("#cancelCustomLocationBtn").hide();
    $("#formDialog").show();
  }

  resetValues() {
    this.selectLocationEvent = false;
    this.selectedLocationLat = null;
    this.selectedLocationLon = null;
    $("#observationComment").val("");
    $("#observationNumber").val(1);

    $("#customLocationBtn").removeClass("active");
    $("#userLocationBtn").removeClass("active");
    $("#selectCustomLocationBtn").hide();
    $("#cancelCustomLocationBtn").hide();
    if (this.locationSelectorMarker != null) {
      this.map.removeLayer(this.locationSelectorMarker);
    }
  }

  ngOnDestroy() {
    this.map.remove();
  }
}
