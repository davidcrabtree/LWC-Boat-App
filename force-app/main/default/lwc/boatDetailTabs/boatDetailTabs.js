import { LightningElement, wire } from 'lwc';
import {getFieldValue, getRecord} from 'lightning/uiRecordApi';
import {APPLICATION_SCOPE, MessageContext, subscribe} from 'lightning/messageService';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat'; 
import labelDetails from '@salesforce/label/c.Details'; 
import labelReviews from '@salesforce/label/c.Reviews'; 
import labelAddReview from '@salesforce/label/c.Add_Review'; 
import labelFullDetails from '@salesforce/label/c.Full_Details'; 
import { NavigationMixin } from 'lightning/navigation';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
// Custom Labels Imports
// import labelDetails for Details
// import labelReviews for Reviews
// import labelAddReview for Add_Review
// import labelFullDetails for Full_Details
// import labelPleaseSelectABoat for Please_select_a_boat
// Boat__c Schema Imports
// import BOAT_ID_FIELD for the Boat Id
// import BOAT_NAME_FIELD for the boat Name

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
const UTILITY_ANCHOR = 'utility:anchor';
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  boatId;
  @wire(getRecord,{recordId: '$boatId',fields: BOAT_FIELDS})
  wiredRecord;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };
  
  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() { 
      if(this.wiredRecord.data){
          return UTILITY_ANCHOR;
      }else{
          return null;
      }
  }
  
  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() { 
      return getFieldValue(this.wiredRecord.data,BOAT_NAME_FIELD);
  }
  
  // Navigates to record page
  navigateToRecordViewPage() { 
      console.log('boatDetailTabs.navigateToRecordViewPage: '+this.boatId);
      this[NavigationMixin.Navigate]({
          type:'standard__recordPage',
          attributes:{
              recordId: this.boatId,
              actionName:'view'
          }
      });
  }
  
  // Navigates back to the review list, and refreshes reviews component
    handleReviewCreated() { 
        console.log('boatDetailsTabs.handleReviewCreated');
        this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
        console.log('boatDetailsTabs.handleReviewCreated2');
        this.template.querySelector('c-boat-reviews').refresh();
        console.log('boatDetailsTabs.handleReviewCreated3');
    }

    // Private
    subscription = null;
    //Message channel
    @wire(MessageContext)
    messageContext;
    subscribeMC(){
        if(!this.subscription){
            this.subscription = subscribe(
            this.messageContext,
            BOATMC,
            (message) => {this.boatId = message.recordId},
            {scope: APPLICATION_SCOPE}  
            );
        }
    }
    // Runs when component is connected, subscribes to BoatMC
    connectedCallback() {
        this.subscribeMC();
    }

}