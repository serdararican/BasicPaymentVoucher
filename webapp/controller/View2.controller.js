sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/EventBus",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/ButtonType",
	"sap/m/Button",
	"sap/m/Text"
], function (Controller, MessageBox, MessageToast, DateFormat, EventBus, ODataModel, Dialog, DialogType, ButtonType, Button, Text) {
	"use strict";
	return Controller.extend("HarcirahDeneme.controller.View2", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf HarcirahDeneme.view.View2
		 */
		onInit: function () {
			this._oView = this.getView();
		},

		onNavBack: function () {
			//Navigating to second page
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("View1", true);
		},
		onCreate: function () {
			if (!this.oApproveDialog) {
				this.oApproveDialog = new Dialog({
					type: DialogType.Message,
					title: "Confirm",
					content: new Text({ text: "Do you want to submit this order?" }),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Submit",
						press: function () {
							MessageToast.show("Submit pressed!");
							this.onCreateDevami();
							this.oApproveDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oApproveDialog.close();
						}.bind(this)
					})
				});
			}

			this.oApproveDialog.open();
		},
		
		onCreateDevami: function() {
			var oModel = this._oView.getModel();
			var sPath = "/HarcirahEntSet",
				oData = {},
				mParameters = {};
			var f_begda = this.getOwnerComponent().getModel("passModel").getData().pv_begda;
			var f_endda = this.getOwnerComponent().getModel("passModel").getData().pv_endda;
			oData.Begda = f_begda + "T00:00:00";
			oData.Endda = f_endda + "T00:00:00";
			oData.Betrg = this.getOwnerComponent().getModel("passModel").getData().pv_betrg;
			oData.Zweck = this.getOwnerComponent().getModel("passModel").getData().pv_zweck;

			mParameters.success = function (oData2, oResponse) {
				debugger;
				MessageBox.success("Harcirah_Order is successfully created.");
				var hdrMessage = oResponse.headers["sap-message"];
				var refno = oResponse.data["Refno"];
				var oEventBus = sap.ui.getCore().getEventBus();
				oEventBus.publish("View2", "UploadCol", {
					refno: refno
				});
			}.bind(this);
			mParameters.error = function (oError) {
				MessageBox.error("Unfortunately the process is unsuccessful");
			};

			oModel.create(sPath, oData, mParameters);
		}
	});
});