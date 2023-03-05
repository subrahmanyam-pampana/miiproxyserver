sap.ui.define(['sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageToast',
    'sap/m/MessageBox'
],
    function (Controller,
        JSONModel,
        MessageToast,
        MessageBox) {
        "use strict";
        return Controller.extend("mii.employee.controller.App", {
            /*code starts here*/
            onInit: function () { 
                this._getEmployeeDetails()
                let employeeData = {
                    "userName": "",
                    "id": ""
                }

                let employeeModel = new JSONModel(employeeData)

                this.getView().setModel(employeeModel, "employee")

            },
            _getEmployeeDetails: function () {

                let url = '/XMII/Illuminator?QueryTemplate=01_23_SAPMII_Training/Queries/getEmpDetails&Content-Type=text/json'
                let oModel = new JSONModel(url)
                this.getView().setModel(oModel)
            },


            addEmployee: function () {
                let data = this.getView().getModel("employee").getData()
                let that = this
                

                if (!data.userName) {
                    MessageBox.error("Please Enter user name")
                    return
                }

                if (!data.id || parseInt(data.id) > 1000) {
                    MessageBox.error("Please enter employee id. Id should be less than 1000")
                    return
                }

                let jsondata = JSON.stringify(data)
                console.log(data)

                this._postEmployeeData(jsondata).then((resData) => {
                    let employeeModel = that.getView().getModel()
                    MessageToast.show(resData.Message)
                    let modelData = employeeModel.getData()
                    modelData.Rowsets.Rowset[0].Row.push({ "EmpId": data.id, "FirstName": data.userName })
                    employeeModel.setData(modelData)

                }).catch((resData) => {
                    MessageBox.error(resData.Message)
                })

            },
            _postEmployeeData: function (jsondata) {

                let addUserPromise = new Promise((resolve, reject) => {
                    $.ajax({
                        url: "/XMII/Illuminator",
                        method: "post",
                        data: {
                            "QueryTemplate": "01_23_SAPMII_Training/transactions/addEmployeeXQuery",
                            "Content-Type": "text/json",
                            "Param.1": jsondata
                        },
                        success: function (res) {
                            let resData = res.Rowsets.Rowset[0].Row[0]
                            if (resData.Status === "Success") {
                                resolve(resData)

                            } else {
                                //MessageBox.error(resData.Message)
                                reject(resData)
                            }
                        },
                        error: function (err) {
                            reject(err)
                        }
                    }, this)
                })

                return addUserPromise
            }

            /*code ends here*/
        })

    })