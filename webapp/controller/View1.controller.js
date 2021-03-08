sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/UploadCollectionParameter",
	"sap/ui/Device",
	"sap/m/UploadCollection",
	"sap/ui/core/EventBus",
	"sap/ui/core/ValueState"
], function (Controller, JSONModel, MessageBox, MessageToast, UploadCollectionParameter, Device, UploadCollection, EventBus, ValueState) {
	"use strict";
	return Controller.extend("HarcirahDeneme.controller.View1", {
		/**
		 *@memberOf HarcirahDeneme.controller.View1
		 */
		onInit: function () {
			// set mock data
			// this.getView().setModel(new JSONModel(Device), "device");
			var oUploadCollection = this.getView().byId('UploadCollection');
			oUploadCollection.setUploadUrl("/sap/opu/odata/sap/ZSIFIRDAN_SRV/FileSet");
			/*		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSIFIRDAN_SRV", false);
					this.getView().setModel(oModel);*/
			debugger;
			// get the EventBus
			var oEventBus = sap.ui.getCore().getEventBus();
			// put the onHaberles method into the EventBus
			debugger;
			oEventBus.subscribe("View2", "UploadCol", this.onHaberles, this);
			var oData = {
				pv_begda: "",
				pv_endda: "",
				pv_betrg: "",
				pv_zweck: "",
				attachments: ""
			};
			var oModel = new sap.ui.model.json.JSONModel(oData);
			this.getOwnerComponent().setModel(oModel, "passModel");
		},
		onFileDeleted: function (oEvent) {
			debugger;
			MessageToast.show("Event fileDeleted triggered");
		},

		onFilenameLengthExceed: function (oEvent) {
			debugger;
			MessageToast.show("Event filenameLengthExceed triggered");
		},

		onFileSizeExceed: function (oEvent) {
			debugger;
			MessageToast.show("Event fileSizeExceed triggered");
		},

		onTypeMissmatch: function (oEvent) {
			debugger;
			MessageToast.show("Event typeMissmatch triggered");
		},

		onStartUpload: function (oEvent) {
			debugger;

			var oUploadCollection = this.byId("UploadCollection");
			var cFiles = oUploadCollection.getItems().length;
			//file isimlerini alalim
			var attachments = "";
			for (var i = 0; i < cFiles; i++) {
				attachments = oUploadCollection.getItems()[i].getFileName() + "\r" + attachments;
			}
			var pv_attachments = {
				attachments: attachments
			};
			this.getOwnerComponent().getModel("passModel").setData(pv_attachments);


		},

		onHaberles: function (sChannel, sEvent, oData) {
			debugger;
			if (sEvent === "UploadCol") {
				var v_refno = oData.refno;
				alert(v_refno)
				this.getOwnerComponent().getModel("passModel").setData({
					v_refno: v_refno
				});
				var uploadInfo = cFiles + " file(s)";
				var oUploadCollection = this.byId("UploadCollection");
				var cFiles = oUploadCollection.getItems().length;
				if (cFiles > 0) {
					oUploadCollection.upload();

					/*	if (oTextArea.getValue().length == 0) {
								uploadInfo = uploadInfo + " without notes";
							} else {
								uploadInfo = uploadInfo + " with notes";
							}
*/
					MessageToast.show("Method Upload is called (" + uploadInfo + ")");
					MessageBox.information("Uploaded " + uploadInfo);
				}
			}
		},

		onBeforeUploadStarts: function (oEvent) {
			debugger;
			var v_refno = this.getOwnerComponent().getModel("passModel").getData().v_refno;
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName") + "#" + v_refno
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			var oRefno = new sap.m.UploadCollectionParameter({
				name: "Refno",
				value: v_refno
			});
			oEvent.getParameters().addHeaderParameter(oRefno);
			var oModel = this.getView().getModel();

			oModel.refreshSecurityToken();

			var oHeaders = oModel.oHeaders;

			var sToken = oHeaders['x-csrf-token'];

			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({

				name: "x-csrf-token",

				value: sToken

			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderToken);

		},

		onUploadComplete: function (oEvent) {
			this.getView().getModel().refresh();
		},

		onSelectChange: function (oEvent) {
			debugger;
			var oUploadCollection = this.byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		},

		handleChange: function (oEvent) {
			var oText = this.byId("textResult"),
				oDP = oEvent.getSource(),
				sValue = oEvent.getParameter("value"),
				bValid = oEvent.getParameter("valid");

			this._iEvent++;
			oText.setText("Change - Event " + this._iEvent + ": DatePicker " + oDP.getId() + ":" + sValue);

			if (bValid) {
				oDP.setValueState(ValueState.None);
			} else {
				oDP.setValueState(ValueState.Error);
			}
		},
		handleUploadComplete: function (oEvent) {
			debugger;
			var sResponse = oEvent.getParameter("response");
			if (sResponse) {
				var sMsg = "";
				var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
				if (m[1] == "200") {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Success)";
					oEvent.getSource().setValue("");
				} else {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Error)";
				}

				MessageToast.show(sMsg);
			}
		},

		handleUploadPress: function () {
			debugger;
			var oFileUploader = this.byId("fileUploader");
			oFileUploader.checkFileReadable().then(function () {
				oFileUploader.upload();
			}, function (error) {
				MessageToast.show("The file cannot be read. It may have changed.");
			}).then(function () {
				oFileUploader.clear();
			});
		},
		onChange: function (oEvent) {

		},
		action: function (oEvent) {
			debugger;
			
			var attachments = this.getOwnerComponent().getModel("passModel").getData().attachments;

			if (this.getView().byId("ibegda").getValue() > this.getView().byId("iendda").getValue()) {
				MessageBox.error("Bitis Tarihi,Giris Tarihine göre daha önce olamaz");
			} else {
				//Setting the data to the model
				var pv_begda = this.getView().byId("ibegda").getValue();
				var pv_endda = this.getView().byId("iendda").getValue();
				var pv_betrg = this.getView().byId("ibetrg").getValue();
				var pv_zweck = this.getView().byId("izweck").getValue();
				if (attachments === "") {
					attachments = "Ne yükledin de ne istiyon";
				}
				if (pv_begda == "" || pv_endda == "" || pv_betrg == "" || pv_zweck == "") {
					MessageBox.error("Bütün Alanlar Doldurulmalidir");
				} else {
				var parameters = {
							pv_begda: pv_begda,
							pv_endda: pv_endda,
							pv_betrg: pv_betrg,
							pv_zweck: pv_zweck,
							attachments: attachments
				};
					this.getOwnerComponent().getModel("passModel").setData(parameters);
					
					var that = this;
					var actionParameters = JSON.parse(oEvent.getSource().data("wiring").replace(/'/g, "\""));
					var eventType = oEvent.getId();
					var aTargets = actionParameters[eventType].targets || [];
					aTargets.forEach(function (oTarget) {
						var oControl = that.byId(oTarget.id);
						if (oControl) {
							var oParams = {};
							for (var prop in oTarget.parameters) {
								oParams[prop] = oEvent.getParameter(oTarget.parameters[prop]);
							}
							oControl[oTarget.action](oParams);
						}
					});
					var oNavigation = actionParameters[eventType].navigation;
					if (oNavigation) {
						var oParams = {};
						(oNavigation.keys || []).forEach(function (prop) {
							oParams[prop.name] = encodeURIComponent(JSON.stringify({
								value: oEvent.getSource().getBindingContext(oNavigation.model).getProperty(prop.name),
								type: prop.type
							}));
						});
						if (Object.getOwnPropertyNames(oParams).length !== 0) {
							this.getOwnerComponent().getRouter().navTo(oNavigation.routeName, oParams);
						} else {
							this.getOwnerComponent().getRouter().navTo(oNavigation.routeName);
						}
					}
				}
			}
		}

	});
});