import { Component, OnDestroy, OnInit } from '@angular/core';
import * as Leaflet from 'leaflet';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {
  map: Leaflet.Map;

  constructor() { }

  ngOnInit() { 
    if (this.map == null) {
      this.leafletMap();
    }
  }

  leafletMap() {
    this.map = Leaflet.map('mapId').setView([46.119944, 15.005333], 8.85);
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  }

  ngOnDestroy() {
    this.map.remove();
  }

}
