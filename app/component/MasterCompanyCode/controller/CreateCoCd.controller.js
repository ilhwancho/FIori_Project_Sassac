sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",


], function (Controller,
	JSONModel,
	MessageBox,
	Filter,
	FilterOperator
) {
  "use strict";

  let now = new Date(),
  Today = now.getFullYear() + "." +(now.getMonth() + 1).toString().padStart(2,'0') + "." +now.getDate().toString().padStart(2,'0');

  return Controller.extend("project4.controller.CreateCoCd", {

    onInit: async function () {
      this.getOwnerComponent().getRouter().attachRoutePatternMatched(this.onMyRoutePatternMatched, this);


    },

    onMyRoutePatternMatched: async function () {
      //국가 지역 데이터 불러오기
      const CountryList = await $.ajax({
        type: "GET",
        url: "/bp/BP_Nation_Region"
      });
      let CoCdCountryModel = new JSONModel(CountryList.value);
      this.getView().setModel(CoCdCountryModel, "CoCdCountryModel");

      const GLSelectCoA = await $.ajax({
				type: "get",
				url: "/gl/SelectCoA"
			});
      let SelectCoAModel = new JSONModel(GLSelectCoA.value);
			this.getView().setModel(SelectCoAModel, "SelectCoAModel");
      
      const CoCdSelectFY = await $.ajax({
				type: "get",
				url: "/cocd/CoCd_Fis_Y_Variant"
			});
      let SelectCoCdFYModel = new JSONModel(CoCdSelectFY.value);
			this.getView().setModel(SelectCoCdFYModel, "SelectCoCdFYModel");

      const CoCdSelectCoArea = await $.ajax({
				type: "get",
				url: "/cocd/CoCd_Co_Area"
			});
      let SelectCoAreaModel = new JSONModel(CoCdSelectCoArea.value);
			this.getView().setModel(SelectCoAreaModel, "SelectCoAreaModel");

      this.byId("CoCdDate").setText(Today);


    },
    onCreate: async function () {
    var check = await this.validateForVbox("generalData");
    var check2 = await this.validateForVbox("generateData");
    var check3 = await this.validateForVbox("fiData");
    if(check===true || check2===true || check3 === true){
      return;
    } else {

      var temp = {
        com_code: this.byId("CoCdCod").getValue(),
        com_code_name: this.byId("CoCdName").getValue(),
        com_city: this.byId("CoCdCity").getValue(),
        com_country: this.byId("CoCdCountry").getValue(),
        com_currency: this.byId("CoCdCurrency").getSelectedKey(),
        com_language: this.byId("CoCdLanguage").getSelectedKey(),
        com_coa: this.byId("CoCdCoa").getValue(),
        com_co_area: this.byId("CoCdCoArea").getValue(),
        com_address: this.byId("CoCdAddress").getValue(),
        com_fiscal_year: this.byId("CoCdFiscalYear").getValue(),
        com_cocd_tax_code: this.byId("CoCdTaxCode").getSelectedKey(),
        com_cocd_constructor: this.byId("CoCdConstructor").getValue(),
        com_cocd_date: this.byId("CoCdDate").getText()
      }
        await $.ajax({
          type: "POST",
          url: "/cocd/CoCd",
          contentType: "application/json;IEEE754Compatible=true",
          data: JSON.stringify(temp)
        });
        this.onCancel();
        
      }
    },
    clearField: function () {
      this.byId("CoCdCod").setValue(""),
        this.byId("CoCdName").setValue(""),
        this.byId("CoCdCity").setValue(""),
        this.byId("CoCdCountry").setValue(""),
        this.byId("CoCdCurrency").setSelectedKey(""),
        this.byId("CoCdLanguage").setSelectedKey(""),
        this.byId("CoCdCoa").setValue(""),
        this.byId("CoCdCoArea").setValue(""),
        this.byId("CoCdAddress").setValue(""),
        this.byId("CoCdFiscalYear").setValue(""),
        this.byId("CoCdTaxCode").setSelectedKey(""),
        this.byId("CoCdConstructor").setValue("")
    },

    //국가 선택용 다이어로그 열기
    onSelectCountry: function () {
      if (!this.pDialog) {
        this.pDialog = this.loadFragment({
          name: "project4.view.fragment.InputSingleCountry"
        });
      }
      this.pDialog.then(function (oDialog) {
        oDialog.open();
      });
    },

    //국가 선택용 다이어로그 close 함수
    onCloseCountryDialog: function () {
      this.byId("CountryDialog").destroy();
      this.pDialog = null;
    },
    // 국가 선택용 다이어로그 search 함수
    onSearchCountryDialog: function () {
      var SearchInputCountry = this.byId("SearchInputCountry").getValue();
      var aFilter = [];

      if (SearchInputCountry) {
        aFilter = new Filter({
          filters: [
            new Filter("bp_nation", FilterOperator.Contains, SearchInputCountry),
            new Filter("bp_nation_code", FilterOperator.Contains, SearchInputCountry),
          ],
          and: false
        });
      }

      let oTable = this.byId("CountrySelectTable").getBinding("rows");
      oTable.filter(aFilter);

    },

    // 국가 선택용 다이어로그 검색창 clear용 함수
    onSearchCountryReset: function () {
      this.byId("SearchInputCountry").setValue("");
      this.onSearchCountryDialog();
    },

    // 국가 선택용 다이어로그 특정 row 선택 시 생성 페이지 Input에 값 입력
    getCountryContext: function (oEvent) {
      // let rowIndex = oEvent.getParameters().rowIndex;
			let rowIndex = oEvent.getParameters().rowBindingContext.sPath.split('/')[1];
			this.byId("CoCdCountry").setValue(oEvent.getParameters().rowBindingContext.oModel.oData[rowIndex].bp_nation_code); 
      this.onCloseCountryDialog();

    },
    onCancel: function () {
      this.clearField()
      this.onBack();
    },

    onBack: function () {
      this.clearField()
      this.getOwnerComponent().getRouter().navTo("CompanyCodeList");
      this.validateForVboxClear("generalData");
			this.validateForVboxClear("generateData");
			this.validateForVboxClear("fiData");

    },

		onSelectFiscalYear: function(oEvent) {
			
		},

    //계정과목표 선택용 fragment 함수
		onSelectCoA: function(oEvent) {
			if(!this.pDialog){
				this.pDialog = this.loadFragment({
					name:"project2.view.fragment.CreateInputCoA"
				});
			}
			this.pDialog.then(function(oDialog){
				oDialog.open();
			});  
		},
    onSearchCoADialog: function() {
			var SearchInputCoA = this.byId("SearchInputCoA").getValue();
			var aFilter = [];

			if (SearchInputCoA) {
				aFilter = new Filter({
					filters: [
						new Filter("gl_coa", FilterOperator.Contains, SearchInputCoA),
						new Filter("gl_coa_content", FilterOperator.Contains, SearchInputCoA)
					],
					and: false
				});
			}

			let oTable = this.byId("CoASelectTable").getBinding("rows"); 
            oTable.filter(aFilter);
		},

		onSearchCoAReset: function() {
			this.byId("SearchInputCoA").setValue("");
			this.onSearchCoADialog();
		},

		onCloseCoADialog: function() {
			this.byId("CoADialog").destroy();
			this.pDialog = null;
		},
    getCoAContext: function(oEvent) {
			// let rowIndex = oEvent.getParameters().rowIndex;
			let rowIndex = oEvent.getParameters().rowBindingContext.sPath.split('/')[1];
			this.byId("CoCdCoa").setValue(oEvent.getParameters().rowBindingContext.oModel.oData[rowIndex].gl_coa); 
			this.onCloseCoADialog();
		},

    //회계연도 오브젝트 선택 fragment
		onSelectFiscalYear: function() {
      if(!this.pDialog){
				this.pDialog = this.loadFragment({
					name:"project4.view.fragment.CreateInputCoCdFiscalYear"
				});
			}
			this.pDialog.then(function(oDialog){
				oDialog.open();
			});  

		},


    onSearchCoCdFYDialog: function() {
			var SearchInputCoCdFY = this.byId("SearchInputCoCdFY").getValue();
			var aFilter = [];

			if (SearchInputCoCdFY) {
				aFilter = new Filter({
					filters: [
						new Filter("com_fiscal_year", FilterOperator.Contains, SearchInputCoCdFY),
						new Filter("com_fiscal_year_variant_name", FilterOperator.Contains, SearchInputCoCdFY)
					],
					and: false
				});
			}

			let oTable = this.byId("CoCdFYSelectTable").getBinding("rows"); 
            oTable.filter(aFilter);
		},

		onSearchCoCdFYReset: function() {
			this.byId("SearchInputCoCdFY").setValue("");
			this.onSearchCoCdFYDialog();
		},

		onCloseCoCdFYDialog: function() {
			this.byId("CoCdFYDialog").destroy();
			this.pDialog = null;
		},
    getCoCdFYContext: function(oEvent) {
			// let rowIndex = oEvent.getParameters().rowIndex;
      let rowIndex = oEvent.getParameters().rowBindingContext.sPath.split('/')[1];

			this.byId("CoCdFiscalYear").setValue(oEvent.getParameters().rowBindingContext.oModel.oData[rowIndex].com_fiscal_year); 
			this.onCloseCoCdFYDialog();
		},


    //관리회계영역 fragment용 함수
    onSelectCoArea: function() {
      if(!this.pDialog){
				this.pDialog = this.loadFragment({
					name:"project4.view.fragment.CreateInputCoCdCoArea"
				});
			}
			this.pDialog.then(function(oDialog){
				oDialog.open();
			});  

		},


    onSearchCoAreaDialog: function() {
			var SearchInputCoCarea = this.byId("SearchInputCoCarea").getValue();
      console.log(SearchInputCoCarea);
			var aFilter = [];

      console.log(SearchInputCoCarea);

			if (SearchInputCoCarea) {
				aFilter = new Filter({
					filters: [
						new Filter("com_co_area", FilterOperator.Contains, SearchInputCoCarea),
						new Filter("com_co_area_content", FilterOperator.Contains, SearchInputCoCarea)
					],
					and: false
				});
			}
      console.log(aFilter);
			let oTable = this.byId("CoAreaSelectTable").getBinding("rows"); 
            oTable.filter(aFilter);
		},

		onSearchCoAreaReset: function() {
			this.byId("SearchInputCoCarea").setValue("");
			this.onSearchCoAreaDialog();
		},

		onCloseCoCdCoAreaDialog: function() {
			this.byId("CoCdCoAreaDialog").destroy();
			this.pDialog = null;
		},
    getCoAreaContext: function(oEvent) {
			// let rowIndex = oEvent.getParameters().rowIndex;
      let rowIndex = oEvent.getParameters().rowBindingContext.sPath.split('/')[1];

			this.byId("CoCdCoArea").setValue(oEvent.getParameters().rowBindingContext.oModel.oData[rowIndex].com_co_area); 
			this.onCloseCoCdCoAreaDialog();
		},
    validateForVbox:function(sParam){
			var check=false;
			var item =this.byId(sParam).mAggregations.items;
			for(var i=0;i<item.length;i++){
				// console.log(item[i].mAggregations);
				var vboxitem = item[i].mAggregations.items;
				for(var j=0;j<vboxitem.length;j++){
					var element_type = vboxitem[j].getMetadata().getName().split('.')[2];
					if (element_type == 'Input'|| element_type=='DatePicker'||element_type == 'ComboBox') {
                        vboxitem[j].setValueState("None");
                        vboxitem[j].setValueStateText(null);
                        if (vboxitem[j].mProperties.required == true) {
                            var element_value = vboxitem[j].mProperties.value;
                            if(element_value ==''||element_value==null||element_value==undefined){
								check=true;
                                vboxitem[j].setValueState("Error");
                                vboxitem[j].setValueStateText("필수 값을 입력해주세요.");
                            }
                        }
                    }
					else if (element_type == 'Select') {
            console.log(element_value);

                        vboxitem[j].setValueState("None");
                        vboxitem[j].setValueStateText(null);
                        if (vboxitem[j].mProperties.required == true) {
                            var element_value = vboxitem[j].mProperties.selectedKey;
                            if(element_value ==''||element_value==null||element_value==undefined){
								                check=true;
                                vboxitem[j].setValueState("Error");
                                vboxitem[j].setValueStateText("필수 값을 입력해주세요.");
                            }
                        }
                    }
				}
			}
			return check;
		},
		validateForVboxClear:function(sParam){
			var item =this.byId(sParam).mAggregations.items;
			for(var i=0;i<item.length;i++){
				var vboxitem = item[i].mAggregations.items;
				for(var j=0;j<vboxitem.length;j++){
					var element_type = vboxitem[j].getMetadata().getName().split('.')[2];
					if (element_type == 'Input'|| element_type=='DatePicker'||element_type == 'ComboBox'|| element_type == 'Select')
          {
                        vboxitem[j].setValueState("None");
                        vboxitem[j].setValueStateText(null);
                    }
				}
			}
		},


  });
});