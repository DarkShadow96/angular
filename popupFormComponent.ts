import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MpServiceService } from '../mp-service.service';
import { PageEvent } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { UserService } from '../../../user.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatRadioChange } from '@angular/material/radio';
import { COMPONENT_DESCRIPTIONS, POPUP_PLATFORM_VALUES } from '../constants';
enum HostClasification {
  Dedicated = "Dedicated",
  PlatformShared = "Shared Platform",
  CIOShared = "CIO Shared"}
enum Tables {
  dedicatedServersTable = "dedicatedServersTable",
  sharedPlatformServersTable = "sharedPlatformServersTable",
  sharedCIOServersTable = "sharedCIOServersTable",
  privateCloudTable = "privateCloudTable",
  publicCloudTable = "publicCloudTable",
  appDependencyMigrationTable = "appDependencyMigrationTable",
  thirdPartyMigrationTable = "thirdPartyMigrationTable"}
@Component({
  selector: 'app-popupform',
  templateUrl: './popupform.component.html',
  styleUrls: ['./popupform.component.scss']})
export class PopupFormComponent implements OnInit {
  tableheight: string;
  selectAll: boolean = false;
  someThingSelected: boolean = false;
  mgItem: any = {};
  isLoading: Boolean = false;
  pageSize: number = 50000;
  currentPage: number = 0;
  totalItems: number;
  searched: Boolean = false;
  showPopup: Boolean = false;
  showPublicPopup: Boolean = false;
  showAppDepPopup: boolean = false;
  popupConfirmation: boolean = false;
  popupSelectedDateLabel: string = "";
  popupSelectedTempDateLabel: string = "";
  popupSelectedCategory: string = "";
  popupSelectedTempCategory: string = "";
  showalert: boolean = false;
  showValidation: boolean = false;
  inputValidationMessage: string = "Please select the platform type for the selected date";
  currentEditingTable: Tables;
  showConfirmationAlert: boolean = false;
  selectedReportType: string = "";
  downloadPanel: boolean = false;
  platformTypeFields = ['Private-PaaS','Public-IaaS','Public-PaaS', 'Private-IaaS','Traditional-Compute','Third-Party-Hosted-Services'];
  componentDescriptions = COMPONENT_DESCRIPTIONS;
  popupDates = {
    "targetPlatform":"",
    "targetDate":"",
    "platformType": "",
    "confirmed": "",
    "comments": ""};
  popupPublicData = {
    // "publicCloudKey": "",
    "componentName": "",
    "environment": "",
    "platformType": "",
    "resourceGroup": "",
    "location": "",
    "connectivityMoveRequired": "",
    "confirmed": "",
    "targetDate":"",
    "comments": ""}
  popupAppDepData = {
    "parentAppId": "",
    "parentAppName": "",
    "parentCio": "",
    "childAppId": "",
    "childAppName": "",
    "childCio": "",
    "relationshipType": "",
    "impact": "",
    "serviceGroup": "",
    "comments": ""}
  platformTypeCategory = {
    dedicatedServersTable: "Application Dedicated Servers",
    sharedPlatformServersTable: "Shared Platform workloads",
    sharedCIOServersTable: "Shared CIO Workloads",
    privateCloudTable: "Private Cloud",
    publicCloudTable: "Public Cloud",
    appDependencyMigrationTable: "App Dependencies",
    thirdPartyMigrationTable: "Third Party Apps"}
  inlineEditItems: any[] = [];
  dedicatedServersData: any[] = [];
  sharedPlatformServersData: any[] = [];
  sharedCIOServersData: any[] = [];
  appDependencyMigrationData: any[] = [];
  thirdPartyMigrationData: any[] = [];
  isCollapsedObj = {    "dedicatedServersTable": true, "sharedPlatformServersTable": true,
    "sharedCIOServersTable": true, "privateCloudTable": true,
    "publicCloudTable": true, "appDependencyMigrationTable": true,
    "thirdPartyMigrationTable": true};
  isLoadingObj = {    "dedicatedServersTable": false, "sharedPlatformServersTable": false,
    "sharedCIOServersTable": false, "privateCloudTable": false,
    "publicCloudTable": false, "appDependencyMigrationTable": false,
    "thirdPartyMigrationTable": true};
  isLoadingSaveObj = {"dedicatedServersTable": false, "sharedPlatformServersTable": false,
    "sharedCIOServersTable": false, "privateCloudTable": false,
    "publicCloudTable": false, "appDependencyMigrationTable": false,
    "thirdPartyMigrationTable": false};
  pageNationObj = {   "dedicatedServersTable": { totalItems: 0, pageSize: 50000, currentPage: 0 },
    "sharedPlatformServersTable": { totalItems: 0, pageSize: 50000, currentPage: 0 },
    "sharedCIOServersTable": { totalItems: 0, pageSize: 50000, currentPage: 0 },
    "privateCloudTable": { totalItems: 0, pageSize: 50000, currentPage: 0 },
    "publicCloudTable": { totalItems: 0, pageSize: 50000, currentPage: 0 },
    "appDependencyMigrationTable": { totalItems: 0, pageSize: 50000, currentPage: 0 },
    "thirdPartyMigrationTable": { totalItems: 0, pageSize: 50000, currentPage: 0 }};
  privateCloudData: any[] = [];
  publicCloudData: any[] = [];
  private selectedRowData: any[];
  isDownloading: boolean = false;
  targetPlatformOptions = POPUP_PLATFORM_VALUES
  constructor(public dialogRef: MatDialogRef<PopupFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private mpServiceService: MpServiceService, private userService: UserService) {}
  clearDDFilters(obj: any) {
    obj.forEach((i: any) => {
      i['selectedOption'] = [];});}
  clearFilter(ddItem: any) {
    ddItem['selectedOption'] = [];}
  selectionChanged(ddItem: any, event: MatSelectChange) {
    event.value.forEach((value: string) => {
      if (!ddItem['selectedOption'].includes(value)) {
        ddItem['selectedOption'].unshift(value); } });}
  toDate($ev){return new Date($ev);}
  selectionChangedpdd(ddItem: any, event: MatSelectChange) { ddItem['selectedOption'] = event.value;
    this.popupDates['platformType'] = event.value;}
  isSelected(selectedOption: any, option: string) {  return selectedOption.includes(option)}
  compareItems(item1: string, item2: string): boolean { return item1 === item2;}
  filterOptions(ddItem: any, event: KeyboardEvent) {
    if (!event) return;
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value && inputElement.value != "") {
      let elementsAtFront = ddItem['options'].filter((obj: any) => (obj['label'].toUpperCase().includes(inputElement.value.toUpperCase()) && !ddItem['selectedOption'].includes(obj['label'])) ? obj['label'] : null);
      let selectedItems = ddItem['options'].filter((obj: any) => ddItem['selectedOption'].includes(obj['value']) ? obj : null);
      ddItem['filteredOptions'] = elementsAtFront.concat(selectedItems);
    } else {  ddItem['filteredOptions'] = [];}}
  getPopupDatesKeys() { return Object.keys(this.popupDates);}
  closePopup() {
    this.showPopup = false;
    Object.keys(this.popupDates).forEach((key: string) => {
      this.popupDates[key] = ""; })}
  closePublicPopup() {
    this.showPublicPopup = false;
    Object.keys(this.popupPublicData).forEach((key: string) => {
      this.popupPublicData[key] = ""; })}
  closeAppDepPopup() {
    this.showAppDepPopup = false;
    Object.keys(this.popupAppDepData).forEach((key: string) => {
      this.popupAppDepData[key] = ""; })}
  platFormDDValidation(): boolean {
    let out: boolean = false;
    let unselectedInputs = [];
    if(!this.popupDates['targetPlatform']){
      unselectedInputs.push('targetPlatform') }
    if(this.popupDates['targetPlatform'] !== 'No-Plan' && !this.popupDates['targetDate']){
      unselectedInputs.push('targetDate') }
    if((this.platformTypeFields.includes(this.popupDates['targetPlatform'])) && !this.popupDates['platformType']){
      unselectedInputs.push('platformType') }
    if(!this.popupDates['confirmed']){
      unselectedInputs.push('confirmed') }
    // console.log("confirmed", this.popupDates['confirmed']);
    if (unselectedInputs.length === 0) {
      out = true; } else {
      out = false;
      this.inputValidationMessage = "Please select " + unselectedInputs.join(', ') + " field/s."; }
    return out;}
  getDatabyTablename(tablename: Tables) {
    switch (tablename) {
      case Tables.dedicatedServersTable:
        return this.dedicatedServersData;
      case Tables.sharedPlatformServersTable:
        return this.sharedPlatformServersData;
      case Tables.sharedCIOServersTable:
        return this.sharedCIOServersData;
      case Tables.privateCloudTable:
        return this.privateCloudData;
      case Tables.publicCloudTable:
        return this.publicCloudData;
      case Tables.appDependencyMigrationTable:
        return this.appDependencyMigrationData;
      case Tables.thirdPartyMigrationTable:
        return this.thirdPartyMigrationData;
      default:
        return [];   } }
  saveAppDepData() {
    if (!this.popupAppDepData['serviceGroup']) {
      this.inputValidationMessage = "Select the service Group";
      this.showValidation = true;
      return;   } else if (!this.popupAppDepData['confirmed']) {
      this.inputValidationMessage = "Select the confirmed status";
      this.showValidation = true;
      return;  } else {
      this.showValidation = false; }
    let savedDevicelist = [];
    this.selectedRowData.forEach((device: any) => {
      let tempDevice = { ...device };
      let changed = false;
      Object.keys(this.popupAppDepData).forEach((key: string) => {
        if (['serviceGroup', 'confirmed', 'comments'].includes(key) && this.popupAppDepData[key]) {
          tempDevice[key] = this.popupAppDepData[key];
          changed = true;     }   });
      if (changed) {
        savedDevicelist.push(tempDevice);   }  });
    this.saveAppDepMigData(savedDevicelist);}
  savePublicData() {
    console.log(this.popupPublicData);
    if (!this.popupPublicData['confirmed']) {
      this.inputValidationMessage = "Select the confirmed status";
      this.showValidation = true;
      return;   } else {
      this.showValidation = false;  }
    let savedDevicelist = [];
    this.selectedRowData.forEach((device: any) => {
      let tempDevice = { ...device };
      let changed = false;
      Object.keys(this.popupPublicData).forEach((key: string) => {
        if (['confirmed', 'comments', 'targetDate'].includes(key)) {
          tempDevice[key] = this.popupPublicData[key];
          changed = true;
        } else if (['connectivityMoveRequired'].includes(key)) {
          tempDevice[key] = this.popupPublicData[key] === 'Yes' ? true : (this.popupPublicData[key] !== "" || this.popupPublicData[key] !== null)? false : null;
          changed = true;      }     });
      if (changed) {
        savedDevicelist.push(tempDevice);     }  });
    this.savePublicCloudData(savedDevicelist); }
  savePopupDates() {
    let inputValidation: boolean = this.platFormDDValidation();
    this.showValidation = !inputValidation;
    if (!inputValidation) {
      return;    }
    let savedDevicelist = [];
    this.selectedRowData.forEach((device: any) => {
      let tempDevice = { ...device };
      let changed = false;
      let dateChanged = false;
      if (tempDevice['platformType'])
        tempDevice['platformType'] = null;
      Object.keys(this.popupDates).forEach((key: string) => {
        if (key === 'platformType') return;
        if(key === 'targetPlatform'){
          tempDevice[key] = this.popupDates[key];
          if(this.platformTypeFields.includes(this.popupDates[key])){
            tempDevice['platformType'] = this.popupDates['platformType'];        }
          changed = true;     } else if(key === 'targetDate'){
          this.targetPlatformOptions.forEach((platform) => {
            if(platform.key === this.popupDates['targetPlatform']){
              tempDevice[platform.dateFieldName] = this.popupDates[key]           } else {
              tempDevice[platform.dateFieldName] = ""          }       })
          changed = true;
          dateChanged = true;        } else if (key === 'comments' || key === 'confirmed') {
          if (this.popupDates[key]) {
            tempDevice[key] = this.popupDates[key];
            changed = true;          }        } else {
          tempDevice[key] = "";       }      });
      if (changed) {        savedDevicelist.push(tempDevice);      }    });
    if (this.currentEditingTable === Tables.privateCloudTable) {
      this.savePrivateCloudData(savedDevicelist);
    } else if (this.currentEditingTable === Tables.thirdPartyMigrationTable) {
      this.saveThirdPartyData(savedDevicelist);
    }else if ([Tables.dedicatedServersTable, Tables.sharedPlatformServersTable, Tables.sharedCIOServersTable].includes(this.currentEditingTable)) {
      this.saveDeviceData(savedDevicelist, this.currentEditingTable);   }  }
  successSavePopupDates(tablename: Tables) {
    let tempData = this.getDatabyTablename(tablename);
    this.selectedRowData.forEach((rowData: any) => {
      tempData.forEach((device: any) => {
        if ((device['dcmHostId'] && device['dcmHostId'] === rowData['dcmHostId'])
            || (device['privateCloudKey'] && device['privateCloudKey'] === rowData['privateCloudKey'])
            || (device['key'] && device['key'] === rowData['key'])) {
          this.targetPlatformOptions.forEach((platform) => {
            if(platform.key === this.popupDates['targetPlatform']){
              device[platform.dateFieldName] = this.popupDates['targetDate']
            } else {    device[platform.dateFieldName] = ""           }         })
          if(this.platformTypeFields.includes(this.popupDates['targetPlatform'])){
            device['platformType'] = this.popupDates['platformType'] ? this.popupDates['platformType'] : device['platformType'];
          } else {            device['platformType'] = '';          }
          device['targetPlatform'] = this.popupDates['targetPlatform'] ? this.popupDates['targetPlatform'] : device['targetPlatform'];
          device['comments'] = this.popupDates['comments'] ? this.popupDates['comments'] : device['comments'];
          device['confirmed'] = this.popupDates['confirmed'] ? this.popupDates['confirmed'] : device['confirmed'];        }     })   });
    Object.keys(this.popupDates).forEach((key: string) => {
      this.popupDates[key] = "";    })
    this.showPopup = false;
    this.updateDeviceData(tablename, tempData);  }
  updateDeviceData(tableName: Tables, updatedData: any) {
    switch (tableName) {
      case Tables.dedicatedServersTable:
        this.dedicatedServersData = [...updatedData]
        break;
      case Tables.sharedPlatformServersTable:
        this.sharedPlatformServersData = [...updatedData];
        break;
      case Tables.sharedCIOServersTable:
        this.sharedCIOServersData = [...updatedData]
        break;
      case Tables.privateCloudTable:
        this.privateCloudData = [...updatedData]
        break;
      case Tables.publicCloudTable:
        this.publicCloudData = [...updatedData]
        break;
      case Tables.appDependencyMigrationTable:
        this.appDependencyMigrationData = [...updatedData]
        break;
      case Tables.thirdPartyMigrationTable:
        this.thirdPartyMigrationData = [...updatedData]
        break;    }  }
  successSavePublicCloud() {
    let tempData = this.getDatabyTablename(Tables.publicCloudTable);
    this.selectedRowData.forEach((rowData: any) => {
      tempData.forEach((device: any) => {
        if (device['publicCloudKey'] && device['publicCloudKey'] === rowData['publicCloudKey']) {
          Object.keys(this.popupPublicData).forEach((key: string) => {
            if (['confirmed', 'comments', 'targetDate'].includes(key)) {
              device[key] = this.popupPublicData[key];
            } else if (['connectivityMoveRequired'].includes(key)) {
              device[key] = this.popupPublicData[key] === 'Yes' ? 'Yes' : (this.popupPublicData[key] !== "" || this.popupPublicData[key] !== null)? 'No' : '';           }         });       }      });    })
    Object.keys(this.popupPublicData).forEach((key: string) => {
      this.popupPublicData[key] = "";   })
    this.showPublicPopup = false;
    this.updateDeviceData(Tables.publicCloudTable, tempData);  }
  successSaveAppDep() {
    let tempData = this.getDatabyTablename(Tables.appDependencyMigrationTable);
    this.selectedRowData.forEach((rowData: any) => {
      tempData.forEach((device: any) => {
        if (device['relationshipKey'] && device['relationshipKey'] === rowData['relationshipKey']) {
          Object.keys(this.popupAppDepData).forEach((key: string) => {
            if (['serviceGroup', 'confirmed', 'comments'].includes(key) && this.popupAppDepData[key])
              device[key] = this.popupAppDepData[key];         });        }      });   })
    Object.keys(this.popupAppDepData).forEach((key: string) => {
      this.popupAppDepData[key] = "";    })
    this.showAppDepPopup = false;
    this.updateDeviceData(Tables.appDependencyMigrationTable, tempData); }
  onPageChange(event: { pageEvent: PageEvent, table: string }) {
    this.currentPage = event.pageEvent.pageIndex;
    this.pageSize = event.pageEvent.pageSize;
    // this.getDeviceDataByFilter(false);
    switch (event.table) {
      case Tables.dedicatedServersTable:
        this.pageNationObj[Tables.dedicatedServersTable].currentPage = this.currentPage;
        this.pageNationObj[Tables.dedicatedServersTable].pageSize = this.pageSize;
        this.getDeviceDataByFilter(false, HostClasification.Dedicated);
        break;
      case Tables.sharedPlatformServersTable:
        this.pageNationObj[Tables.sharedPlatformServersTable].currentPage = this.currentPage;
        this.pageNationObj[Tables.sharedPlatformServersTable].pageSize = this.pageSize;
        this.getDeviceDataByFilter(false, HostClasification.PlatformShared);
        break;
      case Tables.sharedCIOServersTable:
        this.pageNationObj[Tables.sharedCIOServersTable].currentPage = this.currentPage;
        this.pageNationObj[Tables.sharedCIOServersTable].pageSize = this.pageSize;
        this.getDeviceDataByFilter(false, HostClasification.CIOShared);
        break;
      case Tables.privateCloudTable:
        this.pageNationObj[Tables.privateCloudTable].currentPage = this.currentPage;
        this.pageNationObj[Tables.privateCloudTable].pageSize = this.pageSize;
        this.getPrivateCloudDataByFilter(false);
        break;
      case Tables.publicCloudTable:
        this.pageNationObj[Tables.publicCloudTable].currentPage = this.currentPage;
        this.pageNationObj[Tables.publicCloudTable].pageSize = this.pageSize;
        this.getPublicCloudDataByFilter(false);
        break;
      case Tables.appDependencyMigrationTable:
        this.pageNationObj[Tables.appDependencyMigrationTable].currentPage = this.currentPage;
        this.pageNationObj[Tables.appDependencyMigrationTable].pageSize = this.pageSize;
        this.getAppDependencyDataByFilter(false);
        break;
      default:
        break;   }  }
  editInPopup(data: any, tableName: string) {
    switch (tableName) {
      case Tables.dedicatedServersTable:
      case Tables.sharedCIOServersTable:
      case Tables.sharedPlatformServersTable:
      case Tables.privateCloudTable:
      case Tables.thirdPartyMigrationTable:
        this.editSelected({ data: [data], table: tableName });
        break;
      case Tables.publicCloudTable:
        this.editPublicSelected({ data: [data] })
        break;
      case Tables.appDependencyMigrationTable:
        this.editAppDepSelected({ data: [data] })    }  }
  editSelected(event: any, classification?: string) {
    this.currentEditingTable = event['table'];
    this.data.platformDropdown.forEach((ddItem: string) => {
      ddItem['selectedOption'] = "";    });
    this.showValidation = false;
    this.selectedRowData = event.data;
    if (this.selectedRowData.length === 1) {
      if(this.selectedRowData[0]['targetPlatform'].split(';').length === 1){
        this.popupDates['targetPlatform'] = this.selectedRowData[0]['targetPlatform'];
        this.popupDates['targetDate'] = this.selectedRowData[0][this.targetPlatformOptions.find((val) => val.key === this.selectedRowData[0]['targetPlatform']).dateFieldName];
        this.popupDates['platformType'] = this.selectedRowData[0]['platformType'];      }
      this.popupDates['comments'] = this.selectedRowData[0]['comments'];
      this.popupDates['confirmed'] = this.selectedRowData[0]['confirmed'];    }
    this.showPopup = true;  }
  editPublicSelected(event: any) {
    this.popupConfirmation = false;
    this.showValidation = false;
    this.selectedRowData = event.data;
    if (this.selectedRowData.length === 1) {
      Object.keys(this.popupPublicData).forEach((key: string) => {
        this.popupPublicData[key] = this.selectedRowData[0][key];     })    }
    this.showPublicPopup = true; }
  editAppDepSelected(event: any) {
    this.popupConfirmation = false;
    this.showValidation = false;
    this.selectedRowData = event.data;
    if (this.selectedRowData.length === 1) {
      Object.keys(this.popupAppDepData).forEach((key: string) => {
        this.popupAppDepData[key] = this.selectedRowData[0][key];      })    }
    this.showAppDepPopup = true; }
  getSearchandFilters() {
    let filter = {};
    filter['appId'] = [this.data.mgItem.appId];
    if (Array.isArray(this.data.deviceDropDown)) {
      for (let i of this.data.deviceDropDown) {
        if (i['selectedOption'] && i['selectedOption'].length > 0 && i['selectedOption'][0]) {
          filter[i['categoryID']] = i['selectedOption'];        }      }    }
    return filter;  }
  getDeviceDataByFilter(resetpage: boolean, hostClassification: string) {
    let table: string = "";
    switch (hostClassification) {
      case HostClasification.Dedicated:
        table = Tables.dedicatedServersTable;
        break;
      case HostClasification.PlatformShared:
        table = Tables.sharedPlatformServersTable;
        break;
      case HostClasification.CIOShared:
        table = Tables.sharedCIOServersTable;
        break;
      default:
        break;    }
    let filter = this.getSearchandFilters();
    let pageSize = this.pageNationObj[table].pageSize;
    let currentPage = this.pageNationObj[table].currentPage;
    filter["hostClassification"] = [hostClassification];
    if (resetpage) {
      this.pageNationObj[table].currentPage = 0;    }
    this.getDeviceData(pageSize, currentPage, hostClassification, filter);  }
  getPrivateCloudDataByFilter(resetpage: boolean) {
    if (resetpage) {
      this.pageNationObj[Tables.privateCloudTable].currentPage = 0;   }
    let filter = this.getSearchandFilters();
    this.getPrivateCloudData(this.pageNationObj[Tables.privateCloudTable].pageSize, this.pageNationObj[Tables.privateCloudTable].currentPage, filter);  }
  getPublicCloudDataByFilter(resetpage: boolean) {
    if (resetpage) {
      this.pageNationObj[Tables.publicCloudTable].currentPage = 0;    }
    let filter = this.getSearchandFilters();
    this.getPublicCloudData(this.pageNationObj[Tables.publicCloudTable].pageSize, this.pageNationObj[Tables.publicCloudTable].currentPage, filter);  }
  getAppDependencyDataByFilter(resetpage: boolean) {
    if (resetpage) {
      this.pageNationObj[Tables.appDependencyMigrationTable].currentPage = 0;    }
    let filter = this.getSearchandFilters();
    this.getAppDependencyData(this.pageNationObj[Tables.appDependencyMigrationTable].pageSize, this.pageNationObj[Tables.appDependencyMigrationTable].currentPage, filter);  }
  getThirdPartyDataByFilter(resetpage: boolean) {
    if (resetpage) {
      this.pageNationObj[Tables.thirdPartyMigrationTable].currentPage = 0;    }
    let filter = this.getSearchandFilters();
    this.getThirdPartyData(this.pageNationObj[Tables.thirdPartyMigrationTable].pageSize, this.pageNationObj[Tables.thirdPartyMigrationTable].currentPage, filter);  }
  getAppDependencyData(pageSize: number, currentPage: number, filter: {}): void {
    // this.isLoading = true;
    this.isLoadingObj[Tables.appDependencyMigrationTable] = true;
    this.mpServiceService.getAppDependencyMigrationData(pageSize, currentPage, filter)
      .then((res: any) => {
        if (res.rowCount === 0) {
          this.appDependencyMigrationData = [];
          return;        }
        this.pageNationObj[Tables.appDependencyMigrationTable].totalItems = res.rowCount;
        this.appDependencyMigrationData = res.data.map((d: any, index: number) => ({
          ...d,
          index: index,        }))      })
      .catch(err => console.error("error while getting App Dependency Data", err))
      .finally(() => { this.isLoadingObj[Tables.appDependencyMigrationTable] = false; this.searched = true; })  }
  getThirdPartyData(pageSize: number, currentPage: number, filter: {}): void {
    this.isLoadingObj[Tables.thirdPartyMigrationTable] = true;
    this.mpServiceService.getThirdPartyMigrationData(pageSize, currentPage, filter)
      .then((res: any) => {
        if (res.rowCount === 0 && !res.data) {
          this.thirdPartyMigrationData = [];
          return;        }
        this.pageNationObj[Tables.thirdPartyMigrationTable].totalItems = res.rowCount;
        this.thirdPartyMigrationData = res.data.map((d: any, index: number) => ({
          ...d,
          index: index,        }))      })
      .catch(err => console.error("error while getting Third Party Data", err))
      .finally(() => { this.isLoadingObj[Tables.thirdPartyMigrationTable] = false; this.searched = true; })  }
  getPublicCloudData(pageSize: number, currentPage: number, filter: {}): void {
    // this.isLoading = true;
    this.isLoadingObj[Tables.publicCloudTable] = true;
    this.mpServiceService.getPublicCCMigrationPlanData(pageSize, currentPage, filter)
      .then((res: any) => {
        if (res.rowCount === 0) {
          this.publicCloudData = [];
          return;        }
        this.pageNationObj[Tables.publicCloudTable].totalItems = res.rowCount;
        this.publicCloudData = res.data.map((d: any, index: number) => ({
          ...d,
          index: index,        }))      })
      .catch(err => console.error("error while getting Public Cloud Data", err))
      .finally(() => { this.isLoadingObj[Tables.publicCloudTable] = false; this.searched = true; })  }
  getPrivateCloudData(pageSize: number, currentPage: number, filter: {}): void {
    // this.isLoading = true;
    this.isLoadingObj[Tables.privateCloudTable] = true;
    this.mpServiceService.getPrivateCCMigrationPlanData(pageSize, currentPage, filter)
      .then((res: any) => {
        if (res.rowCount === 0) {
          this.privateCloudData = [];
          return;       }
        this.pageNationObj[Tables.privateCloudTable].totalItems = res.rowCount;
        this.privateCloudData = res.data.map((d: any, index: number) => ({
          ...d,
          index: index,
          privateIaasMgrDate: d.privateIaasMgrDate ? new Date(d.privateIaasMgrDate).toISOString().slice(0, 10) : null,
          privatePaasMgrDate: d.privatePaasMgrDate ? new Date(d.privatePaasMgrDate).toISOString().slice(0, 10) : null,
          publicCldPassMgrDate: d.publicCldPassMgrDate ? new Date(d.publicCldPassMgrDate).toISOString().slice(0, 10) : null,
          publicCldIaasMgrDate: d.publicCldIaasMgrDate ? new Date(d.publicCldIaasMgrDate).toISOString().slice(0, 10) : null,
          publicCldSaasMgrDate: d.publicCldSaasMgrDate ? new Date(d.publicCldSaasMgrDate).toISOString().slice(0, 10) : null,
          retireDate: d.retireDate ? new Date(d.retireDate).toISOString().slice(0, 10) : null,
          physMgrDate: d.physMgrDate ? new Date(d.physMgrDate).toISOString().slice(0, 10) : null,
          mainFrmMgrDate: d.mainFrmMgrDate ? new Date(d.mainFrmMgrDate).toISOString().slice(0, 10) : null,
          thrdprtyHostServMgrDate: d.thrdprtyHostServMgrDate ? new Date(d.thrdprtyHostServMgrDate).toISOString().slice(0, 10) : null        }))      })
      .catch(err => console.error("error while getting Private Cloud Data", err))
      .finally(() => { this.isLoadingObj[Tables.privateCloudTable] = false; this.searched = true; })  }
  onCancel(): void {
    this.data.submitted.isSubmitted = false;
    this.dialogRef.close();  }
  onSubmit(): void {
    this.data.submitted.isSubmitted = true;
    this.dialogRef.close(this.data.mgItem);  }
  ngOnInit(): void {
    if (this.data.deviceDropDown) {
      this.data.deviceDropDown.forEach((i: any) => {
        i['searchText'] = "";
        i['filteredOptions'] = [];
        i['searchControl'] = new FormControl('');
        switch (i['categoryID']) {
          case "environment":
            i['selectedOption'] = [this.data.mgItem.environment];
            break;
          case "datacenter":
            i['selectedOption'] = [this.data.mgItem.dataCenter];
            break;        }      });    }
    this.getAllDeviceData(false);  }
  getAllDeviceData(resetpage: boolean) {
    this.getDeviceDataByFilter(resetpage, HostClasification.Dedicated);
    this.getDeviceDataByFilter(resetpage, HostClasification.PlatformShared);
    this.getDeviceDataByFilter(resetpage, HostClasification.CIOShared);
    this.getPrivateCloudDataByFilter(resetpage);
    this.getPublicCloudDataByFilter(resetpage);
    this.getAppDependencyDataByFilter(resetpage);
    this.getThirdPartyDataByFilter(resetpage)  }
  updateTableHeight() {  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateTableHeight();  }
  isEditingFieldObj() {
    return {
      "dcmHostId": false,
      "deviceName": false,
      "environment": false,
      "datacenter": false,
      "operatingSystem": false,
      "hostType": false,
      "targetPlatform": false,
      "confirmed": false,
      "privateIaasMgrDate": false,
      "privatePaasMgrDate": false,
      "publicCldPassMgrDate": false,
      "publicCldIaasMgrDate": false,
      "publicCldSaasMgrDate": false,
      "retireDate": false,
      "physMgrDate": false,
      "mainFrmMgrDate": false,
      "thrdprtyHostServMgrDate": false,
      "comments": false    }  }
  getDeviceData(pageSize: number, currentPage: number, hostClassification: string, filter: {}): void {
    this.isLoading = true;
    switch (hostClassification) {
      case HostClasification.Dedicated:
        this.isLoadingObj[Tables.dedicatedServersTable] = true;
        break;
      case HostClasification.PlatformShared:
        this.isLoadingObj[Tables.sharedPlatformServersTable] = true;
        break;
      case HostClasification.CIOShared:
        this.isLoadingObj[Tables.sharedCIOServersTable] = true;
        break;
      default:
        break;    }
    this.mpServiceService.getDevicesData(pageSize, currentPage, filter)
      .then((res: any) => {
        let ret: boolean = false;
        switch (hostClassification) {
          case HostClasification.Dedicated:
            if (res["dedicatedRowCount"] === 0) {
              this.dedicatedServersData = [];
              ret = true;            }
            break;
          case HostClasification.PlatformShared:
            if (res["sharedPlatformRowCount"] === 0) {
              this.sharedPlatformServersData = [];
              ret = true;            }
            break;
          case HostClasification.CIOShared:
            if (res["cioSharedRowCount"] === 0) {
              this.sharedCIOServersData = [];
              ret = true;            }
            break;
          default:
            break;        }
        if (ret) {
          return;        }
        this.totalItems = res.rowCount;
        res.data = res.data.map((d: any, index: number) => ({
          ...d,
          editing: false,
          isEditingFields: this.isEditingFieldObj(),
          index: index,
          checkBoxChecked: false,
          privateIaasMgrDate: d.privateIaasMgrDate ? new Date(d.privateIaasMgrDate).toISOString().slice(0, 10) : null,
          privatePaasMgrDate: d.privatePaasMgrDate ? new Date(d.privatePaasMgrDate).toISOString().slice(0, 10) : null,
          publicCldPassMgrDate: d.publicCldPassMgrDate ? new Date(d.publicCldPassMgrDate).toISOString().slice(0, 10) : null,
          publicCldIaasMgrDate: d.publicCldIaasMgrDate ? new Date(d.publicCldIaasMgrDate).toISOString().slice(0, 10) : null,
          publicCldSaasMgrDate: d.publicCldSaasMgrDate ? new Date(d.publicCldSaasMgrDate).toISOString().slice(0, 10) : null,
          retireDate: d.retireDate ? new Date(d.retireDate).toISOString().slice(0, 10) : null,
          physMgrDate: d.physMgrDate ? new Date(d.physMgrDate).toISOString().slice(0, 10) : null,
          mainFrmMgrDate: d.mainFrmMgrDate ? new Date(d.mainFrmMgrDate).toISOString().slice(0, 10) : null,
          thrdprtyHostServMgrDate: d.thrdprtyHostServMgrDate ? new Date(d.thrdprtyHostServMgrDate).toISOString().slice(0, 10) : null        }))
        switch (hostClassification) {
          case HostClasification.Dedicated:
            this.dedicatedServersData = res['data'];
            this.pageNationObj[Tables.dedicatedServersTable].totalItems = res.dedicatedRowCount;
            break;
          case HostClasification.PlatformShared:
            this.sharedPlatformServersData = res['data'];
            this.pageNationObj[Tables.sharedPlatformServersTable].totalItems = res.sharedPlatformRowCount;
            break;
          case HostClasification.CIOShared:
            this.sharedCIOServersData = res['data'];
            this.pageNationObj[Tables.sharedCIOServersTable].totalItems = res.cioSharedRowCount;
            break;
          default:
            break;        }      })
      .catch(err => console.error("error while getting Device Data", err))
      .finally(() => {
        this.isLoading = false;
        switch (hostClassification) {
          case HostClasification.Dedicated:
            this.isLoadingObj[Tables.dedicatedServersTable] = false;
            break;
          case HostClasification.PlatformShared:
            this.isLoadingObj[Tables.sharedPlatformServersTable] = false;
            break;
          case HostClasification.CIOShared:
            this.isLoadingObj[Tables.sharedCIOServersTable] = false;
            break;
          default:
            break;
        }; this.searched = true;      })  }
  buildDeviceSaveReq(deviceList: any, TableName?: Tables) {
    let req = {};
    req['appId'] = this.data.mgItem.appId;
    req['updatedBy'] = this.userService.getUserName();
    let key = (TableName && TableName === Tables.privateCloudTable) ? "privateCloudMigrationList" : "deviceMigrationList";
    req[key] = deviceList.map((device: any) => {
      let out = {};
      if (TableName && TableName === Tables.privateCloudTable) {
        out["privateCloudKey"] = device['privateCloudKey'] ? device['privateCloudKey'] : null;
      }
      out["dcmHostId"] = device['dcmHostId'] ? device['dcmHostId'] : null;
      out["deviceName"] = device['deviceName'] ? device['deviceName'] : null;
      out["environment"] = device['environment'] ? device['environment'] : null;
      out["datacenter"] = device['datacenter'] ? device['datacenter'] : null;
      out["operatingSystem"] = device['operatingSystem'] ? device['operatingSystem'] : null;
      out["hostType"] = device['hostType'] ? device['hostType'] : null;
      out["targetPlatform"] = device['targetPlatform'] ? device['targetPlatform'] : null;
      out["confirmed"] = device['confirmed'] ? device['confirmed'] : null;
      out["privateIaasMgrDate"] = device['privateIaasMgrDate'] ? device['privateIaasMgrDate'] : null;
      out["privatePaasMgrDate"] = device['privatePaasMgrDate'] ? device['privatePaasMgrDate'] : null;
      out["publicCldPassMgrDate"] = device['publicCldPassMgrDate'] ? device['publicCldPassMgrDate'] : null;
      out["publicCldIaasMgrDate"] = device['publicCldIaasMgrDate'] ? device['publicCldIaasMgrDate'] : null;
      out["publicCldSaasMgrDate"] = device['publicCldSaasMgrDate'] ? device['publicCldSaasMgrDate'] : null;
      out["retireDate"] = device['retireDate'] ? device['retireDate'] : null;
      out["physMgrDate"] = device['physMgrDate'] ? device['physMgrDate'] : null;
      out["mainFrmMgrDate"] = device['mainFrmMgrDate'] ? device['mainFrmMgrDate'] : null;
      out["thrdprtyHostServMgrDate"] = device['thrdprtyHostServMgrDate'] ? device['thrdprtyHostServMgrDate'] : null;
      out["comments"] = device['comments'] ? device['comments'] : null;
      out["platformType"] = device['platformType'] ? device['platformType'] : null;
      return out;    });
    return req;  }
  buildAppDepMigSaveReq(deviceList: any) {
    let req = {};
    req['appId'] = this.data.mgItem.appId;
    req['updatedBy'] = this.userService.getUserName();
    req['appDependencyMigrationList'] = deviceList.map((device: any) => ({
      "parentAppId": device['parentAppId'] ? device['parentAppId'] : null,
      "parentAppName": device['parentAppName'] ? device['parentAppName'] : null,
      "parentCio": device['parentCio'] ? device['parentCio'] : null,
      "childAppId": device['childAppId'] ? device['childAppId'] : null,
      "childAppName": device['childAppName'] ? device['childAppName'] : null,
      "childCio": device['childCio'] ? device['childCio'] : null,
      "relationshipType": device['relationshipType'] ? device['relationshipType'] : null,
      "impact": device['impact'] ? device['impact'] : null,
      "relationshipKey": device['relationshipKey'] ? device['relationshipKey'] : null,
      "serviceGroup": device['serviceGroup'] ? device['serviceGroup'] : null,
      "confirmed": device['confirmed'] ? device['confirmed'] : null,
      "comments": device['comments'] ? device['comments'] : null,
      "UpdatedBy": this.userService.getUserName(),
      "updatedOn": new Date().toISOString().slice(0, 10)    }));
    return req;  }
  buildPublicCloudSaveReq(deviceList: any) {
    let req = {};
    req['appId'] = this.data.mgItem.appId;
    req['updatedBy'] = this.userService.getUserName();
    req['publicCloudMigrationList'] = deviceList.map((device: any) => ({
      "publicCloudKey": device['publicCloudKey'] ? device['publicCloudKey'] : null,
      "componentName": device['componentName'] ? device['componentName'] : null,
      "environment": device['environment'] ? device['environment'] : null,
      "platformType": device['platformType'] ? device['platformType'] : null,
      "resourcegroup": device['resourcegroup'] ? device['resourcegroup'] : null,
      "location": device['location'] ? device['location'] : null,
      "connectivityMoveRequired": device['connectivityMoveRequired'],
      "confirmed": device['confirmed'] ? device['confirmed'] : null,
      "targetDate": device['targetDate'] ? device['targetDate'] : null,
      "comments": device['comments'] ? device['comments'] : null    }));
    return req;
  }
  buildThirdPartyDeviceSaveReq(deviceList: any) {
    let req = {};
    req['appId'] = this.data.mgItem.appId;
    req['updatedBy'] = this.userService.getUserName();
    req['thirdPartyApplicationList'] = deviceList.map((device: any) => {
      let out = {};
      out["key"] = device['key'] ? device['key'] : null;
      out["targetPlatform"] = device['targetPlatform'] ? device['targetPlatform'] : null;
      out["confirmed"] = device['confirmed'] ? device['confirmed'] : null;
      out["privateIaasMgrDate"] = device['privateIaasMgrDate'] ? device['privateIaasMgrDate'] : null;
      out["privatePaasMgrDate"] = device['privatePaasMgrDate'] ? device['privatePaasMgrDate'] : null;
      out["publicCldPassMgrDate"] = device['publicCldPassMgrDate'] ? device['publicCldPassMgrDate'] : null;
      out["publicCldIaasMgrDate"] = device['publicCldIaasMgrDate'] ? device['publicCldIaasMgrDate'] : null;
      out["publicCldSaasMgrDate"] = device['publicCldSaasMgrDate'] ? device['publicCldSaasMgrDate'] : null;
      out["retireDate"] = device['retireDate'] ? device['retireDate'] : null;
      out["physMgrDate"] = device['physMgrDate'] ? device['physMgrDate'] : null;
      out["mainFrmMgrDate"] = device['mainFrmMgrDate'] ? device['mainFrmMgrDate'] : null;
      out["thrdprtyHostServMgrDate"] = device['thrdprtyHostServMgrDate'] ? device['thrdprtyHostServMgrDate'] : null;
      out["comments"] = device['comments'] ? device['comments'] : null;
      out["platformType"] = device['platformType'] ? device['platformType'] : null;
      return out;
    });
    return req;
  }
  saveDeviceData(deviceList: any[], tablename: Tables, frominline?: boolean) {
    if (deviceList.length === 0) return;
    this.isLoadingSaveObj[tablename] = true;
    let req = this.buildDeviceSaveReq(deviceList);
    this.mpServiceService.saveDeviceData(req)
      .then(() => { frominline ? null : this.successSavePopupDates(tablename) })
      .catch((err) => { console.log("error while saving device data", err) })
      .finally(() => { this.isLoadingSaveObj[tablename] = false; });
  }
  savePrivateCloudData(deviceList: any[], frominline?: boolean) {
    if (deviceList.length === 0) return;
    let req = this.buildDeviceSaveReq(deviceList, Tables.privateCloudTable);
    this.isLoadingSaveObj[Tables.privateCloudTable] = true;
    this.mpServiceService.savePrivateCloudData(req)
      .then(() => {
        frominline ? null : this.successSavePopupDates(Tables.privateCloudTable);
        console.log("savedsuccessfully private cloud data");
      })
      .catch((err) => { console.log("error while saving private cloud data", err) })
      .finally(() => { this.isLoadingSaveObj[Tables.privateCloudTable] = false; })
  }
  saveThirdPartyData(deviceList: any[], frominline?: boolean) {
    if (deviceList.length === 0) return;
    let req = this.buildThirdPartyDeviceSaveReq(deviceList);
    this.isLoadingSaveObj[Tables.thirdPartyMigrationTable] = true;
    this.mpServiceService.saveThirdPartyData(req)
      .then(() => {
        frominline ? null : this.successSavePopupDates(Tables.thirdPartyMigrationTable);
        console.log("saved successfully third party data");
      })
      .catch((err) => { console.log("error while saving third party data", err) })
      .finally(() => { this.isLoadingSaveObj[Tables.thirdPartyMigrationTable] = false; })
  }
  savePublicCloudData(deviceList: any[], frominline?: boolean) {
    if (deviceList.length === 0) return;
    let req = this.buildPublicCloudSaveReq(deviceList);
    this.isLoadingSaveObj[Tables.publicCloudTable] = true;
    this.mpServiceService.savePublicCloudData(req)
      .then(() => {
        frominline ? null : this.successSavePublicCloud();
        console.log("savedsuccessfully public cloud data");
      })
      .catch((err) => { console.log("error while saving public cloud data", err) })
      .finally(() => { this.isLoadingSaveObj[Tables.publicCloudTable] = false; })
  }
  saveAppDepMigData(deviceList: any[], frominline?: boolean) {
    if (deviceList.length === 0) return;
    this.isLoadingSaveObj[Tables.appDependencyMigrationTable] = true;
    let req = this.buildAppDepMigSaveReq(deviceList);
    this.mpServiceService.saveAppDependencyData(req)
      .then(() => {
        frominline ? null : this.successSaveAppDep();
        console.log("savedsuccessfully app dep data");
      })
      .catch((err) => { console.log("error while saving app dep data", err) })
      .finally(() => { this.isLoadingSaveObj[Tables.appDependencyMigrationTable] = false; })
  }
  isObjEqual(o1: {}, o2: {}) {
    if (o1 === o2) return true;
    const keys1 = Object.keys(o1);
    const keys2 = Object.keys(o2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every(key => o1[key] === o2[key]);
  }
  canceldevice(device: any) {
    this.showalert = false;
    for (let field in device.isEditingFields) {
      device.isEditingFields[field] = false;
    }
    this.inlineEditItems.forEach(i => {
      if (i.index === device.index) {
        Object.keys(i).forEach(key => {
          if (device.hasOwnProperty(key)) {
            device[key] = i[key];
          }
        })
      }
    })
    device.editing = false;
    this.removeFromInlineList(device);
  }
  removeFromInlineList(device: any) {
    this.inlineEditItems = this.inlineEditItems.filter(i => { if (device.index !== i.index) return i })
  }
  exporttoCSV(reportType: string) {
    if (!reportType) return;
    this.downloadPanel = false;
    this.isDownloading = true;
    let filter = this.getSearchandFilters();
    filter['dataExportType'] = [reportType];
    this.mpServiceService.downloadMigrationPlan(filter)
      .then((res: any) => {
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a');
        let timeStamp = new Date().toISOString();
        a.download = `DCEM_MIG_PLAN_${reportType}_${this.userService.getUserName()}_${timeStamp}.xlsx`;
        a.href = window.URL.createObjectURL(blob);
        a.click();
      })
      .catch(err => console.log("error while downloading mp file"))
      .finally(() => {this.isDownloading = false});
  }
  toggelDownloadPanal() {
    this.downloadPanel = !this.downloadPanel;
  }
  toggleCollapse(block: string) {
    this.isCollapsedObj[block] = !this.isCollapsedObj[block];
  }
  serviceGroupChanges(event: MatRadioChange) {
    this.popupAppDepData['serviceGroup'] = event.value;
  }
}
