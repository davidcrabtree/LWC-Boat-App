import { LightningElement,api,track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'

export default class BoatSearch extends NavigationMixin(LightningElement) {
    @api isLoading = false;
    @track boatTypeId = '';
    // Handles loading event
    handleLoading() {
      this.isLoading = true;
     }
    
    // Handles done loading event
    handleDoneLoading() {
      setTimeout(()=>{
        this.isLoading = false;}, 1000)
     }
    
    // Handles search boat event
    // This custom event comes from the form
    searchBoats(event) {
      this.handleLoading();
      this.boatTypeId = event.detail.boatTypeId;
      console.log(this.boatTypeId)
      this.template.querySelector('c-boat-search-results').searchBoats(this.boatTypeId);
      this.handleDoneLoading();
    }
    
    createNewBoat() {
      this[NavigationMixin.Navigate]({
        type:'standard__objectPage',
        attributes:{
          objectApiName: 'Boat__c',
          actionName: 'new'
        }
      })
     }
  }