sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    'sap/m/SearchField',
	'sap/ui/table/Column',
	'sap/m/Text',
	"project3/model/formatter"
], function (Controller, Filter, FilterOperator, Sorter, JSONModel, Spreadsheet, exportLibrary,
    SearchField,UIColumn,Text,formatter) {

    "use strict";
	const EdmType = exportLibrary.EdmType;
    let totalNumber;
    let selectedNum;

    return Controller.extend("project4.controller.CompanyCodeList",{

		formatter : formatter,

        onInit: async function(){
            const myRoute = this.getOwnerComponent().getRouter().getRoute("CompanyCodeList");
            myRoute.attachPatternMatched(this.onMyRoutePatternMatched,this);
        },

        onMyRoutePatternMatched: async function(){
            this.onDataView();
			this.onReset();

        },
        onDataView: async function(){
            const CompanyCodeList = await $.ajax({
                type:"GET",
                url:"/cocd/CoCd"
            });

            let CompanyCodeListModel = new JSONModel(CompanyCodeList.value);
            this.getView().setModel(CompanyCodeListModel,"CompanyCodeListModel");

            const nationList = await $.ajax({
                type: "GET",
                url: "/bp/BP_Nation_Region"
            });

            let CoCdCountryModel = new JSONModel(nationList.value);
            this.getView().setModel(CoCdCountryModel, "CoCdCountryModel");

            const customerList = await $.ajax({
                type: "GET",
                url: "/bp/BP"
            });

            let BpCustomerModel = new JSONModel(customerList.value);
            this.getView().setModel(BpCustomerModel, "BpCustomerModel");

			const GlSelectCoA = await $.ajax({
				type: "get",
				url: "/gl/SelectCoA"
			});
			let SelectCoAModel = new JSONModel(GlSelectCoA.value);
			this.getView().setModel(SelectCoAModel, "SelectCoAModel");

            
            totalNumber= this.getView().getModel("CompanyCodeListModel").getData().length;
            totalNumber= "??????(" + totalNumber + ")"
            this.byId("totalNumber").setText(totalNumber);
        },
        onSearch: function (){
            let CompanyCode = this.byId("CompanyCode").getTokens();
            let CompanyCodeName = this.byId("CompanyCodeName").getValue();
            let CompanyCountry = this.byId("CompanyCountry").getTokens();
            let CompanyCurrency = this.byId("CompanyCurrency").getValue();
            let CompanyCoa = this.byId("CompanyCoa").getTokens();

            var aFilter = [];

            if(CompanyCode) {
                for(let item in CompanyCode){
                    aFilter.push(new Filter("com_code", FilterOperator.Contains, CompanyCode[item].mProperties.key)) 
            }}
            if(CompanyCodeName) {aFilter.push(new Filter("com_code_name", FilterOperator.Contains, CompanyCodeName))}
            if(CompanyCountry) {
                for(let item in CompanyCountry){
                    aFilter.push(new Filter("com_country", FilterOperator.Contains, CompanyCountry[item].mProperties.key)) 
            }}

            if(CompanyCurrency) {aFilter.push(new Filter("com_currency", FilterOperator.Contains, CompanyCurrency))}
            if(CompanyCoa) {
                for(let item in CompanyCoa){
                    aFilter.push(new Filter("com_coa", FilterOperator.Contains, CompanyCoa[item].mProperties.key)) 
            }}
          
            let oTable = this.byId("CompanyCodeListTable").getBinding("rows")

            oTable.filter(aFilter);   
        },
        onReset : function() {
            this.byId("CompanyCode").removeAllTokens();
            this.byId("CompanyCodeName").setValue("");
            this.byId("CompanyCountry").removeAllTokens();
            this.byId("CompanyCurrency").setValue("");
            this.byId("CompanyCoa").removeAllTokens();
            this.onSearch();
        },
        toBack : function(){
            this.getOwnerComponent().getRouter().navTo("Home");
        },

		toCreateCoCd: function() {
            this.getOwnerComponent().getRouter().navTo("CreateCoCd");

		},
		toCompanyCodeDetail: function(e){
            let sPath = e.getSource().getParent().getBindingContext('CompanyCodeListModel').getPath();
			let selectedNum = this.getView().getModel('CompanyCodeListModel').getProperty(sPath).com_code;

			let num = e.getParameters();
            this.getOwnerComponent().getRouter().navTo("CoCdDetail",{num:selectedNum});
		},
        // ?????? ?????? ????????? ??????????????? ??????
        onValueHelpCountryList: function(oEvent) {
			this.pWhitespaceDialog = null;
			this._oBasicSearchField = null;
			this.oWhitespaceDialog = null;
			var oModel = this.getView().getModel('CoCdCountryModel');

			var oNationCodeTemplate = new Text({ text: { path: 'CoCdCountryModel>bp_nation_code' }, renderWhitespace: true });
			var oNationTemplate = new Text({ text: { path: 'CoCdCountryModel>bp_nation' }, renderWhitespace: true });
			this._oBasicSearchField = new SearchField({
				search: function () {
					this.oWhitespaceDialog.getFilterBar().search();
				}.bind(this)
			});

			this.pWhitespaceDialog = this.loadFragment({
				name: "project3.view.fragment.InputCountryList"
			});

			this.pWhitespaceDialog.then(function (oWhitespaceDialog) {
				var oFilterBar = oWhitespaceDialog.getFilterBar();
				this.oWhitespaceDialog = oWhitespaceDialog;
				// if (this._bWhitespaceDialogInitialized) {
				// 	oWhitespaceDialog.setTokens([]);
				// 	oWhitespaceDialog.update();

				// 	oWhitespaceDialog.open();
				// }
				this.getView().addDependent(oWhitespaceDialog);

				// if(!this.oWhitespaceDialog._getTokenizer().getTokenes().length){
				// 	oWhitespaceDialog.setTokens(this._oBasicSearchField.getTokens());
				// }
				// Set key fields for filtering in the Define Conditions Tab
				oWhitespaceDialog.setRangeKeyFields([{
					label: "????????????",
					key: "CoCdCountryModel>bp_nation"
				}]);

				// Set Basic Search for FilterBar
				oFilterBar.setFilterBarExpanded(false);
				oFilterBar.setBasicSearch(this._oBasicSearchField);

				oWhitespaceDialog.getTableAsync().then(function (oTable) {
					oTable.setModel(oModel);

					// For Desktop and tabled the default table is sap.ui.table.Table
					if (oTable.bindRows) {
						oTable.addColumn(new UIColumn({ label: "????????????", template: oNationCodeTemplate, width : "15%" }));
						oTable.addColumn(new UIColumn({ label: "??????/?????? ??????", template: oNationTemplate }));
						oTable.bindAggregation("rows", {
							path: "CoCdCountryModel>/",
							events: {
								dataReceived: function () {
									oWhitespaceDialog.update();
								}
							}
						});
					}

					oWhitespaceDialog.update();
				}.bind(this));

				var multiinput_tokens =this.byId("CompanyCountry").getTokens()
				oWhitespaceDialog.setTokens(multiinput_tokens);
				oWhitespaceDialog.update();

				this._bWhitespaceDialogInitialized = true;
				oWhitespaceDialog.open();
			}.bind(this));

		},
		onCountrySelectCancelPress: function() {
            this.oWhitespaceDialog.close();

		},

		onCountrySelectOkPress: function(oEvent) {
            var aTokens = oEvent.getParameter("tokens");
			var CompanyCountry = this.byId("CompanyCountry");
			var arr=[];
			aTokens.forEach(function (oToken) {
				// console.log(oToken.getKey());
				oToken.mProperties.text = oToken.getKey().toString()
				arr.push(oToken);
            }.bind(this));
            CompanyCountry.setTokens(arr);
            this.oWhitespaceDialog.close();

		},
		onCountrySelectSearch: function() {
            let CountrySearchInput = this._oBasicSearchField.getValue();
			var aFilter = [];

			if (CountrySearchInput) {
				aFilter = new Filter({
					filters: [
						new Filter("bp_nation_code", FilterOperator.Contains, CountrySearchInput),
						new Filter("bp_nation", FilterOperator.Contains, CountrySearchInput)
					],
					and: false
				});
			}
			this._filterTable(aFilter);

		},

        // ??????????????? ????????? ??????
        _filterTable: function (oFilter) {
			var oValueHelpDialog = this.oWhitespaceDialog;
			oValueHelpDialog.getTableAsync().then(function (oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}
				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}
				oValueHelpDialog.update();
			});
		},
        onValueHelpCoCdList: function(oEvent) {
			this.pWhitespaceDialog = null;
			this._oBasicSearchField = null;
			this.oWhitespaceDialog = null;
			var oModel = this.getView().getModel('CompanyCodeListModel');

			var oCoCdTemplate = new Text({ text: { path: 'CompanyCodeListModel>com_code' }, renderWhitespace: true });
			var oBPNameTemplate = new Text({ text: { path: 'CompanyCodeListModel>com_code_name' }, renderWhitespace: true });
			this._oBasicSearchField = new SearchField({
				search: function () {
					this.oWhitespaceDialog.getFilterBar().search();
				}.bind(this)
			});

			this.pWhitespaceDialog = this.loadFragment({
				name: "project3.view.fragment.InputCoCdList"
			});

			this.pWhitespaceDialog.then(function (oWhitespaceDialog) {
				var oFilterBar = oWhitespaceDialog.getFilterBar();
				this.oWhitespaceDialog = oWhitespaceDialog;
				// if (this._bWhitespaceDialogInitialized) {
				// 	oWhitespaceDialog.setTokens([]);
				// 	oWhitespaceDialog.update();

				// 	oWhitespaceDialog.open();
				// }
				this.getView().addDependent(oWhitespaceDialog);

				// if(!this.oWhitespaceDialog._getTokenizer().getTokenes().length){
				// 	oWhitespaceDialog.setTokens(this._oBasicSearchField.getTokens());
				// }
				// Set key fields for filtering in the Define Conditions Tab
				oWhitespaceDialog.setRangeKeyFields([{
					label: "CoCd",
					key: "CompanyCodeListModel>com_code"
				}]);

				// Set Basic Search for FilterBar
				oFilterBar.setFilterBarExpanded(false);
				oFilterBar.setBasicSearch(this._oBasicSearchField);

				oWhitespaceDialog.getTableAsync().then(function (oTable) {
					oTable.setModel(oModel);

					// For Desktop and tabled the default table is sap.ui.table.Table
					if (oTable.bindRows) {
						oTable.addColumn(new UIColumn({ label: "????????????", template: oCoCdTemplate, width : "15%" }));
						oTable.addColumn(new UIColumn({ label: "?????????", template: oBPNameTemplate }));
						oTable.bindAggregation("rows", {
							path: "CompanyCodeListModel>/",
							events: {
								dataReceived: function () {
									oWhitespaceDialog.update();
								}
							}
						});
					}

					oWhitespaceDialog.update();
				}.bind(this));

				var multiinput_tokens =this.byId("CompanyCode").getTokens()
				oWhitespaceDialog.setTokens(multiinput_tokens);
				oWhitespaceDialog.update();

				this._bWhitespaceDialogInitialized = true;
				oWhitespaceDialog.open();
			}.bind(this));

		},
        onCoCdSelectCancelPress: function() {
            this.oWhitespaceDialog.close();

		},
        onCoCdSelectOkPress: function(oEvent) {
            var aTokens = oEvent.getParameter("tokens");
			var CompanyCode = this.byId("CompanyCode");
			var arr=[];
			aTokens.forEach(function (oToken) {
				// console.log(oToken.getKey());
				oToken.mProperties.text = oToken.getKey().toString()
				arr.push(oToken);
            }.bind(this));
            CompanyCode.setTokens(arr);
            this.oWhitespaceDialog.close();

		},
		onCoCdSelectSearch: function() {
            let CoCdSearchInput = this._oBasicSearchField.getValue();
			var aFilter = [];

			if (CoCdSearchInput) {
				aFilter = new Filter({
					filters: [
						new Filter("com_code", FilterOperator.Contains, CoCdSearchInput),
						new Filter("com_code_name", FilterOperator.Contains, CoCdSearchInput)
					],
					and: false
				});
			}
			this._filterTable(aFilter);

		},
		onValueHelpCoA: function (oEvent) {
			this.pWhitespaceDialog = null;
			this._oBasicSearchField = null;
			this.oWhitespaceDialog = null;
			var oModel = this.getView().getModel('SelectCoAModel');

			var oCoATemplate = new Text({ text: { path: 'SelectCoAModel>gl_coa' }, renderWhitespace: true });
			var oCoAContentTemplate = new Text({ text: { path: 'SelectCoAModel>gl_coa_content' }, renderWhitespace: true });
			this._oBasicSearchField = new SearchField({
				search: function () {
					this.oWhitespaceDialog.getFilterBar().search();
				}.bind(this)
			});

			this.pWhitespaceDialog = this.loadFragment({
				name: "project2.view.fragment.InputCoAList"
			});

			this.pWhitespaceDialog.then(function (oWhitespaceDialog) {
				var oFilterBar = oWhitespaceDialog.getFilterBar();
				this.oWhitespaceDialog = oWhitespaceDialog;
				// if (this._bWhitespaceDialogInitialized) {
				// 	oWhitespaceDialog.setTokens([]);
				// 	oWhitespaceDialog.update();

				// 	oWhitespaceDialog.open();
				// }
				this.getView().addDependent(oWhitespaceDialog);

				// if(!this.oWhitespaceDialog._getTokenizer().getTokenes().length){
				// 	oWhitespaceDialog.setTokens(this._oBasicSearchField.getTokens());
				// }
				// Set key fields for filtering in the Define Conditions Tab
				oWhitespaceDialog.setRangeKeyFields([{
					label: "???????????????",
					key: "SelectCoAModel>gl_coa"
				}]);

				// Set Basic Search for FilterBar
				oFilterBar.setFilterBarExpanded(false);
				oFilterBar.setBasicSearch(this._oBasicSearchField);

				oWhitespaceDialog.getTableAsync().then(function (oTable) {
					oTable.setModel(oModel);

					// For Desktop and tabled the default table is sap.ui.table.Table
					if (oTable.bindRows) {
						oTable.addColumn(new UIColumn({ label: "???????????????", template: oCoATemplate }));
						oTable.addColumn(new UIColumn({ label: "??????", template: oCoAContentTemplate }));
						oTable.bindAggregation("rows", {
							path: "SelectCoAModel>/",
							events: {
								dataReceived: function () {
									oWhitespaceDialog.update();
								}
							}
						});
					}

					oWhitespaceDialog.update();
				}.bind(this));

				var multiinput_tokens =this.byId("CompanyCoa").getTokens()
				oWhitespaceDialog.setTokens(multiinput_tokens);
				oWhitespaceDialog.update();

				this._bWhitespaceDialogInitialized = true;
				oWhitespaceDialog.open();
			}.bind(this));


		},
		onCoASelectOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			var CompanyCoa = this.byId("CompanyCoa");
			var arr=[];
			aTokens.forEach(function (oToken) {
				// console.log(oToken.getKey());
				oToken.mProperties.text = oToken.getKey().toString()
				arr.push(oToken);
            }.bind(this));
            CompanyCoa.setTokens(arr);
            this.oWhitespaceDialog.close();

		},
        onCoASelectCancelPress: function (oEvent) {
			this.oWhitespaceDialog.close();

		},
		onCoASelectSearch: function (oEvent) {
			let CoASearchInput = this._oBasicSearchField.getValue();
			console.log(CoASearchInput);
			var aFilter = [];

			if (CoASearchInput) {
				aFilter = new Filter({
					filters: [
						new Filter("gl_coa", FilterOperator.Contains, CoASearchInput),
						new Filter("gl_coa_content", FilterOperator.Contains, CoASearchInput)
					],
					and: false
				});
			}
			this._filterTable(aFilter);
		},
		
		onDataExport: function () {
            let aCols, oRowBinding, tableIndices, oSettings, oSheet, oTable;

            oTable = this.byId('CompanyCodeListTable');    // ????????? 
            oRowBinding = oTable.getBinding('rows');    // ????????? ?????? ?????????
            tableIndices = oRowBinding.aIndices;        // ????????? ?????? ???????????? ???????????? ????????? Index
            console.log(oRowBinding);

            let oList = []; // ????????? ?????? ?????? ??????

            var selectedIndex = this.byId("CompanyCodeListTable").getSelectedIndices();    // ?????????????????? ????????? ?????? ????????? ?????????

            if (selectedIndex.length == 0) {    // ????????? ?????? ?????? ???
                for (let j = 0; j < oRowBinding.oList.length; j++) {    // ?????? ????????? ?????? for??? ??????
                    if (oRowBinding.aIndices.indexOf(j) > -1) {         // ???????????? ?????? ???
                        oList.push(oRowBinding.oList[j]);               // ?????? ???????????? oList??? Push
                    }
                }
            }
            else {                              // ????????? ?????? ?????? ???
                for (let j = 0; j < selectedIndex.length; j++) {        // ????????? ?????? ????????? for??? ??????
                    oList.push(oRowBinding.oList[tableIndices[selectedIndex[j]]]);      // [?????? ???????????? [???????????? ???????????? [????????? ?????????[j]]]]
                    // console.log(oRowBinding.oList[tableIndices[selectedIndex[j]]]);
                }
            }

            aCols = this.createColumnConfig();

			for(let i = 0; i < oList.length; i++){
				if(oList[i].com_country === 'KR'){
					oList[i].com_country2 = "??????";
				}
				if(oList[i].com_country === 'CN'){
					oList[i].com_country2 = "??????";
				}
				if(oList[i].com_country === 'DE'){
					oList[i].com_country2 = "??????";
				}
				if(oList[i].com_country === 'DK'){
					oList[i].com_country2 = "?????????";
				}
				if(oList[i].com_country === 'HK'){
					oList[i].com_country2 = "?????? ?????? ?????????";
				}
				if(oList[i].com_country === 'JP'){
					oList[i].com_country2 = "??????";
				}
				if(oList[i].com_country === 'NL'){
					oList[i].com_country2 = "????????????";
				}
				if(oList[i].com_country === 'SG'){
					oList[i].com_country2 = "????????????";
				}
				if(oList[i].com_country === 'TW'){
					oList[i].com_country2 = "??????";
				}
				if(oList[i].com_country === 'US'){
					oList[i].com_country2 = "??????";
				}
				if(oList[i].com_country === 'BG'){
					oList[i].com_country2 = "?????????";
				}
			}
            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oList,
                fileName: 'CustomerListTable.xlsx',
                worker: false
            };
            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },
        createColumnConfig: function () {
            const aCols = [];
            aCols.push({
                label: '?????? ??????',
                property: 'com_code',
                type: EdmType.String
            });
            aCols.push({
                label: '?????????',
                property: 'com_code_name',
                type: EdmType.String
            });
            aCols.push({
                label: '??????/??????',
                property: 'com_country2',
                type: EdmType.String
            });
            aCols.push({
                label: '?????? ??????',
                property: 'com_currency',
                type: EdmType.String
            });
            aCols.push({
                label: '???????????????',
                property: 'com_coa',
                type: EdmType.String
            });
            return aCols;
        },

		toCompanyCodeDetail: function(oEvent) {
			let selectedNum = oEvent.getParameters().row.mAggregations.cells[0].mProperties.text;
			this.getOwnerComponent().getRouter().navTo("CoCdDetail", {num : selectedNum});
		},

    });
});