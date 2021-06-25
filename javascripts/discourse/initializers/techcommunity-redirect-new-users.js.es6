import { withPluginApi } from "discourse/lib/plugin-api";
import DiscourseURL from "discourse/lib/url";

export default {
  name: "techcommunity-redirect-new-users",
  initialize() {
    withPluginApi("0.8", (api) => {
        //Get the current User and return (break the execution) if User is not first time visitor.
        const current_user = api.getCurrentUser();
        //Below code will execute after rendering "header-notifications" widget. And if the User is first time visitor he will be redirected to the Goups page.
        api.decorateWidget("header-notifications:after", helper => {
            if (!current_user || current_user.read_first_notification || current_user.enforcedSecondFactor) {
                return "";
            }
            //Fetching Group names from current_user object [Added By: Saurabh, Date: 12/05/2021]
            var currentuserGroups = [];
            (current_user.groups).forEach(function (groupObj, index) {
                currentuserGroups.push(String(groupObj.name).toLowerCase());
            });
            //If User not belongs to alfabet-users group and are first-time visitor then redirect User to Groups page [Modified By: Saurabh, Date: 12/05/2021]
            if(currentuserGroups.indexOf(("alfabet-users").toLowerCase()) == -1){
                //If the User login First-time visitor then he will be redirect to Groups page.
                if (!helper.attrs.active && helper.attrs.ringBackdrop) {   
                    DiscourseURL.routeTo("/g");
                    return "";
                }
            }
        });
        // Override the showRequestMembershipForm method to auto-fill current User information for the membership request textarea field for the Downloads group. [Added By: Saurabh, Date: 31/05/2021]
        api.modifyClass("component:group-membership-button", { 
            checkNull(value){
                if(typeof(value) != "undefined" && value != null && value !='null'){
                    return value;
                } 
                return "";
            },
            actions: {
                showRequestMembershipForm() {
                  //Called super class showRequestMembershipForm action to grab the changes in discourse core.
                  this._super(...arguments);
                  // Our custom code for Auto-fill User information for the membership request textarea field for the Downloads group.
                  if (this.currentUser && this.model.name && this.model.name.toLowerCase() == "downloads") {
                    this.model.set("membership_request_template", "");
                    let groupMembershipObject = this;
                    let userFields = this.site.get("user_fields");
                    var currentusername = this.currentUser.username; 
                    if (currentusername  && typeof currentusername !== 'undefined'){
                      var fulllinktojson = "/users/" + currentusername + ".json"; 
                      $.ajax({
                        type: 'GET',
                        url: fulllinktojson,
                        dataType: 'json',
                        success: function(json) {
                            //Getting user-fields id to fetch user-fields of the current data
                            let countryFieldObj = userFields.find(obj => obj.name.toLowerCase() == ("Country").toLowerCase());
                            let stateFieldObj = userFields.find(obj => obj.name.toLowerCase() == ("State").toLowerCase());
                            let provinceFieldObj = userFields.find(obj => obj.name.toLowerCase() == ("Province").toLowerCase());
                            let firstnameFieldObj = userFields.find(obj => obj.name.toLowerCase() == ("First name").toLowerCase());
                            let lastnameFieldObj = userFields.find(obj => obj.name.toLowerCase() == ("Last name").toLowerCase());
                            let companyFieldObj = userFields.find(obj => obj.name.toLowerCase() == ("Company").toLowerCase());
                            let jobTitleFieldObj = userFields.find(obj => obj.name.toLowerCase() == ("Job Title").toLowerCase());
                            /*
                            ** Getting Current Login User Deatils.
                            */
                            //Email
                            var currentuserEmail = String(json.user.email);
                            //First Name
                            var currentuserFirstName = "";
                            if(firstnameFieldObj){ currentuserFirstName = groupMembershipObject.checkNull(String(json.user.user_fields[firstnameFieldObj.id])); }
                            //Last Name
                            var currentuserLastName = ""
                            if(lastnameFieldObj){ currentuserLastName = groupMembershipObject.checkNull(String(json.user.user_fields[lastnameFieldObj.id])); }
                            //Job Title
                            var currentuserJob = "";
                            if(jobTitleFieldObj){ currentuserJob = groupMembershipObject.checkNull(String(json.user.user_fields[jobTitleFieldObj.id])); }
                            //Country
                            var currentuserCountry = "";
                            if(countryFieldObj){ currentuserCountry = groupMembershipObject.checkNull(String(json.user.user_fields[countryFieldObj.id])); }
                            //Company
                            var currentuserCompany = "";
                            if(companyFieldObj){ currentuserCompany = groupMembershipObject.checkNull(String(json.user.user_fields[companyFieldObj.id])); }
                            // State
                            var currentuserState = "";
                            if(stateFieldObj){ currentuserState = groupMembershipObject.checkNull(String(json.user.user_fields[stateFieldObj.id])); }
                            // Province
                            var currentuserProvince = "";
                            if(provinceFieldObj){ currentuserProvince = groupMembershipObject.checkNull(String(json.user.user_fields[provinceFieldObj.id])); }
                            
                            //Setting membership_request_template value to auto-generated User details. This will display in the textarea of Request to Join Downloads dialog.
                            //Modified the membership_request_template value to display User details in well formated. [Modified by: Saurabh; Date: 24/06/2021]
                            groupMembershipObject.model.set("membership_request_template", "I’d like to download Software AG free trials from Tech Community, please find the details below:" 
                                                      + '\nFirst name: ' + ((currentuserFirstName == '') ? '-' : currentuserFirstName)
                                                      + '\nLast name: ' + ((currentuserLastName == '') ? '-' : currentuserLastName)
                                                      + '\nEmail: ' + ((currentuserEmail == '') ? '-' : currentuserEmail)
                                                      + '\nCountry: ' + ((currentuserCountry == '') ? '-' : currentuserCountry)
                                                      + '\nCompany: ' + ((currentuserCompany == '') ? '-' : currentuserCompany));
                        }
                      });
                    }
                  }
                },
            }
        });
        // Override the didInsertElement method of d-modal-body component to hide the Label and Textarea for the Request to downloads group dialog [Added by: Saurabh; Date: 24/06/2021]
        api.modifyClass("component:d-modal-body", {
            didInsertElement() {
              //Called super class didInsertElement method to grab the changes in discourse core.
              this._super(...arguments);
              
              // Our custom code for hiding Label and Textarea for the Request to downloads group dialog
              //If rendered dialog is for request-group-membership-form 
              if(this._target && this._target.get('modal') && this._target.get('modal').name == 'request-group-membership-form'){
                //If rendered request-group-membership-form dialog is for Downloads group then hide the label and textarea. 
                if(this._target.get('model') && this._target.get('model').name =='Downloads'){
                  $(".d-modal.request-group-membership-form-modal .control-group").hide();  
                }
              } 
            }  
        });
    });
  },
};
