sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(
	Controller
) {
	"use strict";

	return Controller.extend("mii.employee.controller.test", {
        //test1
	onInit:function(){
		console.log("test")
	}
	});
});