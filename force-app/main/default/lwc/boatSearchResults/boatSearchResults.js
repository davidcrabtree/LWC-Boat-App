import { LightningElement, wire, track, api } from 'lwc';
import { MessageContext, publish } from 'lightning/messageService';
import {refreshApex} from '@salesforce/apex';
import {updateRecord} from 'lightning/uiRecordApi';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

import getBoats from '@salesforce/apex/BoatDataService.getBoats'
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c'
// ...
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';
const COLUMNS = [
  { label: 'Name', fieldName: 'Name', editable: true },
  { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
  { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
  { label: 'Description', fieldName: 'Description__c', editable: true }
];
export default class BoatSearchResults extends LightningElement {
  @api selectedBoatId;
  @api boatTypeId;
  @track boats;
  isLoading = false;
  @track draftValues = [];
  columns = COLUMNS;

  
  // wired message context
  @wire(MessageContext) messageContext;
  // wired getBoats method 
  @wire(getBoats,{boatTypeId: '$boatTypeId'})
  wiredBoats({error,data}) {
      if(data){
          this.boats = data;
          console.log('boatSearchResults.wiredBoats'+this.boatTypeId);
          console.log('boatSearchResults.wiredBoats'+data.value);
          this.notifyLoading(false);
      }else if (error){
        this.error = error;
        this.notifyLoading(false);
      }
  }
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api searchBoats(boatTypeId) {
    this.boatTypeId = boatTypeId;
    this.notifyLoading(true);
    console.log(this.boatTypeId +', '+ boatTypeId);
  }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api async refresh(){
    this.notifyLoading(true);
    await refreshApex(this.boats);
    console.log('boatSearchResults.refresh'+this.boats);
    this.notifyLoading(false);   
  }
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
      this.selectedBoatId = event.detail.boatId;
      this.sendMessageService(this.selectedBoatId);
   }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    // explicitly pass boatId to the parameter recordId
    const message ={
      recordId: boatId
    };
    console.log(message);
    publish(this.messageContext, BOATMC, message);
  }
  
  // This method must save the changes in the Boat Editor
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    const recordInputs = event.detail.draftValues.slice().map(draft => {
        const fields = Object.assign({}, draft);
        return { fields };
    });
    const promises = recordInputs.map(recordInput =>
            //update boat record
            updateRecord(recordInput)
        );
    Promise.all(promises)
        .then(() => {
          const toastEvent = new ShowToastEvent({
            title:SUCCESS_TITLE,
            message:MESSAGE_SHIP_IT,
            variant:SUCCESS_VARIANT
          })
          this.dispatchEvent(toastEvent);
          this.draftValues = [];
          this.refresh();
        })
        .catch(error => {
          const toastEvent = new ShowToastEvent({
            title:ERROR_TITLE,
            message: error.body.message,
            variant: ERROR_VARIANT
          })
          this.dispatchEvent(toastEvent);
        })
        .finally(() => {
          console.log('draftValues Cleared'+this.draftValues);
        });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    let status = isLoading ? 'loading' : 'doneloading';
    const loadEvent = new CustomEvent(status);
    this.dispatchEvent(loadEvent);
   }
}