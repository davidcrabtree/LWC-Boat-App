import { LightningElement, api, wire } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
  mapMarkers = [];
  isLoading = true;
  isRendered;
  latitude;
  longitude;
  
  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
  @wire(getBoatsByLocation,{latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId'})
  wiredBoatsJSON({error, data}) { 
    if (data) {
      const parseData = JSON.parse(data)
      console.log('boatsNearMe.wiredBoatsJSON: '+parseData)
      this.createMapMarkers(parseData);
    } else if (error) {
      const toastEvent = new ShowToastEvent({
        title:ERROR_TITLE,
        message:error,
        variant: ERROR_VARIANT
      })
      this.dispatchEvent(toastEvent);
      console.log('boatsNearMe.wiredBoatsJSON error'+error);
    }
    setTimeout(()=>{
    this.isLoading = false;}, 5000)
    console.log('boatsNearMe.wiredBoatsJSON exit');
  }
  
  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  renderedCallback() { 
    console.log('boatsNearMe.renderedCallback'+this.isRendered)
    if(!!this.isRendered == false){
      this.getLocationFromBrowser();
      console.log('boatsNearMe.renderedCallback in if: '+!!this.isRendered);
    }
    this.isRendered = true;
  }
  
  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() {
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(position=>{
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        console.log('boatsNearMe.getLocationFromBrowser: '+this.latitude)
      });
    }
  }
  
  // Creates the map markers
  createMapMarkers(boatData) {
     // const newMarkers = boatData.map(boat => {...});
     // newMarkers.unshift({...});
    const newMarkers = boatData.map(boat => {
      console.log('boatsNearMe.createMapMarkers: reached method');
      return{
        location:{
          'Longitude': boat.Geolocation__Longitude__s,
          'Latitude': boat.Geolocation__Latitude__s
        },
        title: boat.Name,
        icon: 'standard:location'
      };
    });
    newMarkers.unshift({
      location:{
        'Longitude': this.longitude,
        'Latitude': this.latitude
      },
      title: LABEL_YOU_ARE_HERE,
      icon: ICON_STANDARD_USER
    });
    this.mapMarkers = newMarkers;
    console.log('boatsNearMe.createMapMarkers: '+newMarkers);
  }
}