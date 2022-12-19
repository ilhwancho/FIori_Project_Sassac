sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/URI",
	"sap/ui/model/BindingMode"
], function(
	Controller,
	JSONModel,
	URI,
	BindingMode
) {
	"use strict";
	let selectedNum;
	let originModel;
	const BPCATEGORY_ORG="조직";
	const BPCATEGORY_BP="개인";

	return Controller.extend("project3.controller.CustomerDetail", {
		
	//-----------초기화----------//
		onInit: async function(){
			console.log("onInit");
			await this.getOwnerComponent().getRouter().getRoute("CustomerDetail").attachPatternMatched(this.initView, this);
			console.log("onInit End");
		},
		//뷰 로딩 전에 가시성 미리 설정. 
		//안하면 사용자가 보는 화면에서 input 보였다가 사라짐. 
		onBeforeRendering: function() {
			console.log("before Rendering");
			this.setVisibleModel();
		},
		//넘어온 bpnumber 체크 
		//getBpModelData : bp모델 ajax로 get
		//initBpDdetailDataView : get한 bp모델 view set + 표준주소 설정 + 가시성 제어 
		initView: async function(e){
			selectedNum = e.getParameter("arguments").num;
			await( this.initBpDetailDataView( this.getBpModelData() ) );

			const CountryList = await $.ajax({
				type: "get",
				url: "/bp/BP_Nation_Region"
			});
			let BpCountryModel = new JSONModel(CountryList.value);
			this.getView().setModel(BpCountryModel, "BpCountryModel");
			this.controlVisiblebyCategory();
		},
		//bp 개인, 조직 각각 경우 보여질 아바타 아이콘 및 태그 가시성 제어
		controlVisiblebyCategory(){
			let org = "sap-icon://building";
			let cus = "sap-icon://customer";
			if(this.getView().getModel("bpModel").getData().bp_category == BPCATEGORY_ORG){
				this.getView().byId("mAvatar").setSrc(new sap.ui.core.Icon({src:org}).getSrc());
				this.setBpOrgVisibleModel(true);
			}else{
				this.getView().byId("mAvatar").setSrc(new sap.ui.core.Icon({src:cus}).getSrc());
				this.setBpOrgVisibleModel(true);
				this.setBpOrgVisibleModel(false);
			}
		},
		
		//뷰 데이터 초기화 함수 - 초기 로드 및 편집 완료 시 실행. 
		initBpDetailDataView:async function (mfunction){
			let bpData = await mfunction;
			//let rpData = this.replaceNullData(bpData);
			this.setModel(bpData,"bpModel");
			this.setBpAddress("bpModel");
			this.setVisibleModel();
		},
		//특정 bp 모델 getdata
		getBpModelData: async function (){
			let url="/bp/BP/"+selectedNum;
			let bpData= await $.ajax({
				type:'get',
				url:url
			});
			originModel = bpData;

			return bpData;
		},
		//편집 후 데이터 patch
		setBpModelData: async function (){
			var v = this.getView();
			let url="/bp/BP/"+selectedNum;
			let now = new Date();
			
			console.log($.parseJSON(v.byId("bpBillingHold").getSelectedKey()));
			console.log(v.byId("bpBillingHold"));
			now =`${now.getFullYear()}-${now.getMonth()+1}-${String(now.getDate()).padStart(2,0)}`;
			let temp = {
				//개인
				"bp_person_title": v.byId("bpPersonTitle").getSelectedKey(),
				"bp_last_name": v.byId("bpLastName").getValue(),
				"bp_first_name" : v.byId("bpFirstName").getValue(),
				"bp_gender" : v.byId("bpGender").getSelectedKey(),
				"bp_degree": v.byId("bpDegree").getValue(),
				"bp_birthday" : v.byId("bpBirthday").getValue(),
				"bp_birthplace" : v.byId("bpBirthplace").getValue(),
				"bp_changer": v.byId("bpChanger").getText(),
				
				//조직
				"bp_organization_title" : v.byId("bpOrganizationTitle").getValue(),
				"bp_corp_name1": v.byId("bpName1Org").getValue(),
				"bp_corp_name2": v.byId("bpName2Org").getValue(),
				"bp_corp_type": v.byId("bpCorpTypeOrg").getSelectedKey(),
				"bp_corp_est_date": v.byId("bpCorpEstDateOrg").getValue(),
				"bp_cal_date": v.byId("bpCalDateOrg").getValue(),


				//공통
				"bp_report_submission": $.parseJSON(v.byId("bpReportSubmission").getSelectedKey()),
				"bp_external_number": v.byId("bpExternalNumber").getValue(),
				"bp_changed_date": now,
				"bp_search1": v.byId("bpSearch1").getValue(),
				"bp_search2": v.byId("bpSearch2").getValue(),
				"bp_delivery_rule": v.byId("bpDeliveryRule").getValue(),
				"bp_vendor": v.byId("bpVendor").getValue(),
				"bp_provision_reason": v.byId("bpProvisionReason").getValue(),
				"bp_billing_hold": $.parseJSON(v.byId("bpBillingHold").getSelectedKey()),
				"bp_delivery_hold":$.parseJSON(v.byId("bpDeliveryHold").getSelectedKey()),
				"bp_posting_hold":$.parseJSON(v.byId("bpPostingHold").getSelectedKey()),
				"bp_customer_classification":v.byId("bpCustomerClassification").getValue(),
				"bp_nation":v.byId("bpNation").getValue(),
				"bp_road_address":v.byId("bpRoadAddress").getValue(),
				"bp_postal_code":v.byId("bpPostalCode").getValue(),
				"bp_street_address":v.byId("bpStreetAddress").getValue(),
				"bp_city":v.byId("bpCity").getValue(),
				"bp_region":v.byId("bpRegion").getValue(),
			}
			let bpData= await $.ajax({
				type:"patch",
				url:url,
				contentType: "application/json;IEEE745Compatible=true",
                data: JSON.stringify(temp)
			});
			return bpData;
		},
		//편집 시 데이터 바인딩 방지 위해 oneway로 지정. -> 편집 취소 시 변경 전 값 들어감 
		setModel: async function(data, modelName){
			let bpModel = new JSONModel(data);
			bpModel.setDefaultBindingMode(BindingMode.OneWay);
			this.getView().setModel(bpModel, modelName);
		},
		//데이터 널값인 경우 '-'로 변경. ++ 태그상에서 default 값 가능한지 확인 필요

		//표준 주소 
		setBpAddress: function(modelName){
			let bpAddress = "";
			let bp_postal_code = this.getView().getModel(modelName).getProperty(`/bp_postal_code`);
			let bp_region = this.getView().getModel(modelName).getProperty(`/bp_region`);
			let bp_city = this.getView().getModel(modelName).getProperty(`/bp_city`);
			let bp_road_address = this.getView().getModel(modelName).getProperty(`/bp_road_address`);
			let bp_street_address = this.getView().getModel(modelName).getProperty(`/bp_street_address`);
			bpAddress = `${bp_postal_code} ${bp_region} ${bp_city} ${bp_road_address} ${bp_street_address}`;

			this.getView().byId('bpAddress').setText(bpAddress);
		},
		// 개인/조직별 태그 가시성 제어 
		setBpOrgVisibleModel: function(v){
			let orgVisibleMode={
				"orgVisible": v
			}
			this.setModel(orgVisibleMode,"orgVisibleMode");
		},
		// 조회/편집별 가시성 제어 
		setVisibleModel: function(){
			let visibleMode={
				"visible": true
			}
			this.setModel(visibleMode,"visibleMode");
		},
		
		//태그 가시성 제어
		changeVisibleMode(b){
			let data = this.getView().getModel("visibleMode").oData;
			data.visible = b;
			this.setModel(data, "visibleMode");
			this.initSelectDefaultItem();
		},
		//select요소의 item 기본값 설정
		initSelectDefaultItem(){
			let sData = this.getView().getModel("bpModel").oData;
			
			let eleBpReportSubmission = this.getView().byId('bpReportSubmission');
			eleBpReportSubmission.setSelectedKey(sData.bp_report_submission);
			
			let eleBpCreditStatus = this.getView().byId('bpCreditStatus');
			eleBpCreditStatus.setSelectedKey(sData.bp_credit_status);
			
			let eleBpPersonTitle = this.getView().byId('bpPersonTitle');
			eleBpPersonTitle.setSelectedKey(sData.bp_person_title);
			
			let eleBpGender = this.getView().byId('bpGender');
			eleBpGender.setSelectedKey(sData.bp_gender);
			//--조직--//	
			let eleBpCorpType = this.getView().byId("bpCorpTypeOrg");
			eleBpCorpType.setSelectedKey(sData.bp_corp_type)

			//-------------보류-----------//
			let eleBpBillingHold = this.getView().byId('bpBillingHold');
			eleBpBillingHold.setSelectedKey(sData.bp_billing_hold);
			
			let elebpDeliveryHold = this.getView().byId('bpDeliveryHold');
			elebpDeliveryHold.setSelectedKey(sData.bp_delivery_hold);
			
			let eleBpPostingHold = this.getView().byId('bpPostingHold');
			eleBpPostingHold.setSelectedKey(sData.bp_posting_hold);
		},

		//-----------header----------//
		//back
		onCustomerList: function(){
			this.getOwnerComponent().getRouter().navTo("CustomerList");
		},
		//편집 
        onEditBtnPress : async function(){
			this.changeVisibleMode(false);
		},
		//-----------footer----------//
		//accept
		onAccept: async function(){
			this.initBpDetailDataView(this.setBpModelData());
		},
		//cancel
		onCancel:function(){
			console.log("GET CANCEL");
			console.log(originModel);
			this.changeVisibleMode(true);
		},

		toBack: function() {
			this.getOwnerComponent().getRouter().navTo("CustomerList");
		},
		EditInputCountry : function(){
			if(!this.pDialog){
				this.pDialog = this.loadFragment({
					name:"project3.view.fragment.InputSingleCountry"
				});
			}
			this.pDialog.then(function(oDialog){
				oDialog.open();
			});
		},
		onCloseCountryDialog: function() {
			this.byId("CountryDialog").destroy();
			this.pDialog = null;
		},

        onSearchCountryDialog: function() {
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

		onSearchCountryReset: function() {
			this.byId("SearchInputCountry").setValue("");
            this.onSearchCountryDialog();
		},
        getCountryContext : function(oEvent){
            this.byId("bpNation").setValue(oEvent.getParameters().cellControl.mProperties.text); 
			this.onCloseCountryDialog();

        },
		
	});
});