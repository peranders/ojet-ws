/**
 * @license
 * Copyright (c) 2014, 2018, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your customer ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery','text!../data/restservices.json', 'ojs/ojdatagrid', 'ojs/ojcollectiondatagriddatasource','ojs/ojinputtext', 'ojs/ojformlayout', 'ojs/ojmasonrylayout'],
 function(oj, ko, $, restservices) {

    function CustomerViewModel() {
      var self = this;

      //Set data source endpoint
      self.DeptUrl = JSON.parse(restservices).departments;
      self.EmpsByDeptUrl = JSON.parse(restservices).empsByDepartment;
      self.EmpUrl = JSON.parse(restservices).employees;


      function getVerb(verb) {
        if (verb === "read")    {return "GET";}
        if (verb === "update")  {return "PUT";}
        if (verb === "delete")  {return "DELETE";}
        if (verb === "create")  {return "PUT"}
      };

      function empRestURL(operation, collection, options) {
        var retObj = {};
        retObj['type'] = getVerb(operation);
        if (operation === "delete" || operation === "update") {
          retObj['url'] = self.EmpUrl + "/" + collection.id ;
        }
        else {
          //var depId = collection.get('id');
          var depId = + self.inputDepartmentID();
          retObj['url'] = self.EmpsByDeptUrl + depId;
        }
        return retObj;
      };

      //Set collections
      self.DepCollection = new oj.Collection(null, {
          model: new oj.Model.extend({idAttribute: 'id'}),
          url: self.DeptUrl
        }
      );
      self.EmpCollection = new oj.Collection(null, {
          model: new oj.Model.extend({idAttribute: 'id', customURL: empRestURL}),
          customURL: empRestURL
        }
      );


      //Set datasources for oj-data-grid
      self.deptDataSource = new oj.CollectionDataGridDataSource(
        self.DepCollection, {
          rowHeader: 'id',
          columns:['DEPARTMENT_NAME', 'LOCATION_NAME']
        });


      self.empDataSource = new oj.CollectionDataGridDataSource(
        self.EmpCollection, {
          rowHeader: 'id',
          columns:['LAST_NAME', 'FIRST_NAME', 'SALARY']
        });



        //Set local vars to hold form values
        var nextKey = 121;
        self.inputDepartmentID = ko.observable(nextKey);
        self.inputDepartmentName = ko.observable();
        self.inputLocationName = ko.observable();

        self.inputEmpID = ko.observable(0);
        self.inputEmpLastName = ko.observable();
        self.inputEmpFirstName = ko.observable();
        self.inputEmpSalary = ko.observable();


        //Function that creates json payload from fields in update form
        self.buildDepModel = function () {
         return {
           'id': self.inputDepartmentID(),
           'DEPARTMENT_NAME': self.inputDepartmentName(),
           'LOCATION_NAME': self.inputLocationName()
          };
        };

        self.buildEmpModel = function () {
         return {
           'id': self.inputEmpID(),
           'LAST_NAME': self.inputEmpLastName(),
           'FIRST_NAME': self.inputEmpFirstName(),
           'SALARY': self.inputEmpSalary()
          };
        };
        // Function to update fields in update form
        self.updateDepFields = function (model) {
          self.inputDepartmentID(model.get('id'));
          self.inputDepartmentName(model.get('DEPARTMENT_NAME'));
          self.inputLocationName(model.get('LOCATION_NAME'));
        };

        self.updateEmpFields = function (model) {
          self.inputEmpID(model.get('id'));
          self.inputEmpLastName(model.get('LAST_NAME'));
          self.inputEmpFirstName(model.get('FIRST_NAME'));
          self.inputEmpSalary(model.get('SALARY'));
        };

        self.resetDepFields = function(){
          console.log("**resetDepFields**");
          self.inputDepartmentID(null);
          self.inputDepartmentName(null);
          self.inputLocationName(null);
        };

        self.resetEmpFields = function () {
          self.inputEmpID(null);
          self.inputEmpLastName(null);
          self.inputEmpFirstName(null);
          self.inputEmpSalary(null);
        };

        self.refreshEmployeeList = function(depId){
          self.EmpCollection.url = self.EmpsByDeptUrl + depId;
          self.EmpCollection.fetch({
            success: function(model, response, options){
              self.resetEmpFields();
              document.getElementById('empDatagrid').refresh();
            },
            error: function(model, jqXHR, options){
              console.log("Error updating emplist: "+ jqXHR);
            }
          });

        };


        self.handleDepSelectionChanged = function (event) {
          var selection = event.detail['value'][0];
          if (selection != null) {
            var rowKey = selection['startKey']['row'];
            self.modelToUpdate = self.DepCollection.get(rowKey);
            self.updateDepFields(self.modelToUpdate);

            //handle emp listing
            var depId = self.modelToUpdate.get('id');
            self.refreshEmployeeList(depId);
            self.resetEmpFields();
          }
        };

          self.handleEmpSelectionChanged = function (event) {
            var selection = event.detail['value'][0];
            if (selection != null) {
              var rowKey = selection['startKey']['row'];
              self.modelToUpdate = self.EmpCollection.get(rowKey);
              self.updateEmpFields(self.modelToUpdate);
            }
          };

        self.updateDep = function() {
          self.modelToUpdate = self.DepCollection.get(self.inputDepartmentID());
          self.modelToUpdate.save(self.buildDepModel(), {
            contentType: 'application/json',
            success: function(model, response) {
              console.log(self.inputDepartmentID() + " -- updated successfully")
            },
            error: function(jqXHR, textstatus, errorThrown) {
              console.log(self.inputDepartmentID + " --- " + jqXHR);
            }
          });
        };

        self.updateEmp = function() {
          self.modelToUpdate = self.EmpCollection.get(self.inputEmpID());
          self.modelToUpdate.save(self.buildEmpModel(), {
            contentType: 'application/json',
            success: function(model, response) {
              console.log(self.inputEmpID() + " -- updated successfully")
            },
            error: function(jqXHR, textstatus, errorThrown) {
              console.log(self.inputEmpID + " --- " + jqXHR);
            }
          });
        };


        self.removeDep = function() {
          self.modelToUpdate = self.DepCollection.get(self.inputDepartmentID());
          if( self.modelToUpdate){
            self.modelToUpdate.destroy({
              success: function(model, response){
                self.refreshEmployeeList(0);
              },
              error: function(jqXHR, textstatus, errorThrown){console.log("Remove ERROR: " + jqXHR);}
            });
          };
          self.resetDepFields();

        };

        self.removeEmp = function() {
          self.modelToUpdate = self.EmpCollection.get(self.inputEmpID());
          var depID = self.modelToUpdate.get('DEPARTMENT_ID');
          if( self.modelToUpdate){
            self.modelToUpdate.destroy({
              success: function(model, response){
                self.refreshEmployeeList(depID);
              },
              error: function(jqXHR, textstatus, errorThrown){console.log("Remove ERROR: " + jqXHR);}
            });
            //self.refreshEmployeeList(depID);
          };
          //self.resetEmpFields();
        };


      // Below are a set of the ViewModel methods invoked by the oj-module component.
      // Please reference the oj-module jsDoc for additional information.

      /**
       * Optional ViewModel method invoked after the View is inserted into the
       * document DOM.  The application can put logic that requires the DOM being
       * attached here.
       * This method might be called multiple times - after the View is created
       * and inserted into the DOM and after the View is reconnected
       * after being disconnected.
       */
      self.connected = function() {
        // Implement if needed
      };

      /**
       * Optional ViewModel method invoked after the View is disconnected from the DOM.
       */
      self.disconnected = function() {
        // Implement if needed
      };

      /**
       * Optional ViewModel method invoked after transition to the new View is complete.
       * That includes any possible animation between the old and the new View.
       */
      self.transitionCompleted = function() {
        // Implement if needed
      };
    }

    /*
     * Returns a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.  Return an instance of the ViewModel if
     * only one instance of the ViewModel is needed.
     */
    return new CustomerViewModel();
  }
);
