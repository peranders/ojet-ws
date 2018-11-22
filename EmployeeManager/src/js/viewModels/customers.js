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

      //Set collections
      self.DepCollection = new oj.Collection(null, {
          model: new oj.Model.extend({idAttribute: 'id'}),
          url: self.DeptUrl
        }
      );
      self.EmpCollection = new oj.Collection(null, {
          model: new oj.Model.extend({idAttribute: 'id'}),
          url: self.EmpsByDeptUrl
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

        //Function that creates json payload from fields in update form
        self.buildDeptModel = function () {
         return {
           'id': self.inputDepartmentID(),
           'DEPARTMENT_NAME': self.inputDepartmentName(),
           'LOCATION_NAME': self.inputLocationName()
          };
        };

        // Function to update fields in update form
        self.updateFields = function (model) {
          self.inputDepartmentID(model.get('id'));
          self.inputDepartmentName(model.get('DEPARTMENT_NAME'));
          self.inputLocationName(model.get('LOCATION_NAME'));
        };

        self.resetUpdateFields = function(){
          self.inputDepartmentID(null);
          self.inputDepartmentName(null);
          self.inputLocationName(null);
        };

        self.refreshEmployeeList = function(depId){
          self.EmpCollection.url = self.EmpsByDeptUrl + depId;
          self.EmpCollection.fetch();
          document.getElementById('empDatagrid').refresh();
        };


        self.handleDepSelectionChanged = function (event) {
          console.log("handleDepSelectionChanged function");
          var selection = event.detail['value'][0];
          if (selection != null) {
            var rowKey = selection['startKey']['row'];
            self.modelToUpdate = self.DepCollection.get(rowKey);
            self.updateFields(self.modelToUpdate);

            //handle emp listing
            var depId = self.modelToUpdate.get('id');
            self.refreshEmployeeList(depId);
          }
        };

          self.handleEmpSelectionChanged = function (event) {
            console.log("handleEmpSelectionChanged function");
            var selection = event.detail['value'][0];
            if (selection != null) {
              var rowKey = selection['startKey']['row'];
              self.modelToUpdate = self.DepCollection.get(rowKey);
              self.updateFields(self.modelToUpdate);
            }
          };

        self.update = function() {
          console.log("update function");
          //if (self.modelToUpdate) {
          //  self.modelToUpdate.set(self.buildModel());
            self.modelToUpdate = self.DepCollection.get(self.inputDepartmentID());
            self.modelToUpdate.save(self.buildDeptModel(), {
              contentType: 'application/json',
              success: function(model, response) {
                console.log(self.inputDepartmentID() + " -- updated successfully")
              },
              error: function(jqXHR, textstatus, errorThrown) {
                console.log(self.inputDepartmentID + " --- " + jqXHR);
              }
            });
          //};
          console.log("Updated department name: " + self.inputDepartmentName());
        };

        self.add = function() {
          console.log("add function");
          console.log("New department name: " + self.inputDepartmentName());
        };

        self.remove = function() {
          console.log("remove function");
          self.modelToUpdate = self.DepCollection.get(self.inputDepartmentID());
          if( self.modelToUpdate){
            self.modelToUpdate.destroy();
            self.refreshEmployeeList(0);
            console.log("Remove department name: " + self.inputDepartmentName());
          };
          self.resetUpdateFields();
          //$('#datagrid').oj-data-grid('refresh');
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
