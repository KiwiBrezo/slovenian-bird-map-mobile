import { Component, OnDestroy, OnInit } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import * as Leaflet from 'leaflet';
import * as $ from 'jquery';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {
  map: Leaflet.Map;
  userMarker: Leaflet.Marker;
  lastLat = 0.0;
  lastLon = 0.0;
  selectedLocationLat = null;
  selectedLocationLon = null;
  testData = [{
    id : -1,
    text : "Izberi opazovano ptico"
  },
  {
    id : 2,
    text : "Pananana"
  },
  {
    id : 3,
    text : "Cuzajaja"
  },
  {
    id : 4,
    text : "Suhatala"
  }]

  constructor(private geolocation: Geolocation) { }

  ngOnInit() { 
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
  }

  addObservation() {
    this.resetValues();
  }

  completeCustomLocationSelection() {

    this.showFormAfterLocationSelction();
  }

  cancelCustomLocationSelection() {
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
    this.selectedLocationLat = null;
    this.selectedLocationLon = null;
    $("#observationComment").val("");
    $("#observationNumber").val("1");

    $("#customLocationBtn").removeClass("active");
    $("#userLocationBtn").removeClass("active");
    $("#selectCustomLocationBtn").hide();
    $("#cancelCustomLocationBtn").hide();
  }

  ngOnDestroy() {
    this.map.remove();
  }
}
