import { Component, OnDestroy, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import * as Leaflet from 'leaflet';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {
  map: Leaflet.Map;

  constructor(private geolocation: Geolocation) { }

  ngOnInit() { 
    if (this.map == null) {
      this.leafletMap();
      
      this.geolocation.getCurrentPosition().then((resp) => {
        this.map.flyTo(new Leaflet.LatLng(resp.coords.latitude, resp.coords.longitude), 16);
      }).catch((error) => {
        console.log('Error getting location', error);
      });
    }
  }

  leafletMap() {
    this.map = Leaflet.map('mapId').setView([46.119944, 15.005333], 7);
    this.map.invalidateSize();
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  }

  ngOnDestroy() {
    this.map.remove();
  }
}
