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
    });
  },
};
