import { withPluginApi } from "discourse/lib/plugin-api";
import DiscourseURL from "discourse/lib/url";

export default {
  name: "techcommunity-redirect-new-users",
  initialize() {
    withPluginApi("0.8", (api) => {      
        api.onPageChange((url) => {
          const firstNotificationTippy = document.querySelector(".d-header .d-header-icons + div[data-tippy-root]");
          const firstNotificationTippyArrow = document.querySelector(".d-header .d-header-icons + div[data-tippy-root] .tippy-svg-arrow");
          if(firstNotificationTippy) {
            if(/^\/g$/.test(url) || /^\/groups$/.test(url)){
            firstNotificationTippy.style.transform = "translate(-6px, 47px)";
            } else {
            firstNotificationTippy.style.transform = "translate(-119px, 47px)";
            }   
            firstNotificationTippyArrow.style.transform = "translate(326px, 0px)";
          } 
        });
        //Below code will execute after rendering "header-notifications" widget. And if the User is first time visitor he will be redirected to the Goups page.
         api.decorateWidget("header-notifications:after", helper => {
            const path = window.location.pathname;
            const attrs = helper.attrs;
            const { user } = attrs;
            
            if (!user ) {
              return "";
            }
            if(/^\/g$/.test(path) || /^\/groups$/.test(path)) {
              return "";
            }
           
            const seenUserTips = user.user_option.seen_popups || [];
            if (seenUserTips.includes(-1) || seenUserTips.includes(1)) {
              return;
            }
           
            let shouldRedirectToGroupPage = false;
            if (user && !user.read_first_notification && !user.enforcedSecondFactor && !attrs.active) {
              shouldRedirectToGroupPage = true;
            } else {
              return "";
            }
             
            if(localStorage.getItem("redirectToGroupPage" + user.id)) {
              return;
            }
            
            //Fetching Group names from current_user object [Added By: Saurabh, Date: 12/05/2021]
            var currentuserGroups = [];
            (user.groups).forEach(function (groupObj, index) {
                currentuserGroups.push(String(groupObj.name).toLowerCase());
            });
            //If User not belongs to alfabet-users group and are first-time visitor then redirect User to Groups page [Modified By: Saurabh, Date: 12/05/2021]
            if(currentuserGroups.indexOf(("alfabet-users").toLowerCase()) == -1){
              //If the User login First-time visitor then he will be redirect to Groups page.
              if(shouldRedirectToGroupPage) {
                localStorage.setItem("redirectToGroupPage" + user.id, "true");
                DiscourseURL.routeTo("/g");
                return "";
              }
            }
        });
    });
  },
};
