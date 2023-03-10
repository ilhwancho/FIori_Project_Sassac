sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(BaseController) {
      "use strict";
  
      return BaseController.extend("project4.controller.App", {
        onInit() {
        },
        toCustomer : function (){
          this.getOwnerComponent().getRouter().navTo("Customer");
        },
        toGLAccount : function (){
          this.getOwnerComponent().getRouter().navTo("GLAccount");
        },
        toHome : function(){
          this.getOwnerComponent().getRouter().navTo("Home");

        }
      });
    }
  );
  