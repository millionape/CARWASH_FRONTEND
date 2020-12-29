<template>
  <div class="mt-3">
    <card header-classes="bg-transparent mt-3">
      <h3 class="mb-0">Current state : [{{deviceId}}]</h3>
      <b-row class="mt-3">
        <b-col xl="2" class="mt-1">
          <stats-card
            class="h-100"
            title="Current Credit"
            type="gradient-info"
            :sub-title="String(deviceCurrentCredit)"
          >
          </stats-card>
        </b-col>
        <b-col xl="2" class="mt-1">
          <stats-card
            class="h-100"
            title="Current Mode"
            type="gradient-info"
            :sub-title="String(deviceMode)"
          >
          </stats-card>
        </b-col >
        <b-col  xl="2" class="mt-1">
          <stats-card
            class="h-100"
            title="Last Inserted Credit"
            type="gradient-info"
            :sub-title="String(deviceLastInsertCredit)"
          >
          </stats-card>
        </b-col>
        <b-col cols="12" xl="3" class="mt-1">
          <stats-card
            class="h-100"
            title="Last Inserted Date"
            type="gradient-info"
            :sub-title="deviceLastInsertDate"
          >
          </stats-card>
        </b-col>
        <b-col cols="12" xl="3" class="mt-1">
          <stats-card
            class="h-100"
            title="Last Update"
            type="gradient-info"
            :sub-title="deviceUpdatedDate"
          >
          </stats-card>
        </b-col>
      </b-row>
    </card>
    <br />
    <card header-classes="bg-transparent">
      <h3 slot="header" class="mb-0">Event List</h3>
      <b-form-group label="Event data filters" v-slot="{ ariaDescribedby }">
      <b-form-radio-group
        id="radio-group-2"
        @change="onFilterChanged"
        v-model="filterSelected"
        :aria-describedby="ariaDescribedby"
        name="radio-sub-component"
      >
        <b-form-radio value="USER">Show only user event</b-form-radio>
        <b-form-radio value="INSERTED">Show only money inserted event</b-form-radio>
        <b-form-radio value="MODE">Show only mode changed event</b-form-radio>
        <b-form-radio value="ALL">Show all event</b-form-radio>
      </b-form-radio-group>
      <br/>
    </b-form-group>
      <vue-good-table
        :columns="columns"
        :rows="rows"
        :pagination-options="{
          enabled: true,
          mode: 'pages',
          perPage: 10,
          perPageDropdown: [50, 100, 300, 1000],
        }"
      />
      <br/>
      <b-row>
        <b-col cols="3"></b-col>
        <b-col cols="6">
          <vue-json-to-csv :json-data="rows"
            :csv-title="csvTitle"
            >
            <button class="buttonStyle1 w-100">
              <b-button class="w-100" variant="primary">Export data</b-button>
            </button>
          </vue-json-to-csv>
        </b-col>
        <b-col cols="3"></b-col>
      </b-row>
    </card>
  </div>
</template>
<script>
import Vue from "vue";
import axios from "axios";
import moment from "moment";
import { SERVER_PARAMS } from "../environment/environment";
import VueJsonToCsv from 'vue-json-to-csv'

export default {
  name: "icons",
  props: {
    deviceId: String,
  },
  components:{
    VueJsonToCsv
  },
  data() {
    return {
      csvTitle: 'Exported event data of device ['+this.deviceId+']',
      history: [],
      filterSelected: "USER",
      deviceMode: null,
      deviceCurrentCredit: null,
      deviceLastInsertCredit: null,
      deviceLastInsertDate: null,
      deviceUpdatedDate: null,
      deviceList: [],
      polling: null,
      SERVER_URL: SERVER_PARAMS.URL,
      columns: [
        {
          label: "Updated Date",
          field: "updatedDate",
        },
        {
          label: "Device Id",
          field: "deviceId",
        },
        {
          label: "Mode",
          field: "onMode",
        },
        {
          label: "Credit",
          field: "currentCredit",
        },
        {
          label: "Inserted Credit",
          field: "insertedCredit",
        },
      ],
      rows: [],
    };
  },
  methods: {
    onFilterChanged(event){
      console.log("EVENT---> ",event)
      if(event === "ALL"){
        this.rows = this.history;
      }else if(event === "USER"){
        this.rows = this.history.filter(historyEvent => ( historyEvent.insertedCredit !== null || historyEvent.onMode !== ""))
      }else if(event === "INSERTED"){
        this.rows = this.history.filter(historyEvent => ( historyEvent.insertedCredit !== null ))
      }else if(event === "MODE"){
        this.rows = this.history.filter(historyEvent => ( historyEvent.onMode !== "" ))
      }
    },
  getModeText(mode){
    //console.log("MODE---> ",mode)
    if(mode === null){
      return "";
    }
    mode = Number(mode);
    switch(mode){
      case 3:
        return "High Pressure Water";
      case 4:
        return "Vacuum Cleaner";
      case 5:
        return "Shampoo";
      case 6:
        return "Blower";
      case 7:
        return "Water";
      default:
        return "No mode selected"
    }
  },
    pollData() {
      this.polling = setInterval(() => {
        this.getCurrentStates();
      }, 2000);
    },
    async getCurrentStates() {
      await axios
        .get(`${this.SERVER_URL}/getDeviceCurrentStatus?deviceId=${this.deviceId}`)
        .then((response) => {
          console.log("DEVICES info ", response);
          let data = response.data[0];
          this.deviceMode = this.getModeText(data.onMode);
          console.log("MODE: ",this.deviceMode);
          this.deviceCurrentCredit = data.currentCredit;
          this.deviceLastInsertCredit = data.lastInsertCredit;
          this.deviceLastInsertDate = data.lastInsertDate;
          this.deviceUpdatedDate = data.updatedDate;
        })
        .catch((e) => {
          console.log("ERROR |", e);
        });
    },
    async getHistory(deviceId) {
      let loader = this.$loading.show({
        // Optional parameters
        color: "blue",
        canCancel: true,
      });
      var sdate = moment()
        .subtract(7, "days")
        .format("YYYY-MM-DD HH:mm:ss");
      var edate = moment().format("YYYY-MM-DD HH:mm:ss");
      await axios
        .get(
          `${this.SERVER_URL}/getTransectionByDeviceId?deviceId=${deviceId}&sdate=${sdate}&edate=${edate}&limit=3000`
        )
        .then((response) => {
          console.log("HISTORY lIST ", response);
          let history = response.data.map(x => {
            return {
              currentCredit: x.currentCredit,
              deviceId: x.deviceId,
              insertedCredit: x.insertedCredit,
              onMode: this.getModeText(x.onMode),
              updatedDate: x.updatedDate
            }
          })
          this.history = history;
          if(this.filterSelected === "ALL"){
            this.rows = this.history;
          }else if(this.filterSelected === "USER"){
            this.rows = this.history.filter(historyEvent => ( historyEvent.insertedCredit !== null || historyEvent.onMode !== ""))
          }else if(this.filterSelected === "INSERTED"){
            this.rows = this.history.filter(historyEvent => ( historyEvent.insertedCredit !== null ))
          }else if(this.filterSelected === "MODE"){
            this.rows = this.history.filter(historyEvent => ( historyEvent.onMode !== "" ))
          }
          loader.hide();
        })
        .catch((e) => {
          console.log("ERROR |", e);
          loader.hide();
        });
    },
  },
   beforeDestroy() {
    clearInterval(this.polling);
  },
  
  created() {
    this.getHistory(this.deviceId);
    this.pollData();
  },
};
</script>
<style scoped>
  .buttonStyle1 {
     background-color: Transparent;
    background-repeat:no-repeat;
    border: none;
    cursor:pointer;
    overflow: hidden;
    outline:none;
  }
</style>
